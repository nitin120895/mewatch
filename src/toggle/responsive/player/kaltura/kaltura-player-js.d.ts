// TypeScript mappings for Kaltura Player JS

declare type PKAbrConfigObject = {
	fpsDroppedMonitoringThreshold: number,
	fpsDroppedFramesInterval: number,
	capLevelOnFPSDrop: boolean,
	[field: string]: any
};

declare type PKAbrModes = {
	[field: string]: any
};

declare type PKAdBreakOptions = {
	type?: string,
	position?: number,
	numAds?: number,
	[field: string]: any
};

declare type PKAdBreakTypes = {
	[field: string]: any
};

declare type PKAdOptions = {
	url?: string,
	contentType?: string,
	title?: string,
	position?: number,
	duration?: number,
	clickThroughUrl?: string,
	posterUrl?: string,
	skipOffset?: number,
	linear?: boolean,
	[field: string]: any
};

declare type PKAdTagTypes = {
	[field: string]: any
};

declare type PKCorsTypes = {
	[field: string]: any
};

declare type PKCustomLabelsConfigObject = {
	audio: Function,
	qualities: Function,
	video: Function,
	[field: string]: any
};

declare type DeferredPromise = Promise<any> & {
	resolve: Function,
	reject: Function,
	[field: string]: any
};

declare type PKDrmDataObject = {
	licenseUrl: string,
	scheme: string,
	certificate?: string,
	[field: string]: any
};

declare type PKEngineTypes = {
	[field: string]: any
};

declare type PKCore = {
	[field: string]: any
};

declare type PKEventTypes = {
	[field: string]: any
};

declare type PKExternalCaptionObject = {
	url: string,
	label: string,
	language: string,
	default: boolean | null | undefined,
	type: string | null | undefined,
	[field: string]: any
};

declare type PKLogLevelObject = {
	value: number,
	name: string,
	[field: string]: any
};

declare type PKLogLevels = {
	[field: string]: any
};

declare type PKLogLevelTypes = {
	[field: string]: any
};

declare type PKMediaSourceCapabilities = {
	[field: string]: any
};

declare type PKMediaSourceObject = {
	mimetype: string,
	url: string,
	id?: string,
	bandwidth?: number,
	width?: number,
	height?: number,
	drmData?: Array<PKDrmDataObject>,
	[field: string]: any
};

declare type PKMediaSourceOptionsObject = {
	forceRedirectExternalStreams: boolean,
	redirectExternalStreamsHandler: Function | null | undefined,
	redirectExternalStreamsTimeout: number | null | undefined,
	[field: string]: any
};

declare type PKMediaTypes = {
	[field: string]: any
};

declare type PKMetadataConfigObject = {
	name?: string,
	description?: string,
	[field: string]: any
};

declare type PKMimeTypes = {
	[field: string]: any
};

declare type PKPlaybackConfigObject = {
	audioLanguage: string,
	textLanguage: string,
	useNativeTextTrack: boolean,
	volume: number,
	playsinline: boolean,
	crossOrigin: string,
	preload: string,
	autoplay: boolean,
	allowMutedAutoPlay: boolean,
	muted: boolean,
	pictureInPicture: boolean,
	streamPriority: Array<PKStreamPriorityObject>,
	preferNative: PKPreferNativeConfigObject,
	[field: string]: any
};

declare type PKPlaybackOptionsObject = {
	html5: {
	hls: Object,
	dash: Object,
	[field: string]: any
	},
	[field: string]: any
};

declare type PKPlayerOptionsObject = {
	logLevel?: string,
	playback?: PKPlaybackConfigObject,
	sources?: PKSourcesConfigObject,
	plugins?: PKPluginsConfigObject,
	session?: PKSessionConfigObject,
	customLabels?: PKCustomLabelsConfigObject,
	[field: string]: any
};

declare type Transition = {
	[field: string]: any
};

declare type MaybeState = State | null;

declare type StateChanged = {
	oldState: MaybeState,
	newState: MaybeState,
	[field: string]: any
};

declare type PKPluginsConfigObject = {
	[field: string]: any
};

declare type PKPreferNativeConfigObject = {
	hls: boolean,
	dash: boolean,
	[field: string]: any
};

declare type PKSessionConfigObject = {
	id?: string,
	ks?: string,
	isAnonymous?: boolean,
	partnerId?: number,
	uiConfId?: number,
	[field: string]: any
};

declare type PKSourcesConfigObject = {
	hls: Array<PKMediaSourceObject>,
	dash: Array<PKMediaSourceObject>,
	progressive: Array<PKMediaSourceObject>,
	options: PKMediaSourceOptionsObject,
	type: string,
	dvr: boolean,
	metadata: PKMetadataConfigObject,
	id?: string,
	poster?: string,
	duration?: number,
	[field: string]: any
};

declare type PKStateTypes = {
	[field: string]: any
};

declare type PKStreamPriorityObject = {
	engine: string,
	format: string,
	[field: string]: any
};

declare type PKStreamTypes = {
	[field: string]: any
};

declare type PKTrackTypes = {
	[field: string]: any
};

declare type PKVideoElementStore = {
	[field: string]: any
} | {
	[field: string]: any
};


declare type KPEventTypes = {
	Core: PKEventTypes,
	UI: {
	[field: string]: any
	},
	Cast: {
	[field: string]: any
	},
	[field: string]: any
};

declare type KPOptionsObject = {
	targetId: string,
	logLevel?: string,
	disableUserCache?: boolean,
	playback?: PKPlaybackConfigObject,
	sources?: PKSourcesConfigObject,
	plugins?: PKPluginsConfigObject,
	session?: PKSessionConfigObject,
	provider: ProviderOptionsObject,
	playlist?: KPPlaylistConfigObject,
	ui: UIOptionsObject,
	cast?: {
	[field: string]: any
	},
	[field: string]: any
};

declare type PartialKPOptionsObject = {
	targetId: string,
	logLevel?: string,
	disableUserCache?: boolean,
	playback?: PKPlaybackConfigObject,
	sources?: PKSourcesConfigObject,
	plugins?: PKPluginsConfigObject,
	session?: PKSessionConfigObject,
	provider: ProviderOptionsObject,
	ui?: UIOptionsObject,
	cast?: {
	[field: string]: any
	},
	[field: string]: any
};

declare type LegacyPartialKPOptionsObject = {
	targetId: string,
	logLevel?: string,
	disableUserCache?: boolean,
	player?: PKPlayerOptionsObject,
	provider: ProviderOptionsObject,
	ui?: UIOptionsObject,
	[field: string]: any
};

declare type KalturaPlayers = {
	[field: string]: any
};

declare type KPPlaylistConfigObject = {
	id: string,
	metadata: KPPlaylistMetadata,
	options: KPPlaylistOptions,
	countdown: KPPlaylistCountdownOptions,
	items: Array<PlaylistItem>,
	[field: string]: any
};

declare type KPPlaylistCountdownOptions = {
	timeToShow?: number,
	duration: number,
	showing: boolean,
	[field: string]: any
};

declare type KPPlaylistItemConfigObject = {
	countdown?: KPPlaylistCountdownOptions,
	[field: string]: any
};

declare type KPPlaylistMetadata = {
	name: string,
	description: string,
	[field: string]: any
};

declare type KPPlaylistOptions = {
	autoContinue: boolean,
	[field: string]: any
};

declare type ProviderMediaInfoObject = {
	entryId: string,
	ks?: string
};

declare type OTTProviderMediaInfoObject = ProviderMediaInfoObject & {
	mediaType?: string,
	contextType?: string,
	protocol?: string,
	fileIds?: string,
	assetReferenceType?: string,
	formats?: Array<string>,
	urlType?: string
};

declare type MediaOptions = {
	startTime?: any;
	dvr?: boolean;
};

export class KalturaPlayer {
	setup(config: PartialKPOptionsObject | LegacyPartialKPOptionsObject): KalturaPlayer;
	constructor(options: KPOptionsObject);
	loadMedia(mediaInfo: ProviderMediaInfoObject | OTTProviderMediaInfoObject, mediaOptions?: MediaOptions): Promise<any>;
	setMedia(mediaConfig: ProviderMediaConfigObject): void;

	loadPlaylist(playlistInfo: ProviderPlaylistInfoObject, playlistCustomConfig: KPPlaylistConfigObject): Promise<any>;
	loadPlaylistByEntryList(entryList: ProviderEntryListObject, playlistCustomConfig: KPPlaylistConfigObject): Promise<any>;

	setPlaylist(playlistConfig: KPPlaylistConfigObject): void;

	getMediaInfo(): ?OTTProviderMediaInfoObject;

	configure(config: Object = {}): void;

	ready(): Promise<any>;

	load(): void;

	play(): void;

	pause(): void;

	getView(): HTMLElement;

	getVideoElement(): ?HTMLVideoElement;

	reset(): void;

	destroy(): void;

	isLive(): boolean;

	isDvr(): boolean;

	seekToLiveEdge(): void;

	getStartTimeOfDvrWindow(): number;

	getTracks(type?: string): Array<Track>;

	getActiveTracks(): Object;

	selectTrack(track: ?Track): void;

	hideTextTrack(): void;

	enableAdaptiveBitrate(): void;

	isAdaptiveBitrateEnabled(): boolean;

	setTextDisplaySettings(settings: Object): void;

	isFullscreen(): boolean;

	notifyEnterFullscreen(): void;

	notifyExitFullscreen(): void;

	enterFullscreen(): void;

	exitFullscreen(): void;

	enterPictureInPicture(): void;

	exitPictureInPicture(): void;

	isInPictureInPicture(): boolean;

	isPictureInPictureSupported(): boolean;

	getLogLevel(name?: string): Object;

	startCasting(type?: string): Promise<any>;

	isCastAvailable(type?: string): boolean;

	getCastSession(): ?RemoteSession;

	stopCasting(): void;

	isCasting(): boolean;

	isVr(): boolean;

	toggleVrStereoMode(): void;

	isInVrStereoMode(): boolean;

	setLogLevel(level: Object, name?: string): void;

	set textStyle(style: TextStyle): void;

	get textStyle(): ?TextStyle;

	get buffered(): ?TimeRanges;

	set currentTime(to: number): void;

	get currentTime(): number;

	get duration(): number;

	set volume(vol: number): void;

	get volume(): number;

	get paused(): boolean;

	get seeking(): boolean;

	set playsinline(playsinline: boolean): void;

	get playsinline(): boolean;

	set muted(mute: boolean): void;

	get muted(): boolean;

	get src(): string;

	get dimensions(): Object;

	get poster(): string;

	get ended(): boolean;

	set playbackRate(rate: number): void;

	get playbackRate(): number;

	get playbackRates(): Array<number>;

	get defaultPlaybackRate(): number;

	get engineType(): string;

	get streamType(): string;

	get env(): Object;

	get config(): Object;

	set loadingMedia(loading: boolean): void;

	get ads(): ?AdsController;

	get plugins(): {[name: string]: BasePlugin};

	get playlist(): PlaylistManager;

	get Event(): KPEventTypes;

	get TextStyle(): typeof TextStyle;

	get State(): PKStateTypes;

	get Track(): PKTrackTypes;

	get LogLevelType(): PKLogLevelTypes;

	get LogLevel(): PKLogLevels;

	get AbrMode(): PKAbrModes;

	get MediaType(): PKMediaTypes;

	get StreamType(): PKStreamTypes;

	get EngineType(): PKEngineTypes;

	get core(): PKCore;

	get Error(): typeof Error;

	addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: Event, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
	dispatchEvent(event: Event): boolean;
	removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;
	removeEventListener(type: Event, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;
}
