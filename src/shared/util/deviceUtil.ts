import { getItem, setItem, removeItem } from './localStorage';
import * as uuid from 'uuid/v4';
import { get } from 'shared/util/objects';
import { FORBIDDEN_ERROR } from 'shared/util/errorCodes';
import { getBrowserName, getOSName, isAndroid, isIOS, isMac, isMobile } from 'shared/util/browser';

export const DEVICE_ID_KEY = 'device-uuid';
export const DEVICE_TYPE_PHONE = 'phone';
export const DEVICE_TYPE_PHABLET = 'phablet';
export const DEVICE_TYPE_TABLET = 'tablet';
export const DEVICE_TYPE_LAPTOP = 'laptop';
export const DEVICE_TYPE_DESKTOP = 'desktop';
export const DEVICE_TYPE_TV = 'tv';
export const DEVICE_TYPE_ULTRA_HD = 'uhd';

export const BROWSER_DEVICE_BRAND_PHONE_IPHONE = 1;
export const BROWSER_DEVICE_BRAND_PHONE_SAMSUNG = 2;
export const BROWSER_DEVICE_BRAND_PHONE_ANDROID = 32;
export const BROWSER_DEVICE_BRAND_TABLET_IPAD = 3;
export const BROWSER_DEVICE_BRAND_TABLET_SAMSUNG = 4;
export const BROWSER_DEVICE_BRAND_TABLET_ANDROID = 31;
export const DEVICE_BRAND_ID_DESKTOP_PC = 22;
export const DEVICE_BRAND_ID_DESKTOP_MAC = 23;

export const BOOST_DEVICE_DESKTOP = 101;
export const BOOST_DEVICE_MOBILE = 102;

export enum DeviceAuthError {
	invalidCode,
	deviceLimit
}

let deviceId: string = undefined;

export function removeDeviceId() {
	deviceId = undefined;
	removeItem(DEVICE_ID_KEY);
}

export function getDeviceId() {
	if (!deviceId) {
		deviceId = getItem(DEVICE_ID_KEY);
	}

	if (!deviceId) {
		deviceId = uuid();
		setItem(DEVICE_ID_KEY, deviceId);
	}

	return deviceId;
}

export function isDeviceInList(devicesAction: Redux.Action): boolean {
	const devices = get(devicesAction, 'payload.devices');
	return devices && devices.some(device => device.id === getDeviceId());
}

export function getDeviceAuthErrorByCode(status: number): DeviceAuthError {
	if (status === FORBIDDEN_ERROR) return DeviceAuthError.deviceLimit;

	return DeviceAuthError.invalidCode;
}

export function isDeviceLimitError(errorType: DeviceAuthError): boolean {
	return errorType === DeviceAuthError.deviceLimit;
}

export function isInvalidCodeError(errorType: DeviceAuthError): boolean {
	return errorType === DeviceAuthError.invalidCode;
}

export function getBrandID() {
	if (isMobile()) {
		if (isIOS()) {
			return /iPad/.test(navigator.userAgent) ? BROWSER_DEVICE_BRAND_TABLET_IPAD : BROWSER_DEVICE_BRAND_PHONE_IPHONE;
		}
		if (isAndroid()) {
			return /SM-T/.test(navigator.userAgent)
				? BROWSER_DEVICE_BRAND_TABLET_SAMSUNG
				: BROWSER_DEVICE_BRAND_PHONE_ANDROID;
		}
	}
	if (isMac()) {
		return DEVICE_BRAND_ID_DESKTOP_MAC;
	}
	return DEVICE_BRAND_ID_DESKTOP_PC;
}

export function getDeviceType(device) {
	switch (device.brandId) {
		case BROWSER_DEVICE_BRAND_PHONE_IPHONE:
		case BROWSER_DEVICE_BRAND_PHONE_ANDROID:
		case BROWSER_DEVICE_BRAND_PHONE_SAMSUNG:
		case 11:
		case 12:
		case 28:
			return DEVICE_TYPE_PHONE;
			break;
		case BROWSER_DEVICE_BRAND_TABLET_IPAD:
		case BROWSER_DEVICE_BRAND_TABLET_SAMSUNG:
		case BROWSER_DEVICE_BRAND_TABLET_ANDROID:
		case 21:
			return DEVICE_TYPE_TABLET;
			break;
		case DEVICE_BRAND_ID_DESKTOP_PC:
		case DEVICE_BRAND_ID_DESKTOP_MAC:
			return DEVICE_TYPE_LAPTOP;
			break;
		case 5:
		case 6:
		case 7:
		case 8:
		case 9:
		case 10:
		case 13:
		case 14:
		case 15:
		case 16:
		case 17:
		case 18:
		case 19:
		case 20:
		case 24:
		case 25:
		case 26:
		case 27:
		case 29:
		case 30:
		case 31:
		case 33:
		case 34:
		case 35:
		case 36:
			return DEVICE_TYPE_TV;
			break;
		default:
			return '';
	}
}

export function getSignDevice(isEncoded?: boolean) {
	const id = getDeviceId();
	const os = getOSName();
	const browser = getBrowserName();

	return {
		id,
		os: isEncoded ? encodeURIComponent(os) : os,
		browser: isEncoded ? encodeURIComponent(browser) : browser
	};
}

export function getBoostDeviceType() {
	return isMobile() ? BOOST_DEVICE_MOBILE : BOOST_DEVICE_DESKTOP;
}
