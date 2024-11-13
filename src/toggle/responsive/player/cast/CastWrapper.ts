import {
	KalturaPlayerTrack,
	PlayerAudioTrack,
	PlayerEventType,
	PlayerProperties,
	PlayerState,
	PlayerSubtitleTrack,
	InitCastOptions,
	RemoteCastPlayerInterface,
	RemoteCastPlayerControllerInterface
} from '../Player';
import { CastState, RemotePlayerEvents } from 'ref/responsive/player/cast/Cast';
import { BasePlayerWrapper } from '../BasePlayerWrapper';
import { isEpisode } from 'toggle/responsive/util/item';
import { isLive } from 'toggle/responsive/util/playerUtil';
import { OPTION_LABEL_OFF } from 'shared/app/localeUtil';
import { isSeriesEpisode } from 'toggle/responsive/util/item';
import {
	createCastHeartbeatRequest,
	ChromecastHeartbeatRequest
} from 'toggle/responsive/player/kaltura/KalturaHeartbeatUtil';

interface AvailableNextEpisode {
	Axis_ItemId: string;
	type: string;
	mediaId: string;
	licenseUrl: string;
	isLive: boolean;
	hideTimer: boolean;
	chainPlayCountdown: number;
	kalturaHeartbeat: ChromecastHeartbeatRequest;
}

const CONTENT_TYPE = 'application/dash+xml';
const LIVE_DURATION = -1;
const PLAYBACK_STATE = [
	PlayerState.PLAYING,
	PlayerState.PAUSED,
	PlayerState.BUFFERING,
	PlayerState.READY,
	PlayerState.ENDED
];

const SUBTITLE_OFF: PlayerSubtitleTrack = {
	id: 'off',
	active: false,
	label: 'Off',
	lang: OPTION_LABEL_OFF
};

const LANG_CODE_MAP = {
	english: 'en',
	chinese: 'zh',
	tamil: 'ta',
	malay: 'ms'
};

export class CastWrapper extends BasePlayerWrapper {
	private player: RemoteCastPlayerInterface;
	private playerController: RemoteCastPlayerControllerInterface;
	private initPromise: Promise<boolean>;
	private subtitles: PlayerSubtitleTrack[] = [];
	private audioTracks: PlayerAudioTrack[] = [];
	private currentSubtitle = OPTION_LABEL_OFF;
	private currentAudio = undefined;

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

	initPlayback(container: HTMLElement, options: InitCastOptions): Promise<boolean> {
		if (!options) return;

		// stop player controller before init new playback
		if (this.playerController) this.playerController.stop();

		this.initOptions = options;

		this.emitPlayerProperties({
			itemId: options.item.id,
			currentTime: 0,
			duration: 0,
			chainPlayCountdown: options.chainPlayCountdown
		});
		this.emitStateChanged(PlayerState.BUFFERING);

		return this.initPromise.then(result => {
			const castSession = this.getCastSession();
			if (castSession) {
				const media = this.selectMedia(options.data);
				const sessionObj = castSession.getSessionObj();
				const mediaInfo = this.getCastMediaInfo(media, { ...options });
				const queueItem = this.getCastQueueItem(mediaInfo, options.startTime);

				const request = new chrome.cast.media.QueueLoadRequest([queueItem]);

				return new Promise<boolean>(function(resolve) {
					sessionObj.queueLoad(request, () => resolve(true), () => resolve(false));
				});
			}

			return false;
		});
	}

	sendQueueRequest = (castSession, request): Promise<boolean> =>
		new Promise((resolve, reject) => {
			const currentMedia = castSession.getMediaSession();
			if (currentMedia) {
				currentMedia.queueInsertItems(request, () => resolve(true), () => resolve(false));
			} else {
				return resolve(false);
			}
		});

	loadNextItemThumbnail(options: InitCastOptions): Promise<boolean> {
		const castSession = this.getCastSession();

		if (castSession) {
			const partialMediaInfo = this.getCastMediaInfo(undefined, options);
			const partialQueueItem = this.getCastQueueItem(partialMediaInfo, 0, options.chainPlayCountdown);

			const request = new chrome.cast.media.QueueInsertItemsRequest([partialQueueItem]);

			return this.sendQueueRequest(castSession, request);
		}
	}

	loadNextItem(options: InitCastOptions): Promise<boolean> {
		const castSession = this.getCastSession();

		if (castSession) {
			this.initOptions = options;
			const media = this.selectMedia(options.data);
			const mediaInfo = this.getCastMediaInfo(media, options);
			const queueItem = this.getCastQueueItem(mediaInfo, options.startTime, options.chainPlayCountdown);

			const request = new chrome.cast.media.QueueInsertItemsRequest([queueItem]);

			return this.sendQueueRequest(castSession, request);
		}

		return Promise.resolve(false);
	}

	private getCastSession() {
		if (typeof cast === 'undefined') {
			return;
		}
		return cast && cast.framework.CastContext.getInstance().getCurrentSession();
	}

	private getCastDevice() {
		const castSession = this.getCastSession();
		const castDevice = castSession && castSession.getCastDevice();
		const castDeviceName = castDevice.friendlyName && chrome.cast.unescape(castDevice.friendlyName);

		this.emitPlayerProperties({
			device: castDeviceName
		});
	}

	private getCastMediaInfo(
		media: api.MediaFile | undefined,
		{ item, chainPlayCountdown, session, partnerId, account, youbora }: InitCastOptions
	): any {
		const cMedia = chrome.cast.media;
		const mediaUrl = media ? media.url : 'none';
		const mediaInfo = new cMedia.MediaInfo(mediaUrl, CONTENT_TYPE);
		const kalturaHeartbeat = account ? createCastHeartbeatRequest(item, session, partnerId, media) : undefined;
		const { id, type, duration } = item;

		const isShowMetadata = isEpisode(item);
		mediaInfo.metadata = isShowMetadata ? new cMedia.GenericMediaMetadata() : new cMedia.MovieMediaMetadata();
		mediaInfo.metadata.title = this.getMetadataTitle(item) || '';

		if (isShowMetadata) {
			const seasonNumber = item.season && item.season.seasonNumber;
			const episodeMetadata = isSeriesEpisode(item) ? `S${seasonNumber} ${item.episodeName}` : item.episodeName;
			mediaInfo.metadata.seriesTitle = mediaInfo.metadata.subtitle = episodeMetadata || '';
		} else {
			mediaInfo.metadata.subtitle = item.shortDescription || '';
		}

		mediaInfo.metadata.images = this.convertImages(item) || [];
		mediaInfo.duration = duration;

		mediaInfo.customData = <AvailableNextEpisode>{
			Axis_ItemId: id,
			type,
			mediaId: item.customId,
			licenseUrl: media ? media.drm : '',
			isLive: isLive(item),
			hideTimer: !media,
			chainPlayCountdown,
			kalturaHeartbeat,
			youbora
		};

		const mediaSubtitles = media && media.subtitles ? media.subtitles : {};
		const subtitles: Array<[string, string]> = Object.entries(mediaSubtitles);

		mediaInfo.tracks = subtitles.map(([label, url], idx) => {
			const language = LANG_CODE_MAP[label.toLowerCase()] || 'en';
			const track = new chrome.cast.media.Track(idx, chrome.cast.media.TrackType.TEXT);

			track.trackContentId = url && url.replace(/\.srt$/, '.vtt');
			track.trackContentType = 'text/vtt';
			track.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
			track.name = label;
			track.language = language;

			return track;
		});

		return mediaInfo;
	}

	private getCastQueueItem(mediaInfo: any, startTime: number, chainPlayCountdown?: number) {
		const queueItem = new chrome.cast.media.QueueItem(mediaInfo);
		queueItem.startTime = startTime;
		queueItem.customData = mediaInfo.customData;
		queueItem.preloadTime = chainPlayCountdown || 0;
		queueItem.autoplay = true;

		// Otherwise , cast library will throw ( value being null is not enough )
		// [cast.receiver.MediaQueue] ItemId should not be defined, element at index: 0
		queueItem.itemId = undefined;

		return queueItem;
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
		const dashCastProfile = media && media.find(item => item.name.toUpperCase() === 'DASH_CAST');

		if (dashCastProfile) return dashCastProfile;

		return media && media.find(item => item.name.toUpperCase() === 'DASH_TV');
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
		this.emit(PlayerEventType.state, state);
	}

	private isPlaybackState(state: PlayerState) {
		return PLAYBACK_STATE.indexOf(state) >= 0;
	}

	private emitPlayerProperties(props: Partial<PlayerProperties>) {
		this.lastProperties = Object.assign(this.lastProperties, props);
		this.emit(PlayerEventType.properties, this.lastProperties);
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
			this.dispose(true);
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
				const duration = this.lastProperties.duration;

				if (event.value && duration && duration !== LIVE_DURATION) {
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
					this.updateTracks(event.value);
					this.applySelectedTrack();
				} else {
					this.endOfPlayback();
				}
				break;
			case RemotePlayerEvents.PLAYER_STATE:
				this.emitPlayerStateByCastState(event.value);
				break;
		}
	};

	private isNotNearEnd = (): boolean => {
		const { duration, currentTime, chainPlayCountdown = 0 } = this.lastProperties;
		return currentTime - duration < chainPlayCountdown;
	};

	private isSafeToCallCast = (): boolean => this.isNotNearEnd() || isLive(this.initOptions.item);

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

	stop(stopPlayback = false): void {
		if (!this.playerController) return;

		if (stopPlayback) this.playerController.stop();

		if (this.lastState === PlayerState.READY) {
			const session = this.getCastSession();
			const mediaSession = session && session.getMediaSession();

			if (mediaSession) {
				mediaSession.stop(new chrome.cast.media.StopRequest());
			} else {
				this.emit(PlayerEventType.state, this.lastState);
			}
		} else if (this.lastState === PlayerState.PLAYING) {
			// Prevent the chromecast stopping but not disconnecting on route change
			return;
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

		if (this.player && this.player.canControlVolume) {
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

	toggleStartOver(): void {
		// noop
	}

	dispose(resetPlayerState = false): void {
		this.stop();
		if (resetPlayerState) this.lastState = PlayerState.READY;
		this.initOptions = undefined;
		this.lastProperties = {};
		this.currentSubtitle = OPTION_LABEL_OFF;
	}

	getVideoTracks(): KalturaPlayerTrack[] {
		return [];
	}
	getAudioTracks(): PlayerAudioTrack[] {
		return this.audioTracks;
	}
	getTextTracks(): PlayerSubtitleTrack[] {
		return this.subtitles;
	}
	selectAudio(lang: string): void {
		this.currentAudio = lang;
		this.applySelectedTrack();
	}
	selectSubtitle(lang: string): void {
		if (this.currentSubtitle !== lang) {
			this.currentSubtitle = lang;
			this.subtitles.forEach(sub => (sub.active = sub.lang === this.currentSubtitle));
			this.applySelectedTrack();
			this.emit(PlayerEventType.textTrack, this.subtitles);
		}
	}
	selectVideo(track: KalturaPlayerTrack) {
		this.player.selectTrack(track);
	}

	enableAdaptiveBitrate(): void {
		// noop
	}
	setVolumeMutedState(isMuted: boolean): void {
		// noop
	}
	configure(Object: any): void {
		throw new Error('Method not implemented.');
	}

	private applySelectedTrack() {
		try {
			const castSession = this.getCastSession();
			const currentMedia = castSession.getMediaSession();
			const activeTrackIds = currentMedia.activeTrackIds || [];
			const currentTrack = this.subtitles.find(sub => activeTrackIds.includes(sub.id)) || SUBTITLE_OFF;
			const currentAudio = this.audioTracks.find(audio => activeTrackIds.includes(audio.id)) || this.audioTracks[0];

			if (currentTrack.lang !== this.currentSubtitle || currentAudio.lang !== this.currentAudio) {
				const track = this.subtitles.find(sub => sub.active);
				const audio = this.audioTracks.find(audio => audio.lang === this.currentAudio);
				let activeTrackIds = track && track.lang !== SUBTITLE_OFF.lang ? [track.id] : [];
				if (audio) {
					activeTrackIds = [...activeTrackIds, audio.id];
				}
				const tracksInfoRequest = this.isSafeToCallCast()
					? new chrome.cast.media.EditTracksInfoRequest([...activeTrackIds])
					: undefined;
				currentMedia.editTracksInfo(tracksInfoRequest);
			}
		} catch (e) {
			/* ignore */
		}
	}

	private updateTracks(mediaInfo) {
		const subtitles = (mediaInfo.tracks || []).filter(t => t.type === chrome.cast.media.TrackType.TEXT);
		this.subtitles = subtitles.map(({ trackId, language, label }) => ({
			id: trackId,
			active: this.currentSubtitle === language,
			lang: language,
			label
		}));
		this.subtitles.push({ ...SUBTITLE_OFF, active: this.currentSubtitle === OPTION_LABEL_OFF });
		const audioTracks = (mediaInfo.tracks || []).filter(t => t.type === chrome.cast.media.TrackType.AUDIO);
		this.audioTracks = audioTracks.map(({ trackId, language: lang, label }, iAudioTrack) => {
			if (!this.currentAudio && iAudioTrack === 0) {
				this.currentAudio = lang;
			}
			return {
				id: trackId,
				lang,
				active: lang === this.currentAudio,
				label: Object.keys(LANG_CODE_MAP).find(key => LANG_CODE_MAP[key] === lang)
			};
		});

		this.emit(PlayerEventType.textTrack, this.subtitles);
		this.emit(PlayerEventType.audioTrack, this.audioTracks);
	}
	isAdPlaying() {
		return false;
	}

	isAdsEnded = () => {
		return true;
	};
}
