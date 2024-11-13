import {
	InitPlaybackOptions,
	PlayerEventHandler,
	PlayerEventType,
	PlayerFlags,
	PlayerInterface,
	PlayerProperties,
	PlayerState
} from './Player';

export abstract class BasePlayerWrapper implements PlayerInterface {
	ownControls = false;
	initOptions: InitPlaybackOptions;
	lastState: PlayerState = PlayerState.READY;
	lastProperties: PlayerProperties = {};
	flags: PlayerFlags;

	private listeners: Object = {};

	addListener(type: PlayerEventType, handler: PlayerEventHandler) {
		if (!this.listeners[type]) this.listeners[type] = [];
		this.listeners[type].push(handler);
	}

	removeListener(type: PlayerEventType, handler: PlayerEventHandler) {
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
	abstract play(): void;
	abstract pause(): void;
	abstract seek(time: number): void;
	abstract setVolume(volume: number): void;
	abstract replay(): void;
	abstract dispose(): void;
}
