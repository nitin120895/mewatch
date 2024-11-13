import * as React from 'react';
import { connect } from 'react-redux';
import OverlayDropdown, { OverlayDropdownOwnProps } from '../../component/modal/OverlayDropdown';
import { PlayerInterface, PlayerEventType, PlayerAudioTrack, PlayerTrackInformation } from '../Player';
import AudioLanguageIcon from './icons/GlobeIcon';
import { PLAYER_OVERLAY_MODAL_ID } from '../PlayerComponent';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import { updateProfile } from 'shared/account/accountWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import { isLessThanTabletSize } from '../../util/grid';
import { OPTION_LABEL_OFF } from 'shared/app/localeUtil';
import { languageCodeMap } from './languageCodeMap';
import { getRegisteredProfileInfo } from 'shared/account/profileUtil';
import { UPDATE_PLAYED_AUDIO_LANG } from 'shared/app/playerWorkflow';
import { getItem, setItem } from 'shared/util/localStorage';

export const SELECTED_LANGUAGE = 'selectedLanguage';

interface State {
	audioTracks: PlayerAudioTrack[];
	activeLanguage: PlayerAudioTrack['lang'];
}

interface DispatchProps {
	updatePlayedAudioLang: (audioLang?: PlayerTrackInformation) => void;
	updateProfile: (state: Object) => Promise<any>;
	showSettingsModal: (modal: ModalConfig) => void;
}

interface StateProps {
	profile: api.ProfileDetail;
	isCastActive?: boolean;
}

interface OwnProps extends React.Props<any> {
	className?: string;
	player: PlayerInterface;
	isChannel?: boolean;
	linear?: boolean;
}
type Props = DispatchProps & OwnProps & StateProps;

class ControlsAudioLanguage extends React.Component<Props, State> {
	ref: Element;

	state = {
		audioTracks: this.props.player.getAudioTracks(),
		activeLanguage: undefined
	};

	componentDidMount() {
		this.props.player.addListener(PlayerEventType.audioTrack, this.onAudioTrackChange);
		this.setActiveLanguageState();

		// Set initial audio track (Required for Chromecast)
		if (this.props.isCastActive) {
			this.onAudioTrackChange();
		}
	}

	componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
		if (!this.state.activeLanguage) {
			this.setActiveLanguageState();
		}
	}

	componentWillUnmount() {
		const { player } = this.props;
		player.removeListener(PlayerEventType.textTrack, this.onAudioTrackChange);
	}

	onAudioTrackChange = () => {
		const audioTracks = this.props.player.getAudioTracks();
		const { activeLanguage } = this.state;
		if (!activeLanguage) {
			this.setState({
				audioTracks
			});
		} else {
			const track = audioTracks.find(track => track.active);
			this.setState({
				audioTracks,
				activeLanguage: track && track.lang
			});
		}
	};

	setActiveLanguageState = () => {
		const { player, updatePlayedAudioLang } = this.props;
		const audioTracks = player.getAudioTracks();
		if (audioTracks.length > 0) {
			const activeLanguage = this.getPrimarySelectedOption(audioTracks);
			this.setState({
				activeLanguage
			});

			const audioLanguage = audioTracks.find(track => track.lang === activeLanguage);
			if (audioLanguage && audioTracks.length > 1) updatePlayedAudioLang(audioLanguage);
		}
	};

	getPrimarySelectedOption = (audioTracks: PlayerAudioTrack[]) => {
		const selectedlanguage = getItem(SELECTED_LANGUAGE);
		let selectedLang;
		if (selectedlanguage && selectedlanguage.value) {
			selectedLang = audioTracks.find(track => track.lang === selectedlanguage.value)
				? selectedlanguage.value
				: undefined;
		}

		const { profile, isChannel } = this.props;

		let profileLang;
		if (profile && profile.audioLanguage) {
			profileLang = audioTracks.find(track => track.lang === profile.audioLanguage) ? profile.audioLanguage : undefined;
		}

		const activeTrack = audioTracks.find(track => track.active);
		const activeLang = activeTrack && (activeTrack.lang || 'und');
		const defaultLang = isChannel ? selectedLang || activeLang : selectedLang || profileLang || activeLang;

		// If audio track's language is empty string, selectAudio(defaultLang) will cause endless loop
		if (selectedLang || profileLang) {
			this.props.player.selectAudio(defaultLang);
		}

		return defaultLang;
	};

	render() {
		const { className } = this.props;
		const { audioTracks, activeLanguage } = this.state;

		if (audioTracks.length <= 1 || !activeLanguage) return <div />;
		return (
			<div ref={element => (this.ref = element)} className={className} onClick={this.toggleOverlay}>
				<AudioLanguageIcon />
				{activeLanguage !== OPTION_LABEL_OFF && <div className="tag-icon">{activeLanguage}</div>}
			</div>
		);
	}

	toggleOverlay = () => {
		const { showSettingsModal, linear } = this.props;

		const props: OverlayDropdownOwnProps = {
			id: `${PLAYER_OVERLAY_MODAL_ID}-audio`,
			title: '@{audioLanguage_title|Language}',
			options: this.getOptions(),
			value: this.state.activeLanguage,
			buttonRef: this.ref,
			positionOffsetTop: 20,
			onChange: this.onChange
		};

		showSettingsModal({
			id: `${PLAYER_OVERLAY_MODAL_ID}-audio`,
			type: ModalTypes.CUSTOM,
			target: linear && !fullscreenService.isFullScreen() && isLessThanTabletSize() ? 'app' : 'player',
			transparentOverlay: true,
			element: <OverlayDropdown {...props} />
		});
	};

	onChange = option => {
		const { player, isChannel, profile, updatePlayedAudioLang } = this.props;
		player.selectAudio(option.value, true);
		updatePlayedAudioLang(option);
		if (profile && !isChannel) {
			this.updateAudioLanguage(option.value);
		}
		setItem(SELECTED_LANGUAGE, option);
	};

	updateAudioLanguage = (audioLanguage: string) => {
		const { updateProfile, profile } = this.props;
		const { id, name } = profile;
		const updatedProfile = { id, name, audioLanguage };
		updateProfile(updatedProfile);
	};

	getOptions() {
		return this.state.audioTracks.map(audioTrack => {
			const { lang, label } = audioTrack;
			return {
				lang,
				id: lang,
				value: lang,
				label: label || languageCodeMap[lang]
			};
		});
	}
}

function mapStateToProps(state: state.Root): StateProps {
	const { profile } = state;
	const { connectionStatus } = state && state.player && state.player.cast;
	return {
		profile: getRegisteredProfileInfo(profile),
		isCastActive: connectionStatus === 'Connecting' || connectionStatus === 'Connected'
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		updatePlayedAudioLang: audioLang => dispatch({ type: UPDATE_PLAYED_AUDIO_LANG, payload: audioLang }),
		updateProfile: profile => dispatch(updateProfile(profile)),
		showSettingsModal: (modal: ModalConfig) => dispatch(OpenModal(modal))
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(ControlsAudioLanguage);
