import * as React from 'react';
import { connect } from 'react-redux';
import OverlayDropdown, { OverlayDropdownOwnProps } from '../../component/modal/OverlayDropdown';
import SettingsIcon from './icons/SettingsIcon';
import { KalturaPlayerTrack, PlayerInterface, PlayerEventType } from '../Player';
import { PLAYER_OVERLAY_MODAL_ID } from '../PlayerComponent';
import { UPDATE_VIDEO_QUALITY } from 'shared/app/playerWorkflow';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { isLessThanTabletSize } from '../../util/grid';
import { HD, SD } from 'shared/app/localeUtil';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';

import './ControlsSettings.scss';

const MIN_HD_WIDTH = 720;
const MIN_SD_WIDTH = 480;
const AUTO = 'auto';
export const AUTO_LABEL = 'Auto';

interface State {
	videoTracks: KalturaPlayerTrack[];
	isAuto: boolean;
}
interface DispatchProps extends React.Props<any> {
	showSettingsModal: (modal: ModalConfig) => void;
	updateVideoQuality: (quality?: string) => void;
}
interface OwnProps extends React.Props<any> {
	className?: string;
	player: PlayerInterface;
	linear?: boolean;
}
type Props = DispatchProps & OwnProps;

class ControlsSettings extends React.Component<Props, State> {
	state = {
		videoTracks: [],
		isAuto: true
	};
	ref: Element;

	componentDidMount() {
		const { player, updateVideoQuality } = this.props;
		player.addListener(PlayerEventType.videoTrack, this.onVideoTrackChange);
		updateVideoQuality(AUTO_LABEL);
		const videoTracks = player.getVideoTracks();
		this.setState({ videoTracks });
	}

	componentWillUnmount() {
		const { player } = this.props;
		player.removeListener(PlayerEventType.videoTrack, this.onVideoTrackChange);
	}

	onVideoTrackChange = () => {
		this.setState({ videoTracks: this.props.player.getVideoTracks() });
	};

	render() {
		const { className } = this.props;
		const { videoTracks } = this.state;

		if (videoTracks.length <= 1) return <div />;

		const selectedOption = videoTracks.find(track => track._active);
		const height = selectedOption._height;

		return (
			<div ref={element => (this.ref = element)} className={className} onClick={this.toggleOverlay}>
				<SettingsIcon />
				{this.renderIcon(height)}
			</div>
		);
	}

	toggleOverlay = () => {
		const { isAuto, videoTracks } = this.state;
		const { showSettingsModal, linear } = this.props;
		const selectedOption = isAuto ? AUTO : videoTracks.find(track => track._active).index;

		const props: OverlayDropdownOwnProps = {
			id: `${PLAYER_OVERLAY_MODAL_ID}-settings`,
			title: '@{videoQuality_title|Video Quality}',
			options: this.getOptions(),
			value: selectedOption,
			buttonRef: this.ref,
			positionOffsetTop: 20,
			onChange: this.onChange,
			customRenderer: this.renderItem
		};

		showSettingsModal({
			id: `${PLAYER_OVERLAY_MODAL_ID}-settings`,
			type: ModalTypes.CUSTOM,
			target: linear && !fullscreenService.isFullScreen() && isLessThanTabletSize() ? 'app' : 'player',
			transparentOverlay: true,
			element: <OverlayDropdown {...props} />
		});
	};

	renderItem = item => {
		const { label, value } = item;
		const height = value._height;

		return (
			<div id={label} className="video-type">
				<span>{label}</span>
				{this.renderIcon(height)}
			</div>
		);
	};

	renderIcon = (height: number) => {
		if (!height || height < MIN_SD_WIDTH) return;
		return <span className="tag-icon"> {height >= MIN_HD_WIDTH ? HD : SD}</span>;
	};

	onChange = option => {
		const { player, updateVideoQuality } = this.props;
		if (option.id === AUTO) {
			player.selectVideo();
			this.setState({ isAuto: true });
		} else {
			player.selectVideo(option.value);
			this.setState({ isAuto: false });
		}
		updateVideoQuality(option.label);
	};

	getOptions() {
		const options = this.state.videoTracks
			.map(videoTrack => {
				const { index, _label, _height } = videoTrack;
				return {
					value: videoTrack,
					id: index,
					label: _label || `${_height}p`
				};
			})
			.reverse();
		options.push({
			value: AUTO,
			id: AUTO,
			label: AUTO_LABEL
		});
		return options;
	}
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		showSettingsModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		updateVideoQuality: (quality?: string) => dispatch({ type: UPDATE_VIDEO_QUALITY, payload: quality })
	};
}

export default connect<{}, DispatchProps, OwnProps>(
	undefined,
	mapDispatchToProps
)(ControlsSettings);
