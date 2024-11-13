import { CLEAR_ANONYMOUS_TOKEN, SELECT_PROFILE, SIGN_OUT } from 'shared/account/sessionWorkflow';
import { merge } from 'rxjs';
import { distinctUntilKeyChanged, filter, map, withLatestFrom } from 'rxjs/operators';
import { isObject } from 'shared/util/objects';
import { Sources, StreamHandler } from '../../types/stream';
import { AnonymousUserUserGroup, UserContext } from '../../types/v3/context/user';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { isActionOfType } from '../../util/stream';
import { toEvent, withContext } from '../toEvent';
import { PAGE_CHANGE } from 'shared/analytics/types/v3/action/redux-actions';
import { AccountProfilePersonalisation } from 'shared/page/pageKey';

let oldUserId = 'foo';

// We need to do this because distinctUntilChanged always emits the first item but we
// want it to work across subscriptions (reloads etc)
const distinctUser = ({ userId }: UserContext) => {
	if (userId === oldUserId) {
		return false;
	} else {
		oldUserId = userId;
		return true;
	}
};

export const userProfileStreamHandler: StreamHandler = function userProfileStreamHandler(sources: Sources) {
	const user$ = sources.CONTEXT.pipe(
		map(({ user }) => user),
		filter(isObject),
		distinctUntilKeyChanged('userId')
	);

	const authUser$ = user$.pipe(
		filter(isObject),
		filter(({ userGroup }) => userGroup !== AnonymousUserUserGroup)
	);

	const signOutAction$ = sources.ACTION.pipe(
		isActionOfType(SIGN_OUT),
		map(({ payload: isAutoSignOut }) => isAutoSignOut as boolean)
	);

	const userProfileSelected$ = sources.ACTION.pipe(
		isActionOfType(SELECT_PROFILE),
		toEvent(AnalyticsEventType.USER_PROFILE_SELECTED),
		withContext(sources.CONTEXT),
		filter(profileSelectEvent => profileSelectEvent.context.user.profiles.length > 1)
	);

	const userIdentified$ = user$.pipe(
		filter(distinctUser),
		toEvent(AnalyticsEventType.USER_IDENTIFIED),
		// Wait until we have a valid page
		withContext(sources.CONTEXT, (user, { page, ...ctx }) => ({
			...ctx,
			page: page.id === 'null-page' ? undefined : page
		}))
	);

	const userSignInSuccess$ = sources.ACTION.pipe(
		isActionOfType(CLEAR_ANONYMOUS_TOKEN),
		toEvent(AnalyticsEventType.USER_SIGNED_IN),
		withContext(sources.CONTEXT)
	);

	const authUserSignOut$ = signOutAction$.pipe(
		withLatestFrom(authUser$, (auto, user) => ({ auto, user })),
		toEvent(AnalyticsEventType.USER_SIGN_OUT, ({ auto }) => ({ auto })),
		withContext(sources.CONTEXT, ({ user }, ctx) => ({ ...ctx, user }))
	);

	const personalisationGenrePreferencesPage$ = sources.ACTION.pipe(
		isActionOfType(PAGE_CHANGE),
		filter(({ meta }) => meta.key === AccountProfilePersonalisation),
		toEvent(AnalyticsEventType.USER_PROFILE_PERSONALISATION_PREFERENCES_GENRES),
		withContext(sources.CONTEXT)
	);

	return {
		EVENT: merge(
			userSignInSuccess$,
			userProfileSelected$,
			userIdentified$,
			authUserSignOut$,
			personalisationGenrePreferencesPage$
		)
	};
};
