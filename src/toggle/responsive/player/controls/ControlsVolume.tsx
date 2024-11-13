import * as React from 'react';
import * as cx from 'classnames';
import Slider from './Slider';
import { isMobile } from 'shared/util/browser';
import { throttle } from 'shared/util/performance';

import VolumeMutedIcon from './icons/VolumeMutedIcon';
import VolumeMinIcon from './icons/VolumeMinIcon';
import VolumeMidIcon from './icons/VolumeMidIcon';
import VolumeMaxIcon from './icons/VolumeMaxIcon';

import './ControlsVolume.scss';

const DEFAULT_MOBILE_VOLUME = 1;

interface ControlsVolumeProps extends React.Props<any> {
	className?: string;
	onVolumeChange?: (value: number) => void;
	onActive: (boolean) => void;
	defaultVolume: number;
	setVolumeMutedState?: (isMuted: boolean) => void;
	isMuted?: boolean;
	isMutedClicked: (boolean) => void;
}

interface ControlsVolumeState {
	volumeScrubberOpen?: boolean;
	volume?: number;
	isMuted?: boolean;
	volumeToUnmute?: number;
}

export default class ControlsVolume extends React.Component<ControlsVolumeProps, ControlsVolumeState> {
	state: ControlsVolumeState = {
		volume: this.props.defaultVolume,
		volumeScrubberOpen: false,
		isMuted: this.props.isMuted || this.props.defaultVolume === 0
	};

	componentDidMount() {
		const { defaultVolume } = this.props;
		this.setPlayerVolume(defaultVolume);
	}

	componentWillReceiveProps(newProps) {
		const newVolume = newProps.defaultVolume;
		const { defaultVolume, setVolumeMutedState, isMuted } = this.props;
		if (newVolume !== defaultVolume) {
			setVolumeMutedState(newVolume <= 0);
			this.setState({ volume: newVolume, isMuted: newVolume <= 0 });
		}

		if (newProps.isMuted !== isMuted) {
			this.setState({ isMuted: newProps.isMuted });
			!newProps.isMuted && this.setPlayerVolume(this.state.volume);
		}
	}

	private setPlayerVolume(value: number) {
		const { onVolumeChange } = this.props;

		if (onVolumeChange) {
			onVolumeChange(value);
		}
	}

	private setVolumeScrubberState(value: boolean) {
		this.setState({ volumeScrubberOpen: value });
		this.props.onActive(value);
	}

	private getVolume() {
		return this.state.isMuted ? 0 : this.state.volume;
	}

	private toggleVolume() {
		this.setState({ isMuted: !this.state.isMuted }, () => {
			this.props.setVolumeMutedState(this.state.isMuted);
		});
	}

	private showVolumeControl() {
		if (!this.state.volumeScrubberOpen) this.setVolumeScrubberState(true);
	}

	private hideVolumeControl() {
		if (this.state.volumeScrubberOpen) this.setVolumeScrubberState(false);
	}

	onVolumeChange = (value: number) => {
		if (!isNaN(value)) {
			this.setState({ volume: value, isMuted: value === 0 });
			this.setPlayerVolume(value);
		}
	};

	private onVolumeChangeThrottled = throttle(this.onVolumeChange, 300);

	private onContainerMouseEnter = () => {
		this.showVolumeControl();
	};

	private onContainerMouseLeave = () => {
		this.hideVolumeControl();
	};

	private onClick = e => {
		e.preventDefault();
		const { isMutedClicked } = this.props;
		// To show that interaction has occurred with Mute button by user
		if (isMutedClicked) isMutedClicked(true);

		if (isMobile()) {
			const { isMuted, volume } = this.state;
			if (isMuted && volume === 0) this.setPlayerVolume(DEFAULT_MOBILE_VOLUME);
		}

		this.toggleVolume();
	};

	render() {
		const { className } = this.props;
		const { volumeScrubberOpen } = this.state;

		return (
			<div
				className={cx(className, { open: volumeScrubberOpen && !isMobile() })}
				onMouseEnter={this.onContainerMouseEnter}
				onMouseLeave={this.onContainerMouseLeave}
			>
				<div className="volume-controls" onClick={this.onClick}>
					{this.renderIcon()}
				</div>
				{this.renderVolumeScrubber()}
			</div>
		);
	}

	private renderVolumeScrubber() {
		if (isMobile()) return;
		return <Slider value={this.getVolume()} onChange={this.onVolumeChangeThrottled} />;
	}

	private renderIcon() {
		const { volume, isMuted } = this.state;
		if (isMuted) {
			return <VolumeMutedIcon />;
		} else if (volume <= 0.3) {
			return <VolumeMinIcon />;
		} else if (volume > 0.3 && volume <= 0.8) {
			return <VolumeMidIcon />;
		} else {
			return <VolumeMaxIcon />;
		}
	}
}
