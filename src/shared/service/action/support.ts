/// <reference path="../types.ts"/>
/** @module action/support */
// Auto-generated, edits will be overwritten
import * as support from '../support';

export const GET_ADDRESS_START = 's/support/GET_ADDRESS_START';
export const GET_ADDRESS = 's/support/GET_ADDRESS';
export type GET_ADDRESS = api.PostalCodeAddress;

export function getAddress(options?: support.GetAddressOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_ADDRESS_START, meta: { info } });
		return support.getAddress(options).then(response =>
			dispatch({
				type: GET_ADDRESS,
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

export const REQUEST_ONE_TIME_PASSWORD_START = 's/support/REQUEST_ONE_TIME_PASSWORD_START';
export const REQUEST_ONE_TIME_PASSWORD = 's/support/REQUEST_ONE_TIME_PASSWORD';
export type REQUEST_ONE_TIME_PASSWORD = any;

export function requestOneTimePassword(options?: support.RequestOneTimePasswordOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: REQUEST_ONE_TIME_PASSWORD_START, meta: { info } });
		return support.requestOneTimePassword(options).then(response =>
			dispatch({
				type: REQUEST_ONE_TIME_PASSWORD,
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

export const FORGOT_PASSWORD_START = 's/support/FORGOT_PASSWORD_START';
export const FORGOT_PASSWORD = 's/support/FORGOT_PASSWORD';
export type FORGOT_PASSWORD = any;

export function forgotPassword(
	body: api.PasswordResetEmailRequest,
	options?: support.ForgotPasswordOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: FORGOT_PASSWORD_START, meta: { info } });
		return support.forgotPassword(body, options).then(response =>
			dispatch({
				type: FORGOT_PASSWORD,
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

export const RESET_PASSWORD_START = 's/support/RESET_PASSWORD_START';
export const RESET_PASSWORD = 's/support/RESET_PASSWORD';
export type RESET_PASSWORD = any;

export function resetPassword(body: api.PasswordResetRequest, options?: support.ResetPasswordOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: RESET_PASSWORD_START, meta: { info } });
		return support.resetPassword(body, options).then(response =>
			dispatch({
				type: RESET_PASSWORD,
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

export const CHECK_USER_EXISTS_START = 's/support/CHECK_USER_EXISTS_START';
export const CHECK_USER_EXISTS = 's/support/CHECK_USER_EXISTS';
export type CHECK_USER_EXISTS = api.UserExistsResult;

export function checkUserExists(
	body: api.UserExistsRequest,
	options?: support.CheckUserExistsOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: CHECK_USER_EXISTS_START, meta: { info } });
		return support.checkUserExists(body, options).then(response =>
			dispatch({
				type: CHECK_USER_EXISTS,
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

export const VERIFY_EMAIL_START = 's/support/VERIFY_EMAIL_START';
export const VERIFY_EMAIL = 's/support/VERIFY_EMAIL';
export type VERIFY_EMAIL = any;

export function verifyEmail(options?: support.VerifyEmailOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: VERIFY_EMAIL_START, meta: { info } });
		return support.verifyEmail(options).then(response =>
			dispatch({
				type: VERIFY_EMAIL,
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

export const VERIFY_RECAPTCHA_START = 's/support/VERIFY_RECAPTCHA_START';
export const VERIFY_RECAPTCHA = 's/support/VERIFY_RECAPTCHA';
export type VERIFY_RECAPTCHA = api.VerifyRecaptchaResult;

export function verifyRecaptcha(body: api.VerifyRecaptchaRequest, info?: any): any {
	return dispatch => {
		dispatch({ type: VERIFY_RECAPTCHA_START, meta: { info } });
		return support.verifyRecaptcha(body).then(response =>
			dispatch({
				type: VERIFY_RECAPTCHA,
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
