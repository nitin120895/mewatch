import * as React from 'react';
import { connect } from 'react-redux';
import { isTabletSize, isMobileSize } from 'toggle/responsive/util/grid';
import {
	calculateThumbnailSize,
	getKalturaThumbnailsUrl,
	getThumbnailPositionOfset
} from 'toggle/responsive/util/playerUtil';
import { showThumbnailVisibility } from 'shared/app/playerWorkflow';
import { clamp, rectContainsPoint } from 'shared/util/math';
import { getFormattedPlayerTime } from 'shared/util/dates';
import { Bem } from 'shared/util/styles';
import { DISABLE_TEXT_SELECT_CLASS, hasBodyClass, addBodyClass, removeBodyClass } from 'toggle/responsive/util/cssUtil';

import './Slider.scss';

interface OwnProps extends React.Props<any> {
	entryId?: string;
	value?: number;
	liveProgress?: number;
	durationTime?: number;
	onChange?: (newValue: number) => void;
	formatLabel?: (value: number) => string;
	onSliderInteraction?(): void;
	adsBreakLayouts?: Array<number>;
	startover?: boolean;
	isSeekable?: boolean;
	currentTime?: number;
	startDate?: Date;
	endDate?: Date;
}

interface DispatchProps {
	showThumbnailVisibility?: (visibility: boolean) => void;
}

interface StateProps {
	playback: api.AppConfigPlayback;
}

interface State {
	dragging: boolean;
	showLabel: boolean;
	labelValue: number;
	liveLabelValue: number;
	width: number;
	height: number;
	playerControlsPadding: number;
	thumbnailLeftPosition: number;
	scaleFactor: number;
}

type Props = StateProps & DispatchProps & OwnProps;

const bem = new Bem('scrubber');
const LABEL_ALIGNMENT_THRESHOLD = 0.1;

class Slider extends React.Component<Props, State> {
	private thumb: HTMLElement;
	private progress: HTMLElement;
	private container: HTMLElement;
	private label: HTMLElement;
	private line: HTMLElement;
	private livePoint: HTMLElement;

	static defaultProps = {
		startover: false,
		isSeekable: true
	};

	state = {
		dragging: false,
		showLabel: false,
		labelValue: 0,
		width: 355,
		height: 200,
		playerControlsPadding: 60,
		thumbnailLeftPosition: 0,
		scaleFactor: 1,
		liveLabelValue: 0
	};

	componentDidMount() {
		this.updatePosition(this.props.value);
		window.addEventListener('resize', this.onResize, false);
		this.setState(calculateThumbnailSize());
	}

	componentDidUpdate(prevProps: OwnProps, prevState: any) {
		if (
			!this.state.dragging &&
			(this.props.value !== prevProps.value || this.props.liveProgress !== prevProps.liveProgress)
		) {
			this.updatePosition(this.props.value);
		}

		if (this.state.showLabel !== prevState.showLabel) {
			this.props.showThumbnailVisibility(this.state.showLabel);
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onResize);
		this.stopDrag();
	}

	private getMidRollsPosition = () => {
		const { adsBreakLayouts } = this.props;
		return adsBreakLayouts.length ? adsBreakLayouts : [];
	};

	private onResize = () => {
		this.setState(calculateThumbnailSize());
	};

	private updatePosition(value) {
		const { startover, endDate } = this.props;
		if (this.progress && this.thumb) {
			const percentage = clamp(0, value, 1) * 100;
			this.thumb.style.left = `${percentage}%`;
			this.progress.style.width = `${percentage}%`;
			const programeIsOver = new Date() > endDate;

			if (startover && !programeIsOver) {
				this.line.style.width = `${percentage}%`;
				this.updateLivePoint();
			}
		}
	}

	private updateLivePoint() {
		const { endDate, durationTime } = this.props;
		const { liveLabelValue } = this.state;
		const now = new Date();
		const secondsTillEnd = (endDate.getTime() - now.getTime()) / 1000;
		this.setState({ liveLabelValue: 1 - secondsTillEnd / durationTime });
		const livePercent = now >= endDate ? 100 : liveLabelValue * 100;
		this.line.style.width = `${livePercent}%`;
		this.livePoint && (this.livePoint.style.left = `${livePercent}%`);
	}

	private updateLabelPosition(value) {
		const THUMBNAIL_MARGIN = 10;
		const { playerControlsPadding, width, scaleFactor } = this.state;
		const THUMBNAIL_MARGIN_RIGHT = isTabletSize() ? playerControlsPadding : THUMBNAIL_MARGIN;
		const scaledWidth = width * scaleFactor;
		const offsetPositionLeft = this.calcThumbnailPosition(scaledWidth / 2 + THUMBNAIL_MARGIN);
		const offsetPositionRight =
			1 - this.calcThumbnailPosition(scaledWidth / 2 - playerControlsPadding - THUMBNAIL_MARGIN_RIGHT);

		let thumbnailLeftPosition;

		if (value > offsetPositionRight && !isMobileSize()) thumbnailLeftPosition = `${offsetPositionRight * 100}%`;
		else if (value < offsetPositionLeft) thumbnailLeftPosition = `${offsetPositionLeft * 100}%`;
		else thumbnailLeftPosition = `${value * 100}%`;

		this.setState({ labelValue: value, thumbnailLeftPosition });
	}

	private sliderInteraction() {
		const { onSliderInteraction } = this.props;
		if (onSliderInteraction) onSliderInteraction();

		// To fix issue where dragging on vol slider in Safari will select all
		// text in the page
		if (!hasBodyClass(DISABLE_TEXT_SELECT_CLASS)) addBodyClass(DISABLE_TEXT_SELECT_CLASS);
	}

	private startMouseDrag = event => {
		this.sliderInteraction();

		this.setState({ dragging: true });
		this.moveToMousePosition(event);
		document.addEventListener('mousemove', this.moveToMousePosition);
		document.addEventListener('mouseup', this.stopDrag);
	};

	private startTouchDrag = event => {
		this.sliderInteraction();

		this.setState({ dragging: true, showLabel: true });
		this.moveToTouchPosition(event);
		document.addEventListener('touchmove', this.moveToTouchPosition);
		document.addEventListener('touchend', this.stopDrag);
	};

	private stopDrag = (event = undefined) => {
		removeBodyClass(DISABLE_TEXT_SELECT_CLASS);
		this.setState({ dragging: false, showLabel: false });
		document.removeEventListener('mousemove', this.moveToMousePosition);
		document.removeEventListener('mouseup', this.stopDrag);
		document.removeEventListener('touchmove', this.moveToTouchPosition);
		document.removeEventListener('touchend', this.stopDrag);

		if (event) event.preventDefault();

		if (
			!event ||
			event.type !== 'mouseup' ||
			!rectContainsPoint(this.container.getBoundingClientRect(), { x: event.pageX, y: event.pageY })
		) {
			this.endLabelMove();
		}
	};

	private moveToMousePosition = event => {
		this.setPointerPosition(event.pageX);
	};

	private moveToTouchPosition = event => {
		this.setPointerPosition(event.touches[0].pageX);
	};

	private setPointerPosition(pointerX) {
		const value = this.calcPosition(pointerX);
		const { onChange, isSeekable } = this.props;
		if (onChange) {
			onChange(value);
		}
		if (!isSeekable) {
			return;
		}

		this.setState({ labelValue: value });
		this.updatePosition(value);

		if (this.props.formatLabel) {
			this.updateLabelPosition(value);
		}
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

	private isPositionAndLiveLabelAlignmentRequired = () => {
		const { value } = this.props;
		const { liveLabelValue } = this.state;

		return liveLabelValue - value < LABEL_ALIGNMENT_THRESHOLD;
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

	private calcThumbnailPosition(pointerX) {
		const { entryId, startover } = this.props;
		if (!entryId && startover) return;
		const { left, width: containerWidth } = this.container.getBoundingClientRect();
		const { width: labelWidth } = this.label.getBoundingClientRect();
		const lowerBound = labelWidth / 2 / containerWidth;

		return clamp(lowerBound, 1, (pointerX - left) / containerWidth);
	}

	private onContainerRef = (ref: HTMLElement) => {
		this.container = ref;
	};

	private onLabelRef = (ref: HTMLElement) => {
		this.label = ref;
	};

	private onThumbRef = (ref: HTMLElement) => {
		this.thumb = ref;
	};

	private onLineRef = (ref: HTMLElement) => {
		this.line = ref;
	};

	private onProgressRef = (ref: HTMLElement) => {
		this.progress = ref;
	};

	private onLivePointRef = (ref: HTMLElement) => {
		this.livePoint = ref;
	};

	render() {
		const { formatLabel, adsBreakLayouts } = this.props;

		return (
			<div
				className={bem.b()}
				ref={this.onContainerRef}
				onMouseDown={this.startMouseDrag}
				onTouchStart={this.startTouchDrag}
				onTouchEnd={this.stopDrag}
				onMouseEnter={this.startLabelMove}
				onMouseLeave={this.endLabelMove}
			>
				{formatLabel && this.renderLabel()}
				{this.renderProgressBar()}

				{this.container &&
					adsBreakLayouts &&
					adsBreakLayouts.length > 0 &&
					this.getMidRollsPosition().map(this.renderMidRollPoints)}
				<div className={bem.e('thumb')} ref={this.onThumbRef}>
					<div className={bem.e('progress-tip', { 'left-align': this.isPositionAndLiveLabelAlignmentRequired() })}>
						{this.renderStartOverCurrentTime()}
					</div>
				</div>
				{this.renderLivePoint()}
			</div>
		);
	}

	getBreakPointPosition = (value: number) => {
		const { durationTime } = this.props;
		const breakpointPosition = clamp(0, value / durationTime, 1);
		if (value <= 0) return 0;
		return `${breakpointPosition * 100}%`;
	};

	renderMidRollPoints = (value: number) => {
		const position = this.getBreakPointPosition(value);
		return (
			<div
				key={value}
				className={bem.e('breakpoints', { pre: value === 0 }, { post: value < 0 })}
				style={value >= 0 ? { left: position } : { right: position }}
			/>
		);
	};

	renderProgressBar() {
		const { startover } = this.props;
		if (startover) {
			return (
				<div className={bem.e('line', 'start-over-mode')} ref={this.onLineRef}>
					<div className={bem.e('progress')} ref={this.onProgressRef} />
				</div>
			);
		}
		return <div className={bem.e('line')} ref={this.onProgressRef} />;
	}

	renderStartOverCurrentTime() {
		const { startover, currentTime, durationTime } = this.props;
		if (!startover) return undefined;
		return getFormattedPlayerTime(currentTime && currentTime < durationTime ? currentTime : 0);
	}

	renderLivePoint() {
		const { startover, endDate, durationTime } = this.props;
		const { liveLabelValue } = this.state;
		const programeIsOver = new Date() > endDate;

		if (startover && !programeIsOver) {
			return (
				<div className={bem.e('live-point')} ref={this.onLivePointRef}>
					<div className={bem.e('live-tip', { 'right-align': this.isPositionAndLiveLabelAlignmentRequired() })}>
						<span className={bem.e('live-label')}>LIVE</span>
						{getFormattedPlayerTime(liveLabelValue * durationTime)}
					</div>
				</div>
			);
		}

		return undefined;
	}

	renderLabel() {
		const { formatLabel, entryId, startover } = this.props;
		if (!entryId && startover) return; // hides the label when in start over mode

		const { showLabel, labelValue, thumbnailLeftPosition, scaleFactor } = this.state;
		const canShowLabel = formatLabel && showLabel;
		const formattedLabel = formatLabel && formatLabel(labelValue);
		const style = {
			left: thumbnailLeftPosition,
			transform: `scale(${scaleFactor}) translateX(-50%)`
		};
		return (
			<div className={bem.e('label', { show: canShowLabel })} style={style} ref={this.onLabelRef}>
				{entryId && this.renderThumbnail()}
				<div className={bem.e('formatted-label')}>{canShowLabel && !!formattedLabel && formattedLabel}</div>
			</div>
		);
	}

	renderThumbnail() {
		const { entryId, playback } = this.props;
		const { labelValue, width, height } = this.state;

		const thumbnailUrl = getKalturaThumbnailsUrl(entryId, width, playback);
		const thumbnailStyles = {
			backgroundImage: `url(${thumbnailUrl})`,
			backgroundPositionX: getThumbnailPositionOfset(labelValue, width) + 'px',
			width,
			height
		};

		return <div className={bem.e('thumbnail')} style={thumbnailStyles} />;
	}
}

function mapDispatchToProps(dispatch) {
	return {
		showThumbnailVisibility: (visibility: boolean) => dispatch(showThumbnailVisibility(visibility))
	};
}

function mapStateToProps(state: state.Root): StateProps {
	return { playback: state.app.config.playback };
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(Slider);
