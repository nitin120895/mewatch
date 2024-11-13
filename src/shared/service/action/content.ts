/// <reference path="../types.ts"/>
/** @module action/content */
// Auto-generated, edits will be overwritten
import * as content from '../content';

export const GET_ITEM_START = 's/content/GET_ITEM_START';
export const GET_ITEM = 's/content/GET_ITEM';
export type GET_ITEM = api.ItemDetail;

export function getItem(id: string, options?: content.GetItemOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_ITEM_START, meta: { info } });
		return content.getItem(id, options).then(response =>
			dispatch({
				type: GET_ITEM,
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

export const GET_ITEM_CHILDREN_LIST_START = 's/content/GET_ITEM_CHILDREN_LIST_START';
export const GET_ITEM_CHILDREN_LIST = 's/content/GET_ITEM_CHILDREN_LIST';
export type GET_ITEM_CHILDREN_LIST = api.ItemList;

export function getItemChildrenList(id: string, options?: content.GetItemChildrenListOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_ITEM_CHILDREN_LIST_START, meta: { info } });
		return content.getItemChildrenList(id, options).then(response =>
			dispatch({
				type: GET_ITEM_CHILDREN_LIST,
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

export const GET_ITEM_RELATED_LIST_START = 's/content/GET_ITEM_RELATED_LIST_START';
export const GET_ITEM_RELATED_LIST = 's/content/GET_ITEM_RELATED_LIST';
export type GET_ITEM_RELATED_LIST = api.ItemList;

export function getItemRelatedList(id: string, options?: content.GetItemRelatedListOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_ITEM_RELATED_LIST_START, meta: { info } });
		return content.getItemRelatedList(id, options).then(response =>
			dispatch({
				type: GET_ITEM_RELATED_LIST,
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

export const GET_SHOW_EPISODES_START = 's/content/GET_SHOW_EPISODES_START';
export const GET_SHOW_EPISODES = 's/content/GET_SHOW_EPISODES';
export type GET_SHOW_EPISODES = api.ShowEpisodesResponse;

export function getShowEpisodes(id: string, options?: content.GetShowEpisodesOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_SHOW_EPISODES_START, meta: { info } });
		return content.getShowEpisodes(id, options).then(response =>
			dispatch({
				type: GET_SHOW_EPISODES,
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

export const GET_PUBLIC_START_OVER_FILES_START = 's/content/GET_PUBLIC_START_OVER_FILES_START';
export const GET_PUBLIC_START_OVER_FILES = 's/content/GET_PUBLIC_START_OVER_FILES';
export type GET_PUBLIC_START_OVER_FILES = api.MediaFile[];

export function getPublicStartOverFiles(
	id: string,
	scheduleCustomId: string,
	resolution: 'HD-4K' | 'HD-1080' | 'HD-720' | 'VR-360' | 'SD' | 'External',
	device: string,
	options?: content.GetPublicStartOverFilesOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_PUBLIC_START_OVER_FILES_START, meta: { info } });
		return content.getPublicStartOverFiles(id, scheduleCustomId, resolution, device, options).then(response =>
			dispatch({
				type: GET_PUBLIC_START_OVER_FILES,
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

export const GET_PUBLIC_ITEM_MEDIA_FILES_START = 's/content/GET_PUBLIC_ITEM_MEDIA_FILES_START';
export const GET_PUBLIC_ITEM_MEDIA_FILES = 's/content/GET_PUBLIC_ITEM_MEDIA_FILES';
export type GET_PUBLIC_ITEM_MEDIA_FILES = api.MediaFile[];

export function getPublicItemMediaFiles(
	id: string,
	delivery: ('stream' | 'progressive' | 'download')[],
	resolution: 'HD-4K' | 'HD-1080' | 'HD-720' | 'VR-360' | 'SD' | 'External',
	device: string,
	options?: content.GetPublicItemMediaFilesOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_PUBLIC_ITEM_MEDIA_FILES_START, meta: { info } });
		return content.getPublicItemMediaFiles(id, delivery, resolution, device, options).then(response =>
			dispatch({
				type: GET_PUBLIC_ITEM_MEDIA_FILES,
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

export const GET_ANONYMOUS_NEXT_PLAYBACK_ITEM_START = 's/content/GET_ANONYMOUS_NEXT_PLAYBACK_ITEM_START';
export const GET_ANONYMOUS_NEXT_PLAYBACK_ITEM = 's/content/GET_ANONYMOUS_NEXT_PLAYBACK_ITEM';
export type GET_ANONYMOUS_NEXT_PLAYBACK_ITEM = api.NextPlaybackItem;

export function getAnonymousNextPlaybackItem(
	itemId: string,
	options?: content.GetAnonymousNextPlaybackItemOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_ANONYMOUS_NEXT_PLAYBACK_ITEM_START, meta: { info } });
		return content.getAnonymousNextPlaybackItem(itemId, options).then(response =>
			dispatch({
				type: GET_ANONYMOUS_NEXT_PLAYBACK_ITEM,
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

export const GET_RECOMMENDATIONS_LIST_START = 's/content/GET_RECOMMENDATIONS_LIST_START';
export const GET_RECOMMENDATIONS_LIST = 's/content/GET_RECOMMENDATIONS_LIST';
export type GET_RECOMMENDATIONS_LIST = api.ItemList;

export function getRecommendationsList(
	widgetId: string,
	options?: content.GetRecommendationsListOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_RECOMMENDATIONS_LIST_START, meta: { info } });
		return content.getRecommendationsList(widgetId, options).then(response =>
			dispatch({
				type: GET_RECOMMENDATIONS_LIST,
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

export const GET_BOOST_RECOMMENDATIONS_LIST_START = 's/content/GET_BOOST_RECOMMENDATIONS_LIST_START';
export const GET_BOOST_RECOMMENDATIONS_LIST = 's/content/GET_BOOST_RECOMMENDATIONS_LIST';
export type GET_BOOST_RECOMMENDATIONS_LIST = api.BoostItemList;

export function getBoostRecommendationsList(
	widgetId: string,
	options?: content.GetBoostRecommendationsListOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_BOOST_RECOMMENDATIONS_LIST_START, meta: { info } });
		return content.getBoostRecommendationsList(widgetId, options).then(response =>
			dispatch({
				type: GET_BOOST_RECOMMENDATIONS_LIST,
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

export const GET_CXENSE_RECOMMENDATIONS_LIST_START = 's/content/GET_CXENSE_RECOMMENDATIONS_LIST_START';
export const GET_CXENSE_RECOMMENDATIONS_LIST = 's/content/GET_CXENSE_RECOMMENDATIONS_LIST';
export type GET_CXENSE_RECOMMENDATIONS_LIST = api.ItemList;

export function getCxenseRecommendationsList(
	widgetId: string,
	options?: content.GetCxenseRecommendationsListOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_CXENSE_RECOMMENDATIONS_LIST_START, meta: { info } });
		return content.getCxenseRecommendationsList(widgetId, options).then(response =>
			dispatch({
				type: GET_CXENSE_RECOMMENDATIONS_LIST,
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

export const GET_ZOOM_RECOMMENDATIONS_LIST_START = 's/content/GET_ZOOM_RECOMMENDATIONS_LIST_START';
export const GET_ZOOM_RECOMMENDATIONS_LIST = 's/content/GET_ZOOM_RECOMMENDATIONS_LIST';
export type GET_ZOOM_RECOMMENDATIONS_LIST = api.ItemList;

export function getZoomRecommendationsList(
	widgetId: string,
	options?: content.GetZoomRecommendationsListOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_ZOOM_RECOMMENDATIONS_LIST_START, meta: { info } });
		return content.getZoomRecommendationsList(widgetId, options).then(response =>
			dispatch({
				type: GET_ZOOM_RECOMMENDATIONS_LIST,
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

export const GET_LISTS_START = 's/content/GET_LISTS_START';
export const GET_LISTS = 's/content/GET_LISTS';
export type GET_LISTS = api.ItemList[];

export function getLists(ids: string[], options?: content.GetListsOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_LISTS_START, meta: { info } });
		return content.getLists(ids, options).then(response =>
			dispatch({
				type: GET_LISTS,
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

export const GET_LIST_START = 's/content/GET_LIST_START';
export const GET_LIST = 's/content/GET_LIST';
export type GET_LIST = api.ItemList;

export function getList(id: string, options?: content.GetListOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_LIST_START, meta: { info } });
		return content.getList(id, options).then(response =>
			dispatch({
				type: GET_LIST,
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

export const GET_NEXT_SCHEDULES_START = 's/content/GET_NEXT_SCHEDULES_START';
export const GET_NEXT_SCHEDULES = 's/content/GET_NEXT_SCHEDULES';
export type GET_NEXT_SCHEDULES = api.ItemScheduleList[];

export function getNextSchedules(
	channels: string[],
	date: Date,
	hour: number,
	minute: number,
	options?: content.GetNextSchedulesOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_NEXT_SCHEDULES_START, meta: { info } });
		return content.getNextSchedules(channels, date, hour, minute, options).then(response =>
			dispatch({
				type: GET_NEXT_SCHEDULES,
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

export const GET_PLAN_START = 's/content/GET_PLAN_START';
export const GET_PLAN = 's/content/GET_PLAN';
export type GET_PLAN = api.Plan;

export function getPlan(id: string, options?: content.GetPlanOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_PLAN_START, meta: { info } });
		return content.getPlan(id, options).then(response =>
			dispatch({
				type: GET_PLAN,
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

export const GET_SCHEDULES_START = 's/content/GET_SCHEDULES_START';
export const GET_SCHEDULES = 's/content/GET_SCHEDULES';
export type GET_SCHEDULES = api.ItemScheduleList[];

export function getSchedules(
	channels: string[],
	date: Date,
	hour: number,
	duration: number,
	options?: content.GetSchedulesOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_SCHEDULES_START, meta: { info } });
		return content.getSchedules(channels, date, hour, duration, options).then(response =>
			dispatch({
				type: GET_SCHEDULES,
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

export const GET_SCHEDULE_START = 's/content/GET_SCHEDULE_START';
export const GET_SCHEDULE = 's/content/GET_SCHEDULE';
export type GET_SCHEDULE = api.ItemScheduleDetail;

export function getSchedule(id: string, options?: content.GetScheduleOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_SCHEDULE_START, meta: { info } });
		return content.getSchedule(id, options).then(response =>
			dispatch({
				type: GET_SCHEDULE,
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

export const SEARCH_START = 's/content/SEARCH_START';
export const SEARCH = 's/content/SEARCH';
export type SEARCH = api.SearchResults;

export function search(term: string, options?: content.SearchOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: SEARCH_START, meta: { info } });
		return content.search(term, options).then(response =>
			dispatch({
				type: SEARCH,
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

export const GET_SEARCH_LISTS_START = 's/content/GET_SEARCH_LISTS_START';
export const GET_SEARCH_LISTS = 's/content/GET_SEARCH_LISTS';
export type GET_SEARCH_LISTS = api.SearchListsResults;

export function getSearchLists(term: string, options?: content.GetSearchListsOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_SEARCH_LISTS_START, meta: { info } });
		return content.getSearchLists(term, options).then(response =>
			dispatch({
				type: GET_SEARCH_LISTS,
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
