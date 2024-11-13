import * as React from 'react';
import * as PropTypes from 'prop-types';
import { PlayerAPI, PlayState, PlayerProperties } from './PlayerAPI';
import { waitUntil } from 'ref/tv/util/itemUtils';
import { DetailHelper } from 'ref/tv/util/detailHelper';

export type PlayerCoreProps = {
	device: string;
	videoItem: api.MediaFile;
	playItemType: string;
	resumePosition?: number;
	isFullscreen: boolean;
	isLoading: boolean;
	playerStateChanged: (oldState: PlayState, newState: PlayState) => void;
	onPlayerPropertiesChanged: (playerProperties: PlayerProperties) => void;
	endModeChanged?: (isEndMode: boolean) => void;
	onVideoStop: () => void;
};

const id = 'PlayerCore';

// Wait for 30 seconds and show error message if always loading
const loadingTimeout = 30 * 1000;

export abstract class PlayerCore<P extends PlayerCoreProps> extends React.PureComponent<P, any> {
	context: {
		detailHelper: DetailHelper;
	};

	static contextTypes: any = {
		detailHelper: PropTypes.object.isRequired
	};

	video: PlayerAPI;
	private isEndMode: boolean;
	private loadingTimer;
	private waitingTime = 0;
	private waitingIntervalTimer;
	private disposed = false;

	abstract createVideoComponent();

	onLoadingTimeout: ({ key: string; value: () => void })[] = [];
	onError: ({ key: string; value: (e) => void })[] = [];

	componentDidMount() {
		this.disposed = false;
	}

	componentWillUnmount() {
		if (this.loadingTimer) {
			clearTimeout(this.loadingTimer);
		}

		clearInterval(this.waitingIntervalTimer);

		this.disposeVideo();

		this.disposed = true;
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.videoItem) {
			if (this.props.videoItem && this.props.videoItem.url === nextProps.videoItem.url) return;

			setImmediate(() => {
				waitUntil(
					() => {
						return !!document.getElementById('video0');
					},
					() => {
						if (!this.disposed) this.start(nextProps.videoItem);
					}
				);
			});
		}

		if (nextProps.resumePosition && nextProps.resumePosition !== this.props.resumePosition) {
			this.seek(nextProps.resumePosition);
		}
	}

	start = src => {
		this.prepareVideo(src);
		this.play();
		this.waitingIntervalTimer = setInterval(() => {
			if (!this.video || this.video.playState === PlayState.LOADING || this.video.playState === PlayState.BUFFERING) {
				this.waitingTime += 100;
				if (this.waitingTime >= loadingTimeout) {
					this.raiseLoadTimeoutEvent();
					clearInterval(this.waitingIntervalTimer);
					this.waitingIntervalTimer = undefined;
				}
			} else {
				this.waitingTime = 0;
			}
		}, 100);
	};

	prepareVideo(src) {
		this.disposeVideo();
		this.createVideo(src);
	}

	createVideo(src) {
		this.isEndMode = false;
		this.video = this.createVideoComponent();
		this.video.playerStateChanged.push({ key: id, value: this.props.playerStateChanged });
		this.video.onPlayerProperties = this.onPlayerProperties;
		this.video.endingTime =
			this.props.playItemType === 'trailer' ? 1 : this.context.detailHelper.config.playback.chainPlaySqueezeback;
		this.video.resumePosition = this.props.resumePosition;
		this.video.addEventListener('error', this.raiseErrorEvent);
		this.video.loadVideo(src);
	}

	disposeVideo() {
		this.props.playerStateChanged && this.props.playerStateChanged(PlayState.UNKNOWN, PlayState.ENDED);

		if (this.video) {
			this.video.playerStateChanged.splice(this.video.playerStateChanged.findIndex(p => p.key === id));
			this.video.dispose();
		}

		this.video = undefined;
	}

	play = () => {
		this.video && this.video.play(this.props.resumePosition);
	};

	pause = () => {
		this.video && this.video.pause();
	};

	stop = () => {
		this.video && this.video.stop();
	};

	seek = (value: number) => {
		this.video && this.video.seek(value);
	};

	replay = () => {
		this.video && this.video.replay();
	};

	private onPlayerProperties = (playerProperties: PlayerProperties) => {
		this.waitingTime = 0;

		const curPos = Math.floor(playerProperties.currentTime);
		const duration = playerProperties.duration;

		if (duration > 0 && this.video) {
			this.props.onPlayerPropertiesChanged && this.props.onPlayerPropertiesChanged(playerProperties);

			if (duration - curPos <= this.video.endingTime) {
				if (!this.isEndMode) {
					this.isEndMode = true;
					clearInterval(this.waitingIntervalTimer);
					this.props.endModeChanged && this.props.endModeChanged(this.isEndMode);
				}
			} else {
				if (this.isEndMode) {
					this.isEndMode = false;
					this.props.endModeChanged && this.props.endModeChanged(this.isEndMode);
				}
			}
		}
	};

	private raiseLoadTimeoutEvent = () => {
		for (let i = 0; i < this.onLoadingTimeout.length; i++) {
			this.onLoadingTimeout[i].value();
		}
	};

	private raiseErrorEvent = e => {
		for (let i = 0; i < this.onError.length; i++) {
			this.onError[i].value(e);
		}
	};
}
