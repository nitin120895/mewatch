/// <reference path="../types.ts"/>
/** @module action/profile */
// Auto-generated, edits will be overwritten
import * as profile from '../profile';

export const GET_PROFILE_START = 's/profile/GET_PROFILE_START';
export const GET_PROFILE = 's/profile/GET_PROFILE';
export type GET_PROFILE = api.ProfileDetail;

export function getProfile(options?: profile.GetProfileOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_PROFILE_START, meta: { info } });
		return profile.getProfile(options).then(response =>
			dispatch({
				type: GET_PROFILE,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const GET_BOOKMARKS_START = 's/profile/GET_BOOKMARKS_START';
export const GET_BOOKMARKS = 's/profile/GET_BOOKMARKS';
export type GET_BOOKMARKS = { [key: string]: Date };

export function getBookmarks(options?: profile.GetBookmarksOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_BOOKMARKS_START, meta: { info } });
		return profile.getBookmarks(options).then(response =>
			dispatch({
				type: GET_BOOKMARKS,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const DELETE_ITEM_BOOKMARKS_START = 's/profile/DELETE_ITEM_BOOKMARKS_START';
export const DELETE_ITEM_BOOKMARKS = 's/profile/DELETE_ITEM_BOOKMARKS';
export type DELETE_ITEM_BOOKMARKS = any;

export function deleteItemBookmarks(options?: profile.DeleteItemBookmarksOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: DELETE_ITEM_BOOKMARKS_START, meta: { info } });
		return profile.deleteItemBookmarks(options).then(response =>
			dispatch({
				type: DELETE_ITEM_BOOKMARKS,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const GET_BOOKMARK_LIST_START = 's/profile/GET_BOOKMARK_LIST_START';
export const GET_BOOKMARK_LIST = 's/profile/GET_BOOKMARK_LIST';
export type GET_BOOKMARK_LIST = api.ItemList;

export function getBookmarkList(options?: profile.GetBookmarkListOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_BOOKMARK_LIST_START, meta: { info } });
		return profile.getBookmarkList(options).then(response =>
			dispatch({
				type: GET_BOOKMARK_LIST,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const GET_ITEM_BOOKMARK_START = 's/profile/GET_ITEM_BOOKMARK_START';
export const GET_ITEM_BOOKMARK = 's/profile/GET_ITEM_BOOKMARK';
export type GET_ITEM_BOOKMARK = api.Bookmark;

export function getItemBookmark(itemId: string, options?: profile.GetItemBookmarkOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_ITEM_BOOKMARK_START, meta: { info } });
		return profile.getItemBookmark(itemId, options).then(response =>
			dispatch({
				type: GET_ITEM_BOOKMARK,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const BOOKMARK_ITEM_START = 's/profile/BOOKMARK_ITEM_START';
export const BOOKMARK_ITEM = 's/profile/BOOKMARK_ITEM';
export type BOOKMARK_ITEM = api.Bookmark;

export function bookmarkItem(itemId: string, options?: profile.BookmarkItemOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: BOOKMARK_ITEM_START, meta: { info } });
		return profile.bookmarkItem(itemId, options).then(response =>
			dispatch({
				type: BOOKMARK_ITEM,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const DELETE_ITEM_BOOKMARK_START = 's/profile/DELETE_ITEM_BOOKMARK_START';
export const DELETE_ITEM_BOOKMARK = 's/profile/DELETE_ITEM_BOOKMARK';
export type DELETE_ITEM_BOOKMARK = any;

export function deleteItemBookmark(itemId: string, options?: profile.DeleteItemBookmarkOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: DELETE_ITEM_BOOKMARK_START, meta: { info } });
		return profile.deleteItemBookmark(itemId, options).then(response =>
			dispatch({
				type: DELETE_ITEM_BOOKMARK,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const DELETE_CONTINUE_WATCHING_START = 's/profile/DELETE_CONTINUE_WATCHING_START';
export const DELETE_CONTINUE_WATCHING = 's/profile/DELETE_CONTINUE_WATCHING';
export type DELETE_CONTINUE_WATCHING = any;

export function deleteContinueWatching(options?: profile.DeleteContinueWatchingOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: DELETE_CONTINUE_WATCHING_START, meta: { info } });
		return profile.deleteContinueWatching(options).then(response =>
			dispatch({
				type: DELETE_CONTINUE_WATCHING,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const GET_CONTINUE_WATCHING_LIST_START = 's/profile/GET_CONTINUE_WATCHING_LIST_START';
export const GET_CONTINUE_WATCHING_LIST = 's/profile/GET_CONTINUE_WATCHING_LIST';
export type GET_CONTINUE_WATCHING_LIST = api.ItemList;

export function getContinueWatchingList(options?: profile.GetContinueWatchingListOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_CONTINUE_WATCHING_LIST_START, meta: { info } });
		return profile.getContinueWatchingList(options).then(response =>
			dispatch({
				type: GET_CONTINUE_WATCHING_LIST,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const GET_FOLLOWS_START = 's/profile/GET_FOLLOWS_START';
export const GET_FOLLOWS = 's/profile/GET_FOLLOWS';
export type GET_FOLLOWS = { [key: string]: Date };

export function getFollows(options?: profile.GetFollowsOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_FOLLOWS_START, meta: { info } });
		return profile.getFollows(options).then(response =>
			dispatch({
				type: GET_FOLLOWS,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const GET_FOLLOW_LIST_START = 's/profile/GET_FOLLOW_LIST_START';
export const GET_FOLLOW_LIST = 's/profile/GET_FOLLOW_LIST';
export type GET_FOLLOW_LIST = api.ItemList;

export function getFollowList(options?: profile.GetFollowListOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_FOLLOW_LIST_START, meta: { info } });
		return profile.getFollowList(options).then(response =>
			dispatch({
				type: GET_FOLLOW_LIST,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const GET_ITEM_FOLLOW_START = 's/profile/GET_ITEM_FOLLOW_START';
export const GET_ITEM_FOLLOW = 's/profile/GET_ITEM_FOLLOW';
export type GET_ITEM_FOLLOW = api.Follow;

export function getItemFollow(itemId: string, options?: profile.GetItemFollowOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_ITEM_FOLLOW_START, meta: { info } });
		return profile.getItemFollow(itemId, options).then(response =>
			dispatch({
				type: GET_ITEM_FOLLOW,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const FOLLOW_ITEM_START = 's/profile/FOLLOW_ITEM_START';
export const FOLLOW_ITEM = 's/profile/FOLLOW_ITEM';
export type FOLLOW_ITEM = api.Follow;

export function followItem(itemId: string, options?: profile.FollowItemOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: FOLLOW_ITEM_START, meta: { info } });
		return profile.followItem(itemId, options).then(response =>
			dispatch({
				type: FOLLOW_ITEM,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const UNFOLLOW_ITEM_START = 's/profile/UNFOLLOW_ITEM_START';
export const UNFOLLOW_ITEM = 's/profile/UNFOLLOW_ITEM';
export type UNFOLLOW_ITEM = any;

export function unfollowItem(itemId: string, options?: profile.UnfollowItemOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: UNFOLLOW_ITEM_START, meta: { info } });
		return profile.unfollowItem(itemId, options).then(response =>
			dispatch({
				type: UNFOLLOW_ITEM,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const GET_NEXT_PLAYBACK_ITEM_START = 's/profile/GET_NEXT_PLAYBACK_ITEM_START';
export const GET_NEXT_PLAYBACK_ITEM = 's/profile/GET_NEXT_PLAYBACK_ITEM';
export type GET_NEXT_PLAYBACK_ITEM = api.NextPlaybackItem;

export function getNextPlaybackItem(itemId: string, options?: profile.GetNextPlaybackItemOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_NEXT_PLAYBACK_ITEM_START, meta: { info } });
		return profile.getNextPlaybackItem(itemId, options).then(response =>
			dispatch({
				type: GET_NEXT_PLAYBACK_ITEM,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const GET_PROFILE_LISTS_START = 's/profile/GET_PROFILE_LISTS_START';
export const GET_PROFILE_LISTS = 's/profile/GET_PROFILE_LISTS';
export type GET_PROFILE_LISTS = api.ItemList[];

export function getProfileLists(ids: string[], options?: profile.GetProfileListsOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_PROFILE_LISTS_START, meta: { info } });
		return profile.getProfileLists(ids, options).then(response =>
			dispatch({
				type: GET_PROFILE_LISTS,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const GET_RATINGS_START = 's/profile/GET_RATINGS_START';
export const GET_RATINGS = 's/profile/GET_RATINGS';
export type GET_RATINGS = { [key: string]: number };

export function getRatings(options?: profile.GetRatingsOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_RATINGS_START, meta: { info } });
		return profile.getRatings(options).then(response =>
			dispatch({
				type: GET_RATINGS,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const GET_RATINGS_LIST_START = 's/profile/GET_RATINGS_LIST_START';
export const GET_RATINGS_LIST = 's/profile/GET_RATINGS_LIST';
export type GET_RATINGS_LIST = api.ItemList;

export function getRatingsList(options?: profile.GetRatingsListOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_RATINGS_LIST_START, meta: { info } });
		return profile.getRatingsList(options).then(response =>
			dispatch({
				type: GET_RATINGS_LIST,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const GET_ITEM_RATING_START = 's/profile/GET_ITEM_RATING_START';
export const GET_ITEM_RATING = 's/profile/GET_ITEM_RATING';
export type GET_ITEM_RATING = api.UserRating;

export function getItemRating(itemId: string, options?: profile.GetItemRatingOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_ITEM_RATING_START, meta: { info } });
		return profile.getItemRating(itemId, options).then(response =>
			dispatch({
				type: GET_ITEM_RATING,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const RATE_ITEM_START = 's/profile/RATE_ITEM_START';
export const RATE_ITEM = 's/profile/RATE_ITEM';
export type RATE_ITEM = api.UserRating;

export function rateItem(itemId: string, rating: number, options?: profile.RateItemOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: RATE_ITEM_START, meta: { info } });
		return profile.rateItem(itemId, rating, options).then(response =>
			dispatch({
				type: RATE_ITEM,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const GET_REMINDERS_START = 's/profile/GET_REMINDERS_START';
export const GET_REMINDERS = 's/profile/GET_REMINDERS';
export type GET_REMINDERS = api.Reminder[];

export function getReminders(options?: profile.GetRemindersOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_REMINDERS_START, meta: { info } });
		return profile.getReminders(options).then(response =>
			dispatch({
				type: GET_REMINDERS,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const ADD_REMINDER_START = 's/profile/ADD_REMINDER_START';
export const ADD_REMINDER = 's/profile/ADD_REMINDER';
export type ADD_REMINDER = api.Reminder;

export function addReminder(body: api.ReminderRequest, options?: profile.AddReminderOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: ADD_REMINDER_START, meta: { info } });
		return profile.addReminder(body, options).then(response =>
			dispatch({
				type: ADD_REMINDER,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const DELETE_REMINDER_START = 's/profile/DELETE_REMINDER_START';
export const DELETE_REMINDER = 's/profile/DELETE_REMINDER';
export type DELETE_REMINDER = any;

export function deleteReminder(id: string, options?: profile.DeleteReminderOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: DELETE_REMINDER_START, meta: { info } });
		return profile.deleteReminder(id, options).then(response =>
			dispatch({
				type: DELETE_REMINDER,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const GET_WATCHED_START = 's/profile/GET_WATCHED_START';
export const GET_WATCHED = 's/profile/GET_WATCHED';
export type GET_WATCHED = { [key: string]: api.Watched };

export function getWatched(options?: profile.GetWatchedOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_WATCHED_START, meta: { info } });
		return profile.getWatched(options).then(response =>
			dispatch({
				type: GET_WATCHED,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const GET_WATCHED_LIST_START = 's/profile/GET_WATCHED_LIST_START';
export const GET_WATCHED_LIST = 's/profile/GET_WATCHED_LIST';
export type GET_WATCHED_LIST = api.ItemList;

export function getWatchedList(options?: profile.GetWatchedListOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_WATCHED_LIST_START, meta: { info } });
		return profile.getWatchedList(options).then(response =>
			dispatch({
				type: GET_WATCHED_LIST,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}

export const GET_ITEM_WATCHED_STATUS_START = 's/profile/GET_ITEM_WATCHED_STATUS_START';
export const GET_ITEM_WATCHED_STATUS = 's/profile/GET_ITEM_WATCHED_STATUS';
export type GET_ITEM_WATCHED_STATUS = api.Watched;

export function getItemWatchedStatus(itemId: string, options?: profile.GetItemWatchedStatusOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_ITEM_WATCHED_STATUS_START, meta: { info } });
		return profile.getItemWatchedStatus(itemId, options).then(response =>
			dispatch({
				type: GET_ITEM_WATCHED_STATUS,
				payload: response.data,
				error: response.error,
				meta: {
					res: response.raw,
					info
				}
			})
		);
	};
}
