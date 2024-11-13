import TestPlayer from './TestPlayer';

export default class TestAsyncPlayer extends TestPlayer {
	TIMEOUT = 10;

	pauseTimer: any;
	playTimer: any;
	seekTimer: any;

	constructor(playbackRate = 1, duration = 2 * 60 * 60, playbackRateHandlerInterval = 0.25) {
		super(playbackRate, duration, playbackRateHandlerInterval);
	}

	private doAsyncPause() {
		this.disposePauseTimer();
		this.pauseTimer = setTimeout(() => {
			this.doPause();
			this.pauseTimer = undefined;
		}, this.TIMEOUT);
	}

	private doAsyncPlay() {
		this.disposePlayTimer();
		this.playTimer = window.setTimeout(() => {
			this._play();
			this.playTimer = undefined;
		}, this.TIMEOUT);
	}

	private doAsyncSeek(time: number) {
		if (this.isSeekPending()) {
			this.disposeSeekTimer();
			this.setSeekPendingError();
			return;
		}

		this.seekTimer = setTimeout(() => {
			this._seek(time);
			this.seekTimer = undefined;
		}, this.TIMEOUT);
	}

	private disposePauseTimer() {
		if (this.pauseTimer) {
			clearTimeout(this.pauseTimer);
			this.pauseTimer = undefined;
		}
	}

	private disposePlayTimer() {
		if (this.playTimer) {
			clearTimeout(this.playTimer);
			this.playTimer = undefined;
		}
	}

	private disposeSeekTimer() {
		if (this.seekTimer) {
			clearTimeout(this.seekTimer);
			this.seekTimer = undefined;
		}
	}

	pause() {
		this.doAsyncPause();
	}

	play() {
		this.doAsyncPlay();
	}

	seek(time: number) {
		this.doAsyncSeek(time);
	}

	isSeekPending() {
		return this.seekTimer !== undefined;
	}
}
