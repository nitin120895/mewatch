import {
	BookmarkState,
	getBookmark,
	getUserRating,
	isAnonymousProfile,
	UserRatingState
} from 'shared/account/profileUtil';
import { SIGN_OUT } from 'shared/account/sessionWorkflow';
import { ContinueWatching, ContinueWatchingAnonymous } from 'shared/list/listId';
import {
	getEmptyBookmarkList,
	populateNavLists,
	populatePageUserLists,
	updateContinueWatchingList
} from 'shared/list/listWorkflow';
import { UPDATE_PROFILE_WITH_ID } from 'shared/service/action/account';
import {
	deleteAnonymousContinueWatching,
	getWatchedAnonymous,
	GET_WATCHED_ANONYMOUS,
	setItemWatchedStatusAnonymous
} from 'shared/service/action/anonymous';
import {
	ADD_REMINDER,
	BOOKMARK_ITEM,
	BOOKMARK_ITEM_START,
	bookmarkItem as bookmarkItemAction,
	DELETE_ITEM_BOOKMARK,
	DELETE_ITEM_BOOKMARK_START,
	DELETE_REMINDER,
	deleteItemBookmark as deleteItemBookmarkAction,
	deleteItemBookmarks,
	GET_PROFILE,
	GET_REMINDERS,
	RATE_ITEM,
	RATE_ITEM_START,
	rateItem as rateItemAction,
	DELETE_ITEM_BOOKMARKS,
	GET_WATCHED,
	deleteContinueWatching
} from 'shared/service/action/profile';
import { ClosePassiveNotification, ShowPassiveNotification } from 'shared/uiLayer/uiLayerWorkflow';
import { copy, get, omit } from 'shared/util/objects';
import DeviceModel from 'shared/util/platforms/deviceModel';
import { decodeJwt, findToken } from 'shared/util/tokens';
import {
	HeartbeatActions,
	HeartbeatSaveResumePositionAction,
	sendPlaybackHeartbeat
} from 'toggle/responsive/player/kaltura/KalturaHeartbeatUtil';
import { getUndoDeleteContinueWatchingNotification } from 'toggle/responsive/util/continueWatching';
import { isEpisode } from 'toggle/responsive/util/item';
import { sortRemindersByStartDate } from 'toggle/responsive/util/reminderUtil';

export const ANONYMOUS_USER_ID = 'AnonymousUser';

export function toggleBookmark(item: api.ItemSummary, signIn?: boolean): any {
	return (dispatch, getState) => {
		const profile = getState().profile.info;
		const bookmarkState = profile ? getBookmark(item.id).state : BookmarkState.Unbookmarked;

		if (signIn && bookmarkState === BookmarkState.Bookmarked) return;

		switch (bookmarkState) {
			case BookmarkState.Unbookmarked:
				return dispatch(bookmarkItem(item));
			case BookmarkState.Bookmarked:
				return dispatch(unbookmarkItem(item));
		}
	};
}

export function bookmarkItem(item: api.ItemSummary): any {
	return (dispatch, getState) => {
		const itemId = item.id;
		const { app } = getState();
		const options = { segments: app.contentFilters.profileSegments };
		return dispatch(bookmarkItemAction(itemId, options, { itemId, item }))
			.then(() => {
				dispatch(populatePageUserLists());
				dispatch(populateNavLists());
			})
			.catch(error => dispatch(addPendingAction({ type: 'bookmark', args: [item] })));
	};
}

export function unbookmarkItem(item: api.ItemSummary): any {
	return dispatch => {
		const itemId = item.id;
		return dispatch(deleteItemBookmarkAction(itemId, {}, { itemId, item })).then(() => {
			dispatch(populatePageUserLists());
			dispatch(populateNavLists());
		});
	};
}

export function unbookmarkItems(itemIds: string[], sortOptions?: any): any {
	return dispatch => {
		return dispatch(deleteItemBookmarks({ itemIds }, { itemIds })).then(() => {
			dispatch(populatePageUserLists(undefined, sortOptions));
			dispatch(populateNavLists());
		});
	};
}

export function unbookmarkAllItems(itemIds: string[]): any {
	return dispatch => {
		return dispatch(deleteItemBookmarks({ itemIds }, { itemIds })).then(() => dispatch(getEmptyBookmarkList()));
	};
}

export function rateItem(item: api.ItemSummary, rating: number, ratingScale = 1): any {
	return (dispatch, getState) => {
		const itemId = item.id;
		const userRating = getUserRating(itemId);
		if (userRating.state === UserRatingState.Updating || userRating.value === rating) return;

		return dispatch(rateItemAction(itemId, rating, {}, { itemId, value: rating, item, ratingScale })).catch(error =>
			dispatch(addPendingAction({ type: 'rate', args: [item, rating, ratingScale] }))
		);
	};
}

export const ATTEMPT_DELETE_CONTINUE_WATCHING = 'profile/ATTEMPT_DELETE_CONTINUE_WATCHING';
export const UNDO_DELETE_CONTINUE_WATCHING = 'profile/UNDO_DELETE_CONTINUE_WATCHING';
export const UPDATE_CONTINUE_WATCHING_PAGE_STATE = 'profile/UPDATE_CONTINUE_WATCHING_PAGE_STATE';
export function attemptDeleteContinueWatching(items: api.ItemSummary[], railPosition?: number) {
	return (dispatch, getState) => {
		const UNDO_TIMEOUT = 5000;
		const state: state.Root = getState();
		const { account, profile } = state;

		const undoTimeout = window.setTimeout(() => {
			// Force close toast after undo timeout
			dispatch(ClosePassiveNotification());

			const itemIds = items.map(item => (isEpisode(item) ? item.showId : item.id));
			const isAnonymous = isAnonymousProfile(profile);
			const listKey = isAnonymous ? ContinueWatchingAnonymous : ContinueWatching;
			const deleteContinueWatchingAction = isAnonymous ? deleteAnonymousContinueWatching : deleteContinueWatching;

			const options = {
				device: DeviceModel.deviceInfo().type,
				sub: get(account, 'info.subscriptionCode'),
				segments: isAnonymous ? ['all'] : get(profile, 'info.segments')
			};
			return dispatch(
				deleteContinueWatchingAction({ itemIds, ...options }, { itemIds: items.map(item => item.id), listKey })
			).then(res => {
				// Clear delete list
				const state: state.Root = getState();
				const { profile } = state;
				const deleteListData = get(profile, 'continueWatching.deleteList');
				const deleteIds = items.map(item => item.id);

				// remove only clicked item when delete multiple items continuously
				const filteredDeleteList =
					Array.isArray(deleteListData) && deleteListData.filter(item => !deleteIds.includes(item.id));
				dispatch(setContinueWatchingDeleteList(filteredDeleteList));

				// Get updated CW List after deletion
				dispatch(updateContinueWatchingList());
			});
		}, UNDO_TIMEOUT);

		dispatch({ type: ATTEMPT_DELETE_CONTINUE_WATCHING, payload: { deleteList: items, undoTimeout } });

		const onUndoClick = () => {
			window.clearTimeout(undoTimeout);
			dispatch({ type: UNDO_DELETE_CONTINUE_WATCHING, payload: { undoList: items, railPosition } });
			dispatch(ClosePassiveNotification());
		};

		// Show undo notification
		dispatch(ShowPassiveNotification(getUndoDeleteContinueWatchingNotification(onUndoClick)));
	};
}

export function setContinueWatchingDeleteList(deleteList: api.ItemSummary[]) {
	return { type: UPDATE_CONTINUE_WATCHING_PAGE_STATE, payload: { deleteList } };
}

export function setContinueWatchingEditMode(editMode: boolean) {
	return { type: UPDATE_CONTINUE_WATCHING_PAGE_STATE, payload: { editMode } };
}

export function setContinueWatchingEditList(editList: api.ItemSummary[]) {
	return { type: UPDATE_CONTINUE_WATCHING_PAGE_STATE, payload: { editList } };
}

export function clearContinueWatchingPageState() {
	return { type: UPDATE_CONTINUE_WATCHING_PAGE_STATE, payload: { editList: [], editMode: false } };
}

export const SEND_PLAYBACK_HEARTBEAT = 'playback/SEND_PLAYBACK_HEARTBEAT';
export function saveResumePosition(item: api.ItemSummary, position: number, action?: HeartbeatActions): any {
	return (dispatch, getState): HeartbeatSaveResumePositionAction => {
		const state: state.Root = getState();
		if (!state.profile.info || isAnonymousProfile(state.profile)) return;

		const playbackConfig = get(state, 'app.config.playback');
		const token = findToken(state.session.tokens, 'UserProfile', 'Catalog');
		const body = decodeJwt(token);

		sendPlaybackHeartbeat({ item, position, kalturaSession: body.kalturaSession, playbackConfig, action })
			.then(response => response.json())
			.then(payload => {
				return dispatch({ type: SEND_PLAYBACK_HEARTBEAT, payload });
			});
	};
}

export const UPDATE_PLAYER_INFO = 'playback/UPDATE_PLAYER_INFO';
export function updateResumePosition(item: api.ItemSummary, position: number): any {
	return (dispatch, getState) => {
		const state: state.Root = getState();
		if (!state.profile.info) return;

		const watched = { ...state.profile.info.watched };

		// duplicate save resume position logic here because we have latency on BE(Kaltura) up to 1 min
		const duration = get(item, 'duration') || 0;
		if (isFullyWatched(position, duration)) {
			// set 'isFullyWatched: true' when user fully watched the video to avoid bugs like MEDTOG-8386
			watched[item.id] = { ...watched[item.id], position: 0, isFullyWatched: true };
		} else {
			watched[item.id] = { ...watched[item.id], position };
		}

		const info = { ...state.profile.info, watched };

		dispatch({ type: UPDATE_PLAYER_INFO, payload: info });
	};
}

const WATCHED_THRESHOLD_IN_SECOND = 5;
function isFullyWatched(position: number, duration: number): boolean {
	return duration - position < WATCHED_THRESHOLD_IN_SECOND;
}

export function saveAnonymousVideoPosition(itemId: string, position: number): any {
	return async dispatch => {
		await dispatch(setItemWatchedStatusAnonymous(itemId, position));
		// sync new watched info from BE because FE don't have a continue watching rules
		return dispatch(getWatchedAnonymous());
	};
}

// two actions for saving and removing pending actions related to profile, like rate or bookmark
// it might be just only one pending action at the moment
export const ADD_PENDING_ACTION = 'profile/ADD_PENDING_ACTION';
export const REMOVE_PENDING_ACTION = 'profile/REMOVE_PENDING_ACTION';

export function addPendingAction(pendingAction: state.ProfilePendingAction) {
	return { type: ADD_PENDING_ACTION, payload: pendingAction };
}

export function removePendingAction() {
	return { type: REMOVE_PENDING_ACTION };
}

export const GET_PROFILE_ANONYMOUS = 'profile/GET_PROFILE_ANONYMOUS';
export function getProfileAnonymous(): Action<any> {
	const info = {
		id: ANONYMOUS_USER_ID,
		watched: {}
	};
	return { type: GET_PROFILE_ANONYMOUS, payload: info };
}

const REMOVE_ANONYMOUS_PROFILE = 'profile/REMOVE_ANONYMOUS_PROFILE';
export function removeAnonymousProfile() {
	return { type: REMOVE_ANONYMOUS_PROFILE };
}

const initState: state.Profile = {
	info: undefined,
	pendingAction: undefined,
	reminders: [],
	attemptedLoginUserName: undefined,
	continueWatching: undefined
};

export default function reduceProfile(state: state.Profile = initState, action: Action<any>): state.Profile {
	switch (action.type) {
		case GET_WATCHED_ANONYMOUS:
			const normilizedAction = {
				...action,
				payload: {
					watched: action.payload
				}
			};
			return reduceInfo(state, normilizedAction);
		case GET_PROFILE:
		case UPDATE_PLAYER_INFO:
		case GET_PROFILE_ANONYMOUS:
			return reduceInfo(state, action);
		case GET_REMINDERS:
			return reduceReminders(state, action);
		case ADD_REMINDER:
			return reduceAddReminder(state, action);
		case DELETE_REMINDER:
			return reduceDeleteReminder(state, action);
		case RATE_ITEM_START:
			return reduceUpdateStart(state, action, 'savingRating');
		case RATE_ITEM:
			return reduceUpdateEnd(state, action, 'savingRating');
		case BOOKMARK_ITEM_START:
			return reduceUpdateStart(state, action, 'addingBookmark');
		case BOOKMARK_ITEM:
			return reduceUpdateEnd(state, action, 'addingBookmark');
		case DELETE_ITEM_BOOKMARK_START:
			return reduceUpdateStart(state, action, 'removingBookmark');
		case DELETE_ITEM_BOOKMARK:
			return reduceUpdateEnd(state, action, 'removingBookmark');
		case DELETE_ITEM_BOOKMARKS:
			return reduceUpdateEnd(state, action, 'removingBookmarks');
		case SIGN_OUT:
		case REMOVE_ANONYMOUS_PROFILE:
			return copy(initState);
		case UPDATE_PROFILE_WITH_ID:
			return reduceCurrentProfile(state, action);
		case ADD_PENDING_ACTION:
			return reduceAddPendingAction(state, action);
		case REMOVE_PENDING_ACTION:
			return reduceRemovePendingAction(state);
		case GET_WATCHED:
			return reduceProfileWatched(state, action);
		case ATTEMPTED_LOGIN_USER:
			return reduceLoginUserAttempt(state, action);
		case CLEAR_ATTEMPTED_LOGIN:
			return reduceClearLoginAttempt(state);
		case ATTEMPT_DELETE_CONTINUE_WATCHING:
			return reduceDeleteContinueWatchingAttempt(state, action);
		case UNDO_DELETE_CONTINUE_WATCHING:
			return reduceUndoDeleteContinueWatching(state, action);
		case UPDATE_CONTINUE_WATCHING_PAGE_STATE:
			return reduceEditContinueWatching(state, action);
		default:
			return state;
	}
}

function reduceInfo(state: state.Profile, action): state.Profile {
	if (action.error) {
		return state;
	}

	const info = action.payload;
	if (state.info && state.info.id === info.id) {
		info.pendingUpdates = state.info.pendingUpdates.slice();
	} else {
		info.pendingUpdates = [];
	}
	return copy(state, {
		info: {
			...state.info,
			...info
		},
		watchedUpdateTime: Date.now()
	});
}

function reduceReminders(state: state.Profile, action) {
	const reminderOffsetMinutes = get(action, 'meta.info.reminderOffsetMinutes');
	const reminders = sortRemindersByStartDate(action.payload, reminderOffsetMinutes);
	if (!action.error) {
		return {
			...state,
			reminders,
			info: {
				...state.info
			},
			watchedUpdateTime: Date.now()
		};
	}
	return state;
}

function reduceUpdateStart(state: state.Profile, action: Action<any>, type: api.ProfileUpdateType): state.Profile {
	if (!state.info) return { ...state };
	const { itemId, value } = action.meta.info;
	return {
		...state,
		info: {
			...state.info,
			pendingUpdates: [...state.info.pendingUpdates, { itemId, type, value }]
		}
	};
}

function reduceDeleteReminder(state: state.Profile, action: Action<any>): state.Profile {
	if (!state.info) return { ...state };
	const itemId = action.meta.info.itemId;
	return {
		...state,
		reminders: state.reminders.filter(reminder => reminder.id !== itemId)
	};
}

function reduceAddReminder(state: state.Profile, action: Action<any>): state.Profile {
	if (!state.info) return { ...state };
	return {
		...state,
		reminders: [...state.reminders, action.payload]
	};
}

function reduceUpdateEnd(state: state.Profile, action: Action<any>, type: api.ProfileUpdateType): state.Profile {
	if (!state.info) return { ...state };
	const itemId = action.meta.info.itemId;
	return {
		...state,
		info: {
			...state.info,
			pendingUpdates: state.info.pendingUpdates.filter(update => !(update.itemId === itemId && update.type === type)),
			...updateLookupState(state.info, itemId, type, action.payload, action.meta)
		}
	};
}

function reduceCurrentProfile(state: state.Profile, action) {
	const profile = action.meta.info;
	if (state.info.id === profile.id && !action.error) {
		return {
			...state,
			info: {
				...state.info,
				...profile
			},
			watchedUpdateTime: Date.now()
		};
	}
	return state;
}

function reduceProfileWatched(state: state.Profile, action) {
	if (!action.error) {
		return {
			...state,
			info: {
				...state.info,
				watched: {
					...state.info.watched,
					...action.payload
				}
			}
		};
	}
	return state;
}

function updateLookupState(info: api.ProfileDetail, itemId: string, type: api.ProfileUpdateType, value, actionMeta) {
	switch (type) {
		case 'savingRating':
			return {
				rated: {
					...info.rated,
					[itemId]: value.rating
				}
			};
		case 'addingBookmark':
			return {
				bookmarked: {
					...info.bookmarked,
					[itemId]: value.creationDate
				}
			};
		case 'removingBookmarks':
			return {
				bookmarked: omit(info.bookmarked, ...actionMeta.info.itemIds)
			};
		case 'removingBookmark':
			const bookmarked = { bookmarked: { ...info.bookmarked } };
			delete bookmarked.bookmarked[itemId];
			return bookmarked;
		case 'savingResumePositon':
			// don't make any changes, when get undefined value after saving resume point
			// server side returns undefined in cases it doesn't save resume point due to some options
			// we can remove already watched item from watched list in such case
			const watched = value
				? {
						watched: {
							...info.watched,
							[itemId]: value
						}
				  }
				: { ...info.watched };

			return watched;
		default:
			return {};
	}
}

function reduceAddPendingAction(state: state.Profile, action): state.Profile {
	const pendingAction: state.ProfilePendingAction = action.payload;
	return {
		...state,
		pendingAction
	};
}

function reduceRemovePendingAction(state: state.Profile): state.Profile {
	return {
		...state,
		pendingAction: undefined
	};
}

function reduceDeleteContinueWatchingAttempt(state: state.Profile, action: Action<any>) {
	const deleteList = get(state.continueWatching, 'deleteList') || [];

	return {
		...state,
		continueWatching: {
			deleteList: deleteList.concat(action.payload.deleteList)
		}
	};
}

function reduceUndoDeleteContinueWatching(state: state.Profile, action: Action<any>) {
	const deleteList = get(state.continueWatching, 'deleteList') || [];
	const itemsToUndo = action.payload.undoList;
	const itemIds = itemsToUndo && itemsToUndo.map(item => item.id);

	return {
		...state,
		continueWatching: {
			deleteList: deleteList.filter(item => itemIds.indexOf(item.id) === -1)
		}
	};
}

function reduceEditContinueWatching(state: state.Profile, action) {
	const continueWatching = copy(state.continueWatching, { ...action.payload });
	return copy(state, { continueWatching });
}

function reduceLoginUserAttempt(state: state.Profile, action: Action<any>): state.Profile {
	return {
		...state,
		attemptedLoginUserName: action.payload
	};
}
function reduceClearLoginAttempt(state: state.Profile): state.Profile {
	return {
		...state,
		attemptedLoginUserName: undefined
	};
}

export const ATTEMPTED_LOGIN_USER = 's/profile/ATTEMPTED_LOGIN_USER';
export const CLEAR_ATTEMPTED_LOGIN = 's/profile/CLEAR_ATTEMPTED_LOGIN';
export function attemptedLoginUser(payload): any {
	return dispatch => {
		dispatch({
			type: ATTEMPTED_LOGIN_USER,
			payload
		});
	};
}

export function clearAttemptedLogin(): any {
	return dispatch => {
		dispatch({
			type: CLEAR_ATTEMPTED_LOGIN
		});
	};
}
