import * as React from 'react';
import * as cx from 'classnames';
import { findDOMNode } from 'react-dom';
import { Bem } from 'shared/util/styles';
import sass from 'ref/tv/util/sass';
import './CountDownTimer.scss';

interface CountDownTimerProps {
	classNames?: string;
	totalSeconds: number;
	isActive: boolean;
	timeRunout: () => void;
	setRemainSeconds: (remainSeconds: number) => void;
}

interface CountDownTimerState {
	remainSeconds: number;
}

type DrawTimerOptions = {
	canvas: HTMLCanvasElement;
	canvasWidth: number;
	canvasHeight: number;
	width: number;
	borderThickness: number;
	borderColor: string;
	center: number;
	radius: number;
};

const bem = new Bem('count-down-timer');

export default class CountDownTimer extends React.Component<CountDownTimerProps, CountDownTimerState> {
	private curMilSeconds;
	private timer;
	private isActive;
	private drawTimerOptions: DrawTimerOptions;
	private disposed = false;

	constructor(props) {
		super(props);
		this.state = {
			remainSeconds: props.totalSeconds
		};

		this.disposed = false;
		this.isActive = props.isActive;
		this.curMilSeconds = 0;

		const width = Math.min(sass.playerCountDownTimerWidth, sass.playerCountDownTimerHeight);
		const borderThickness = sass.playerCountDownTimerBorderWidth;

		this.drawTimerOptions = {
			canvas: undefined,
			canvasWidth: sass.playerCountDownTimerWidth,
			canvasHeight: sass.playerCountDownTimerHeight,
			width,
			borderThickness,
			borderColor: sass.playerCountDownTimerBorderColor,
			center: width / 2,
			radius: width / 2 - borderThickness / 2
		};
	}

	componentDidMount() {
		this.drawTimerOptions.canvas = findDOMNode(this).querySelector('.timer-canvas') as HTMLCanvasElement;
		if (this.isActive) {
			this.beginTimer();
		}
	}

	componentWillUnmount() {
		this.setState({ remainSeconds: this.props.totalSeconds });
		clearInterval(this.timer);
		this.disposed = true;
	}

	componentWillReceiveProps(nextProps: CountDownTimerProps) {
		if (nextProps.isActive !== this.isActive) {
			this.isActive = nextProps.isActive;

			if (!this.isActive) {
				this.stopTimer();
				this.curMilSeconds = 0;
			} else {
				this.beginTimer();
			}
		}
	}

	render() {
		const { canvasWidth, canvasHeight } = this.drawTimerOptions;

		return (
			<div className={cx(bem.b(''), this.props.classNames)}>
				<canvas className="timer-canvas" width={canvasWidth} height={canvasHeight} />
				<div className={bem.e('number')}>{this.state.remainSeconds}</div>
			</div>
		);
	}

	private beginTimer() {
		this.timer = setInterval(() => {
			if (this.disposed) {
				clearInterval(this.timer);
				return;
			}

			this.curMilSeconds += 100;
			this.drawTimer();

			if (this.curMilSeconds % 1000 === 0) {
				const remainSeconds = this.props.totalSeconds - this.curMilSeconds / 1000;
				this.setState({ remainSeconds });
				this.props.setRemainSeconds(remainSeconds);
			}

			if (this.curMilSeconds > this.props.totalSeconds * 1000) {
				this.props.timeRunout();
				clearInterval(this.timer);
			}
		}, 100);
	}

	private stopTimer() {
		clearInterval(this.timer);
		this.curMilSeconds = 0;
	}

	private drawTimer = () => {
		const { canvas, canvasWidth, canvasHeight, borderThickness, borderColor, center, radius } = this.drawTimerOptions;
		if (!canvas || this.curMilSeconds / 1000 >= this.props.totalSeconds) return;
		const curPercent = this.curMilSeconds / 1000 / this.props.totalSeconds;
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		ctx.strokeStyle = borderColor;
		ctx.lineWidth = borderThickness;
		ctx.beginPath();
		ctx.arc(center, center, radius, 2 * Math.PI * curPercent - 0.5 * Math.PI, -0.5 * Math.PI, false);
		ctx.stroke();
	};
}
