import { StartoverInfo } from 'shared/analytics/api/video';

export enum PlayerState {
	UNKNOWN = 'UNKNOWN',
	LOADING = 'LOADING',
	READY = 'READY',
	BUFFERING = 'BUFFERING',
	SEEKING = 'SEEKING',
	SEEK_PAUSED = 'SEEK_PAUSED',
	PAUSED = 'PAUSED',
	PLAYING = 'PLAYING',
	ENDED = 'ENDED',
	AVAILABLE = 'AVAILABLE',
	SESSION_STARTING = 'SESSION_STARTING',
	SESSION_RESUMED = 'SESSION_RESUMED',
	CONNECTED = 'CONNECTED',
	NOT_CONNECTED = 'NOT_CONNECTED',
	NO_DEVICES_AVAILABLE = 'NO_DEVICES_AVAILABLE'
}

export enum PlayerAction {
	PlayNext = 'Play Next',
	Restart = 'Restart',
	Squeezeback = 'Squeezeback',
	Fullscreen = 'Fullscreen',
	SelectAudio = 'SelectAudio',
	SelectQuality = 'SelectQuality',
	SelectSubtitle = 'SelectSubtitle',
	SetVolume = 'SetVolume',
	ActuatePlay = 'ActuatePlay',
	ActuatePause = 'ActuatePause',
	ActuateSeek = 'ActuateSeek',
	CanPlay = 'CanPlay',
	FirstPlaying = 'FirstPlaying',
	ActuateSeekEnd = 'ActuateSeekEnd',
	SetResumePoint = 'SetResumePoint',
	AdLoaded = 'AdLoaded',
	AdStarted = 'AdStarted',
	AdProgress = 'AdProgress',
	AdQuartile = 'AdQuartile',
	AdResumed = 'AdResumed',
	AdPaused = 'AdPaused',
	AdCompleted = 'AdCompleted',
	AdSkipped = 'AdSkipped',
	AdVolumeChanged = 'AdVolumeChanged',
	ToggleStartOver = 'ToggleStartOver',
	WatchCompleted = 'WatchCompleted',
	Dispose = 'Dispose'
}

export const PLAYBACK_STATES = [
	PlayerState.UNKNOWN,
	PlayerState.LOADING,
	PlayerState.READY,
	PlayerState.BUFFERING,
	PlayerState.PAUSED,
	PlayerState.PLAYING,
	PlayerState.ENDED
];

export type PlayerProperties = {
	itemId?: string;
	currentTime?: number;
	duration?: number;
	startTimeOfDvrWindow?: number;
	isMuted?: boolean;
	volume?: number;
	device?: string;
	chainPlayCountdown?: number;
};

export enum ErrorCta {
	DISMISS = 'DISMISS',
	TRY_AGAIN = 'TRY_AGAIN',
	OK = 'OK'
}

export type PlayerError = {
	title: string;
	description?: string;
	cta?: ErrorCta;
};

export interface PlayerAdsConfig {
	adTagUrl: string;
	entryId?: string;
	itemURL?: string;
	customParameters?: string;
	playAdsAfterTime: number;
	onAdStarted?: () => void;
	onAdPaused?: () => void;
	onAdResumed?: () => void;
	onAdCompleted?: () => void;
	onAdsCompleted?: () => void;
	onAdClicked?: () => void;
	onAdCanSkip?: () => void;
	onAdProgress?: () => void;
	onAdSkipped?: () => void;
	onAdError?: () => void;
}

export interface PlayerProps {
	subtitles: any;
	subtitleLanguages: api.Language[];
	playback: api.AppConfigPlayback;
	isVr: boolean;
	vrOverlay: HTMLElement;
	ads?: PlayerAdsConfig;
	ks?: string;
	isHOOQContent?: boolean;
	plugins?: any;
	poster?: string;
	restrictedMaxBitRate?: number;
	startoverInfo?: StartoverInfo;
	autoplay?: boolean;
	isSSAI?: boolean;
	embed?: boolean;
}

/**
 * Properties passed into the video player.
 */
export type InitPlaybackOptions = {
	item?: api.ItemDetail;
	data?: api.MediaFile[];
	autoPlay: boolean;
	startTime?: number;
	chainPlayCountdown?: number;
	customId?: number;
	startover?: boolean;
	npawAccountCode?: any;
	npawMappingVod?: any;
	npawProfileLive?: any;
	npawProfileVod?: any;
	rwDisableMCDN?: boolean;
	smartswitch?: any;
};

export interface InitCastOptions extends InitPlaybackOptions {
	session?: string;
	partnerId?: string;
	account?: api.ProfileDetail;
	youbora?: any;
}

export type PlayerFlags = {
	isBrowserSupported: boolean;
	isAutoPlayEnabled: boolean;
};

export interface RemoteCastPlayerInterface {
	canPause: boolean;
	isPaused: boolean;
	canSeek: boolean;
	currentTime: number;
	canControlVolume: boolean;
	volumeLevel: number;
	isMuted: boolean;
	selectTrack?(track: KalturaPlayerTrack): void;
}

export interface RemoteCastPlayerControllerInterface {
	stop(): void;
	addEventListener(event, callback: Function): void;
	playOrPause(): void;
	seek(): void;
	setVolumeLevel(): void;
	muteOrUnmute(): void;
}

export interface PlayerInterface {
	flags: PlayerFlags;
	ownControls: boolean;
	initPlayback(container: HTMLElement, options: InitPlaybackOptions): Promise<boolean>;
	play(): void;
	pause(): void;
	stop(stopPlayback?: boolean): void;
	onSeekingInteraction(): void;
	seek(time: number): void;
	setVolume(volume: number): void;
	replay(): void;
	toggleStartOver(): void;
	dispose(): void;
	addListener(type: PlayerEventType | OldPlayerEventType, handler: PlayerEventHandler): void;
	removeListener(type: PlayerEventType | OldPlayerEventType, handler: PlayerEventHandler): void;
	emit(type: PlayerEventType | OldPlayerEventType, data: any);
	selectMedia(media: api.MediaFile[]): api.MediaFile;
	setVolumeMutedState(isMuted: boolean): void;
	getVideoTracks(): KalturaPlayerTrack[];
	getTextTracks(): PlayerSubtitleTrack[];
	getAudioTracks(): PlayerAudioTrack[];
	playbackRates(): PlayerPlaybackRateInformation[];
	selectPlaybackSpeed(speed: number): void;
	selectAudio(id: string, isUserClick?: boolean): void;
	selectSubtitle(id: string, isUserClick?: boolean): void;
	selectVideo(track?: KalturaPlayerTrack): void;
	enableAdaptiveBitrate(): void;
	configure(Object: any): void;
	isAdsEnded(): boolean;
	isAdPlaying(): boolean;

	// chromecast need it
	getLastState(): PlayerState;
	getLastProperties(): PlayerProperties;
	loadNextItem(options: InitCastOptions): void;
	loadNextItemThumbnail?(options: InitCastOptions): void;
}

export interface PlayerEventHandler {
	(data: any): void;
}
/**
 * Kaltura player video type
 */
export interface KalturaPlayerTrack {
	id: string;
	_label: string;
	_index: number;
	_active: boolean;
	_bandwidth: number;
	_height: number;
	_language: string;
}

export enum PlayerEventType {
	properties = 'properties',
	state = 'state',
	error = 'error',
	action = 'action',
	videoTrack = 'videoTrack',
	audioTrack = 'audioTrack',
	textTrack = 'textTrack',
	trackPlaybackSpeed = 'trackPlaybackSpeed',
	vrInteraction = 'vrInteraction'
}

type OldPlayerEventType = 'properties' | 'state' | 'error' | 'action';

export type InitCastPlaybackOptions = {
	mediaUrl: string;
	item: api.ItemDetail;
	resumePosition: number;
};

export interface PlayerTrackInformation {
	id: number | string;
	lang: string; // RFC 5646 lang code
	label: string;
	active: boolean;
}

export interface PlayerAudioTrack extends PlayerTrackInformation {}
export interface PlayerSubtitleTrack extends PlayerTrackInformation {}

export const FULLSCREEN_QUERY_PARAMETER = 'fullscreen';

export const isPlayerLoading = (playerState: PlayerState): boolean =>
	playerState === PlayerState.UNKNOWN || playerState === PlayerState.LOADING || playerState === PlayerState.BUFFERING;

export enum PlayerContextType {
	PLAYBACK = 'PLAYBACK',
	START_OVER = 'START_OVER'
}
export enum PlayerMediaType {
	MEDIA = 'MEDIA',
	EPG = 'EPG'
}
export enum PlayerAssetReferenceType {
	MEDIA = 'MEDIA',
	EPG_INTERNAL = 'EPG_INTERNAL'
}

export interface PlayerPlaybackRateInformation {
	id: number;
	label: string;
	value: number;
}
