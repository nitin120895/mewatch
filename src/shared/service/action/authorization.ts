/// <reference path="../types.ts"/>
/** @module action/authorization */
// Auto-generated, edits will be overwritten
import * as authorization from '../authorization';

export const GET_ACCOUNT_TOKEN_START = 's/authorization/GET_ACCOUNT_TOKEN_START';
export const GET_ACCOUNT_TOKEN = 's/authorization/GET_ACCOUNT_TOKEN';
export type GET_ACCOUNT_TOKEN = api.AccessToken[];

export function getAccountToken(
	body: api.AccountTokenRequest,
	options?: authorization.GetAccountTokenOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_ACCOUNT_TOKEN_START, meta: { info } });
		return authorization.getAccountToken(body, options).then(response =>
			dispatch({
				type: GET_ACCOUNT_TOKEN,
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

export const SIGN_OUT_START = 's/authorization/SIGN_OUT_START';
export const SIGN_OUT = 's/authorization/SIGN_OUT';
export type SIGN_OUT = any;

export function signOut(options?: authorization.SignOutOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: SIGN_OUT_START, meta: { info } });
		return authorization.signOut(options).then(response =>
			dispatch({
				type: SIGN_OUT,
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

export const GET_ANONYMOUS_TOKEN_START = 's/authorization/GET_ANONYMOUS_TOKEN_START';
export const GET_ANONYMOUS_TOKEN = 's/authorization/GET_ANONYMOUS_TOKEN';
export type GET_ANONYMOUS_TOKEN = api.AccessToken[];

export function getAnonymousToken(
	body: api.AnonymousTokenRequest,
	options?: authorization.GetAnonymousTokenOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_ANONYMOUS_TOKEN_START, meta: { info } });
		return authorization.getAnonymousToken(body, options).then(response =>
			dispatch({
				type: GET_ANONYMOUS_TOKEN,
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

export const GET_AUTO_SIGNIN_URL_START = 's/authorization/GET_AUTO_SIGNIN_URL_START';
export const GET_AUTO_SIGNIN_URL = 's/authorization/GET_AUTO_SIGNIN_URL';
export type GET_AUTO_SIGNIN_URL = api.AutomaticSignIn;

export function getAutoSigninUrl(options?: authorization.GetAutoSigninUrlOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_AUTO_SIGNIN_URL_START, meta: { info } });
		return authorization.getAutoSigninUrl(options).then(response =>
			dispatch({
				type: GET_AUTO_SIGNIN_URL,
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

export const GET_ACCOUNT_TOKEN_BY_CODE_START = 's/authorization/GET_ACCOUNT_TOKEN_BY_CODE_START';
export const GET_ACCOUNT_TOKEN_BY_CODE = 's/authorization/GET_ACCOUNT_TOKEN_BY_CODE';
export type GET_ACCOUNT_TOKEN_BY_CODE = api.AccessToken[];

export function getAccountTokenByCode(
	body: api.AccountTokenByCodeRequest,
	options?: authorization.GetAccountTokenByCodeOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_ACCOUNT_TOKEN_BY_CODE_START, meta: { info } });
		return authorization.getAccountTokenByCode(body, options).then(response =>
			dispatch({
				type: GET_ACCOUNT_TOKEN_BY_CODE,
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

export const GENERATE_DEVICE_AUTHORIZATION_CODE_START = 's/authorization/GENERATE_DEVICE_AUTHORIZATION_CODE_START';
export const GENERATE_DEVICE_AUTHORIZATION_CODE = 's/authorization/GENERATE_DEVICE_AUTHORIZATION_CODE';
export type GENERATE_DEVICE_AUTHORIZATION_CODE = api.DeviceAuthorizationCode;

export function generateDeviceAuthorizationCode(
	body: api.DeviceAuthorizationCodeRequest,
	options?: authorization.GenerateDeviceAuthorizationCodeOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GENERATE_DEVICE_AUTHORIZATION_CODE_START, meta: { info } });
		return authorization.generateDeviceAuthorizationCode(body, options).then(response =>
			dispatch({
				type: GENERATE_DEVICE_AUTHORIZATION_CODE,
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

export const CREATE_PLAYBACK_TOKEN_START = 's/authorization/CREATE_PLAYBACK_TOKEN_START';
export const CREATE_PLAYBACK_TOKEN = 's/authorization/CREATE_PLAYBACK_TOKEN';
export type CREATE_PLAYBACK_TOKEN = api.AccessToken[];

export function createPlaybackToken(
	body: api.PlaybackTokenRequest,
	options?: authorization.CreatePlaybackTokenOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: CREATE_PLAYBACK_TOKEN_START, meta: { info } });
		return authorization.createPlaybackToken(body, options).then(response =>
			dispatch({
				type: CREATE_PLAYBACK_TOKEN,
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

export const GET_PROFILE_TOKEN_START = 's/authorization/GET_PROFILE_TOKEN_START';
export const GET_PROFILE_TOKEN = 's/authorization/GET_PROFILE_TOKEN';
export type GET_PROFILE_TOKEN = api.AccessToken[];

export function getProfileToken(
	body: api.ProfileTokenRequest,
	options?: authorization.GetProfileTokenOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_PROFILE_TOKEN_START, meta: { info } });
		return authorization.getProfileToken(body, options).then(response =>
			dispatch({
				type: GET_PROFILE_TOKEN,
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

export const REFRESH_TOKEN_START = 's/authorization/REFRESH_TOKEN_START';
export const REFRESH_TOKEN = 's/authorization/REFRESH_TOKEN';
export type REFRESH_TOKEN = api.AccessToken[];

export function refreshToken(
	body: api.TokenRefreshRequest,
	options?: authorization.RefreshTokenOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: REFRESH_TOKEN_START, meta: { info } });
		return authorization.refreshToken(body, options).then(response =>
			dispatch({
				type: REFRESH_TOKEN,
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

export const CREATE_SETTINGS_TOKEN_START = 's/authorization/CREATE_SETTINGS_TOKEN_START';
export const CREATE_SETTINGS_TOKEN = 's/authorization/CREATE_SETTINGS_TOKEN';
export type CREATE_SETTINGS_TOKEN = api.AccessToken[];

export function createSettingsToken(
	body: api.SettingsTokenRequest,
	options?: authorization.CreateSettingsTokenOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: CREATE_SETTINGS_TOKEN_START, meta: { info } });
		return authorization.createSettingsToken(body, options).then(response =>
			dispatch({
				type: CREATE_SETTINGS_TOKEN,
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

export const SINGLE_SIGN_ON_START = 's/authorization/SINGLE_SIGN_ON_START';
export const SINGLE_SIGN_ON = 's/authorization/SINGLE_SIGN_ON';
export type SINGLE_SIGN_ON = api.AccessToken[];

export function singleSignOn(
	body: api.SingleSignOnRequest,
	options?: authorization.SingleSignOnOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: SINGLE_SIGN_ON_START, meta: { info } });
		return authorization.singleSignOn(body, options).then(response =>
			dispatch({
				type: SINGLE_SIGN_ON,
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

export const SINGLE_SIGN_ON_ANONYMOUS_START = 's/authorization/SINGLE_SIGN_ON_ANONYMOUS_START';
export const SINGLE_SIGN_ON_ANONYMOUS = 's/authorization/SINGLE_SIGN_ON_ANONYMOUS';
export type SINGLE_SIGN_ON_ANONYMOUS = api.AccessToken[];

export function singleSignOnAnonymous(
	body: api.SingleSignOnRequest,
	options?: authorization.SingleSignOnAnonymousOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: SINGLE_SIGN_ON_ANONYMOUS_START, meta: { info } });
		return authorization.singleSignOnAnonymous(body, options).then(response =>
			dispatch({
				type: SINGLE_SIGN_ON_ANONYMOUS,
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
