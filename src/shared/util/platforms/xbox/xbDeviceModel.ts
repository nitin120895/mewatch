import DeviceModelBase, { getDeviceID } from '../deviceModelBase';
import { getItem, setItem } from '../../localStorage';

// Generate unique ID for the device
const getXboxDeviceID = (): Promise<string> => {
	if (_SERVER_) return Promise.resolve('');

	let storedId = getItem('uuid');

	if (!storedId) {
		try {
			const Windows = (window as any).Windows;
			if (!!Windows) {
				storedId = new Windows.Security.ExchangeActiveSyncProvisioning.EasClientDeviceInformation().id;
			}
		} catch (e) {
			console.error('XBox error getDuid');
		}
	}

	if (!storedId) {
		return getDeviceID();
	}

	setItem('uuid', storedId);

	return Promise.resolve(storedId);
};

const getXboxDeviceLang = (): Promise<string> => {
	return new Promise((resolve, reject) => {
		const failed = () => resolve(window.navigator.language);

		try {
			const Windows = (window as any).Windows;
			if (!!Windows) {
				const topUserLanguage = Windows.System.UserProfile.GlobalizationPreferences.languages[0];
				if (!topUserLanguage) return failed();

				return resolve(topUserLanguage);
			} else {
				return failed();
			}
		} catch (e) {
			return failed();
		}
	});
};

export default class SubDeviceModel extends DeviceModelBase {
	static closeApplication() {
		try {
			const MSApp = (window as any).MSApp;
			MSApp.terminateApp({});
		} catch (e) {
			console.error('XBox error exit');
		}
	}

	static deviceInfo() {
		return {
			getId: getXboxDeviceID,
			getLanguage: getXboxDeviceLang,
			name: 'tv-xboxone',
			type: 'tv_xboxone'
		};
	}

	static hasOSK() {
		return true;
	}

	static showOSK() {
		try {
			const Windows = (window as any).Windows;
			if (!!Windows) {
				Windows.UI.ViewManagement.InputPane.getForCurrentView().tryShow();
			}
		} catch (e) {
			console.error('show on-screen keyboard error');
		}
	}

	static hideOSK() {
		try {
			const Windows = (window as any).Windows;
			if (!!Windows) {
				Windows.UI.ViewManagement.InputPane.getForCurrentView().tryHide();
			}
		} catch (e) {
			console.error('hide on-screen keyboard error');
		}
	}

	static hidingOSK(callback: () => void) {
		try {
			const Windows = (window as any).Windows;
			if (!!Windows) {
				Windows.UI.ViewManagement.InputPane.getForCurrentView().onhiding = () => {
					callback && callback();
				};
			}
		} catch (e) {
			console.error('onhiding on-screen keyboard error');
		}
	}
}
