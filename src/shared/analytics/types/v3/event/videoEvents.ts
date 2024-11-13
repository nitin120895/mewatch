import { StartoverInfo } from 'shared/analytics/api/video';
import { VideoEntryPoint } from 'shared/analytics/types/types';
import { VideoErrorCode } from 'shared/util/VideoError';
import { UnitDefinition } from 'toggle/responsive/pageEntry/advertising/adsUtils';
import { PlayerTrackInformation } from 'toggle/responsive/player/Player';

export interface IVideoProgress {
	path?: string;
	bitRate?: number;
	waitTime?: number;
	duration?: number;
	seconds?: number;
	minutes?: number;
	percent?: number;
}

export interface IVideoEventDetail {
	video: IVideoProgress;
}

export interface IVideoErrorTrackingEventDetail extends IVideoEventDetail {
	error: {
		type: string;
		status: string;
		message: string;
		path?: string;
		data: string;
		isFatal: boolean;
		code: VideoErrorCode;
	};
}

export interface IVideoActionTrackingEventDetail extends IVideoEventDetail {
	action: string;
	value: string;
}

export interface IVideoTrackingEventDetail {
	countDown: number;
	nextItem: object;
}

export interface IVideoCanPlayActionDetail {
	isAdPlaying?: boolean;
	audioLanguages?: string[];
}

export interface IAdEventDetail {
	VPAID: any;
	unitDefinition: UnitDefinition;
	videoType: any;
	embed?: boolean;
	quartile?: string;
	container?: HTMLElement;
	volume?: number;
	muted?: boolean;
}

export interface IAdTrackingEventDetail extends IVideoCanPlayActionDetail {
	action: string;
	payload: IAdEventDetail;
}

export interface IVideoItemDetail {
	item: object;
	startoverInfo?: StartoverInfo;
}

export interface IVideoItemEventDetail {
	selectedItem: api.ItemDetail;
	entryPoint: VideoEntryPoint;
	currentTime: number;
	playedAudioLang?: PlayerTrackInformation;
	playedSubtitleLang?: PlayerTrackInformation;
	videoQuality?: string;
}
