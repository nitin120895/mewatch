import * as React from 'react';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { PlayerState, PlayerInterface, PlayerProperties, PlayerError } from '../Player';
import warning from 'shared/util/warning';
import PlayerControls from '../PlayerControls';
import PlayerMetadata from '../PlayerMetadata';
import SuggestedContent from '../SuggestedContent';
import PlayNextEpisode from '../PlayNextEpisode';
import { startedPlaying } from 'shared/cache/cacheWorkflow';
import PlayerBackgroundImage from '../PlayerBackgroundImage';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { isTrailer, isEpisode, getMetadataTitle } from '../../util/item';
import CtaButton from 'ref/responsive/component/CtaButton';
import RatingWrapper from 'ref/responsive/component/rating/RatingWrapper';
import { openPlayer, closePlayer } from 'shared/app/playerWorkflow';
import { getPlayerErrorByServiceError, Errors } from '../playerErrors';
import { togglePlayback, toggleFullScreen } from '../playerUtils';

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
}

interface CastPlayerComponentState {
	playerState: PlayerState;
	currentTime: number;
	duration: number;
	chainPlayAvailable: boolean;
	isEndOfPlayback: boolean;
}

const bemPlayer = new Bem('player');
const bemEndOfPlayback = new Bem('end-of-playback');

class CastPlayerComponent extends React.Component<CastPlayerComponentProps, CastPlayerComponentState> {
	private player: PlayerInterface;
	private isPlaybackStarted: boolean;
	private playerContainer: HTMLElement;

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
		const { player, onBack, item } = this.props;

		if (prevProps.player && !player) onBack();

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
			this.player.addListener('state', this.onStateChanged);
			this.player.addListener('error', this.onError);
			this.player.addListener('properties', this.onPlayerProperties);
		}
	}

	private disposePlayer() {
		if (this.player) {
			this.player.removeListener('state', this.onStateChanged);
			this.player.removeListener('error', this.onError);
			this.player.removeListener('properties', this.onPlayerProperties);
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

	private canChainPlay() {
		const { activeAccount } = this.props;
		return activeAccount && this.state.chainPlayAvailable;
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

	private togglePlayback = () => {
		togglePlayback(this.player, this.state.playerState);
	};

	private toggleFullScreen = () => {
		toggleFullScreen(this.player, this.playerContainer);
	};

	private onError = error => {
		warning(error);
		const { onError } = this.props;
		if (onError) onError(Errors.generic);
	};

	private onReplay = () => {
		this.setState({ currentTime: 0, duration: 0, isEndOfPlayback: false }, () => {
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

	private onChainPlayFailed = () => {
		this.setState({ chainPlayAvailable: false });
	};

	render() {
		if (!this.props.item) return <div />;

		return (
			<div className={cx(bemPlayer.b(), bemPlayer.e('cast'))}>
				<div className="player-block" />
				{this.renderBackgroundImage()}
				{this.renderWrapper()}
			</div>
		);
	}

	private renderBackgroundImage() {
		return <PlayerBackgroundImage item={this.props.item} />;
	}

	private renderWrapper() {
		const { item, castDevice, isConnecting, isConnected } = this.props;
		const { playerState, currentTime, duration } = this.state;

		const isWrapperVisible = this.showWrapper();
		const isEndOfPlayback = this.showEndOfPlayback();

		return (
			<div className={cx(bemPlayer.e('wrapper'), bemPlayer.e('wrapper--ui'), bemPlayer.e('wrapper--controls'))}>
				{isWrapperVisible && (
					<PlayerControls
						playerState={playerState}
						player={this.player}
						item={item}
						currentTime={currentTime}
						duration={duration}
						toggleFullScreen={this.toggleFullScreen}
						togglePlayback={this.togglePlayback}
						castActive
					/>
				)}

				{!isEndOfPlayback && this.renderMetadata()}
				{isEndOfPlayback && this.renderEndOfPlaybackMetadata()}

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

	private renderEndOfPlayback() {
		const canChainPlay = this.canChainPlay();
		if (this.showEndOfPlayback()) {
			return (
				<div className={bemEndOfPlayback.e('suggested-content')}>
					{canChainPlay && this.renderPlayNextEpisode()}
					{!canChainPlay && this.renderSuggestedContent()}
				</div>
			);
		}

		return false;
	}

	private onPlayNext(nextItem: api.ItemDetail, canPlayItem: boolean) {
		this.props.onNavigate(canPlayItem ? nextItem.watchPath : nextItem.path);
	}

	private renderPlayNextEpisode() {
		const { item, playerId, chainPlayCountdown } = this.props;

		return (
			<PlayNextEpisode
				itemId={item.id}
				chainPlayCountdown={chainPlayCountdown}
				playerId={playerId}
				onPlayNext={this.onPlayNext}
				onFailed={this.onChainPlayFailed}
				isCountdownHidden
			/>
		);
	}

	private renderMetadata() {
		const { item, onBack } = this.props;
		return (
			<PlayerMetadata title={getMetadataTitle(item)} onBack={onBack}>
				{this.renderEpisodeMetadata()}
				<p>{item.shortDescription || item.description}</p>
			</PlayerMetadata>
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

	private renderEndOfPlaybackMetadata() {
		const { onBack, item } = this.props;
		return (
			<div className={bemEndOfPlayback.e('metadata')}>
				<PlayerMetadata title={getMetadataTitle(item)} onBack={onBack} key="metadata">
					{this.renderEpisodeMetadata()}
				</PlayerMetadata>
				<div className={bemEndOfPlayback.e('actions')} key="actions">
					{this.renderReplay()}
					{this.renderRatingButton()}
				</div>
			</div>
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

	private renderRatingButton() {
		const { item } = this.props;
		const rateItem = isEpisode(item) ? item.season && item.season.show : item;
		return <RatingWrapper item={rateItem} component={'rate_or_rating'} onStateChanged={this.onStateChanged} />;
	}

	private renderSuggestedContent() {
		const { item, playerId } = this.props;
		return <SuggestedContent item={item} playerId={playerId} />;
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
		chainPlaySqueezeback: chainPlaySqueezeback || 0
	};
}

function mapDispatchToProps(dispatch) {
	return {
		openPlayer: (item: api.ItemDetail, playerId: string, subscriptionCode?: string) =>
			dispatch(openPlayer(item, playerId, subscriptionCode)),
		closePlayer: (playerId: string) => dispatch(closePlayer(playerId)),
		startedPlaying: (item: api.ItemDetail) => dispatch(startedPlaying(item))
	};
}

export default connect<CastPlayerComponentProps, any, any>(
	mapStateToProps,
	mapDispatchToProps
)(CastPlayerComponent);
