import * as authorization from '../mcSSOAuthorization';
import { getSignDevice } from 'shared//util/deviceUtil';

export const MC_SSO_START = 's/authorization/MC_SSO_START';
export const MC_SSO = 's/authorization/MC_SSO';

export function mcSSOSignIn(username: string, password: string, rc: string): any {
	return dispatch => {
		const { id, os, browser } = getSignDevice();

		dispatch({ type: MC_SSO_START });
		return authorization.mcSSOSignIn({ username, password, id, os, browser }, rc).then(response =>
			dispatch({
				type: MC_SSO,
				payload: response,
				error: response.status
			})
		);
	};
}

export const MC_SSO_ENCRYPT_START = 's/authorization/MC_SSO_ENCRYPT_START';
export const MC_SSO_ENCRYPT_FAILED = 's/authorization/MC_SSO_ENCRYPT_FAILED';
export const MC_SSO_ENCRYPT = 's/authorization/MC_SSO_ENCRYPT';
export function encryptSSOToken(token: string): any {
	return dispatch => {
		dispatch({ type: MC_SSO_ENCRYPT_START });
		return authorization.encryptSSOToken(token).then(
			response =>
				dispatch({
					type: MC_SSO_ENCRYPT,
					payload: response,
					error: response.status
				}),
			e => dispatch({ type: MC_SSO_ENCRYPT_FAILED })
		);
	};
}
