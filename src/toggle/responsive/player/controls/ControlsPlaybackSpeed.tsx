import * as React from 'react';
import { connect } from 'react-redux';

import { isLessThanTabletSize, isMobileLandscape } from 'toggle/responsive/util/grid';
import { PlayerInterface, PlayerPlaybackRateInformation } from 'toggle/responsive/player/Player';

import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import { DEFAULT_PLAYBACK_SPEED, OPTION_LABEL_NORMAL } from 'shared/app/localeUtil';
import { UPDATE_PLAYBACK_SPEED, changePlaybackSpeed } from 'shared/app/playerWorkflow';

import OverlayDropdown, { OverlayDropdownOwnProps } from 'toggle/responsive/component/modal/OverlayDropdown';
import { PLAYER_OVERLAY_MODAL_ID } from 'toggle/responsive/player/PlayerComponent';
import PlaybackSpeedIcon from 'toggle/responsive/player/controls/icons/PlaybackSpeedIcon';

import './ControlsPlaybackSpeed.scss';

interface OwnProps {
	className?: string;
	linear?: boolean;
	player: PlayerInterface;
	playerId: string;
}

interface StoreProps {
	selectedPlaybackSpeed: state.Player['selectedPlaybackSpeed'];
	entryPoint: string;
}

interface DispatchProps {
	showSettingsModal: typeof OpenModal;
	changePlaybackSpeed: typeof changePlaybackSpeed;
	updatePlayedTrackSpeed: (setPlaybackSpeed: PlayerPlaybackRateInformation) => void;
}

type Props = DispatchProps & OwnProps & StoreProps;

interface State {
	activePlaybackSpeed: PlayerPlaybackRateInformation;
	initialized: boolean;
	playbackSpeed: PlayerPlaybackRateInformation[];
}

class ControlsPlaybackSpeed extends React.Component<Props, State> {
	ref: Element;

	state = {
		playbackSpeed: this.props.player && this.props.player.playbackRates(),
		activePlaybackSpeed: undefined,
		initialized: false
	};

	componentDidMount() {
		this.updatePlaybackState();
	}

	componentDidUpdate(prevProps: StoreProps): void {
		const { player, selectedPlaybackSpeed } = this.props;
		if (prevProps.selectedPlaybackSpeed !== selectedPlaybackSpeed) {
			const defaultPlaybackValue = player.playbackRates().find(track => track.value === selectedPlaybackSpeed);
			this.setState({ activePlaybackSpeed: defaultPlaybackValue });
		}
	}

	updatePlaybackState() {
		const { player, selectedPlaybackSpeed, updatePlayedTrackSpeed, entryPoint } = this.props;
		const playbackSpeed = player.playbackRates();

		//  During chainplay if user selected speed is present use that or set default
		const defaultPlaybackValue =
			Array.isArray(playbackSpeed) &&
			playbackSpeed.find(track =>
				entryPoint ? track.value === selectedPlaybackSpeed : track.value === DEFAULT_PLAYBACK_SPEED
			);

		if (typeof defaultPlaybackValue === 'undefined' || !defaultPlaybackValue) return undefined;

		if (playbackSpeed && playbackSpeed.length > 0) {
			this.setState({ playbackSpeed, activePlaybackSpeed: defaultPlaybackValue }, () =>
				player.selectPlaybackSpeed(defaultPlaybackValue.value)
			);
		}

		updatePlayedTrackSpeed(defaultPlaybackValue);
	}

	toggleOverlay = () => {
		const { player, showSettingsModal, linear } = this.props;

		// Below condition is to prevent the modal popup from auto closing for mobile, as in the current flow
		// when pause is triggered all the player popups are cleared causing the playback speed popup to close
		const isMobileOrTabletOverlay =
			isMobileLandscape() || isLessThanTabletSize() ? 'mobile-controls' : PLAYER_OVERLAY_MODAL_ID;

		const props: OverlayDropdownOwnProps = {
			id: `${isMobileOrTabletOverlay}-playbackSpeed`,
			title: '@{playback_speed|Playback Speed}',
			options: this.state.playbackSpeed,
			value: this.state.activePlaybackSpeed && this.state.activePlaybackSpeed.value,
			buttonRef: this.ref,
			positionOffsetTop: 20,
			onChange: this.onChange,
			onClose: this.onModalClose
		};

		showSettingsModal({
			id: `${isMobileOrTabletOverlay}-playbackSpeed`,
			type: ModalTypes.CUSTOM,
			target: linear && !fullscreenService.isFullScreen() && isLessThanTabletSize() ? 'app' : 'player',
			transparentOverlay: true,
			element: <OverlayDropdown {...props} />
		});

		player.pause && player.pause();
	};

	onModalClose = () => {
		const { player } = this.props;
		player.play && player.play();
	};

	onChange = (option: PlayerPlaybackRateInformation) => {
		const { player, updatePlayedTrackSpeed } = this.props;
		player.selectPlaybackSpeed(option.value);
		updatePlayedTrackSpeed(option);
		this.updatePlaybackSpeed(option.value);
		this.setState({
			activePlaybackSpeed: option
		});
		player.play && player.play();
	};

	updatePlaybackSpeed = (selectedPlaybackSpeed: number) => {
		const { playerId, changePlaybackSpeed } = this.props;
		changePlaybackSpeed(playerId, selectedPlaybackSpeed);
	};

	render() {
		const { className } = this.props;
		const { activePlaybackSpeed, playbackSpeed } = this.state;

		if (!playbackSpeed.length) return <div />;

		return (
			<div ref={element => (this.ref = element)} className={className} onClick={this.toggleOverlay}>
				<PlaybackSpeedIcon />
				{activePlaybackSpeed && activePlaybackSpeed.label !== OPTION_LABEL_NORMAL && (
					<div className="tag-icon">{activePlaybackSpeed.label}</div>
				)}
			</div>
		);
	}
}

function mapStateToProps({ player }: state.Root): StoreProps {
	return {
		selectedPlaybackSpeed: player.selectedPlaybackSpeed,
		entryPoint: player.entryPoint
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		showSettingsModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		changePlaybackSpeed: (playerId, trackSpeed) => dispatch(changePlaybackSpeed(playerId, trackSpeed)),
		updatePlayedTrackSpeed: (playbackSpeed?: PlayerPlaybackRateInformation) =>
			dispatch({ type: UPDATE_PLAYBACK_SPEED, payload: playbackSpeed })
	};
}

export default connect<StoreProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(ControlsPlaybackSpeed);
