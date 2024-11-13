import { PlayerProperties, PlayerState, InitPlaybackOptions } from '../Player';
import { RemotePlayerEvents, CastState } from './Cast';
import { BasePlayerWrapper } from '../BasePlayerWrapper';
import { isEpisode } from '../../util/item';

const CONTENT_TYPE = 'application/dash+xml';
const PLAYBACK_STATE = [
	PlayerState.PLAYING,
	PlayerState.PAUSED,
	PlayerState.BUFFERING,
	PlayerState.READY,
	PlayerState.ENDED
];

export class CastWrapper extends BasePlayerWrapper {
	private player;
	private playerController;
	private initPromise: Promise<boolean>;

	constructor(loadCastSDK: Promise<boolean>) {
		super();
		this.initPromise = loadCastSDK.then((result: any) => {
			if (result && !result.isAvailable) return false;

			// Setup chromecast events listeners
			this.addStateChangeListener();

			// Get links to chromecast remote player and remote player controller
			this.player = new cast.framework.RemotePlayer();
			this.playerController = new cast.framework.RemotePlayerController(this.player);

			// Setup remote player events listeners
			this.addPlayerEventListener();
			return true;
		});

		this.flags = {
			isBrowserSupported: true,
			isAutoPlayEnabled: true
		};
	}

	initPlayback(container: HTMLElement, options: InitPlaybackOptions): Promise<boolean> {
		if (!options) return;

		// stop player controller before init new playback
		if (this.playerController) this.playerController.stop();

		this.initOptions = options;
		this.emitPlayerProperties({
			itemId: options.item.id,
			currentTime: 0,
			duration: 0
		});
		this.emitStateChanged(PlayerState.BUFFERING);

		return this.initPromise.then(() => {
			const castSession = this.getCastSession();
			if (castSession) {
				const sessionObj = castSession.getSessionObj();
				const mediaInfo = this.getCastMediaInfo(options);
				const queueItem = new chrome.cast.media.QueueItem(mediaInfo);
				queueItem.startTime = options.startTime;
				queueItem.customData = mediaInfo.customData;

				const request = new chrome.cast.media.QueueLoadRequest([queueItem]);

				return new Promise<boolean>(function(resolve, reject) {
					sessionObj.queueLoad(request, () => resolve(true), error => resolve(false));
				});
			}

			return false;
		});
	}

	private getCastSession() {
		return cast && cast.framework.CastContext.getInstance().getCurrentSession();
	}

	private getCastDevice() {
		const castSession = this.getCastSession();
		this.emitPlayerProperties({
			device: castSession && castSession.getCastDevice() && castSession.getCastDevice().friendlyName
		});
	}

	private getCastMediaInfo(options: InitPlaybackOptions): any {
		const cMedia = chrome.cast.media;
		const mediaUrl = this.selectMedia(options.data).url;
		const mediaInfo = new cMedia.MediaInfo(mediaUrl, CONTENT_TYPE);
		const { id, type, duration } = options.item;

		const isShowMetadata = isEpisode(options.item);
		mediaInfo.metadata = isShowMetadata ? new cMedia.GenericMediaMetadata() : new cMedia.MovieMediaMetadata();
		mediaInfo.metadata.title = this.getMetadataTitle(options.item) || '';

		if (isShowMetadata) {
			const seasonNumber = options.item.season && options.item.season.seasonNumber;
			mediaInfo.metadata.seriesTitle = mediaInfo.metadata.subtitle =
				`S${seasonNumber} E${options.item.episodeNumber} - ${options.item.episodeName}` || '';
		} else {
			mediaInfo.metadata.subtitle = options.item.shortDescription || '';
		}

		mediaInfo.metadata.images = this.convertImages(options.item) || [];
		mediaInfo.duration = duration;
		mediaInfo.customData = {
			Axis_ItemId: id,
			type
		};

		return mediaInfo;
	}

	private getMetadataTitle(item: api.ItemDetail) {
		return isEpisode(item) ? item.season && item.season.show && item.season.show.title : item.title;
	}

	private convertImages(item: api.ItemDetail) {
		let castImages = [];
		const { images } = item;

		if (images) {
			if (images['wallpaper']) {
				castImages.push(new chrome.cast.Image(images['wallpaper']));
			}

			if (isEpisode(item) && images['tile']) {
				castImages.push(new chrome.cast.Image(images['tile']));
			} else if (new chrome.cast.Image(images['poster'])) {
				castImages.push(new chrome.cast.Image(images['poster']));
			}

			if (images['square']) {
				castImages.push(new chrome.cast.Image(images['square']));
			}
		}

		return castImages;
	}

	selectMedia(media: api.MediaFile[] | undefined): api.MediaFile {
		return media && media.find(item => item.format.toLocaleLowerCase() === 'video/mpd');
	}

	private onCastStateChanged = event => {
		// reset last properties when disconnected
		if (event.castState === PlayerState.NOT_CONNECTED) {
			this.lastProperties = {};
		} else if (event.castState === PlayerState.CONNECTED) {
			this.getCastDevice();
		}
		this.emitStateChanged(event.castState);
	};

	private onSessionStateChanged = event => {
		this.emitStateChanged(event.sessionState);
	};

	// Cast state change events
	private addStateChangeListener() {
		const { CastContext, CastContextEventType } = cast.framework;
		CastContext.getInstance().addEventListener(CastContextEventType.CAST_STATE_CHANGED, this.onCastStateChanged);
		CastContext.getInstance().addEventListener(CastContextEventType.SESSION_STATE_CHANGED, this.onSessionStateChanged);
	}

	// Remote player events
	private addPlayerEventListener() {
		const { RemotePlayerEventType } = cast.framework;
		this.playerController.addEventListener(RemotePlayerEventType.ANY_CHANGE, this.onRemotePlayerEvent);
	}

	private emitStateChanged(state: PlayerState) {
		if (state === this.lastState) return;
		if (this.isPlaybackState(state)) {
			this.lastState = state;
		}
		this.emit('state', state);
	}

	private isPlaybackState(state: PlayerState) {
		return PLAYBACK_STATE.indexOf(state) >= 0;
	}

	private emitPlayerProperties(props: Partial<PlayerProperties>) {
		this.lastProperties = Object.assign(this.lastProperties, props);
		this.emit('properties', this.lastProperties);
	}

	private endOfPlayback() {
		const castSession = this.getCastSession();
		const sessionObj = castSession && castSession.getSessionObj();
		const idleReason = sessionObj && sessionObj.media && sessionObj.media[0] && sessionObj.media[0].idleReason;

		if (!idleReason || idleReason === chrome.cast.media.IdleReason.INTERRUPTED) return;

		// if media info is null, we are on Idle screen on chromecast device
		// we can check Idle Reason and if it is FINISHED, the video playback is finished without any problem
		if (idleReason === chrome.cast.media.IdleReason.FINISHED) {
			this.lastProperties = {};
			this.emitStateChanged(PlayerState.ENDED);
		} else {
			this.emitStateChanged(PlayerState.READY);
			this.dispose();
		}
	}

	private onRemotePlayerEvent = event => {
		switch (event.field) {
			case RemotePlayerEvents.IS_CONNECTED:
				this.getCastDevice();
				this.emitStateChanged(event.value ? PlayerState.CONNECTED : PlayerState.NOT_CONNECTED);
				break;
			case RemotePlayerEvents.DURATION:
				if (event.value) this.emitPlayerProperties({ duration: Math.ceil(event.value) });
				break;
			case RemotePlayerEvents.CURRENT_TIME:
				if (event.value && this.lastProperties.duration) {
					const currentTime = Math.ceil(event.value);
					if (currentTime < this.lastProperties.duration) {
						this.emitPlayerProperties({ currentTime });
					} else {
						this.lastProperties = {};
						this.emitStateChanged(PlayerState.ENDED);
					}
				}
				break;
			case RemotePlayerEvents.VOLUME_LEVEL:
				this.emitPlayerProperties({ volume: event.value });
				break;
			case RemotePlayerEvents.IS_MUTED:
				this.emitPlayerProperties({ isMuted: event.value });
				break;
			case RemotePlayerEvents.MEDIA_INFO:
				if (event.value) {
					if (
						event.value.customData &&
						event.value.customData.Axis_ItemId &&
						this.lastProperties.itemId !== event.value.customData.Axis_ItemId
					) {
						this.emitPlayerProperties({ itemId: event.value.customData.Axis_ItemId, currentTime: 0, duration: 0 });
					} else {
						event.value.duration && this.emitPlayerProperties({ duration: Math.ceil(event.value.duration) });
					}
				} else {
					this.endOfPlayback();
				}
				break;
			case RemotePlayerEvents.PLAYER_STATE:
				this.emitPlayerStateByCastState(event.value);
				break;
		}
	};

	private emitPlayerStateByCastState(value: string) {
		switch (value) {
			case CastState.PLAYING:
				return this.emitStateChanged(PlayerState.PLAYING);
			case CastState.PAUSED:
				return this.emitStateChanged(PlayerState.PAUSED);
			case CastState.BUFFERING:
				return this.emitStateChanged(PlayerState.BUFFERING);
		}
	}

	play(): void {
		if (this.player.canPause && this.player.isPaused) {
			this.playerController.playOrPause();
		}
	}

	stop(): void {
		if (this.lastState === PlayerState.READY) {
			const session = this.getCastSession();
			const mediaSession = session && session.getMediaSession();

			if (mediaSession) {
				mediaSession.stop(new chrome.cast.media.StopRequest());
			} else {
				this.emit('state', this.lastState);
			}
		} else {
			if (this.playerController) {
				this.playerController.stop();
			}
		}
	}

	pause(): void {
		if (this.player.canPause && !this.player.isPaused) {
			this.playerController.playOrPause();
		}
	}

	seek(time: number): void {
		if (this.player.canSeek) {
			this.player.currentTime = time;
			this.playerController.seek();
		}
	}

	setVolume(volume: number): void {
		const session = this.getCastSession();
		if (session && session.getVolume() !== volume) session.setVolume(volume);

		if (this.player.canControlVolume) {
			this.player.volumeLevel = volume;
			this.playerController.setVolumeLevel();
		}
	}

	mute(isMuted: boolean): void {
		if (this.player.canControlVolume) {
			if (isMuted !== this.player.isMuted) {
				this.playerController.muteOrUnmute();
			}
		}
	}

	replay(): void {
		const newOptions = { ...this.initOptions, startTime: 0 };
		this.dispose();
		this.initPlayback(undefined, newOptions);
	}

	dispose(): void {
		this.stop();

		this.lastState = PlayerState.READY;
		this.initOptions = undefined;
		this.lastProperties = {};
	}

	loadNextItem(options: InitPlaybackOptions): Promise<boolean> {
		const castSession = this.getCastSession();

		if (castSession) {
			const mediaInfo = this.getCastMediaInfo(options);
			const queueItem = new chrome.cast.media.QueueItem(mediaInfo);
			queueItem.startTime = options.startTime;
			queueItem.customData = mediaInfo.customData;
			queueItem.preloadTime = options.chainPlayCountdown;
			queueItem.autoplay = true;

			const request = new chrome.cast.media.QueueInsertItemsRequest([queueItem]);

			return new Promise(function(resolve, reject) {
				const currentMedia = castSession.getMediaSession();
				if (currentMedia) {
					currentMedia.queueInsertItems(request, () => resolve(true), error => resolve(false));
				} else {
					return resolve(false);
				}
			});
		}

		return Promise.resolve(false);
	}
}
