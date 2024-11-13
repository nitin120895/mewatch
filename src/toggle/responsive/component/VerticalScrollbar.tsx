import * as cx from 'classnames';
import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { Bem } from 'shared/util/styles';
import SlideArrow from './SlideArrow';

import './VerticalScrollbar.scss';

enum ScrollDirection {
	Top = -1,
	Static = 0,
	Down = 1
}

interface VerticalScrollbarProps {
	length: number;
	className?: string;
	currentIndex: number;
}

interface VerticalScrollbarState {
	transformPosition?: number;
	currentIndex: number;
	overflows?: boolean;
	showArrows?: boolean;
	inputMode?: input.Mode;
	firstItemOffset: number;
	itemsPerColumn: number;
	maxTransformPosition: number;
	viewPortHeight: number;
	allowResetTransformPosition?: boolean;
}

interface ChildOffset {
	offset: number;
	index: number;
}

const bem = new Bem('vertical-scrollbar');

export default class VerticalScrollbar extends React.Component<VerticalScrollbarProps, VerticalScrollbarState> {
	private container: HTMLElement;
	private scrollArea: HTMLElement;
	private momentumAnimation: number;
	private scrollAreaChildrenOffsets: ChildOffset[] = [];

	constructor(props: VerticalScrollbarProps) {
		super(props);
		this.state = {
			transformPosition: 0,
			currentIndex: this.props.currentIndex,
			overflows: false,
			showArrows: false,
			firstItemOffset: 0,
			itemsPerColumn: 0,
			maxTransformPosition: 0,
			viewPortHeight: 0
		};
	}

	componentDidMount() {
		this.setState({ viewPortHeight: window.innerHeight });
		window.addEventListener('resize', this.onResize, false);
		this.setupOffsets();
		const { scrollHeight, offsetHeight } = this.container;
		this.setState({
			overflows: scrollHeight > offsetHeight,
			itemsPerColumn: Math.floor(offsetHeight / this.scrollArea.children[0].scrollHeight)
		});
	}

	componentDidUpdate(prevProps: VerticalScrollbarProps, prevState: VerticalScrollbarState) {
		if (prevProps.currentIndex !== this.props.currentIndex) {
			this.setState(
				{
					currentIndex: this.props.currentIndex
				},
				this.forward
			);
		}

		if (this.props.length !== prevProps.length) {
			this.doAfterItemsUpdate();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onResize);
		this.clearAnimationInterval(false);
	}

	private dispatchScrollEvent(direction: ScrollDirection) {
		const domNode = findDOMNode(this);
		const detail = { direction: ScrollDirection[direction] };
		domNode && domNode.dispatchEvent(new CustomEvent('hscroll', { bubbles: true, cancelable: false, detail }));
	}

	private getElementIndex(currentIndex: number, increment: number) {
		const { length } = this.props;
		const { firstItemOffset } = this.state;
		const offset = currentIndex === 0 ? firstItemOffset : 0;
		let nextIndex = currentIndex + increment - offset;
		nextIndex = Math.max(0, nextIndex);
		nextIndex = Math.min(nextIndex, length);
		return nextIndex;
	}

	private recalculateCurrentIndex = (transformPosition: number): number => {
		const closestChild = this.scrollAreaChildrenOffsets.sort((child1, child2) => {
			return (
				Math.abs(child1['offset'] - this.scrollArea.offsetHeight * transformPosition) -
				Math.abs(child2['offset'] - this.scrollArea.offsetHeight * transformPosition)
			);
		})[0];

		return closestChild.index;
	};

	private scrollToElement(targetElementIndex: number, noTransitionFlag?: boolean) {
		const newState: any = {};
		const { maxTransformPosition, firstItemOffset } = this.state;
		const { offsetHeight, children } = this.scrollArea;

		targetElementIndex = Math.min(children.length - 1, targetElementIndex);
		const targetElement = children[targetElementIndex] as HTMLElement;

		if (targetElement) {
			let offset = targetElement.offsetTop;
			const userAgent = navigator.userAgent.toLowerCase();
			if (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1)
				offset -= parseInt(window.getComputedStyle(this.container).paddingTop);

			let targetTransformPosition = offset / offsetHeight;

			if (targetElementIndex <= 0 && firstItemOffset > 0) {
				targetTransformPosition = 0;
			} else {
				targetTransformPosition = Math.max(0, targetTransformPosition);
				targetTransformPosition = Math.min(targetTransformPosition, maxTransformPosition);
			}

			newState.overflows = this.hasOverflows(targetTransformPosition);
			newState.transformPosition = targetTransformPosition;
		}

		newState.currentIndex = this.recalculateCurrentIndex(newState.transformPosition);
		newState.allowResetTransformPosition = newState.transformPosition >= maxTransformPosition;

		return newState;
	}

	private scrollToTargetIndex = (targetIndex: number, itemsPerColumn: number) => {
		const { currentIndex } = this.state;
		if (targetIndex !== currentIndex) {
			const next = targetIndex > currentIndex ? ScrollDirection.Down : ScrollDirection.Top;
			this.dispatchScrollEvent(next);
		}

		let newState = this.scrollToElement(targetIndex);
		newState.itemsPerColumn = itemsPerColumn;

		this.setState(newState);
	};

	private forward = () => {
		const { itemsPerColumn, currentIndex } = this.state;
		const nextIndex = this.getElementIndex(currentIndex, itemsPerColumn);
		this.scrollToTargetIndex(nextIndex, itemsPerColumn);
	};

	private backward = () => {
		const { itemsPerColumn, currentIndex } = this.state;
		const prevIndex = this.getElementIndex(currentIndex, itemsPerColumn * -1);
		this.scrollToTargetIndex(prevIndex, itemsPerColumn);
	};

	private setupOffsets() {
		const newState: any = {};

		this.prepareScrollAreaChildrenOffsets();
		newState.maxTransformPosition = this.getMaxTransformPosition();
		newState.overflows = this.hasOverflows(0);
		this.setState(newState);
	}

	private prepareScrollAreaChildrenOffsets() {
		this.scrollAreaChildrenOffsets = [];
		for (let i = 0; i < this.scrollArea.children.length; i++) {
			const child: HTMLElement = this.scrollArea.children[i] as HTMLElement;

			this.scrollAreaChildrenOffsets.push({
				offset: child.offsetTop,
				index: i
			});
		}
	}

	private doAfterItemsUpdate() {
		this.setState({
			maxTransformPosition: this.getMaxTransformPosition(),
			overflows: this.hasOverflows(this.state.transformPosition)
		});

		this.prepareScrollAreaChildrenOffsets();
	}

	private shouldShowArrows = () => {
		const { overflows, transformPosition } = this.state;
		return overflows || transformPosition > 0;
	};

	private getMaxTransformPosition() {
		const { scrollHeight, offsetHeight } = this.container;
		return (scrollHeight - offsetHeight) / scrollHeight;
	}

	private hasOverflows(position: number) {
		const { offsetHeight, children } = this.scrollArea;
		const targetElement = children[this.props.length - 1] as HTMLElement;
		const maxPosition = this.getMaxTransformPosition();
		return (
			position < maxPosition &&
			(targetElement ? maxPosition - position >= (targetElement.scrollHeight * 0.5) / offsetHeight : true)
		);
	}

	private clearAnimationInterval = (animateToClosest: boolean) => {
		if (this.momentumAnimation) cancelAnimationFrame(this.momentumAnimation);

		if (animateToClosest) {
			const { transformPosition } = this.state;

			const closeChildren = this.scrollAreaChildrenOffsets.sort((child1, child2) => {
				return (
					Math.abs(child1['offset'] - this.scrollArea.offsetHeight * transformPosition) -
					Math.abs(child2['offset'] - this.scrollArea.offsetHeight * transformPosition)
				);
			});

			const closest = closeChildren[0];
			this.setState(this.scrollToElement(closest.index));
		}
	};

	private onContainerReference = ref => {
		this.container = ref;
	};

	private onScrollAreaReference = ref => {
		this.scrollArea = ref;

		if (this.scrollArea) {
			const { scrollHeight, offsetHeight } = this.scrollArea;
			const overflows = scrollHeight > offsetHeight;
			if (overflows !== this.state.overflows) {
				this.setState({ overflows });
			}
		}
	};

	private onResize = () => {
		const scrollArea = this.scrollArea;
		const { length } = this.props;
		const { currentIndex, viewPortHeight } = this.state;
		if (!scrollArea || !scrollArea.offsetHeight || !length) return;
		const currentViewPortHeight = window.innerHeight;
		if (currentViewPortHeight !== viewPortHeight) {
			this.setState({ viewPortHeight: currentViewPortHeight });
			this.setupOffsets();
			this.setState(this.scrollToElement(currentIndex, true));
		}
	};

	private onMouseEnter = () => {
		if (!this.shouldShowArrows()) return;
		this.setState({ showArrows: true });
	};

	private onMouseLeave = () => {
		if (!this.shouldShowArrows()) return;
		this.setState({ showArrows: false });
	};

	render() {
		const { className, children } = this.props;
		const { transformPosition, overflows, showArrows } = this.state;
		const containerClasses = bem.e('container');
		const transformStyle =
			transformPosition !== 0 ? { transform: `translateY(-${transformPosition * 100}%)` } : undefined;
		const upArrowVisible = showArrows && transformPosition > 0;
		const downArrowVisible = showArrows && overflows;
		return (
			<div
				className={cx(bem.b(), className)}
				ref={this.onContainerReference}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
			>
				<SlideArrow direction={'up'} visible={upArrowVisible} onClick={this.backward} disabled={!upArrowVisible} />
				<div className={containerClasses} style={transformStyle} ref={this.onScrollAreaReference}>
					{children}
				</div>
				<SlideArrow direction={'down'} visible={downArrowVisible} onClick={this.forward} disabled={!downArrowVisible} />
			</div>
		);
	}
}
