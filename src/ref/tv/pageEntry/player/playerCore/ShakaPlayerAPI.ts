import * as shakaPlayer from 'shaka-player';
import { PlayerAPI, PlayState, PlayerProperties } from './PlayerAPI';
import { wait } from 'ref/tv/util/itemUtils';

const ffRate = [-128, -64, -32, -16, -8, -4, -2, 1, 2, 4, 8, 16, 32, 64, 128];

const normalRate = 7; // the index of '1' in ffRate;

const ffStepInterval = 500;

export default class ShakaPlayerAPI implements PlayerAPI {
	private device: string;
	private player: any;
	private video: HTMLVideoElement;
	private curFFRateIndex: number;
	private ffTimer;
	private ffPos;
	private lastState: PlayState = PlayState.UNKNOWN;
	private pendingResumePointPosition: number;
	private elementBuffering: boolean;
	private elementSeeking: boolean;
	private playerBuffering: boolean;
	private videoPausedFlag: boolean;
	private loadCompleted = false;
	private playerProperties: PlayerProperties;

	playState: PlayState;
	endingTime: number;
	resumePosition: number;
	playerStateChanged: ({ key: string; value: (oldState: PlayState, newState: PlayState) => void })[];

	onError: (error) => void;
	onPlayerProperties: (playerProperties: PlayerProperties) => void;

	constructor(device: string) {
		this.device = device;
		this.video = document.getElementById('video0') as HTMLVideoElement;
		this.playState = PlayState.UNKNOWN;
		this.curFFRateIndex = normalRate;

		// The ending time default value is 15s. This value will be reset in the createVideo function of the PlayerCore class.
		this.endingTime = 15;

		this.playerStateChanged = [];

		this.player = new shakaPlayer.Player(this.video);
		shakaPlayer.polyfill.installAll();

		// Player events
		this.player.addEventListener('loading', this.onLoadingState);
		this.player.addEventListener('buffering', this.onBufferingState);

		// HTML Video events
		this.video.addEventListener('loadedmetadata', this.onLoadedmetadata);
		this.video.addEventListener('playing', this.onPlayingState);
		this.video.addEventListener('pause', this.onPauseState);
		this.video.addEventListener('ended', this.onEnded);
		this.video.addEventListener('error', this.onVideoError);
		this.video.addEventListener('timeupdate', this.updatePlayerProperties);
		this.video.addEventListener('seeking', this.onVideoSeeking);
		this.video.addEventListener('seeked', this.onVideoSeeked);
		this.video.addEventListener('waiting', this.onVideoWaiting);
	}

	onSeekingInteraction = () => {
		if (!this.elementSeeking) {
			this.elementSeeking = true;
			this.videoPausedFlag = this.video.paused;
			this.video.pause();
		}
	};

	isBrowserSupported() {
		return shakaPlayer.Player.isBrowserSupported();
	}

	loadVideo(src: api.MediaFile) {
		return this.player.load(src.url).then(() => {
			// this.play();
		});
	}

	getPosition = () => {
		return this.playerProperties && this.playerProperties.currentTime;
	};

	getDuration = () => {
		return this.playerProperties && this.playerProperties.duration;
	};

	getStreamBandwidth = () => {
		const { streamBandwidth } = this.player.getStats();
		return streamBandwidth;
	};

	play(startPoint?: number) {
		wait(
			() => {
				const curState = this.playState;
				switch (curState) {
					case PlayState.UNKNOWN:
					case PlayState.BUFFERING:
					case PlayState.LOADING:
					case PlayState.ENDED:
						return false;

					default:
						return true;
				}
			},
			() => {
				const newState = PlayState.PLAYING;

				if (this.curFFRateIndex !== normalRate) {
					this.endMove();
				}

				this.raisePlayerStateChanged(this.playState, newState);
				this.playState = newState;

				if (startPoint) {
					this.seek(startPoint);
				}

				this.videoPausedFlag = false;
				this.video.play();
			},
			() => {},
			15 * 1000
		);
	}

	pause(isManual?: boolean) {
		if (
			this.playState === PlayState.PLAYING ||
			this.playState === PlayState.FF ||
			this.playState === PlayState.REWIND
		) {
			if (!isManual) {
				this.videoPausedFlag = true;
			}

			this.video.pause();
		}
	}

	seek(time: number) {
		this.video.currentTime = time;
		this.playerProperties.currentTime = time;
		this.onPlayerProperties && this.onPlayerProperties(this.playerProperties);
	}

	setVolume(volume: number) {
		this.video.volume = volume;
	}

	replay() {
		switch (this.device) {
			case 'tv_samsung':
				this.seek(0);
				this.play();
				break;
			case 'tv_xboxone':
				this.pause();
				this.resetBufferingMode();
				this.emitStateChanged(PlayState.UNKNOWN);
				this.seek(0);
				this.play();
				break;
			default:
				this.resetBufferingMode();
				this.emitStateChanged(PlayState.UNKNOWN);
				this.seek(0);
				this.play();
				break;
		}
	}

	stop = () => {};

	dispose() {
		if (this.video.parentNode) this.video.parentNode.removeChild(this.video);

		this.loadCompleted = false;

		// Player events
		this.player.removeEventListener('loading', this.onLoadingState);
		this.player.removeEventListener('buffering', this.onBufferingState);
		this.player.unload();

		// HTML Video events
		this.video.removeEventListener('loadedmetadata', this.onLoadedmetadata);
		this.video.removeEventListener('playing', this.onPlayingState);
		this.video.removeEventListener('pause', this.onPauseState);
		this.video.removeEventListener('error', this.onVideoError);
		this.video.removeEventListener('timeupdate', this.updatePlayerProperties);
		this.video.removeEventListener('ended', this.onEnded);
		this.video.removeEventListener('seeking', this.onVideoSeeking);
		this.video.removeEventListener('seeked', this.onVideoSeeked);
		this.video.removeEventListener('waiting', this.onVideoWaiting);
	}

	getAvailableAudioTracks = () => {
		return [];
	};

	getAvailableTextTracks = () => {
		return [];
	};

	getAudioTrack = () => {
		return undefined;
	};

	setAudioTrack = (id: string) => {};

	getTextTrack = () => {
		return undefined;
	};

	setTextTrack = (id: string) => {};

	getPlaybackRate = () => {
		return ffRate[this.curFFRateIndex];
	};

	setPlaybackRate = (rate: number) => {
		const tarRateIndex = ffRate.findIndex(f => f === rate);

		if (tarRateIndex >= 0) this.curFFRateIndex = tarRateIndex;
	};

	getPausedFlag = (): boolean => {
		return this.videoPausedFlag;
	};

	fastforward = () => {
		if (
			this.playState === PlayState.PLAYING ||
			this.playState === PlayState.PAUSED ||
			this.playState === PlayState.FF ||
			this.playState === PlayState.REWIND
		) {
			if (this.playState === PlayState.PLAYING) {
				this.pause(true);
			}

			setImmediate(() => {
				this.fastforwardRewind(true);
			});
		}
	};

	rewind = () => {
		if (
			this.playState === PlayState.PLAYING ||
			this.playState === PlayState.PAUSED ||
			this.playState === PlayState.FF ||
			this.playState === PlayState.REWIND
		) {
			if (this.playState === PlayState.PLAYING) {
				this.pause(true);
			}

			setImmediate(() => {
				this.fastforwardRewind(false);
			});
		}
	};

	addEventListener(event: string, callback: () => void) {
		if (this.video && event && callback) {
			if (event === 'error') {
				this.player.addEventListener('error', callback);
			} else {
				this.video.addEventListener(event, callback);
			}
		}
	}

	removeEventListener(event: string, callback: () => void) {
		if (this.video && event && callback) {
			this.video.removeEventListener(event, callback);
		}
	}

	private onLoadingState = () => {
		this.emitStateChanged(PlayState.LOADING);
	};

	private emitStateChanged(state: PlayState) {
		if (state === this.playState || !this.loadCompleted) return;

		const newState = this.isBufferingMode() ? PlayState.BUFFERING : state;
		this.raisePlayerStateChanged(this.playState, newState);
		this.playState = newState;
	}

	private isBufferingMode() {
		return this.elementBuffering || this.playerBuffering || this.elementSeeking;
	}

	private resetBufferingMode() {
		this.elementBuffering = false;
		this.playerBuffering = false;
		this.elementSeeking = false;
	}

	private onBufferingState = e => {
		if (e.buffering) {
			this.playerBuffering = true;
			this.emitStateChanged(PlayState.BUFFERING);
		} else {
			this.playerBuffering = false;
			this.emitStateChanged(this.video.paused ? PlayState.PAUSED : PlayState.PLAYING);
		}
	};

	private onLoadedmetadata = () => {
		const { streamBandwidth } = this.player.getStats();
		const currentTime = this.resumePosition || 0;

		this.playerProperties = {
			currentTime: Math.ceil(currentTime),
			duration: Math.ceil(this.video.duration),
			streamBandwidth
		};
		this.loadCompleted = true;
		this.onPlayerProperties && this.onPlayerProperties(this.playerProperties);

		this.resetBufferingMode();
		this.emitStateChanged(PlayState.READY);
	};

	private onPlayingState = () => {
		this.resetBufferingMode();
		this.emitStateChanged(PlayState.PLAYING);
	};

	private onPauseState = () => {
		if (!this.videoPausedFlag) return;

		if (this.playerProperties.currentTime >= this.playerProperties.duration) this.emitStateChanged(PlayState.ENDED);
		else this.emitStateChanged(PlayState.PAUSED);
	};

	private onEnded = () => {
		this.resetBufferingMode();
		this.emitStateChanged(PlayState.ENDED);
	};

	private onVideoSeeking = () => {
		this.emitStateChanged(PlayState.BUFFERING);
	};

	private onVideoSeeked = () => {
		this.elementSeeking = false;
		if (this.videoPausedFlag) {
			this.emitStateChanged(PlayState.PAUSED);
		} else {
			this.video.play();
		}
	};

	private onVideoWaiting = () => {
		this.elementBuffering = true;
		this.emitStateChanged(PlayState.BUFFERING);
	};

	private onVideoError = error => {
		this.emitError(error);
	};

	private emitError(error) {
		if (this.onError) this.onError(error);
	}

	private updatePlayerProperties = () => {
		// do not remove !this.video.paused, we need it to support IE11 on Windows8
		// it triggers an extra timeupdate event after we call the pause method
		if (!this.video.paused && this.lastState !== PlayState.PLAYING) {
			// cancel buffering state if time changes
			this.emitStateChanged(PlayState.PLAYING);
		}

		const { streamBandwidth } = this.player.getStats();

		this.playerProperties = {
			currentTime: Math.ceil(this.video.currentTime),
			duration: Math.ceil(this.video.duration),
			streamBandwidth
		};
		this.onPlayerProperties && this.onPlayerProperties(this.playerProperties);
	};

	private onVideoReadyToPlay = () => {
		this.video.currentTime = this.pendingResumePointPosition;
		this.video.removeEventListener('canplay', this.onVideoReadyToPlay);
	};

	private fastforwardRewind = isFF => {
		switch (this.playState) {
			case PlayState.LOADING:
			case PlayState.UNKNOWN:
				return;
			default:
				break;
		}

		const curPos = this.getPosition();
		const duration = this.getDuration();

		if (isFF && duration - curPos <= this.endingTime) {
			this.play();
			return;
		}

		if (!isFF && curPos === 0) {
			return;
		}

		if (isFF) {
			if (this.curFFRateIndex < ffRate.length - 1) {
				this.curFFRateIndex++;
			}
		} else {
			if (this.curFFRateIndex > 0) {
				this.curFFRateIndex--;
			}
		}

		const newState =
			ffRate[this.curFFRateIndex] > 1
				? PlayState.FF
				: ffRate[this.curFFRateIndex] < 0
				? PlayState.REWIND
				: PlayState.PLAYING;

		if (newState === PlayState.PLAYING) {
			this.endMove();
		} else {
			this.stepMovePos();
		}

		this.raisePlayerStateChanged(this.playState, newState);
		this.playState = newState;
	};

	private endMove = () => {
		if (this.video) {
			this.seek(this.ffPos);
			this.video.play();
			clearInterval(this.ffTimer);
			this.ffTimer = undefined;

			this.curFFRateIndex = normalRate;

			const newState = PlayState.PLAYING;
			this.raisePlayerStateChanged(this.playState, newState);
			this.playState = newState;
		}
	};

	private stepMovePos = () => {
		if (!this.ffTimer) {
			this.ffPos = this.getPosition();
			const duration = this.getDuration();
			const { streamBandwidth } = this.player.getStats();

			this.ffTimer = setInterval(() => {
				const curPlayrate = this.getPlaybackRate();
				this.ffPos += this.getPlaybackRate() * (1000 / ffStepInterval);

				if (curPlayrate > 0) {
					if (duration - this.ffPos <= this.endingTime) {
						this.ffPos = duration - this.endingTime - 1;
						this.endMove();
					}
				} else {
					if (this.ffPos <= 0) {
						this.ffPos = 0;
						this.endMove();
					}
				}

				this.playerProperties = {
					currentTime: this.ffPos,
					duration,
					streamBandwidth
				};
				this.onPlayerProperties && this.onPlayerProperties(this.playerProperties);
			}, ffStepInterval);
		}
	};

	private raisePlayerStateChanged = (oldState: PlayState, newState: PlayState) => {
		for (let i = 0; i < this.playerStateChanged.length; i++) {
			this.playerStateChanged[i].value(oldState, newState);
		}
	};
}
