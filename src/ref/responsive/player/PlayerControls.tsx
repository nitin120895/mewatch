import * as cx from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { saveResumePosition } from 'shared/account/profileWorkflow';
import { saveVolume } from 'shared/app/playerWorkflow';
import { KEY_CODE } from 'shared/util/keycodes';
import { debounce, throttle } from 'shared/util/performance';
import ControlsPlayToggle from './controls/ControlsPlayToggle';
import ControlsScrubber from './controls/ControlsScrubber';
import ControlsSelector from './controls/ControlsSelector';
import ControlsTime from './controls/ControlsTime';
import ControlsTimeLabel from './controls/ControlsTimeLabel';
import ControlsVolume from './controls/ControlsVolume';
import { PlayerAction, PlayerInterface, PlayerProperties, PlayerState } from './Player';
import ControlsFullScreen from './controls/ControlsFullScreen';
import { Bem } from 'shared/util/styles';
import { CastButtonLoader } from './cast/CastLoader';
import { isFullScreen } from './playerUtils';

import './PlayerControls.scss';

interface PlayerControlsProps {
	playerState: PlayerState;
	player: PlayerInterface;
	item: api.ItemSummary;
	saveResumePosition?: (item: api.ItemSummary, position: number) => void;
	currentTime: number;
	duration: number;
	castIntroLayer?: boolean;
	saveVolume?: (volume: number) => void;
	defaultVolume?: number;
	castActive?: boolean;
	toggleFullScreen?: () => void;
	togglePlayback?: () => void;
	strings?: { [key: string]: string };
}

interface PlayerControlsState {
	isVolumeScrubberVisible?: boolean;
}

const bemPlayerControls = new Bem('player-controls');
const bemPlayerButtons = new Bem('player-buttons');
const bemPlayerButton = new Bem('player-button');
const bemPlayerScrubber = new Bem('player-scrubber');

const SEEK_DEBOUNCE_TIME_MS = 125;
const PLAYER_SEEK_STEP = 10;

class PlayerControls extends React.Component<PlayerControlsProps, PlayerControlsState & PlayerProperties> {
	state = {
		currentTime: 0,
		duration: 0,
		isVolumeScrubberVisible: false
	};

	componentDidMount() {
		const { player, defaultVolume } = this.props;
		player.setVolume(defaultVolume);

		window.addEventListener('keydown', this.onKeyDown, false);
		document.addEventListener('fullscreenchange', this.onFullScreenChange, false);
		document.addEventListener('webkitfullscreenchange', this.onFullScreenChange, false);
	}

	componentWillUnmount() {
		window.removeEventListener('keydown', this.onKeyDown);
		document.removeEventListener('fullscreenchange', this.onFullScreenChange);
		document.removeEventListener('webkitfullscreenchange', this.onFullScreenChange);
	}

	private togglePlayback = (): void => {
		const { playerState, player } = this.props;

		if (playerState === 'PLAYING') {
			player.emit('action', { name: PlayerAction.ActuatePause });
			player.pause();
		} else {
			player.emit('action', { name: PlayerAction.ActuatePlay });
			player.play();
		}
	};

	// helps to call toggle function only once when play/pause button is focused and space button is pushed
	private togglePlaybackThrottled = throttle(this.togglePlayback, 300);

	private onKeyDown = (e: KeyboardEvent) => {
		if (this.props.castIntroLayer) return;

		const { currentTime } = this.props;

		if (e.keyCode === KEY_CODE.SPACE) {
			e.preventDefault();
			this.togglePlaybackThrottled();
		}
		if (e.keyCode === KEY_CODE.LEFT) {
			this.seekByKeyDown(currentTime - PLAYER_SEEK_STEP);
		}
		if (e.keyCode === KEY_CODE.RIGHT) {
			this.seekByKeyDown(currentTime + PLAYER_SEEK_STEP);
		}
		if (e.keyCode === KEY_CODE.F) {
			this.props.toggleFullScreen();
		}
	};

	private seekByKeyDown(position: number) {
		const { player } = this.props;
		player.onSeekingInteraction();
		this.seekTo(position);
	}

	private onSeek = debounce(
		(newTimePosition: number) => {
			const { player } = this.props;
			player.emit('action', { name: PlayerAction.ActuateSeekEnd });
			player.seek(newTimePosition);
		},
		SEEK_DEBOUNCE_TIME_MS,
		false
	);

	private seekTo(position: number) {
		const { player } = this.props;
		player.emit('action', { name: PlayerAction.ActuateSeek });
		player.seek(position);
	}

	private setVolume = (value: number) => {
		const { player, saveVolume } = this.props;
		player.emit('action', { name: PlayerAction.SetVolume, payload: Math.floor(value * 100) });
		player.setVolume(value);
		saveVolume(value);
	};

	private onVolumeScrubberChanged = (value: boolean) => {
		this.setState({ isVolumeScrubberVisible: value });
	};

	private onFullScreenChange = (e: any) => {
		this.forceUpdate();
	};

	render() {
		const {
			currentTime,
			duration,
			player,
			castActive,
			playerState,
			defaultVolume,
			toggleFullScreen,
			strings,
			castIntroLayer
		} = this.props;
		const { onSeekingInteraction } = player;
		const { isVolumeScrubberVisible } = this.state;

		return (
			<div className={cx(bemPlayerControls.b(), { 'volume-active': isVolumeScrubberVisible })}>
				<div className={cx(bemPlayerScrubber.b(), { 'player-scrubber--cast': castActive })}>
					{castActive && <ControlsTimeLabel className={bemPlayerScrubber.e('current-time')} time={currentTime} />}
					<ControlsScrubber
						currentTime={currentTime}
						durationTime={duration}
						sliderAreaText={strings.player_video}
						sliderAreaLabel={strings.player_video_seek}
						onSeek={this.onSeek}
						onSliderInteraction={onSeekingInteraction}
					/>
					{castActive && <ControlsTimeLabel className={bemPlayerScrubber.e('time')} time={duration} />}
					{!castActive && (
						<ControlsTime className={bemPlayerScrubber.e('time')} durationTime={duration} currentTime={currentTime} />
					)}
				</div>

				<div className={bemPlayerButtons.b()}>
					<ControlsPlayToggle
						onClick={this.togglePlaybackThrottled}
						className={bemPlayerButton.b('play')}
						playbackStatus={playerState}
						showBuffering={castActive}
					/>

					<ControlsVolume
						className={bemPlayerButton.b('volume')}
						onVolumeChange={this.setVolume}
						onActive={this.onVolumeScrubberChanged}
						defaultVolume={defaultVolume}
						sliderAreaText={strings.player_volume}
						sliderAreaLabel={strings.player_volume_seek}
						castIntroLayer={castIntroLayer}
					/>

					<CastButtonLoader className={cx(bemPlayerButton.b('cast'), { active: castActive })} />

					<ControlsSelector className={bemPlayerButton.b('selector disabled')} />

					{!castActive && (
						<ControlsFullScreen
							className={bemPlayerButton.b('fullscreen')}
							onClick={toggleFullScreen}
							isFullscreen={isFullScreen()}
						/>
					)}
				</div>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root): any {
	return {
		defaultVolume: state.player.volume,
		strings: state.app.i18n.strings
	};
}

function mapDispatchToProps(dispatch) {
	return {
		saveResumePosition: (item: api.ItemSummary, position: number) => dispatch(saveResumePosition(item, position)),
		saveVolume: (value: number) => dispatch(saveVolume(value))
	};
}

export default connect<any, any, PlayerControlsProps>(
	mapStateToProps,
	mapDispatchToProps
)(PlayerControls);
