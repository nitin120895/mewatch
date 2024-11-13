import {
	InitPlaybackOptions,
	PlayerEventType,
	PlayerEventHandler,
	PlayerState,
	PlayerProperties,
	PlayerInterface,
	KalturaPlayerTrack,
	PlayerSubtitleTrack,
	PlayerAudioTrack,
	PlayerPlaybackRateInformation
} from './Player';
import { PlayerFlags } from 'ref/responsive/player/Player';

export abstract class BasePlayerWrapper implements PlayerInterface {
	flags: PlayerFlags;
	ownControls = false;
	initOptions: InitPlaybackOptions;
	lastState: PlayerState = PlayerState.READY;
	lastProperties: PlayerProperties = {};

	private listeners: Object = {};

	addListener(type: PlayerEventType, handler: PlayerEventHandler): void {
		if (!this.listeners[type]) this.listeners[type] = [];
		this.listeners[type].push(handler);
	}

	removeListener(type: PlayerEventType, handler: PlayerEventHandler): void {
		const listeners: PlayerEventHandler[] = this.listeners[type];
		if (listeners && listeners.length > 0) {
			const index = listeners.indexOf(handler);
			if (index >= 0) listeners.splice(index, 1);
		}
	}

	emit(type: PlayerEventType, data: any) {
		const listeners: PlayerEventHandler[] = this.listeners[type];
		if (listeners && listeners.length > 0) {
			listeners.forEach(handler => {
				handler(data);
			});
		}
	}

	getLastState(): PlayerState {
		return this.lastState as PlayerState;
	}

	getLastProperties(): PlayerProperties {
		return this.lastProperties as PlayerProperties;
	}

	loadNextItem(options: InitPlaybackOptions): void {}

	onSeekingInteraction = () => {};

	stop(): void {}

	abstract selectMedia(media: api.MediaFile[] | undefined): api.MediaFile;
	abstract initPlayback(container: HTMLElement, options: InitPlaybackOptions): Promise<boolean>;
	abstract play(isUserClick?: boolean): void;
	abstract pause(isUserClick?: boolean): void;
	abstract playbackRates(): PlayerPlaybackRateInformation[];
	abstract selectPlaybackSpeed(speed: number): void;
	abstract seek(time: number): void;
	abstract setVolume(volume: number): void;
	abstract replay(): void;
	abstract toggleStartOver(): void;
	abstract dispose(): void;

	abstract getVideoTracks(): KalturaPlayerTrack[];
	abstract getTextTracks(): PlayerSubtitleTrack[];
	abstract getAudioTracks(): PlayerAudioTrack[];
	abstract selectSubtitle(lang: string): void;
	abstract selectAudio(lang: string): void;
	abstract selectVideo(track: KalturaPlayerTrack): void;
	abstract enableAdaptiveBitrate(): void;
	abstract setVolumeMutedState(isMuted: boolean, toggleMute?: (isMuted) => void): void;
	abstract configure(Object: any): void;
	abstract isAdsEnded(): boolean;
	abstract isAdPlaying(): boolean;
}
