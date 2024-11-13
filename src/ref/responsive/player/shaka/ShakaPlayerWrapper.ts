import * as shakaPlayer from 'shaka-player';
import { isMobile, promiseFromEvent } from 'shared/util/browser';
import { VideoError, VideoErrorCode } from 'shared/util/VideoError';
import { BasePlayerWrapper } from '../BasePlayerWrapper';
import { InitPlaybackOptions, PlayerAction, PlayerFlags, PlayerState } from '../Player';
import { getVideoErrorForShakaError } from './ShakaError';

let isBrowserPolyfillsInstalled: boolean;

// Not much point resuming a video < n seconds
const RESUME_THRESHOLD = 2;

export class ShakaPlayerWrapper extends BasePlayerWrapper {
	private hasPlayed = false;
	private shaka: any;
	private video: HTMLVideoElement;

	private isBuffering: boolean;

	private elementSeeking: boolean;

	private lastTime: number;
	private isVideoPaused: boolean;

	constructor() {
		super();

		this.video = document.createElement('video');
		this.video.className = 'video';
		this.video.setAttribute('width', '100%');

		this.shaka = new shakaPlayer.Player(this.video);

		// Player events
		this.shaka.addEventListener('loading', this.onLoadingState);
		this.shaka.addEventListener('buffering', this.onBufferingState);

		// HTML Video events
		this.video.addEventListener('playing', this.onPlayingState);
		this.video.addEventListener('pause', this.onPauseState);
		this.video.addEventListener('ended', this.onEnded);
		this.video.addEventListener('error', this.onVideoError);
		this.video.addEventListener('timeupdate', this.updatePlayerProperties);
		this.video.addEventListener('seeking', this.onVideoSeeking);
		this.video.addEventListener('waiting', this.onVideoWaiting);
		this.video.addEventListener('canplay', this.onVideoCanPlay);

		this.flags = this.getPlayerFlags();
	}

	private getPlayerFlags(): PlayerFlags {
		return {
			isBrowserSupported: isBrowserSupported(),
			isAutoPlayEnabled: !isMobile()
		};
	}

	private emitStateChanged(state: PlayerState) {
		if (state === this.lastState) return;
		this.lastState = state;
		this.emit('state', state);
	}

	private setBufferingState(isBuffering: boolean) {
		this.isBuffering = isBuffering;
		this.isBuffering && this.emitStateChanged(PlayerState.BUFFERING);
	}

	private onLoadingState = () => {
		this.emitStateChanged(PlayerState.LOADING);
	};

	private onBufferingState = e => {
		this.setBufferingState(e.buffering);
	};

	private onPlayingState = () => {
		// The first playing state is skipped because it doesn't represent the
		// actual playing of a video. Playing state is emitted when time is actually changed
		if (this.hasPlayed) {
			this.setBufferingState(false);
			this.emitStateChanged(PlayerState.PLAYING);
		}
	};

	private onPauseState = () => {
		this.emitStateChanged(this.elementSeeking ? PlayerState.SEEK_PAUSED : PlayerState.PAUSED);
	};

	private onEnded = () => {
		this.emitStateChanged(PlayerState.ENDED);
	};

	private onVideoSeeking = () => {
		this.setBufferingState(true);
		this.emitStateChanged(PlayerState.SEEKING);
	};

	private onVideoWaiting = () => {
		this.setBufferingState(true);
	};

	// Returns a promise that resolve if error is handled gracefully
	private onVideoError = (e): Promise<any> => {
		// Catch AutoPlay Errors gracefully
		if (!this.hasPlayed && (e instanceof DOMException && e.name === 'NotAllowedError')) {
			this.setBufferingState(false);
			this.emitStateChanged(PlayerState.READY);
			return Promise.resolve();
		} else {
			const error =
				e instanceof VideoError ? e : new VideoError('Video Playback Error: ' + e.message, VideoErrorCode.PlayerError);
			this.emitError(error);
			return Promise.reject(error);
		}
	};

	private emitError(error: any) {
		this.emit('error', error);
	}

	play(): Promise<VideoError | void> {
		return Promise.resolve(this.video.play()).catch(this.onVideoError);
	}

	pause() {
		this.video.pause();
		this.emitStateChanged(this.elementSeeking ? PlayerState.SEEK_PAUSED : PlayerState.PAUSED);
	}

	seek(endTime: number): Promise<void> {
		if (!isNaN(endTime) && endTime >= 0) {
			const promise = promiseFromEvent(this.video, 'seeking')
				.then(() => promiseFromEvent(this.video, 'seeked'))
				.then<any>(() => {
					this.elementSeeking = false;
					this.emit('action', { name: PlayerAction.ActuateSeek });
					this.isVideoPaused ? this.pause() : this.play();
				})
				.catch(this.onVideoError);

			this.video.currentTime = endTime;

			return promise;
		} else {
			return Promise.resolve();
		}
	}

	onSeekingInteraction = () => {
		if (!this.elementSeeking) {
			this.isVideoPaused = this.video.paused;
			if (!this.isVideoPaused) this.video.pause();
			this.elementSeeking = true;
		}
	};

	replay() {
		this.emitStateChanged(PlayerState.UNKNOWN);
		this.seek(0).then(() => this.play());
	}

	setVolume(volume: number) {
		this.video.volume = volume;
	}

	dispose() {
		if (this.video.parentNode) this.video.parentNode.removeChild(this.video);

		// Player events
		this.shaka.removeEventListener('loading', this.onLoadingState);
		this.shaka.removeEventListener('buffering', this.onBufferingState);
		this.shaka.unload();

		// HTML Video events
		this.video.removeEventListener('playing', this.onPlayingState);
		this.video.removeEventListener('pause', this.onPauseState);
		this.video.removeEventListener('error', this.onVideoError);
		this.video.removeEventListener('timeupdate', this.updatePlayerProperties);
		this.video.removeEventListener('ended', this.onEnded);
		this.video.removeEventListener('seeking', this.onVideoSeeking);
		this.video.removeEventListener('waiting', this.onVideoWaiting);
		this.video.removeEventListener('canplay', this.onVideoCanPlay);
	}

	private updatePlayerProperties = () => {
		const currentTime = Math.round(this.video.currentTime);
		// we need to change playing state when time is changed instead of changing
		// after firing `playing` event cause when autoplay is blocked by a user then
		// `playing` event is still fired
		if (!this.hasPlayed && this.lastTime !== currentTime) {
			this.hasPlayed = true;
		}
		// do not remove !this.video.paused, we need it to support IE11 on Windows8
		// it triggers an extra timeupdate event after we call the pause method
		if (this.lastTime !== currentTime && !this.video.paused && this.lastState !== PlayerState.PLAYING) {
			// cancel buffering state if time changes
			this.onPlayingState();
		}

		const { streamBandwidth } = this.shaka.getStats();

		const playerProperties = {
			currentTime: currentTime || 0,
			duration: Math.floor(this.video.duration) || 0,
			streamBandwidth
		};

		this.lastTime = playerProperties.currentTime;

		this.lastProperties = Object.assign(this.lastProperties, playerProperties);
		this.emit('properties', this.lastProperties);
	};

	private setVideoAttributes(options: InitPlaybackOptions) {
		if (this.flags.isAutoPlayEnabled && options.autoPlay) this.video.setAttribute('autoplay', 'true');
		// setup default 0 volume for video, user's value will be setup from Player controls component
		this.setVolume(0);
	}

	selectMedia(media: api.MediaFile[] | undefined): api.MediaFile {
		return media && media.find(item => item.format.toLocaleLowerCase() === 'video/mpd');
	}

	private onVideoCanPlay = () => {
		this.emit('action', { name: PlayerAction.CanPlay });
	};

	private resumeAtPoint(targetTimeSeconds: number): Promise<void> {
		if (targetTimeSeconds >= RESUME_THRESHOLD) {
			this.emit('action', { name: PlayerAction.SetResumePoint });
			return this.seek(targetTimeSeconds);
		} else {
			return Promise.resolve();
		}
	}

	initPlayback(container: HTMLElement, options: InitPlaybackOptions): Promise<boolean> {
		if (!options) return;
		this.initOptions = options;

		this.lastTime = options.startTime;
		container.appendChild(this.video);
		const videoMedia = this.selectMedia(options.data);

		if (!videoMedia || !videoMedia.url) {
			this.emitError(new VideoError('Undefined URL', VideoErrorCode.BadVideoDataError));
			return Promise.resolve(false);
		}

		return this.shaka
			.load(videoMedia.url)
			.then(() => this.setVideoAttributes(options))
			.then(() => promiseFromEvent(this.video, 'canplay'))
			.then(() => this.resumeAtPoint(options.startTime))
			.then(() => {
				const { streamBandwidth } = this.shaka.getStats();

				// we need to call this due to duration update, when video is loaded, but with start time as current video time
				this.lastProperties = {
					currentTime: options.startTime,
					duration: Math.floor(this.video.duration) || 0,
					streamBandwidth
				};

				this.emit('properties', this.lastProperties);

				// autoplay attribute doesn't work on mobile browsers,
				// in this case, when video is loaded emit READY
				if (!options.autoPlay || !this.flags.isAutoPlayEnabled) {
					this.emitStateChanged(PlayerState.READY);
				} else {
					return this.play();
				}
			})
			.then(() => true)
			.catch(error => {
				this.emitError(getVideoErrorForShakaError(error));
				return false;
			});
	}
}

export function isBrowserSupported() {
	if (window.location.protocol === 'http:') return true;
	return shakaPlayer.Player.isBrowserSupported();
}

// Install built-in polyfills to patch browser incompatibilities.
export function installPolyfills() {
	if (!isBrowserPolyfillsInstalled) {
		shakaPlayer.polyfill.installAll();
		isBrowserPolyfillsInstalled = true;
	}
}

installPolyfills();
