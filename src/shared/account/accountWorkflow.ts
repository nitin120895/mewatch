import {
	GET_ACCOUNT,
	UPDATE_ACCOUNT,
	DELETE_PROFILE_WITH_ID,
	GET_PAYMENT_METHODS,
	GET_PURCHASES_EXTENDED,
	GET_PURCHASES_EXTENDED_START,
	DEREGISTER_DEVICE,
	GET_DEVICES,
	DEREGISTER_DEVICE_START,
	GET_DEVICES_START,
	getAccount,
	GET_SUBSCRIPTION_DETAILS,
	GET_SUBSCRIPTION_DETAILS_START,
	DISABLE_PROFILE_PLAYBACK_GUARD,
	MAKE_PURCHASE,
	CHANGE_CREDIT_CARD
} from '../service/action/account';
import { SIGN_OUT } from './sessionWorkflow';
import { hardRefresh } from '../app/appWorkflow';
import { copy, get } from '../util/objects';
import { setSingleUseKey } from './authorizer';
import { resetPassword as resetAccountPassword, verifyEmail as verifyAccountEmail } from '../service/support';
import { deregisterDevice, getDevices } from 'shared/service/action/account';
import { getProfile } from 'shared/service/action/profile';
import {
	CHANGE_PASSWORD_START,
	CHANGE_PASSWORD,
	CHANGE_PIN_START,
	CHANGE_PIN,
	UPDATE_PROFILE_WITH_ID,
	CREATE_PROFILE,
	UPDATE_ACCOUNT_START,
	REQUEST_EMAIL_VERIFICATION_START,
	REQUEST_EMAIL_VERIFICATION,
	updateAccount,
	authorizeDevice as authorizeAccountDevice,
	getPaymentMethods as fetchPaymentMethods,
	createProfile,
	updateProfileWithId,
	deleteProfileWithId,
	changePin as changeAccountPin,
	changePassword as changeAccountPassword,
	getSubscriptionDetails as getAccountSubscriptionDetails
} from 'shared/service/action/account';
import { analyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { refreshSessionToken, requestToken } from './sessionWorkflow';
import { GET_ACCOUNT_TOKEN, GET_ACCOUNT_TOKEN_START, getAccountToken } from '../service/action/authorization';
import { getDeviceId } from 'shared/util/deviceUtil';
import { pick } from 'shared/util/objects';
import { getPaymentReturnData, isInMantinenceMode } from 'toggle/responsive/util/paymentUtil';
import { setItem } from '../util/localStorage';
import { LAST_PAYMENT_RETURN_DATA_NAME } from 'toggle/responsive/pageEntry/subscription/subscriptionsUtils';

export const SET_PAYMENT_METHODS = 'account/SET_PAYMENT_METHODS'; // @deprecated
export const SELECTED_PRICE_PLAN = 'account/SELECTED_PRICE_PLAN';
export const SET_ACCOUNT_SEGMENTS = 'account/SET_SEGMENTS';
export const CLEAR_ERROR_STATE = 'account/CLEAR_ERROR_STATE';

export const REGISTRATION_START = 'account/REGISTRATION_START';
export const REGISTRATION_COMPLETE = 'account/REGISTRATION_COMPLETE';
export const REGISTRATION_CANCEL = 'account/REGISTRATION_CANCEL';
export const CHECK_ACCOUNT_PW = 'account/CHECK_ACCOUNT_PW';
export const SET_RECOMMENDATION_SETTINGS = 'account/UPDATE_RECOMMENDATION_SETTINGS';

export const SSO_FORM_MOUNTED = 'account/SSO_FORM_MOUNTED';

export const MAINTENANCE_STATUS = 'account/MAINTENANCE_STATUS';
export const SUBSCRIPTION_PROMO_CODE = 'account/SUBSCRIPTION_PROMO_CODE';
export const SUBSCRIPTION_PAYMENT_METHOD = 'account/SUBSCRIPTION_PAYMENT_METHOD';

const ENTITLEMENT_UPDATE_MAX_RETRY = parseInt(process.env.CLIENT_ENTITLEMENT_UPDATE_MAX_RETRY || 120);
const ENTITLEMENT_UPDATE_RETRY_INTERVAL = parseInt(process.env.CLIENT_ENTITLEMENT_UPDATE_RETRY_INTERVAL || 5000);

/**
 * Token should be obtained from query parameter of link
 * back to web app sent to the account holders email address.
 */
export function resetPassword(email: string, password: string, token: string) {
	return dispatch => {
		setSingleUseKey('resetPasswordAuth', token);
		return resetAccountPassword({ password });
	};
}

/**
 * Token should be obtained from query parameter of link
 * back to web app sent to the account holders email address.
 */
export function verifyEmail(token: string) {
	return dispatch => {
		setSingleUseKey('verifyEmailAuth', token);
		return verifyAccountEmail();
	};
}

/**
 * Authenticate and change your account password or pin.
 *
 * Token security should be transparent from API calls, however in this case we expose a way of
 * bypassing an authentication prompt if we already have the current password available from an
 * inline input. We therefore request the required token before making the intended request.
 *
 * @param changeMethod An API call for changing the pin or password e.g. `changeAccountPassword` or `changeAccountPin`.
 * @param currentPassword The existing password used to obtain the token (if/when necessary).
 * @param newPassword The new password to save.
 */
function authThenChangePassword(
	changeMethod: (body: any, options?: any, info?: any) => any = changeAccountPassword,
	currentPassword: string,
	newPassword: string
) {
	return dispatch => {
		// In this case we always want to enforce the validity of the provided current password regardless
		// of whether we already have a settings token available.
		// This is specific to the usecase of changing a password or pin.
		return dispatch(requestToken(['Settings'], currentPassword)).then(res => {
			if (res.error) return res;
			const key = changeMethod === changeAccountPin ? 'pin' : 'password';
			return dispatch(changeMethod({ [key]: newPassword }));
		});
	};
}

/**
 * Validate the current password and set the new password.
 */
export function changePassword(currentPassword: string, newPassword: string) {
	return authThenChangePassword(changeAccountPassword, currentPassword, newPassword);
}

/**
 * Validate the current password and set the new pin.
 */
export function changePin(currentPassword: string, newPin: string) {
	return authThenChangePassword(changeAccountPin, currentPassword, newPin);
}

/**
 * Clear account update error state
 */
export function clearAccountError() {
	return { type: CLEAR_ERROR_STATE };
}

/**
 * Set an initial account pin.
 */
export function createPin(body: api.ChangePinRequest, options?: any, info?: any) {
	return dispatch => dispatch(changeAccountPin(body, options, info));
}

/**
 * Update account segments.
 */
export function setSegments(segments) {
	return dispatch => {
		return dispatch(updateAccount(segments)).then(res => {
			dispatch({ type: SET_ACCOUNT_SEGMENTS, payload: segments });
			dispatch(refreshSessionToken());
			dispatch(hardRefresh());
			return res;
		});
	};
}

export function setRecommendationSettings(settings) {
	return dispatch => {
		dispatch({ type: SET_RECOMMENDATION_SETTINGS, payload: settings });
		dispatch(getProfile());
	};
}

/**
 * Update minRatingPlaybackGuard.
 */
export function setMinRatingPlaybackGuard(minRatingPlaybackGuard: string) {
	return dispatch => {
		return dispatch(updateAccount({}, undefined, { minRatingPlaybackGuard })).then(res => {
			return dispatch(getAccount());
		});
	};
}

/**
 * Get Payment Methods
 *
 * @deprecated
 * Please use the following directly instead:
 * import { GET_PAYMENT_METHODS, getPaymentMethods } from 'shared/service/action/account';
 */
export function getPaymentMethods() {
	return dispatch => {
		return dispatch(fetchPaymentMethods()).then(({ payload }) => {
			return dispatch({ type: SET_PAYMENT_METHODS, payload });
		});
	};
}

/**
 * Update Profile with Id
 */
export function updateProfile(profile) {
	return dispatch => {
		const { id, ...profileSubSet } = profile;
		return dispatch(updateProfileWithId(id, profileSubSet, {}, profile));
	};
}

/**
 * Create new Profile
 */
export function newProfile(profile) {
	return dispatch => dispatch(createProfile(profile));
}

export function authorizeDevice(code: string, name: string) {
	return dispatch => dispatch(authorizeAccountDevice({ code, name }));
}

export function deleteProfile(id: string) {
	return deleteProfileWithId(id, undefined, { id });
}

/**
 * Registration
 */
export function registrationStart(plan?: api.Plan) {
	return dispatch => dispatch({ type: REGISTRATION_START, payload: plan });
}
// Even though plan is not used in our custom app, we still need to keep it
// as an optional param because reference app is using it. Removal from this function
// will cause build errors.
export function registrationComplete(plan?: api.Plan, newsletters?: string[]) {
	return dispatch => dispatch({ type: REGISTRATION_COMPLETE, payload: { plan, newsletters } });
}
export function registrationCancel(plan?: api.Plan) {
	return dispatch => dispatch({ type: REGISTRATION_CANCEL, payload: plan });
}

/**
 * Device workflow
 */
export function removeDevice(id: string) {
	return dispatch => dispatch(deregisterDevice(id));
}

export function getAllDevices() {
	return dispatch => dispatch(getDevices());
}

export function checkAccountPassword(pw: string) {
	return (dispatch, getState) => {
		const account: state.Account = getState().account;
		return dispatch(
			getAccountToken({ email: account.info.email, scopes: ['Settings'], password: pw, deviceId: getDeviceId() })
		).then(actions => {
			return dispatch({ type: CHECK_ACCOUNT_PW, payload: actions.payload, error: actions.error });
		});
	};
}

export function getSubscriptionDetails() {
	return dispatch => dispatch(getAccountSubscriptionDetails());
}

export function ssoFormMounted(ssoFormMounted) {
	return dispatch => dispatch({ type: SSO_FORM_MOUNTED, payload: { ssoFormMounted } });
}

export function selectPricePlan(priceplan, group) {
	return dispatch => dispatch({ type: SELECTED_PRICE_PLAN, payload: { ...priceplan, group } });
}

export function subscriptionWithPromoDetail(promoCode, discountedPrice = undefined) {
	return dispatch => dispatch({ type: SUBSCRIPTION_PROMO_CODE, payload: { promoCode, discountedPrice } });
}

export function subscriptionPaymentMethod(paymentMethod) {
	return dispatch => dispatch({ type: SUBSCRIPTION_PAYMENT_METHOD, payload: { paymentMethod } });
}

// REDUCER
const initState: state.Account = {
	active: false,
	paymentData: {
		rememberCard: false,
		paymentMethods: []
	},
	sendingVerification: false,
	updating: false,
	updateError: false,
	purchasesLoaded: false,
	purchases: {
		items: []
	},
	deviceInfo: {
		maxRegistered: 0,
		devices: [],
		isLoaded: false
	},
	subscriptionDetails: undefined,
	selectedPricePlan: undefined
};

export default function reduceAccount(state: state.Account = initState, action: Action<any>): state.Account {
	switch (action.type) {
		case GET_ACCOUNT:
			return action.error ? state : copy(state, { info: action.payload, active: !!action.payload });
		case SET_ACCOUNT_SEGMENTS:
			return reduceSegment(state, action);
		case SIGN_OUT:
			return copy(initState);
		case CHANGE_PIN_START:
		case CHANGE_PASSWORD_START:
			return {
				...state,
				updating: true
			};
		case CHANGE_PIN:
			return {
				...state,
				updating: false,
				info: {
					...state.info,
					pinEnabled: true
				}
			};
		case CHANGE_PASSWORD:
			return {
				...state,
				updating: false
			};
		case UPDATE_PROFILE_WITH_ID:
			return reduceUpdateProfile(state, action);
		case DELETE_PROFILE_WITH_ID:
			return {
				...state,
				info: {
					...state.info,
					profiles: state.info.profiles.filter(profile => profile.id !== action.meta.info.id)
				}
			};
		case CREATE_PROFILE:
			return reduceNewProfile(state, action);
		case UPDATE_ACCOUNT_START:
			return { ...state, loading: true, updateError: false };
		case UPDATE_ACCOUNT:
			if (action.error) {
				return { ...state, loading: false, updateError: true };
			}

			const { info } = state;
			const infoToUpdate = get(action, 'meta.info');

			return {
				...state,
				info: {
					...info,
					...infoToUpdate
				},
				loading: false,
				updateError: false
			};
		case REQUEST_EMAIL_VERIFICATION_START:
			return {
				...state,
				sendingVerification: true
			};
		case REQUEST_EMAIL_VERIFICATION:
			return {
				...state,
				sendingVerification: false
			};
		case SET_PAYMENT_METHODS:
		case GET_PAYMENT_METHODS:
			return { ...state, paymentData: action.payload };
		case GET_PURCHASES_EXTENDED_START:
			return { ...state, purchasesLoaded: false };
		case SELECTED_PRICE_PLAN:
			return { ...state, selectedPricePlan: { ...action.payload } };
		case SUBSCRIPTION_PAYMENT_METHOD:
		case SUBSCRIPTION_PROMO_CODE:
			return { ...state, selectedPricePlan: { ...state.selectedPricePlan, ...action.payload } };
		case MAKE_PURCHASE:
		case CHANGE_CREDIT_CARD:
			return { ...state, adyenSession: { ...action.payload } };
		case MAINTENANCE_STATUS:
			const { maintenanceMode } = action.payload;
			return { ...state, maintenanceMode };
		case GET_PURCHASES_EXTENDED:
			return reducePurchases(state, action);
		case GET_ACCOUNT_TOKEN_START:
			return { ...state, updateError: false };
		case GET_ACCOUNT_TOKEN:
			if (action.error) {
				return { ...state, updateError: true };
			}
			return state;
		case CLEAR_ERROR_STATE:
			return { ...state, updateError: false };
		case GET_DEVICES_START:
		case DEREGISTER_DEVICE_START: {
			return { ...state, deviceInfo: { ...state.deviceInfo, isLoaded: false } };
		}
		case GET_DEVICES:
			const { devices, maxRegistered } = action.payload;
			return {
				...state,
				deviceInfo: {
					isLoaded: true,
					devices: devices,
					maxRegistered: maxRegistered
				}
			};
		case DEREGISTER_DEVICE:
			return { ...state, deviceInfo: { isLoaded: true, ...state.deviceInfo } };
		case GET_SUBSCRIPTION_DETAILS_START:
			return { ...state, subscriptionDetails: undefined };
		case GET_SUBSCRIPTION_DETAILS:
			return { ...state, subscriptionDetails: action.payload };
		case DISABLE_PROFILE_PLAYBACK_GUARD:
			return reduceDisablingPlaybackGuard(state, action);
		case SET_RECOMMENDATION_SETTINGS:
			return reduceRecommendationSettings(state, action);
		case SSO_FORM_MOUNTED:
			return {
				...state,
				...action.payload
			};
	}
	return state;
}

function reducePurchases(state: state.Account, action: Action<any>) {
	const isFirstPage = action.payload.paging.page === 1;
	let purchases;
	if (isFirstPage) {
		purchases = action.payload;
	} else {
		const items = [...state.purchases.items, ...action.payload.items];
		purchases = { ...action.payload, items };
	}
	return { ...state, purchases, purchasesLoaded: true };
}

function reduceRecommendationSettings(state, action) {
	const { info } = state;
	const { payload } = action;

	const profiles = info.profiles.map(profile => {
		return profile.id === payload.profileId
			? { ...profile, recommendationSettings: pick(payload, 'genreAliases', 'credits', 'languages') }
			: profile;
	});

	return {
		...state,
		info: {
			...info,
			profiles
		}
	};
}

function reduceNewProfile(state, action) {
	const { info } = state;
	const { payload } = action;
	if (action.error) {
		return {
			...state
		};
	}
	return {
		...state,
		info: {
			...info,
			profiles: [...info.profiles, payload]
		}
	};
}

function reduceDisablingPlaybackGuard(state, action) {
	const { info } = state;
	const updatedProfile = action.meta.info.updateProfileData;

	const profiles =
		info &&
		info.profiles.map(profile => {
			if (updatedProfile && updatedProfile.id === profile.id) {
				return {
					...updatedProfile
				};
			}
			return profile;
		});

	return {
		...state,
		info: {
			...info,
			profiles: action.error ? info.profiles : profiles
		}
	};
}

function reduceUpdateProfile(state, action) {
	const { info } = state;
	const updatedProfile = action.meta && action.meta.info ? action.meta.info : action.payload;

	const profiles =
		info &&
		info.profiles.map(profile => {
			if (updatedProfile && updatedProfile.id === profile.id) {
				// No response from server so merging subset
				if (!updatedProfile.minRatingPlaybackGuard && profile.minRatingPlaybackGuard) {
					delete profile.minRatingPlaybackGuard;
				}
				return {
					...profile,
					...updatedProfile
				};
			}
			return profile;
		});
	return {
		...state,
		info: {
			...info,
			profiles: action.error ? info.profiles : profiles
		}
	};
}

function reduceSegment(state: state.Account, action): state.Account {
	const info = copy(state.info, { segments: action.payload.segments });
	return copy(state, { info: info });
}

export function checkMaintenanceStatus(): any {
	return dispatch =>
		isInMantinenceMode().then(maintenanceMode => dispatch({ type: MAINTENANCE_STATUS, payload: { maintenanceMode } }));
}

export function accountHasEntitlement(account: api.Account, packageId) {
	const subscriptions = get(account, 'payload.subscriptions') || [];
	return subscriptions && subscriptions.some(sub => sub.planId === packageId);
}

let updateEntitlementRetry = 0;
export function updateEntitlements(packageId) {
	return dispatch => {
		if (updateEntitlementRetry < ENTITLEMENT_UPDATE_MAX_RETRY) {
			dispatch(getAccount()).then(res => {
				const hasEntitlement = accountHasEntitlement(res, packageId);
				const subscriptionDetail = get(res, 'payload.subscriptions').filter(sub => sub.planId === packageId);

				if (hasEntitlement) {
					if (subscriptionDetail.length > 0)
						dispatch(analyticsEvent(AnalyticsEventType.SUBSCRIPTION_SUCCESS, subscriptionDetail[0]));
					setItem(LAST_PAYMENT_RETURN_DATA_NAME, { ...getPaymentReturnData(), entitlementValidated: true });
				} else {
					window.setTimeout(() => dispatch(updateEntitlements(packageId)), ENTITLEMENT_UPDATE_RETRY_INTERVAL);
				}
			});
			updateEntitlementRetry++;
		}
	};
}
