import DeviceModelBase, { getDeviceID, getDeviceLang } from '../deviceModelBase';

export default class SubDeviceModel extends DeviceModelBase {
	static deviceInfo() {
		return {
			getId: getDeviceID,
			getLanguage: getDeviceLang,
			name: 'tv-generic',
			type: 'tv_generic'
		};
	}
}
