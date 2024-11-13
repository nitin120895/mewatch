import * as React from 'react';
import { PlayerState, PlayerInterface } from '../Player';
import { Bem } from 'shared/util/styles';
import Spinner from 'ref/responsive/component/Spinner';
import PlayIcon from '../controls/icons/PlayIcon';
import PauseIcon from '../controls/icons/PauseIcon';

import './CastControls.scss';

const bem = new Bem('cast-controls');

interface CastControlsProps {
	player: PlayerInterface;
	playerState: PlayerState;
}

export default class CastControls extends React.Component<CastControlsProps> {
	private togglePlayback = () => {
		const { player, playerState } = this.props;

		if (playerState === PlayerState.PLAYING) {
			return player.pause();
		}

		if (playerState === PlayerState.PAUSED) {
			return player.play();
		}

		if (playerState === PlayerState.ENDED) {
			return player.replay();
		}
	};

	render() {
		const lastState = this.props.playerState;
		return (
			<button className={bem.b()} onClick={this.togglePlayback}>
				{lastState === PlayerState.BUFFERING && <Spinner />}
				{lastState === PlayerState.PLAYING && <PauseIcon />}
				{lastState === PlayerState.PAUSED && <PlayIcon />}
			</button>
		);
	}
}
