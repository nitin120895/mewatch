/// <reference path="../types.ts"/>
/** @module action/app */
// Auto-generated, edits will be overwritten
import * as app from '../app';

export const GET_APP_CONFIG_START = 's/app/GET_APP_CONFIG_START';
export const GET_APP_CONFIG = 's/app/GET_APP_CONFIG';
export type GET_APP_CONFIG = api.AppConfig;

export function getAppConfig(options?: app.GetAppConfigOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_APP_CONFIG_START, meta: { info } });
		return app.getAppConfig(options).then(response =>
			dispatch({
				type: GET_APP_CONFIG,
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

export const GET_PAGE_START = 's/app/GET_PAGE_START';
export const GET_PAGE = 's/app/GET_PAGE';
export type GET_PAGE = api.Page;

export function getPage(path: string, options?: app.GetPageOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_PAGE_START, meta: { info } });
		return app.getPage(path, options).then(response =>
			dispatch({
				type: GET_PAGE,
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
