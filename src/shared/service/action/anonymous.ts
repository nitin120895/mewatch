/// <reference path="../types.ts"/>
/** @module action/anonymous */
// Auto-generated, edits will be overwritten
import * as anonymous from '../anonymous';

export const DELETE_ANONYMOUS_CONTINUE_WATCHING_START = 's/anonymous/DELETE_ANONYMOUS_CONTINUE_WATCHING_START';
export const DELETE_ANONYMOUS_CONTINUE_WATCHING = 's/anonymous/DELETE_ANONYMOUS_CONTINUE_WATCHING';
export type DELETE_ANONYMOUS_CONTINUE_WATCHING = any;

export function deleteAnonymousContinueWatching(
	options?: anonymous.DeleteAnonymousContinueWatchingOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: DELETE_ANONYMOUS_CONTINUE_WATCHING_START, meta: { info } });
		return anonymous.deleteAnonymousContinueWatching(options).then(response =>
			dispatch({
				type: DELETE_ANONYMOUS_CONTINUE_WATCHING,
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

export const GET_ANONYMOUS_CONTINUE_WATCHING_LIST_START = 's/anonymous/GET_ANONYMOUS_CONTINUE_WATCHING_LIST_START';
export const GET_ANONYMOUS_CONTINUE_WATCHING_LIST = 's/anonymous/GET_ANONYMOUS_CONTINUE_WATCHING_LIST';
export type GET_ANONYMOUS_CONTINUE_WATCHING_LIST = api.ItemList;

export function getAnonymousContinueWatchingList(
	options?: anonymous.GetAnonymousContinueWatchingListOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_ANONYMOUS_CONTINUE_WATCHING_LIST_START, meta: { info } });
		return anonymous.getAnonymousContinueWatchingList(options).then(response =>
			dispatch({
				type: GET_ANONYMOUS_CONTINUE_WATCHING_LIST,
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

export const REQUEST_COUNTRY_CODE_START = 's/anonymous/REQUEST_COUNTRY_CODE_START';
export const REQUEST_COUNTRY_CODE = 's/anonymous/REQUEST_COUNTRY_CODE';
export type REQUEST_COUNTRY_CODE = api.CountryCode;

export function requestCountryCode(info?: any): any {
	return dispatch => {
		dispatch({ type: REQUEST_COUNTRY_CODE_START, meta: { info } });
		return anonymous.requestCountryCode().then(response =>
			dispatch({
				type: REQUEST_COUNTRY_CODE,
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

export const GET_WATCHED_ANONYMOUS_START = 's/anonymous/GET_WATCHED_ANONYMOUS_START';
export const GET_WATCHED_ANONYMOUS = 's/anonymous/GET_WATCHED_ANONYMOUS';
export type GET_WATCHED_ANONYMOUS = { [key: string]: api.Watched };

export function getWatchedAnonymous(options?: anonymous.GetWatchedAnonymousOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_WATCHED_ANONYMOUS_START, meta: { info } });
		return anonymous.getWatchedAnonymous(options).then(response =>
			dispatch({
				type: GET_WATCHED_ANONYMOUS,
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

export const DELETE_WATCHED_ANONYMOUS_START = 's/anonymous/DELETE_WATCHED_ANONYMOUS_START';
export const DELETE_WATCHED_ANONYMOUS = 's/anonymous/DELETE_WATCHED_ANONYMOUS';
export type DELETE_WATCHED_ANONYMOUS = any;

export function deleteWatchedAnonymous(options?: anonymous.DeleteWatchedAnonymousOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: DELETE_WATCHED_ANONYMOUS_START, meta: { info } });
		return anonymous.deleteWatchedAnonymous(options).then(response =>
			dispatch({
				type: DELETE_WATCHED_ANONYMOUS,
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

export const GET_WATCHED_LIST_ANONYMOUS_START = 's/anonymous/GET_WATCHED_LIST_ANONYMOUS_START';
export const GET_WATCHED_LIST_ANONYMOUS = 's/anonymous/GET_WATCHED_LIST_ANONYMOUS';
export type GET_WATCHED_LIST_ANONYMOUS = api.ItemList;

export function getWatchedListAnonymous(options?: anonymous.GetWatchedListAnonymousOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_WATCHED_LIST_ANONYMOUS_START, meta: { info } });
		return anonymous.getWatchedListAnonymous(options).then(response =>
			dispatch({
				type: GET_WATCHED_LIST_ANONYMOUS,
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

export const GET_ITEM_WATCHED_STATUS_ANONYMOUS_START = 's/anonymous/GET_ITEM_WATCHED_STATUS_ANONYMOUS_START';
export const GET_ITEM_WATCHED_STATUS_ANONYMOUS = 's/anonymous/GET_ITEM_WATCHED_STATUS_ANONYMOUS';
export type GET_ITEM_WATCHED_STATUS_ANONYMOUS = api.Watched;

export function getItemWatchedStatusAnonymous(
	itemId: string,
	options?: anonymous.GetItemWatchedStatusAnonymousOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_ITEM_WATCHED_STATUS_ANONYMOUS_START, meta: { info } });
		return anonymous.getItemWatchedStatusAnonymous(itemId, options).then(response =>
			dispatch({
				type: GET_ITEM_WATCHED_STATUS_ANONYMOUS,
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

export const SET_ITEM_WATCHED_STATUS_ANONYMOUS_START = 's/anonymous/SET_ITEM_WATCHED_STATUS_ANONYMOUS_START';
export const SET_ITEM_WATCHED_STATUS_ANONYMOUS = 's/anonymous/SET_ITEM_WATCHED_STATUS_ANONYMOUS';
export type SET_ITEM_WATCHED_STATUS_ANONYMOUS = api.Watched;

export function setItemWatchedStatusAnonymous(
	itemId: string,
	position: number,
	options?: anonymous.SetItemWatchedStatusAnonymousOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: SET_ITEM_WATCHED_STATUS_ANONYMOUS_START, meta: { info } });
		return anonymous.setItemWatchedStatusAnonymous(itemId, position, options).then(response =>
			dispatch({
				type: SET_ITEM_WATCHED_STATUS_ANONYMOUS,
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
