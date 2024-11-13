import { formatTokens, hasToken, findToken, pruneTokens } from '../util/tokens';
import { deregisterDevice, getAccount, registerDevice, GET_ACCOUNT } from '../service/action/account';
import { GET_PROFILE, GET_REMINDERS, getProfile, getReminders } from '../service/action/profile';
import { signOut as sessionSignOut } from '../service/authorization';
import { hardRefresh, INIT_CLIENT_STATE, InitialClientState, updateLocale } from '../app/appWorkflow';
import { toggleBookmark, getProfileAnonymous, removeAnonymousProfile } from 'shared/account/profileWorkflow';
import { PROMISED_BOOKMARK_KEY } from 'shared/account/profileUtil';
import { removeItem, getItem } from 'shared/util/sessionStorage';
import {
	removeItem as removeLocalStorageItem,
	getItem as getLocalStorageItem,
	setItem as setLocalStorageItem
} from 'shared/util/localStorage';
import {
	alertModal,
	getSingleSignOnOptions,
	MEPASS_SIGNOUT_ALERT_MODAL,
	Providers,
	setLoginSource
} from 'toggle/responsive/util/authUtil';
import { CHECK_ACCOUNT_PW } from './accountWorkflow';
import { OpenModal, ShowPassiveNotification } from 'shared/uiLayer/uiLayerWorkflow';
import { copy, get } from '../util/objects';
import { addReminder } from 'shared/service/action/profile';
import { canPlay } from 'ref/responsive/pageEntry/util/offer';
import {
	getReminderData,
	removeReminderData,
	getReminder,
	getReminderNotificationContent
} from 'toggle/responsive/util/epg';
import {
	getAccountToken,
	getProfileToken,
	singleSignOn as sso,
	singleSignOnAnonymous as ssoAnonymous,
	GET_ACCOUNT_TOKEN,
	GET_ACCOUNT_TOKEN_BY_CODE,
	GET_PROFILE_TOKEN_START,
	GET_PROFILE_TOKEN,
	SINGLE_SIGN_ON,
	REFRESH_TOKEN,
	CREATE_PLAYBACK_TOKEN,
	CREATE_SETTINGS_TOKEN,
	refreshToken,
	createSettingsToken,
	getAnonymousToken,
	GET_ANONYMOUS_TOKEN,
	SINGLE_SIGN_ON_ANONYMOUS,
	REFRESH_TOKEN_START
} from '../service/action/authorization';
import { register, REGISTER, REGISTER_ANONYMOUS, registerAnonymous } from '../service/action/registration';
import { getBrandID, getDeviceId } from '../util/deviceUtil';
import { retrieveReminderOffset } from 'toggle/responsive/util/reminderUtil';
import { getBrowserName } from 'shared/util/browser';
import warning from 'shared/util/warning';
import { genId } from 'shared/util/strings';
import { PAGE_CHANGE } from 'shared/page/pageWorkflow';
import * as authorization from 'shared/service/authorization';
import { getIsSocialAccount, removeIsSocialAccount } from 'shared/page/pageUtil';
import { ThunkAction } from 'redux-thunk';
import { Dispatch } from 'redux';
import { getWatchedAnonymous } from 'shared/service/action/anonymous';
import { SignIn as signinPageKey } from 'shared/page/pageKey';
import { isSignedIn } from './accountUtil';
import { getPathByKey } from '../page/sitemapLookup';
import { clearCache } from 'shared/cache/cacheWorkflow';
import { SELECTED_LANGUAGE } from 'toggle/responsive/player/controls/ControlsAudioLanguage';
import { FAV_TEAM_SELECTED_ID, SHOW_MSG_TEAM_ALREADY_SELECTED } from 'toggle/responsive/component/FavouriteTeams';

import {
	INVALID_ACCESS_TOKEN,
	INVALID_USER_ACCOUNT_DELETED,
	INVALID_USER_CHANGED_PASSWORD,
	UNAUTHORIZED_ERROR
} from '../util/errorCodes';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { MC_SSO_ENCRYPT, MC_SSO_ENCRYPT_FAILED } from '../mcSSOService/action/mcSSOAuthorization';
import { trySharedSession } from '../mcSSOService/mcSSOAuthorization';
import { searchClear } from '../search/searchWorkflow';
import { DEVICE_LIMIT_REACHED, DEVICE_LIMIT_REACHED_ERROR_MSG } from 'toggle/responsive/util/playerUtil';

// ACTIONS
export const PROMPT_SIGN_IN = 'session/PROMPT_SIGN_IN';
export const PROMPT_PASSWORD = 'session/PROMPT_PASSWORD';
export const PROMPT_PIN = 'session/PROMPT_PIN';
export const ADD_PROMPT = 'session/ADD_PROMPT';
export const REPLACE_PROMPTS = 'session/REPLACE_PROMPTS';
export const CANCEL_PROMPT = 'session/CANCEL_PROMPT';
export const SELECT_PROFILE = 'session/SELECT_PROFILE';
export const UNSELECT_PROFILE = 'session/UNSELECT_PROFILE';
export const SIGN_IN = 'session/SIGN_IN';
export const SIGN_OUT = 'session/SIGN_OUT';
export const INIT_TOKENS = 'session/INIT_TOKENS';
export const CLEAR_SESSION_CONTENT_FILTERS = 'session/CLEAR_SESSION_CONTENT_FILTERS';
export const CLEAR_PLAYBACK_TOKEN = 'session/CLEAR_PLAYBACK_TOKEN';
export const CLEAR_ANONYMOUS_TOKEN = 'session/CLEAR_ANONYMOUS_TOKEN';
export const CLEAR_SSO_ENCRYPTED_TOKEN = 'session/CLEAR_SSO_ENCRYPTED_TOKEN';
export const SET_SESSION_FILTER = 'session/SET_SESSION_FILTER';
export const SET_ITEM_LISTING_ATTRIBUTES = 'session/SET_ITEM_LISTING_ATTRIBUTES';

const RETRY_PROFILE_SECONDS = 5000;

export enum TokenTypes {
	UserAccount = 'UserAccount',
	UserProfile = 'UserProfile',
	Anonymous = 'Anonymous'
}

export function promptSignIn(resolve?: (data?: any) => any, reject?: (data?: any) => any) {
	const prompt = createPrompt('signIn', ['Catalog'], resolve, reject);
	return { type: PROMPT_SIGN_IN, payload: prompt };
}

export function promptSignOut() {
	const prompt = createPrompt('signOut', ['Catalog']);
	return { type: ADD_PROMPT, payload: prompt };
}

export function promptPassword(
	scopes: TokenScope[],
	resolve?: (data?: any) => any,
	reject?: (data?: any) => any,
	tokenType?: TokenType
) {
	const prompt = createPrompt('password', scopes, resolve, reject, tokenType);
	return { type: PROMPT_PASSWORD, payload: prompt };
}

export function promptPin(
	scopes: TokenScope[],
	resolve?: (data?: any) => any,
	reject?: (data?: any) => any,
	tokenType?: TokenType
) {
	const prompt = createPrompt('pin', scopes, resolve, reject, tokenType);
	return { type: PROMPT_PIN, payload: prompt };
}

export function cancelPrompt() {
	return { type: CANCEL_PROMPT };
}

export function registerUser(params: api.RegistrationRequestOmited) {
	return async dispatch => {
		const res = await dispatch(register({ ...params, deviceId: getDeviceId() } as api.RegistrationRequest));
		if (!res.error) {
			return dispatch(registerBrowser());
		}
	};
}

export function registerAnonymousUser(params: api.RegistrationRequestOmited) {
	return async dispatch => {
		const res = await dispatch(registerAnonymous({ ...params, deviceId: getDeviceId() } as api.RegistrationRequest));
		if (!res.error) {
			return dispatch(registerBrowser());
		}

		return Promise.reject(res);
	};
}

/**
 * Begin an authenticated session using single sign on.
 *
 * @param options single sign on options
 * @param remember true if the user wishes to stay signed in, false if not. Defaults to true.
 * @param redirectPath the optional redirect path to navigate to on successful sign-in.
 */
export function singleSignOn(options: api.SingleSignOnRequest, remember = true, redirectPath?: string): any {
	return (dispatch, getState) => {
		options.cookieType = remember ? 'Persistent' : 'Session';
		const state: state.Root = getState();
		return dispatch(sso(options, {}, { remember })).then(action => onSignIn(state, dispatch, action, redirectPath));
	};
}

export function singleSignOnAnonymous(options: api.SingleSignOnRequest, remember = true, redirectPath?: string): any {
	return (dispatch, getState) => {
		options.cookieType = remember ? 'Persistent' : 'Session';
		const state: state.Root = getState();
		return dispatch(ssoAnonymous(options, {}, { remember })).then(action =>
			onSignIn(state, dispatch, action, redirectPath)
		);
	};
}

/**
 * Begin an authenticated session.
 *
 * @param email user's email address
 * @param password user's password
 * @param remember true if the user wishes to stay signed in, false if not
 * @param scopes the scopes of tokens to request
 * @param redirectPath the optional redirect path to navigate to on successful sign-in.
 */
export function signIn(
	email: string,
	password: string,
	remember: boolean,
	scopes: TokenScope[],
	redirectPath?: string
): any {
	return (dispatch, getState) => {
		const cookieType: api.CookieType = remember ? 'Persistent' : 'Session';
		const state: state.Root = getState();
		if (!scopes) {
			return Promise.reject('Missing scopes');
		}
		return dispatch(
			getAccountToken({ email, password, scopes, cookieType, deviceId: getDeviceId() }, {}, { remember })
		).then(action => onSignIn(state, dispatch, action, redirectPath));
	};
}

function getProfileData(targetProfile, dispatch, getStore, action): any {
	return (
		dispatch(getProfile())
			// for some reasons on Edge broswer getProfile returns failed promise in get profile success case,
			// I put catch function for unblocking the flow in case it failed but we have profile
			.then(
				() => dispatch(hardRefresh()),
				() => {
					const { profile } = getStore();
					if (profile && profile.info) {
						return dispatch(hardRefresh());
					}
				}
			)
			.then(() => dispatch(selectProfile(targetProfile.id)))
			.then(() => {
				if (targetProfile.languageCode) {
					return dispatch(updateLocale(targetProfile.languageCode));
				}
				return Promise.resolve();
			})
			.then(() => dispatch(getReminders(undefined, { reminderOffsetMinutes: retrieveReminderOffset(getStore()) })))
			.then(() => (action ? action : Promise.resolve()))
			.catch(warning)
	);
}

function onSignIn(store: state.Root, dispatch, action: Action<any>, redirectPath) {
	if (action.error) throw action.payload;
	dispatch(removeAnonymousProfile());
	dispatch(searchClear());
	dispatch({ type: SIGN_IN });
	return dispatch(registerBrowser()).then(res => {
		const isDeviceLimitReached = res.payload.message && res.payload.message.includes(DEVICE_LIMIT_REACHED_ERROR_MSG);
		if (res.error && isDeviceLimitReached) {
			setLocalStorageItem(DEVICE_LIMIT_REACHED, true);
		} else if (getLocalStorageItem(DEVICE_LIMIT_REACHED)) {
			removeLocalStorageItem(DEVICE_LIMIT_REACHED);
		}

		const isNewAccount = action.payload[0].accountCreated;
		const bookmark = getItem(PROMISED_BOOKMARK_KEY);
		return (
			dispatch(getAccount())
				.then((action: Action<api.Account>) => {
					if (!action || (action && action.error)) {
						return Promise.reject(action);
					}
					return Promise.all([
						action,
						dispatch(getProfile()),
						dispatch(getReminders(undefined, { reminderOffsetMinutes: retrieveReminderOffset(store) }))
					]);
				})
				.then(
					actions => {
						const profileAction = actions.find(action => action.type === GET_PROFILE);
						const profile =
							profileAction && !profileAction.error
								? (profileAction.payload as api.ProfileSummary)
								: extractProfileFromAccount(actions.find(action => action.type === GET_ACCOUNT), dispatch);

						if (!profile) {
							Promise.reject(profileAction);
						}

						const recommendationSettings = get(profile, 'recommendationSettings');
						if (typeof recommendationSettings === 'undefined' && isNewAccount) {
							const coldStartPathMatch = redirectPath.match(/\?coldStartPath=(.+)/);
							if (coldStartPathMatch) {
								const coldStartPath = coldStartPathMatch[1];
								redirectPath = decodeURIComponent(coldStartPath);
							}
						} else {
							redirectPath = redirectPath
								.replace(/([&?])coldStartPath=[^&]*/, '$1') // Replace coldStartPath
								.replace(/&$/, '') // Remove trailing '&'
								.replace(/\?$/, ''); // Remove trailing '?' if it's at the end
						}

						if (profile.languageCode) {
							dispatch(updateLocale(profile.languageCode));
						}

						bookmark && dispatch(toggleBookmark(bookmark, true));

						// retry api/profile in 5 seconds, account->profile does not have "watched" information , will need it later
						profileAction.error && setTimeout(dispatch(getProfile()), RETRY_PROFILE_SECONDS);

						const reminderAction = actions.find(action => action.type === GET_REMINDERS);
						const reminderData = getReminderData();
						if (reminderData) {
							dispatch(updateReminders(reminderAction, reminderData));
						}
						removeItem(SELECTED_LANGUAGE);

						return dispatch(clearAnonymousToken());
					},
					e => Promise.reject(e)
				)
				// for some reasons on Edge broswer getProfile returns failed promise in success case, I put catch function for unblocking the flow
				.then(
					() => dispatch(hardRefresh(redirectPath)),
					e => (e && e.error ? Promise.reject(e) : dispatch(hardRefresh(redirectPath)))
				)
				.then(() => action, e => Promise.reject(e && e.payload))
		);
	});
}

export function autoSignIn(justRegistered?: boolean): ThunkAction<Promise<void>, state.Root, void> {
	return async (dispatch: Dispatch<any>, getState: () => state.Root): Promise<void> => {
		const session: state.Session = getState().session;
		// don't even attempt to auto sign in of we don't have the correct token.
		if (!hasToken(session.tokens, 'UserAccount', 'Catalog')) {
			if (!process.env.CLIENT_MC_SSO_SESSION_SHARING_JS) {
				dispatch(clearSessionContentFilters());
				dispatch(signInAsAnonymous());
				return;
			}

			return dispatch(ssoPortalSignIn()).then(success => {
				if (success) return;

				// If the server thought we had some session content filters, reset them now.
				dispatch(clearSessionContentFilters());
				dispatch(signInAsAnonymous());
			});
		}

		const bookmark = justRegistered && getItem(PROMISED_BOOKMARK_KEY);
		if (justRegistered) {
			dispatch(clearCache());
			dispatch(searchClear());
		}

		dispatch(removeAnonymousProfile());
		return dispatch(getAccount())
			.then(action => {
				// if auto-login fails then sign out silently
				if (action.error) {
					return dispatch(signOut(undefined, true, true));
				}
				return Promise.all([
					action,
					dispatch(getProfile()),
					dispatch(getReminders(undefined, { reminderOffsetMinutes: retrieveReminderOffset(getState()) }))
				]);
			})
			.then(
				actions => {
					const profileAction = actions.find(action => action.type === GET_PROFILE);
					const profile =
						profileAction && !profileAction.error
							? (profileAction.payload as api.ProfileSummary)
							: extractProfileFromAccount(actions.find(action => action.type === GET_ACCOUNT), dispatch);

					if (!profile) {
						Promise.reject(profileAction);
					}
					if (profile.languageCode) {
						dispatch(updateLocale(profile.languageCode));
					}

					bookmark && dispatch(toggleBookmark(bookmark, true));

					// retry api/profile in 5 seconds, account->profile does not have "watched" information , will need it later
					profileAction.error && setTimeout(dispatch(getProfile()), RETRY_PROFILE_SECONDS);

					const reminderAction = actions.find(action => action.type === GET_REMINDERS);
					const reminderData = getReminderData();
					if (reminderData) {
						dispatch(updateReminders(reminderAction, reminderData));
					}

					return dispatch(clearAnonymousToken());
				},
				e => Promise.reject(e)
			)
			.catch(() => {
				return dispatch(signOut(undefined, true, true));
			});
	};
}

export function ssoPortalSignIn(): any {
	return dispatch => {
		return new Promise((resolve, reject) => {
			const SetPortalSessionUid = get(window, 'SetPortalSessionUid');
			const PortalSignin = get(window, 'SetPortalSessionUid');
			if (!SetPortalSessionUid || !PortalSignin) {
				return reject();
			}
			SetPortalSessionUid(content => {
				if (!content) {
					return reject();
				}
				trySharedSession(content, getDeviceId())
					.then(session => {
						if (session && session.profile) {
							const sessionID = get(session, 'profile.session_id');
							PortalSignin(sessionID);
							const token = get(session, 'token');
							const options = getSingleSignOnOptions();
							dispatch(
								singleSignOnAnonymous({
									...options,
									token
								})
							);
							resolve(true);
						} else {
							reject();
						}
					})
					.catch(e => reject(e));
			});
		}).catch(e => Promise.resolve(false));
	};
}

function extractProfileFromAccount(action: Action<any>, dispatch) {
	if (!action) return;

	const account = action.payload as api.Account;
	if (account.profiles && account.profiles.length) {
		const profile = account.profiles[0];
		dispatch({
			type: GET_PROFILE,
			payload: profile,
			error: false,
			meta: action.meta
		});
		return profile;
	}
}

export function handleUnauthorizedError(
	originalResponse: any,
	refreshResponse?: any
): ThunkAction<Promise<void>, state.Root, void> {
	return (dispatch: Dispatch<any>, getState: () => state.Root) => {
		const { account, profile, app } = getState();
		const status = get(originalResponse, 'status');
		if (status !== UNAUTHORIZED_ERROR && (!isSignedIn(account) || !profile.info)) {
			// User is not fully signed in
			return Promise.resolve();
		}
		const redirectPath = getPathByKey(signinPageKey, app.config);
		if (status === UNAUTHORIZED_ERROR) {
			const code = get(originalResponse, 'code');
			let alertComponentProps = undefined;
			switch (code) {
				case INVALID_ACCESS_TOKEN:
					const refreshCode = get(refreshResponse, 'code');
					if (refreshCode === INVALID_USER_ACCOUNT_DELETED) {
						alertComponentProps = alertModal(
							'@{me_connect_account_deleted_description|Sign in to watch for free. Please create a new meconnect account.}',
							'@{me_connect_account_deleted}'
						);
					} else if (refreshCode === INVALID_ACCESS_TOKEN) {
						alertComponentProps = alertModal('@{error_dialog_device_removed_description}', undefined);
					}
					break;
				case INVALID_USER_CHANGED_PASSWORD:
					alertComponentProps = alertModal(
						'@{error_dialog_password_updated_description}',
						'@{error_dialog_password_updated|Password Updated}'
					);
					break;
				default:
			}
			if (alertComponentProps) {
				return new Promise(resolve => {
					dispatch(
						OpenModal({
							id: MEPASS_SIGNOUT_ALERT_MODAL,
							type: ModalTypes.MEPASS_DIALOG,
							componentProps: alertComponentProps,
							onClose: () => {
								dispatch(hardRefresh(redirectPath));
								resolve();
							},
							disableAutoClose: true
						})
					);
					dispatch(signOut(redirectPath, true, true, true));
				});
			}
		}
		return dispatch(signOut(redirectPath, false, true, true));
	};
}

function signInAsAnonymous() {
	return async (dispatch, getState) => {
		const session: state.Session = getState().session;
		if (!hasToken(session.tokens, TokenTypes.Anonymous, 'Catalog')) {
			await dispatch(
				getAnonymousToken({
					cookieType: 'Session',
					deviceId: getDeviceId()
				})
			);
		}

		dispatch(getProfileAnonymous());
		await dispatch(getWatchedAnonymous());
	};
}

export function switchProfile(targetProfile: api.ProfileSummary, pin?: string, isInSigninProcess = false): any {
	return (dispatch, getStore: () => state.Root) => {
		const { profile, account } = getStore();
		const primaryProfileId = get(account, 'info.primaryProfileId');
		const emptyProfile = profile && (!profile.info || !Object.keys(profile.info).length);
		const profileId = get(profile, 'info.id');
		const switchAfterRegistration =
			profile && emptyProfile && primaryProfileId === targetProfile.id && targetProfile.isRestricted;
		const switchAfterPageRefresh =
			profileId === targetProfile.id && profileId === primaryProfileId && targetProfile.isRestricted;

		if (profile && profile.info && !profile.info.isRestricted && profileId === targetProfile.id) {
			// We're already on the profile being switched to so nothing else to do
			dispatch(selectProfile(targetProfile.id));
			return Promise.resolve();
		}

		if (switchAfterRegistration || switchAfterPageRefresh) {
			return getProfileData(targetProfile, dispatch, getStore, undefined);
		}

		return Promise.resolve();
		// MEDTOG-10835 Disabling Profile switching
		/*
		const remember = session.remember;
		const cookieType: api.CookieType = remember ? 'Persistent' : 'Session';
		return dispatch(
			getProfileToken({ profileId: targetProfile.id, pin, scopes: ['Catalog'], cookieType }, {}, { remember })
		).then(action => {
			if (_TV_ && isInSigninProcess) {
				const prompt = createPrompt('signin_suc', ['Catalog']);
				dispatch({ type: REPLACE_PROMPTS, payload: prompt });
			}

			if (action.error) throw action.payload;

			return getProfileData(targetProfile, dispatch, getStore, action);
		});
		*/
	};
}

export function selectProfile(profileId: string) {
	return { type: SELECT_PROFILE, payload: profileId };
}

export function unselectProfile() {
	return { type: UNSELECT_PROFILE };
}

export function requestToken(scopes: TokenScope[], password?: string, pin?: string, type?: TokenType): any {
	return (dispatch, getStore) => {
		const { account, profile, session } = getStore();
		const { remember } = session;
		const cookieType: api.CookieType = remember ? 'Persistent' : 'Session';
		const deviceId = getDeviceId();
		if (!account.info || !profile.info) {
			return Promise.reject('Not Signed In');
		}
		if (type === 'UserProfile') {
			return dispatch(getProfileToken({ profileId: profile.info.id, scopes, cookieType }, {}, { remember }));
		}

		return dispatch(
			getAccountToken(
				{
					email: account.info.email,
					password,
					scopes,
					cookieType,
					deviceId
				},
				{},
				{ remember }
			)
		);
	};
}

export function requestOTPToken(
	body: api.SettingsTokenRequest,
	options?: authorization.CreateSettingsTokenOptions,
	info?: any
): any {
	return (dispatch, getStore) => {
		const { account, profile } = getStore();
		if (!account.info || !profile.info) {
			return Promise.reject('Not Signed In');
		}

		return dispatch(createSettingsToken(body, options, info));
	};
}

/**
 * Refresh an authenticated session
 */
export function refreshSessionToken(): any {
	return (dispatch, getStore) => {
		const { session } = getStore();
		const userAccountToken = findToken(session.tokens, 'UserAccount', 'Catalog');
		const cookieType: api.CookieType = session.remember ? 'Persistent' : 'Session';
		return dispatch(refreshToken({ token: userAccountToken.value, cookieType }));
	};
}

export function isPlaybackTokenExpired(): any {
	return (dispatch, getStore) => {
		const sessionTokens = get(getStore(), 'session.tokens');
		if (!sessionTokens || !sessionTokens.length) return;

		const playbackToken = getPlaybackToken(sessionTokens);
		if (!playbackToken) return;

		const isExpired = playbackToken.expirationDate.getTime() < new Date().getTime();
		if (isExpired) {
			const tokens = sessionTokens.filter((token, index) => token !== playbackToken);
			return dispatch({ type: CLEAR_PLAYBACK_TOKEN, payload: tokens });
		}
	};
}

/**
 * Remove the playback token from session
 */
export function clearPlaybackToken(): any {
	return (dispatch, getStore) => {
		const sessionTokens = get(getStore(), 'session.tokens');
		if (!sessionTokens || !sessionTokens.length) return;

		const playbackToken = getPlaybackToken(sessionTokens);
		const tokens = playbackToken ? sessionTokens.filter((token, index) => token !== playbackToken) : sessionTokens;
		return dispatch({ type: CLEAR_PLAYBACK_TOKEN, payload: tokens });
	};
}

/**
 * Remove the anonymous token from session
 */
export function clearAnonymousToken(): any {
	return (dispatch, getStore) => {
		const sessionTokens = get(getStore(), 'session.tokens');
		if (!sessionTokens || !sessionTokens.length) return;

		return dispatch({ type: CLEAR_ANONYMOUS_TOKEN });
	};
}

/**
 * Remove the sso encypted token from session
 */
export function clearSSOEncToken(): any {
	return (dispatch, getStore) => {
		const ssoEncToken = get(getStore(), 'session.ssoTokenEnc');
		if (!ssoEncToken) return;

		return dispatch({ type: CLEAR_SSO_ENCRYPTED_TOKEN });
	};
}

/**
 * Reset content filters to those of an anonymous user.
 */
export function clearSessionContentFilters() {
	return dispatch => {
		dispatch({ type: CLEAR_SESSION_CONTENT_FILTERS });
		return sessionSignOut();
	};
}

/**
 * Clear cookie content filters that have been set by Rocket
 */
export function clearCookies() {
	return dispatch => sessionSignOut();
}

/**
 * End a user's authenticated session.
 *
 * @param redirectPath the optional redirect path to navigate to on successful sign out.
 * @param silent if true then no refresh of the page will occur after sign out. Defaults to false.
 * @param appSignOut
 */
export function signOut(redirectPath?: string, silent = false, appSignOut = false, unauthorizedError = false): any {
	return dispatch => {
		const PortalSignOut = get(window, 'PortalSignOut');

		if (getItem(FAV_TEAM_SELECTED_ID)) {
			removeItem(FAV_TEAM_SELECTED_ID);
		}
		if (getLocalStorageItem(DEVICE_LIMIT_REACHED)) {
			removeLocalStorageItem(DEVICE_LIMIT_REACHED);
		}
		if (getItem(SHOW_MSG_TEAM_ALREADY_SELECTED)) {
			removeItem(SHOW_MSG_TEAM_ALREADY_SELECTED);
		}

		if (PortalSignOut) {
			PortalSignOut();
		}
		dispatch(searchClear());
		const deregisterBrowserPromise = !unauthorizedError
			? dispatch(deregisterBrowser())
					// Device de-registration might fails (ex: token expired)
					// but sign-out should not fail
					.catch(() => {})
			: Promise.resolve();

		return deregisterBrowserPromise
			.then(() => dispatch(clearSessionContentFilters()))
			.then(() => {
				dispatch({ type: SIGN_OUT, payload: appSignOut });
				setLoginSource(Providers.NA);

				removeItem(SELECTED_LANGUAGE);

				if (getIsSocialAccount()) {
					removeIsSocialAccount();
				}
				if (!silent) {
					return dispatch(hardRefresh(redirectPath));
				}
			})
			.then(() => dispatch(signInAsAnonymous()))
			.then(() => dispatch(clearSSOEncToken()));
	};
}

export function initTokens(tokens: api.AccessToken[]) {
	return { type: INIT_TOKENS, payload: tokens };
}

function registerBrowser() {
	return dispatch =>
		dispatch(
			registerDevice({
				brandId: getBrandID(),
				id: getDeviceId(),
				name: `Web ${getBrowserName()}`
			})
		);
}

function deregisterBrowser() {
	return dispatch => {
		const deviceId = getDeviceId();
		return dispatch(deregisterDevice(deviceId));
	};
}

// REDUCERS

const initState: state.Session = {
	tokens: [],
	remember: false,
	filters: {}
};

const emptyState: state.Session = {
	tokens: [],
	filters: {}
};

export default function reduceSession(state: state.Session = initState, action: Action<any>): state.Session {
	if (action.error && action.type !== REPLACE_PROMPTS) return reduceError(state, action);

	switch (action.type) {
		case INIT_CLIENT_STATE:
			return reduceInitClientState(state, action);
		case PROMPT_SIGN_IN:
		case PROMPT_PASSWORD:
		case PROMPT_PIN:
		case ADD_PROMPT:
		case REPLACE_PROMPTS:
		case CANCEL_PROMPT:
		case PAGE_CHANGE:
			return reducePrompts(state, action);
		case REFRESH_TOKEN_START:
			return copy(state, { refreshInProgress: true });
		case INIT_TOKENS:
		case GET_ACCOUNT_TOKEN:
		case GET_ACCOUNT_TOKEN_BY_CODE:
		case GET_PROFILE_TOKEN:
		case SINGLE_SIGN_ON:
		case SINGLE_SIGN_ON_ANONYMOUS:
		case CREATE_SETTINGS_TOKEN:
		case REFRESH_TOKEN:
		case REGISTER:
		case REGISTER_ANONYMOUS:
		case CREATE_PLAYBACK_TOKEN:
		case CHECK_ACCOUNT_PW:
		case GET_ANONYMOUS_TOKEN:
			return reduceTokens(state, action);
		case SELECT_PROFILE:
			return copy(state, { profileSelected: true, showLoading: false });
		case UNSELECT_PROFILE:
		case SIGN_IN:
			return copy(state, { profileSelected: false });
		case SIGN_OUT:
			return copy(emptyState);
		case GET_PROFILE_TOKEN_START:
			return copy(state, { showLoading: true });
		case CLEAR_PLAYBACK_TOKEN:
			return reduceClearPlaybackToken(state, action);
		case CLEAR_ANONYMOUS_TOKEN: {
			return reduceClearAnonymousToken(state);
		}
		case CLEAR_SSO_ENCRYPTED_TOKEN: {
			return reduceSSOEncryptedToken(state);
		}
		case SET_SESSION_FILTER: {
			return reduceSessionFilters(state, action.payload);
		}
		case SET_ITEM_LISTING_ATTRIBUTES: {
			return reduceItemListingAttributes(state, action.payload);
		}
		case MC_SSO_ENCRYPT: {
			const { token: ssoTokenEnc } = action.payload;
			return copy(state, { ssoTokenEnc, ssoTokenEncError: false });
		}
		case MC_SSO_ENCRYPT_FAILED:
			return copy(state, { ssoTokenEncError: true });
	}
	return state;
}

function reduceInitClientState(state: state.Session, action: Action<InitialClientState>) {
	const { rememberMe, profileSelected } = action.payload;
	state = copy(state);
	state.profileSelected = profileSelected;
	if (rememberMe !== undefined) state.remember = rememberMe;
	return state;
}

function reduceError(state: state.Session, action: Action<any>): state.Session {
	switch (action.type) {
		case GET_ACCOUNT_TOKEN:
		case GET_ACCOUNT_TOKEN_BY_CODE:
		case GET_PROFILE_TOKEN:
		case SINGLE_SIGN_ON:
		case SINGLE_SIGN_ON_ANONYMOUS:
			return updateActivePrompt(state, { error: action.payload });
	}
	return state;
}

/**
 * Place new prompts at the back of the queue to ensure we don't interrupt input from a user.
 * We don't worry about duplicate prompt types being enqueued as requested scopes may be different.
 * We do prune prompts each time new token(s) arrive that cover the scope(s) a prompt was after.
 */
function reducePrompts(state: state.Session, action: Action<AuthPrompt>): state.Session {
	switch (action.type) {
		case PROMPT_SIGN_IN:
		case PROMPT_PASSWORD:
		case PROMPT_PIN:
		case ADD_PROMPT:
			const authPrompts = [action.payload];
			return copy(state, { authPrompts });
		case REPLACE_PROMPTS:
			return copy(state, { authPrompts: [action.payload] });
		case CANCEL_PROMPT:
			break;
		case PAGE_CHANGE:
			break;
	}
	return state;
}

function reduceClearPlaybackToken(state: state.Session, action: Action<any>): state.Session {
	return {
		...state,
		tokens: action.payload
	};
}

function reduceClearAnonymousToken(state: state.Session): state.Session {
	const tokens = state.tokens.filter(token => token.type !== TokenTypes.Anonymous);
	return { ...state, tokens };
}

function reduceSSOEncryptedToken(state: state.Session): state.Session {
	return { ...state, ssoTokenEnc: undefined, ssoTokenEncError: undefined };
}

function reduceTokens(state: state.Session, action: Action<any>): state.Session {
	switch (action.type) {
		case INIT_TOKENS:
			return copy(state, { tokens: action.payload });
		case REFRESH_TOKEN:
		case GET_ACCOUNT_TOKEN:
		case GET_ACCOUNT_TOKEN_BY_CODE:
		case GET_PROFILE_TOKEN:
		case REGISTER:
		case REGISTER_ANONYMOUS:
		case SINGLE_SIGN_ON:
		case SINGLE_SIGN_ON_ANONYMOUS:
		case CREATE_SETTINGS_TOKEN:
		case CREATE_PLAYBACK_TOKEN:
		case GET_ANONYMOUS_TOKEN:
			const rawTokens = Array.isArray(action.payload) ? action.payload : [action.payload];
			const newTokens = formatTokens(rawTokens);
			const tokens = pruneTokens(state.tokens.concat(newTokens));

			const refreshInProgress = state.refreshInProgress && action.type !== REFRESH_TOKEN;
			let newState = copy(state, { tokens, refreshInProgress });

			if (action.type === GET_ACCOUNT_TOKEN_BY_CODE) {
				newState = copy(newState, { showLoading: true });
			}

			if (action.meta && action.meta.info && action.meta.info.remember !== undefined) {
				newState.remember = action.meta.info.remember;
			}

			if (newTokens.length > 0) {
				if (newTokens[0].scope === 'Settings') {
					return newState;
				}
			}

			return prunePrompts(newState, newTokens.filter(token => newTokens.indexOf(token) < 0));
		default:
			return state;
	}
}

/**
 * Remove any auth prompts no longer required given the updated set of tokens.
 * refusedTokens are new tokens that are not saved in new state for some reasons
 */
function prunePrompts(state: state.Session, refusedTokens: api.AccessToken[]): state.Session {
	return state;
}

export function createPrompt(
	type: PromptType,
	scopes: TokenScope[],
	resolve?: (data?: any) => any,
	reject?: (data?: any) => any,
	tokenType?: TokenType,
	id?: string
): AuthPrompt {
	const prompt: AuthPrompt = {
		id: id || genId(),
		type,
		body: scopes,
		tokenType
	};
	if (resolve) prompt.resolve = resolve;
	if (reject) prompt.reject = reject;
	return prompt;
}

function updateActivePrompt(state: state.Session, update: any): state.Session {
	return state;
}

export function getPlaybackToken(sessionTokens: api.AccessToken[]): api.AccessToken {
	return findToken(sessionTokens, 'UserProfile', 'Playback');
}

export function isAnonymousUser(state: state.Root): boolean {
	const tokens = get(state, 'session.tokens');
	if (!(tokens && tokens.length)) return true;

	return !!tokens.find(token => token.type === TokenTypes.Anonymous);
}

function updateReminders(reminderAction, reminderData) {
	return dispatch => {
		const reminders = get(reminderAction, 'payload');
		const time = get(reminderAction, 'meta.info.reminderOffsetMinutes');
		const { channel, scheduleItem } = reminderData;
		removeReminderData();
		if (!getReminder(scheduleItem, reminders) && canPlay(channel)) {
			return dispatch(addReminder({ customId: scheduleItem.customId })).then(() =>
				dispatch(ShowPassiveNotification(getReminderNotificationContent(time)))
			);
		}
	};
}

function reduceSessionFilters(state: state.Session, payload) {
	let updatedFilters = {
		...state.filters[payload.filterId],
		...payload.filter
	};
	return {
		...state,
		filters: {
			...state.filters,
			[payload.filterId]: updatedFilters
		}
	};
}

export function setSessionFilter(payload): any {
	return dispatch => {
		dispatch({
			type: SET_SESSION_FILTER,
			payload
		});
	};
}

export function setItemListingAttributes(payload): any {
	return dispatch => {
		dispatch({
			type: SET_ITEM_LISTING_ATTRIBUTES,
			payload
		});
	};
}

function reduceItemListingAttributes(state: state.Session, payload) {
	const { itemListingTracking = {} } = state;
	itemListingTracking[payload.id] = payload.continuousScrollEpisodeCount;
	return {
		...state,
		itemListingTracking
	};
}
