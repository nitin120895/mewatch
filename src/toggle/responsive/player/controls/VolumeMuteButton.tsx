import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { PlayerInterface } from '../Player';
import VolumeMaxIcon from './icons/VolumeMaxIcon';
import VolumeMutedIcon from './icons/VolumeMutedIcon';

import './VolumeMuteButton.scss';

const bem = new Bem('volume-mute-btn');

interface VolumeMuteButtonProps extends React.Props<any> {
	className?: string;
	onVolumeChange?: (value: number) => void;
	player: PlayerInterface;
}

interface VolumeMuteButtonState {
	isMuted: boolean;
}

export default class VolumeMuteButton extends React.Component<VolumeMuteButtonProps, VolumeMuteButtonState> {
	state = {
		isMuted: true
	};

	componentWillReceiveProps(nexProps: VolumeMuteButtonProps) {
		const { isMuted } = this.state;
		if (nexProps.player && isMuted) {
			nexProps.player.setVolumeMutedState(isMuted);
		}
	}

	private onClick = e => {
		const { player } = this.props;

		if (player) {
			this.setState(
				prevState => ({ isMuted: !prevState.isMuted }),
				() => player.setVolumeMutedState(this.state.isMuted)
			);
		}
	};

	render() {
		const { isMuted } = this.state;
		const { className } = this.props;

		return (
			<div className={cx(bem.b(), className)} onClick={this.onClick}>
				{isMuted ? <VolumeMutedIcon /> : <VolumeMaxIcon />}
			</div>
		);
	}
}
