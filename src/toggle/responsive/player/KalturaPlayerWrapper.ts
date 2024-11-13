import { KalturaPlayer } from 'kaltura-player-js';

import {
	PlayerAction,
	PlayerState,
	PlayerProps,
	PlayerAudioTrack,
	PlayerSubtitleTrack,
	PlayerEventType,
	PlayerContextType,
	PlayerMediaType,
	PlayerAssetReferenceType
} from 'toggle/responsive/player/Player';
import { BasePlayerWrapper } from './BasePlayerWrapper';
import { InitPlaybackOptions, KalturaPlayerTrack } from './Player';
import {
	MediaTypes,
	getItemMediaType,
	getMediaFormatsByType,
	isHOOQ,
	PLAYER_WRAPPER_ID,
	PLAYER_VERSION_KALTURA,
	PLAYER_DFP_CUSTOM_PARAMS,
	getHDCPLicenseURL,
	PLAYBACK_SPEEDS
} from 'toggle/responsive/util/playerUtil';
import { get } from 'shared/util/objects';
import { isSafari, isIOS, isMobile } from 'shared/util/browser';
import { AUTO_LABEL } from 'toggle/responsive/player/controls/ControlsSettings';
import { isSessionExpired } from 'toggle/responsive/util/playerUtil';
import { callOmniLoad } from 'shared/analytics/consumers/dtmAnalyticsConsumer';
import { GOOGLETAG_DEVICE_IU_DESKTOP, GOOGLETAG_DEVICE_IU_MOBILE } from '../pageEntry/advertising/adsUtils';
import { DEFAULT_PLAYBACK_SPEED, OPTION_LABEL_NORMAL } from 'shared/app/localeUtil';
import { getQueryParams } from 'shared/util/urls';
import { isChannel } from '../util/epg';

const initialPlayerConfig = {
	targetId: 'player-placeholder',

	streaming: {
		switchDynamicToStatic: true
	},

	provider: {
		partnerId: '',
		env: {
			serviceUrl: ''
		},
		ks: ''
	},
	playback: {
		muted: true,
		autoplay: true,
		useNativeTextTrack: false,
		textLanguage: '',
		options: {
			html5: {
				hls: {
					maxBufferLength: 6,
					maxBufferSize: 2000000,
					maxMaxBufferLength: 40,
					capLevelToPlayerSize: true,
					appendErrorMaxRetry: 10
				},
				dash: {
					manifest: {
						dash: {
							clockSyncUri: process.env.CLIENT_DASH_CLOCK_SYNC_URI || 'https://time.akamai.com/?iso'
						}
					}
				}
			}
		}
	},
	network: {},
	sources: {},
	plugins: {},
	abr: {}
};
const VR_DRAG_TIME = 500;

declare global {
	interface Window {
		player: KalturaPlayer;
		KalturaPlayer: KalturaPlayer;
	}
}

export class KalturaPlayerWrapper extends BasePlayerWrapper {
	private player: KalturaPlayer;
	private container: HTMLElement;
	private readonly vrOverlay: HTMLElement;
	private pendingResumePointPosition: number;
	private disposed: boolean;
	private startover: boolean;
	private playerConfig: any;
	private vrDragTimer: number;
	private postRollFinished: boolean;
	Event: any;

	constructor(options: PlayerProps) {
		super();
		this.playerConfig = {
			...initialPlayerConfig,
			...{ plugins: { ...options.plugins } }
		};

		if (options.poster) {
			this.playerConfig.sources = {
				poster: options.poster
			};
		} else {
			this.playerConfig.sources = {};
		}

		if (options.subtitles) {
			const captions: Array<any> = [];
			Object.keys(options.subtitles).forEach(language => {
				const subtitleLanguage = options.subtitleLanguages.find(item => item.title === language);
				if (subtitleLanguage) {
					captions.push({
						label: language,
						language: subtitleLanguage.code,
						type: 'srt',
						url: options.subtitles[language]
					});
				}
			});
			this.playerConfig.sources = {
				...this.playerConfig.sources,
				captions
			};
		}
		if (options.playback) {
			const { kalturaPartnerId, kalturaServiceUrl } = options.playback;
			const { provider } = this.playerConfig;
			provider.partnerId = kalturaPartnerId;
			provider.env.serviceUrl = kalturaServiceUrl;
			const playback =
				undefined !== options.autoplay ? { ...options.playback, autoplay: options.autoplay } : { ...options.playback };

			this.playerConfig.playback = {
				...this.playerConfig.playback,
				...playback
			};
		}
		if (options.isVr) {
			this.vrOverlay = options.vrOverlay;

			this.playerConfig.plugins = {
				...this.playerConfig.plugins,
				vr: {
					rootElement: PLAYER_WRAPPER_ID
				}
			};
		}

		const { startoverInfo } = options;
		if (startoverInfo) {
			const dvr = !!startoverInfo.startover;
			this.playerConfig.sources = {
				...this.playerConfig.sources,
				dvr
			};
			this.startover = dvr;
		}

		this.playerConfig.provider.ks = options.ks;

		const adTagUrl = get(options, 'ads.adTagUrl');
		const playAdsAfterTime = get(options, 'ads.playAdsAfterTime');
		const customParameters = get(options, 'ads.customParameters');
		const entryId = get(options, 'ads.entryId');
		const itemURL = get(options, 'ads.itemURL');
		const { google } = window;
		const isSSAI = options.isSSAI;

		if (adTagUrl && typeof google !== 'undefined') {
			this.playerConfig.plugins = {
				...this.playerConfig.plugins,
				ima: {
					adTagUrl: adTagUrl,
					adsRenderingSettings: {
						uiElements: [google.ima.UiElements.COUNTDOWN, google.ima.UiElements.AD_ATTRIBUTION],
						playAdsAfterTime
					}
				}
			};
		}

		const isHOOQSafari = isSafari() && options.isHOOQContent;
		this.playerConfig.network = {
			requestFilter: (type, request) => {
				const MediaType = window.KalturaPlayer.core.RequestType;
				if ([MediaType.MANIFEST, MediaType.SEGMENT].includes(type)) {
					if (isSSAI && process.env.CLIENT_YOSPACE_APPEND_AD_PARAMETER === 'true') {
						if (request.url && customParameters) {
							request.url = this.appendYoSPaceParams(adTagUrl, {
								url: request.url,
								entryId,
								itemURL,
								customParameters
							});
						}
					}
				} else if (type === window.KalturaPlayer.core.RequestType.LICENSE) {
					// HDCP not required for mobile browsers, safari and embed player
					const enforceHDCP = !isMobile() && !isSafari() && !options.embed;
					if (isHOOQSafari) {
						const oldbody = request.body;
						const newbody = '{ "server_playback_context" : "' + oldbody + '"}';
						request.body = newbody;
					} else if (enforceHDCP) {
						const ks = options.ks || get(this.player, 'config.session.ks');
						const hdcp = getHDCPLicenseURL(ks, request.url);

						if (hdcp) {
							return new Promise(resolve =>
								hdcp.then(r =>
									r.json().then(json => {
										const licenseUrl = get(json, 'result.licenseUrl');
										request.url = licenseUrl;
										resolve(request);
									})
								)
							);
						}
					}
				}
			}
		};

		if (isHOOQSafari) {
			this.playerConfig.network.responseFilter = (type, response) => {
				if (type === window.KalturaPlayer.core.RequestType.LICENSE) {
					const oldres = response.data;
					const newres = new Uint8Array(oldres);
					response.data = newres;
				}
			};
		}

		if (options.restrictedMaxBitRate) {
			const restrictedMaxBitRateKbps = options.restrictedMaxBitRate * 1000;
			const shakaRestrictions = {
				restrictions: {
					maxBandwidth: restrictedMaxBitRateKbps
				}
			};

			const dashOptions = get(this.playerConfig, 'playback.options.html5.dash') || {};
			this.playerConfig.playback.options.html5.dash = { ...dashOptions, ...shakaRestrictions };

			this.playerConfig.abr = {
				restrictions: {
					maxBitrate: restrictedMaxBitRateKbps
				}
			};
		}

		this.player = window.KalturaPlayer.setup(this.playerConfig);

		const Event = this.player.Event;
		this.Event = Event;
		this.player.addEventListener(Event.PLAYER_STATE_CHANGED, this.onPlayerStateChanged);
		this.player.addEventListener(Event.TIME_UPDATE, this.updatePlayerProperties);
		this.player.addEventListener(Event.ERROR, this.emitError);
		this.player.addEventListener(Event.VIDEO_TRACK_CHANGED, this.onVideoTrackChange);
		this.player.addEventListener(Event.AUDIO_TRACK_CHANGED, this.onAudioTrackChange);
		this.player.addEventListener(Event.MEDIA_LOADED, this.onMediaLoaded);
		this.player.addEventListener(Event.TEXT_TRACK_CHANGED, this.onTextTrackChange);
		this.player.addEventListener(Event.CAN_PLAY, this.emitCanPlay);
		this.player.addEventListener(Event.FIRST_PLAYING, this.emitFirstPlaying);
		this.player.addEventListener(Event.RATE_CHANGE, this.onPlaybackRateChanged);

		this.player.addEventListener(Event.SOURCE_SELECTED, async (e: any) => {
			const streamId = get(e, 'payload.selectedSource.0.id');
			const targetStream = this.initOptions.data.find(stream => {
				return `${stream.id},${stream.format}` === streamId;
			});

			if (isChannel(this.initOptions.item) && targetStream.url) {
				await fetch(targetStream.url, { redirect: 'follow' }).then(res => {
					try {
						const urlObject = new URL(res.url);
						this.updateOriginCode(options.plugins.smartswitch, urlObject.hostname);
					} catch (ex) {
						// Problem getting live origin code
					}
				});
			}
		});

		if (adTagUrl) {
			const onAdLoaded = get(options, 'ads.onAdLoaded');
			const onAdStarted = get(options, 'ads.onAdStarted');
			const onAdPaused = get(options, 'ads.onAdPaused');
			const onAdResumed = get(options, 'ads.onAdResumed');
			const onAdCompleted = get(options, 'ads.onAdCompleted');
			const onAdCanSkip = get(options, 'ads.onAdCanSkip');
			const onAdProgress = get(options, 'ads.onAdProgress');
			const onAdSkipped = get(options, 'ads.onAdSkipped');
			const onAdError = get(options, 'ads.onAdError');

			const unitDefinition = get(options, 'ads.unitDefinition');
			const videoType = get(options, 'ads.videoType');

			this.player.addEventListener(Event.Core.AD_LOADED, event => {
				this.postRollFinished = false;
				if (onAdLoaded) onAdLoaded();
				this.emitAdAction(PlayerAction.AdLoaded, {
					container: this.player.getView(),
					VPAID: get(event, 'payload'),
					embed: options.embed,
					unitDefinition,
					videoType
				});
			});

			this.player.addEventListener(Event.Core.AD_STARTED, event => {
				// event.payload or player.ads.getAd() might be used to get ad detains
				if (onAdStarted) onAdStarted();
				this.emulateCanPlay();
				this.emitAdAction(PlayerAction.AdStarted);
			});

			this.player.addEventListener(Event.Core.AD_PAUSED, () => {
				if (onAdPaused) onAdPaused();
				this.emitAdAction(PlayerAction.AdPaused);
			});

			this.player.addEventListener(Event.Core.AD_RESUMED, () => {
				if (onAdResumed) onAdResumed();
				this.emitAdAction(PlayerAction.AdResumed);
			});

			this.player.addEventListener(Event.Core.AD_COMPLETED, () => {
				if (onAdCompleted) onAdCompleted();
				this.emulateCanPlay();
				this.emitAdAction(PlayerAction.AdCompleted);
			});

			this.player.addEventListener(Event.Core.AD_CAN_SKIP, () => {
				if (onAdCanSkip) onAdCanSkip();
			});

			this.player.addEventListener(Event.Core.AD_PROGRESS, () => {
				if (onAdProgress) onAdProgress();
				this.emitAdAction(PlayerAction.AdProgress);
			});
			this.player.addEventListener(Event.Core.ADS_COMPLETED, () => {
				this.postRollFinished = true;
				if (onAdCompleted) onAdCompleted();
			});

			const adQuartile = event => {
				switch (event.type) {
					case Event.Core.AD_FIRST_QUARTILE:
					case Event.Core.AD_MIDPOINT:
					case Event.Core.AD_THIRD_QUARTILE:
					default:
						this.emitAdAction(PlayerAction.AdQuartile, { quartile: event.type });
						break;
				}
			};
			this.player.addEventListener(Event.Core.AD_FIRST_QUARTILE, adQuartile);
			this.player.addEventListener(Event.Core.AD_MIDPOINT, adQuartile);
			this.player.addEventListener(Event.Core.AD_THIRD_QUARTILE, adQuartile);
			this.player.addEventListener(Event.Core.AD_VOLUME_CHANGED, () => {
				this.emitAdAction(PlayerAction.AdVolumeChanged);
			});
			this.player.addEventListener(Event.Core.AD_MUTED, () => {
				this.emitAdAction(PlayerAction.AdVolumeChanged);
			});
			this.player.addEventListener(Event.Core.AD_SKIPPED, () => {
				if (onAdSkipped) onAdSkipped();
				this.emulateCanPlay();
				this.emitAdAction(PlayerAction.AdSkipped);
			});

			this.player.addEventListener(Event.Core.AD_ERROR, () => {
				if (onAdError) onAdError();
			});

			this.player.addEventListener(Event.Core.ALL_ADS_COMPLETED, () => {
				// Event.Core.ALL_ADS_COMPLETED listener and below code edited out to fix
				// issues occurring in MEDTOG-8678, MEDTOG-11135, prematurely ending playback.
				// event listener has been left in to avoid unexpected side-effects

				// this.emit(PlayerEventType.state, PlayerState.ENDED);

				return;
			});
		}

		if (options.isVr && this.vrOverlay) {
			this.vrOverlay.addEventListener('mousedown', this.onVrOverlayPointerDown);
			this.vrOverlay.addEventListener('touchstart', this.onVrOverlayPointerDown);
			window.addEventListener('mouseup', this.onDocumentPointerUp);
			window.addEventListener('touchend', this.onDocumentPointerUp);
		}

		if (_DEV_) window['player'] = this.player;
	}

	isAdPlaying() {
		const ima = get(this.player, 'plugins.ima');
		return ima && ima.isAdPlaying();
	}

	isBumperPlaying() {
		const bumper = get(this.player, 'plugins.bumper');
		return bumper && bumper.isAdPlaying();
	}

	isAdsEnded = () => {
		return this.player.ads ? this.player.ads.allAdsCompleted || this.postRollFinished : true;
	};

	onMediaLoaded = event => {
		this.onVideoTrackChange(event);
		this.onAudioTrackChange(event);
		this.onTextTrackChange(event);
	};

	onVideoTrackChange = event => {
		this.emit(PlayerEventType.videoTrack, event);
	};

	onAudioTrackChange = event => {
		this.emit(PlayerEventType.audioTrack, event);
	};

	onTextTrackChange = event => {
		this.emit(PlayerEventType.textTrack, event);
	};

	onPlaybackRateChanged = event => {
		this.emit(PlayerEventType.trackPlaybackSpeed, event);
	};

	addEventListener(type: Event, callback: (event) => void) {
		this.player.addEventListener(type, callback);
	}

	removeEventListener(type: Event, callback: (event) => void) {
		this.player.removeEventListener(type, callback);
	}

	private emitStateChanged(state: PlayerState) {
		if (state === this.lastState) return;

		// Safari doesn't set correct playback state after post-roll ads
		// prevent setting PAUSED state after ENDED manually to keep behavior consistent with other browsers
		if (isSafari() && state === PlayerState.PAUSED && this.lastState === PlayerState.ENDED) return;

		this.lastState = state;
		this.emit(PlayerEventType.state, state);
	}

	private onPlayerStateChanged = event => {
		const State = this.player.State;
		switch (event.payload.newState.type) {
			case State.BUFFERING:
			case State.LOADING:
				this.emitStateChanged(PlayerState.BUFFERING);
				break;
			case State.PLAYING:
				this.emitStateChanged(PlayerState.PLAYING);
				break;
			case State.PAUSED:
				this.emitStateChanged(PlayerState.PAUSED);
				break;
			case State.IDLE:
				// State transition from loading to idle means there's player error.
				// Refer to player state transitions: https://developer.kaltura.com/player/web/player-states-web
				const isError =
					event.payload.oldState.type === State.LOADING ||
					(event.payload.oldState.type === State.PLAYING && event.payload.newState.duration === 0);
				if (!isError) {
					this.emitStateChanged(PlayerState.ENDED);
				}
				break;
		}
	};

	private emitError = (error: any) => {
		this.emit(PlayerEventType.error, error);
	};

	play(isUserClick = false) {
		if (isIOS() && isSessionExpired()) return;
		if (isUserClick) this.emit(PlayerEventType.action, { name: PlayerAction.ActuatePlay });
		this.player.play();
	}

	pause(isUserClick = false) {
		if (isUserClick) this.emit(PlayerEventType.action, { name: PlayerAction.ActuatePause });
		this.player.pause();
	}

	seek(time: number) {
		if (!isNaN(time) && time >= 0) {
			this.player.currentTime = this.startover ? this.player.getStartTimeOfDvrWindow() + time : time;
			this.emit(PlayerEventType.action, { name: PlayerAction.ActuateSeekEnd, seekEnd: time });
		}
	}

	configure(Object: any) {
		this.player.configure(Object);
	}

	private transformTracks(type: 'audio' | 'text'): PlayerAudioTrack[] | PlayerSubtitleTrack[] {
		const tracks: KalturaPlayerTrack[] = this.player.getTracks(type);
		return tracks.map(({ _index, _active, _label, _language }) => ({
			id: _index,
			active: _active,
			label: _label,
			lang: _language
		}));
	}

	playbackRates() {
		return PLAYBACK_SPEEDS.map(rate => {
			return {
				id: rate,
				label: rate === DEFAULT_PLAYBACK_SPEED ? OPTION_LABEL_NORMAL : `${rate}x`,
				value: rate
			};
		});
	}

	getVideoTracks() {
		return this.player.getTracks('video');
	}

	getAudioTracks() {
		return this.transformTracks('audio');
	}

	getTextTracks() {
		return this.transformTracks('text');
	}

	setVolumeMutedState(isMuted: boolean) {
		this.player.muted = isMuted;
	}

	selectSubtitle(lang: string, isUserClick = false) {
		const track = this.player.getTracks('text').find(t => t._language === lang);
		this.player.selectTrack(track);
		if (isUserClick) this.emit(PlayerEventType.action, { name: PlayerAction.SelectSubtitle, payload: track._label });
	}

	selectPlaybackSpeed(speed: number) {
		const track = PLAYBACK_SPEEDS.find(track => track === speed);

		if (track && ((this.player && this.player.playbackRate === 0) || this.player.playbackRate)) {
			this.player.playbackRate = track;
		}
	}

	selectAudio(lang: string, isUserClick = false) {
		const track = this.player.getTracks('audio').find(t => t._language === lang);
		this.player.selectTrack(track);
		if (isUserClick) this.emit(PlayerEventType.action, { name: PlayerAction.SelectAudio, payload: track._label });
	}

	selectVideo(track?: KalturaPlayerTrack) {
		let selectedQuality = AUTO_LABEL;

		if (track) {
			this.player.selectTrack(track);
			selectedQuality = track._label;
		} else {
			this.enableAdaptiveBitrate();
		}

		this.emit(PlayerEventType.action, {
			name: PlayerAction.SelectQuality,
			payload: selectedQuality
		});
	}

	toggleStartOver() {
		this.emit(PlayerEventType.action, { name: PlayerAction.ToggleStartOver });
	}

	enableAdaptiveBitrate() {
		this.player.enableAdaptiveBitrate();
	}

	setVolume(volume: number) {
		this.player.volume = volume;
	}

	replay() {
		this.emitStateChanged(PlayerState.UNKNOWN);
		this.seek(0);
		this.play();
	}

	dispose() {
		this.disposed = true;
		if (this.container) this.clearPlayerContainer(this.container);
		const Event = this.player.Event;

		this.emit(PlayerEventType.action, { name: PlayerAction.Dispose });
		// // Player events
		this.player.removeEventListener(Event.PLAYER_STATE_CHANGED, this.onPlayerStateChanged);
		this.player.removeEventListener(Event.TIME_UPDATE, this.updatePlayerProperties);
		this.player.removeEventListener(Event.ERROR, this.emitError);
		this.player.removeEventListener(Event.VIDEO_TRACK_CHANGED, this.onVideoTrackChange);
		this.player.removeEventListener(Event.AUDIO_TRACK_CHANGED, this.onAudioTrackChange);
		this.player.removeEventListener(Event.TEXT_TRACK_CHANGED, this.onTextTrackChange);
		this.player.removeEventListener(Event.CAN_PLAY, this.emitCanPlay);
		this.player.removeEventListener(Event.RATE_CHANGE, this.onPlaybackRateChanged);
		this.player.destroy();
		this.player = undefined;
	}

	private updatePlayerProperties = e => {
		const startTimeOfDvrWindow = this.player.getStartTimeOfDvrWindow();
		const currentTime =
			(this.startover ? this.player.currentTime - startTimeOfDvrWindow : this.player.currentTime) || 0;
		const duration = Math.floor(this.player.duration) || 0;
		if (Math.abs(this.lastProperties.currentTime - currentTime) < 0.5 && this.lastProperties.duration === duration)
			return;

		if (!this.player.paused && this.lastState !== PlayerState.PLAYING) {
			// cancel buffering state if time changes
			this.emitStateChanged(PlayerState.PLAYING);
		}

		this.lastProperties = Object.assign(this.lastProperties, {
			currentTime,
			duration,
			startTimeOfDvrWindow
		});
		this.emit(PlayerEventType.properties, this.lastProperties);
	};

	selectMedia(media) {
		return undefined;
	}

	private emitCanPlay = () => {
		this.emit(PlayerEventType.action, {
			name: PlayerAction.CanPlay,
			isAdPlaying: this.isAdPlaying(),
			audioLanguages: this.getAudioTracks().map(track => track.lang)
		});
	};

	private emitAdAction = (name, adData?) => {
		const volume = this.player.volume;
		const muted = this.player.muted;
		const payload = Object.assign({ volume, muted }, adData);
		this.emit(PlayerEventType.action, { name, payload });
	};

	private emitFirstPlaying = e => {
		this.updatePlayerProperties(e);
		this.emit(PlayerEventType.action, { name: PlayerAction.FirstPlaying });
		callOmniLoad(this, PLAYER_VERSION_KALTURA);
	};

	private emulateCanPlay = this.emitCanPlay;

	private onVideoReadyToPlay = () => {
		this.player.currentTime = this.pendingResumePointPosition;
		this.player.removeEventListener('canplay', this.onVideoReadyToPlay);
	};

	private setResumePoint(pendingResumePointPosition: number) {
		this.pendingResumePointPosition = pendingResumePointPosition;
		this.player.addEventListener(this.player.Event.CAN_PLAY, this.onVideoReadyToPlay);
	}

	private getEntryId = (options: InitPlaybackOptions) => {
		return options.startover && options.customId ? String(options.customId) : options.item.customId;
	};

	async initPlayback(container: HTMLElement, options: InitPlaybackOptions): Promise<boolean> {
		if (this.disposed || !this.player) return Promise.reject('Player disposed');

		if (!options) return Promise.reject('Playback options undefined');

		this.initOptions = options;
		this.container = container;
		this.clearPlayerContainer(container);
		container.appendChild(this.player.getView());

		if (!options.item || !options.item.customId) {
			this.emitError('Missing customId/mediaId');
			return Promise.resolve(false);
		}

		const { item, data, startover, smartswitch } = options;
		const mediaType = getItemMediaType(item);
		let mediaFormats = getMediaFormatsByType(mediaType);
		const targetProfile = mediaFormats && mediaFormats[0];
		const targetStream = data.find(stream => stream.name === targetProfile);

		if (isChannel(item)) {
			if (!targetStream) {
				this.emitError('Target profile does not exist in AXIS videos api');
				return Promise.resolve(false);
			}

			if (targetStream.url) {
				await fetch(targetStream.url, { redirect: 'follow' }).then(res => {
					try {
						const urlObject = new URL(res.url);
						this.updateOriginCode(smartswitch, urlObject.hostname);
					} catch (ex) {
						// Problem getting live origin code
					}
				});
			}
		} else {
			// Fallback to default streams if clear content doesn't have clear streams
			if (!targetStream && mediaType === MediaTypes.ClearKeyContent) {
				mediaFormats = getMediaFormatsByType(MediaTypes.Default);
			}
		}

		const mediaOptions = {
			startTime: 0.001,
			dvr: true
		};

		return this.player
			.loadMedia(
				{
					entryId: this.getEntryId(options),
					formats: mediaFormats,
					fileIds: isHOOQ(item) ? data[0].id : undefined,
					contextType: startover ? PlayerContextType.START_OVER : PlayerContextType.PLAYBACK,
					mediaType: startover ? PlayerMediaType.EPG : PlayerMediaType.MEDIA,
					assetReferenceType: startover ? PlayerAssetReferenceType.EPG_INTERNAL : PlayerAssetReferenceType.MEDIA
				},
				mediaOptions
			)
			.then(() => {
				if (options.startTime >= 0) this.setResumePoint(options.startTime);

				// autoplay attribute doesn't work on mobile browsers,
				// in this case, when video is loaded and hasn't start point we fire READY playback state
				// just to show PLAY button for mobile devices
				if (!options.autoPlay && options.startTime === 0) {
					this.emitStateChanged(PlayerState.READY);
				}

				// we need to call this due to duration update, when video is loaded, but with start time as current video time
				this.lastProperties = {
					currentTime: options.startTime,
					duration: Math.floor(this.player.duration) || 0
				};
				this.emit(PlayerEventType.properties, this.lastProperties);
				this.player.enableAdaptiveBitrate();

				return true;
			})
			.catch(error => {
				this.emitError(error);
				return false;
			});
	}

	updateOriginCode(smartswitchParams: any, originCode?: string) {
		const smartswitch = this.player.plugins['smartswitch'];
		const currentOriginCode = get(smartswitch, 'config.optionalParams.originCode');

		if (smartswitchParams && currentOriginCode !== originCode) {
			const optionalParams = {
				...smartswitchParams.optionalParams
			};

			smartswitch.updateConfig({
				...smartswitchParams,
				optionalParams: {
					...optionalParams,
					originCode: originCode
				}
			});
		}
	}

	private clearPlayerContainer(container: HTMLElement) {
		container.innerHTML = '';
	}

	private onVrOverlayPointerDown = () => {
		window.clearTimeout(this.vrDragTimer);
		this.emit(PlayerEventType.vrInteraction, true);
	};

	private onDocumentPointerUp = () => {
		this.vrDragTimer = window.setTimeout(() => this.emit(PlayerEventType.vrInteraction, false), VR_DRAG_TIME);
	};

	private appendYoSPaceParams = (adTagUrl: string, params: any): string => {
		const { url, entryId, itemURL, customParameters } = params;
		const resultURL = new URL(url);
		if (resultURL.search.indexOf(`${PLAYER_DFP_CUSTOM_PARAMS}=`) < 0) {
			resultURL.searchParams.append('vid', entryId);
			resultURL.searchParams.append('url', itemURL);
			resultURL.searchParams.append('deviu', isMobile() ? GOOGLETAG_DEVICE_IU_MOBILE : GOOGLETAG_DEVICE_IU_DESKTOP);
			resultURL.searchParams.append('meid', get(window, 'meID') || '');
			const queryString = getQueryParams(adTagUrl) || {};
			const { iu = '', cmsid = '' } = queryString;
			resultURL.searchParams.append('iu', iu);
			resultURL.searchParams.append('cmsid', cmsid);

			resultURL.searchParams.append(PLAYER_DFP_CUSTOM_PARAMS, customParameters);
			return resultURL.toString();
		}
		return url;
	};
}
