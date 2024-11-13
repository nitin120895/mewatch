import * as Redux from 'redux';
import { setCookie, getCookie, removeCookie } from '../util/cookies';
import { removePendingAction, rateItem, bookmarkItem, ANONYMOUS_USER_ID } from './profileWorkflow';
import { noop } from '../util/function';
import { browserHistory } from 'shared/util/browserHistory';
import { ConfirmationDialogProps } from 'toggle/responsive/component/dialog/ConfirmationDialog';
import { get } from 'shared/util/objects';

export const PROFILE_SELECTED_KEY = 'pslct';
export const SAVE_CHANGES_MODAL_ID = 'save-changes-modal';
const SYSTEM_ERROR_MODAL_ID = 'system-error-modal';
export const PROMISED_BOOKMARK_KEY = 'bookmark';
export const CONFIRM_PAGE_LEAVING_MODAL_ID = 'confirm-page-leaving-modal';

let store: Redux.Store<state.Root>;
export function init(appStore: Redux.Store<state.Root>) {
	store = appStore;
}

function activeProfile(): api.ProfileDetail {
	return store.getState().profile.info;
}

/*
 * Bookmarks
 */

export type Bookmark = {
	state: BookmarkState;
};

export enum BookmarkState {
	Bookmarked,
	Unbookmarked,
	Adding,
	Removing
}

const BOOKMARKINGS = {
	addingBookmark: { state: BookmarkState.Adding },
	removingBookmark: { state: BookmarkState.Removing },
	bookmarked: { state: BookmarkState.Bookmarked },
	unbookmarked: { state: BookmarkState.Unbookmarked }
};

/**
 * Get bookmark state information for a given item and active profile.
 */
export function getBookmark(itemId: string): Bookmark {
	const update = getPendingUpdate(itemId, update => !!BOOKMARKINGS[update.type]);
	if (update) return BOOKMARKINGS[update.type];

	const profile = activeProfile();
	return profile && profile.bookmarked && profile.bookmarked[itemId]
		? BOOKMARKINGS['bookmarked']
		: BOOKMARKINGS['unbookmarked'];
}

/*
 * User Ratings
 */

export type UserRating = {
	state: UserRatingState;
	value?: number;
};

export enum UserRatingState {
	Rated,
	Unrated,
	Updating
}

// Keep a static result set to avoid object churn
const RATING = {
	1: { value: 1, state: UserRatingState.Rated },
	2: { value: 2, state: UserRatingState.Rated },
	3: { value: 3, state: UserRatingState.Rated },
	4: { value: 4, state: UserRatingState.Rated },
	5: { value: 5, state: UserRatingState.Rated },
	6: { value: 6, state: UserRatingState.Rated },
	7: { value: 7, state: UserRatingState.Rated },
	8: { value: 8, state: UserRatingState.Rated },
	9: { value: 9, state: UserRatingState.Rated },
	10: { value: 10, state: UserRatingState.Rated }
};

const NO_RATING = {
	state: UserRatingState.Unrated
};

/**
 * Get user rating state and value information for a given item and active profile.
 */
export function getUserRating(itemId: string): UserRating {
	const profile = activeProfile();

	if (!profile) return NO_RATING;

	const update = getPendingUpdate(itemId, update => update.type === 'savingRating');
	if (update) return { value: update.value, state: UserRatingState.Updating };

	return (profile && RATING[profile.rated[itemId]]) || NO_RATING;
}

/*
 * Watched Status
 */

export type Watched = {
	state: WatchedState;
	value?: api.Watched;
};

export enum WatchedState {
	Watched,
	Unwatched,
	Updating
}

const UNWATCHED = {
	state: WatchedState.Unwatched
};

/**
 * Get watched state and information for a given item and active profile.
 */
export function getWatchedInfo(itemId: string): Watched {
	const profile = activeProfile();
	if (!profile || !profile.watched) return UNWATCHED;

	let info = profile.watched[itemId];
	let state = WatchedState.Watched;
	const update = getPendingUpdate(itemId, update => update.type === 'savingResumePositon');
	if (update) {
		state = WatchedState.Updating;
		if (!info) {
			const now = new Date();
			info = {
				firstWatchedDate: now,
				lastWatchedDate: now,
				position: update.value,
				itemId
			};
		} else {
			info = {
				...info,
				position: update.value
			};
		}
	}

	if (info) {
		// lazy conversion of dates as they're requested.
		if (typeof info.firstWatchedDate === 'string') {
			let iso: any = info.firstWatchedDate;
			info.firstWatchedDate = new Date(iso);
			iso = info.lastWatchedDate;
			info.lastWatchedDate = new Date(iso);
		}
		return { value: info, state };
	} else {
		return UNWATCHED;
	}
}

/**
 * Get the percentage of playback completion for an item.
 */
export function getWatchedPercentage(item: api.ItemSummary): number {
	const position = getResumePosition(item.id);
	if (!item.duration || !position) return 0;
	if (position >= item.duration) return 1;
	return +(position / item.duration).toFixed(2);
}

/**
 * Get the resume position for an item.
 */
export function getResumePosition(itemId: string) {
	if (!activeProfile()) return 0;

	const watchedInfo = getWatchedInfo(itemId);
	if (watchedInfo && watchedInfo.value && watchedInfo.value.position > 0) {
		return watchedInfo.value.position;
	}
	return 0;
}

export function getPendingUpdate(itemId, predicate) {
	const profile = activeProfile();
	if (profile) {
		const updates = profile.pendingUpdates;
		if (updates && updates.length) {
			for (let update of updates) {
				if (update.itemId === itemId && predicate(update)) {
					return update;
				}
			}
		}
	}
	return undefined;
}

export function profileSelected() {
	setCookie(PROFILE_SELECTED_KEY, '1'); // session cookie
	doPendingAction();
}

function doPendingAction() {
	const { dispatch } = store;
	const {
		profile: { pendingAction }
	} = store.getState();
	if (pendingAction) {
		const { type, args } = pendingAction;
		switch (type) {
			case 'rate':
				const [item, rate, scale] = args;
				dispatch(rateItem(item, rate, scale));
				break;
			case 'bookmark':
				dispatch(bookmarkItem(args[0]));
				break;
		}
		dispatch(removePendingAction());
	}
}

export function isProfileSelected(): boolean {
	return !!getCookie(PROFILE_SELECTED_KEY);
}

export function clearProfileSelected() {
	removeCookie(PROFILE_SELECTED_KEY);
}

/**
 * Return TRUE if the video has been watched within 95%
 */
export function isResumeWatching(position: number, duration: number): boolean {
	const percent = duration * 0.05;
	return position < duration - percent;
}

export const labels = {
	standard: '@{account_profile_button_standard|Standard}',
	kids: '@{account_profile_button_kids|Kids}',
	restricted: '@{account_profile_button_restricted|Restricted}'
};

export const helpText = {
	standard: '',
	kids: '@{account_profile_helpText_kids|Kids content up to 12 Years}',
	restricted: '@{account_profile_helpText_restricted|Account PIN is required to access this profile}'
};

export const inputs = {
	textInput: '@{account_profile_input_name|Profile name}',
	accountButtonAddProfile: '@{account_profile_add_button_submit|Create}',
	accountButtonEditProfile: '@{account_profile_edit_button_submit|Save Changes}'
};

export function openSaveAccountChangesModal(onConfirm: () => void, onCancel?: () => void, onClose?: () => void) {
	const props: ConfirmationDialogProps = {
		title: '@{account_profile_edit_button_submit}?',
		children: '@{account_common_save_prompt}',
		confirmLabel: '@{account_common_save_button_label}',
		cancelLabel: '@{account_common_discard_label}',
		onConfirm,
		onCancel,
		onClose,
		closeOnConfirm: true,
		hideCloseIcon: false,
		id: SAVE_CHANGES_MODAL_ID,
		className: SAVE_CHANGES_MODAL_ID
	};

	return props;
}

export function openConfirmPageLeavingModal(onConfirm: () => void) {
	const props: ConfirmationDialogProps = {
		title: '@{account_common_leave_prompt}',
		confirmLabel: '@{account_common_continue_label}',
		cancelLabel: '@{account_common_go_back_label}',
		onConfirm,
		onCancel: noop,
		closeOnConfirm: true,
		hideCloseIcon: false,
		id: CONFIRM_PAGE_LEAVING_MODAL_ID,
		className: CONFIRM_PAGE_LEAVING_MODAL_ID
	};

	return props;
}

export function openSystemErrorModal() {
	const props: ConfirmationDialogProps = {
		title: '@{account_common_error}',
		children: '@{app_error_unknown}',
		confirmLabel: '@{app.ok|OK}',
		onConfirm: noop,
		hideCloseIcon: true,
		id: SYSTEM_ERROR_MODAL_ID
	};

	return props;
}

export function goToAccounts(path: string) {
	browserHistory.push(`${path}`);
}

export function getAccountProfileEditPath(path: string, id: string) {
	return `${path}?id=${id}`;
}

export function goToEditProfileById(path: string, id: string) {
	browserHistory.push(getAccountProfileEditPath(path, id));
}

export function isAnonymousProfile(profile: state.Profile) {
	const profileId = get(profile, 'info.id');
	return isAnonymousProfileId(profileId);
}

export function isAnonymousProfileId(id: string) {
	return id === ANONYMOUS_USER_ID;
}

export function getRegisteredProfileInfo(profile: state.Profile): state.Profile['info'] {
	const info = get(profile, 'info');
	if (isAnonymousProfile(profile) || !info) return;

	return info;
}

export function isPrimaryProfile(profile: state.Profile, account: state.Account) {
	const profileId = get(profile, 'info.id');
	const primaryProfileId = get(account, 'info.primaryProfileId');
	return !isAnonymousProfile(profile) && profileId && primaryProfileId && profileId === primaryProfileId;
}
