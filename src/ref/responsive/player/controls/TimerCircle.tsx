import * as React from 'react';
import * as cx from 'classnames';
import * as ReactDOM from 'react-dom';
import { Bem } from 'shared/util/styles';
import TimerCircleIcon from './icons/TimerCircleIcon';

import './TimerCircle.scss';

const SCALE = 20;
const INTERVAL = 1000 / SCALE;
const ANIMATION_MAX_OFFSET = 629;
const ANIMATION_START_OFFSET = 0;

interface TimerCircleProps {
	className?: string;
	startFrom: number;
	onFinish: () => void;
	onTick: (countdownRemaining: number) => void;
	isPaused?: boolean;
}

interface TimerCircleState {
	time: number;
}

const bem = new Bem('circle-timer');

export default class TimerCircle extends React.Component<TimerCircleProps, TimerCircleState> {
	state: TimerCircleState = {
		time: this.props.startFrom * SCALE
	};

	private counter;
	private animationStep: number;
	private animationCurrentOffset: number;
	private animatedIcon: HTMLElement;

	componentDidMount() {
		// for some reason ref callback doesn't work for svg in this case
		this.animatedIcon = ReactDOM.findDOMNode(this).querySelector('.circle-timer__top-svg') as HTMLElement;
		if (this.animatedIcon) this.animatedIcon.style.strokeDashoffset = ANIMATION_START_OFFSET.toString();

		this.animationCurrentOffset = ANIMATION_START_OFFSET;
		this.setupAnimationStep(this.props.startFrom);
		this.checkAnimationStart();
	}

	componentWillReceiveProps(nextProps: TimerCircleProps) {
		const { startFrom, isPaused } = this.props;
		if (nextProps.startFrom !== startFrom) {
			this.stopTimer();
			this.setupAnimationStep(nextProps.startFrom);
			this.setState(
				{
					time: nextProps.startFrom
				},
				this.checkAnimationStart
			);
		}

		if (nextProps.isPaused !== isPaused) {
			if (nextProps.isPaused) {
				this.stopTimer();
			} else {
				this.startTimer();
			}
		}
	}

	componentWillUnmount() {
		this.stopTimer();
	}

	private setupAnimationStep(startTime: number) {
		this.animationStep = startTime !== 0 ? ANIMATION_MAX_OFFSET / startTime / SCALE : 1;
	}

	private checkAnimationStart = () => {
		if (!this.props.isPaused) {
			this.startTimer();
		}
	};

	private startTimer() {
		this.stopTimer();
		this.counter = this.startCounter();
	}

	private stopTimer() {
		if (this.counter) clearInterval(this.counter);
	}

	private checkTimerState() {
		const time = Math.floor(this.state.time / SCALE);
		this.props.onTick(time);
		if (time <= 0) {
			this.stopTimer();
			this.props.onFinish();
		}
	}

	private startCounter = () => {
		return window.setInterval(() => {
			this.setState(prevState => {
				return { time: prevState.time - 1 };
			}, this.checkTimerState);
			this.updateAnimatedIcon();
		}, INTERVAL);
	};

	private updateAnimatedIcon() {
		this.animationCurrentOffset -= this.animationStep;
		if (this.animatedIcon) this.animatedIcon.style.strokeDashoffset = this.animationCurrentOffset.toString();
	}

	render() {
		const { className } = this.props;
		const { time } = this.state;

		return (
			<div className={cx(bem.b(), className)} data-time={Math.round(time / SCALE)}>
				<TimerCircleIcon className={cx(bem.e('bottom-svg'), 'svg-icon')} />
				<TimerCircleIcon className={cx(bem.e('top-svg'), 'svg-icon')} />
			</div>
		);
	}
}
