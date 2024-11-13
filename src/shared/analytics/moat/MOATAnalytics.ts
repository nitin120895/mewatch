import { ItemContextProperty } from '../types/v3/context';
import { IAdTrackingEventDetail } from '../types/v3/event/videoEvents';
import { get } from '../../util/objects';

export class MOATAnalytics {
	private moatApiReference = undefined;
	private partnerCode = undefined;

	constructor(accountCode: string) {
		this.partnerCode = accountCode;
	}

	private dispatchMoat = (type, adVolume) => {
		this.moatApiReference &&
			this.moatApiReference.dispatchEvent({
				type,
				adVolume
			});
	};

	private getVolume = (detail: IAdTrackingEventDetail) => {
		const { muted, volume } = detail.payload;
		return muted ? 0 : volume;
	};

	videoAdLoaded(context: ItemContextProperty, detail: IAdTrackingEventDetail): void {
		if (!detail) {
			return;
		}

		const { container, VPAID, unitDefinition, videoType } = detail.payload;
		const adSystem = get(VPAID, 'extraAdData.adSystem');
		const title = get(VPAID, 'extraAdData.title');
		const creativeId = get(VPAID, 'extraAdData.creativeId');
		const duration = get(VPAID, 'extraAdData.duration');
		const mediaUrl = get(VPAID, 'extraAdData.mediaUrl');
		const slicer1 = unitDefinition;
		const slicer2 = videoType;

		const ids = {
			level1: adSystem,
			level2: title,
			level3: creativeId,
			slicer1,
			slicer2
		};
		this.moatApiReference = this.initMoatTracking(container, ids, duration, this.partnerCode, mediaUrl);
	}

	notifyVideoAdStarted(context: ItemContextProperty, detail: IAdTrackingEventDetail): void {
		this.dispatchMoat('AdVideoStart', this.getVolume(detail));
	}

	notifyVideoAdProgress(context: ItemContextProperty, detail: IAdTrackingEventDetail): void {
		this.dispatchMoat('AdPlaying', this.getVolume(detail));
	}

	notifyVideoAdQuartile(context: ItemContextProperty, detail: IAdTrackingEventDetail): void {
		const payload = detail.payload;
		const volume = this.getVolume(detail);

		switch (payload.quartile) {
			case 'adfirstquartile':
				this.dispatchMoat('AdVideoFirstQuartile', volume);
				return;
			case 'admidpoint':
				this.dispatchMoat('AdVideoMidpoint', volume);
				return;
			case 'adthirdquartile':
				this.dispatchMoat('AdVideoThirdQuartile', volume);
				return;
			default:
		}
	}

	notifyVideoAdCompleted(context: ItemContextProperty, detail: IAdTrackingEventDetail): void {
		this.dispatchMoat('AdVideoComplete', this.getVolume(detail));
	}

	notifyVideoAdPaused(context: ItemContextProperty, detail: IAdTrackingEventDetail): void {
		this.dispatchMoat('AdPaused', this.getVolume(detail));
	}

	notifyVideoAdSkipped(context: ItemContextProperty, detail: IAdTrackingEventDetail): void {
		this.dispatchMoat('AdSkipped', this.getVolume(detail));
	}

	notifyVideoAdVolumeChanged(context: ItemContextProperty, detail: IAdTrackingEventDetail): void {
		this.dispatchMoat('AdVolumeChange', this.getVolume(detail));
	}

	/*Copyright (c) 2011-2016 Moat Inc. All Rights Reserved.*/
	initMoatTracking(a, c, d, h, k): any {
		let f = document.createElement('script'),
			b: any = [];
		c = {
			adData: { ids: c, duration: d, url: k },
			dispatchEvent: function(a) {
				this.sendEvent ? (b && (b.push(a), (a = b), (b = !1)), this.sendEvent(a)) : b.push(a);
			}
		};
		d = '_moatApi' + Math.floor(1e8 * Math.random());
		let e, g;
		try {
			(e = a.ownerDocument), (g = e.defaultView || e.parentWindow);
		} catch (l) {
			(e = document), (g = window);
		}
		g[d] = c;
		f.type = 'text/javascript';
		a && a.insertBefore(f, a.childNodes[0] || undefined);
		f.src = 'https://z.moatads.com/' + h + '/moatvideo.js#' + d;
		return c;
	}
}
