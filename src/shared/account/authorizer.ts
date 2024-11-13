import * as Redux from 'redux';
import ModalTypes from '../uiLayer/modalTypes';
import { genId } from '../util/strings';
import { SignIn } from 'shared/page/pageKey';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { findToken, shouldRefreshToken, isInvalidToken } from '../util/tokens';
import { getAnonymousToken, refreshToken } from '../service/action/authorization';
import { browserHistory } from '../util/browserHistory';
import * as UILayerActions from '../uiLayer/uiLayerWorkflow';
import { promptPassword, promptPin, TokenTypes } from './sessionWorkflow';
import { requestPlaybackToken } from '../app/playerWorkflow';
import { get, isArray } from '../util/objects';
import { getDeviceId } from '../util/deviceUtil';
import { sessionExpiredModalIsInProgress } from 'toggle/responsive/util/modalUtil';

// We store single use keys here and don't bother reducing them into state
// as they're transient so no real point.
const singleUseKeys = {};
let store: Redux.Store<state.Root>;
const refreshTokensMap = new Map<string, Promise<any>>();

export function init(appStore: Redux.Store<state.Root>) {
	store = appStore;
}

export const getAuthorization = (
	security: api.OperationSecurity,
	securityDefinition?: any,
	op?: api.OperationInfo
): Promise<api.OperationRightsInfo> => {
	switch (security.id) {
		case 'verifyEmailAuth':
			return useSingleUseKey('verifyEmailAuth');
		case 'resetPasswordAuth':
			return useSingleUseKey('resetPasswordAuth');
		case 'accountAuth':
			return getToken('UserAccount', security);
		case 'anonymousAuth':
			return getToken(TokenTypes.Anonymous, security);
		case 'profileAuth':
			return getToken('UserProfile', security);
		default:
			return Promise.reject<api.OperationRightsInfo>({});
	}
};

function getToken(type: TokenType, security) {
	const state: state.Root = store.getState();

	if (!state.session.tokens.length) {
		if (type === TokenTypes.Anonymous) {
			return store
				.dispatch(
					getAnonymousToken({
						cookieType: 'Session',
						deviceId: getDeviceId()
					})
				)
				.then(res => ({ token: res.payload[0].value }));
		}

		// We can only get tokens if we're logged in, so if we're not, ask them to log in!
		const path = getPathByKey(SignIn, state.app.config);
		// to see if we've already asked the user with session expired/device removed alert
		const uiModals = get(state, 'uiLayer.modals');
		if (!sessionExpiredModalIsInProgress(uiModals) && browserHistory) {
			browserHistory.push(path);
		}
		return Promise.reject({});
	}

	const token = findToken(state.session.tokens, type, security.scopes[0]);

	if (token && !isInvalidToken(token)) {
		// If a refreshable token looks like it's expired then proactively refresh it.
		// Note the client clock may be off fooling us into thinking the token is still valid
		// when it's not. In that case we'll get an error from the server and refresh
		// the token followed by retrying the original request.
		// See `src/shared/app/requestProcessor#processResponse`
		if (shouldRefreshToken(token)) {
			const session: state.Session = store.getState().session;
			const cookieType: api.CookieType = session.remember ? 'Persistent' : 'Session';

			if (refreshTokensMap.has(token.value)) {
				return refreshTokensMap.get(token.value);
			}

			const refreshPromise = store.dispatch(refreshToken({ token: token.value, cookieType })).then(action => {
				if (action.error) throw action.payload;
				refreshTokensMap.delete(token.value);
				if (isArray(action.payload)) {
					return { token: action.payload[0].value };
				}
				return { token: action.payload.value };
			});
			refreshTokensMap.set(token.value, refreshPromise);

			return refreshPromise;
		}
		return Promise.resolve<api.OperationRightsInfo>({ token: token.value });
	}

	// either had no token or it's expired, request a new one
	return new Promise((resolve, reject) => {
		if (_TV_) {
			createPromptOnTV(type, security, resolve, reject);
			return;
		}

		const account = get(state, 'account.info');
		// we don't need to prompt password for Anonymous
		if (!account || type === TokenTypes.Anonymous) {
			reject();
			return;
		}

		const modalId = `${type}-${genId()}`;

		const onFailure = error => {
			store.dispatch(UILayerActions.CloseModal(modalId));
			reject(error);
		};

		const onSuccess = (payload: { type: string; value: string }[]) => {
			store.dispatch(UILayerActions.CloseModal(modalId));
			resolve({ token: payload.find(t => t.type === type).value });
		};

		const getPlaybackToken = (pin: string) => {
			const body: api.RequestPlaybackToken = {
				scopes: security.scopes,
				pin,
				tokenType: type,
				onError: onFailure,
				onSuccess
			};
			store.dispatch(requestPlaybackToken(body));
		};

		const modalType =
			type === 'UserProfile' || hasTheOnlyScope(security, 'Playback')
				? account.pinEnabled
					? ModalTypes.PIN_AUTH
					: ModalTypes.PIN_CREATE
				: ModalTypes.PASSWORD_AUTH;

		store.dispatch(
			UILayerActions.OpenModal({
				id: modalId,
				type: modalType,
				componentProps: {
					scopes: security.scopes,
					account,
					changePin: account.pinEnabled,
					tokenType: type,
					onSuccess: payload => {
						if (modalType === ModalTypes.PIN_CREATE) {
							return getPlaybackToken(payload);
						}
						onSuccess(payload);
					},
					onFailure
				}
			})
		);
	});
}

function createPromptOnTV(type: TokenType, security, resolve, reject) {
	const prompt = hasTheOnlyScope(security, 'Playback') || type === 'UserProfile' ? promptPin : promptPassword;
	store.dispatch(
		prompt(
			security.scopes,
			payload => {
				resolve({ token: payload.find(t => t.type === type).value });
			},
			reject,
			type
		)
	);
}

function hasTheOnlyScope(security: api.OperationSecurity, scope: string) {
	return security && security.scopes && security.scopes.length === 1 && security.scopes[0] === scope;
}

function useSingleUseKey(securityId: string) {
	const key = singleUseKeys[securityId];
	const apiKey = `Bearer ${key}`;
	removeSingleUseKey(securityId);
	return Promise.resolve<api.OperationRightsInfo>({ apiKey });
}

export function setSingleUseKey(securityId: string, key: string) {
	singleUseKeys[securityId] = key;
}

export function removeSingleUseKey(securityId: string) {
	delete singleUseKeys[securityId];
}
