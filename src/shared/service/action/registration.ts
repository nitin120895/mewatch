/// <reference path="../types.ts"/>
/** @module action/registration */
// Auto-generated, edits will be overwritten
import * as registration from '../registration';

export const REGISTER_START = 's/registration/REGISTER_START';
export const REGISTER = 's/registration/REGISTER';
export type REGISTER = api.AccessToken[];

export function register(body: api.RegistrationRequest, options?: registration.RegisterOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: REGISTER_START, meta: { info } });
		return registration.register(body, options).then(response =>
			dispatch({
				type: REGISTER,
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

export const REGISTER_ANONYMOUS_START = 's/registration/REGISTER_ANONYMOUS_START';
export const REGISTER_ANONYMOUS = 's/registration/REGISTER_ANONYMOUS';
export type REGISTER_ANONYMOUS = api.AccessToken[];

export function registerAnonymous(
	body: api.RegistrationRequest,
	options?: registration.RegisterAnonymousOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: REGISTER_ANONYMOUS_START, meta: { info } });
		return registration.registerAnonymous(body, options).then(response =>
			dispatch({
				type: REGISTER_ANONYMOUS,
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
