import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { browserHistory } from 'shared/util/browserHistory';
import { isClearKeyContentBrowser, isIE11, isIOS, isBrave, isAndroid } from 'shared/util/browser';
import * as PropTypes from 'prop-types';
import { closePlayer, getStartoverMedia, openPlayer, resetPlayerErrors } from 'shared/app/playerWorkflow';
import { AnalyticsContext } from 'shared/analytics/types/types';
import { PlayerStandard as template } from 'shared/page/pageEntryTemplate';
import { OfflineStatus } from 'shared/app/offlineStatus';
import { noop } from 'shared/util/function';
import { VideoError, VideoErrorCode } from 'shared/util/VideoError';
import { PlayerError } from './Player';
import PlayerComponent from './PlayerComponent';
import { Errors, getPlayerErrorByServiceError } from './playerErrors';
import { VideoPlayerActions } from 'shared/analytics/types/playerStatus';
import { OpenModal, CloseModal, HideAllModals } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import {
	PLAYBACK_ADAPTER_LOAD_FAILED,
	PLAYBACK_CONTENT_NO_PLAY_SOURCE,
	PLAYBACK_CONTENT_UNSUPPORTED_BY_BROWSER,
	PLAYBACK_DEVICE_LIMIT_REACHED_ERROR,
	PLAYBACK_FILES_FAILED_TO_FETCH,
	PLAYBACK_HDCP_FAILED,
	PLAYBACK_NO_ENTITLEMENT,
	PLAYBACK_REQUEST_FILTER_ERROR
} from 'shared/util/errorCodes';
import SubscriptionOverlay from '../pageEntry/channelDetail/components/SubscriptionOverlay';
import RestrictionError from '../pageEntry/channelDetail/components/RestrictionError';
import { get } from 'shared/util/objects';
import { isEmbeddable } from 'toggle/responsive/util/item';
import {
	FULLSCREEN_QUERY_PARAM,
	PLAYER_ERROR_DIALOG_ID,
	isItemVr,
	isVideoDRMRestricted,
	isItem4K,
	DEVICE_LIMIT_REACHED
} from 'toggle/responsive/util/playerUtil';
import ModalManager from 'toggle/responsive/app/modal/ModalManager';
import { getItem } from 'shared/util/localStorage';
import { addQueryParameterToURL, QueryParams } from 'shared/util/urls';

interface OwnProps {
	item?: api.ItemDetail;
	id: string;
	src: string;
	imagePlaceHolder: string;
	onClose?: () => void;
	onBack?: () => void;
	router?: any;
	noUiControls?: boolean;
	currentProgram?: api.ItemSchedule;
	list?: api.ItemList;
	linear?: boolean;
	embed?: boolean;
	autoplay?: boolean;
	onError?: (error: PlayerError) => void;
	startover?: boolean;
	onToggleStartoverMode?: () => void;
	container?: HTMLDivElement;
	location: HistoryLocation;
	autoplayHero?: boolean;
}

interface StateProps {
	player: state.PlayerItem;
	limitationError?: object | undefined;
	subscriptionCode?: string;
	config?: state.Config;
	startoverProgram?: api.ItemSchedule;
	activeAccount?: boolean;
}

interface DispatchProps {
	openPlayer: (
		item: api.ItemDetail,
		playerId: string,
		subscriptionCode?: string,
		startover?: boolean,
		startoverProgram?: api.ItemSchedule
	) => Promise<any>;
	closePlayer: (playerId: string) => void;
	openModal: (modal: ModalConfig) => void;
	closeModal: (id: string) => void;
	hideAllModals: () => void;
	getStartoverMedia: (item: api.ItemSummary, customId: any, site: string, subscriptionCode?: string) => Promise<any>;
	resetPlayerErrors: () => void;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
	autoFullscreen: boolean;
	playerError: PlayerError;
	entitledError: boolean;
}

class PlayerStandard extends React.Component<Props, State> {
	static defaultProps = {
		onClose: noop,
		onBack: noop,
		noUiControls: false,
		autoplay: true,
		embed: false
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			autoFullscreen: false,
			playerError: undefined,
			entitledError: undefined
		};
	}

	static contextTypes = {
		offlineStatus: PropTypes.object.isRequired,
		emitVideoEvent: PropTypes.func
	};

	context: {
		offlineStatus: OfflineStatus;
		emitVideoEvent: AnalyticsContext['emitVideoEvent'];
	};

	componentDidMount() {
		const { location } = this.props;
		const isMaxDeviceReached = getItem(DEVICE_LIMIT_REACHED);
		const query: QueryParams = get(location, 'query');
		const shouldToggleFullscreen = query && FULLSCREEN_QUERY_PARAM in query;
		if (shouldToggleFullscreen) {
			this.setState({ autoFullscreen: true });
			delete query[FULLSCREEN_QUERY_PARAM];
			browserHistory.replace(addQueryParameterToURL(location.pathname, query));
		}

		if (isMaxDeviceReached) {
			this.showError(getPlayerErrorByServiceError({ code: PLAYBACK_DEVICE_LIMIT_REACHED_ERROR }));
		} else if (!this.hasError()) {
			this.context.offlineStatus.subscribe(this.onConnectivityChange);
			this.onConnectivityChange(this.context.offlineStatus);
			this.openVideoPlayer();
		}
	}

	componentWillReceiveProps(nextProps: Props) {
		const { player, linear, item, embed } = this.props;

		if (embed) {
			if (!isEmbeddable(item)) {
				this.showEmbeddingError();
			}
		}

		if (player && !player.error && nextProps.player && nextProps.player.error) {
			this.context.emitVideoEvent({
				type: 'action',
				action: VideoPlayerActions.Error,
				data: { error: new VideoError('Service Error', VideoErrorCode.PlayerError) }
			});
			if (linear && this.hasNoEntitlementPlaybackError(nextProps.player)) {
				this.setState({ entitledError: true });
			} else {
				this.showServiceError(nextProps.player.error);
			}
		}

		// need to reset previous `entitledError` TRUE state if playback is available now
		if (this.state.entitledError && !this.hasNoEntitlementPlaybackError(nextProps.player)) {
			this.setState({ entitledError: false });
		}

		if (nextProps.limitationError) {
			this.showError(getPlayerErrorByServiceError(nextProps.limitationError));
		}
	}

	componentDidUpdate(prevProps: Props) {
		const { player, onBack, item, startover, linear } = this.props;
		// Return to Item Detail page if pin modal is closed;
		if (prevProps.player && !player && !linear) onBack();

		const prevId = get(prevProps, 'item.id');
		if ((item && prevId !== item.id) || prevProps.startover !== startover) {
			this.openVideoPlayer();
		}
	}

	componentWillUnmount() {
		this.context.offlineStatus.unsubscribe(this.onConnectivityChange);
		const { closePlayer, id } = this.props;
		closePlayer(id);
	}

	private openVideoPlayer() {
		const { id, openPlayer, subscriptionCode, item, startover, currentProgram, autoplayHero } = this.props;
		if (autoplayHero === false) return;
		if (item) openPlayer(item, id, subscriptionCode, startover, currentProgram);
	}

	private showServiceError(serviceError: any) {
		this.showError(getPlayerErrorByServiceError(serviceError));
	}

	private showEmbeddingError() {
		this.showError(Errors.embeddingUnavailable);
	}

	private showOfflineError() {
		this.showError(Errors.offline);
	}

	private showError(error: PlayerError) {
		const { linear, embed, onError } = this.props;
		if (!this.hasError() && !this.props.noUiControls) {
			linear && !embed ? onError(error) : this.showErrorModal(error);
			this.setState({
				playerError: error
			});
		}
	}
	private hasError(): boolean {
		return !!this.state.playerError;
	}

	private hasDRMProtectionError() {
		const { item } = this.props;
		const isDRMUnsupportedBrowser = isIE11() || isClearKeyContentBrowser() || (isBrave() && isAndroid());
		return isVideoDRMRestricted(item) && isDRMUnsupportedBrowser;
	}

	private has360VideoPlaybackError() {
		const { item } = this.props;
		return isItemVr(item) && isIOS();
	}

	private onPlayerError = error => {
		const errorDataCode = get(error, 'payload.data.code');
		const errorPayloadCode = get(error, 'payload.code');

		if (errorDataCode === PLAYBACK_REQUEST_FILTER_ERROR) {
			this.showError(Errors.unsupportedDevice);
			return;
		}

		switch (errorPayloadCode) {
			case PLAYBACK_CONTENT_UNSUPPORTED_BY_BROWSER:
			case PLAYBACK_ADAPTER_LOAD_FAILED:
			case PLAYBACK_CONTENT_NO_PLAY_SOURCE:
			case PLAYBACK_FILES_FAILED_TO_FETCH:
				const { item } = this.props;
				if (isItem4K(item)) {
					this.showError(Errors.unsupportedContent);
					return;
				}
				break;
			case PLAYBACK_HDCP_FAILED:
				this.showError(Errors.hdcp);
				return;
			default:
				break;
		}

		this.showError(Errors.player);
	};

	private onNavigate = (path: string) => {
		if (!!path) {
			this.props.router.replace(path);
		}
	};

	private onConnectivityChange = (offlineStatus: OfflineStatus) => {
		if (offlineStatus.isOffline()) {
			this.showOfflineError();
		}
	};

	render() {
		return (
			<div>
				{this.renderOverlayAndPlayer()}
				<ModalManager onModalActive={noop} scope="player" />
				<ModalManager onModalActive={noop} scope="linearPlayer" />
			</div>
		);
	}

	private renderOverlayAndPlayer() {
		const { item, noUiControls } = this.props;
		if (this.hasError() && !noUiControls) return false;
		if (this.state.entitledError) return <SubscriptionOverlay item={item} />;

		if (this.has360VideoPlaybackError() || this.hasDRMProtectionError())
			return <RestrictionError item={item} title={item.title} />;

		return this.renderPlayerComponent();
	}

	private renderPlayerComponent() {
		const {
			item,
			player,
			id,
			onBack,
			noUiControls,
			currentProgram,
			list,
			embed,
			linear,
			autoplay,
			startover,
			startoverProgram,
			onToggleStartoverMode
		} = this.props;
		if (!item) return <div />;
		return (
			<PlayerComponent
				autoFullscreen={this.state.autoFullscreen}
				item={item}
				data={player && player.data}
				autoPlay={autoplay}
				playerId={id}
				onError={this.onPlayerError}
				onBack={onBack}
				onNavigate={this.onNavigate}
				noUiControls={noUiControls}
				currentProgram={startover && startoverProgram ? startoverProgram : currentProgram}
				list={list}
				linear={linear}
				embed={embed}
				startover={startover}
				onToggleStartoverMode={onToggleStartoverMode}
			/>
		);
	}

	private showErrorModal(playerError: PlayerError) {
		this.props.openModal({
			id: PLAYER_ERROR_DIALOG_ID,
			type: ModalTypes.SYSTEM_ERROR,
			onClose: this.onErrorModalClose,
			componentProps: {
				...playerError,
				className: PLAYER_ERROR_DIALOG_ID
			}
		});
	}

	onErrorModalClose = () => {
		this.props.resetPlayerErrors();
		this.props.onBack();
	};

	private hasNoEntitlementPlaybackError(player: state.PlayerItem): boolean {
		return player.error && (player.error.code === PLAYBACK_NO_ENTITLEMENT || player.error.status === 401);
	}
}

function mapStateToProps(state: state.Root, ownProps): StateProps {
	const sub = state.account.info ? state.account.info.subscriptionCode : '';
	const players = state.player.players;
	const limitationError = get(state, 'player.limitationError');
	return {
		player: players && players[ownProps.id],
		startoverProgram: state.player.startoverProgram,
		limitationError,
		subscriptionCode: sub,
		config: state.app.config
	};
}

function mapDispatchToProps(dispatch: Dispatch<any>): DispatchProps {
	return {
		openPlayer: (
			item: api.ItemDetail,
			playerId: string,
			subscriptionCode?: string,
			startover?: boolean,
			startoverProgram?: api.ItemSchedule
		) => dispatch(openPlayer(item, playerId, subscriptionCode, startover, startoverProgram)),
		closePlayer: (playerId: string) => dispatch(closePlayer(playerId)),
		openModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		hideAllModals: () => dispatch(HideAllModals()),
		getStartoverMedia: (item: api.ItemSummary, customId: string, site: string, subscriptionCode: string) =>
			dispatch(getStartoverMedia(item, customId, site, subscriptionCode)),
		resetPlayerErrors: () => dispatch(resetPlayerErrors())
	};
}

const Component: any = connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(PlayerStandard);
Component.template = template;

export default withRouter(Component);
