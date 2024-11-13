import * as React from 'react';
import { withRouter } from 'react-router';
import CastPlayerComponent from 'ref/responsive/player/cast/CastPlayerComponent';
import { noop } from 'shared/util/function';
import { connect } from 'react-redux';
import { PlayerStandard as template } from 'shared/page/pageEntryTemplate';
import { PlayerError } from '../Player';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { CAST_PLAYER_ID, WithCastPlayerLoader } from 'ref/responsive/player/cast/CastLoader';

const CAST_PLAYER_ERROR_DIALOG_ID = 'cast-player-error-dialog';

interface CastPlayerStandardProps {
	item?: api.ItemDetail;
	player?: state.PlayerItem;
	onBack?: () => void;
	router?: any;
	openModal: (modal: ModalConfig) => void;
	currentProgram?: api.ItemSchedule;
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
			this.showErrorModal(error);
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

		const { item, onBack, currentProgram } = this.props;
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
						currentProgram={currentProgram}
					/>
				)}
			/>
		);
	}

	private showErrorModal(error: PlayerError) {
		this.props.openModal({
			id: CAST_PLAYER_ERROR_DIALOG_ID,
			type: ModalTypes.SYSTEM_ERROR,
			target: 'player',
			onClose: this.props.onBack,
			componentProps: {
				...error,
				className: CAST_PLAYER_ERROR_DIALOG_ID
			}
		});
	}
}

function mapDispatchToProps(dispatch) {
	return {
		openModal: (modal: ModalConfig) => dispatch(OpenModal(modal))
	};
}

const Component: any = connect<CastPlayerStandardProps, any, any>(
	undefined,
	mapDispatchToProps
)(CastPlayerStandard);
Component.template = template;
export default withRouter(Component);
