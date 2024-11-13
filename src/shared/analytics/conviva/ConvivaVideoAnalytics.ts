/// <reference path="conviva-core-sdk.d.ts" />

import { ItemContextProperty } from 'shared/analytics/types/v3/context';
import {
	IVideoCanPlayActionDetail,
	IVideoErrorTrackingEventDetail,
	IVideoEventDetail
} from 'shared/analytics/types/v3/event/videoEvents';
import {
	HOOQ,
	getPlayerVendor,
	getPlayerVersion,
	isLive,
	getStreamProtocol,
	isHOOQ
} from 'toggle/responsive/util/playerUtil';
import { VideoAnalyticsBase } from '../videoAnalytics';
import { getAccount } from 'shared/account/accountUtil';

import { ConvivaManager } from './ConvivaManager';
import { IConvivaMetadataCustom, ConvivaVideoAnalyticsMetadata } from './ConvivaVideoAnalyticsMetadata';
import { get } from 'shared/util/objects';

const APPLICATION_NAME = 'meWatch';
const ACCESS_TYPE = '30';
const PLAYBACK_ATTRIBUTES = 'app_version=3.6.0';
const NA = 'NA';

export class ConvivaVideoAnalytics extends VideoAnalyticsBase {
	private customerKey: string;
	private gatewayUrl: string;

	private convivaManager: ConvivaManager = undefined;
	private metadata: ConvivaVideoAnalyticsMetadata = undefined;
	private initialized = false;

	constructor(enabled: boolean, customerKey: string, gatewayUrl = '') {
		super(enabled);
		// uncomment to enable console logging
		// this.logger = console;
		this.customerKey = customerKey;
		this.gatewayUrl = gatewayUrl;
	}

	private initialize() {
		this.initialized = true;
		this.initializeMetadata();
		this.ensureConvivaManager();
	}

	private initializeMetadata() {
		this.metadata = new ConvivaVideoAnalyticsMetadata();
	}

	private ensureConvivaManager() {
		if (!this.hasConvivaManager) this.convivaManager = new ConvivaManager(this.customerKey, this.gatewayUrl);
	}

	get hasActiveSession(): boolean {
		return this.hasConvivaClient && this.convivaManager.hasActiveSession;
	}

	get hasConvivaClient(): boolean {
		return this.hasConvivaManager && this.convivaManager.hasClient;
	}

	get hasConvivaManager(): boolean {
		return this.convivaManager !== undefined;
	}

	isHOOQContent({ item }: ItemContextProperty): boolean {
		return item.hooqContent || isHOOQ(item);
	}

	private createContentMetadata(context: ItemContextProperty): Conviva.ContentMetadata {
		const { item } = context;
		const account = getAccount();

		const contentMetadata = new Conviva.ContentMetadata();

		// common metadata
		contentMetadata.assetName = item.title;
		contentMetadata.streamUrl = item.path;
		contentMetadata.streamType = isLive(item)
			? Conviva.ContentMetadata.StreamType.LIVE
			: Conviva.ContentMetadata.StreamType.VOD;
		contentMetadata.applicationName = APPLICATION_NAME;
		if (account) contentMetadata.viewerId = account.email;
		contentMetadata.duration = item.duration;

		// custom metadata
		const custom = {} as IConvivaMetadataCustom;
		const streamUUID = get(item, 'customFields.ProviderExternalID');

		if (item.categories && item.categories.length > 0) custom.category = item.categories.join(',');
		custom.contentId = item.customId;
		custom.channel = NA;
		custom.contentType = item.type;
		custom.episodeName = item.episodeName ? item.episodeName : item.title;
		custom.episodeNumber = item.episodeNumber || NA;
		if (item.genres && item.genres.length > 0) {
			custom.genre = item.genres.join(',');
			custom.subGenre = item.genres.join(',');
		}
		if (item.offers && item.offers.length > 0 && item.offers[0].startDate) custom.pubDate = item.offers[0].startDate;
		if (item.season) custom.season = get(item, 'season.seasonNumber');
		if (streamUUID) custom.streamUUID = streamUUID;
		custom.show = item.showTitle || get(item, 'season.show.title');
		custom.partnerName = HOOQ;
		custom.playerVendor = getPlayerVendor();
		custom.playerVersion = getPlayerVersion();
		custom.streamProtocol = getStreamProtocol();
		custom.accessType = ACCESS_TYPE;
		custom.playback_attributes = PLAYBACK_ATTRIBUTES;
		custom.affiliate = NA;

		Object.assign(contentMetadata.custom, custom);
		return contentMetadata;
	}

	updateContentMetadataFromContext(context: ItemContextProperty) {
		this.metadata.contentMetadata = this.createContentMetadata(context);
	}

	updateMetadataFromVideoEventDetail(detail: IVideoEventDetail) {
		if (detail && detail.video) {
			if (typeof detail.video.bitRate === 'number') this.metadata.videoBitrate = detail.video.bitRate;
			if (typeof detail.video.duration === 'number') this.metadata.videoDuration = detail.video.duration;
			if (typeof detail.video.seconds === 'number') this.metadata.videoCurrentTime = detail.video.seconds;
		}
	}

	updateMetadataFromVideoCanPlayActionDetail(detail: IVideoCanPlayActionDetail) {
		const { isAdPlaying } = detail;
		if (isAdPlaying === true) this.metadata.isAdPlaying = true;
		else if (isAdPlaying === false) this.metadata.isAdPlaying = false;
	}

	private ensureSession(context: ItemContextProperty) {
		if (!this.hasActiveSession) {
			this.updateContentMetadataFromContext(context);
			this.convivaManager.startSession(this.metadata);
		}
	}

	// make sure that Analytic was initialized in a case if it should but starting state was not INITIAL for some reason
	private ensureInitialized(context: ItemContextProperty) {
		// enable Conviva analytics for HOOQ content only, disable for any other
		if (!this.isHOOQContent(context)) {
			this.disable();
			return;
		}

		if (this.initialized) return;

		// Conviva analytics enabled for HOOQ content
		this.initialize();
		this.enable();
		this.ensureSession(context);
	}

	// most common initial events that we should use
	videoInitialized(context: ItemContextProperty): void {
		this.ensureInitialized(context);
		super.videoInitialized(context);
	}

	videoCanPlay(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void {
		this.ensureInitialized(context);
		super.notifyVideoCanPlay(context, detail);
	}

	videoBuffering(context: ItemContextProperty, detail: IVideoEventDetail): void {
		this.ensureInitialized(context);
		super.notifyVideoBuffering(context, detail);
	}

	notifyVideoBuffering(context: ItemContextProperty, detail: IVideoEventDetail): void {
		this.metadata.setPlayerStateToBuffering();
		this.updateMetadataFromVideoEventDetail(detail);
		this.convivaManager.updatePlayerStateManagerFromMetadata(this.metadata);
	}

	notifyVideoCanPlay(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void {
		this.updateMetadataFromVideoCanPlayActionDetail(detail);
		this.convivaManager.updatePlayerStateManagerFromMetadata(this.metadata);
	}

	notifyVideoPlaying(context: ItemContextProperty, detail: IVideoEventDetail): void {
		this.metadata.setPlayerStateToPlaying();
		this.updateMetadataFromVideoEventDetail(detail);
		this.convivaManager.updatePlayerStateManagerFromMetadata(this.metadata);
	}

	notifyVideoPaused(context: ItemContextProperty, detail: IVideoEventDetail): void {
		this.metadata.setPlayerStateToPaused();
		this.updateMetadataFromVideoEventDetail(detail);
		this.convivaManager.updatePlayerStateManagerFromMetadata(this.metadata);
	}

	notifyVideoProgressed(context: ItemContextProperty, detail: IVideoEventDetail): void {
		this.updateMetadataFromVideoEventDetail(detail);
		this.convivaManager.updatePlayerStateManagerFromMetadata(this.metadata);
	}

	notifyVideoCompleted(context: ItemContextProperty, detail: IVideoEventDetail): void {
		this.metadata.setPlayerStateToStopped();
		this.updateMetadataFromVideoEventDetail(detail);
		this.convivaManager.updatePlayerStateManagerFromMetadata(this.metadata);
		this.convivaManager.endSession();
		this.metadata.setPlayerStateToNotMonitored();
		this.initialized = false;
	}

	notifyVideoError(context: ItemContextProperty, detail: IVideoErrorTrackingEventDetail): void {
		this.convivaManager.sendError(JSON.stringify(detail.error), detail.error.isFatal);
	}

	notifyVideoAdStarted(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void {
		this.updateMetadataFromVideoCanPlayActionDetail(detail);
		this.convivaManager.adStart(this.metadata);
	}

	notifyVideoAdCompleted(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void {
		this.updateMetadataFromVideoCanPlayActionDetail(detail);
		this.convivaManager.adEnd();
	}

	notifyVideoAdSkipped(context: ItemContextProperty, detail: IVideoCanPlayActionDetail): void {
		this.updateMetadataFromVideoCanPlayActionDetail(detail);
		this.convivaManager.adEnd();
	}
}
