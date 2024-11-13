import * as React from 'react';

import TriggerProvider from 'shared/analytics/components/TriggerProvider';
import { DomTriggerPoints } from 'shared/analytics/types/types';
import { getFormattedPlayerTime } from 'shared/util/dates';
import { get } from 'shared/util/objects';

import Slider from 'toggle/responsive/player/controls/Slider';

const LIVE_PROGRESS_CHECK_TIMEOUT = 1000; // 1s

interface ControlsScrubberProps {
	entryId?: string;
	currentTime: number;
	durationTime: number;
	onSeek?: (newTimePosition: number) => void;
	onSliderInteraction?: () => void;
	adsBreakLayouts?: Array<number>;
	startover?: boolean;
	isSeekable?: boolean;
	startDate?: Date;
	endDate?: Date;
}

interface ControlsScrubberState {
	progress: number;
	liveProgress: number;
	fromEpoc?: number;
	toEpoc?: number;
}

export default class ControlsScrubber extends React.Component<ControlsScrubberProps, ControlsScrubberState> {
	private animating = false;
	private times: number;

	state = {
		progress: 0,
		liveProgress: 0,
		fromEpoc: undefined,
		toEpoc: undefined
	};

	componentDidMount() {
		this.initLiveProgress();
		this.updatePosition();
	}

	componentDidUpdate(prevProps: ControlsScrubberProps, prevState: any) {
		const { currentTime, durationTime } = this.props;
		const { currentTime: prevCurrentTime, durationTime: prevDurationTime } = prevProps;

		if ((currentTime && currentTime !== prevCurrentTime) || (durationTime && durationTime !== prevDurationTime)) {
			this.updatePosition();
		}
	}

	componentWillUnmount() {
		clearTimeout(this.times);
		this.animating = false;
	}

	private initLiveProgress() {
		// startDate & endDate are optional props passed from PlayerControls
		// this check helps identify whether to calculate live progress or not
		if (get(this.props, 'startDate') && get(this.props, 'endDate')) {
			const { startDate, endDate } = this.props;
			const fromEpoc = startDate.getTime();
			const toEpoc = endDate.getTime();
			this.setState(
				{
					liveProgress: 0,
					fromEpoc,
					toEpoc
				},
				this.animateLiveProgress
			);
			this.animating = true;
		}
	}

	private animateLiveProgress = () => {
		const now = Date.now();
		const { fromEpoc, toEpoc } = this.state;
		const { durationTime } = this.props;
		if (fromEpoc && toEpoc && toEpoc <= now) this.animating = false;
		if (!this.animating) return;

		const liveProgress = ((now - fromEpoc) / (durationTime * 1000)) * 100;
		this.setState({ liveProgress });
		this.times = window.setTimeout(this.animateLiveProgress, LIVE_PROGRESS_CHECK_TIMEOUT);
	};

	private updatePosition = () => {
		this.setState({ progress: this.getScrubberPosition() });
	};

	private getScrubberPosition() {
		const { currentTime, durationTime } = this.props;
		if (durationTime && currentTime < durationTime) {
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
		const { progress, liveProgress } = this.state;

		const { onSliderInteraction, durationTime, entryId, adsBreakLayouts, startover } = this.props;

		let sliderProps: any = {
			value: progress,
			durationTime,
			onChange: this.onSeek,
			formatLabel: this.formatLabel,
			onSliderInteraction,
			adsBreakLayouts
		};
		if (entryId) {
			sliderProps = { ...sliderProps, entryId };
		}

		if (onSliderInteraction) {
			sliderProps = { ...sliderProps, onSliderInteraction };
		}

		if (startover) {
			const { currentTime, startDate, endDate, isSeekable } = this.props;
			sliderProps = { ...sliderProps, liveProgress, isSeekable, currentTime, startDate, endDate, startover };
		}

		return (
			<TriggerProvider trigger={DomTriggerPoints.Scrubber}>
				<Slider {...sliderProps} />
			</TriggerProvider>
		);
	}
}
