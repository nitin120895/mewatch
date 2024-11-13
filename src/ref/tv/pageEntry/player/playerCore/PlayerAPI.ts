export type AudioTrack = {
	id: string;
	language: string;
	active: boolean;
};

export type TextTrack = {
	id: string;
	language: string;
	active: boolean;
};

export type ImageTrack = {
	/**
	 * the raw data for the image object.
	 * You can display the corresponding image on your page thanks to the browser window.URL.createObjectURL API.
	 */
	data: Uint8Array;

	/**
	 * the position (relatively to the player's getPosition API) the image should be displayed at, in milliseconds.
	 */
	ts: number;

	/**
	 * the duration, in s, until a new image can be considered.
	 */
	duration: number;
};

export enum PlayState {
	UNKNOWN = 'UNKNOWN',
	LOADING = 'LOADING',
	READY = 'READY',
	BUFFERING = 'BUFFERING',
	PAUSED = 'PAUSED',
	PLAYING = 'PLAYING',
	FF = 'FF',
	REWIND = 'REWIND',
	ENDED = 'ENDED'
}

export const ccLabelMap = {
	// https://www.loc.gov/standards/iso639-2/php/English_list.php
	en: 'English',
	de: 'German',
	ch: 'Chinese',
	fr: 'French',
	es: 'Spanish',
	ja: 'Japanese',
	it: 'Italian',
	ko: 'Korean',
	ru: 'Russian'
};

export type PlayerProperties = {
	currentTime: number;
	duration: number;
	streamBandwidth?: number;
};

export type InitPlaybackOptions = {
	item: api.ItemDetail;
	data?: api.MediaFile[];
	autoPlay: boolean;
	startTime?: number;
};

export interface PlayerAPI {
	playState: PlayState;
	resumePosition: number;
	endingTime: number;
	playerStateChanged: ({ key: string; value: (oldState: PlayState, newState: PlayState) => void })[];
	loadVideo: (src: api.MediaFile) => void;
	getPosition: () => number;
	getDuration: () => number;
	getStreamBandwidth: () => number;
	play: (startPoint?: number) => void;
	pause: (isManual?: boolean) => void;
	seek: (pos: number) => void;
	setVolume(volume: number): void;
	replay(): void;
	onError: (error) => void;
	onPlayerProperties: (playerProperties: PlayerProperties) => void;
	stop: () => void;
	dispose: () => void;

	getAvailableAudioTracks: () => AudioTrack[];
	getAvailableTextTracks: () => TextTrack[];
	getAudioTrack: () => AudioTrack;
	setAudioTrack: (id: string) => void;
	getTextTrack: () => TextTrack;
	setTextTrack: (id: string) => void;
	getPlaybackRate: () => number;
	setPlaybackRate: (rate: number) => void;
	getPausedFlag: () => boolean;
	fastforward: () => void;
	rewind: () => void;

	addEventListener: (event: string, callback: (e?: any) => void) => void;
	removeEventListener: (event: string, callback: (e?: any) => void) => void;
}
