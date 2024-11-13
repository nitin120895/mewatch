import { BehaviorSubject, merge, Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { isFalse, isTrue } from '../../util/objects';
import { Sources, StreamHandler } from '../types/stream';
import {
	GET_PAGE,
	PAGE_CHANGE,
	UPDATE_ONLINE_STATUS,
	UpdateOnlineStatusAction
} from '../types/v3/action/redux-actions';
import { AnalyticsEventType } from '../types/v3/event/analyticsEvent';
import { isActionOfType } from '../util/stream';
import { toEvent, withBasicContext } from './toEvent';

// Use a subject outside the handler so we can re-run the handler and keep the state
const AppStarted$ = new BehaviorSubject(false);

export const appEventStreamHandler: StreamHandler = function appEventStreamHandler({ CONTEXT, ACTION }: Sources) {
	const onlineStatus$: Observable<boolean> = ACTION.pipe(
		isActionOfType<UpdateOnlineStatusAction>(UPDATE_ONLINE_STATUS),
		map(({ payload: online }) => online)
	);

	const appStarted$ = AppStarted$.pipe(
		filter(hasStarted => hasStarted === false),
		toEvent(AnalyticsEventType.APP_STARTED),
		withBasicContext(CONTEXT)
	);

	appStarted$.pipe(map(() => true)).subscribe(AppStarted$);

	const appReady$ = ACTION.pipe(
		isActionOfType(PAGE_CHANGE, GET_PAGE),
		take(1),
		toEvent(AnalyticsEventType.APP_READY),
		withBasicContext(CONTEXT)
	);

	const appOnline$ = onlineStatus$.pipe(
		filter(isTrue),
		toEvent(AnalyticsEventType.APP_ONLINE),
		withBasicContext(CONTEXT)
	);

	const appOffline$ = onlineStatus$.pipe(
		filter(isFalse),
		toEvent(AnalyticsEventType.APP_OFFLINE),
		withBasicContext(CONTEXT)
	);

	return {
		EVENT: merge(appStarted$, appReady$, appOnline$, appOffline$)
	};
};
