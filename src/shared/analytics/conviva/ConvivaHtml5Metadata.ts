/// <reference path="conviva-core-sdk.d.ts" />

import * as browser from 'shared/util/browser';

export class ConvivaHtml5Metadata implements Conviva.MetadataInterface {
	private metadata: Partial<IConvivaHtml5Metadata>;

	constructor(metadata: Partial<IConvivaHtml5Metadata>) {
		this.metadata = metadata;
		this.trySetMissingMetadata();
	}

	private trySetMissingMetadata() {
		this.trySetOperationgSystem();
	}

	private trySetOperationgSystem() {
		if (typeof navigator === 'undefined') return;
		if (!this.metadata.operatingSystemName) {
			if (browser.isIOS()) this.metadata.operatingSystemName = 'iOS';
			else if (browser.isAndroid()) this.metadata.operatingSystemName = 'Android';
			else if (browser.isWindowsMobile()) this.metadata.operatingSystemName = 'Windows Mobile';
			else if (browser.isBlackBerry()) this.metadata.operatingSystemName = 'BlackBerry';
			else {
				if (navigator.appVersion.indexOf('Win') !== -1) this.metadata.operatingSystemName = 'Windows';
				if (navigator.appVersion.indexOf('Mac') !== -1) this.metadata.operatingSystemName = 'MacOS';
				if (navigator.appVersion.indexOf('X11') !== -1) this.metadata.operatingSystemName = 'UNIX';
				if (navigator.appVersion.indexOf('Linux') !== -1) this.metadata.operatingSystemName = 'Linux';
			}
		}
	}

	getBrowserName(): string {
		return this.metadata.browserName ? this.metadata.browserName : browser.getBrowserName();
	}

	getBrowserVersion(): string {
		return this.metadata.browserVersion ? this.metadata.browserVersion : undefined;
	}

	getDeviceBrand(): string {
		return this.metadata.deviceBrand ? this.metadata.deviceBrand : undefined;
	}

	getDeviceManufacturer(): string {
		return this.metadata.deviceManufacturer ? this.metadata.deviceManufacturer : undefined;
	}

	getDeviceModel(): string {
		return this.metadata.deviceModel ? this.metadata.deviceModel : undefined;
	}

	getDeviceType(): Conviva.Client.DeviceType {
		return browser.isMobile() ? Conviva.Client.DeviceType.MOBILE : Conviva.Client.DeviceType.DESKTOP;
	}

	getDeviceVersion(): string {
		return this.metadata.deviceVersion ? this.metadata.deviceVersion : undefined;
	}

	getFrameworkName(): string {
		return this.metadata.frameworkName ? this.metadata.frameworkName : undefined;
	}

	getFrameworkVersion(): string {
		return this.metadata.frameworkVersion ? this.metadata.frameworkVersion : undefined;
	}

	getOperatingSystemName(): string {
		return this.metadata.operatingSystemName ? this.metadata.operatingSystemName : undefined;
	}

	getOperatingSystemVersion(): string {
		return this.metadata.operatingSystemVersion ? this.metadata.operatingSystemVersion : undefined;
	}

	getDeviceCategory(): Conviva.Client.DeviceCategory {
		return Conviva.Client.DeviceCategory.WEB;
	}

	release(): void {}
}

interface IConvivaHtml5Metadata {
	browserName: string;
	browserVersion: string;
	deviceBrand: string;
	deviceManufacturer: string;
	deviceModel: string;
	deviceType: Conviva.Client.DeviceType;
	deviceVersion: string;
	frameworkName: string;
	frameworkVersion: string;
	operatingSystemName: string;
	operatingSystemVersion: string;
	deviceCategory: Conviva.Client.DeviceCategory;
}
