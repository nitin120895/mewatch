import * as React from 'react';
import * as cx from 'classnames';
import { PlayerState } from 'toggle/responsive/player/Player';
import { Bem } from 'shared/util/styles';
import TriggerProvider from 'shared/analytics/components/TriggerProvider';
import { DomTriggerPoints } from 'shared/analytics/types/types';
import PauseIcon from 'ref/responsive/player/controls/icons/PauseIcon';
import PlayIcon from 'ref/responsive/player/controls/icons/PlayIcon';
import StopIcon from './icons/StopIcon';
import ForwardIcon from './icons/ForwardIcon';
import RewindIcon from './icons/RewindIcon';
import Spinner from 'ref/responsive/component/Spinner';

import './PlayerOverlayingControls.scss';

interface PlayerOverlayingControlsProps {
	playerState: PlayerState;
	showUI?: boolean;
	hidden?: boolean;
	onSeekRewind?: () => void;
	onSeekForward?: () => void;
	togglePlayback: () => void;
	isChannel?: boolean;
	startover?: boolean;
	isSeekable?: boolean;
	castControlsOnly?: boolean;
}

const bemScreenIcon = new Bem('screen-icon');
const bemPlayerBlock = new Bem('player-block');
const bemPlayerOverlayingControls = new Bem('player-overlaying-controls');
export const bemPlayerSeekControls = new Bem('player-seek-controls');

export default class PlayerOverlayingControls extends React.Component<PlayerOverlayingControlsProps, any> {
	private wasPlaying = false;

	componentWillUpdate(nextProps) {
		if (!this.wasPlaying && nextProps.playerState === PlayerState.PLAYING) this.wasPlaying = true;
	}

	render() {
		const { showUI, hidden, castControlsOnly } = this.props;
		if (showUI && !hidden) {
			return (
				<div className={cx(bemPlayerOverlayingControls.e('wrapper', { 'cast-controls': castControlsOnly }))}>
					{this.renderSpinnerOrControls()}
				</div>
			);
		} else {
			return false;
		}
	}

	private renderSeekControls = () => {
		const { playerState, isSeekable } = this.props;
		const isReady = playerState === PlayerState.READY;
		const allowSeeking = !isReady && isSeekable;

		if (this.props.castControlsOnly) {
			return <div className={cx(bemPlayerSeekControls.b())}>{this.renderControlButton()}</div>;
		} else {
			return (
				<div className={cx(bemPlayerSeekControls.b())}>
					{allowSeeking && this.renderRewindIcon()}
					{this.renderControlButton()}
					{allowSeeking && this.renderForwardIcon()}
				</div>
			);
		}
	};

	private renderRewindIcon = () => (
		<TriggerProvider trigger={DomTriggerPoints.BtnBackward}>
			<div
				onClick={this.props.onSeekRewind}
				className={cx(bemPlayerSeekControls.e('rwd'))}
				onDoubleClick={this.preventParentEvent}
			>
				<RewindIcon />
			</div>
		</TriggerProvider>
	);

	private renderControlButton = () => {
		const { playerState, isChannel, startover } = this.props;
		const isPaused = playerState === PlayerState.PAUSED;
		const isReady = playerState === PlayerState.READY;

		let iconToDisplay;
		if (isPaused || isReady) {
			iconToDisplay = this.renderPlayIcon;
		} else if (!isChannel || startover) {
			iconToDisplay = this.renderPauseIcon;
		} else {
			iconToDisplay = this.renderStopIcon;
		}
		return (
			<div onClick={this.props.togglePlayback} className={cx(bemPlayerSeekControls.e('ctl'))}>
				{iconToDisplay()}
			</div>
		);
	};

	private renderForwardIcon = () => (
		<TriggerProvider trigger={DomTriggerPoints.BtnForward}>
			<div
				onClick={this.props.onSeekForward}
				className={cx(bemPlayerSeekControls.e('fwd'))}
				onDoubleClick={this.preventParentEvent}
			>
				<ForwardIcon />
			</div>
		</TriggerProvider>
	);

	private renderSpinnerOrControls = () => {
		const { playerState } = this.props;
		switch (playerState) {
			case PlayerState.UNKNOWN:
			case PlayerState.LOADING:
			case PlayerState.BUFFERING:
				return <Spinner className={bemPlayerBlock.e('spinner')} />;
			default:
				return this.renderSeekControls();
		}
	};

	private preventParentEvent = (event: any): void => {
		event.stopPropagation();
	};

	private renderPauseIcon = () => (
		<div className={cx(bemScreenIcon.b(), bemScreenIcon.e('pause'))} onDoubleClick={this.preventParentEvent}>
			<PauseIcon />
		</div>
	);
	/*
		show Play button just in case we have READY player state (player without autoplay and resume point)
		or we have PAUSED player state and hadn't PLAYING before (palyer is ready, but after seeking to resume point we have PAUSED state)
	*/
	private renderPlayIcon = () => (
		<div className={cx(bemScreenIcon.b(), bemScreenIcon.e('play'))} onDoubleClick={this.preventParentEvent}>
			<PlayIcon />
		</div>
	);

	private renderStopIcon = () => (
		<div className={cx(bemScreenIcon.b(), bemScreenIcon.e('stop'))} onDoubleClick={this.preventParentEvent}>
			<StopIcon />
		</div>
	);
}
