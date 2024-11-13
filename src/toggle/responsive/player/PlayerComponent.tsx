import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import { findDOMNode } from 'react-dom';
import { Bem } from 'shared/util/styles';
import {
	PlayerAction,
	PlayerEventType,
	PlayerInterface,
	PlayerProperties,
	PlayerState,
	PlayerAdsConfig,
	isPlayerLoading,
	PlayerPlaybackRateInformation
} from 'toggle/responsive/player/Player';
import getPlayer from './getPlayer';
import { updateResumePosition, saveResumePosition, saveAnonymousVideoPosition } from 'shared/account/profileWorkflow';
import { getResumePosition, getRegisteredProfileInfo } from 'shared/account/profileUtil';
import { isFirstPageInHistory } from 'shared/page/pageUtil';
import warning from 'shared/util/warning';
import TriggerProvider from 'shared/analytics/components/TriggerProvider';
import { DomTriggerPoints } from 'shared/analytics/types/types';
import PlayerControls, { CUSTOM_FIELD_ENTRY_ID_NAME } from './PlayerControls';
import PlayerMetadata from './PlayerMetadata';
import PlayerOverlayingControls, { bemPlayerSeekControls } from './PlayerOverlayingControls';
import EndOfPlayback from 'ref/responsive/player/EndOfPlayback';
import { startedPlaying, removeListCache } from 'shared/cache/cacheWorkflow';
import { isEpisode, isSeriesEpisode, isTrailer, isLastEpisodeOfLastSeason } from 'toggle/responsive/util/item';
import CastIntro from './cast/CastIntro';
import { changeCastIntroStatus, showCastIntro } from 'ref/responsive/player/cast/Cast';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import {
	saveRealVideoPosition,
	getContentGuarded,
	updateCurrentVideoPosition,
	toggleMutedState,
	saveVolume,
	interactMutedState,
	setSessionStatus,
	setInactivityTimer,
	resetInactivityTimer,
	UPDATE_PLAYER_ENTRY_POINT,
	setPlayerInitialised,
	UPDATE_PLAYBACK_SPEED,
	changePlaybackSpeed
} from 'shared/app/playerWorkflow';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import { isMobile, isSafari, isIOS, isTouch } from 'shared/util/browser';
import {
	isWidthLessThanPhablet,
	isPortrait,
	isTabletSize,
	isLessThanTabletSize,
	isMobilePortrait,
	isMobileLandscape,
	isTabletLandscape
} from '../util/grid';
import { KEY_CODE } from 'shared/util/keycodes';
import VolumeMuteButton from './controls/VolumeMuteButton';
import Link from 'shared/component/Link';
import BackIcon from 'ref/responsive/player/controls/icons/BackIcon';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import { get, isEmptyObject } from 'shared/util/objects';
import LinearPlayerMetadata from 'toggle/responsive/pageEntry/channelDetail/components/LinearPlayerMetadata';
import { isOnNow } from 'toggle/responsive/util/channelUtil';
import {
	isItemVr,
	PLAYER_WRAPPER_ID,
	PLAYER_360_OVERLAY_CLASS,
	calculateThumbnailSize,
	getKalturaThumbnailsUrl,
	getVideoScaleFactor,
	isHOOQ,
	getRelativePosition,
	shouldShowUpsellScreenModal,
	disableUpsellScreenModal,
	DISABLED_SQUEEZBACK,
	getClosestAdRoll,
	isSessionExpired,
	getDisneyContentBitRate,
	isItemSSAI,
	hasNoAds,
	getCurrentTime
} from 'toggle/responsive/util/playerUtil';
import { isCastSupported } from 'ref/responsive/player/cast/CastLoader';
import { getKalturaHeartbeatUrl, HeartbeatActions } from 'toggle/responsive/player/kaltura/KalturaHeartbeatUtil';
import { decodeJwt, findToken } from 'shared/util/tokens';
import { generateAdsTag, GOOGLETAG_EVENT_SLOT_RENDER_END } from '../pageEntry/advertising/adsUtils';
import { wrapPlayer } from 'shared/analytics/components/playerWrapper/AnalyticsPlayerWrapper';
import { VideoEntryPoint } from 'shared/analytics/types/types';
import { BasePlayerWrapper } from './BasePlayerWrapper';
import Spinner from 'ref/responsive/component/Spinner';
import { Timer, ITimer } from 'shared/util/Timer';
import { isAnonymousUser } from 'shared/account/sessionWorkflow';
import { HideAllModals, CloseModal, OpenModal, ShowPassiveNotification } from 'shared/uiLayer/uiLayerWorkflow';
import {
	getSwitchLiveWarningModal,
	PROGRAMME_ENDED_MODAL_ID,
	SWITCH_TO_LIVE_MODAL_ID
} from 'toggle/responsive/player/playerModals';
import { PlayerAdsOverlay } from 'toggle/responsive/player/PlayerAdsOverlay';
import NotificationComponent from 'toggle/responsive/app/notifications/NotificationComponent';
import * as PropTypes from 'prop-types';
import { debounce, throttle } from 'shared/util/performance';
import UpsellScreenModal, { UPSELL_SCREEN_MODAL } from '../component/modal/UpsellScreenModal';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { redirectToSignPage } from '../pageEntry/subscription/subscriptionsUtils';
import { addBodyClass, removeBodyClass } from 'toggle/responsive/util/cssUtil';
import { getYouboraParam, getAnalyticData, getSmartSwitchConfig, getNPAWConfig } from 'shared/analytics/api/util';
import { analyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { ContinueWatchingAnonymous } from 'shared/list/listId';
import { convertTimeToSeconds } from 'shared/util/time';
import { GetAnalyticContextData } from 'shared/analytics/api/shared';
import { DEFAULT_PLAYBACK_SPEED, OPTION_LABEL_NORMAL } from 'shared/app/localeUtil';
import * as VideoApi from 'shared/analytics/api/video';
import { checkPrimeSubscriber } from 'toggle/responsive/pageEntry/account/accountUtils';
import AdBanner from '../component/AdBanner';
import AdvisoryMessage from 'toggle/responsive/player/AdvisoryMessage';
import CloseIcon from '../component/icons/CloseIcon';
import { KalturaPlayerWrapper } from 'toggle/responsive/player/KalturaPlayerWrapper';
import ControlsClickableLink from 'toggle/responsive/player/controls/ControlsClickableLink';
import EaseLiveOverlay from 'toggle/responsive/player/easelive/EaseLiveOverlay';
import { getScheduleLength } from 'shared/util/dates';
import { isMovie } from 'shared/util/itemUtils';
import { isShortVideo } from 'toggle/responsive/util/playerUtil';

import './PlayerComponent.scss';

export const PLAYER_OVERLAY_MODAL_ID = 'player-overlay';
const SHOW_PASSIVE_NOTIFICATION_DEBOUNCE_TIME_MS = 500; // 0.5s
const SKIP_INTRO_HIDE_OFFSET = 5;
const SKIP_INTRO_SKIP_OFFSET = 3;
const SCROLL_PERCENT_TO_PAUSE = 50;
const CONTROLS_HIDE_DELAY = 3000;
const PAUSE_CONTROL_HIDE_DELAY = 3000;
const SEEK_CONTROLS_OFFSET = 10;
const DEFAULT_ALLOWED_SEEK_GAP_SECONDS = 10;
const OVERLAY_SHOW_INTERVAL = 50;
const USER_INTERACTION_TIME = 200;
const VOLUME_STEP = 0.1;
const DEFAULT_CREDIT_SHOW_TIME = 20;
const MIN_VIDEO_LENGTH = 30;
const ON_KEYDOWN_DEBOUNCE_TIME_MILLISECONDS = 500;
const PLAYBACK_TIMER = 3000;

interface PlayerComponentProps {
	item: api.ItemDetail;
	data?: api.MediaFile[];
	autoPlay: boolean;
	playerId: string;
	currentTime?: number;
	onError?: (error: Error) => void;
	onNavigate?: (path: string) => void;
	onBack: () => void;
	account: api.Account;
	activeProfile: api.ProfileDetail;
	classification: api.Classification;
	chainPlaySqueezeback: number;
	activeAccount: boolean;
	thumbnailVisible: boolean;
	noUiControls?: boolean;
	isOverlayModalOpen?: boolean;
	isAppModalOpen?: boolean;
	isChannelSelectorVisible?: boolean;
	playerOverlayModals?: Array<ModalConfig>;
	subtitleLanguages: api.Language[];
	currentProgram?: api.ItemSchedule;
	list?: api.ItemList;
	linear?: boolean;
	embed?: boolean;
	startover?: boolean;
	onToggleStartoverMode?: () => void;
	customId?: number;
	playback: api.AppConfigPlayback;
	playerAdTagURL: string;
	ks?: string;
	ads: api.AppConfigAdvertisments;
	websiteUrl: string;
	chromecastConnection?: state.CastConnectionStatus;
	heartbeatFrequency?: number;
	autoFullscreen?: true;
	skipIntroInteractionTimeInSeconds: number;
	watchCreditsCtaCountdown?: number;
	isAnonymous: boolean;
	viewEventPoints: number[];
	config: state.Config;
	defaultVolume?: number;
	isMuted?: boolean;
	muteInteraction: boolean;
	routeHistory?: state.PageHistoryEntry[];
	location: HistoryLocation;
	plans: api.Plan[];
	isSessionValid: boolean;
	startOverAllowedSeekGapInSeconds?: number;
	xt1ChainPlayList?: number | string;
	selectedPlaybackSpeed: state.Player['selectedPlaybackSpeed'];
}

interface PlayerComponentState {
	playerState: PlayerState;
	currentTime: number;
	duration: number;
	isManifestStatic?: boolean;
	startTimeOfDvrWindow?: number;
	chainPlayMode: ChainPlayMode;
	showUI?: boolean;
	showMetadata: boolean;
	showControls?: boolean;
	showVideo?: boolean;
	showAds?: boolean;
	onOverlayOpen?: boolean;
	showCastIntroduction: boolean;
	isMobile: boolean;
	isWatchCreditsMode: boolean;
	isWatchCreditsRequested: boolean;
	scaleFactor: number;
	fullscreen: boolean;
	thumbnailVisible: boolean;
	showSkipIntroButton: boolean;
	isScrumbleSeeking: boolean;
	focused: boolean;
	isAdPaused: boolean; // use flag instead of having it as playback State to avoid bugs with multiple state overwriting
	showPauseAd: boolean;
	pauseAdRendered?: boolean;
	haveEverPlayed: boolean;
	analyticsData?: VideoApi.VideoAnalyticsData;
	isCreditsShown?: boolean;
	showAdvisory?: boolean;
	showPlaybackSpeed: boolean;
	isPlaybackRateChangeError: boolean;
}

interface StoreDispatchProps {
	saveResumePosition: (item: api.ItemSummary, position: number, action: HeartbeatActions) => void;
	updateResumePosition: (item, position) => void;
	saveRealVideoPosition: (itemId: string, position: number) => void;
	startedPlaying: (item: api.ItemDetail) => void;
	getContentGuarded: (
		account: api.Account,
		activeProfile: api.ProfileDetail,
		classification: api.Classification,
		item: api.ItemDetail,
		player: PlayerInterface,
		onSuccessCallback?: () => void
	) => void;
	toggleMutedState: (isMuted: boolean) => void;
	saveVolume: typeof saveVolume;
	removeAnonymousContinueWatching: () => void;
	saveAnonymousVideoPosition?: (itemId: string, position: number) => void;
	updateCurrentVideoPosition: (currentTime: number) => void;
	closeModal: (id: string) => void;
	openModal: (modal: ModalConfig) => void;
	hideAllModals: () => void;
	upsellScreenPageAnalytic: () => void;
	interactMutedState: (hasInteracted: boolean) => void;
	setPlayerInitialised: (isInitialised: boolean) => void;
	setSessionStatus: (isSessionValid: boolean) => void;
	setInactivityTimer: () => void;
	resetInactivityTimer: () => Promise<any>;
	showPassiveNotification: (config: PassiveNotificationConfig) => void;
	updateVideoEntryPoint: (entryPoint?: VideoEntryPoint) => void;
	changePlaybackSpeed: typeof changePlaybackSpeed;
	updatePlayedTrackSpeed: (playbackSpeed: PlayerPlaybackRateInformation) => void;
}

interface HOOQPlayer extends BasePlayerWrapper {
	isBumperPlaying(): boolean;
}

const bemPlayer = new Bem('player');
const bemPlayerBlock = new Bem('player-block');
const bemPlayerOverlay = new Bem('player-overlay');

const BACK_STEP_COUNT = 2;

enum ChainPlayMode {
	None = 'none',
	Active = 'active',
	Done = 'done'
}

type Props = PlayerComponentProps & StoreDispatchProps;

type ViewEventPointsMap = Map<number, boolean>;

class PlayerComponent extends React.Component<Props, PlayerComponentState> {
	static contextTypes = {
		emitVideoEvent: PropTypes.func
	};

	static defaultProps = {
		noUiControls: false
	};

	private player: KalturaPlayerWrapper;
	private videoContainer: HTMLElement;
	private playerContainer: HTMLElement;
	private vrOverlay: HTMLElement;
	private isVrInteract: boolean;
	private hideTimeout: number;
	private hideMetadataTimeout: number;
	private pauseTimeout: number;
	private isPlaybackStarted: boolean;
	private skipIntroTimer: ITimer;
	private mouseInteractTimeout: number;
	private viewEventPointsMap: ViewEventPointsMap;
	private HIDE_CURSOR = 'fullscreen-hide-cursor';
	private tapableClassName: string;
	private skipIntroButtonTimeout: number;
	private isAdSlotRenderCallbackRegistered: boolean;
	private startoverResumePosition: number;
	private onMouseLeaveTimeout: number;
	private smartswitch: any;
	private playbackSpeedRenderTimer: number;

	constructor(props) {
		super(props);

		this.state = {
			playerState: PlayerState.UNKNOWN,
			currentTime: this.props.currentTime || this.getResumePosition(),
			duration: 0,
			chainPlayMode: ChainPlayMode.None,
			showControls: false,
			showUI: false,
			showMetadata: false,
			showVideo: true,
			showCastIntroduction: false,
			isMobile: this.isMobile(),
			showAds: true,
			isWatchCreditsMode: true,
			isWatchCreditsRequested: false,
			scaleFactor: 1,
			fullscreen: fullscreenService.isFullScreen(),
			thumbnailVisible: this.props.thumbnailVisible,
			showSkipIntroButton: !!get(this.props, 'item.customFields.IntroEndingPositionInSeconds'),
			isScrumbleSeeking: false,
			focused: true,
			isAdPaused: false,
			showPauseAd: false,
			pauseAdRendered: false,
			haveEverPlayed: false,
			isCreditsShown: false,
			showAdvisory: true,
			showPlaybackSpeed: false,
			isPlaybackRateChangeError: false
		};
		this.viewEventPointsMap = this.createViewEventPointsMap();

		this.onKeyDown = this.onKeyDown.bind(this);
	}

	async componentDidMount() {
		if (this.props.data && this.props.item.customId) {
			await this.createPlayer();
			this.loadPlayer();
		}

		const fullscreen = fullscreenService.isFullScreen();

		if (this.state.fullscreen !== fullscreen) {
			this.videoContainer && this.setState({ fullscreen });
		}

		if (fullscreen) {
			if (this.state.showUI) {
				this.showCursor();
			} else {
				this.hideCursor();
			}
		}

		this.onResize();
		this.createTimers();
		this.startSkipIntroVisibilityTimer();

		// To make sure that a new video session is not invalidated by a previous one
		this.resetInactivityTimer();

		fullscreenService.setCallback(this.fullscreenCallback);

		if (this.props.isAnonymous && !isTrailer(this.props.item)) {
			this.props.removeAnonymousContinueWatching();
		}

		window.addEventListener('resize', this.onResize, false);
		window.addEventListener(
			'keydown',
			debounce(
				e => {
					this.onKeyDown(e);
				},
				ON_KEYDOWN_DEBOUNCE_TIME_MILLISECONDS,
				true
			),
			true
		);
		window.addEventListener('scroll', this.onScroll, false);
		document.addEventListener('visibilitychange', this.onVisibilityChange); // window.addEventListener('visibilitychange') doesnt work on older Safari
		window.addEventListener('click', this.onWindowClick, false);
	}

	private setInitialVolumeState() {
		const { defaultVolume, isMuted, muteInteraction, routeHistory } = this.props;
		const autoSetToMute = !isMuted && !muteInteraction;

		if (!isMobile() || (isMobile() && muteInteraction)) {
			this.player.setVolume(defaultVolume);
			this.player.setVolumeMutedState(isMuted);
		}

		// auto mute video (provided no interaction with mute button) to allow auto playback on the specific browsers
		if (
			((this.isChannel() && !this.state.haveEverPlayed) ||
				(isMobile() && autoSetToMute) ||
				(isSafari() && autoSetToMute) ||
				isFirstPageInHistory(routeHistory)) &&
			(autoSetToMute || isMuted)
		)
			this.setVolumeMutedState(true);
	}

	componentWillReceiveProps(nextProps: PlayerComponentProps) {
		if (nextProps.data !== this.props.data) {
			this.disposePlayer();
			this.setState({
				playerState: PlayerState.UNKNOWN,
				currentTime: this.getResumePosition(),
				duration: 0,
				chainPlayMode: ChainPlayMode.None,
				showControls: false,
				showUI: false,
				showVideo: true
			});
		}
		if (nextProps.isOverlayModalOpen !== this.props.isOverlayModalOpen && !nextProps.isOverlayModalOpen) {
			this.restartTimer();
		}

		if (nextProps.thumbnailVisible !== this.props.thumbnailVisible) {
			if (!nextProps.thumbnailVisible) {
				this.restartTimer();
			}
			this.setState({ thumbnailVisible: nextProps.thumbnailVisible });
		}
	}

	componentWillUpdate(nextProps: PlayerComponentProps, nextState: PlayerComponentState) {
		const [from, next] = [this.state.chainPlayMode, nextState.chainPlayMode];
		const isNextChainPlay = this.isChainPlayActive(next);
		const isStartingChainPlay = isNextChainPlay && from === ChainPlayMode.None;
		const isEndingChainPlay = this.isChainPlayFinalized(next) && this.isChainPlayActive(from);

		if (isNextChainPlay && this.isAdsEnded()) {
			this.player.emit(PlayerEventType.action, { name: PlayerAction.Squeezeback, payload: true });
		}

		if (isStartingChainPlay) {
			this.setState({ showCastIntroduction: false });
		} else if (isEndingChainPlay) {
			this.checkCastIntroduction();
		}
	}

	async componentDidUpdate(prevProps: PlayerComponentProps, prevState: PlayerComponentState) {
		const { item, data, startover, chromecastConnection, customId, selectedPlaybackSpeed } = this.props;
		const { isWatchCreditsMode, isWatchCreditsRequested, currentTime, isCreditsShown, duration } = this.state;
		if (this.shouldRenderEndingCredits() && isWatchCreditsMode && !isWatchCreditsRequested) {
			this.setState({ isWatchCreditsMode: false });
		}

		if (this.shouldRenderEndingCredits() && prevState.currentTime !== currentTime && !isCreditsShown) {
			this.setState({ isCreditsShown: true });
		}

		if (prevState.isCreditsShown !== isCreditsShown && isCreditsShown) {
			this.player.emit(PlayerEventType.action, { name: PlayerAction.WatchCompleted });
		}

		if (
			(data && Array.isArray(data) && data !== prevProps.data) ||
			(item.customId && item.customId !== prevProps.item.customId) ||
			(startover !== prevProps.startover && customId !== prevProps.customId)
		) {
			if (!this.player) await this.createPlayer();
			this.loadPlayer();
		}

		if (prevProps.autoFullscreen !== this.props.autoFullscreen && !fullscreenService.isFullScreen()) {
			fullscreenService.switchOnFullscreen();
		}

		const fullscreen = fullscreenService.isFullScreen();
		if (this.state.fullscreen !== fullscreen) {
			if (!fullscreen) {
				this.closePlayerOverlays();
			}
			this.videoContainer && this.setState({ fullscreen });
		}

		// The chromecast receiver will also send heartbeat
		if (chromecastConnection !== prevProps.chromecastConnection) {
			if (chromecastConnection === 'Connecting') {
				this.showCursor();
			}
		}

		if (duration > 0 && prevProps.selectedPlaybackSpeed !== selectedPlaybackSpeed) {
			this.setState({ showPlaybackSpeed: true });
			this.playbackSpeedRenderTimer = window.setTimeout(() => {
				this.setState({ showPlaybackSpeed: false });
				window.clearTimeout(this.playbackSpeedRenderTimer);
			}, PLAYBACK_TIMER);
		}
	}

	componentWillUnmount() {
		this.stopTimerDelay();
		// we need to save realtime to data model
		// we will use it for chromecast playback start, especially in case we connect to chromecast when end of playback is active.
		// not ideal solution, but didn't find the better one
		const {
			item,
			saveRealVideoPosition,
			updateCurrentVideoPosition,
			isSessionValid,
			setInactivityTimer,
			updateVideoEntryPoint
		} = this.props;

		if (this.player) {
			try {
				this.player.pause();
			} catch (e) {}

			const playerProperties = this.player.getLastProperties();
			const realTime = (playerProperties && playerProperties.currentTime) || 0;
			if (!isTrailer(item)) {
				saveRealVideoPosition(item.id, realTime);
				updateCurrentVideoPosition(0);
			}
			this.saveHeartbeatPosition(HeartbeatActions.STOP);

			if (this.isChannel()) this.setVolumeMutedState(false);
			this.saveAnonymousVideoPosition();
		}
		this.disposePlayer();
		if (this.skipIntroTimer) this.skipIntroTimer.stop();
		fullscreenService.removeCallback(this.fullscreenCallback);
		window.removeEventListener('resize', this.onResize);
		window.removeEventListener('keydown', this.onKeyDown, true);
		window.removeEventListener('scroll', this.onScroll);
		document.removeEventListener('visibilitychange', this.onVisibilityChange); // window.removeEventListener('visibilitychange') doesnt work on older Safari
		window.removeEventListener('click', this.onWindowClick, false);
		if (isSessionValid) setInactivityTimer();
		window.clearTimeout(this.mouseInteractTimeout);
		window.clearTimeout(this.pauseTimeout);
		window.clearInterval(this.hideMetadataTimeout);
		window.clearInterval(this.skipIntroButtonTimeout);
		window.clearTimeout(this.onMouseLeaveTimeout);
		window.clearTimeout(this.playbackSpeedRenderTimer);
		this.showCursor();
		updateVideoEntryPoint();
	}

	private fullscreenCallback = (): void => {
		this.player &&
			this.player.emit(PlayerEventType.action, {
				name: PlayerAction.Fullscreen,
				payload: fullscreenService.isFullScreen()
			});

		// This is required to ensure that the cursor is shown.
		// When the browser natively closes the fullscreen functionality then
		// fullscreenService.exitFullscreen is not called but the callback is.
		if (!fullscreenService.isFullScreen()) {
			this.showCursor();
		}
	};

	private onWindowClick = e => {
		const focused =
			e.target === this.playerContainer || (this.playerContainer && this.playerContainer.contains(e.target));
		this.setState({ focused });
	};

	private onResize = () => {
		const isMobile = this.isMobile();
		const scaleFactor = Math.min(getVideoScaleFactor(), 1);
		this.setState({ isMobile, scaleFactor });
	};

	private isMobile() {
		return isMobile() || isTabletSize();
	}

	private getSubtitles() {
		const { data } = this.props;
		const streamWithSubs = Array.isArray(data) && data.find(item => typeof item.subtitles !== 'undefined');

		if (typeof streamWithSubs === 'undefined') return undefined;

		return streamWithSubs.subtitles;
	}

	createTimers() {
		const { skipIntroInteractionTimeInSeconds } = this.props;

		if (!skipIntroInteractionTimeInSeconds) return;

		this.skipIntroTimer = new Timer(
			() => this.toggleSkipIntroVisibility(false),
			skipIntroInteractionTimeInSeconds * 1000
		);
	}

	private async createPlayer() {
		if (!this.player) {
			const {
				subtitleLanguages,
				item,
				playback,
				ks,
				account,
				plans,
				activeProfile,
				heartbeatFrequency,
				autoPlay,
				embed,
				customId,
				startover,
				config
			} = this.props;
			const subtitles = this.getSubtitles();
			const isVr = isItemVr(item);
			const isHOOQContent = isHOOQ(item);
			const isSSAI = isItemSSAI(item);
			const startoverInfo: VideoApi.StartoverInfo = { startover, epgID: customId };
			const contextData = { item, account, plans, activeProfile, startoverInfo };

			await getAnalyticData(contextData as GetAnalyticContextData).then(async analyticsData => {
				const youbora = getYouboraParam(item, analyticsData, startoverInfo);

				let ads = {};
				// Try / Catch block so that if ad-blockers present, the player doesn't completely error out and stop playback
				try {
					// @Todo: Make sure that ads should be shown to the user. If not let's not call the video api
					const skipGetAds = embed && hasNoAds();
					if (!skipGetAds && !startover) {
						ads = await this.getAdsConfig(analyticsData);
					}
				} catch (e) {
					// if (_DEV_) console.log(e);
				}

				const poster = get(item, 'images.wallpaper') || '';
				const restrictedMaxBitRate = getDisneyContentBitRate(item);

				let options = {
					subtitles,
					subtitleLanguages,
					playback,
					isVr,
					vrOverlay: this.vrOverlay,
					isHOOQContent,
					ks,
					poster,
					restrictedMaxBitRate,
					startoverInfo,
					autoplay: autoPlay,
					isSSAI,
					embed
				};

				const plugins: any = {
					ottAnalytics: {
						serviceUrl: getKalturaHeartbeatUrl(),
						ks,
						experimentalEnableLiveMediaHit: true
					}
				};

				if (youbora) {
					plugins.youbora = youbora;
				}

				const npawConfig = getNPAWConfig(config);
				const smartswitch = getSmartSwitchConfig({
					item,
					...npawConfig
				});
				if (smartswitch) {
					this.smartswitch = smartswitch;
					plugins.smartswitch = smartswitch;
				}

				if (heartbeatFrequency) {
					plugins.ottAnalytics = Object.assign(plugins.ottAnalytics, { mediaHitInterval: heartbeatFrequency });
				}

				options = Object.assign(options, { plugins });

				if (typeof ads !== 'undefined' && !isEmptyObject(ads)) {
					options = Object.assign(options, { ads });
				}

				this.player = await getPlayer(options);
				this.player = wrapPlayer(item, this.player as any, this.context.emitVideoEvent, startoverInfo);

				this.player.addListener(PlayerEventType.state, this.onStateChanged);
				this.player.addListener(PlayerEventType.error, this.onError);
				this.player.addListener(PlayerEventType.properties, this.onPlayerProperties);
				this.player.addListener(PlayerEventType.vrInteraction, this.onVrInteraction);

				this.setInitialVolumeState();

				if (!this.props.autoPlay) {
					// Render play button if video is not in autoplay mode
					this.setState({
						playerState: PlayerState.READY,
						showUI: true,
						showAds: false,
						analyticsData: analyticsData as VideoApi.VideoAnalyticsData
					});
					this.setVolumeMutedState(false);
				} else {
					this.setState({ analyticsData: analyticsData as VideoApi.VideoAnalyticsData });
				}
			});
		}
	}

	private disposePlayer() {
		if (this.player) {
			this.player.removeListener(PlayerEventType.state, this.onStateChanged);
			this.player.removeListener(PlayerEventType.error, this.onError);
			this.player.removeListener(PlayerEventType.properties, this.onPlayerProperties);
			this.player.dispose();
			this.player = undefined;
		}
	}

	private saveAnonymousVideoPosition() {
		const { item, isAnonymous, saveAnonymousVideoPosition, updateResumePosition } = this.props;
		const { duration, currentTime } = this.state;

		if (isTrailer(item) || !isAnonymous || !(duration && item && currentTime) || this.isChannel()) return;

		saveAnonymousVideoPosition(item.id, Math.floor(currentTime));
		updateResumePosition(item, Math.floor(currentTime));
	}

	private saveHeartbeatPosition = (action: HeartbeatActions) => {
		const { item, updateResumePosition } = this.props;
		const { currentTime } = this.state;
		if (isTrailer(item)) return;

		updateResumePosition(item, currentTime);
	};

	private loadPlayer(isVideoPlayFromStart?) {
		const { item, autoPlay, data, startover, customId, setPlayerInitialised, setSessionStatus } = this.props;

		const options = {
			item,
			data,
			autoPlay,
			startTime: isVideoPlayFromStart ? 0 : this.state.currentTime,
			startover,
			customId,
			smartswitch: this.smartswitch
		};

		this.playerContainer = findDOMNode(this);
		this.videoContainer = this.playerContainer.querySelector('.js-player-container') as HTMLElement;

		this.player.initPlayback(this.videoContainer, options).then(success => {
			if (success && !this.player.ownControls && !(this.player as HOOQPlayer).isBumperPlaying()) {
				setPlayerInitialised(true);
				setSessionStatus(true);
				this.setState({ showControls: true, focused: true });
			}
		});
	}

	private getResumePosition() {
		const { item, location } = this.props;
		const queryTimeStamp = location.query.t;

		if (isTrailer(item)) return 0;

		// 	Read start position from URL query param if present
		if (!this.isChannel() && queryTimeStamp) return Number(queryTimeStamp);

		return getResumePosition(item.id);
	}

	private isChannel = () => this.props.item.type === 'channel';

	private isPlayerNotLoading() {
		const { playerState, chainPlayMode, duration } = this.state;

		return (
			duration > 0 &&
			!this.isChainPlayActive(chainPlayMode) &&
			playerState !== PlayerState.UNKNOWN &&
			playerState !== PlayerState.LOADING &&
			playerState !== PlayerState.ENDED
		);
	}

	handleShowAdvisory = flag => {
		this.setState({ showAdvisory: flag });
	};

	private checkPlayerState = () => {
		const { item, setInactivityTimer, openModal, startover, onToggleStartoverMode } = this.props;
		this.stopTimerDelay();
		switch (this.state.playerState) {
			case PlayerState.PLAYING:
				this.setVideoVisibility(true);
				this.startTimerDelay();
				this.playbackStarted();
				this.saveHeartbeatPosition(HeartbeatActions.PLAY);
				this.onAdsEnded();
				if (!this.state.haveEverPlayed) this.setState({ haveEverPlayed: true });
				break;
			case PlayerState.BUFFERING:
				this.saveHeartbeatPosition(HeartbeatActions.LOAD);
				this.resetInactivityTimer();
				break;
			case PlayerState.PAUSED:
				if (this.isPlaybackStarted) {
					this.setControlsVisibility(true);
					if (startover) {
						this.startoverResumePosition = getCurrentTime();
					}
					this.pauseTimeout = window.setTimeout(() => {
						this.setControlsVisibility(false);
					}, PAUSE_CONTROL_HIDE_DELAY);
					this.setMetadataVisability();
				}
				break;
			case PlayerState.ENDED:
				const { isCreditsShown, currentTime } = this.state;
				const { embed } = this.props;
				if (this.isAdsEnded()) {
					this.setVideoVisibility(false);
					setInactivityTimer();
					if (startover) {
						openModal({
							id: PROGRAMME_ENDED_MODAL_ID,
							type: ModalTypes.CONFIRMATION_DIALOG,
							disableAutoClose: true,
							componentProps: {
								title: '@{player_modal_start_over_ended|Start Over programme ended.}',
								confirmLabel: '@{exitStartOver_cta|Exit Start Over}',
								onConfirm: onToggleStartoverMode,
								hideCloseIcon: true
							}
						});
						return;
					}
					if (isTrailer(item) && !embed) {
						if (!this.props.xt1ChainPlayList) {
							this.onBack();
						}
					} else {
						// MEDTOG-9192 Kaltura Web player sends FINISH instead of STOP as defualt,
						// this cause MEDTOG-10788
						const { saveResumePosition } = this.props;
						saveResumePosition(item, currentTime, HeartbeatActions.STOP);
						this.deactivateChainPlay();
					}
				}

				if (!isCreditsShown) {
					this.player.emit(PlayerEventType.action, { name: PlayerAction.WatchCompleted });
				}

				break;
		}

		this.setState({ showControls: !(this.player as HOOQPlayer).isBumperPlaying() });
	};

	setMetadataVisability(value = true) {
		window.clearTimeout(this.hideMetadataTimeout);
		if (this.state.showMetadata !== value) this.setState({ showMetadata: value });

		if (value) {
			this.hideMetadataTimeout = window.setTimeout(() => {
				this.setState({ showMetadata: false });
			}, CONTROLS_HIDE_DELAY);
		}
	}

	private deactivateChainPlay() {
		this.setState({ chainPlayMode: ChainPlayMode.Done });
	}

	private resetChainPlay() {
		this.setState({ chainPlayMode: ChainPlayMode.None });
	}

	private canShowEndOfPlayback() {
		const { playerState, chainPlayMode } = this.state;
		const { noUiControls, item, xt1ChainPlayList, embed } = this.props;

		return (
			!this.isChannel() &&
			this.isAdsEnded() &&
			!noUiControls &&
			!(isTrailer(item) && !embed && !xt1ChainPlayList) &&
			(playerState === PlayerState.ENDED || this.isChainPlayActive(chainPlayMode))
		);
	}

	private canChainPlay(playerProperties: PlayerProperties) {
		const { chainPlaySqueezeback, item, xt1ChainPlayList } = this.props;
		const { chainPlayMode, playerState } = this.state;
		const { currentTime, duration } = playerProperties;

		return (
			!(isTrailer(item) && !xt1ChainPlayList) &&
			!this.isChannel() &&
			this.isAdsEnded() &&
			duration > 0 &&
			this.isChainPlayInactive(chainPlayMode) &&
			chainPlaySqueezeback &&
			duration - currentTime <= chainPlaySqueezeback &&
			playerState !== PlayerState.BUFFERING
		);
	}

	private playbackStarted() {
		if (!this.isPlaybackStarted) {
			this.isPlaybackStarted = true;
			const { startedPlaying, item } = this.props;
			startedPlaying(item);
			this.startSkipIntroVisibilityTimer();
			this.checkCastIntroduction();
			this.saveHeartbeatPosition(HeartbeatActions.FIRST_PLAY);
		}
	}

	private checkCastIntroduction() {
		const { chromecastConnection, item, embed } = this.props;
		if (!embed && isCastSupported() && chromecastConnection !== 'No devices' && showCastIntro() && !isItemVr(item)) {
			this.setState({ showCastIntroduction: true, showUI: true }, () => this.stopTimerDelay());
		}
	}

	private onError = error => {
		warning(error);
		const { onError, startover, onToggleStartoverMode } = this.props;
		if (startover) {
			const { openModal } = this.props;
			openModal({
				id: SWITCH_TO_LIVE_MODAL_ID,
				type: ModalTypes.CONFIRMATION_DIALOG,
				componentProps: {
					title: '@{player_modal_loading_error|Sorry, a loading error has occured}',
					className: 'startover-switch-modal',
					children: (
						<IntlFormatter>
							{'@{player_modal_loading_error_description|Would you like to restart this programme?}'}
						</IntlFormatter>
					),
					confirmLabel: '@{app.yes|Yes}',
					cancelLabel: '@{player_modal_no_exit_start_over|No, Exit Start Over}',
					onConfirm: () => {
						this.loadPlayer(true);
					},
					onCancel: onToggleStartoverMode,
					hideCloseIcon: true
				}
			});
			return;
		}
		if (onError) onError(error);
	};

	private onReplay = () => {
		this.saveHeartbeatPosition(HeartbeatActions.STOP);
		this.setState({ currentTime: 0, duration: 0, isWatchCreditsMode: true });
		this.resetChainPlay();
		this.resetWatchCreditsState();
		this.player.emit(PlayerEventType.action, { name: PlayerAction.Restart, payload: true });
		this.player.replay();
		this.setState({ isCreditsShown: false });
	};

	private onVideoClick = e => {
		this.deactivateChainPlay();
	};

	private onStateChanged = state => {
		const { haveEverPlayed, playerState: oldPlayerState } = this.state;
		const isPaused = state === PlayerState.PAUSED;
		const isReplay = oldPlayerState === PlayerState.PAUSED && state === PlayerState.PLAYING;
		this.setState(
			{
				haveEverPlayed: haveEverPlayed || state === PlayerState.PLAYING,
				playerState: state,
				showPauseAd: isPaused,
				pauseAdRendered: !(isPaused || isReplay || true)
			},
			this.checkPlayerState
		);
	};

	private onPlayerProperties = (playerProperties: PlayerProperties) => {
		const { startover, updateCurrentVideoPosition } = this.props;
		const { chainPlayMode, isScrumbleSeeking, showAds, playerState } = this.state;
		if (isScrumbleSeeking) return;

		const { currentTime, duration, startTimeOfDvrWindow } = playerProperties;
		// Once Live Program ends, manifest will switch from dynamic to static,
		// For Kaltura player, if dynamic manifest,  usually DVR is a very large number, eg, 3 months before current time
		// If once manifest is static, DVR become buffered time
		const isManifestStatic =
			this.isChannel() && this.programFinished() && startTimeOfDvrWindow < getScheduleLength(this.props.currentProgram);

		this.setState({
			currentTime,
			duration,
			isManifestStatic,
			startTimeOfDvrWindow,
			chainPlayMode: this.canChainPlay(playerProperties) ? ChainPlayMode.Active : chainPlayMode
		});

		if (showAds) return;

		if (this.shouldFireViewPointsEvent(currentTime, duration)) {
			this.saveAnonymousVideoPosition();
		}

		if (startover && playerState === PlayerState.PAUSED && this.programFinished() && currentTime > 0) {
			if (currentTime !== this.startoverResumePosition) {
				this.player.seek(this.startoverResumePosition);
			}
		} else {
			updateCurrentVideoPosition(currentTime);
		}
	};

	private onCloseCastIntroduction = () => {
		changeCastIntroStatus(true);
		this.setState({ showCastIntroduction: false }, () => this.startTimerDelay());
	};

	private onScroll = e => {
		const scroller = this.playerContainer;
		const { playerState, haveEverPlayed } = this.state;
		const { noUiControls } = this.props;
		this.closePlayerOverlays();
		if (!noUiControls) return;

		if (scroller) {
			const { scrollY } = window;
			const height = scroller.clientHeight;
			const scrollHeight = height - scrollY;

			if (scrollHeight > 0 && playerState !== PlayerState.UNKNOWN) {
				const percent = Math.floor((scrollHeight / height) * 100);

				if (
					percent <= SCROLL_PERCENT_TO_PAUSE &&
					playerState !== PlayerState.PAUSED &&
					playerState !== PlayerState.ENDED &&
					!this.isAdPlaying() &&
					!this.isChannel()
				) {
					if (!haveEverPlayed) this.setState({ haveEverPlayed: true });
					this.player.pause();
				}

				if (
					percent > SCROLL_PERCENT_TO_PAUSE &&
					playerState !== PlayerState.PLAYING &&
					playerState !== PlayerState.ENDED &&
					!this.isAdPlaying() &&
					!this.isChannel()
				) {
					this.player.play();
				}
			}
		}
	};

	closePlayerOverlays() {
		const { closeModal, playerOverlayModals, isOverlayModalOpen } = this.props;

		if (isOverlayModalOpen) {
			playerOverlayModals.forEach(modal => {
				closeModal(modal.id.toString());
			});
		}
	}

	private getScalableStyles() {
		const { linear, noUiControls, embed } = this.props;
		const { fullscreen, scaleFactor } = this.state;

		if (
			(linear && !embed) ||
			noUiControls ||
			isWidthLessThanPhablet() ||
			fullscreenService.isFakeFullscreen() ||
			fullscreen
		) {
			return;
		}

		return {
			transform: `scale(${scaleFactor})`
		};
	}

	public showCursor(): void {
		removeBodyClass(this.HIDE_CURSOR);
	}

	public hideCursor(): void {
		if (fullscreenService.isFullScreen()) {
			addBodyClass(this.HIDE_CURSOR);
		}
	}

	render() {
		const {
			chainPlayMode,
			showVideo,
			onOverlayOpen,
			showAds,
			showUI,
			currentTime,
			showAdvisory,
			scaleFactor
		} = this.state;
		const {
			noUiControls,
			item,
			isMuted,
			defaultVolume,
			linear,
			interactMutedState,
			embed,
			currentProgram
		} = this.props;
		const isVr = isItemVr(item);
		const shouldRenderEndingCredits = this.shouldRenderEndingCredits();
		const isWrapped =
			this.isChainPlayActive(chainPlayMode) && !noUiControls && !shouldRenderEndingCredits && this.isAdsEnded();
		const isAutoplayHero = noUiControls;
		const isPlayable = this.isPlayable();
		const renderMetadataForAds = isPortrait() && !fullscreenService.isFullScreen() && this.isAdPlaying() && !linear;
		const clickableUrl = linear ? currentProgram && currentProgram.item.url : item.customFields.Url;
		const isContentPlaying =
			!this.isAdPlaying() && !this.canShowEndOfPlayback() && !this.shouldShowSpinner() && !showUI;
		return (
			<div
				className={cx(
					bemPlayer.b({
						'ads-playing': showAds,
						overlay: onOverlayOpen,
						'no-fullscreen': noUiControls,
						'fake-fullscreen': fullscreenService.isFakeFullscreen(),
						'end-credit': shouldRenderEndingCredits,
						'end-of-playback': this.canShowEndOfPlayback(),
						scalable: scaleFactor === 1
					})
				)}
				style={this.getScalableStyles()}
				id={PLAYER_WRAPPER_ID}
				onMouseMove={this.onPlayerMouseInteract}
				onTouchEnd={this.onTouchEnd}
				onClick={this.onPlayerMouseInteract}
			>
				{!this.isAdPlaying() && !this.canShowEndOfPlayback() && !this.shouldShowSpinner() && clickableUrl && (
					<ControlsClickableLink
						clickableLinkUrl={clickableUrl}
						item={{ ...item, scheduleItem: currentProgram }}
						currentTime={currentTime}
					/>
				)}

				<div
					className={bemPlayerBlock.b({
						'is-autoplay-hero': isAutoplayHero,
						'is-hidden': isAutoplayHero && !isPlayable
					})}
				>
					{isVr && this.render360VrOverlay()}
					<div className={bemPlayerBlock.e('fader', { shown: this.isFaderShown() })} />
					<div
						id="player-placeholder"
						className={cx(
							'js-player-container',
							bemPlayerBlock.e('container', {
								wrap: isWrapped,
								hide: !showVideo,
								'fade-player-background': !this.isChainPlayActive(chainPlayMode),
								'controls-shown': this.isFaderShown()
							})
						)}
						onClick={this.onVideoClick}
					/>
					{(showUI || isAutoplayHero) && <div className={bemPlayerBlock.e('overlay-gradient')} />}
					{this.player && this.isEaseLiveEnabled() && (
						<EaseLiveOverlay
							player={this.player}
							programId={item.customId}
							setControlsVisibility={this.setControlsVisibilityWithTimers}
							showUI={showUI}
						/>
					)}
					{this.isAdPlaying() && (
						<PlayerAdsOverlay
							toggleFullscreen={this.toggleFullscreen}
							isAdPlaying={showAds}
							isControlsShown={showUI}
							isMuted={isMuted}
							defaultVolume={defaultVolume}
							setVolumeMutedState={this.setVolumeMutedState}
							setVolume={this.setVolume}
							interactMutedState={interactMutedState}
							embed={embed}
						/>
					)}
					{this.shouldShowSpinner() && <Spinner className={bemPlayer.e('spinner')} />}
				</div>
				{!linear && !isAutoplayHero && isContentPlaying && (
					<AdvisoryMessage
						item={item}
						showAdvisoryMessage={showAdvisory}
						handleShowAdvisory={this.handleShowAdvisory}
					/>
				)}

				{this.renderPlayerOverlay()}
				{this.renderEndingCredits()}
				{this.renderEndOfPlayback()}
				{renderMetadataForAds && <div className={bemPlayer.e('ads-metadata')}>{this.renderMetadata()}</div>}
			</div>
		);
	}

	private isFaderShown() {
		return (
			this.state.showUI && !this.props.noUiControls && !this.canShowEndOfPlayback() && !this.shouldRenderEndingCredits()
		);
	}

	private renderMetadata() {
		const { item } = this.props;
		const { showMetadata } = this.state;
		const title = get(item, 'season.show.title') || item.title;
		const secondaryTitle = get(item, 'season.show.secondaryLanguageTitle') || item.secondaryLanguageTitle;

		return (
			<PlayerMetadata className={cx({ showMetadata })} title={title} secondaryTitle={secondaryTitle}>
				{this.renderEpisodeMetadata()}
				<p className="short-description">{item.shortDescription || item.description}</p>
			</PlayerMetadata>
		);
	}

	private renderPlayerOverlay() {
		if (_SSR_) return undefined;

		const { noUiControls } = this.props;

		if (noUiControls) {
			return this.renderNoUiControlsOverlay();
		}

		const { showUI } = this.state;
		const showControls = this.state.showControls && !this.shouldShowSpinner();

		const isMobile = isLessThanTabletSize() || (isTabletSize() && isPortrait());
		const isDesktop = !isMobile;

		const isChannelItem = this.isChannel();

		return (
			<div className={bemPlayerOverlay.b({ desktop: !isMobile, mobile: isMobile, ui: showUI })} key="playerOverlay">
				{this.renderBackArrow()}
				{this.renderSelectedPlaybackSpeed()}
				{showControls && this.renderOverlayingControls()}
				{isMobile && this.renderPortraitTapableArea()}
				{isChannelItem ? this.renderChannelWrapper() : this.renderWrapper()}
				{this.renderSkipIntro()}
				{this.renderPauseAd()}
				{isDesktop && this.renderCastIntroduction()}
				{isDesktop && this.renderThumbnailsPreload()}
			</div>
		);
	}

	private renderVolumeMuteButton() {
		return <VolumeMuteButton className={bemPlayerBlock.e('mute-btn')} player={this.player} />;
	}

	private render360VrOverlay() {
		return (
			<div
				className={cx(
					PLAYER_360_OVERLAY_CLASS,
					bemPlayer.e('vr-action-overlay', { hidden: this.canShowEndOfPlayback() })
				)}
				ref={this.onVrOverlayRef}
			/>
		);
	}

	private renderNoUiControlsOverlay() {
		const { noUiControls, item } = this.props;
		const { playerState } = this.state;

		const imageUrl = item.images && item.images.wallpaper;
		const style = { backgroundImage: `url("${imageUrl}")` };
		const isPlayable = this.isPlayable();
		const isEnded = playerState === PlayerState.ENDED;

		return (
			<div className={bemPlayer.e('link-wrapper')}>
				{isPlayable && this.renderVolumeMuteButton()}
				<Link to={item.path}>
					<div
						className={bemPlayerOverlay.b(
							{ 'image-bg': noUiControls },
							{ 'fade-out': isPlayable },
							{ 'fade-in': isEnded }
						)}
						style={style}
					/>
				</Link>
			</div>
		);
	}

	renderBackArrow = () => {
		const { fullscreen, showUI } = this.state;
		const { linear } = this.props;
		const onClick = linear ? this.toggleFullscreen : this.onBackButton;
		const shouldRenderBackArrow = linear ? fullscreen : !this.shouldHidePlayerControls();

		return (
			shouldRenderBackArrow && (
				<div className={bemPlayerOverlay.e('back', { showUI })} onClick={onClick}>
					<BackIcon className={bemPlayerOverlay.e('back-icon')} />
				</div>
			)
		);
	};

	renderSelectedPlaybackSpeed = () => {
		const { showPlaybackSpeed, isPlaybackRateChangeError } = this.state;
		const { selectedPlaybackSpeed } = this.props;

		return isPlaybackRateChangeError ? (
			<IntlFormatter tagName="div" className={bemPlayerOverlay.e('playback-speed-overlay')}>
				{'@{error_dialog_playback_rate_change}'}
			</IntlFormatter>
		) : (
			showPlaybackSpeed && (
				<div className={bemPlayerOverlay.e('playback-speed-overlay')}>
					{selectedPlaybackSpeed === DEFAULT_PLAYBACK_SPEED ? OPTION_LABEL_NORMAL : `${selectedPlaybackSpeed}x`}
				</div>
			)
		);
	};

	private renderPauseAd() {
		const { showPauseAd, fullscreen } = this.state;
		const isNonFSMobilePortrait = isMobilePortrait() && !fullscreen;

		if (isNonFSMobilePortrait || !showPauseAd) return;

		const { haveEverPlayed } = this.state;
		const { item, location, linear, activeProfile, account, embed, data } = this.props;
		const isPrimeSubscriber = activeProfile && checkPrimeSubscriber(account);
		const isTabletBanner = isMobile() && !isMobileLandscape() && (isTabletSize() || isTabletLandscape());
		const isMobileBanner = isMobileLandscape() && !isTabletBanner;

		if (!linear && haveEverPlayed && !embed && !isPrimeSubscriber) {
			const { analyticsData, pauseAdRendered } = this.state;
			const gam = analyticsData && analyticsData.gam;
			const language = get(data, '0.language');
			this.registerAdRendered();
			return (
				<div className={cx(bemPlayerOverlay.e('pause-ad', { portrait: isMobile() && isPortrait() }))}>
					<div className={bemPlayerOverlay.e('pause-ad-container', { 'mobile-device': isMobileBanner })}>
						<AdBanner
							textAdFormat={'leaderboard0'}
							location={location}
							item={item}
							gam={gam}
							language={language}
							isPausedAd
						/>
						{pauseAdRendered && (
							<span className={bemPlayerOverlay.e('pause-ad-close')} onClick={this.closePauseAd}>
								<CloseIcon />
							</span>
						)}
					</div>
				</div>
			);
		}
	}
	private renderPortraitTapableArea() {
		this.tapableClassName = bemPlayerBlock.e('tapable');
		return <div className={this.tapableClassName} />;
	}

	private shouldHidePlayerControls() {
		const { isWatchCreditsMode, isMobile } = this.state;
		if (this.shouldRenderEndingCredits() && !isWatchCreditsMode) {
			if (fullscreenService.isFullScreen()) {
				return true;
			} else if (isMobile && isPortrait()) {
				return false;
			}
			return true;
		}
		return false;
	}

	private renderOverlayingControls() {
		const { showUI, playerState, chainPlayMode, thumbnailVisible, isScrumbleSeeking } = this.state;
		if (this.isChainPlayActive(chainPlayMode) || playerState === PlayerState.ENDED || this.shouldHidePlayerControls())
			return false;
		return (
			<PlayerOverlayingControls
				showUI={showUI}
				playerState={playerState}
				onSeekRewind={this.onSeekRewind}
				onSeekForward={this.onSeekForward}
				togglePlayback={this.togglePlayback}
				hidden={thumbnailVisible || isScrumbleSeeking}
				isChannel={this.isChannel()}
				startover={this.props.startover}
				isSeekable={this.isSeekable()}
			/>
		);
	}

	private registerAdRendered = () => {
		if (this.isAdSlotRenderCallbackRegistered) return;
		const { googletag } = window;
		if (typeof googletag !== 'undefined' && googletag.pubads) {
			const callback = event => {
				!event.isEmpty && this.setState({ pauseAdRendered: true });
			};
			googletag.pubads().addEventListener(GOOGLETAG_EVENT_SLOT_RENDER_END, callback);
			this.isAdSlotRenderCallbackRegistered = true;
		}
	};

	private closePauseAd = () => {
		this.setState({
			showPauseAd: false,
			pauseAdRendered: false
		});
	};

	private togglePlayback = (): void => {
		const { playerState } = this.state;
		const {
			account,
			activeProfile,
			classification,
			item,
			getContentGuarded,
			isAppModalOpen,
			isSessionValid,
			setSessionStatus,
			setInactivityTimer
		} = this.props;

		if (playerState === PlayerState.PLAYING) {
			setInactivityTimer();
			this.player.pause(true);
		} else {
			this.resetInactivityTimer();

			if (isAppModalOpen) return;

			if (!isSessionValid || (isIOS() && isSessionExpired())) {
				this.player.pause();
				getContentGuarded(account, activeProfile, classification, item, this.player, () => {
					setSessionStatus(true);
					this.player.play();
				});
			} else {
				this.player.play(true);
			}
		}
	};

	private onSeekRewind = () => {
		const { currentTime, chainPlayMode } = this.state;

		if (currentTime < SEEK_CONTROLS_OFFSET) this.player.seek(0);
		else this.player.seek(currentTime - SEEK_CONTROLS_OFFSET);

		this.checkWatchCreditsState();

		if (this.isChainPlayFinalized(chainPlayMode)) this.resetChainPlay();
	};

	private onSeekForward = () => {
		const { startover, startOverAllowedSeekGapInSeconds, currentProgram } = this.props;
		const { currentTime, duration } = this.state;

		if (startover) {
			const programInProgress = isOnNow(currentProgram.startDate, currentProgram.endDate);
			const maxSeekableLimit = duration - (programInProgress ? startOverAllowedSeekGapInSeconds : 0);
			if (currentTime > maxSeekableLimit - SEEK_CONTROLS_OFFSET) {
				this.player.seek(maxSeekableLimit);
			} else {
				const newPosition = currentTime + SEEK_CONTROLS_OFFSET;
				if (!this.isFastForwardSeekLimited(newPosition)) {
					this.player.seek(newPosition);
				}
			}
		} else {
			if (currentTime > duration - SEEK_CONTROLS_OFFSET) this.player.seek(duration);
			else this.player.seek(currentTime + SEEK_CONTROLS_OFFSET);
		}
	};

	private onKeyDown = (e: KeyboardEvent) => {
		const { focused } = this.state;
		const { noUiControls } = this.props;

		if (noUiControls || !focused || !this.player) {
			return;
		}

		const canRewind = this.isSeekable();
		switch (e.keyCode) {
			case KEY_CODE.LEFT_ARROW:
				if (e.shiftKey) {
					e.preventDefault();
					this.decreasePlaybackSpeed();
				}
				break;
			case KEY_CODE.RIGHT_ARROW:
				if (e.shiftKey) {
					e.preventDefault();
					this.increasePlaybackSpeed();
				}
				break;
			case KEY_CODE.N:
				if (e.shiftKey) {
					e.preventDefault();
					this.defaultPlaybackSpeed();
				}
				break;
			case KEY_CODE.SPACE:
				e.preventDefault();
				this.togglePlayback();
				break;
			case KEY_CODE.LEFT:
				if (canRewind) {
					this.onSeekRewind();
				} else {
					this.playerUnseekableNotification();
				}
				break;
			case KEY_CODE.RIGHT:
				if (canRewind) {
					this.onSeekForward();
				} else {
					this.playerUnseekableNotification();
				}
				break;
			case KEY_CODE.UP:
				e.preventDefault();
				this.increaseVolume();
				break;
			case KEY_CODE.DOWN:
				e.preventDefault();
				this.decreaseVolume();
				break;
		}
	};

	private getPlaybackTrackSpeeds = () => {
		const track = this.player && this.player.playbackRates();

		// If track data is not present return error message
		if (this.player && (!track || !Array.isArray(track) || typeof track === 'undefined')) {
			this.setState({ isPlaybackRateChangeError: true });
			this.playbackSpeedRenderTimer = window.setTimeout(() => {
				this.setState({ isPlaybackRateChangeError: false });
				window.clearTimeout(this.playbackSpeedRenderTimer);
			}, PLAYBACK_TIMER);

			return undefined;
		}

		return track;
	};

	private defaultPlaybackSpeed = () => {
		const { updatePlayedTrackSpeed, playerId, changePlaybackSpeed } = this.props;

		requestAnimationFrame(() => {
			const track = this.getPlaybackTrackSpeeds();
			if (!track || !track.length) return;

			const defaultPlaybackValue = track && track.find(track => track.label === OPTION_LABEL_NORMAL);
			this.player.selectPlaybackSpeed(defaultPlaybackValue.value);
			updatePlayedTrackSpeed(defaultPlaybackValue);
			changePlaybackSpeed(playerId, defaultPlaybackValue.value);
		});
	};

	private increasePlaybackSpeed = () => {
		const { selectedPlaybackSpeed, updatePlayedTrackSpeed, playerId, changePlaybackSpeed } = this.props;

		requestAnimationFrame(() => {
			const track = this.getPlaybackTrackSpeeds();
			if (!track || !track.length) return;

			const selectedSpeedIndex = track && track.findIndex(speed => speed.value === selectedPlaybackSpeed);
			const nextSpeedValue =
				selectedSpeedIndex < track.length - 1 ? track[selectedSpeedIndex + 1] : track[selectedSpeedIndex];
			this.player.selectPlaybackSpeed(nextSpeedValue.value);
			updatePlayedTrackSpeed(nextSpeedValue);
			changePlaybackSpeed(playerId, nextSpeedValue.value);
		});
	};

	private decreasePlaybackSpeed = () => {
		const { selectedPlaybackSpeed, updatePlayedTrackSpeed, playerId, changePlaybackSpeed } = this.props;

		requestAnimationFrame(() => {
			const track = this.getPlaybackTrackSpeeds();
			if (!track || !track.length) return;

			const selectedSpeedIndex = track && track.findIndex(speed => speed.value === selectedPlaybackSpeed);
			const prevSpeedValue = selectedSpeedIndex > 0 ? track[selectedSpeedIndex - 1] : track[selectedSpeedIndex];
			this.player.selectPlaybackSpeed(prevSpeedValue.value);
			updatePlayedTrackSpeed(prevSpeedValue);
			changePlaybackSpeed(playerId, prevSpeedValue.value);
		});
	};

	private playerUnseekableNotification = debounce(
		() => {
			this.props.showPassiveNotification({
				content: <IntlFormatter>{'@{player_unseekable_description}'}</IntlFormatter>
			});
		},
		SHOW_PASSIVE_NOTIFICATION_DEBOUNCE_TIME_MS,
		true
	);

	private programFinished = () => {
		const { currentProgram } = this.props;
		return currentProgram && !isOnNow(currentProgram.startDate, currentProgram.endDate);
	};

	private isFastForwardSeekLimited = (newPosition: number, sliderSeek?: boolean) => {
		const { currentProgram, startover, startOverAllowedSeekGapInSeconds } = this.props;
		if (!startover || !currentProgram || this.programFinished()) {
			return false;
		}

		const now = (new Date().getTime() - currentProgram.startDate.getTime()) / 1000;

		const seekControlOffset = sliderSeek ? 0 : SEEK_CONTROLS_OFFSET;
		if (newPosition + startOverAllowedSeekGapInSeconds + seekControlOffset > now) {
			this.seekLimitedNotification(startOverAllowedSeekGapInSeconds);
			return true;
		}
	};

	private seekLimitedNotification = debounce(
		gap =>
			this.props.showPassiveNotification({
				content: <IntlFormatter values={{ gap }}>{'@{player_notification_fast_forward_limit}'}</IntlFormatter>
			}),
		SHOW_PASSIVE_NOTIFICATION_DEBOUNCE_TIME_MS,
		true
	);

	setControlsVisibility = (value: boolean) => {
		const { thumbnailVisible, showUI } = this.state;

		if (thumbnailVisible && !value) return;

		if (showUI !== value) {
			this.setState({ showUI: value }, () => {
				if (value) this.startSkipIntroVisibilityTimer();

				if (fullscreenService.isFullScreen()) {
					if (this.state.showUI) {
						this.showCursor();
					} else {
						this.hideCursor();
					}
				}
			});

			// make sure player overlay modals are hidden
			if (!value) this.closePlayerOverlays();
		}
	};

	private setControlsVisibilityWithTimers = (visibility: boolean) => {
		this.stopTimerDelay();

		if (visibility) {
			this.setControlsVisibility(true);
			this.startTimerDelay();
		} else {
			this.setControlsVisibility(false);
		}
	};

	private setVideoVisibility = (value: boolean) => {
		if (this.state.showVideo !== value) this.setState({ showVideo: value });
	};

	private startTimerDelay() {
		const { showCastIntroduction, playerState, thumbnailVisible, isAdPaused } = this.state;

		if (showCastIntroduction || isAdPaused) return;

		if (!this.hideTimeout) {
			this.hideTimeout = window.setTimeout(() => {
				// keep player/ad controls visible if any control overlay modal is shown
				if ((playerState === PlayerState.PLAYING || this.isAdPlaying()) && !this.props.isOverlayModalOpen) {
					this.setControlsVisibility(false);
				}

				if (thumbnailVisible) {
					this.setControlsVisibility(true);
				}
			}, CONTROLS_HIDE_DELAY);
		}
	}

	private stopTimerDelay() {
		if (this.hideTimeout) {
			window.clearTimeout(this.hideTimeout);
			this.hideTimeout = undefined;
		}
	}

	private restartTimer() {
		this.stopTimerDelay();
		this.startTimerDelay();
	}

	private onPlayerMouseInteract = e => {
		e.persist();
		throttle(
			() => {
				if (isTouch()) return;

				if (this.isVrInteract && e.type !== 'click') {
					window.clearTimeout(this.mouseInteractTimeout);
					this.setControlsVisibility(false);
					return;
				}
				// wait while user stop touching to avoid multiple click/touch interaction
				this.mouseInteractTimeout = window.setTimeout(() => {
					if (this.isPlaybackStarted || this.isAdPlaying()) {
						this.stopTimerDelay();

						if (isTouch() && this.state.showUI) {
							// Dismiss controls immediately
							this.setControlsVisibility(this.props.isOverlayModalOpen);
						}

						const showChannelControls = !this.props.isChannelSelectorVisible;
						if (showChannelControls) {
							this.setControlsVisibility(true);
							this.startTimerDelay();
						}
						if (this.state.playerState === PlayerState.PLAYING) {
							this.setMetadataVisability(showChannelControls);
						}
					}
				}, USER_INTERACTION_TIME);
			},
			OVERLAY_SHOW_INTERVAL,
			true
		)();
	};

	private onTouchEnd = e => {
		e.persist();
		const { target } = e;
		const inVideo = target && target.tagName && target.tagName.toLowerCase() === 'video';
		const targetClassList = target && target.classList;
		const hitAreaClassList = [this.tapableClassName, bemPlayerSeekControls.b(), bemPlayerOverlay.b()];
		const inHitArea = inVideo || hitAreaClassList.some(className => targetClassList.contains(className));

		if (inHitArea) {
			const { showUI } = this.state;
			this.setControlsVisibilityWithTimers(!showUI);
		}
	};

	private toggleFullscreen = (): void => fullscreenService.changeFullscreen();

	private onOverlayOpen = (opened: boolean) => {
		this.setState({ onOverlayOpen: opened });
	};

	private onPlayNext: PlayNextHandler = (
		nextItem: api.ItemDetail,
		canPlayItem: boolean,
		countdownRemaining: number
	) => {
		const { onNavigate, updateVideoEntryPoint } = this.props;
		if (canPlayItem) {
			this.player.emit(PlayerEventType.action, {
				name: PlayerAction.PlayNext,
				payload: { item: nextItem, countdown: countdownRemaining }
			});
		}
		onNavigate(canPlayItem ? nextItem.watchPath : nextItem.path);
		// Set delay so that video entry point will only be updated after current player has unmounted
		setTimeout(() => updateVideoEntryPoint(VideoEntryPoint.PlayNext), 300);
	};

	private renderWrapper() {
		const { item, list, playerId, interactMutedState, embed } = this.props;
		const { playerState, currentTime, duration, showUI, showControls, focused } = this.state;

		if (!this.isPlayerNotLoading()) return false;
		const isVR = isItemVr(item);

		const shouldHidePlayerControls = this.shouldHidePlayerControls();

		return (
			<div className={cx(bemPlayer.e('wrapper', { vr: isVR, ui: showUI, controls: showControls }))}>
				{showControls && !shouldHidePlayerControls && (
					<PlayerControls
						playerState={playerState}
						player={this.player}
						playerContainer={this.playerContainer}
						item={item}
						currentTime={currentTime}
						duration={duration}
						toggleFullscreen={this.toggleFullscreen}
						togglePlayback={this.togglePlayback}
						list={list}
						isVr={isVR}
						embed={embed}
						isSeekable={this.isSeekable()}
						playerId={playerId}
						onSeek={this.onPlayerScrubberSeek}
						playerFocused={focused}
						setVolumeMutedState={this.setVolumeMutedState}
						setVolume={this.setVolume}
						interactMutedState={interactMutedState}
					/>
				)}
				{!shouldHidePlayerControls && this.renderMetadata()}
			</div>
		);
	}

	private renderChannelWrapper() {
		const { item, currentProgram, list, linear, startover, playerId, interactMutedState, embed } = this.props;
		const {
			playerState,
			currentTime,
			duration,
			isManifestStatic,
			startTimeOfDvrWindow,
			showUI,
			showControls,
			showMetadata,
			fullscreen,
			focused
		} = this.state;

		if (!this.isPlayerNotLoading()) return false;

		return (
			<div className={cx(bemPlayer.e('wrapper', { ui: showUI, controls: showControls }))}>
				{showControls && (
					<PlayerControls
						playerState={playerState}
						player={this.player}
						playerContainer={this.playerContainer}
						item={item}
						currentTime={currentTime}
						duration={duration}
						isManifestStatic={isManifestStatic}
						startTimeOfDvrWindow={startTimeOfDvrWindow}
						toggleFullscreen={this.toggleFullscreen}
						togglePlayback={this.togglePlayback}
						currentProgram={currentProgram}
						list={list}
						linear={linear}
						embed={embed}
						startover={startover}
						isSeekable={this.isSeekable()}
						onPreventSeek={this.playerUnseekableNotification}
						isFastForwardSeekLimited={this.isFastForwardSeekLimited}
						onToggleStartoverMode={this.onToggleStartoverMode}
						playerId={playerId}
						onSeek={this.onPlayerScrubberSeek}
						setOverlayControls={this.setControlsVisibility}
						playerFocused={focused}
						setVolumeMutedState={this.setVolumeMutedState}
						setVolume={this.setVolume}
						interactMutedState={interactMutedState}
					/>
				)}
				{fullscreen && (
					<div>
						<LinearPlayerMetadata
							className={cx({ showMetadata: showMetadata })}
							onBack={this.onBack}
							item={item}
							currentProgram={currentProgram}
						/>
						<NotificationComponent fullscreenNotificationAllowed={startover} />
					</div>
				)}
			</div>
		);
	}

	private onToggleStartoverMode = () => {
		const { onToggleStartoverMode, currentProgram, startover, openModal } = this.props;
		if (!startover) {
			this.player.toggleStartOver();
			return onToggleStartoverMode();
		}

		const onConfirm = () => {
			onToggleStartoverMode();
			this.player.toggleStartOver();
		};
		const warningMsg = isOnNow(currentProgram.startDate, currentProgram.endDate)
			? 'player_modal_start_over_on_now_exit_confirm_description'
			: 'player_modal_start_over_live_ended_exit_confirm_description';
		this.player.pause();
		openModal(getSwitchLiveWarningModal(warningMsg, () => onConfirm(), () => this.player.play()));
	};

	shouldShowSkipIntroButton() {
		const { item, embed } = this.props;
		const skipIntroStartingPosition = get(item, 'customFields.IntroStartPositionInSeconds') || -1;
		const skipIntroEndingPosition = get(item, 'customFields.IntroEndingPositionInSeconds') || -1;

		return !(
			this.state.currentTime < skipIntroStartingPosition ||
			skipIntroEndingPosition - SKIP_INTRO_HIDE_OFFSET < this.state.currentTime ||
			!this.isPlayerNotLoading() ||
			this.isAdPlaying() ||
			!this.state.showSkipIntroButton ||
			this.isChannel() ||
			embed
		);
	}

	renderSkipIntro() {
		if (!this.shouldShowSkipIntroButton()) return;

		const { item } = this.props;
		const skipIntroPosition = get(item, 'customFields.IntroEndingPositionInSeconds') || -1;

		return (
			<TriggerProvider trigger={DomTriggerPoints.BtnSkipIntro}>
				<IntlFormatter
					className={'skip-intro-button'}
					elementType={AccountButton}
					onClick={() => this.onSkipIntro(skipIntroPosition)}
					componentProps={{
						ordinal: 'secondary',
						type: 'button',
						theme: 'dark',
						spinnerLocation: 'center'
					}}
				>
					{`@{skipIntro_button_label}`}
				</IntlFormatter>
			</TriggerProvider>
		);
	}

	onSkipIntro = (skipIntroPosition: number) => {
		this.player.seek(skipIntroPosition - SKIP_INTRO_SKIP_OFFSET);
	};

	toggleSkipIntroVisibility = (showSkipIntroButton: boolean) => {
		this.setState({ showSkipIntroButton });
	};

	startSkipIntroVisibilityTimer() {
		if (!this.skipIntroTimer) return;

		const { item } = this.props;
		const skipIntroStartingPosition = get(item, 'customFields.IntroStartPositionInSeconds') || -1;
		let skipButtonTimerDelay = skipIntroStartingPosition - this.state.currentTime;
		if (skipButtonTimerDelay <= 0) skipButtonTimerDelay = 0;

		window.clearTimeout(this.skipIntroButtonTimeout);
		this.skipIntroButtonTimeout = window.setTimeout(() => {
			this.toggleSkipIntroVisibility(true);
			this.skipIntroTimer.reset();
			this.skipIntroTimer.start();
		}, skipButtonTimerDelay * 1000);
	}

	onBack = () => {
		const { onBack } = this.props;
		fullscreenService.switchOffFullscreen();
		onBack();
	};

	private onBackButton = () => {
		if (this.shouldShowUpsellScreenModal()) {
			this.player.pause();
			this.showUpsellScreenModal();
			return;
		}
		this.onBack();
	};

	private shouldShowUpsellScreenModal() {
		const { playerState } = this.state;
		const { isAnonymous } = this.props;

		return (
			isAnonymous &&
			!this.isChannel() &&
			!isTrailer(this.props.item) &&
			playerState !== PlayerState.ENDED &&
			shouldShowUpsellScreenModal()
		);
	}

	private showUpsellScreenModal() {
		const { openModal, upsellScreenPageAnalytic } = this.props;

		openModal({
			id: UPSELL_SCREEN_MODAL,
			type: ModalTypes.CUSTOM,
			element: (
				<UpsellScreenModal onClose={this.onBack} onSignin={this.onSignin} onDisable={disableUpsellScreenModal} />
			),
			disableAutoClose: true
		});

		upsellScreenPageAnalytic();
	}

	private onSignin = () => {
		const { routeHistory, item } = this.props;
		const routeLength = routeHistory.length;
		let path = item.path;
		if (routeLength >= BACK_STEP_COUNT) {
			path = routeHistory[routeLength - BACK_STEP_COUNT].path;
		}
		redirectToSignPage(this.props.config, path);
	};

	private renderEpisodeMetadata() {
		const { item } = this.props;
		if (!isEpisode(item)) return false;

		return isSeriesEpisode(item) ? (
			<IntlFormatter
				elementType="p"
				values={{
					seasonNumber: (item.season && item.season.seasonNumber) || item.seasonNumber,
					episodeNumber: item.episodeNumber,
					episodeName: item.episodeName
				}}
				className="episode-title"
			>
				{'@{endOfPlayback_metadata_title}'}
			</IntlFormatter>
		) : (
			<p>{item.episodeName}</p>
		);
	}

	private shouldRenderEndingCredits = () => {
		const { currentTime, isWatchCreditsRequested } = this.state;
		const { item, embed, linear } = this.props;

		return (
			!isShortVideo(item) &&
			!this.canShowEndOfPlayback() &&
			!this.isAdPlaying() &&
			!isWatchCreditsRequested &&
			this.isEndingCreditsTimeInterval(currentTime) &&
			!embed &&
			!linear
		);
	};

	private isEndingCreditsTimeInterval = (currentTime: number) => {
		const { item, watchCreditsCtaCountdown } = this.props;
		const { duration } = this.state;
		const endingCreditsStartPosition = get(item, 'customFields.CreditStartPositionInSeconds');
		const endingCreditsEndPosition = get(item, 'customFields.CreditEndingPositionInSeconds');
		const shouldShowEndOfPlayback = isLastEpisodeOfLastSeason(item) || isMovie(item);

		if (shouldShowEndOfPlayback && duration >= MIN_VIDEO_LENGTH) {
			const endOfPlayDuration = endingCreditsEndPosition ? duration - DEFAULT_CREDIT_SHOW_TIME : duration;
			return (
				currentTime >= endOfPlayDuration &&
				currentTime <= duration - watchCreditsCtaCountdown &&
				duration >= endingCreditsStartPosition
			);
		}
		return (
			currentTime >= endingCreditsStartPosition &&
			currentTime <= endingCreditsEndPosition &&
			duration >= endingCreditsStartPosition
		);
	};

	private beforeEndingCreditsTimeInterval = (currentTime: number) => {
		const { item } = this.props;
		const endingCreditsStartPosition = get(item, 'customFields.CreditStartPositionInSeconds');

		return currentTime < endingCreditsStartPosition;
	};

	private onWatchEndingCredits = () => {
		this.setState({ isWatchCreditsMode: true, isWatchCreditsRequested: true });
	};

	private resetWatchCreditsState = () => {
		this.setState({ isWatchCreditsMode: false, isWatchCreditsRequested: false });
	};

	private renderEndOfPlayback() {
		const { item, playerId, activeAccount, embed } = this.props;
		const { chainPlayMode, playerState } = this.state;

		if (this.canShowEndOfPlayback()) {
			return (
				<EndOfPlayback
					item={item}
					embed={embed}
					onReplay={this.onReplay}
					playerId={playerId}
					onPlayNext={this.onPlayNext}
					onBack={this.onBack}
					activeAccount={activeAccount}
					onOverlayOpen={this.onOverlayOpen}
					shouldHideBackgroundImage={this.isChainPlayActive(chainPlayMode) && playerState !== PlayerState.ENDED}
					shouldRenderEndingCredits={this.shouldRenderEndingCredits()}
				/>
			);
		}

		return false;
	}

	renderEndingCredits() {
		const { item, playerId, activeAccount } = this.props;
		const { isWatchCreditsMode } = this.state;

		if (this.shouldRenderEndingCredits() && !isWatchCreditsMode) {
			return (
				<EndOfPlayback
					item={item}
					onReplay={this.onReplay}
					playerId={playerId}
					onPlayNext={this.onPlayNext}
					shouldRenderEndingCredits={this.shouldRenderEndingCredits()}
					onBack={this.onBack}
					activeAccount={activeAccount}
					onOverlayOpen={this.onOverlayOpen}
					shouldHideBackgroundImage={this.shouldRenderEndingCredits()}
					onWatchEndingCredits={this.onWatchEndingCredits}
					skipToEndOfPlayback={this.skipToEndOfPlayback}
				/>
			);
		}

		return false;
	}

	private skipToEndOfPlayback = () => {
		const { duration, playerState } = this.state;
		if (playerState !== PlayerState.ENDED) this.player.seek(duration);
	};

	private renderCastIntroduction() {
		if (!this.state.showCastIntroduction) return false;

		return <CastIntro onClick={this.onCloseCastIntroduction} />;
	}

	private renderThumbnailsPreload() {
		const { item, playback } = this.props;
		if (item.customFields && item.customFields[CUSTOM_FIELD_ENTRY_ID_NAME])
			return (
				<img
					className="thumbnail-hidden"
					src={getKalturaThumbnailsUrl(
						item.customFields[CUSTOM_FIELD_ENTRY_ID_NAME],
						calculateThumbnailSize().width,
						playback
					)}
				/>
			);
	}

	private resetInactivityTimer = () => {
		this.props.resetInactivityTimer();
		this.startSkipIntroVisibilityTimer();
	};

	private onVisibilityChange = () => {
		const { setSessionStatus, setInactivityTimer } = this.props;
		if (window.document.hidden) {
			setInactivityTimer();
			return;
		}

		const { playerState } = this.state;
		const isVideoStopped = playerState === PlayerState.PAUSED || playerState === PlayerState.ENDED;

		if (isIOS() && isSessionExpired()) {
			this.player.pause();
			setSessionStatus(false);
			return;
		}

		if (isIOS()) {
			this.resetInactivityTimer();
			return;
		}

		if (isVideoStopped && this.isAdPlaying()) {
			this.player.play();
		}

		this.resetInactivityTimer();
	};

	private async getAdsConfig(
		videoData: VideoApi.VideoAnalyticsData | VideoApi.VideoAnalyticsErrorData
	): Promise<PlayerAdsConfig> {
		if (process.env.CLIENT_DISABLE_ADS !== 'false') return;

		const { websiteUrl, item, ads, list, activeProfile, account, data, plans, embed } = this.props;
		const language = get(data, '0.language');
		if (isTrailer(item)) return;

		const adTagInfo = await generateAdsTag(
			videoData,
			websiteUrl,
			item,
			ads,
			list,
			activeProfile,
			account,
			language,
			plans,
			embed
		);
		const adTagUrl = get(adTagInfo, 'adTagUrl');

		let playAdsAfterTime = undefined;
		const response = await fetch(adTagUrl);
		const text = await response.text();
		try {
			const xml = new DOMParser().parseFromString(text, 'text/xml');
			playAdsAfterTime = this.getAdsFirstPlayingTime(xml);
		} catch (e) {
			if (_DEV_) console.log(e);
		}

		return {
			...adTagInfo,
			entryId: item.customId,
			playAdsAfterTime,
			onAdStarted: this.onAdsStarted,
			onAdPaused: this.onAdPaused,
			onAdResumed: this.onAdResumed,
			onAdCompleted: this.onAdsEnded,
			onAdSkipped: this.onAdSkipped,
			onAdError: this.onAdError
		};
	}

	private getAdsFirstPlayingTime(adsXml): number {
		const midRolls = adsXml.getElementsByTagName('Midroll');
		const midRollTimes = [];

		for (let el of midRolls) {
			const timeOffset = el.getAttribute('timeOffset');
			const seconds = convertTimeToSeconds(timeOffset);
			midRollTimes.push(seconds);
		}

		const resumePosition = this.getResumePosition();

		return getClosestAdRoll(resumePosition, midRollTimes);
	}

	private onAdsStarted = () => {
		this.setState({ showAds: true });
		this.setAdPaused(false);
		this.closePlayerOverlays();
		this.props.hideAllModals();
	};

	private onAdPaused = () => {
		this.stopTimerDelay();
		this.setControlsVisibility(true);
		this.setAdPaused(true);
	};

	private onAdResumed = () => {
		this.setControlsVisibility(false);
		this.setAdPaused(false);
	};

	private onAdsEnded = () => {
		this.setState({ showAds: false });
		this.setAdPaused(false);
		// Transfer focus from ad (iframe) back to window to allow attached eventlisteners to function
		window.focus();
		// Extra step required for firefox as it ignores window.focus by default
		const activeElement = document.activeElement as HTMLElement;
		if (activeElement.tagName.toLowerCase() === 'iframe') {
			activeElement.blur();
		}
	};

	private onAdSkipped = () => {
		this.onAdsEnded();
	};

	private onAdError = () => {
		this.setControlsVisibility(true);
		this.setMetadataVisability();
		this.setState({ showAds: false });
		this.setAdPaused(false);
	};

	private setAdPaused = (isPaused: boolean) => {
		this.setState({ isAdPaused: isPaused });
	};

	private onVrOverlayRef = ref => {
		if (!ref) return;
		this.vrOverlay = ref;
	};

	private onVrInteraction = (isVrInteract: boolean) => {
		this.isVrInteract = isVrInteract;
	};

	private checkWatchCreditsState() {
		const { currentTime, isWatchCreditsRequested } = this.state;

		if (isWatchCreditsRequested && this.beforeEndingCreditsTimeInterval(currentTime)) {
			this.resetWatchCreditsState();
		}
	}

	private onPlayerScrubberSeek = (newTimePosition: number, isFinished: boolean) => {
		const { chainPlaySqueezeback } = this.props;
		const { duration, chainPlayMode } = this.state;

		this.checkWatchCreditsState();

		this.setState({ currentTime: Math.floor(newTimePosition), isScrumbleSeeking: !isFinished });
		if (
			isFinished &&
			this.isChainPlayFinalized(chainPlayMode) &&
			chainPlaySqueezeback &&
			duration - newTimePosition >= chainPlaySqueezeback
		) {
			this.resetChainPlay();
		}
	};

	private shouldShowSpinner(): boolean {
		const { playerState, thumbnailVisible } = this.state;
		const { noUiControls } = this.props;

		if (noUiControls) return false;

		if (!this.player) return true;

		return isPlayerLoading(playerState) && !this.isAdPlaying() && !thumbnailVisible;
	}

	private isAdsEnded(): boolean {
		return this.player && this.player.isAdsEnded();
	}

	private isAdPlaying(): boolean {
		return this.player && this.player.isAdPlaying();
	}

	private isChainPlayInactive(mode: ChainPlayMode): boolean {
		return mode === ChainPlayMode.None;
	}

	private isChainPlayActive(mode: ChainPlayMode): boolean {
		return mode === ChainPlayMode.Active;
	}

	private isChainPlayFinalized(mode: ChainPlayMode): boolean {
		return mode === ChainPlayMode.Done;
	}

	private isPlayable(): boolean {
		const { playerState } = this.state;
		return (
			playerState === PlayerState.PLAYING || playerState === PlayerState.PAUSED || playerState === PlayerState.BUFFERING
		);
	}

	private isSeekable(): boolean {
		const { startover, currentProgram } = this.props;
		return !this.isChannel() || (startover && get(currentProgram, 'item.enableSeeking'));
	}

	private shouldFireViewPointsEvent(position: number, duration: number): boolean {
		const relativePosition = getRelativePosition(position, duration);

		if (!this.viewEventPointsMap || !this.viewEventPointsMap.size) return false;

		for (let [point, wasSendBefore] of this.viewEventPointsMap) {
			if (relativePosition >= point) {
				if (wasSendBefore) return false;
				this.viewEventPointsMap.set(point, true);
				return true;
			}
		}
		return false;
	}

	private createViewEventPointsMap(): ViewEventPointsMap {
		const { viewEventPoints } = this.props;
		if (!viewEventPoints || !viewEventPoints.length) return;

		return viewEventPoints.reduceRight((map, point) => map.set(point, false), new Map());
	}

	private setVolumeMutedState = (isMuted: boolean) => {
		this.player.setVolumeMutedState(isMuted);
		this.props.toggleMutedState(isMuted);
	};

	private setVolume = (value: number) => {
		const { saveVolume, isMuted } = this.props;
		this.player.emit(PlayerEventType.action, { name: PlayerAction.SetVolume, payload: Math.floor(value * 100) });
		this.player.setVolume(value);
		this.setVolumeMutedState(isMuted);
		saveVolume(value);
	};

	private increaseVolume() {
		const value = this.props.defaultVolume + VOLUME_STEP;
		this.setVolume(value > 1 ? 1 : value);
	}

	private decreaseVolume() {
		const value = this.props.defaultVolume - VOLUME_STEP;
		this.setVolume(value < 0 ? 0 : value);
	}

	private isEaseLiveEnabled() {
		const { config, item, startover } = this.props;
		const isEnabled = get(config, 'general.customFields.FeatureToggle.playAnywhere.web.enabled') === true;
		const playAnywhereChannels = get(config, 'general.customFields.PlayAnywhereChannelIds');

		return isEnabled && playAnywhereChannels && playAnywhereChannels.includes(item.customId) && !startover;
	}
}

function mapStateToProps(state: state.Root): any {
	const playerOverlayModals =
		state.uiLayer &&
		state.uiLayer.modals['player'].filter(
			modal => typeof modal.id === 'string' && modal.id.includes(PLAYER_OVERLAY_MODAL_ID)
		);
	const appModals = get(state, 'uiLayer.modals.app') || [];
	const token = state.session && findToken(state.session.tokens, 'UserProfile', 'Catalog');
	const plans = (state.app.config && state.app.config.subscription && state.app.config.subscription.plans) || [];
	return {
		chromecastConnection: state.player.cast.connectionStatus,
		account: state.account.info,
		activeProfile: getRegisteredProfileInfo(state.profile),
		classification: state.app.config.classification,
		chainPlaySqueezeback: DISABLED_SQUEEZBACK ? 0 : state.app.config.playback.chainPlaySqueezeback,
		activeAccount: state.account.active,
		thumbnailVisible: state.player.thumbnailVisible,
		isOverlayModalOpen: playerOverlayModals && playerOverlayModals.length > 0,
		isAppModalOpen: appModals.length > 0,
		isChannelSelectorVisible: state.player.channelSelectorVisible,
		subtitleLanguages: state.app.config.general.subtitleLanguages,
		customId: get(state.player, 'startoverProgram.customId'),
		playback: state.app.config.playback,
		playerAdTagURL: get(state, 'app.config.general.customFields.PlayerAdTagURL'),
		ks: token && decodeJwt(token).kalturaSession,
		ads: get(state, 'app.config.advertisment'),
		websiteUrl: get(state, 'app.config.general.websiteUrl'),
		skipIntroInteractionTimeInSeconds: get(state, 'app.config.playback.skipIntroInteractionTimeInSeconds'),
		watchCreditsCtaCountdown: get(state.app, 'config.playback.watchCreditsCtaCountdown') || 0,
		isAnonymous: isAnonymousUser(state),
		viewEventPoints: get(state, 'app.config.playback.viewEventPoints'),
		playerOverlayModals,
		config: state.app.config,
		defaultVolume: state.player.volume,
		isMuted: state.player.isMuted,
		muteInteraction: state.player.muteInteraction,
		routeHistory: state.page.history.entries,
		location: state.page.history.location,
		plans,
		heartbeatFrequency: get(state, 'app.config.playback.heartbeatFrequency'),
		isSessionValid: get(state, 'player.isSessionValid'),
		startOverAllowedSeekGapInSeconds:
			get(state, 'app.config.general.customFields.StartOverAllowedSeekGapInSeconds') ||
			DEFAULT_ALLOWED_SEEK_GAP_SECONDS,
		xt1ChainPlayList: state.player.xt1ChainPlayList,
		selectedPlaybackSpeed: state.player.selectedPlaybackSpeed
	};
}

function mapDispatchToProps(dispatch: Dispatch<state.Player>): StoreDispatchProps {
	return {
		saveResumePosition: (item: api.ItemSummary, position: number, action: HeartbeatActions) =>
			dispatch(saveResumePosition(item, position, action)),
		saveRealVideoPosition: (itemId: string, position: number) => dispatch(saveRealVideoPosition(itemId, position)),
		startedPlaying: (item: api.ItemDetail) => dispatch(startedPlaying(item)),
		getContentGuarded: (
			account: api.Account,
			activeProfile: api.ProfileDetail,
			classification: api.Classification,
			item: api.ItemDetail,
			player: PlayerInterface,
			onSuccessCallback?: () => void
		) => {
			const contentGuarded = getContentGuarded(account, activeProfile, classification, item, onSuccessCallback);
			if (contentGuarded) {
				dispatch(contentGuarded);
			}
		},
		updateResumePosition: (item, position) => dispatch(updateResumePosition(item, position)),
		toggleMutedState: (isMuted: boolean) => dispatch(toggleMutedState(isMuted)),
		saveVolume: (value: number) => dispatch(saveVolume(value)),
		removeAnonymousContinueWatching: () => dispatch(removeListCache(ContinueWatchingAnonymous)),
		saveAnonymousVideoPosition: (itemId: string, position: number) =>
			dispatch(saveAnonymousVideoPosition(itemId, position)),
		updateCurrentVideoPosition: (currentTime: number) => dispatch(updateCurrentVideoPosition(currentTime)),
		openModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		hideAllModals: () => dispatch(HideAllModals()),
		interactMutedState: (hasInteracted: boolean) => dispatch(interactMutedState(hasInteracted)),
		upsellScreenPageAnalytic: () =>
			dispatch(
				analyticsEvent(AnalyticsEventType.GENERIC_ANALYTICS_EVENT, {
					type: 'Page',
					path: '/upsell'
				})
			),
		setPlayerInitialised: isPlayerInitialised => dispatch(setPlayerInitialised(isPlayerInitialised)),
		setSessionStatus: isSessionValid => dispatch(setSessionStatus(isSessionValid)),
		setInactivityTimer: () => dispatch(setInactivityTimer()),
		resetInactivityTimer: () => dispatch(resetInactivityTimer()),
		showPassiveNotification: (config: PassiveNotificationConfig) => dispatch(ShowPassiveNotification(config)),
		updateVideoEntryPoint: (entryPoint?: VideoEntryPoint) =>
			dispatch({ type: UPDATE_PLAYER_ENTRY_POINT, payload: entryPoint }),
		changePlaybackSpeed: (playerId, trackSpeed) => dispatch(changePlaybackSpeed(playerId, trackSpeed)),
		updatePlayedTrackSpeed: (playbackSpeed?: any) => dispatch({ type: UPDATE_PLAYBACK_SPEED, payload: playbackSpeed })
	};
}

export default connect<PlayerComponentProps, any, any>(
	mapStateToProps,
	mapDispatchToProps
)(PlayerComponent);
