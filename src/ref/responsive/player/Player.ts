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
	SetVolume = 'SetVolume',
	ActuatePlay = 'ActuatePlay',
	ActuatePause = 'ActuatePause',
	ActuateSeek = 'ActuateSeek',
	ActuateSeekEnd = 'ActuateSeekEnd',
	CanPlay = 'CanPlay',
	SetResumePoint = 'SetResumePoint'
}

export type PlayerProperties = {
	itemId?: string;
	currentTime?: number;
	duration?: number;
	isMuted?: boolean;
	volume?: number;
	device?: string;
	streamBandwidth?: number;
};

export type PlayerError = {
	title: string;
	description?: string;
};

/**
 * Properties passed into the video player.
 */
export type InitPlaybackOptions = {
	item?: api.ItemDetail;
	data?: api.MediaFile[];
	autoPlay: boolean;
	startTime?: number;
	chainPlayCountdown?: number;
};

export type PlayerFlags = {
	isBrowserSupported: boolean;
	isAutoPlayEnabled: boolean;
};

export interface PlayerInterface {
	flags: PlayerFlags;
	ownControls: boolean;
	initPlayback(container: HTMLElement, options: InitPlaybackOptions): Promise<boolean>;
	play(): void;
	pause(): void;
	stop();
	onSeekingInteraction(): void;
	seek(time: number): void;
	setVolume(volume: number): void;
	replay(): void;
	dispose(): void;
	addListener(type: PlayerEventType, handler: PlayerEventHandler);
	removeListener(type: PlayerEventType, handler: PlayerEventHandler);
	emit(type: PlayerEventType, data: any);
	selectMedia(media: api.MediaFile[]): api.MediaFile;
	// chromecast need it
	getLastState(): PlayerState;
	getLastProperties(): PlayerProperties;
	loadNextItem(options: InitPlaybackOptions): void;
}

export interface PlayerEventHandler {
	(data: any): void;
}

export type PlayerEventType = 'properties' | 'state' | 'error' | 'action';

export type InitCastPlaybackOptions = {
	mediaUrl: string;
	item: api.ItemDetail;
	resumePosition: number;
};
