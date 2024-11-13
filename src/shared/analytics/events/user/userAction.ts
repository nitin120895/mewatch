import { merge } from 'rxjs';
import { StreamHandler } from '../../types/stream';
import { Sources } from '../../types/stream';
import { UserActionDescription } from '../../types/v3/action/index';
import {
	CREATE_PROFILE,
	DELETE_PROFILE_WITH_ID,
	UPDATE_ACCOUNT,
	UPDATE_PROFILE_WITH_ID,
	UpdateAccountAction
} from '../../types/v3/action/redux-actions';
import { AnalyticsEventType } from '../../types/v3/event/analyticsEvent';
import { IUserActionedTrackingEventDetail } from '../../types/v3/event/userEvents';
import { isActionOfType } from '../../util/stream';
import { toEvent, withContext } from '../toEvent';

type UserActionDescriptionMapType = {
	[key: string]: UserActionDescription;
};

const userActionDescriptionMap: UserActionDescriptionMapType = {
	[CREATE_PROFILE]: UserActionDescription.CREATE_PROFILE,
	[DELETE_PROFILE_WITH_ID]: UserActionDescription.DELETE_PROFILE_WITH_ID,
	[UPDATE_PROFILE_WITH_ID]: UserActionDescription.UPDATE_PROFILE_WITH_ID
};

const getActionDescription = <T extends keyof UserActionDescriptionMapType>(
	actionType: T
): UserActionDescriptionMapType[T] => {
	return userActionDescriptionMap[actionType];
};

const getActionedUpdateDetail = ({
	meta: { info: infoValue }
}: UpdateAccountAction): IUserActionedTrackingEventDetail => {
	const value = infoValue && infoValue.minRatingPlaybackGuard;
	return {
		action: value ? UserActionDescription.PARENTAL_LOCK_CHANGED : UserActionDescription.PARENTAL_LOCK_DISABLED,
		value
	};
};

export const userActionStreamHandler: StreamHandler = function userActionStreamHandler(sources: Sources) {
	const userActioned$ = sources.ACTION.pipe(
		isActionOfType(CREATE_PROFILE, DELETE_PROFILE_WITH_ID, UPDATE_PROFILE_WITH_ID),
		toEvent(AnalyticsEventType.USER_ACTIONED, ({ type }) => ({ action: getActionDescription(type) })),
		withContext(sources.CONTEXT)
	);

	const userActionedUpdateAccount$ = sources.ACTION.pipe(
		isActionOfType<UpdateAccountAction>(UPDATE_ACCOUNT),
		toEvent(AnalyticsEventType.USER_ACTIONED, action => getActionedUpdateDetail(action)),
		withContext(sources.CONTEXT)
	);

	return {
		EVENT: merge(userActioned$, userActionedUpdateAccount$)
	};
};
