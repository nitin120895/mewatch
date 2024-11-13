export default class TestPlayer {
	_source: string;
	get source(): string {
		return this._source;
	}

	set source(value: string) {
		if (this._source !== value) {
			this._source = value;
			this.reset();
		}
	}

	_error: TestError;
	get error(): TestError {
		return this._error;
	}

	set error(value: TestError) {
		if (this._error !== value) {
			this._error = value;
			this.currentState = TestPlayerState.ERROR;
		}
	}

	_currentState: TestPlayerState;
	get currentState(): TestPlayerState {
		return this._currentState;
	}

	set currentState(value: TestPlayerState) {
		if (this._currentState !== value) {
			this._currentState = value;

			if (this.currentStateChange) {
				this.currentStateChange.forEach(callback => callback(value));
			}
		}
	}

	_currentTime: number;
	get currentTime(): number {
		return this._currentTime;
	}

	set currentTime(value: number) {
		if (this._currentTime !== value) {
			this._currentTime = value;

			if (this.currentTimeChange) {
				this.currentTimeChange.forEach(callback => callback(value));
			}
		}
	}

	volume: number;
	duration: number;
	playbackRateHandlerInterval: number;
	metadata: TestMetadata;

	currentStateChange: CurrentStateCallback[];
	currentTimeChange: CurrentTimeCallback[];

	private playbackRateHandler: TestPlaybackRateHandler;
	private playbackRate: number;

	constructor(playbackRate, duration, playbackRateHandlerInterval) {
		this.currentStateChange = [];
		this.currentTimeChange = [];

		this.playbackRate = playbackRate;
		this.duration = duration;
		this.playbackRateHandlerInterval = playbackRateHandlerInterval;
		this.reset();
	}

	play() {
		this._play();
	}

	_play() {
		switch (this.currentState) {
			case TestPlayerState.VOID:
				this.doLoadAndPlay();
				break;
			default:
				this.doPlay();
		}
	}

	private doLoadAndPlay() {
		this.disposePlaybackRateHandler();
		if (!this.source || this.source.length === 0) {
			this.setNoSourceError();
			return;
		}
		this.currentState = TestPlayerState.BUFFERING;
		this.metadata = new TestMetadata(1920, 1080, this.duration);
		this.doCurrentTimeUpdate(this._currentTime);
		this.doPlay();
	}

	doPlay() {
		this.disposePlaybackRateHandler();
		this.playbackRate = 1;
		this.currentState = TestPlayerState.PLAYING;
		this.playbackRateHandler = this.createPlaybackRateHandler();
	}

	pause() {
		this.doPause();
	}

	doPause() {
		this.disposePlaybackRateHandler();
		this.playbackRate = 1;
		this.currentState = TestPlayerState.PAUSED;
	}

	seek(time: number) {
		this._seek(time);
	}

	_seek(time: number) {
		if (this.isStateVoid() || !this.isMetadataLoaded()) {
			this.setSeekBeforeMetadataLoadedError();
			return;
		}

		this.currentState = TestPlayerState.BUFFERING;
		this.doSeek(time);
	}

	doSeek(time: number) {
		this.doCurrentTimeUpdate(time);
		this.currentState = TestPlayerState.SEEKED;
	}

	stop() {
		this.doStop();
	}

	doStop() {
		this.disposePlaybackRateHandler();
		this.source = undefined;
	}

	dispose() {
		this.stop();
		this.disposePlaybackRateHandler();
		this.disposeCollection(this.currentStateChange);
		this.disposeCollection(this.currentTimeChange);
	}

	reset() {
		this.metadata = undefined;
		this.playbackRate = 1;
		this.currentTime = 0;
		this.disposePlaybackRateHandler();
		this.currentState = TestPlayerState.VOID;
	}

	private doCurrentTimeUpdate(time: number) {
		this.currentTime = time;
		if (this.currentTime >= this.getDuration()) {
			this.currentState = TestPlayerState.ENDED;
		}
	}

	private createPlaybackRateHandler(): TestPlaybackRateHandler {
		const currentTime = !!this.currentTime ? this.currentTime : 0;
		const result = new TestPlaybackRateHandler(this.playbackRateHandlerInterval, this.playbackRate, currentTime);
		result.currentTimeChange = this.onPlaybackRateHandlerCurrentTimeChange;
		result.start();
		return result;
	}

	private disposePlaybackRateHandler() {
		if (!this.playbackRateHandler) return;

		this.playbackRateHandler.dispose();
		this.playbackRateHandler = undefined;
	}

	private onPlaybackRateHandlerCurrentTimeChange = (time: number) => {
		if (this.currentState === TestPlayerState.ENDED) {
			this.disposePlaybackRateHandler();
			return;
		}

		if (time <= 0) {
			this.disposePlaybackRateHandler();
			this.pause();
			this.seek(0);
			return;
		}

		if (this.metadata && this.metadata.duration > 0 && time >= this.metadata.duration) {
			this.disposePlaybackRateHandler();
			this.seek(this.metadata.duration);
			return;
		}

		this.currentTime = time;
	};

	private disposeCollection(collection: Array<any>) {
		collection.forEach(item => delete collection[item]);
	}

	private isMetadataLoaded() {
		return this.metadata !== undefined;
	}

	private isStateVoid(value?: TestPlayerState) {
		if (!value) value = this.currentState;
		return value === TestPlayerState.VOID || value === undefined;
	}

	private getDuration() {
		return !!this.metadata ? this.metadata.duration : 0;
	}

	// errors
	protected setNoSourceError() {
		this.error = new TestError(TestErrorType.SOURCE_INVALID, 'NO_SOURCE_ERROR');
	}

	protected setSeekBeforeMetadataLoadedError() {
		this.error = new TestError(TestErrorType.SOURCE_INVALID, 'SEEK_BEFORE_METADATA_LOADED');
	}

	protected setSeekPendingError() {
		this.error = new TestError(TestErrorType.NETWORK_ERROR, 'SEEK_PENDING_ERROR');
	}
}

export enum TestPlayerState {
	VOID = 'VOID',
	PLAYING = 'PLAYING',
	PAUSED = 'PAUSED',
	ERROR = 'ERROR',
	TIME_UPDATE = 'TIME_UPDATE',
	ENDED = 'ENDED',
	SEEKING = 'SEEKING',
	SEEKED = 'SEEKED',
	BUFFERING = 'BUFFERING'
}

export enum TestErrorType {
	NETWORK_ERROR = 'NETWORK_ERROR',
	SOURCE_NOT_SUPPORTED = 'SOURCE_NOT_SUPPORTED',
	SOURCE_INVALID = 'SOURCE_INVALID',
	UNKNOWN = 'UNKNOWN'
}

export class TestMetadata {
	width: number;
	height: number;
	duration: number;

	constructor(width: number, height: number, duration: number) {
		this.width = width;
		this.height = height;
		this.duration = duration;
	}
}

export class TestError {
	type: TestErrorType;
	code: string;
	message: string;

	constructor(type: TestErrorType, code: string, message?: string) {
		this.type = type;
		this.code = code;
		this.message = message;
	}
}

export class TestPlaybackRateHandler {
	currentTimeChange: (number) => void;
	interval: number;
	playbackRate: number;

	private _currentTime: number;

	get currentTime(): number {
		return this._currentTime;
	}

	set currentTime(value: number) {
		if (this._currentTime !== value) {
			this._currentTime = value;
			if (this.currentTimeChange) this.currentTimeChange(value);
		}
	}

	private timer: number;

	constructor(interval: number, playbackRate: number, currentTime: number) {
		this.interval = interval;
		this.playbackRate = playbackRate;
		this.currentTime = currentTime;
	}

	dispose() {
		this.currentTimeChange = undefined;
		clearTimeout(this.timer);
		this.timer = undefined;
	}

	start() {
		if (!!this.timer) return;
		this.timer = window.setInterval(() => this.onTimerRun(), Math.floor(this.interval * 1000));
	}

	onTimerRun() {
		this.currentTime += this.playbackRate * this.interval;
	}
}

interface CurrentStateCallback {
	(state: TestPlayerState): void;
}

interface CurrentTimeCallback {
	(time: number): void;
}
