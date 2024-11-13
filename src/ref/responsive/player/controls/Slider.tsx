import * as React from 'react';
import * as cx from 'classnames';

import { clamp, rectContainsPoint } from 'shared/util/math';
import { Bem } from 'shared/util/styles';

import './Slider.scss';

interface SliderProps extends React.Props<any> {
	value?: number;
	sliderAreaText?: string;
	sliderAreaLabel?: string;
	onChange?: (newValue: number) => void;
	formatLabel?: (value: number) => string;
	onSliderInteractionStart?(): void;
	onSliderInteractionStop?: (newValue: number) => void;
	tabIndex?: number;
}

interface SliderState {
	dragging: boolean;
	showLabel: boolean;
	labelValue: number;
}

const bem = new Bem('scrubber');

export default class Slider extends React.Component<SliderProps, SliderState> {
	private thumb: HTMLElement;
	private progress: HTMLElement;
	private container: HTMLElement;
	private label: HTMLElement;

	state = {
		dragging: false,
		showLabel: false,
		labelValue: 0
	};

	componentDidMount() {
		this.updatePosition(this.props.value);
	}

	componentDidUpdate(prevProps: SliderProps, prevState: any) {
		if (!this.state.dragging && this.props.value !== prevProps.value) {
			this.updatePosition(this.props.value);
		}
	}

	componentWillUnmount() {
		this.cleanup();
	}

	private updatePosition(value) {
		if (this.progress && this.thumb) {
			const percentage = value * 100;
			this.thumb.style.left = `${percentage}%`;
			this.progress.style.width = `${percentage}%`;
		}
	}

	private updateLabelPosition(value) {
		this.setState({ labelValue: value });
		if (this.label) {
			this.label.style.left = `${value * 100}%`;
		}
	}

	private sliderInteractionStart() {
		const { onSliderInteractionStart } = this.props;
		if (onSliderInteractionStart) onSliderInteractionStart();
	}

	private sliderInteractionStop(value: number) {
		const { onSliderInteractionStop } = this.props;
		if (onSliderInteractionStop) onSliderInteractionStop(value);
	}

	private startMouseDrag = event => {
		this.sliderInteractionStart();

		this.setState({ dragging: true });
		this.moveToMousePosition(event);
		document.addEventListener('mousemove', this.moveToMousePosition);
		document.addEventListener('mouseup', this.stopDrag);
	};

	private startTouchDrag = event => {
		this.sliderInteractionStart();

		this.setState({ dragging: true });
		this.moveToTouchPosition(event);
		document.addEventListener('touchmove', this.moveToTouchPosition);
		document.addEventListener('touchend', this.stopDrag);
	};

	private stopDrag = (event = undefined) => {
		this.sliderInteractionStop(this.state.labelValue);
		this.cleanup(event);
	};

	private cleanup(event = undefined) {
		this.setState({ dragging: false });
		document.removeEventListener('mousemove', this.moveToMousePosition);
		document.removeEventListener('mouseup', this.stopDrag);
		document.removeEventListener('touchmove', this.moveToTouchPosition);
		document.removeEventListener('touchend', this.stopDrag);

		if (
			!event ||
			event.type !== 'mouseup' ||
			!rectContainsPoint(this.container.getBoundingClientRect(), { x: event.pageX, y: event.pageY })
		) {
			this.endLabelMove();
		}
	}

	private moveToMousePosition = event => {
		this.setPointerPosition(event.pageX);
	};

	private moveToTouchPosition = event => {
		this.setPointerPosition(event.touches[0].pageX);
	};

	private setPointerPosition(pointerX) {
		const { onChange } = this.props;
		const value = this.calcPosition(pointerX);
		if (onChange) onChange(value);
		this.setState({ labelValue: value });

		this.updatePosition(value);
		this.updateLabelPosition(value);
	}

	private startLabelMove = () => {
		if (this.props.formatLabel) {
			this.setState({ showLabel: true });
			document.addEventListener('mousemove', this.moveLabel);
		}
	};

	private moveLabel = event => {
		if (!this.state.dragging) {
			const value = this.calcPosition(event.pageX);
			this.updateLabelPosition(value);
		}
	};

	private endLabelMove = () => {
		if (!this.state.dragging) {
			this.setState({ showLabel: false });
			document.removeEventListener('mousemove', this.moveLabel);
		}
	};

	private calcPosition(pointerX) {
		const { left, width } = this.container.getBoundingClientRect();
		return clamp(0, 1, (pointerX - left) / width);
	}

	private onContainerRef = (ref: HTMLElement) => {
		this.container = ref;
	};

	private onThumbRef = (ref: HTMLElement) => {
		this.thumb = ref;
	};

	private onProgressRef = (ref: HTMLElement) => {
		this.progress = ref;
	};
	private onLabelRef = (ref: HTMLElement) => {
		this.label = ref;
	};

	render() {
		const { formatLabel, sliderAreaText, sliderAreaLabel, tabIndex } = this.props;
		const { showLabel, labelValue, dragging } = this.state;
		const hasLabel = formatLabel;
		const canShowLabel = hasLabel && (dragging || showLabel);
		const formattedLabel = hasLabel && formatLabel(labelValue);

		return (
			<div
				className={bem.b()}
				ref={this.onContainerRef}
				onMouseDown={this.startMouseDrag}
				onTouchStart={this.startTouchDrag}
				onMouseEnter={this.startLabelMove}
				onMouseLeave={this.endLabelMove}
				role="slider"
				tabIndex={tabIndex}
				aria-label={sliderAreaLabel}
				aria-valuetext={sliderAreaText}
			>
				{hasLabel && (
					<div ref={this.onLabelRef} className={cx(bem.e('label'), { 'scrubber__label--show': canShowLabel })}>
						{canShowLabel && !!formattedLabel && formattedLabel}
					</div>
				)}
				<div className={bem.e('line')} ref={this.onProgressRef} />
				<div className={bem.e('thumb')} ref={this.onThumbRef} />
			</div>
		);
	}
}
