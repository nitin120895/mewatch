/// <reference path="conviva-core-sdk.d.ts" />

export class ConvivaVideoAnalyticsMetadata {
	contentMetadata: Conviva.ContentMetadata = undefined;
	isAdPlaying = false;
	playerState: Conviva.PlayerStateManager.PlayerState = Conviva.PlayerStateManager.PlayerState.NOT_MONITORED;
	videoBitrate: number = undefined;
	videoCurrentTime: number = undefined;
	videoDuration: number = undefined;
	wasPlayingState = false;
	wasVideoDurationSet = false;

	get hasContentMetadata(): boolean {
		return this.contentMetadata !== undefined;
	}

	get hasVideoBitrate(): boolean {
		return this.videoBitrate !== undefined && !isNaN(this.videoBitrate) && this.videoBitrate > 0;
	}

	get hasVideoCurrentTime(): boolean {
		return this.videoCurrentTime !== undefined && !isNaN(this.videoCurrentTime) && this.videoCurrentTime >= 0;
	}

	get hasVideoDuration(): boolean {
		if (this.isLive) return false;
		return this.videoDuration !== undefined && !isNaN(this.videoDuration) && this.videoDuration > 0;
	}

	get isLive(): boolean {
		return this.hasContentMetadata && this.contentMetadata.streamType === Conviva.ContentMetadata.StreamType.LIVE;
	}

	get isVod(): boolean {
		return this.hasContentMetadata && this.contentMetadata.streamType === Conviva.ContentMetadata.StreamType.VOD;
	}

	getPlayerVendor(): string {
		return (this.contentMetadata.custom as IConvivaMetadataCustom).playerVendor;
	}

	getPlayerVersion(): string {
		return (this.contentMetadata.custom as IConvivaMetadataCustom).playerVersion;
	}

	setPlayerStateToBuffering(): void {
		this.playerState = Conviva.PlayerStateManager.PlayerState.BUFFERING;
	}

	setPlayerStateToNotMonitored(): void {
		this.playerState = Conviva.PlayerStateManager.PlayerState.NOT_MONITORED;
	}

	setPlayerStateToPaused(): void {
		this.playerState = Conviva.PlayerStateManager.PlayerState.PAUSED;
	}

	setPlayerStateToPlaying(): void {
		this.playerState = Conviva.PlayerStateManager.PlayerState.PLAYING;
		if (!this.isAdPlaying) this.wasPlayingState = true;
	}

	setPlayerStateToStopped(): void {
		this.playerState = Conviva.PlayerStateManager.PlayerState.STOPPED;
	}

	setPlayerStateToUnknown(): void {
		this.playerState = Conviva.PlayerStateManager.PlayerState.UNKNOWN;
	}
}

export interface IConvivaMetadataCustom {
	category: string;
	channel: string;
	contentId: string;
	contentType: string;
	episodeName: string;
	episodeNumber: number | 'NA';
	genre: string;
	pubDate: Date;
	season: string;
	show: string;
	subGenre: string;
	affiliate: string;
	streamProtocol: string;
	streamUUID: string;
	partnerName: string;
	playback_attributes: string;
	carrier: string;
	connectionType: string;
	playerVendor: string;
	playerVersion: string;
	accessType: string;
}
