import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { browserHistory } from 'shared/util/browserHistory';
import { PlayerInterface, PlayerState, PlayerProperties, PlayerError, InitPlaybackOptions } from '../Player';
import { getCastPlayer } from './getCastPlayer';
import {
	chromecastConnected,
	chromecastDisconnected,
	getNextItem,
	chromecastConnecting,
	chromecastNoDevices,
	openPlayerWithoutMedia,
	closePlayer,
	removeRealVideoPosition,
	chromecastIntroduction
} from 'shared/app/playerWorkflow';
import { saveResumePosition } from 'shared/account/profileWorkflow';
import { Bem } from 'shared/util/styles';
import CastControls from './CastControls';
import {
	Watch as watchPageKey,
	SignIn as signInPageKey,
	Register as registerPageKey,
	ResetPassword as resetPasswordPageKey
} from 'shared/page/pageKey';
import { getResumePosition } from 'shared/account/profileUtil';

import { isTrailer, isEpisode, getMetadataTitle } from '../../util/item';
import { getItemMedias } from '../playerUtils';
import { changeCastIntroStatus } from './Cast';
import { CAST_PLAYER_ID } from './CastLoader';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Image from 'shared/component/Image';
import { resolveImages } from 'shared/util/images';
import { convertResourceToSrcSet } from 'shared/util/images';
import { getItem } from 'shared/service/content';
import ProgressBar from '../../component/ProgressBar';
import CastIntro from './CastIntro';

import './CastPlayer.scss';

const bem = new Bem('cast-player');

interface CastPlayerProps {
	subscriptionCode?: string;
	player?: state.PlayerItem;
	isProfileSelectorVisible?: boolean;
	pageKey?: string;
	isConnected?: boolean;
	activeAccount?: boolean;
	profile?: state.Profile;
	defaultVolume?: number;
	castDevice?: string;
	chainPlayCountdown?: number;
	showIntroduction?: boolean;
	hideIntroduction?: () => void;
	chromecastConnecting?: () => void;
	chromecastNoDevices?: () => void;
	chromecastConnected?: (castDevice?: string) => void;
	chromecastDisconnected?: (playerId: string) => void;
	saveResumePosition?: (item: api.ItemSummary, position: number) => void;
	getNextItem?: (itemId: string, site: string, sub: string) => Promise<any>;
	openPlayerWithoutMedia?: (item: api.ItemDetail, playerId: string) => Promise<any>;
	closePlayer?: (playerId: string) => Promise<any>;
	removeRealVideoPosition?: (itemId: string) => void;
	realVideoPosition?: { [itemId: string]: number };
}

interface CastPlayerState {
	playerError: PlayerError;
	playerProperties: PlayerProperties;
	playerState: PlayerState;
}

class CastPlayer extends React.Component<CastPlayerProps, CastPlayerState> {
	state = {
		playerError: undefined,
		playerProperties: {},
		playerState: PlayerState.UNKNOWN
	};

	private readonly player: PlayerInterface;

	constructor(props) {
		super(props);

		this.player = getCastPlayer();
		this.player.addListener('state', this.onStateChanged);
		this.player.addListener('error', this.onError);
		this.player.addListener('properties', this.onPlayerProperties);
	}

	componentDidMount() {
		// update UI with last player state
		this.onStateChanged(this.player.getLastState());
		this.onPlayerProperties(this.player.getLastProperties());
	}

	componentWillUnmount() {
		if (this.player) {
			this.player.removeListener('state', this.onStateChanged);
			this.player.removeListener('error', this.onError);
			this.player.removeListener('properties', this.onPlayerProperties);
		}
	}

	componentWillUpdate(nextProps: CastPlayerProps, nextState: CastPlayerState) {
		const { player, isConnected } = this.props;
		const currentData = player && player.data;
		const currentItem = player && player.item;
		const nextPlayer = nextProps.player;

		if (nextProps.isConnected && nextPlayer) {
			// save current video time when item is going to be changed
			if (currentItem && nextPlayer.item && currentItem.id !== nextPlayer.item.id) {
				this.savePlaybackPosition();
			}
			// init playback just in case we are connected to chromcast and player media data exist
			if (
				nextPlayer.item &&
				nextPlayer.data &&
				!nextPlayer.error &&
				(currentData !== nextPlayer.data || isConnected !== nextProps.isConnected)
			) {
				this.player.initPlayback(undefined, this.getCastOptions(nextProps)).then(res => this.onPlayerInitialized(res));
			}
		}
	}

	componentDidUpdate(prevProps: CastPlayerProps, prevState: CastPlayerState) {
		const { player, activeAccount, profile, closePlayer } = this.props;
		const prevNextItem = prevProps.player && prevProps.player.nextItem;
		const currentNextItem = player && player.nextItem;

		// if next item is loaded for chromecast, get medias for it
		if (currentNextItem && prevNextItem !== currentNextItem) {
			this.loadNextItemMedias();
		}

		const prevItemId = prevState.playerProperties.itemId;
		const currentPlayerProperties = this.state.playerProperties as PlayerProperties;
		const currentItemId = currentPlayerProperties.itemId;

		// if we get custom data from cast player media info update, let's check them
		// this might be switching to next item
		if (prevItemId !== currentItemId && currentItemId) {
			this.checkActiveCastMedia();
		}

		// update mini player with last cast player state when user navigates from watch page to another one
		if (prevProps.pageKey === watchPageKey && !this.isWatchPage()) {
			// update UI with last player state
			this.onStateChanged(this.player.getLastState());
		}

		// when user signed out or changed profile, stop playback on chromecast
		const prevProfileName = prevProps.profile && prevProps.profile.info && prevProps.profile.info.name;
		const profileName = profile && profile.info && profile.info.name;
		if ((prevProps.activeAccount && !activeAccount) || prevProfileName !== profileName) {
			this.player.dispose();
			closePlayer(CAST_PLAYER_ID);
		}
	}

	private loadNextItemMedias() {
		const { player, subscriptionCode, activeAccount } = this.props;
		getItemMedias(player.item, subscriptionCode, activeAccount)
			.then(this.onGetItemMediasSuccess)
			.catch(this.onGetItemMediasFailed);
	}

	private loadNextItem() {
		const { getNextItem, subscriptionCode, player } = this.props;
		getNextItem(player.item.id, CAST_PLAYER_ID, subscriptionCode);
	}

	private canChainPlay() {
		const { activeAccount, player, chainPlayCountdown } = this.props;
		return activeAccount && player && isEpisode(player.item) && chainPlayCountdown > 0;
	}

	private getCastOptions(props: CastPlayerProps): InitPlaybackOptions {
		const { item, data } = props.player;
		const { realVideoPosition, removeRealVideoPosition } = props;

		let startTime = 0;
		if (realVideoPosition && realVideoPosition[item.id]) {
			startTime = realVideoPosition[item.id];
			removeRealVideoPosition(item.id);
		} else {
			startTime = this.getResumePosition(item);
		}

		return {
			item,
			data,
			autoPlay: true,
			startTime
		};
	}

	private getResumePosition(item: api.ItemDetail) {
		if (isTrailer(item)) return 0;
		return getResumePosition(item.id);
	}

	private savePlaybackPosition() {
		const { saveResumePosition, player } = this.props;
		const { currentTime, duration } = this.state.playerProperties as PlayerProperties;
		if (duration && player && player.item) saveResumePosition(player.item, Math.round(currentTime));
	}

	private hasError(): boolean {
		return !!this.state.playerError;
	}

	private isWatchPage() {
		return this.props.pageKey === watchPageKey;
	}

	private isHiddenMiniPlayerPage() {
		const { pageKey } = this.props;
		return (
			pageKey === watchPageKey ||
			pageKey === signInPageKey ||
			pageKey === registerPageKey ||
			pageKey === resetPasswordPageKey
		);
	}

	private isPlayerVisible() {
		const { isConnected, player, isProfileSelectorVisible } = this.props;
		const { playerState } = this.state;
		return (
			isConnected &&
			!isProfileSelectorVisible &&
			!this.isHiddenMiniPlayerPage() &&
			!this.hasError() &&
			player &&
			player.item &&
			(playerState === PlayerState.BUFFERING ||
				playerState === PlayerState.PLAYING ||
				playerState === PlayerState.PAUSED)
		);
	}

	/**
	 * In case we are connected and cast device has active casting session
	 * we should take media info from cast player and update client cast item model
	 * in that case mini player will be updated with proper media info
	 */
	checkActiveCastMedia() {
		const { itemId } = this.state.playerProperties as PlayerProperties;

		// check if custom data exist in player properties
		const { isConnected, player } = this.props;
		const playerId = player && player.item && player.item.id;

		if (isConnected && itemId && playerId !== itemId) {
			// save prev item position
			this.savePlaybackPosition();

			getItem(itemId, { expand: 'all' })
				.then(this.onGetItemSuccess)
				.catch(res => {});
		}
	}

	// check/load next item immediately, when player initialized playback
	// or chain play switch happend
	private checkChainPlayItem() {
		if (this.canChainPlay()) this.loadNextItem();
	}

	private onPlayerInitialized(res: boolean) {
		const { defaultVolume } = this.props;
		this.player.setVolume(defaultVolume);
		this.checkChainPlayItem();
	}

	private onGetItemMediasSuccess = (res: state.MediaResponse) => {
		const { player, chainPlayCountdown } = this.props;
		if (res.media) {
			this.player.loadNextItem({
				item: player.nextItem,
				data: res.media,
				autoPlay: true,
				startTime: 0,
				chainPlayCountdown
			});
		}
	};

	// need to implement error handling
	private onGetItemMediasFailed = (res: state.MediaResponse) => {};

	private onGetItemSuccess = (response: any) => {
		const { openPlayerWithoutMedia } = this.props;
		const item = response.data as api.ItemDetail;
		openPlayerWithoutMedia(item, CAST_PLAYER_ID);
		if (this.isWatchPage()) {
			browserHistory.push(item.watchPath);
		}
		this.checkChainPlayItem();
	};

	private onPlayerProperties = (playerProperties: PlayerProperties) => {
		this.setState(prevState => {
			return { playerProperties: { ...prevState.playerProperties, ...playerProperties } };
		});
	};

	private onStateChanged = (playerState: PlayerState) => {
		const {
			chromecastConnecting,
			chromecastNoDevices,
			chromecastDisconnected,
			chromecastConnected,
			closePlayer
		} = this.props;

		switch (playerState) {
			case PlayerState.SESSION_STARTING:
			case PlayerState.SESSION_RESUMED:
				chromecastConnecting();
				break;
			case PlayerState.CONNECTED:
				chromecastConnected(this.player.getLastProperties().device);
				break;
			case PlayerState.NOT_CONNECTED:
				this.savePlaybackPosition();
				this.player.dispose();
				chromecastDisconnected(CAST_PLAYER_ID);
				break;
			case PlayerState.NO_DEVICES_AVAILABLE:
				this.savePlaybackPosition();
				this.player.dispose();
				chromecastNoDevices();
				break;
			case PlayerState.PAUSED:
				this.savePlaybackPosition();
				this.setState({ playerState });
				break;
			case PlayerState.READY:
				this.savePlaybackPosition();
				this.setState({ playerProperties: {}, playerState });
				closePlayer(CAST_PLAYER_ID);
				break;
			case PlayerState.ENDED:
				this.savePlaybackPosition();
				this.setState({ playerProperties: {}, playerState });
				if (!this.isWatchPage()) closePlayer(CAST_PLAYER_ID);
				break;
			default:
				this.setState({ playerState });
		}
	};

	private onError = error => {
		this.player.dispose();
		// need to implement error handling
		if (!this.hasError()) {
			this.setState({
				playerError: error
			});
		}
	};

	private onPlayerClick = () => {
		const { item } = this.props.player;
		if (item && item.watchPath) {
			browserHistory.push(item.watchPath);
		}
	};

	render() {
		if (this.isPlayerVisible()) {
			return (
				<div className={bem.b()}>
					{this.renderCastPlayerControls()}
					{this.renderMetadata()}
					{this.renderPicture()}
					{this.renderProgress()}
					<button onClick={this.onPlayerClick} className="navigation" />
				</div>
			);
		}

		return !this.props.showIntroduction ? (
			<div />
		) : (
			<div>
				<CastIntro onClick={this.onCloseCastIntroduction} />
			</div>
		);
	}

	private onCloseCastIntroduction = () => {
		// persist user confirmation
		changeCastIntroStatus(true);
		this.props.hideIntroduction();
	};

	private renderCastPlayerControls() {
		return <CastControls player={this.player} playerState={this.state.playerState} />;
	}

	private renderMetadata() {
		const { castDevice, player } = this.props;
		const item = player.item as api.ItemDetail;
		const description = isEpisode(item)
			? item.season && `S${item.season.seasonNumber} E${item.episodeNumber} - ${item.episodeName}`
			: item.shortDescription;

		return (
			<div className={cx(bem.e('meta'), 'truncate')}>
				<IntlFormatter elementType="p" values={{ castDevice }} className="truncate">
					{'@{chromecast_cast_to|Casting to}'}
				</IntlFormatter>

				<h4 className={cx(bem.e('title'), 'truncate')}>{getMetadataTitle(item)}</h4>
				<h4 className={cx(bem.e('description'), 'truncate')}>{description}</h4>
			</div>
		);
	}

	private renderPicture() {
		const { item } = this.props.player;
		const imageOptions: image.Options = { height: 74 };
		const images = resolveImages(item.images, ['wallpaper', 'tile'], imageOptions);
		const sources = images.map(source => convertResourceToSrcSet(source, true));

		return (
			<div className={bem.e('picture')}>
				<Image srcSet={sources} description={item.title} ariaHidden={false} />
			</div>
		);
	}

	private renderProgress() {
		const { currentTime, duration } = this.state.playerProperties as PlayerProperties;
		const progress = duration ? (currentTime / duration) * 100 : 0;

		return <ProgressBar progress={progress} />;
	}
}

function mapStateToProps(state: state.Root) {
	const { player, page, account, app, profile, session } = state;
	const subscriptionCode = (account && account.info && account.info.subscriptionCode) || '';
	const { players, realVideoPosition, cast } = player;
	const { chainPlayCountdown } = app.config.playback;
	const isProfileSelectorVisible = !session.profileSelected && account.info && account.info.profiles.length > 1;
	return {
		subscriptionCode,
		player: players && players[CAST_PLAYER_ID],
		activeAccount: account.active,
		profile,
		isConnected: player.cast.connectionStatus === 'Connected',
		pageKey: page.history.pageSummary.key,
		defaultVolume: player.volume,
		castDevice: player.cast.castDevice,
		chainPlayCountdown: chainPlayCountdown || 0,
		realVideoPosition,
		isProfileSelectorVisible,
		showIntroduction: cast.showIntroduction
	};
}

function mapDispatchToProps(dispatch) {
	return {
		hideIntroduction: () => dispatch(chromecastIntroduction(false)),
		chromecastConnecting: () => dispatch(chromecastConnecting()),
		chromecastNoDevices: () => dispatch(chromecastNoDevices()),
		chromecastConnected: (castDevice: string) => dispatch(chromecastConnected(castDevice)),
		chromecastDisconnected: (playerId: string) => dispatch(chromecastDisconnected(playerId)),
		saveResumePosition: (item: api.ItemSummary, position: number) => dispatch(saveResumePosition(item, position)),
		getNextItem: (itemId: string, playerId: string, sub: string) => dispatch(getNextItem(itemId, playerId, sub)),
		openPlayerWithoutMedia: (item: api.ItemDetail, playerId: string) =>
			dispatch(openPlayerWithoutMedia(item, playerId)),
		closePlayer: (playerId: string) => dispatch(closePlayer(playerId)),
		removeRealVideoPosition: (itemId: string) => dispatch(removeRealVideoPosition(itemId))
	};
}

export default connect<any, any, CastPlayerProps>(
	mapStateToProps,
	mapDispatchToProps
)(CastPlayer);
