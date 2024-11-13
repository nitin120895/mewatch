import * as PropTypes from 'prop-types';
import * as React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'shared/util/browserHistory';

import { VideoPlayerActions } from 'shared/analytics/types/playerStatus';
import { AnalyticsContext } from 'shared/analytics/types/types';
import { OfflineStatus } from 'shared/app/offlineStatus';
import * as PlayerActions from 'shared/app/playerWorkflow';
import { PlayerStandard as template } from 'shared/page/pageEntryTemplate';
import * as ModalActions from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { noop } from 'shared/util/function';
import { VideoError } from 'shared/util/VideoError';
import { mapServiceErrorCodeToVideoErrorCode } from 'shared/util/errorCodes';
import { PlayerError } from './Player';
import PlayerComponent from './PlayerComponent';
import { Errors, getPlayerErrorByServiceError } from './playerErrors';

interface PlayerStandardProps {
	item?: api.ItemDetail;
	id: string;
	player: state.PlayerItem;
	subscriptionCode?: string;
	src: string;
	imagePlaceHolder: string;
	openPlayer: (item: api.ItemDetail, playerId: string, subscriptionCode?: string) => Promise<any>;
	closePlayer: (playerId: string) => Promise<any>;
	onClose?: () => void;
	openModal?: (config: ModalConfig) => void;
	onBack?: () => void;
}

interface PlayerStandardState {
	playerError: PlayerError;
}

class PlayerStandard extends React.Component<PlayerStandardProps, PlayerStandardState> {
	static defaultProps = {
		onClose: noop,
		onBack: noop
	};

	state = {
		playerError: undefined
	};

	static contextTypes = {
		offlineStatus: PropTypes.object.isRequired,
		emitVideoEvent: PropTypes.func
	};

	context: {
		offlineStatus: OfflineStatus;
		emitVideoEvent: AnalyticsContext['emitVideoEvent'];
	};

	componentDidMount() {
		if (!this.hasError()) {
			this.context.offlineStatus.subscribe(this.onConnectivityChange);
			this.onConnectivityChange(this.context.offlineStatus);
			this.openVideoPlayer();
		}
	}

	componentWillReceiveProps(nextProps: PlayerStandardProps) {
		const { player } = this.props;
		if (player && !player.error && nextProps.player && nextProps.player.error) {
			const videoErrorCode = mapServiceErrorCodeToVideoErrorCode(nextProps.player.error);
			this.context.emitVideoEvent({
				type: 'action',
				action: VideoPlayerActions.Error,
				data: { error: new VideoError('Service Error', videoErrorCode), item: nextProps.item }
			});
			this.showServiceError(nextProps.player.error);
		}
	}

	componentDidUpdate(prevProps: PlayerStandardProps) {
		const { player, onBack, item } = this.props;
		if (prevProps.player && !player) onBack();
		if (prevProps.item !== item && item) this.openVideoPlayer();
	}

	componentWillUnmount() {
		const { closePlayer, id } = this.props;
		closePlayer(id);
	}

	private openVideoPlayer() {
		const { id, openPlayer, subscriptionCode, item } = this.props;
		if (item) openPlayer(item, id, subscriptionCode);
	}

	private showServiceError(serviceError: any) {
		this.showError(getPlayerErrorByServiceError(serviceError));
	}

	private showOfflineError() {
		this.showError(Errors.offline);
	}

	private showError(error: PlayerError) {
		if (!_SSR_ && !this.hasError()) {
			this.showErrorModal(error);
			this.setState({
				playerError: error
			});
		}
	}

	private showErrorModal(error: PlayerError) {
		this.props.openModal({
			id: 'player',
			type: ModalTypes.SYSTEM_ERROR,
			onClose: this.props.onBack,
			componentProps: {
				...error
			}
		});
	}

	private hasError(): boolean {
		return !!this.state.playerError;
	}

	private onPlayerError = (error: Error) => {
		this.showError(error.message === 'Browser Not Supported' ? Errors.browser : Errors.player);
	};
	private onNavigate = (path: string) => {
		if (!!path) {
			browserHistory.push(path);
		}
	};

	private onConnectivityChange = (offlineStatus: OfflineStatus) => {
		if (offlineStatus.isOffline()) {
			this.showOfflineError();
		}
	};

	render() {
		if (this.hasError()) return false;
		return this.renderPlayerComponent();
	}

	private renderPlayerComponent() {
		const { item, player, id, onBack } = this.props;
		if (!item) return <div />;
		return (
			<PlayerComponent
				item={item}
				data={player && player.data}
				playerId={id}
				onError={this.onPlayerError}
				onBack={onBack}
				onNavigate={this.onNavigate}
			/>
		);
	}
}

function mapStateToProps(state: state.Root, ownProps): any {
	const { account, player } = state;
	const sub = account.info ? account.info.subscriptionCode : '';
	const players = player.players;
	return {
		player: players && players[ownProps.id],
		subscriptionCode: sub
	};
}

const actions = {
	openPlayer: PlayerActions.openPlayer,
	closePlayer: PlayerActions.closePlayer,
	openModal: ModalActions.OpenModal
};

const Component: any = connect<PlayerStandardProps, any, any>(
	mapStateToProps,
	actions
)(PlayerStandard);
Component.template = template;

export default Component;
