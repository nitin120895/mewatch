import { merge } from 'rxjs';
import { distinct, distinctUntilKeyChanged, filter, map, partition } from 'rxjs/operators';
import { Sources, StreamHandler } from '../types/stream';
import { DomEventItem, DomEventSourceType, EventName } from '../types/types';
import { RWAReduxAction } from '../types/v3/action';
import {
	SERVICE_ERROR,
	ServiceErrorAction,
	UNCAUGHT_EXCEPTION_ERROR,
	UNCAUGHT_PROMISE_ERROR
} from '../types/v3/action/redux-actions';
import { AnalyticsEventType } from '../types/v3/event/analyticsEvent';
import {
	IExceptionEventDetail,
	IResourceErrorDetail,
	ResourceTrackingEventDetailTypes
} from '../types/v3/event/errorEvents';
import { windowLocation } from '../util/browser';
import { isActionOfType, isEventOfSource, isEventOfType } from '../util/stream';
import { toEvent, withContext } from './toEvent';

const getItemResourceErrorDetail = ({ data: { item, image } }: DomEventItem): IResourceErrorDetail => ({
	path: image.url,
	message: `Resource Error (item): ${item && item.id}`,
	type: ResourceTrackingEventDetailTypes.Image,
	status: '0'
});

const get404ServiceResponseErrorDetail = ({
	payload: { request, error }
}: ServiceErrorAction): IResourceErrorDetail => ({
	path: request.url,
	message: error.message,
	type: ResourceTrackingEventDetailTypes.Unknown,
	status: '404'
});

const getStandardServiceResponseErrorDetail = ({
	payload: { request, response, error }
}: ServiceErrorAction): IExceptionEventDetail => ({
	path: request.url,
	message: error.message,
	status: response.raw.status.toString(),
	data: JSON.stringify(request),
	isFatal: false
});

const getServiceRequestErrorDetail = ({ payload: { request, error } }: ServiceErrorAction): IExceptionEventDetail => ({
	path: request.url,
	message: error.message,
	status: '0',
	data: JSON.stringify(request),
	isFatal: false
});

const getUncaughtErrorDetail = ({ payload: error }: RWAReduxAction<any, Error>): IExceptionEventDetail => ({
	path: windowLocation(),
	message: error.message,
	status: '0',
	data: JSON.stringify(error.stack || error.message),
	isFatal: false
});

export const errorStreamHandler: StreamHandler = function errorStreamHandler(sources: Sources) {
	const serviceError$ = sources.ACTION.pipe(isActionOfType<ServiceErrorAction>(SERVICE_ERROR));

	const [requestError$, responseError$] = partition<ServiceErrorAction>(
		({ payload }) => payload.response === undefined
	)(serviceError$);

	const [clientResponseError$, serverError$] = partition<ServiceErrorAction>(
		({ payload }) => payload.response.raw.status < 500
	)(responseError$);

	// Redirect resource errors
	const [serverResourceError$, nonResourceClientResponseErrors$] = partition<ServiceErrorAction>(
		({ payload }) =>
			payload.response.raw.status === 404 && payload.response.data.message !== 'Cannot find matched files'
	)(clientResponseError$);

	// Don't report Restricted Content PIN Errors
	const clientResponseErrorsFiltered$ = filter<ServiceErrorAction>(
		({ payload }) => !(payload.response.raw.status === 403 && payload.response.data.code === 8012)
	)(nonResourceClientResponseErrors$);

	const itemResourceError$ = sources.DOM_EVENT.pipe(
		isEventOfSource(DomEventSourceType.Item),
		isEventOfType(EventName.ERROR)
	);

	const uncaughtErrors = sources.ACTION.pipe(isActionOfType(UNCAUGHT_EXCEPTION_ERROR, UNCAUGHT_PROMISE_ERROR));

	const resourceErrors$ = merge(
		serverResourceError$.pipe(map(get404ServiceResponseErrorDetail)),
		itemResourceError$.pipe(map(getItemResourceErrorDetail))
	).pipe(
		distinct(({ path }) => path),
		toEvent(AnalyticsEventType.RESOURCE_ERROR, detail => detail),
		withContext(sources.CONTEXT)
	);

	const isServerError = status => status >= 500 && status <= 599 && status !== 520;

	const serverErrors$ = serverError$.pipe(
		filter(({ payload }) => isServerError(payload.response.raw.status)),
		map(getStandardServiceResponseErrorDetail),
		toEvent(AnalyticsEventType.SERVER_ERROR, detail => detail),
		withContext(sources.CONTEXT)
	);

	const unknownError$ = serverError$.pipe(
		filter(({ payload }) => !isServerError(payload.response.raw.status)),
		map(getStandardServiceResponseErrorDetail),
		toEvent(AnalyticsEventType.UNKNOWN_ERROR, detail => detail),
		withContext(sources.CONTEXT)
	);

	const clientError$ = merge(
		// We don't repeat uncaught errors in case we create infinite loop if an error happens
		// in analytics and we don't catch it
		uncaughtErrors.pipe(
			map(getUncaughtErrorDetail),
			distinctUntilKeyChanged('message')
		),
		requestError$.pipe(map(getServiceRequestErrorDetail)),
		clientResponseErrorsFiltered$.pipe(map(getStandardServiceResponseErrorDetail))
	).pipe(
		toEvent(AnalyticsEventType.CLIENT_ERROR, detail => detail),
		withContext(sources.CONTEXT)
	);

	return {
		EVENT: merge(resourceErrors$, serverErrors$, clientError$, unknownError$)
	};
};
