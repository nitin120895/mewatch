import * as React from 'react';
import { connect } from 'react-redux';
import OverlayEpisodeSelector, { OverlayEpisodeSelectorOwnProps } from '../../component/modal/OverlayEpisodeSelector';
import EpisodeListIcon from './icons/EpisodeListIcon';
import { PlayerInterface, PlayerState } from '../Player';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import { isMobileSize } from '../../util/grid';
import { get } from 'shared/util/objects';

const OVERLAY_EPISODE_SELECTOR_ID = 'overlay-episode-selector';

interface ControlsEpisodeListDispatchProps extends React.Props<any> {
	showEpisodeListModal: (modal: ModalConfig) => void;
}
interface ControlsEpisodeListOwnProps extends React.Props<any> {
	className?: string;
	item: api.ItemDetail;
	player: PlayerInterface;
	currentTime: number;
	duration: number;
	linear?: boolean;
}

type ControlsEpisodeListProps = ControlsEpisodeListDispatchProps & ControlsEpisodeListOwnProps;

class ControlsEpisodeList extends React.Component<ControlsEpisodeListProps> {
	ref: Element;

	render() {
		const {
			className,
			item: { type }
		} = this.props;
		const properType = type === 'season' || type === 'show' || type === 'episode';
		if (!properType) return false;

		return (
			<div ref={element => (this.ref = element)} className={className} onClick={this.toggleOverlay}>
				<EpisodeListIcon />
			</div>
		);
	}

	toggleOverlay = () => {
		const { player, duration, currentTime, item, showEpisodeListModal, linear } = this.props;
		const seasons = get(item, 'season.show.seasons.items') || [];
		const lastPlayerState = player.getLastState();
		const shouldResume = lastPlayerState === PlayerState.PLAYING;
		player.pause();

		const toggleOverlayEpisodeSelector = this.toggleOverlay;
		const props: OverlayEpisodeSelectorOwnProps = {
			seasons,
			selectedSeason: item.season,
			item,
			currentProgress: ((currentTime / duration) * 100).toFixed(),
			buttonRef: this.ref,
			onDissmiss: () => {
				shouldResume && player.play();
			},
			id: OVERLAY_EPISODE_SELECTOR_ID,
			toggleOverlayEpisodeSelector
		};

		showEpisodeListModal({
			id: OVERLAY_EPISODE_SELECTOR_ID,
			type: ModalTypes.CUSTOM,
			target: linear && !fullscreenService.isFullScreen() && isMobileSize() ? 'app' : 'player',
			element: <OverlayEpisodeSelector {...props} />,
			onClose: () => {
				shouldResume && player.play();
			},
			enableScroll: true
		});
	};
}

function mapDispatchToProps(dispatch) {
	return {
		showEpisodeListModal: (modal: ModalConfig) => dispatch(OpenModal(modal))
	};
}

export default connect<{}, ControlsEpisodeListDispatchProps, ControlsEpisodeListOwnProps>(
	undefined,
	mapDispatchToProps
)(ControlsEpisodeList);
