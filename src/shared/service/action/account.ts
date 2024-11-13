/// <reference path="../types.ts"/>
/** @module action/account */
// Auto-generated, edits will be overwritten
import * as account from '../account';

export const GET_ACCOUNT_START = 's/account/GET_ACCOUNT_START';
export const GET_ACCOUNT = 's/account/GET_ACCOUNT';
export type GET_ACCOUNT = api.Account;

export function getAccount(options?: account.GetAccountOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_ACCOUNT_START, meta: { info } });
		return account.getAccount(options).then(response =>
			dispatch({
				type: GET_ACCOUNT,
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

export const UPDATE_ACCOUNT_START = 's/account/UPDATE_ACCOUNT_START';
export const UPDATE_ACCOUNT = 's/account/UPDATE_ACCOUNT';
export type UPDATE_ACCOUNT = any;

export function updateAccount(body: api.AccountUpdateRequest, options?: account.UpdateAccountOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: UPDATE_ACCOUNT_START, meta: { info } });
		return account.updateAccount(body, options).then(response =>
			dispatch({
				type: UPDATE_ACCOUNT,
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

export const GET_PAYMENT_METHODS_START = 's/account/GET_PAYMENT_METHODS_START';
export const GET_PAYMENT_METHODS = 's/account/GET_PAYMENT_METHODS';
export type GET_PAYMENT_METHODS = api.PaymentMethods;

export function getPaymentMethods(options?: account.GetPaymentMethodsOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_PAYMENT_METHODS_START, meta: { info } });
		return account.getPaymentMethods(options).then(response =>
			dispatch({
				type: GET_PAYMENT_METHODS,
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

export const CHANGE_CREDIT_CARD_START = 's/account/CHANGE_CREDIT_CARD_START';
export const CHANGE_CREDIT_CARD = 's/account/CHANGE_CREDIT_CARD';
export type CHANGE_CREDIT_CARD = api.ChangeCreditCardResult;

export function changeCreditCard(
	body: api.ChangeCreditCardRequest,
	options?: account.ChangeCreditCardOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: CHANGE_CREDIT_CARD_START, meta: { info } });
		return account.changeCreditCard(body, options).then(response =>
			dispatch({
				type: CHANGE_CREDIT_CARD,
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

export const DELETE_CREDIT_CARD_START = 's/account/DELETE_CREDIT_CARD_START';
export const DELETE_CREDIT_CARD = 's/account/DELETE_CREDIT_CARD';
export type DELETE_CREDIT_CARD = api.DeleteCreditCardResult;

export function deleteCreditCard(
	body: api.DeleteCreditCardRequest,
	options?: account.DeleteCreditCardOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: DELETE_CREDIT_CARD_START, meta: { info } });
		return account.deleteCreditCard(body, options).then(response =>
			dispatch({
				type: DELETE_CREDIT_CARD,
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

export const SET_REMEMBER_CARD_START = 's/account/SET_REMEMBER_CARD_START';
export const SET_REMEMBER_CARD = 's/account/SET_REMEMBER_CARD';
export type SET_REMEMBER_CARD = any;

export function setRememberCard(options?: account.SetRememberCardOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: SET_REMEMBER_CARD_START, meta: { info } });
		return account.setRememberCard(options).then(response =>
			dispatch({
				type: SET_REMEMBER_CARD,
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

export const DELETE_REMEMBER_CARD_START = 's/account/DELETE_REMEMBER_CARD_START';
export const DELETE_REMEMBER_CARD = 's/account/DELETE_REMEMBER_CARD';
export type DELETE_REMEMBER_CARD = any;

export function deleteRememberCard(options?: account.DeleteRememberCardOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: DELETE_REMEMBER_CARD_START, meta: { info } });
		return account.deleteRememberCard(options).then(response =>
			dispatch({
				type: DELETE_REMEMBER_CARD,
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

export const GET_PURCHASES_START = 's/account/GET_PURCHASES_START';
export const GET_PURCHASES = 's/account/GET_PURCHASES';
export type GET_PURCHASES = api.PurchaseItems;

export function getPurchases(options?: account.GetPurchasesOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_PURCHASES_START, meta: { info } });
		return account.getPurchases(options).then(response =>
			dispatch({
				type: GET_PURCHASES,
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

export const MAKE_PURCHASE_START = 's/account/MAKE_PURCHASE_START';
export const MAKE_PURCHASE = 's/account/MAKE_PURCHASE';
export type MAKE_PURCHASE = api.PurchaseResponse;

export function makePurchase(body: api.PurchaseRequest, options?: account.MakePurchaseOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: MAKE_PURCHASE_START, meta: { info } });
		return account.makePurchase(body, options).then(response =>
			dispatch({
				type: MAKE_PURCHASE,
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

export const GET_PURCHASES_EXTENDED_START = 's/account/GET_PURCHASES_EXTENDED_START';
export const GET_PURCHASES_EXTENDED = 's/account/GET_PURCHASES_EXTENDED';
export type GET_PURCHASES_EXTENDED = api.PurchaseItemsExtended;

export function getPurchasesExtended(options?: account.GetPurchasesExtendedOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_PURCHASES_EXTENDED_START, meta: { info } });
		return account.getPurchasesExtended(options).then(response =>
			dispatch({
				type: GET_PURCHASES_EXTENDED,
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

export const VALIDATE_RECEIPT_START = 's/account/VALIDATE_RECEIPT_START';
export const VALIDATE_RECEIPT = 's/account/VALIDATE_RECEIPT';
export type VALIDATE_RECEIPT = any;

export function validateReceipt(
	body: api.PurchaseReceiptRequest,
	options?: account.ValidateReceiptOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: VALIDATE_RECEIPT_START, meta: { info } });
		return account.validateReceipt(body, options).then(response =>
			dispatch({
				type: VALIDATE_RECEIPT,
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

export const VERIFY_PURCHASE_START = 's/account/VERIFY_PURCHASE_START';
export const VERIFY_PURCHASE = 's/account/VERIFY_PURCHASE';
export type VERIFY_PURCHASE = api.PurchaseVerifyResponse;

export function verifyPurchase(
	body: api.PurchaseVerifyRequest,
	options?: account.VerifyPurchaseOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: VERIFY_PURCHASE_START, meta: { info } });
		return account.verifyPurchase(body, options).then(response =>
			dispatch({
				type: VERIFY_PURCHASE,
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

export const GET_SUBSCRIPTION_DETAILS_START = 's/account/GET_SUBSCRIPTION_DETAILS_START';
export const GET_SUBSCRIPTION_DETAILS = 's/account/GET_SUBSCRIPTION_DETAILS';
export type GET_SUBSCRIPTION_DETAILS = api.SubscriptionDetail[];

export function getSubscriptionDetails(options?: account.GetSubscriptionDetailsOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_SUBSCRIPTION_DETAILS_START, meta: { info } });
		return account.getSubscriptionDetails(options).then(response =>
			dispatch({
				type: GET_SUBSCRIPTION_DETAILS,
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

export const GET_ACCOUNT_SUBSCRIPTION_PRICE_PLAN_PRICES_START =
	's/account/GET_ACCOUNT_SUBSCRIPTION_PRICE_PLAN_PRICES_START';
export const GET_ACCOUNT_SUBSCRIPTION_PRICE_PLAN_PRICES = 's/account/GET_ACCOUNT_SUBSCRIPTION_PRICE_PLAN_PRICES';
export type GET_ACCOUNT_SUBSCRIPTION_PRICE_PLAN_PRICES = api.PricePlanPrice[];

export function getAccountSubscriptionPricePlanPrices(
	pricePlanIds: string[],
	options?: account.GetAccountSubscriptionPricePlanPricesOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_ACCOUNT_SUBSCRIPTION_PRICE_PLAN_PRICES_START, meta: { info } });
		return account.getAccountSubscriptionPricePlanPrices(pricePlanIds, options).then(response =>
			dispatch({
				type: GET_ACCOUNT_SUBSCRIPTION_PRICE_PLAN_PRICES,
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

export const CANCEL_SUBSCRIPTION_START = 's/account/CANCEL_SUBSCRIPTION_START';
export const CANCEL_SUBSCRIPTION = 's/account/CANCEL_SUBSCRIPTION';
export type CANCEL_SUBSCRIPTION = any;

export function cancelSubscription(id: string, options?: account.CancelSubscriptionOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: CANCEL_SUBSCRIPTION_START, meta: { info } });
		return account.cancelSubscription(id, options).then(response =>
			dispatch({
				type: CANCEL_SUBSCRIPTION,
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

export const APPLY_PROMOCODE_START = 's/account/APPLY_PROMOCODE_START';
export const APPLY_PROMOCODE = 's/account/APPLY_PROMOCODE';
export type APPLY_PROMOCODE = api.VerifyPromoCodeResult;

export function applyPromocode(
	id: string,
	body: api.VerifyPromoCodeRequest,
	options?: account.ApplyPromocodeOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: APPLY_PROMOCODE_START, meta: { info } });
		return account.applyPromocode(id, body, options).then(response =>
			dispatch({
				type: APPLY_PROMOCODE,
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

export const REQUEST_COUNTRY_CODE_START = 's/account/REQUEST_COUNTRY_CODE_START';
export const REQUEST_COUNTRY_CODE = 's/account/REQUEST_COUNTRY_CODE';
export type REQUEST_COUNTRY_CODE = api.CountryCode;

export function requestCountryCode(info?: any): any {
	return dispatch => {
		dispatch({ type: REQUEST_COUNTRY_CODE_START, meta: { info } });
		return account.requestCountryCode().then(response =>
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

export const GET_DEVICES_START = 's/account/GET_DEVICES_START';
export const GET_DEVICES = 's/account/GET_DEVICES';
export type GET_DEVICES = api.AccountDevices;

export function getDevices(options?: account.GetDevicesOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_DEVICES_START, meta: { info } });
		return account.getDevices(options).then(response =>
			dispatch({
				type: GET_DEVICES,
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

export const REGISTER_DEVICE_START = 's/account/REGISTER_DEVICE_START';
export const REGISTER_DEVICE = 's/account/REGISTER_DEVICE';
export type REGISTER_DEVICE = api.Device;

export function registerDevice(
	body: api.DeviceRegistrationRequest,
	options?: account.RegisterDeviceOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: REGISTER_DEVICE_START, meta: { info } });
		return account.registerDevice(body, options).then(response =>
			dispatch({
				type: REGISTER_DEVICE,
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

export const GET_DEVICE_START = 's/account/GET_DEVICE_START';
export const GET_DEVICE = 's/account/GET_DEVICE';
export type GET_DEVICE = api.Device;

export function getDevice(id: string, options?: account.GetDeviceOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_DEVICE_START, meta: { info } });
		return account.getDevice(id, options).then(response =>
			dispatch({
				type: GET_DEVICE,
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

export const DEREGISTER_DEVICE_START = 's/account/DEREGISTER_DEVICE_START';
export const DEREGISTER_DEVICE = 's/account/DEREGISTER_DEVICE';
export type DEREGISTER_DEVICE = any;

export function deregisterDevice(id: string, options?: account.DeregisterDeviceOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: DEREGISTER_DEVICE_START, meta: { info } });
		return account.deregisterDevice(id, options).then(response =>
			dispatch({
				type: DEREGISTER_DEVICE,
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

export const RENAME_DEVICE_START = 's/account/RENAME_DEVICE_START';
export const RENAME_DEVICE = 's/account/RENAME_DEVICE';
export type RENAME_DEVICE = any;

export function renameDevice(id: string, name: string, options?: account.RenameDeviceOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: RENAME_DEVICE_START, meta: { info } });
		return account.renameDevice(id, name, options).then(response =>
			dispatch({
				type: RENAME_DEVICE,
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

export const AUTHORIZE_DEVICE_START = 's/account/AUTHORIZE_DEVICE_START';
export const AUTHORIZE_DEVICE = 's/account/AUTHORIZE_DEVICE';
export type AUTHORIZE_DEVICE = api.Device;

export function authorizeDevice(
	body: api.DeviceAuthorizationRequest,
	options?: account.AuthorizeDeviceOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: AUTHORIZE_DEVICE_START, meta: { info } });
		return account.authorizeDevice(body, options).then(response =>
			dispatch({
				type: AUTHORIZE_DEVICE,
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

export const GET_ACCOUNT_DOWNLOAD_INFO_START = 's/account/GET_ACCOUNT_DOWNLOAD_INFO_START';
export const GET_ACCOUNT_DOWNLOAD_INFO = 's/account/GET_ACCOUNT_DOWNLOAD_INFO';
export type GET_ACCOUNT_DOWNLOAD_INFO = api.DownloadInfo;

export function getAccountDownloadInfo(options?: account.GetAccountDownloadInfoOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_ACCOUNT_DOWNLOAD_INFO_START, meta: { info } });
		return account.getAccountDownloadInfo(options).then(response =>
			dispatch({
				type: GET_ACCOUNT_DOWNLOAD_INFO,
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

export const GET_ENTITLEMENTS_START = 's/account/GET_ENTITLEMENTS_START';
export const GET_ENTITLEMENTS = 's/account/GET_ENTITLEMENTS';
export type GET_ENTITLEMENTS = api.Entitlement[];

export function getEntitlements(options?: account.GetEntitlementsOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_ENTITLEMENTS_START, meta: { info } });
		return account.getEntitlements(options).then(response =>
			dispatch({
				type: GET_ENTITLEMENTS,
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

export const DELETE_ACCOUNT_START = 's/account/DELETE_ACCOUNT_START';
export const DELETE_ACCOUNT = 's/account/DELETE_ACCOUNT';
export type DELETE_ACCOUNT = any;

export function deleteAccount(externalId: string, options?: account.DeleteAccountOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: DELETE_ACCOUNT_START, meta: { info } });
		return account.deleteAccount(externalId, options).then(response =>
			dispatch({
				type: DELETE_ACCOUNT,
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

export const GET_START_OVER_FILES_START = 's/account/GET_START_OVER_FILES_START';
export const GET_START_OVER_FILES = 's/account/GET_START_OVER_FILES';
export type GET_START_OVER_FILES = api.MediaFile[];

export function getStartOverFiles(
	id: string,
	scheduleCustomId: string,
	resolution: 'HD-4K' | 'HD-1080' | 'HD-720' | 'VR-360' | 'SD' | 'External',
	device: string,
	options?: account.GetStartOverFilesOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_START_OVER_FILES_START, meta: { info } });
		return account.getStartOverFiles(id, scheduleCustomId, resolution, device, options).then(response =>
			dispatch({
				type: GET_START_OVER_FILES,
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

export const GET_ITEM_MEDIA_FILES_START = 's/account/GET_ITEM_MEDIA_FILES_START';
export const GET_ITEM_MEDIA_FILES = 's/account/GET_ITEM_MEDIA_FILES';
export type GET_ITEM_MEDIA_FILES = api.MediaFile[];

export function getItemMediaFiles(
	id: string,
	delivery: ('stream' | 'progressive' | 'download')[],
	resolution: 'HD-4K' | 'HD-1080' | 'HD-720' | 'VR-360' | 'SD' | 'External',
	device: string,
	options?: account.GetItemMediaFilesOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_ITEM_MEDIA_FILES_START, meta: { info } });
		return account.getItemMediaFiles(id, delivery, resolution, device, options).then(response =>
			dispatch({
				type: GET_ITEM_MEDIA_FILES,
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

export const GET_ITEM_MEDIA_FILES_GUARDED_START = 's/account/GET_ITEM_MEDIA_FILES_GUARDED_START';
export const GET_ITEM_MEDIA_FILES_GUARDED = 's/account/GET_ITEM_MEDIA_FILES_GUARDED';
export type GET_ITEM_MEDIA_FILES_GUARDED = api.MediaFile[];

export function getItemMediaFilesGuarded(
	id: string,
	delivery: ('stream' | 'progressive' | 'download')[],
	resolution: 'HD-4K' | 'HD-1080' | 'HD-720' | 'VR-360' | 'SD' | 'External',
	device: string,
	options?: account.GetItemMediaFilesGuardedOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: GET_ITEM_MEDIA_FILES_GUARDED_START, meta: { info } });
		return account.getItemMediaFilesGuarded(id, delivery, resolution, device, options).then(response =>
			dispatch({
				type: GET_ITEM_MEDIA_FILES_GUARDED,
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

export const GET_ACCOUNT_NEWSLETTERS_START = 's/account/GET_ACCOUNT_NEWSLETTERS_START';
export const GET_ACCOUNT_NEWSLETTERS = 's/account/GET_ACCOUNT_NEWSLETTERS';
export type GET_ACCOUNT_NEWSLETTERS = api.Newsletter[];

export function getAccountNewsletters(options?: account.GetAccountNewslettersOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_ACCOUNT_NEWSLETTERS_START, meta: { info } });
		return account.getAccountNewsletters(options).then(response =>
			dispatch({
				type: GET_ACCOUNT_NEWSLETTERS,
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

export const SUBSCRIBE_START = 's/account/SUBSCRIBE_START';
export const SUBSCRIBE = 's/account/SUBSCRIBE';
export type SUBSCRIBE = any;

export function subscribe(
	body: api.NewslettersSubscriptionRequest,
	options?: account.SubscribeOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: SUBSCRIBE_START, meta: { info } });
		return account.subscribe(body, options).then(response =>
			dispatch({
				type: SUBSCRIBE,
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

export const GENERATE_NONCE_START = 's/account/GENERATE_NONCE_START';
export const GENERATE_NONCE = 's/account/GENERATE_NONCE';
export type GENERATE_NONCE = api.AccountNonce;

export function generateNonce(options?: account.GenerateNonceOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GENERATE_NONCE_START, meta: { info } });
		return account.generateNonce(options).then(response =>
			dispatch({
				type: GENERATE_NONCE,
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

export const CHANGE_PASSWORD_START = 's/account/CHANGE_PASSWORD_START';
export const CHANGE_PASSWORD = 's/account/CHANGE_PASSWORD';
export type CHANGE_PASSWORD = any;

export function changePassword(
	body: api.ChangePasswordRequest,
	options?: account.ChangePasswordOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: CHANGE_PASSWORD_START, meta: { info } });
		return account.changePassword(body, options).then(response =>
			dispatch({
				type: CHANGE_PASSWORD,
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

export const CHANGE_PIN_START = 's/account/CHANGE_PIN_START';
export const CHANGE_PIN = 's/account/CHANGE_PIN';
export type CHANGE_PIN = any;

export function changePin(body: api.ChangePinRequest, options?: account.ChangePinOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: CHANGE_PIN_START, meta: { info } });
		return account.changePin(body, options).then(response =>
			dispatch({
				type: CHANGE_PIN,
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

export const CREATE_PROFILE_START = 's/account/CREATE_PROFILE_START';
export const CREATE_PROFILE = 's/account/CREATE_PROFILE';
export type CREATE_PROFILE = api.ProfileDetail;

export function createProfile(
	body: api.ProfileCreationRequest,
	options?: account.CreateProfileOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: CREATE_PROFILE_START, meta: { info } });
		return account.createProfile(body, options).then(response =>
			dispatch({
				type: CREATE_PROFILE,
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

export const GET_PROFILE_WITH_ID_START = 's/account/GET_PROFILE_WITH_ID_START';
export const GET_PROFILE_WITH_ID = 's/account/GET_PROFILE_WITH_ID';
export type GET_PROFILE_WITH_ID = api.ProfileSummary;

export function getProfileWithId(id: string, options?: account.GetProfileWithIdOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_PROFILE_WITH_ID_START, meta: { info } });
		return account.getProfileWithId(id, options).then(response =>
			dispatch({
				type: GET_PROFILE_WITH_ID,
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

export const UPDATE_PROFILE_WITH_ID_START = 's/account/UPDATE_PROFILE_WITH_ID_START';
export const UPDATE_PROFILE_WITH_ID = 's/account/UPDATE_PROFILE_WITH_ID';
export type UPDATE_PROFILE_WITH_ID = any;

export function updateProfileWithId(
	id: string,
	body: api.ProfileUpdateRequest,
	options?: account.UpdateProfileWithIdOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: UPDATE_PROFILE_WITH_ID_START, meta: { info } });
		return account.updateProfileWithId(id, body, options).then(response =>
			dispatch({
				type: UPDATE_PROFILE_WITH_ID,
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

export const DELETE_PROFILE_WITH_ID_START = 's/account/DELETE_PROFILE_WITH_ID_START';
export const DELETE_PROFILE_WITH_ID = 's/account/DELETE_PROFILE_WITH_ID';
export type DELETE_PROFILE_WITH_ID = any;

export function deleteProfileWithId(id: string, options?: account.DeleteProfileWithIdOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: DELETE_PROFILE_WITH_ID_START, meta: { info } });
		return account.deleteProfileWithId(id, options).then(response =>
			dispatch({
				type: DELETE_PROFILE_WITH_ID,
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

export const DISABLE_PROFILE_PLAYBACK_GUARD_START = 's/account/DISABLE_PROFILE_PLAYBACK_GUARD_START';
export const DISABLE_PROFILE_PLAYBACK_GUARD = 's/account/DISABLE_PROFILE_PLAYBACK_GUARD';
export type DISABLE_PROFILE_PLAYBACK_GUARD = any;

export function disableProfilePlaybackGuard(
	id: string,
	body: api.ProfileDisableProfilePlaybackGuardRequest,
	options?: account.DisableProfilePlaybackGuardOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: DISABLE_PROFILE_PLAYBACK_GUARD_START, meta: { info } });
		return account.disableProfilePlaybackGuard(id, body, options).then(response =>
			dispatch({
				type: DISABLE_PROFILE_PLAYBACK_GUARD,
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

export const UPDATE_RECOMMENDATION_SETTINGS_START = 's/account/UPDATE_RECOMMENDATION_SETTINGS_START';
export const UPDATE_RECOMMENDATION_SETTINGS = 's/account/UPDATE_RECOMMENDATION_SETTINGS';
export type UPDATE_RECOMMENDATION_SETTINGS = api.ProfileRecommendationSettings;

export function updateRecommendationSettings(
	id: string,
	body: api.RecommendationSettingsUpdateRequest,
	options?: account.UpdateRecommendationSettingsOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: UPDATE_RECOMMENDATION_SETTINGS_START, meta: { info } });
		return account.updateRecommendationSettings(id, body, options).then(response =>
			dispatch({
				type: UPDATE_RECOMMENDATION_SETTINGS,
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

export const REQUEST_EMAIL_VERIFICATION_START = 's/account/REQUEST_EMAIL_VERIFICATION_START';
export const REQUEST_EMAIL_VERIFICATION = 's/account/REQUEST_EMAIL_VERIFICATION';
export type REQUEST_EMAIL_VERIFICATION = any;

export function requestEmailVerification(options?: account.RequestEmailVerificationOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: REQUEST_EMAIL_VERIFICATION_START, meta: { info } });
		return account.requestEmailVerification(options).then(response =>
			dispatch({
				type: REQUEST_EMAIL_VERIFICATION,
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

export const GET_REWARDS_START = 's/account/GET_REWARDS_START';
export const GET_REWARDS = 's/account/GET_REWARDS';
export type GET_REWARDS = api.RewardsInfo;

export function getRewards(options?: account.GetRewardsOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_REWARDS_START, meta: { info } });
		return account.getRewards(options).then(response =>
			dispatch({
				type: GET_REWARDS,
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

export const REGISTER_SSO_DEVICE_START = 's/account/REGISTER_SSO_DEVICE_START';
export const REGISTER_SSO_DEVICE = 's/account/REGISTER_SSO_DEVICE';
export type REGISTER_SSO_DEVICE = api.SsoDeviceRegistration;

export function registerSsoDevice(
	body: api.SsoDeviceRegistrationRequest,
	options?: account.RegisterSsoDeviceOptions,
	info?: any
): any {
	return dispatch => {
		dispatch({ type: REGISTER_SSO_DEVICE_START, meta: { info } });
		return account.registerSsoDevice(body, options).then(response =>
			dispatch({
				type: REGISTER_SSO_DEVICE,
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

export const GET_ACCOUNT_USER_START = 's/account/GET_ACCOUNT_USER_START';
export const GET_ACCOUNT_USER = 's/account/GET_ACCOUNT_USER';
export type GET_ACCOUNT_USER = api.AccountUser;

export function getAccountUser(options?: account.GetAccountUserOptions, info?: any): any {
	return dispatch => {
		dispatch({ type: GET_ACCOUNT_USER_START, meta: { info } });
		return account.getAccountUser(options).then(response =>
			dispatch({
				type: GET_ACCOUNT_USER,
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
