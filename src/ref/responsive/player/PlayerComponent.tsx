import * as cx from 'classnames';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import { wrapPlayer } from 'shared/analytics/components/playerWrapper/AnalyticsPlayerWrapper';
import { Bem } from 'shared/util/styles';
import { PlayerState, PlayerInterface, PlayerProperties, PlayerAction } from './Player';
import getPlayer from './getPlayer';
import { saveResumePosition } from 'shared/account/profileWorkflow';
import { getResumePosition } from 'shared/account/profileUtil';
import warning from 'shared/util/warning';
import PlayerControls from './PlayerControls';
import PlayerMetadata from './PlayerMetadata';
import PlayerOverlayingControls from './PlayerOverlayingControls';
import EndOfPlayback from './EndOfPlayback';
import { startedPlaying } from 'shared/cache/cacheWorkflow';
import { isTrailer, isEpisode } from '../util/item';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { BasePlayerWrapper } from './BasePlayerWrapper';
import { saveRealVideoPosition, chromecastIntroduction } from 'shared/app/playerWorkflow';
import { isCastSupported } from './cast/CastLoader';
import { showCastIntro } from './cast/Cast';
import { togglePlayback, toggleFullScreen } from './playerUtils';

import './PlayerComponent.scss';

interface PlayerComponentProps {
	item: api.ItemDetail;
	data?: api.MediaFile[];
	playerId: string;
	currentTime?: number;
	onError?: (error: Error) => void;
	onNavigate?: (path: string) => void;
	onBack: () => void;
	saveResumePosition?: (item: api.ItemSummary, position: number) => void;
	saveRealVideoPosition?: (itemId: string, position: number) => void;
	chainPlaySqueezeback: number;
	activeAccount: boolean;
	startedPlaying: (item: api.ItemDetail) => void;
	showCastIntroduction: boolean;
	showIntroduction?: () => void;
	hideIntroduction?: () => void;
}

interface PlayerComponentState {
	playerState: PlayerState;
	currentTime: number;
	duration: number;
	chainPlayMode: 'none' | 'active' | 'done';
	showUI?: boolean;
	showControls?: boolean;
	showVideo?: boolean;
	onOverlayOpen?: boolean;
}

const bemPlayer = new Bem('player');
const bemPlayerBlock = new Bem('player-block');
const CONTROLS_HIDE_DELAY = 4000;
const CLICK_DELAY = 200;

class PlayerComponent extends React.Component<PlayerComponentProps, PlayerComponentState> {
	static contextTypes = {
		emitVideoEvent: PropTypes.func
	};

	private player: PlayerInterface;
	private playerPromise: Promise<PlayerInterface | Error>;
	private videoContainer: HTMLElement;
	private playerContainer: HTMLElement;
	private wrapper: HTMLElement;
	private hideTimeout: number;
	private isPlaybackStarted: boolean;
	private clickTimer: any;
	private clickPrevent = false;

	// On touch devices we don't want to pause/play video by tapping the screen
	private isTouchDevice = false;

	constructor(props) {
		super(props);

		this.state = {
			playerState: PlayerState.UNKNOWN,
			currentTime: this.props.currentTime || this.getResumePosition(),
			duration: 0,
			chainPlayMode: 'none',
			showControls: false,
			showUI: true,
			showVideo: true
		};
	}

	componentDidMount() {
		if (this.props.data) {
			this.getOrCreatePlayer().then(this.loadPlayer, this.onError);
		}
		window.addEventListener('keydown', this.onKeyDown, false);
	}

	componentWillReceiveProps(nextProps: PlayerComponentProps) {
		if (nextProps.data !== this.props.data) {
			this.props.data && this.disposePlayer();
			this.setState({
				playerState: PlayerState.UNKNOWN,
				currentTime: this.getResumePosition(),
				duration: 0,
				chainPlayMode: 'none',
				showControls: false,
				showUI: true,
				showVideo: true
			});
		}

		if (!this.props.showCastIntroduction && nextProps.showCastIntroduction) {
			this.setState({ showUI: true }, () => this.stopTimerDelay());
		} else if (this.props.showCastIntroduction && !nextProps.showCastIntroduction) {
			this.setState({ showUI: true }, () => this.startTimerDelay());
		}
	}

	componentWillUpdate(nextProps: PlayerComponentProps, nextState: PlayerComponentState) {
		const [from, next] = [this.state.chainPlayMode, nextState.chainPlayMode];
		const isNextChainPlay = next === 'active';
		const isStartingChainPlay = isNextChainPlay && from === 'none';
		const isEndingChainPlay = next === 'done' && from === 'active';

		if (isNextChainPlay && this.player) {
			this.player.emit('action', { name: PlayerAction.Squeezeback, payload: true });
		}

		if (isStartingChainPlay) {
			this.props.hideIntroduction();
		} else if (isEndingChainPlay) {
			this.checkCastIntroduction();
		}
	}

	componentDidUpdate(prevProps: PlayerComponentProps) {
		const { data } = this.props;
		if (data && data !== prevProps.data) {
			this.getOrCreatePlayer().then(this.loadPlayer, this.onError);
		}
	}

	componentWillUnmount() {
		this.stopTimerDelay();
		window.removeEventListener('keydown', this.onKeyDown);

		if (!this.player) {
			return;
		}

		// we need to save realtime to data model
		// we will use it for chromecast playback start, especially in case we connect to chromecast when end of playback is active.
		// not ideal solution, but didn't find the better one
		const { item, saveRealVideoPosition } = this.props;
		const playerProperties = this.player.getLastProperties();
		const realTime = (playerProperties && playerProperties.currentTime) || 0;
		saveRealVideoPosition(item.id, realTime);

		this.disposePlayer();
		this.savePlaybackPosition();
	}

	private getOrCreatePlayer(useExisting = true): Promise<PlayerInterface | Error> {
		this.playerPromise =
			(useExisting && this.playerPromise) ||
			new Promise((resolve, reject) => {
				return getPlayer().then(player => {
					if (!player || !(player instanceof BasePlayerWrapper)) {
						reject(new Error('No player ready for playback'));
					}

					if (!player.flags || !player.flags.isBrowserSupported) {
						reject(new Error('Browser Not Supported'));
					}
					this.player = wrapPlayer(this.props.item, player, this.context.emitVideoEvent);
					this.player.addListener('state', this.onStateChanged);
					this.player.addListener('error', this.onError);
					this.player.addListener('properties', this.onPlayerProperties);
					resolve(this.player);
				});
			});
		return this.playerPromise;
	}

	private disposePlayer() {
		if (this.player) {
			this.player.removeListener('state', this.onStateChanged);
			this.player.removeListener('error', this.onError);
			this.player.removeListener('properties', this.onPlayerProperties);
			this.player.dispose();
			this.player = undefined;
		}
	}

	private savePlaybackPosition() {
		const { item, saveResumePosition } = this.props;
		const { currentTime, duration } = this.state;
		if (duration && item) saveResumePosition(item, currentTime);
	}

	private loadPlayer = () => {
		if (!this.props.data) {
			return;
		}

		const { item, data } = this.props;

		const options = { item, data, autoPlay: true, startTime: this.state.currentTime };

		this.playerContainer = findDOMNode(this);
		this.videoContainer = this.playerContainer.querySelector('.js-player-container') as HTMLElement;

		this.player.initPlayback(this.videoContainer, options).then(success => {
			if (success && !this.player.ownControls) {
				this.setState({ showControls: true });
			}
		});
	};

	private getResumePosition() {
		const { item } = this.props;
		if (isTrailer(item)) return 0;
		return getResumePosition(item.id);
	}

	private showWrapper() {
		const { playerState, chainPlayMode, duration } = this.state;

		return (
			duration > 0 &&
			chainPlayMode !== 'active' &&
			playerState !== PlayerState.UNKNOWN &&
			playerState !== PlayerState.LOADING &&
			playerState !== PlayerState.ENDED
		);
	}

	private checkPlayerState = () => {
		const { item, onBack } = this.props;
		this.stopTimerDelay();

		switch (this.state.playerState) {
			case PlayerState.PLAYING:
				this.setVideoVisibility(true);
				this.startTimerDelay();
				this.playbackStarted();
				break;
			case PlayerState.BUFFERING:
				this.setControlsVisibility(true);
				break;
			case PlayerState.PAUSED:
				this.setControlsVisibility(true);
				this.savePlaybackPosition();
				break;
			case PlayerState.ENDED:
				this.setVideoVisibility(false);
				if (isTrailer(item)) {
					onBack();
				} else {
					this.deactivateChainPlay();
				}
				break;
		}
	};

	private deactivateChainPlay() {
		this.setState({ chainPlayMode: 'done' });
	}

	private resetChainPlay() {
		this.setState({ chainPlayMode: 'none' });
	}

	private canShowEndOfPlayback() {
		const { playerState, chainPlayMode } = this.state;
		return !isTrailer(this.props.item) && (playerState === PlayerState.ENDED || chainPlayMode === 'active');
	}

	private canChainPlay(playerProperties: PlayerProperties) {
		const { chainPlaySqueezeback, item } = this.props;
		const { chainPlayMode, playerState } = this.state;
		const { currentTime, duration } = playerProperties;

		// set `chainplay=true` in console to force end of play
		if (_DEV_ && !!(window as any).chainplay) return true;

		return (
			!isTrailer(item) &&
			duration > 0 &&
			chainPlayMode === 'none' &&
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
			this.checkCastIntroduction();
		}
	}

	private checkCastIntroduction() {
		// show cast intro when:
		// 1. video cast is supported - desktop Chrome only
		// 2. video player hasn't own controls bar
		// 3. there is at least one available chromecast device
		// 4. hasn't been shown before
		// 5. if we are not on EndOfPlayBack screen
		if (
			!this.props.showCastIntroduction &&
			isCastSupported() &&
			showCastIntro() &&
			!this.player.ownControls &&
			!this.canShowEndOfPlayback()
		) {
			this.props.showIntroduction();
		}
	}

	private setControlsVisibility = (value: boolean) => {
		if (this.state.showUI !== value) this.setState({ showUI: value });
	};

	private setVideoVisibility = (value: boolean) => {
		if (this.state.showVideo !== value) this.setState({ showVideo: value });
	};

	private startTimerDelay() {
		if (this.props.showCastIntroduction) return;

		if (!this.hideTimeout) {
			this.hideTimeout = window.setTimeout(() => {
				if (this.state.playerState === PlayerState.PLAYING) {
					this.setControlsVisibility(false);
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

	private onError = error => {
		warning(error);
		const { onError } = this.props;
		if (onError) onError(error);
	};

	private onReplay = () => {
		this.setState({ currentTime: 0, duration: 0 });
		this.resetChainPlay();
		this.player.emit('action', { name: PlayerAction.Restart, payload: true });
		this.player.replay();
	};

	private onPlayPressed = () => {
		this.player.emit('action', { name: PlayerAction.ActuatePlay });
		this.player.play();
	};

	private onVideoClick = () => this.deactivateChainPlay();

	private onStateChanged = state => {
		this.setState({ playerState: state }, this.checkPlayerState);
	};

	private onPlayerProperties = (playerProperties: PlayerProperties) => {
		const { chainPlayMode } = this.state;
		this.setState({
			currentTime: playerProperties.currentTime,
			duration: playerProperties.duration,
			chainPlayMode: this.canChainPlay(playerProperties) ? 'active' : chainPlayMode
		});
	};

	private onTouchStart = e => {
		this.isTouchDevice = true;
		const { showUI, playerState } = this.state;
		if (showUI) {
			if (e.target === this.wrapper && playerState === PlayerState.PLAYING) {
				this.hideUI();
			}
		} else {
			this.showUI();
		}
	};

	private onTouchMove = e => {
		this.showUI();
	};

	private onMouseMove = () => {
		if (this.isTouchDevice) return false;
		this.showUI();
	};

	private showUI() {
		this.stopTimerDelay();
		this.setControlsVisibility(true);
		this.startTimerDelay();
	}

	private hideUI() {
		this.stopTimerDelay();
		this.setControlsVisibility(false);
	}

	private onOverlayOpen = (opened: boolean) => {
		this.setState({ onOverlayOpen: opened });
	};

	private onKeyDown = () => {
		this.stopTimerDelay();
		this.setControlsVisibility(true);
		this.startTimerDelay();
	};

	private onPlayNext: PlayNextHandler = (
		nextItem: api.ItemDetail,
		canPlayItem: boolean,
		countdownRemaining: number
	) => {
		if (canPlayItem) {
			this.player.emit('action', {
				name: PlayerAction.PlayNext,
				payload: { item: nextItem, countdown: countdownRemaining }
			});
		}
		this.props.onNavigate(canPlayItem ? nextItem.watchPath : nextItem.path);
	};

	private onWrapperRef = (ref: HTMLElement) => {
		this.wrapper = ref;
	};

	private onWrapperClick = e => {
		if (this.isTouchDevice || e.target !== this.wrapper) return false;

		this.clickTimer = setTimeout(() => {
			if (!this.clickPrevent) {
				this.togglePlayback();
			}
			this.clickPrevent = false;
		}, CLICK_DELAY);
	};

	private onWrapperDoubleClick = e => {
		if (this.isTouchDevice || e.target !== this.wrapper) return false;

		clearTimeout(this.clickTimer);
		this.clickPrevent = true;
		this.toggleFullScreen();
	};

	private togglePlayback = () => {
		togglePlayback(this.player, this.state.playerState);
	};

	private toggleFullScreen = () => {
		toggleFullScreen(this.player, this.playerContainer);
	};

	render() {
		const { chainPlayMode, showVideo, onOverlayOpen } = this.state;
		return (
			<div
				className={cx(
					bemPlayer.b(),
					bemPlayerBlock.e('container', { overlay: onOverlayOpen }, { 'overlay-hide': !showVideo })
				)}
				onMouseMove={this.onMouseMove}
				onTouchStart={this.onTouchStart}
				onTouchMove={this.onTouchMove}
			>
				<div className={bemPlayerBlock.b()}>
					<div
						className={cx(
							'js-player-container',
							bemPlayerBlock.e('container', {
								wrap: chainPlayMode === 'active',
								hide: !showVideo
							})
						)}
						onClick={this.onVideoClick}
					/>
					{this.renderOverlayingControls()}
				</div>
				{this.renderEndOfPlayback()}
				{this.renderWrapper()}
			</div>
		);
	}

	private renderOverlayingControls() {
		if (this.state.chainPlayMode === 'active') return false;
		const { showControls, playerState } = this.state;
		const isAutoPlayEnabled = this.player && this.player.flags.isAutoPlayEnabled;
		const state = !showControls ? PlayerState.LOADING : playerState;
		return (
			<PlayerOverlayingControls isAutoPlayEnabled={isAutoPlayEnabled} playerState={state} onPlay={this.onPlayPressed} />
		);
	}

	private renderWrapper() {
		const { item, onBack, showCastIntroduction } = this.props;
		const { playerState, currentTime, duration, showUI, showControls } = this.state;

		if (!this.showWrapper()) return false;
		const title = (item.season && item.season.show && item.season.show.title) || item.title;
		// scan readers will ignore the player, when we don't have an access for buttons
		const areaLabel = showCastIntroduction ? { 'aria-hidden': 'true' } : undefined;
		return (
			<div
				ref={this.onWrapperRef}
				onClick={this.onWrapperClick}
				onDoubleClick={this.onWrapperDoubleClick}
				className={cx(bemPlayer.e('wrapper', { ui: showUI, controls: showControls }))}
				{...areaLabel}
			>
				{showControls && (
					<PlayerControls
						playerState={playerState}
						player={this.player}
						item={item}
						currentTime={currentTime}
						duration={duration}
						toggleFullScreen={this.toggleFullScreen}
						togglePlayback={this.togglePlayback}
						castIntroLayer={showCastIntroduction}
					/>
				)}
				<PlayerMetadata title={title} onBack={onBack}>
					{this.renderEpisodeMetadata()}
					<p>{item.shortDescription || item.description}</p>
				</PlayerMetadata>
			</div>
		);
	}

	private renderEpisodeMetadata() {
		const { item } = this.props;
		if (!isEpisode(item)) return false;
		return (
			<IntlFormatter
				elementType="p"
				values={{
					seasonNumber: (item.season && item.season.seasonNumber) || item.seasonNumber,
					episodeNumber: item.episodeNumber,
					episodeName: item.episodeName
				}}
			>
				{`@{endOfPlayback_metadata_title}`}
			</IntlFormatter>
		);
	}

	private renderEndOfPlayback() {
		const { item, playerId, onBack, activeAccount } = this.props;

		if (this.canShowEndOfPlayback()) {
			return (
				<EndOfPlayback
					item={item}
					onReplay={this.onReplay}
					playerId={playerId}
					onPlayNext={this.onPlayNext}
					onBack={onBack}
					activeAccount={activeAccount}
					onOverlayOpen={this.onOverlayOpen}
				/>
			);
		}

		return false;
	}
}

function mapStateToProps(state: state.Root, ownProps): any {
	return {
		chainPlaySqueezeback: state.app.config.playback.chainPlaySqueezeback,
		activeAccount: state.account.active,
		showCastIntroduction: state.player.cast.showIntroduction
	};
}

function mapDispatchToProps(dispatch) {
	return {
		saveResumePosition: (item: api.ItemSummary, position: number) => dispatch(saveResumePosition(item, position)),
		saveRealVideoPosition: (itemId: string, position: number) => dispatch(saveRealVideoPosition(itemId, position)),
		startedPlaying: (item: api.ItemDetail) => dispatch(startedPlaying(item)),
		showIntroduction: () => dispatch(chromecastIntroduction(true)),
		hideIntroduction: () => dispatch(chromecastIntroduction(false))
	};
}

export default connect<PlayerComponentProps, any, any>(
	mapStateToProps,
	mapDispatchToProps
)(PlayerComponent);
