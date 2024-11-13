import { RWAAction } from './redux-actions';

export type InputAction<T extends RWAAction = RWAAction> = RWAReduxAction<T>;

export interface RWAReduxAction<T extends RWAAction, P = any, M = any> {
	type: T;
	payload: P;
	meta?: M;
}

export enum UserActionDescription {
	CREATE_PROFILE = 'Profile Created',
	DELETE_PROFILE_WITH_ID = 'Profile Deleted',
	UPDATE_PROFILE_WITH_ID = 'Profile Modified',
	PARENTAL_LOCK_DISABLED = 'Parental Lock Disabled',
	PARENTAL_LOCK_CHANGED = 'Parental Lock Changed'
}
