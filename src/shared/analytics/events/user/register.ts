import { REGISTRATION_CANCEL, REGISTRATION_COMPLETE, REGISTRATION_START } from 'shared/account/accountWorkflow';
import { SINGLE_SIGN_ON_ANONYMOUS } from 'shared/service/action/authorization';
import { DomEventSourceType } from 'shared/analytics/types/types';
import { merge } from 'rxjs';
import { filter, map, startWith, withLatestFrom } from 'rxjs/operators';
import { Sources, StreamHandler } from '../../types/stream';
import { AnalyticsEventType } from '../../types/v3/event/analyticsEvent';
import { RegistrationDataAction } from '../../types/v3/event/userEvents';
import { isActionOfType, isEventOfSource } from '../../util/stream';
import { toEvent, withContext } from '../toEvent';

function makeNewslettersData(payload) {
	return (payload && payload.newsletters) || {};
}

function makeDetail(action: RegistrationDataAction, newsletters: string[], trigger: string) {
	return {
		registration: { step: 0, action, trigger },
		newsletters
	};
}

function isNewAccount(payload) {
	if (payload.length > 0) return payload[0].accountCreated && payload[0].accountCreated === true;
	return false;
}

export const userRegisterStreamHandler: StreamHandler = function userRegisterStreamHandler(sources: Sources) {
	const { DOM_EVENT, ACTION, CONTEXT } = sources;
	// UI potential registration trigger
	const trigger$ = DOM_EVENT.pipe(
		isEventOfSource(DomEventSourceType.Trigger),
		map(({ data: { trigger } }) => trigger),
		startWith('_UNKNOWN_')
	);

	// Events
	const userRegisterStart$ = ACTION.pipe(
		isActionOfType(REGISTRATION_START),
		map(({ payload }) => makeNewslettersData(payload)),
		withLatestFrom(trigger$),
		map(([newsletters, trigger]) => makeDetail(RegistrationDataAction.Started, newsletters, trigger)),
		toEvent(AnalyticsEventType.USER_REGISTERING, detail => detail),
		withContext(CONTEXT)
	);

	// Registration via Email
	const userRegisterComplete$ = ACTION.pipe(
		isActionOfType(REGISTRATION_COMPLETE),
		map(({ payload }) => makeNewslettersData(payload)),
		withLatestFrom(trigger$),
		map(([newsletters, trigger]) => makeDetail(RegistrationDataAction.Completed, newsletters, trigger)),
		toEvent(AnalyticsEventType.USER_REGISTERED, detail => detail),
		withContext(CONTEXT)
	);

	const userRegisterCancel$ = ACTION.pipe(
		isActionOfType(REGISTRATION_CANCEL),
		map(({ payload }) => makeNewslettersData(payload)),
		withLatestFrom(trigger$),
		map(([newsletters, trigger]) => makeDetail(RegistrationDataAction.Canceled, newsletters, trigger)),
		toEvent(AnalyticsEventType.USER_REGISTERING, detail => detail),
		withContext(CONTEXT)
	);

	// Registration via Social Login
	const userRegisterSocialLogin$ = ACTION.pipe(
		isActionOfType(SINGLE_SIGN_ON_ANONYMOUS),
		filter(({ payload }) => isNewAccount(payload)),
		toEvent(AnalyticsEventType.USER_REGISTERED),
		withContext(CONTEXT)
	);

	return {
		EVENT: merge(userRegisterStart$, userRegisterComplete$, userRegisterCancel$, userRegisterSocialLogin$)
	};
};
