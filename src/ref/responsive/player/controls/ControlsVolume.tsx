import * as React from 'react';
import * as cx from 'classnames';
import Slider from './Slider';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import VolumeMutedIcon from './icons/VolumeMutedIcon';
import VolumeMinIcon from './icons/VolumeMinIcon';
import VolumeMidIcon from './icons/VolumeMidIcon';
import VolumeMaxIcon from './icons/VolumeMaxIcon';
import { KEY_CODE } from 'shared/util/keycodes';

import './ControlsVolume.scss';

interface ControlsVolumeProps extends React.Props<any> {
	className?: string;
	onVolumeChange?: (value: number) => void;
	onActive: (value: boolean) => void;
	defaultVolume: number;
	sliderAreaText?: any;
	sliderAreaLabel?: any;
	castIntroLayer: boolean;
}

interface ControlsVolumeState {
	volumeScrubberOpen?: boolean;
	volume?: number;
	isMuted?: boolean;
}

const VOLUME_SEEK_STEP = 0.1;

export default class ControlsVolume extends React.Component<ControlsVolumeProps, ControlsVolumeState> {
	// In Google Chrome we have containerMouseEnter and buttonMouseDown events even we work with touch devices.
	// That's the reason why we have isTouched state and clear it with timeOut.
	// In FireFox we don't have containerMouseEnter but still have buttonMouseDown, it means that isHovering
	// will be always false (we turn it to true in containerMouseEnter). So we need both this flags to avoid
	// all this strange possible behavior in different browsers.
	private isHovering = false;
	private isTouched = false;

	state: ControlsVolumeState = {
		volume: this.props.defaultVolume,
		volumeScrubberOpen: false,
		isMuted: this.props.defaultVolume === 0
	};

	componentDidMount() {
		this.setPlayerVolume(this.props.defaultVolume);
		window.addEventListener('keydown', this.onKeyDown, false);
	}

	componentWillUnmount() {
		window.removeEventListener('keydown', this.onKeyDown);
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
			this.setPlayerVolume(this.state.isMuted ? 0 : this.state.volume);
		});
	}

	private showVolumeControl() {
		if (!this.state.volumeScrubberOpen) this.setVolumeScrubberState(true);
	}

	private hideVolumeControl() {
		if (this.state.volumeScrubberOpen) this.setVolumeScrubberState(false);
	}

	private toggleVolumeControl() {
		this.setVolumeScrubberState(!this.state.volumeScrubberOpen);
	}

	onVolumeChange = (value: number) => {
		this.setState({ volume: value, isMuted: value === 0 });
		this.setPlayerVolume(value);
	};

	private onContainerMouseEnter = () => {
		if (this.isTouched) return;

		this.isHovering = true;
		this.showVolumeControl();
	};

	private onContainerMouseLeave = () => {
		if (this.isTouched) return;

		this.isHovering = false;
		this.hideVolumeControl();
	};

	private onButtonMouseDown = e => {
		if (this.isTouched) return;

		e.preventDefault();
		if (this.isHovering) this.toggleVolume();
	};

	private onTouchStart = e => {
		e.preventDefault();

		this.isTouched = true;
		this.toggleVolumeControl();
	};

	private onTouchEnd = e => {
		e.preventDefault();
		this.isTouched = false;
	};

	// Keyboards events
	private onKeyDown = (e: KeyboardEvent) => {
		if (this.props.castIntroLayer) return;

		const { volume } = this.state;
		if (e.keyCode === KEY_CODE.M) {
			this.toggleVolume();
		}
		if (e.keyCode === KEY_CODE.UP) {
			const newValue = volume + VOLUME_SEEK_STEP;
			this.onVolumeChange(newValue >= 1 ? 1 : newValue);
		}
		if (e.keyCode === KEY_CODE.DOWN) {
			const newValue = volume - VOLUME_SEEK_STEP;
			this.onVolumeChange(newValue <= 0 ? 0 : newValue);
		}
	};

	private handleKeyPress = e => {
		if (e.keyCode === KEY_CODE.ENTER) {
			this.toggleVolume();
		}
		if (e.keyCode === KEY_CODE.TAB) {
			this.toggleVolumeControl();
		}
	};

	render() {
		const { className, sliderAreaText, sliderAreaLabel } = this.props;
		const { volumeScrubberOpen } = this.state;
		const areaText = Math.floor(this.props.defaultVolume * 100) + `% ` + `${sliderAreaText}`;

		return (
			<div
				className={cx('player-volume', { open: volumeScrubberOpen })}
				onMouseEnter={this.onContainerMouseEnter}
				onMouseLeave={this.onContainerMouseLeave}
			>
				<IntlFormatter
					elementType="button"
					className={className}
					onMouseDown={this.onButtonMouseDown}
					onTouchStart={this.onTouchStart}
					onTouchEnd={this.onTouchEnd}
					onKeyDown={this.handleKeyPress}
					formattedProps={{ 'aria-label': '@{player_volume_seek|Volume slider}' }}
					aria-haspopup={true}
					tabIndex={5}
				>
					{this.renderIcon()}
				</IntlFormatter>
				<Slider
					value={this.getVolume()}
					onChange={this.onVolumeChange}
					sliderAreaText={areaText}
					sliderAreaLabel={sliderAreaLabel}
					tabIndex={6}
				/>
			</div>
		);
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
