import * as React from 'react';
import { Dispatch } from 'redux';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { toggleChannelSelectorVisibility } from 'shared/app/playerWorkflow';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import { debounce } from 'shared/util/performance';
import BrandLogo from 'ref/responsive/component/AxisLogo';
import ControlsScrubber from './controls/ControlsScrubber';
import ControlsTime from 'ref/responsive/player/controls/ControlsTime';
import ControlsPlaybackSpeed from 'toggle/responsive/player/controls/ControlsPlaybackSpeed';
import ControlsTimeLabel from 'toggle/responsive/player/controls/ControlsTimeLabel';
import ControlsVolume from './controls/ControlsVolume';
import ControlsFullScreen from 'ref/responsive/player/controls/ControlsFullScreen';
import { Bem } from 'shared/util/styles';
import { ChannelSelectors, UPCOMING_SCHEDULE_SELECTOR_ID, CHANNELS_SELECTOR_ID } from '../util/channelUtil';
import { CastButtonLoader, isCastSupported } from 'ref/responsive/player/cast/CastLoader';
import ControlsSettings from './controls/ControlsSettings';
import { PlayerEventType, PlayerAction, PlayerInterface, PlayerProperties, PlayerState } from './Player';
import ControlsSubtitles from './controls/ControlsSubtitles';
import ControlsAudioLanguage from './controls/ControlsAudioLanguage';
import ControlsEpisodeList from './controls/ControlsEpisodeList';
import ControlsOnNow from './controls/ControlsOnNow';
import ControlsUpcomingSchedule from './controls/ControlsUpcomingSchedule';
import ControlsShare from './controls/ControlsShare';
import CtaButton from 'ref/responsive/component/CtaButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Link from 'shared/component/Link';
import LiveProgress from '../component/LiveProgress';
import { get } from 'shared/util/objects';
import { isChannel } from 'toggle/responsive/util/epg';
import { isEmbeddable } from 'toggle/responsive/util/item';
import { Timer, ITimer } from 'shared/util/Timer';
import OverlayChannelSelector, {
	OverlayChannelSelectorOwnProps
} from 'toggle/responsive/component/modal/OverlayChannelSelector';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import { isMobileSize } from 'toggle/responsive/util/grid';
import PlayIcon from 'ref/responsive/player/controls/icons/PlayIcon';
import PauseIcon from 'ref/responsive/player/controls/icons/PauseIcon';
import StartOverIcon from 'toggle/responsive/pageEntry/epg/StartOverIcon';
import { SHARE_VIDEO_MODAL_ID, getShareVideoModalData } from 'toggle/responsive/player/playerModals';
import { isStartOverEnabled } from '../util/playerUtil';
import { isIOS } from 'shared/util/browser';
import { getScheduleLength } from 'shared/util/dates';

import './PlayerControls.scss';

const CHANNELS_SELECTOR_TIMEOUT = 3000;

export const CUSTOM_FIELD_ENTRY_ID_NAME = 'EntryId';

interface PlayerControlsStateProps {
	defaultVolume?: number;
	isChannelSelectorVisible: boolean;
	isMuted: boolean;
	startOverButtonSecondsAvailability?: number;
	startOverAdditionalDurationInSeconds?: number;
}

interface PlayerControlsDispatchProps {
	showModal: (modal: ModalConfig) => void;
	closeModal: (id: string) => void;
	toggleChannelSelectorVisibility: (isVisible: boolean) => void;
}

interface PlayerControlsOwnProps {
	playerState: PlayerState;
	player: PlayerInterface;
	playerContainer: HTMLElement;
	item: api.ItemSummary;
	currentTime: number;
	duration: number;
	isManifestStatic?: boolean;
	startTimeOfDvrWindow?: number;
	saveVolume?: (volume: number) => void;
	castActive?: boolean;
	toggleFullscreen: () => void;
	togglePlayback: () => void;
	currentProgram?: api.ItemSchedule;
	list?: api.ItemList;
	linear?: boolean;
	embed?: boolean;
	startover?: boolean;
	isSeekable?: boolean;
	onPreventSeek?: () => void;
	isFastForwardSeekLimited?: (newPosition: number, sliderSeek: boolean) => boolean;
	onToggleStartoverMode?: () => void;
	isVr?: boolean;
	playerId: string;
	onSeek?: (newTimePosition: number, isFinished: boolean) => void;
	setOverlayControls?: (value: boolean) => void;
	playerFocused?: boolean;
	setVolumeMutedState: (isMuted: boolean) => void;
	setVolume: (value: number) => void;
	interactMutedState?: (hasInteracted: boolean) => void;
}

type PlayerControlsProps = PlayerControlsStateProps & PlayerControlsDispatchProps & PlayerControlsOwnProps;

interface PlayerControlsState {
	isVolumeScrubberVisible?: boolean;
	fullscreen: boolean;
	fullscreenEmulation: boolean;
	startOverAvailable?: boolean;
}

const bem = new Bem('player-controls');
const bem2 = new Bem('player-buttons');
const bem3 = new Bem('player-scrubber');
const bemPlayerControlButton = new Bem('player-control-button');

const SEEK_DEBOUNCE_TIME_MS = 125;

class PlayerControls extends React.Component<PlayerControlsProps, PlayerControlsState & PlayerProperties> {
	channelSelectorTimer: ITimer;
	startOverAvailibilityTimer: ITimer;
	private PlayerControlsRef;
	constructor(props) {
		super(props);

		this.state = {
			currentTime: 0,
			duration: 0,
			isVolumeScrubberVisible: false,
			fullscreen: fullscreenService.isFullScreen(),
			fullscreenEmulation: fullscreenService.isFakeFullscreen(),
			startOverAvailable: false
		};
	}

	componentDidUpdate(prevProps: PlayerControlsProps, prevState: PlayerControlsState) {
		const { isChannelSelectorVisible, currentProgram } = this.props;
		const { currentProgram: previousProgram } = prevProps;
		if (fullscreenService.isFakeFullscreen() !== prevState.fullscreenEmulation) {
			if (prevProps.isChannelSelectorVisible && prevProps.isChannelSelectorVisible !== isChannelSelectorVisible) {
				this.hideControlsSelectorOverlay();
			}
		}

		if (!this.shouldShowChannelSelector() && prevProps.isChannelSelectorVisible !== isChannelSelectorVisible) {
			this.hideControlsSelectorOverlay();
			this.channelSelectorTimer.reset();
		}

		if (get(currentProgram, 'id') !== get(previousProgram, 'id')) {
			this.createStartOverCTATimer();
		}
	}

	private fullscreenCallback = (): void => {
		this.PlayerControlsRef && this.setState({ fullscreen: fullscreenService.isFullScreen() });
	};

	componentDidMount() {
		fullscreenService.setCallback(this.fullscreenCallback);
		this.createTimers();

		if (this.shouldShowChannelSelector()) {
			this.showOnNowOverlay();
			this.channelSelectorTimer.start();
		}
	}

	componentWillUnmount() {
		const { toggleChannelSelectorVisibility } = this.props;
		this.channelSelectorTimer.reset();
		toggleChannelSelectorVisibility(false);
		fullscreenService.removeCallback(this.fullscreenCallback);
		this.stopTimers();
	}

	private createTimers() {
		this.createStartOverCTATimer();
		this.channelSelectorTimer = new Timer(this.hideControlsSelectorOverlay, CHANNELS_SELECTOR_TIMEOUT);
	}

	private createStartOverCTATimer() {
		const { currentProgram, startOverButtonSecondsAvailability } = this.props;
		if (this.isChannel()) {
			if (isStartOverEnabled(currentProgram)) {
				const timeDiff = new Date().getTime() - currentProgram.startDate.getTime();
				const waitTime = startOverButtonSecondsAvailability * 1000;
				if (timeDiff < waitTime) {
					this.setState({ startOverAvailable: false });
					this.startOverAvailibilityTimer = new Timer(() => {
						this.setState({ startOverAvailable: true });
						this.startOverAvailibilityTimer.stop();
					}, waitTime - timeDiff);
					this.startOverAvailibilityTimer.start();
				} else {
					this.setState({ startOverAvailable: true });
				}
			} else {
				this.startOverAvailibilityTimer && this.startOverAvailibilityTimer.stop();
				this.setState({ startOverAvailable: false });
			}
		}
	}

	private stopTimers() {
		this.channelSelectorTimer && this.channelSelectorTimer.stop();
		this.startOverAvailibilityTimer && this.startOverAvailibilityTimer.stop();
	}

	private isChannel = () => isChannel(this.props.item);

	private onSeek = (newTimePosition: number) => {
		const { onSeek, isSeekable, onPreventSeek, isFastForwardSeekLimited } = this.props;
		if (!isSeekable && onPreventSeek) {
			onPreventSeek();
			return;
		}
		if (isFastForwardSeekLimited && isFastForwardSeekLimited(newTimePosition, true)) {
			return;
		}
		if (onSeek) onSeek(newTimePosition, false);
		this.seekPlayer(newTimePosition);
	};

	private seekPlayer = debounce(
		(newTimePosition: number) => {
			const { player, onSeek } = this.props;
			player.emit(PlayerEventType.action, { name: PlayerAction.ActuateSeek });
			player.seek(newTimePosition);
			if (onSeek) onSeek(newTimePosition, true);
		},
		SEEK_DEBOUNCE_TIME_MS,
		false
	);

	private onVolumeScrubberChanged = (value: boolean) => {
		this.setState({ isVolumeScrubberVisible: value });
	};

	private toggleFullScreen = () => fullscreenService.changeFullscreen();

	private openShareModal = () => {
		const { item, player, showModal } = this.props;

		const allowEmbed = isEmbeddable(item);
		// Pause Video and show Modal
		player.pause();
		const shareVideoModalProps = getShareVideoModalData(SHARE_VIDEO_MODAL_ID, item, allowEmbed, () => {
			player.play();
		});

		showModal(shareVideoModalProps);
	};

	renderProgress(currentProgram) {
		if (currentProgram) {
			const { startDate, endDate } = currentProgram;
			return <LiveProgress from={startDate} to={endDate} />;
		}
	}

	renderScrubber() {
		const {
			currentTime,
			player,
			item,
			startover,
			currentProgram,
			isSeekable,
			isManifestStatic,
			startTimeOfDvrWindow = 0
		} = this.props;

		if (this.isChannel() && !startover) return this.renderProgress(currentProgram);

		const entryId = item.customFields && item.customFields[CUSTOM_FIELD_ENTRY_ID_NAME];
		const { onSeekingInteraction } = player;

		const ads = get(player, 'player.ads');
		const adsBreakLayouts = ads ? ads.getAdBreaksLayout() : [];

		const scrubberCurrentTime = isManifestStatic ? currentTime + startTimeOfDvrWindow : currentTime;

		return (
			<ControlsScrubber
				entryId={entryId}
				currentTime={scrubberCurrentTime}
				durationTime={this.getProgrammeDuration()}
				onSeek={this.onSeek}
				onSliderInteraction={onSeekingInteraction}
				adsBreakLayouts={adsBreakLayouts}
				startover={startover}
				isSeekable={isSeekable}
				startDate={currentProgram ? currentProgram.startDate : undefined}
				endDate={currentProgram ? currentProgram.endDate : undefined}
			/>
		);
	}

	private renderLogo(): any {
		const { item, linear } = this.props;
		const { path, watchPath } = item;
		const logoPath = linear ? path : watchPath;

		return (
			<IntlFormatter
				key="logo"
				elementType={Link}
				className={cx(bemPlayerControlButton.b(), bem2.e('watch'))}
				componentProps={{ to: `${logoPath}`, target: '_blank' }}
			>
				<BrandLogo
					role="presentation"
					className={bem.e('logo')}
					svgIndex="transparent"
					title="@{embed_player_watch_cta|Watch on mewatch.sg}"
				/>
			</IntlFormatter>
		);
	}

	private preventParentEvent = (event: any): void => {
		event.stopPropagation();
	};

	private getProgrammeDuration() {
		const { startover, currentProgram, duration, isManifestStatic, startOverAdditionalDurationInSeconds } = this.props;

		if (startover && !isManifestStatic) {
			// Required as Kaltura player does not return same duration for live stream
			return getScheduleLength(currentProgram) + startOverAdditionalDurationInSeconds;
		}

		return duration;
	}

	render() {
		const {
			currentTime,
			duration,
			isManifestStatic,
			startTimeOfDvrWindow = 0,
			castActive,
			defaultVolume,
			isMuted,
			startover,
			onToggleStartoverMode,
			setVolumeMutedState,
			setVolume,
			interactMutedState
		} = this.props;
		const { isVolumeScrubberVisible, startOverAvailable } = this.state;

		const startOverRemainingTime = startover
			? (isManifestStatic ? duration - startTimeOfDvrWindow : this.getProgrammeDuration()) - currentTime
			: 0;

		return (
			<div
				className={cx(bem.b(), { 'volume-active': isVolumeScrubberVisible })}
				ref={com => (this.PlayerControlsRef = com)}
				onDoubleClick={this.preventParentEvent}
			>
				{startOverAvailable && (
					<div className={bem.e('start-over')}>
						<CtaButton className={bem.e('start-over-cta')} theme="light" onClick={onToggleStartoverMode}>
							{!startover && <StartOverIcon />}
							<IntlFormatter
								elementType="span"
								componentProps={{
									theme: 'light'
								}}
							>
								{startover ? '@{exitStartOver_cta|Exit Start Over}' : '@{startOver_cta|Start Over}'}
							</IntlFormatter>
						</CtaButton>
					</div>
				)}
				<div className={cx(bem3.b(), { 'player-scrubber--cast': castActive })}>
					{castActive && !this.isChannel() && (
						<ControlsTimeLabel className={bem3.e('current-time')} time={currentTime} />
					)}

					{this.renderScrubber()}

					{castActive || (startover && <ControlsTimeLabel className={bem3.e('time')} time={startOverRemainingTime} />)}
					{!castActive && !startover && (
						<ControlsTime className={bem3.e('time')} durationTime={duration} currentTime={currentTime} />
					)}
				</div>

				<div className={bem2.b()}>
					{castActive && this.renderCastPlaybackControl()}
					<ControlsVolume
						className={cx(bemPlayerControlButton.b(), bem2.e('volume'))}
						onVolumeChange={setVolume}
						onActive={this.onVolumeScrubberChanged}
						defaultVolume={defaultVolume}
						setVolumeMutedState={setVolumeMutedState}
						isMuted={isMuted}
						isMutedClicked={interactMutedState}
					/>

					<div className="align-right">{this.renderControls()}</div>
				</div>
			</div>
		);
	}

	renderCastPlaybackControl() {
		let icon = undefined;
		switch (this.props.playerState) {
			case PlayerState.PLAYING:
				icon = <PauseIcon />;
				break;
			case PlayerState.PAUSED:
				icon = <PlayIcon />;
				break;
		}

		if (icon === undefined) return;

		return (
			<div onClick={() => this.props.togglePlayback()} className={cx(bemPlayerControlButton.b(), bem2.e('play'))}>
				{icon}
			</div>
		);
	}

	renderControls() {
		if (this.props.castActive) {
			return this.renderCastControls();
		} else {
			return this.renderNormalControls();
		}
	}

	renderCastControls() {
		const { player, linear, playerId } = this.props;

		return [
			this.renderCastButton(),
			<ControlsAudioLanguage
				key="audioLanguages"
				className={cx(bemPlayerControlButton.b(), bem2.e('audioLanguages'))}
				player={player}
				isChannel={this.isChannel()}
				linear={linear}
			/>,
			<ControlsSubtitles
				key="subtitles"
				className={cx(bemPlayerControlButton.b(), bem2.e('subtitles'))}
				player={player}
				linear={linear}
				playerId={playerId}
			/>
		];
	}

	renderNormalControls() {
		const { item, player, linear, currentTime, duration, playerId, embed, startover, currentProgram } = this.props;
		const { fullscreen } = this.state;
		const isChannel = this.isChannel();
		const controlsOverlay = fullscreen && isChannel && !embed && !startover;
		const isIOSEmbed = embed && isIOS();

		return [
			embed && this.renderLogo(),
			!isIOSEmbed && (
				<ControlsFullScreen
					key="fullscreen"
					className={cx(bemPlayerControlButton.b(), bem2.e('fullscreen'))}
					onClick={this.toggleFullScreen}
					isFullscreen={fullscreen}
				/>
			),
			this.renderCastButton(),
			!embed && (
				<ControlsShare
					key="share"
					className={cx(bemPlayerControlButton.b(), bem2.e('share'))}
					onClick={this.openShareModal}
				/>
			),
			<ControlsAudioLanguage
				key="audioLanguages"
				className={cx(bemPlayerControlButton.b(), bem2.e('audioLanguages'))}
				player={player}
				isChannel={isChannel}
				linear={linear}
			/>,
			<ControlsSubtitles
				key="subtitles"
				className={cx(bemPlayerControlButton.b(), bem2.e('subtitles'))}
				player={player}
				linear={linear}
				playerId={playerId}
			/>,
			!linear && !embed && (
				<ControlsSettings
					key="settings"
					className={cx(bemPlayerControlButton.b(), bem2.e('settings'))}
					player={player}
					linear={linear}
				/>
			),
			!linear && !embed && (
				<ControlsPlaybackSpeed
					key="playbackSpeed"
					className={cx(bemPlayerControlButton.b(), bem2.e('playback-speed'))}
					player={player}
					linear={linear}
					playerId={playerId}
				/>
			),
			!embed && (
				<ControlsEpisodeList
					key="episode"
					className={cx(bemPlayerControlButton.b(), bem2.e('episode-list'))}
					item={item}
					player={player}
					currentTime={currentTime}
					duration={duration}
					linear={linear}
				/>
			),
			controlsOverlay && currentProgram && (
				<ControlsOnNow
					key="on-now"
					className={cx(bemPlayerControlButton.b(), bem2.e('on-now'))}
					toggleOverlay={this.showOnNowOverlay}
				/>
			),
			controlsOverlay && currentProgram && (
				<ControlsUpcomingSchedule
					key="upcoming-schedule"
					className={cx(bemPlayerControlButton.b(), bem2.e('upcoming-schedule'))}
					toggleOverlay={this.showUpcomingScheduleOverlay}
				/>
			)
		];
	}

	renderCastButton() {
		const { castActive, isVr, startover, embed } = this.props;
		if (!embed && isCastSupported() && !isVr && !startover) {
			return <CastButtonLoader key="cast" className={cx(bemPlayerControlButton.b('cast'), { active: castActive })} />;
		}
	}

	hideControlsSelectorOverlay = () => {
		const { closeModal, toggleChannelSelectorVisibility } = this.props;
		closeModal(CHANNELS_SELECTOR_ID);
		toggleChannelSelectorVisibility(false);
		this.channelSelectorTimer.stop();
	};

	showUpcomingScheduleOverlay = () => {
		const { currentProgram, list, showModal, linear, toggleChannelSelectorVisibility, setOverlayControls } = this.props;

		toggleChannelSelectorVisibility(true);
		if (setOverlayControls) setOverlayControls(false);

		const props: OverlayChannelSelectorOwnProps = {
			id: UPCOMING_SCHEDULE_SELECTOR_ID,
			currentProgram,
			list,
			toggleOnNowOverlay: this.showOnNowOverlay,
			type: ChannelSelectors.UPCOMING_SCHEDULE
		};

		showModal({
			id: UPCOMING_SCHEDULE_SELECTOR_ID,
			type: ModalTypes.CUSTOM,
			target: linear && !fullscreenService.isFullScreen() && isMobileSize() ? 'app' : 'player',
			element: <OverlayChannelSelector {...props} />,
			enableScroll: true,
			transparentOverlay: true
		});
	};

	showOnNowOverlay = () => {
		const { currentProgram, list, showModal, linear, toggleChannelSelectorVisibility, setOverlayControls } = this.props;

		toggleChannelSelectorVisibility(true);
		if (setOverlayControls) setOverlayControls(false);

		const props: OverlayChannelSelectorOwnProps = {
			id: CHANNELS_SELECTOR_ID,
			currentProgram,
			list,
			toggleOnNowOverlay: this.showOnNowOverlay,
			type: ChannelSelectors.ON_NOW
		};

		showModal({
			id: CHANNELS_SELECTOR_ID,
			type: ModalTypes.CUSTOM,
			target: linear && !fullscreenService.isFullScreen() && isMobileSize() ? 'app' : 'player',
			element: <OverlayChannelSelector {...props} />,
			enableScroll: true,
			transparentOverlay: true
		});
	};

	shouldShowChannelSelector() {
		const { isChannelSelectorVisible, player } = this.props;
		return this.isChannel() && fullscreenService.isFullScreen() && isChannelSelectorVisible && !player.isAdPlaying();
	}
}

function mapStateToProps(state: state.Root): PlayerControlsStateProps {
	return {
		defaultVolume: state.player.volume,
		isMuted: state.player.isMuted,
		isChannelSelectorVisible: state.player.channelSelectorVisible,
		startOverButtonSecondsAvailability:
			get(state.app, 'config.general.customFields.StartOverButtonSecondsAvailability') || 0,
		startOverAdditionalDurationInSeconds:
			get(state.app, 'config.general.customFields.StartOverAdditionalDurationInSeconds') || 0
	};
}

function mapDispatchToProps(dispatch: Dispatch<any>): PlayerControlsDispatchProps {
	return {
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		toggleChannelSelectorVisibility: (isVisible: boolean) => dispatch(toggleChannelSelectorVisibility(isVisible))
	};
}

export default connect<PlayerControlsStateProps, PlayerControlsDispatchProps, PlayerControlsOwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(PlayerControls);
