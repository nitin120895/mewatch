import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { browserHistory } from 'shared/util/browserHistory';
import {
	PlayerInterface,
	PlayerEventType,
	PlayerState,
	PlayerProperties,
	PlayerError,
	InitCastOptions
} from '../Player';
import { getCastPlayer } from 'ref/responsive/player/cast/getCastPlayer';
import {
	chromecastConnected,
	chromecastMediaChanged,
	chromecastDisconnected,
	getNextItem,
	chromecastConnecting,
	chromecastNoDevices,
	openPlayerWithoutMedia,
	closePlayer,
	removeRealVideoPosition
} from 'shared/app/playerWorkflow';
import { Bem } from 'shared/util/styles';
import CastControls from 'ref/responsive/player/cast/CastControls';
import {
	Watch as watchPageKey,
	SignIn as signInPageKey,
	Register as registerPageKey,
	ResetPassword as resetPasswordPageKey
} from 'shared/page/pageKey';
import { getResumePosition, isAnonymousProfile, getRegisteredProfileInfo } from 'shared/account/profileUtil';
import { isTrailer, isEpisode, getMetadataTitle, isSeriesEpisode } from 'toggle/responsive/util/item';
import { CAST_PLAYER_ID } from 'ref/responsive/player/cast/CastLoader';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Image from 'shared/component/Image';
import { resolveImages } from 'shared/util/images';
import { convertResourceToSrcSet } from 'shared/util/images';
import { getItem } from 'shared/service/content';
import ProgressBar from 'ref/responsive/component/ProgressBar';
import { isChannel } from 'toggle/responsive/util/epg';
import { getItemMedias } from 'toggle/responsive/util/playerUtil';
import { get } from 'shared/util/objects';
import { decodeJwt, findToken } from 'shared/util/tokens';
import { GetAnalyticContextData } from 'shared/analytics/api/shared';
import * as AnalyticUtil from 'shared/analytics/api/util';
import * as VideoApi from 'shared/analytics/api/video';
import { canPlay } from 'toggle/responsive/pageEntry/util/offer';

import 'ref/responsive/player/cast/CastPlayer.scss';

const bem = new Bem('cast-player');

interface CastPlayerProps {
	partnerId: string;
	tokens: api.AccessToken[];
	subscriptionCode?: string;
	player?: state.PlayerItem;
	isProfileSelectorVisible?: boolean;
	pageKey?: string;
	pageTemplate?: string;
	isConnected?: boolean;
	account: api.Account;
	activeAccount?: boolean;
	profile?: state.Profile;
	activeProfile: api.ProfileDetail;
	defaultVolume?: number;
	castDevice?: string;
	chainPlayCountdown?: number;
	chromecastConnecting?: () => void;
	chromecastNoDevices?: () => void;
	chromecastConnected?: (castDevice?: string) => void;
	chromecastMediaChanged?: (playerId: string) => void;
	chromecastDisconnected?: (playerId: string) => void;
	getNextItem?: (itemId: string, site: string, sub: string) => Promise<any>;
	openPlayerWithoutMedia?: (item: api.ItemDetail, playerId: string) => Promise<any>;
	closePlayer?: (playerId: string) => Promise<any>;
	removeRealVideoPosition?: (itemId: string) => void;
	realVideoPosition?: { [itemId: string]: number };
	plans: api.Plan[];
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

	private readonly player: Partial<PlayerInterface>;

	constructor(props) {
		super(props);

		this.player = getCastPlayer();
		this.player.addListener(PlayerEventType.state, this.onStateChanged);
		this.player.addListener(PlayerEventType.error, this.onError);
		this.player.addListener(PlayerEventType.properties, this.onPlayerProperties);
	}

	componentDidMount() {
		// update UI with last player state
		this.onStateChanged(this.player.getLastState());
		this.onPlayerProperties(this.player.getLastProperties());
	}

	componentWillUnmount() {
		if (this.player) {
			this.player.removeListener(PlayerEventType.state, this.onStateChanged);
			this.player.removeListener(PlayerEventType.error, this.onError);
			this.player.removeListener(PlayerEventType.properties, this.onPlayerProperties);
		}
	}

	async componentWillUpdate(nextProps: CastPlayerProps) {
		const { player, isConnected, chromecastMediaChanged } = this.props;
		const currentData = player && player.data;
		const nextPlayer = nextProps.player;

		if (nextProps.isConnected && nextPlayer) {
			// init playback just in case we are connected to chromcast and player media data exist
			if (
				nextPlayer.item &&
				nextPlayer.data &&
				!nextPlayer.error &&
				(currentData !== nextPlayer.data || isConnected !== nextProps.isConnected)
			) {
				await chromecastMediaChanged(CAST_PLAYER_ID);
				this.getCastOptions(nextProps).then(castOptions => {
					this.player.initPlayback(undefined, castOptions).then(res => {
						this.onPlayerInitialized(res);
					});
				});
			}
		}
	}

	componentDidUpdate(prevProps: CastPlayerProps, prevState: CastPlayerState) {
		const { player, activeAccount, profile, closePlayer } = this.props;
		const prevNextItem = prevProps.player && prevProps.player.nextItem;
		const currentNextItem = player && player.nextItem;

		// if next item is loaded for chromecast, get medias for it
		if (currentNextItem && prevNextItem !== currentNextItem) {
			if (canPlay(currentNextItem)) this.loadNextItemMedias();
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
		const prevProfileName = get(prevProps.profile, 'info.name');
		const profileName = get(profile, 'info.name');
		if (player && ((prevProps.activeAccount && !activeAccount) || prevProfileName !== profileName)) {
			this.player.stop(true);
			this.player.dispose();
			closePlayer(CAST_PLAYER_ID);
		}
	}

	private loadNextItemMedias() {
		const { player, subscriptionCode, activeAccount } = this.props;
		const nextItem = player.nextItem;
		const getItemMediasPromise = getItemMedias(nextItem, player.site, subscriptionCode, activeAccount);
		const analyticDataPromise = this.getAnalyticData(nextItem);

		Promise.all([getItemMediasPromise, analyticDataPromise])
			.then(promiseResult => {
				const [mediaResponse, analyticsData] = promiseResult;
				const youbora: VideoApi.KalturaPlayerYouboraPlugin = AnalyticUtil.getYouboraParam(nextItem, analyticsData);
				this.onGetItemMediasSuccess(mediaResponse, youbora);
			})
			.catch(this.onGetItemMediasFailed);
	}

	private loadNextItem() {
		const { getNextItem, subscriptionCode, player } = this.props;
		getNextItem(player.item.id, CAST_PLAYER_ID, subscriptionCode);
	}

	private canChainPlay() {
		const { activeAccount, player, chainPlayCountdown } = this.props;
		return activeAccount && canPlay(player.nextItem) && player && isEpisode(player.item) && chainPlayCountdown > 0;
	}

	private getCastOptions(props: CastPlayerProps): Promise<InitCastOptions> {
		const { item, data } = props.player;
		const { realVideoPosition, removeRealVideoPosition, partnerId } = props;
		const { activeProfile } = this.props;

		let startTime = 0;
		if (realVideoPosition && realVideoPosition[item.id]) {
			startTime = realVideoPosition[item.id];
			removeRealVideoPosition(item.id);
		} else {
			startTime = this.getResumePosition(item);
		}

		return this.getAnalyticData(item).then(analyticsData => {
			const youbora = AnalyticUtil.getYouboraParam(item, analyticsData);
			return Promise.resolve({
				item,
				data,
				autoPlay: true,
				startTime,
				partnerId,
				session: this.getSession(),
				account: activeProfile,
				youbora
			});
		});
	}

	private getAnalyticData(
		item: api.ItemDetail
	): Promise<VideoApi.VideoAnalyticsData | VideoApi.VideoAnalyticsErrorData> {
		const { account, plans, activeProfile, pageTemplate } = this.props;
		const getAnalyticContextData: GetAnalyticContextData = { item, account, plans, activeProfile };
		const videoAnalyticsParams: VideoApi.VideoAnalyticsParams = {
			mediaId: item.customId,
			platform: 'onlinechromecast',
			pageTemplate
		};

		return AnalyticUtil.getAnalyticData(getAnalyticContextData, videoAnalyticsParams);
	}

	private getResumePosition(item: api.ItemDetail) {
		if (isTrailer(item)) return 0;
		return getResumePosition(item.id);
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

	private isEntitlementError = ({ code, message }: api.MediaFileError): boolean => {
		if (code && message) {
			return code === 8001 && message.includes('entitlement');
		}
	};

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

	private onGetItemMediasSuccess = (
		{ media }: state.MediaResponse,
		youbora?: VideoApi.KalturaPlayerYouboraPlugin
	): void => {
		const { player, chainPlayCountdown, partnerId, activeProfile } = this.props;
		if (media) {
			this.player.loadNextItem({
				item: player.nextItem,
				data: media,
				autoPlay: true,
				startTime: 0,
				chainPlayCountdown,
				session: this.getSession(),
				account: activeProfile,
				partnerId,
				youbora
			});
		}
	};

	private getSession = (): string =>
		this.props.profile.info &&
		!isAnonymousProfile(this.props.profile) &&
		decodeJwt(findToken(this.props.tokens, 'UserProfile', 'Catalog')).kalturaSession;

	private onGetItemMediasFailed = ({ error }: state.MediaResponse): void => {
		const { player, partnerId } = this.props;
		if (this.isEntitlementError(error as api.MediaFileError)) {
			this.player.loadNextItemThumbnail({
				item: player.nextItem,
				session: this.getSession(),
				partnerId,
				autoPlay: true
			});
		}
	};

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
				this.player.dispose();
				chromecastDisconnected(CAST_PLAYER_ID);
				break;
			case PlayerState.NO_DEVICES_AVAILABLE:
				this.player.dispose();
				chromecastNoDevices();
				break;
			case PlayerState.PAUSED:
				this.setState({ playerState });
				break;
			case PlayerState.READY:
				this.setState({ playerProperties: {}, playerState });
				closePlayer(CAST_PLAYER_ID);
				break;
			case PlayerState.ENDED:
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
		const itemPath = isChannel(item) ? item.path : item.watchPath;
		if (item && itemPath) {
			browserHistory.push(itemPath);
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

		return <div />;
	}

	private renderCastPlayerControls() {
		return <CastControls player={this.player as PlayerInterface} playerState={this.state.playerState} />;
	}

	private renderMetadata() {
		const { castDevice, player } = this.props;
		const item = player.item as api.ItemDetail;

		let description = '';
		if (isSeriesEpisode(item)) {
			description = `S${item.season.seasonNumber} ${item.episodeName}`;
		} else if (isEpisode(item)) {
			description = item.episodeName;
		}

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

	private returnToWatchPath = () => {
		const { item } = this.props.player;
		let watchPath;
		watchPath = item.type === 'channel' ? item.path : item.watchPath;
		browserHistory.replace(watchPath);
	};

	private renderPicture() {
		const { item } = this.props.player;
		const imageOptions: image.Options = { height: 74 };
		const images = resolveImages(item.images, ['wallpaper', 'tile'], imageOptions);
		const sources = images.map(source => convertResourceToSrcSet(source, true));

		return (
			<div className={bem.e('picture')} onClick={this.returnToWatchPath}>
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
	const { players, realVideoPosition } = player;
	const { chainPlayCountdown } = app.config.playback;
	const isProfileSelectorVisible =
		!session.profileSelected && account.info && account.info.profiles && account.info.profiles.length > 1;
	const plans = (app.config && app.config.subscription && app.config.subscription.plans) || [];

	return {
		partnerId: get(state, 'app.config.playback').kalturaPartnerId,
		tokens: session.tokens,
		subscriptionCode,
		player: players && players[CAST_PLAYER_ID],
		account: account.info,
		activeAccount: account.active,
		profile,
		activeProfile: getRegisteredProfileInfo(profile),
		isConnected: player.cast.connectionStatus === 'Connected',
		pageKey: page.history.pageSummary.key,
		pageTemplate: page.history.pageSummary.template,
		defaultVolume: player.volume,
		castDevice: player.cast.castDevice,
		chainPlayCountdown: chainPlayCountdown || 0,
		realVideoPosition,
		isProfileSelectorVisible,
		plans
	};
}

function mapDispatchToProps(dispatch) {
	return {
		chromecastConnecting: () => dispatch(chromecastConnecting()),
		chromecastNoDevices: () => dispatch(chromecastNoDevices()),
		chromecastConnected: (castDevice: string) => dispatch(chromecastConnected(castDevice)),
		chromecastMediaChanged: (playerId: string) => dispatch(chromecastMediaChanged(playerId)),
		chromecastDisconnected: (playerId: string) => dispatch(chromecastDisconnected(playerId)),
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
