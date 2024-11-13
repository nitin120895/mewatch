import * as uuid from 'uuid/v4';
import { setItem, getItem } from '../localStorage';

// Generate unique ID for the device
export const getDeviceID = (): Promise<string> => {
	let storedId = _SERVER_ ? '' : getItem('uuid');
	if (!storedId) {
		storedId = uuid();
		setItem('uuid', storedId);
	}

	return Promise.resolve(storedId);
};

export const getDeviceLang = (): Promise<string> => Promise.resolve(window.navigator.language);

export default class DeviceModelBase {
	static uuid: string;

	static init() {}

	static registerKeys() {}

	static deviceInfo() {
		return {
			getId: getDeviceID,
			getLanguage: getDeviceLang,
			name: 'web-browser',
			type: 'web_browser'
		};
	}

	static closeApplication() {
		window.close();
	}

	static hasMouseSupport() {
		return true;
	}

	static hasOSK() {
		return false;
	}

	static showOSK() {}

	static hideOSK() {}

	static hidingOSK(callback: () => void) {}

	static monitorConnectivity(callback: () => void) {
		if (typeof window !== 'undefined') {
			window.addEventListener('online', callback);
			window.addEventListener('offline', callback);
		}
	}

	static isOnline() {
		if (typeof window === 'undefined') return true;
		else return navigator.onLine !== false;
	}

	static async initDeepLink(onDeepLink: (path: string) => void) {}
}
