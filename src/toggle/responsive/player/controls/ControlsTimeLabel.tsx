import * as React from 'react';
import { getFormattedPlayerTime } from 'shared/util/dates';
import { get } from 'shared/util/objects';

const REMAINING_LIVE_CHECK_TIMEOUT = 1000; // 1s
const ONE_SECOND = 1000; // 1s

type ControlsTimeLabelCommonProps = {
	className?: string;
};

type ControlsTimeLabelConditionalProps = { time: number; endDate?: never } | { time?: never; endDate: Date };

type ControlsTimeLabelProps = ControlsTimeLabelCommonProps & ControlsTimeLabelConditionalProps;

interface ControlsTimeLabelState {
	displayTime: number;
}

export default class ControlsTimeLabel extends React.Component<ControlsTimeLabelProps, ControlsTimeLabelState> {
	private animating = false;
	private times: number;

	static defaultProps = {
		endDate: undefined,
		time: 0
	};

	constructor(props) {
		super(props);

		this.state = {
			displayTime: 0
		};
	}

	componentDidMount() {
		if (get(this.props, 'endDate')) {
			this.createRemainingTimeTimeout();
		} else {
			const { time } = this.props;
			this.setState({ displayTime: time });
		}
	}

	private createRemainingTimeTimeout() {
		const { endDate } = this.props;
		this.setState(
			{
				displayTime: (endDate.getTime() - new Date().getTime()) / ONE_SECOND
			},
			this.remainingLiveTimeout
		);
		this.animating = true;
	}

	private remainingLiveTimeout = () => {
		const { endDate } = this.props;
		const now = new Date();
		if (now.getTime() > endDate.getTime()) {
			this.animating = false;
		}
		if (!this.animating) return;

		this.setState({
			displayTime: (endDate.getTime() - now.getTime()) / ONE_SECOND
		});
		this.times = window.setTimeout(this.remainingLiveTimeout, REMAINING_LIVE_CHECK_TIMEOUT);
	};

	componentWillUnmount() {
		clearTimeout(this.times);
		this.animating = false;
	}

	render() {
		const { className, endDate, time } = this.props;
		const { displayTime } = this.state;
		const renderTime = endDate ? displayTime : time;

		return <div className={className}>{getFormattedPlayerTime(renderTime)}</div>;
	}
}
