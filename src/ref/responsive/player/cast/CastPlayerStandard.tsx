import * as React from 'react';
import { withRouter } from 'react-router';
import CastPlayerComponent from './CastPlayerComponent';
import { noop } from 'shared/util/function';
import { connect } from 'react-redux';
import { PlayerStandard as template } from 'shared/page/pageEntryTemplate';
import { CAST_PLAYER_ID, WithCastPlayerLoader } from './CastLoader';
import { PlayerError } from '../Player';
import ModalTypes from 'shared/uiLayer/modalTypes';
import * as ModalActions from 'shared/uiLayer/uiLayerWorkflow';

interface CastPlayerStandardProps {
	item?: api.ItemDetail;
	player?: state.PlayerItem;
	onBack?: () => void;
	openModal?: (config: ModalConfig) => void;
	router?: any;
}

interface CastPlayerStandardState {
	playerError: PlayerError;
}

class CastPlayerStandard extends React.Component<CastPlayerStandardProps, CastPlayerStandardState> {
	static defaultProps = {
		onBack: noop
	};

	state = {
		playerError: undefined
	};

	private hasError(): boolean {
		return !!this.state.playerError;
	}

	private showError(error: PlayerError) {
		if (!this.hasError()) {
			this.props.openModal({
				id: 'player',
				type: ModalTypes.SYSTEM_ERROR,
				onClose: this.props.onBack,
				componentProps: {
					...error
				}
			});
			this.setState({
				playerError: error
			});
		}
	}

	private onPlayerError = (error: PlayerError) => {
		this.showError(error);
	};

	private onNavigate = (path: string) => {
		if (!!path) {
			this.props.router.push(path);
		}
	};

	render() {
		if (this.hasError()) return false;

		const { item, onBack } = this.props;
		return (
			<WithCastPlayerLoader
				render={player => (
					<CastPlayerComponent
						castPlayer={player}
						item={item}
						onError={this.onPlayerError}
						onBack={onBack}
						onNavigate={this.onNavigate}
						playerId={CAST_PLAYER_ID}
					/>
				)}
			/>
		);
	}
}

const actions = {
	openModal: ModalActions.OpenModal
};

const Component: any = connect<CastPlayerStandardProps, any, any>(
	undefined,
	actions
)(CastPlayerStandard);
Component.template = template;
export default withRouter(Component);
