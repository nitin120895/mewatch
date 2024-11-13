import * as React from 'react';
import * as cx from 'classnames';
import { supportsPassiveEvents } from 'shared/util/browser';

interface SwipeProps {
	className?: string;
	swipeLeft?: () => void;
	swipeRight?: () => void;
	drag?: boolean; // When true touch dragging is enabled, when false swipe gestures are used.
	transitionDuration?: number;
	disabled?: boolean;
	onTouchStart?: (e) => void;
}

import './Swipe.scss';

export default class Swipe extends React.Component<SwipeProps, any> {
	private startX: number;
	private currentX: number;
	private minSwipeDelta = 30;
	private scrollElement: HTMLElement;
	private swipeElement: HTMLElement;
	private offset = 0;
	private requestAnimationFrame: number;

	static defaultProps = {
		drag: true,
		transitionDuration: '300ms',
		disabled: false
	};

	componentDidMount() {
		this.setUpEvents(this.props.disabled);
	}

	componentWillUpdate(nextProps) {
		if (nextProps.disabled !== this.props.disabled) this.setUpEvents(nextProps.disabled);
	}

	private swiping = deltaX => {
		if (Math.abs(deltaX) > this.minSwipeDelta) {
			if (deltaX > 0) this.props.swipeLeft();
			if (deltaX < 0) this.props.swipeRight();
		}
	};

	private update = () => {
		this.offset = -(this.startX - this.currentX);
		if (this.props.drag) this.scrollElement.style.transform = `translateX(${this.offset}px)`;
		this.requestAnimationFrame = window.requestAnimationFrame(this.update);
	};

	private onSwipeReference = node => {
		this.swipeElement = node;
	};

	private onScrollReference = node => {
		this.scrollElement = node;
	};

	private onTouchStart = e => {
		e.stopPropagation();
		this.scrollElement.style.transitionDuration = '0ms';
		this.requestAnimationFrame = window.requestAnimationFrame(this.update);
		const { clientX } = e.changedTouches[0];
		this.startX = clientX;
		this.currentX = this.startX;
		if (this.props.onTouchStart) this.props.onTouchStart(e);
	};

	private onTouchEnd = e => {
		this.swiping(this.offset);
		if (this.props.drag) {
			window.cancelAnimationFrame(this.requestAnimationFrame);
			setTimeout(() => {
				if (this.scrollElement) {
					this.scrollElement.style.transitionDuration = this.props.transitionDuration + 'ms';
					this.scrollElement.style.transform = 'translateX(0)';
				}
			});
		}
	};

	private onTouchMove = e => {
		const { clientX } = e.changedTouches[0];
		this.currentX = clientX;
	};

	private setUpEvents = disabled => {
		if (!disabled) {
			const options: any = supportsPassiveEvents() ? { passive: true } : false;
			this.swipeElement.addEventListener('touchstart', this.onTouchStart, options);
			this.swipeElement.addEventListener('touchend', this.onTouchEnd, options);
			this.swipeElement.addEventListener('touchmove', this.onTouchMove, options);
		} else {
			this.swipeElement.removeEventListener('touchstart', this.onTouchStart);
			this.swipeElement.removeEventListener('touchend', this.onTouchEnd);
			this.swipeElement.removeEventListener('touchmove', this.onTouchMove);
		}
	};

	render() {
		const classes = cx('swipe', this.props.className);
		return (
			<div className={classes} ref={this.onScrollReference}>
				<div className="swipe__container" ref={this.onSwipeReference}>
					{this.props.children}
				</div>
			</div>
		);
	}
}
