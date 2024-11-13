import * as React from 'react';
import * as cx from 'classnames';
import { PlayerState } from './Player';
import { Bem } from 'shared/util/styles';
import PauseIcon from './controls/icons/PauseIcon';
import PlayIcon from './controls/icons/PlayIcon';
import Spinner from '../component/Spinner';

import './PlayerOverlayingControls.scss';

interface PlayerOverlayingControlsProps {
	playerState: PlayerState;
	onPlay: () => void;
	isAutoPlayEnabled: boolean;
}

const bemScreenIcon = new Bem('screen-icon');
const bemPlayerBlock = new Bem('player-block');

export default class PlayerOverlayingControls extends React.Component<PlayerOverlayingControlsProps, any> {
	private wasPlaying = false;

	componentWillUpdate(nextProps) {
		if (!this.wasPlaying && nextProps.playerState === PlayerState.PLAYING) this.wasPlaying = true;
	}

	render() {
		return (
			<div>
				{this.renderPauseIcon()}
				{this.renderSpinner()}
				{this.renderPlayIcon()}
			</div>
		);
	}

	private renderSpinner = () => {
		const { playerState } = this.props;
		switch (playerState) {
			case PlayerState.UNKNOWN:
			case PlayerState.LOADING:
			case PlayerState.BUFFERING:
			case PlayerState.SEEKING:
				return <Spinner className={bemPlayerBlock.e('spinner')} />;
			default:
				return false;
		}
	};

	private renderPauseIcon = () => {
		const { playerState, onPlay } = this.props;
		if (!this.wasPlaying || playerState !== PlayerState.PAUSED) return false;
		return (
			<div className={cx(bemScreenIcon.b(), bemScreenIcon.e('pause'))} onClick={onPlay}>
				<PauseIcon />
			</div>
		);
	};

	/*
		show Play button just in case we have READY player state (player without autoplay and resume point)
		or we have PAUSED player state and hadn't PLAYING before (player is ready, but after seeking to resume point we have PAUSED state)
	*/
	private renderPlayIcon = () => {
		const { playerState, onPlay, isAutoPlayEnabled } = this.props;
		if (
			!isAutoPlayEnabled &&
			(playerState === PlayerState.READY || (playerState === PlayerState.PAUSED && !this.wasPlaying))
		) {
			return (
				<div className={cx(bemScreenIcon.b(), bemScreenIcon.e('play'))} onClick={onPlay}>
					<PlayIcon />
				</div>
			);
		}
		return false;
	};
}
