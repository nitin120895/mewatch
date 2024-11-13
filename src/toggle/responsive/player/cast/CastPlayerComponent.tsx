import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { PlayerAction, PlayerError, PlayerEventType, PlayerInterface, PlayerProperties, PlayerState } from '../Player';
import warning from 'shared/util/warning';
import PlayerControls from '../PlayerControls';
import PlayerMetadata from '../PlayerMetadata';
import { startedPlaying } from 'shared/cache/cacheWorkflow';
import PlayerBackgroundImage from 'ref/responsive/player/PlayerBackgroundImage';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import {
	getMetadataTitle,
	getSecondaryTitle,
	isEpisode,
	isTrailer,
	isSeriesEpisode
} from 'toggle/responsive/util/item';
import CtaButton from 'ref/responsive/component/CtaButton';
import { closePlayer, openPlayer, toggleMutedState, saveVolume } from 'shared/app/playerWorkflow';
import { Errors, getPlayerErrorByServiceError } from '../playerErrors';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import BackIcon from 'ref/responsive/player/controls/icons/BackIcon';
import ModalManager from 'ref/responsive/app/modal/ModalManager';
import EndOfPlayback from '../EndOfPlayback';
import { togglePlayback } from 'ref/responsive/player/playerUtils';
import { DISABLED_SQUEEZBACK } from '../../util/playerUtil';
import { wrapPlayer } from 'shared/analytics/components/playerWrapper/AnalyticsPlayerWrapper';
import * as PropTypes from 'prop-types';
import { AnalyticsContext } from 'shared/analytics/types/types';

import './CastPlayerComponent.scss';

interface CastPlayerComponentProps {
	castPlayer: PlayerInterface;
	item: api.ItemDetail;
	player?: state.PlayerItem;
	playerId: string;
	onError?: (error: PlayerError) => void;
	onNavigate?: (path: string) => void;
	onBack: () => void;
	activeAccount: boolean;
	startedPlaying: (item: api.ItemDetail) => void;
	openPlayer?: (item: api.ItemDetail, playerId: string, subscriptionCode?: string) => Promise<any>;
	closePlayer: (playerId: string) => Promise<any>;
	subscriptionCode?: string;
	castDevice: string;
	isConnecting: boolean;
	isConnected: boolean;
	chainPlayCountdown?: number;
	chainPlaySqueezeback?: number;
	currentProgram?: api.ItemSchedule;
	defaultVolume?: number;
	isMuted?: boolean;

	toggleMutedState: (isMuted: boolean) => void;
	saveVolume: typeof saveVolume;
}

interface CastPlayerComponentState {
	playerState: PlayerState;
	currentTime: number;
	duration: number;
	chainPlayAvailable: boolean;
	isEndOfPlayback: boolean;
}

interface StoreDispatch {
	openPlayer: (item: api.ItemDetail, playerId: string, subscriptionCode?: string) => void;
	closePlayer: (playerId: string) => void;
	startedPlaying: (item: api.ItemDetail) => void;

	toggleMutedState: (isMuted: boolean) => void;
	saveVolume: typeof saveVolume;
}

const bemPlayer = new Bem('player');
const bemEndOfPlayback = new Bem('end-of-playback');

class CastPlayerComponent extends React.Component<CastPlayerComponentProps, CastPlayerComponentState> {
	private player: PlayerInterface;
	private isPlaybackStarted: boolean;
	private playerContainer: HTMLElement;

	static contextTypes = {
		emitVideoEvent: PropTypes.func
	};

	context: {
		emitVideoEvent: AnalyticsContext['emitVideoEvent'];
	};

	constructor(props) {
		super(props);

		this.state = {
			playerState: PlayerState.UNKNOWN,
			currentTime: 0,
			duration: 0,
			chainPlayAvailable: isEpisode(props.item),
			isEndOfPlayback: false
		};
	}

	componentDidMount() {
		this.playerContainer = findDOMNode(this);
		this.createPlayer();
		this.prepareForCasting();
		if (fullscreenService.isFullScreen()) {
			fullscreenService.changeFullscreen();
		}
	}

	componentWillReceiveProps(nextProps: CastPlayerComponentProps) {
		const { player, onError } = this.props;
		const error = player && player.error;
		const nextError = nextProps.player && nextProps.player.error;
		if (error !== nextError && nextError) {
			this.player.dispose();
			onError(getPlayerErrorByServiceError(nextProps.player.error));
		}
	}

	componentDidUpdate(prevProps: CastPlayerComponentProps, prevState: CastPlayerComponentState) {
		const { item } = this.props;

		if (prevProps.item !== item && item) this.prepareForCasting();

		// special state when user had PAUSED video before seeking to the end of the video
		// we get just current time update, switch to the end of play mode, but nothing happen on chromecast
		// we just need explicitly play the video if not in PLAYING state
		const { isEndOfPlayback, playerState } = this.state;
		if (prevState.isEndOfPlayback !== isEndOfPlayback && isEndOfPlayback && playerState !== PlayerState.PLAYING)
			this.player.play();
	}

	componentWillUnmount() {
		const { playerState } = this.state;
		if (playerState === PlayerState.ENDED) this.closePlayer();
		this.disposePlayer();
	}

	private createPlayer() {
		if (!this.player) {
			this.player = this.props.castPlayer;

			this.player = wrapPlayer(this.props.item, this.props.castPlayer as any, this.context.emitVideoEvent);

			this.player.addListener(PlayerEventType.state, this.onStateChanged);
			this.player.addListener(PlayerEventType.error, this.onError);
			this.player.addListener(PlayerEventType.properties, this.onPlayerProperties);

			this.setInitialVolumeState();
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

	private closePlayer() {
		const { closePlayer, playerId } = this.props;
		closePlayer(playerId);
		this.player.dispose();
	}

	private prepareForCasting() {
		const { item, player } = this.props;
		const currentCastItemId = player && player.item && player.item.id;

		if (item && item.id !== currentCastItemId) {
			this.castItem();
		} else {
			const { currentTime, duration } = this.player.getLastProperties();
			this.setState(
				{
					currentTime: currentTime || 0,
					duration: duration || 0,
					isEndOfPlayback: false,
					playerState: this.player.getLastState()
				},
				this.checkPlayerState
			);
		}
	}

	private castItem() {
		const { item, openPlayer, subscriptionCode, playerId } = this.props;
		openPlayer(item, playerId, subscriptionCode);
	}

	private showWrapper() {
		const { playerState, isEndOfPlayback } = this.state;
		return !isEndOfPlayback && playerState !== PlayerState.UNKNOWN && playerState !== PlayerState.ENDED;
	}

	private checkPlayerState = () => {
		const { item } = this.props;
		switch (this.state.playerState) {
			case PlayerState.PLAYING:
				this.playbackStarted();
				break;
			case PlayerState.ENDED:
				if (isTrailer(item)) {
					this.closePlayer();
				}
				break;
		}
	};

	private showEndOfPlayback() {
		const { isEndOfPlayback, playerState } = this.state;
		return isEndOfPlayback || playerState === PlayerState.ENDED;
	}

	private playbackStarted() {
		if (!this.isPlaybackStarted) {
			this.isPlaybackStarted = true;
			const { startedPlaying, item } = this.props;
			startedPlaying(item);
		}
	}

	private isEndOfPlaybackAvailable(playerProperties: PlayerProperties) {
		const { currentTime, duration } = playerProperties;
		const { item, chainPlaySqueezeback } = this.props;
		return (
			!isTrailer(item) &&
			duration > 0 &&
			currentTime >= 0 &&
			duration - currentTime <= chainPlaySqueezeback &&
			this.state.playerState !== PlayerState.BUFFERING
		);
	}

	private onError = error => {
		warning(error);
		const { onError } = this.props;
		if (onError) onError(Errors.generic);
	};

	private onReplay = () => {
		this.setState({ currentTime: 0, duration: 0, isEndOfPlayback: false }, () => {
			this.player.emit(PlayerEventType.action, { name: PlayerAction.Restart, payload: true });
			this.player.replay();
		});
	};

	private onStateChanged = state => {
		this.setState({ playerState: state }, this.checkPlayerState);
	};

	private onPlayerProperties = (playerProperties: PlayerProperties) => {
		const { currentTime, duration, itemId } = playerProperties;

		// when we are loading medias for new item, we can get properties change of current item on chromecast
		// we just need to allow properties changes for the same item
		if (itemId === this.props.item.id) {
			this.setState({
				currentTime: currentTime,
				duration: duration,
				isEndOfPlayback: this.state.isEndOfPlayback || this.isEndOfPlaybackAvailable(playerProperties)
			});
		}
	};

	render() {
		if (!this.props.item) return <div />;

		return (
			<div className={cx(bemPlayer.b(), bemPlayer.e('cast'))}>
				<div className="player-block" />
				{this.renderBackgroundImage()}
				{this.renderWrapper()}
				<ModalManager onModalActive={this.onModalActive} scope="player" />
			</div>
		);
	}

	private renderBackgroundImage() {
		return <PlayerBackgroundImage item={this.props.item} />;
	}

	private renderWrapper() {
		const { item, castDevice, isConnecting, isConnected, currentProgram, playerId } = this.props;
		const { playerState, currentTime, duration } = this.state;

		const isWrapperVisible = this.showWrapper();

		return (
			<div className={cx(bemPlayer.e('wrapper', { ui: true, controls: true }))}>
				{isWrapperVisible && (
					<PlayerControls
						playerState={playerState}
						player={this.player}
						playerContainer={this.playerContainer}
						item={item}
						currentTime={currentTime}
						duration={duration}
						castActive
						currentProgram={currentProgram}
						toggleFullscreen={fullscreenService.changeFullscreen}
						togglePlayback={this.togglePlayback}
						playerId={playerId}
						setVolumeMutedState={this.setVolumeMutedState}
						setVolume={this.setVolume}
					/>
				)}

				{this.renderMetadata()}
				{this.renderActions()}
				{this.renderEndOfPlayback()}

				{isConnecting && (
					<IntlFormatter elementType="p" className={bemPlayer.e('connection-status')}>
						<IntlFormatter elementType="span">{'@{chromecast_connecting|Connecting}'}</IntlFormatter>
					</IntlFormatter>
				)}
				{isConnected && castDevice && (
					<IntlFormatter elementType="p" className={bemPlayer.e('connection-status')}>
						<IntlFormatter elementType="span" values={{ castDevice }}>
							{'@{chromecast_cast_to|Casting to}'}
						</IntlFormatter>
					</IntlFormatter>
				)}
			</div>
		);
	}

	private renderActions() {
		if (this.showEndOfPlayback()) {
			return (
				<div className={bemEndOfPlayback.e('actions')} key="actions">
					{this.renderReplay()}
				</div>
			);
		}

		return false;
	}

	private renderEndOfPlayback() {
		const { item, playerId, onBack, activeAccount } = this.props;

		if (this.showEndOfPlayback()) {
			return (
				<EndOfPlayback
					item={item}
					onReplay={this.onReplay}
					playerId={playerId}
					onPlayNext={this.onPlayNext}
					onBack={onBack}
					activeAccount={activeAccount}
				/>
			);
		}

		return false;
	}

	private onPlayNext: PlayNextHandler = (
		nextItem: api.ItemDetail,
		canPlayItem: boolean,
		countdownRemaining: number
	) => {
		if (canPlayItem) {
			this.player.emit(PlayerEventType.action, {
				name: PlayerAction.PlayNext,
				payload: { item: nextItem, countdown: countdownRemaining }
			});
		}
		this.props.onNavigate(canPlayItem ? nextItem.watchPath : nextItem.path);
	};

	private renderMetadata() {
		const { item, onBack } = this.props;
		const isEndOfPlayback = this.showEndOfPlayback();

		return (
			<div className={bemPlayer.e('metadata-container')}>
				{!isEndOfPlayback && (
					<span className="player-overlay__back" onClick={onBack}>
						<BackIcon className={bemPlayer.e('back-icon')} />
					</span>
				)}

				<PlayerMetadata
					className={bemPlayer.e('cast-metadata')}
					title={getMetadataTitle(item)}
					secondaryTitle={getSecondaryTitle(item)}
				>
					{this.renderEpisodeMetadata()}
				</PlayerMetadata>
			</div>
		);
	}

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
			>
				{`@{endOfPlayback_metadata_title}`}
			</IntlFormatter>
		) : (
			<p>{item.episodeName}</p>
		);
	}

	private renderReplay() {
		return (
			<IntlFormatter
				elementType={CtaButton}
				className={cx(bemPlayer.e('replay-btn'), 'player-btn')}
				onClick={this.onReplay}
			>
				{`@{endOfPlayback_cta_replay|Replay}`}
			</IntlFormatter>
		);
	}

	private onModalActive = () => {};

	private togglePlayback = (): void => {
		togglePlayback(this.player, this.state.playerState);
	};

	private setVolumeMutedState = (isMuted: boolean) => {
		if (isMuted) {
			this.player.emit(PlayerEventType.action, { name: PlayerAction.SetVolume, payload: 0 });
			this.player.setVolume(0);
		}
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

	private setInitialVolumeState() {
		const { defaultVolume, isMuted } = this.props;

		this.player.setVolume(defaultVolume);
		this.player.setVolumeMutedState(isMuted);
	}
}

function mapStateToProps(state: state.Root, ownProps): any {
	const { account, player, app } = state;
	const { chainPlayCountdown, chainPlaySqueezeback } = app.config.playback;
	const sub = account.info ? account.info.subscriptionCode : '';
	const players = player.players;

	return {
		player: players && players[ownProps.playerId],
		subscriptionCode: sub,
		activeAccount: account.active,
		isConnecting: player.cast.connectionStatus === 'Connecting',
		isConnected: player.cast.connectionStatus === 'Connected',
		castDevice: player.cast.castDevice,
		chainPlayCountdown: chainPlayCountdown || 0,
		chainPlaySqueezeback: DISABLED_SQUEEZBACK || !chainPlaySqueezeback ? 0 : chainPlaySqueezeback,

		defaultVolume: state.player.volume,
		isMuted: state.player.isMuted
	};
}

function mapDispatchToProps(dispatch: Dispatch<any>): StoreDispatch {
	return {
		openPlayer: (item: api.ItemDetail, playerId: string, subscriptionCode?: string) =>
			dispatch(openPlayer(item, playerId, subscriptionCode)),
		closePlayer: (playerId: string) => dispatch(closePlayer(playerId)),
		startedPlaying: (item: api.ItemDetail) => dispatch(startedPlaying(item)),

		toggleMutedState: (isMuted: boolean) => dispatch(toggleMutedState(isMuted)),
		saveVolume: (value: number) => dispatch(saveVolume(value))
	};
}

export default connect<CastPlayerComponentProps, any, any>(
	mapStateToProps,
	mapDispatchToProps
)(CastPlayerComponent);
