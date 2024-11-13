/// <reference path="../types.ts"/>
/** @module action/newsletters */
// Auto-generated, edits will be overwritten
import * as newsletters from '../newsletters';

export const GET_NEWSLETTERS_START = 's/newsletters/GET_NEWSLETTERS_START';
export const GET_NEWSLETTERS = 's/newsletters/GET_NEWSLETTERS';
export type GET_NEWSLETTERS = api.Newsletter[];

export function getNewsletters(options?: newsletters.GetNewslettersOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_NEWSLETTERS_START, meta: { info } });
		return newsletters.getNewsletters(options).then(response =>
			dispatch({
				type: GET_NEWSLETTERS,
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
