import * as React from 'react';
import Slider from './Slider';
import { getFormattedPlayerTime } from 'shared/util/dates';

interface ControlsScrubberProps extends React.Props<any> {
	currentTime: number;
	durationTime: number;
	onSeek?: (newTimePosition: number) => void;
	onSliderInteraction: () => void;
	sliderAreaText?: string;
	sliderAreaLabel?: string;
}

interface ControlsScrubberState {
	progress: number;
}

export default class ControlsScrubber extends React.Component<ControlsScrubberProps, ControlsScrubberState> {
	state = {
		progress: 0
	};

	componentDidMount() {
		this.updatePosition();
	}

	componentDidUpdate(prevProps: ControlsScrubberProps, prevState: any) {
		const { currentTime, durationTime } = this.props;
		const { currentTime: prevCurrentTime, durationTime: prevDurationTime } = prevProps;

		if ((currentTime && currentTime !== prevCurrentTime) || (durationTime && durationTime !== prevDurationTime)) {
			this.updatePosition();
		}
	}

	private updatePosition = () => {
		this.setState({ progress: this.getScrubberPosition() });
	};

	private getScrubberPosition() {
		const { currentTime, durationTime } = this.props;
		if (durationTime) {
			return currentTime / durationTime;
		} else {
			return 0;
		}
	}

	private formatLabel = (value: number) => {
		return getFormattedPlayerTime(value * this.props.durationTime);
	};

	private onSeek = (percentage: number) => {
		const { onSeek, durationTime } = this.props;
		if (onSeek) {
			onSeek(percentage * durationTime);
		}
	};

	render() {
		const { progress } = this.state;
		const { onSliderInteraction, sliderAreaText, sliderAreaLabel, currentTime, durationTime } = this.props;
		const totalTime = getFormattedPlayerTime(durationTime);
		const playedTime = getFormattedPlayerTime(currentTime);
		const areaText = `${playedTime}` + ` ${sliderAreaText} ` + `${totalTime}`;

		return (
			<Slider
				value={progress}
				formatLabel={this.formatLabel}
				onSliderInteractionStart={onSliderInteraction}
				onSliderInteractionStop={this.onSeek}
				sliderAreaText={areaText}
				sliderAreaLabel={sliderAreaLabel}
				tabIndex={2}
			/>
		);
	}
}
