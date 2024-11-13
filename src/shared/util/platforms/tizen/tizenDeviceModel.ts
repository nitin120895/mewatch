import DeviceModelBase, { getDeviceID, getDeviceLang } from '../deviceModelBase';
import { getItem, setItem } from '../../localStorage';

// Generate unique ID for the device
const getTizenDeviceID = (): Promise<string> => {
	if (_SERVER_) return Promise.resolve('');

	let storedId = getItem('uuid');

	if (!storedId) {
		try {
			storedId = (window as any).webapis.productinfo.getDuid();
		} catch (e) {
			console.error('tizenAPI error getDuid');
		}
	}

	if (!storedId) {
		return getDeviceID();
	}

	setItem('uuid', storedId);

	return Promise.resolve(storedId);
};

const getActionData = (): string => {
	const tizen = (window as any).tizen;
	const requestedAppControl = tizen.application.getCurrentApplication().getRequestedAppControl();
	if (requestedAppControl) {
		const appControlData = requestedAppControl.appControl.data;
		for (let i = 0; i < appControlData.length; i++) {
			if (appControlData[i].key === 'PAYLOAD') {
				const actionData = JSON.parse(appControlData[i].value[0]).values;
				return actionData;
			}
		}
	}
};

const processDeepLink = async (onDeepLink: (path: string) => void) => {
	try {
		const actionData: string = getActionData();
		if (!!actionData) return await onDeepLink(actionData);
	} catch (e) {
		console.error('processDeepLink error!');
	}
};

export default class SubDeviceModel extends DeviceModelBase {
	static closeApplication() {
		try {
			(window as any).tizen.application.getCurrentApplication().exit();
		} catch (e) {
			console.error('tizenAPI error exit');
		}
	}

	static deviceInfo() {
		return {
			getId: getTizenDeviceID,
			getLanguage: getDeviceLang,
			name: 'tv-Samsung',
			type: 'tv_samsung'
		};
	}

	static hasMouseSupport() {
		return false;
	}

	static hasOSK() {
		return true;
	}

	static monitorConnectivity(callback: () => void) {
		try {
			const webapis = (window as any).webapis;
			webapis.network.addNetworkStateChangeListener(networkState => {
				if (
					networkState === webapis.network.NetworkState.GATEWAY_CONNECTED ||
					networkState === webapis.network.NetworkState.GATEWAY_DISCONNECTED
				) {
					callback();
				}
			});
		} catch (e) {
			console.error('tizenAPI error network');
		}
	}

	static isOnline() {
		let gatewayStatus = true;
		try {
			gatewayStatus = (window as any).webapis.network.isConnectedToGateway();
		} catch (e) {
			console.error('tizenAPI error network');
		}
		return gatewayStatus;
	}

	static async initDeepLink(onDeepLink: (path: string) => void) {
		// cold deepLink
		await processDeepLink(onDeepLink);

		// hot deepLink
		window.addEventListener('appcontrol', () => processDeepLink(onDeepLink));
	}
}
