import DeviceModelBase, { getDeviceID } from '../deviceModelBase';
import { getItem, setItem } from '../../localStorage';

// Generate unique ID for the device
const getWebosDeviceID = (): Promise<string> => {
	return new Promise<string>(resolve => {
		if (_SERVER_) return resolve('');

		let storedId = getItem('uuid');

		if (storedId) {
			return resolve(storedId);
		}

		try {
			(window as any).webOS.service.request('luna://com.webos.service.sm', {
				method: 'deviceid/getIDs',
				parameters: {
					idType: ['LGUDID']
				},
				onSuccess: inResponse => {
					if (inResponse && inResponse.idList && inResponse.idList.length > 0 && inResponse.idList[0].idValue) {
						const deviceId = inResponse.idList[0].idValue;
						setItem('uuid', deviceId);
						return resolve(inResponse.idList[0].idValue);
					} else {
						return getDeviceID();
					}
				},
				onFailure: () => getDeviceID()
			});
		} catch (e) {
			return getDeviceID();
		}
	});
};

const getWebosDeviceLang = (): Promise<string> => {
	return new Promise(resolve => {
		const { language } = window.navigator;

		try {
			(window as any).webOS.service.request('luna://com.webos.settingsservice', {
				method: 'getSystemSettings',
				parameters: {
					keys: ['localeInfo'],
					subscribe: true
				},
				onSuccess: inResponse => {
					if (!inResponse.subscribed) {
						resolve(language);
					} else {
						resolve(inResponse.settings.localeInfo.locales['TV']);
					}
				},
				onFailure: () => resolve(language)
			});
		} catch (e) {
			resolve(language);
		}
	});
};

export default class SubDeviceModel extends DeviceModelBase {
	static closeApplication() {
		try {
			(window as any).webOS.platformBack();
		} catch (e) {
			console.error('LG error exit');
		}
	}

	static deviceInfo() {
		return {
			getId: getWebosDeviceID,
			getLanguage: getWebosDeviceLang,
			name: 'tv-lg-webos',
			type: 'tv_lg_webos'
		};
	}

	static hasOSK() {
		return true;
	}
}
