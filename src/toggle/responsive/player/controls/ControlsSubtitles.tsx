import * as React from 'react';
import { connect } from 'react-redux';
import OverlayDropdown, { OverlayDropdownOwnProps } from '../../component/modal/OverlayDropdown';
import { PlayerEventType, PlayerInterface, PlayerSubtitleTrack, PlayerTrackInformation } from '../Player';
import SubtitlesIcon from './icons/SubtitlesIcon';
import { PLAYER_OVERLAY_MODAL_ID } from '../PlayerComponent';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import { isLessThanTabletSize } from '../../util/grid';
import { languageCodeMap } from './languageCodeMap';
import { OPTION_LABEL_OFF } from 'shared/app/localeUtil';
import { UPDATE_PLAYED_SUBTITLE_LANG, changeSubtitleLang } from 'shared/app/playerWorkflow';

import './ControlsSubtitles.scss';

interface OwnProps {
	className?: string;
	player: PlayerInterface;
	linear?: boolean;
	playerId: string;
}

interface StoreProps {
	activeSubtitleLang: state.Player['activeSubtitleLang'];
}

interface DispatchProps {
	showSettingsModal: typeof OpenModal;
	changeSubtitleLang: typeof changeSubtitleLang;
	updatePlayedSubtitleLang: (subtitle?: PlayerTrackInformation) => void;
}

type Props = DispatchProps & OwnProps & StoreProps;

interface State {
	textTracks: PlayerSubtitleTrack[];
	activeLanguage: PlayerSubtitleTrack['lang'];
	initialized: boolean;
}

class ControlsSubtitles extends React.Component<Props, State> {
	ref: Element;

	state = {
		textTracks: this.props.player.getTextTracks(),
		activeLanguage: undefined,
		initialized: false
	};

	componentDidMount() {
		this.updateSubtitleState();
		this.props.player.addListener(PlayerEventType.textTrack, this.onTextTrackChange);
	}

	componentWillUnmount() {
		const { player } = this.props;
		player.removeListener(PlayerEventType.textTrack, this.onTextTrackChange);
	}

	onTextTrackChange = () => {
		this.updateSubtitleState();
	};

	updateSubtitleState() {
		const { player, activeSubtitleLang, updatePlayedSubtitleLang } = this.props;

		const textTracks = player.getTextTracks();
		if (!this.state.initialized) {
			const defaultTextTrack = textTracks.find(track => track.lang === activeSubtitleLang);

			let activeLanguage = OPTION_LABEL_OFF;

			if (defaultTextTrack && defaultTextTrack.label) {
				activeLanguage = defaultTextTrack.lang;
			}

			if (textTracks.length > 0) {
				this.setState({ initialized: true, textTracks, activeLanguage }, () => player.selectSubtitle(activeLanguage));
			}
			if (!this.hasNoSubtitles()) updatePlayedSubtitleLang(defaultTextTrack);
		} else {
			const track = textTracks.find(track => track.active);
			this.setState({
				textTracks,
				activeLanguage: track && track.lang
			});
		}
	}

	checkArrayOnlyHasOff(arr) {
		if (arr.length !== 1) return false;
		return arr[0].id.toLowerCase() === 'off';
	}

	hasNoSubtitles() {
		const { textTracks } = this.state;
		return !textTracks.length || this.checkArrayOnlyHasOff(textTracks);
	}

	render() {
		const { className } = this.props;
		const { activeLanguage } = this.state;

		if (this.hasNoSubtitles()) return <div />;

		return (
			<div ref={element => (this.ref = element)} className={className} onClick={this.toggleOverlay}>
				<SubtitlesIcon />
				{activeLanguage !== OPTION_LABEL_OFF && <div className="tag-icon">{activeLanguage}</div>}
			</div>
		);
	}

	toggleOverlay = () => {
		const { showSettingsModal, linear } = this.props;

		const props: OverlayDropdownOwnProps = {
			id: `${PLAYER_OVERLAY_MODAL_ID}-subtitles`,
			title: '@{subtitles_title|Subtitles}',
			options: this.getOptions(),
			value: this.state.activeLanguage,
			buttonRef: this.ref,
			positionOffsetTop: 20,
			onChange: this.onChange
		};

		showSettingsModal({
			id: `${PLAYER_OVERLAY_MODAL_ID}-subtitles`,
			type: ModalTypes.CUSTOM,
			target: linear && !fullscreenService.isFullScreen() && isLessThanTabletSize() ? 'app' : 'player',
			transparentOverlay: true,
			element: <OverlayDropdown {...props} />
		});
	};

	onChange = option => {
		const { player, updatePlayedSubtitleLang } = this.props;
		player.selectSubtitle(option.value, true);
		updatePlayedSubtitleLang(option);
		this.updateSubtitleLanguage(option.value);
	};

	updateSubtitleLanguage = (subtitleLanguage: string) => {
		const { playerId, changeSubtitleLang } = this.props;
		changeSubtitleLang(playerId, subtitleLanguage);
	};

	getOptions() {
		return this.state.textTracks.map(textTrack => {
			const { label, lang } = textTrack;
			return {
				lang,
				id: lang,
				value: lang,
				label: label || languageCodeMap[lang]
			};
		});
	}
}

function mapStateToProps({ player }: state.Root): StoreProps {
	return {
		activeSubtitleLang: player.activeSubtitleLang
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		showSettingsModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		changeSubtitleLang: (playerId, subtitleLang) => dispatch(changeSubtitleLang(playerId, subtitleLang)),
		updatePlayedSubtitleLang: (subtitle?: PlayerTrackInformation) =>
			dispatch({ type: UPDATE_PLAYED_SUBTITLE_LANG, payload: subtitle })
	};
}

export default connect<StoreProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(ControlsSubtitles);
