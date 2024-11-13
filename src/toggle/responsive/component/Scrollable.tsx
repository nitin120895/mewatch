import * as cx from 'classnames';
import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { getCurrentInputMode, subscribeToInputModeChanges, unsubscribeFromInputModeChanges } from 'shared/util/a11y';
import { Bem } from 'shared/util/styles';
import SlideArrow from 'ref/responsive/component/SlideArrow';
import { BREAKPOINT_RANGES, NUM_COLUMNS, isSmallTabletSize } from 'ref/responsive/util/grid';
import CtaButton from 'ref/responsive/component/CtaButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import 'ref/responsive/component/Scrollable.scss';

export type AdaptiveScroll = {
	scrollPerPage: number;
	startScrollPerPage: number;
};

enum ScrollDirection {
	Left = -1,
	Static = 0,
	Right = 1
}

interface ScrollableProps {
	length: number;
	className?: string;
	onScroll?: (scrollX: number, noScroll?: boolean) => void;
	onLoadNext?: () => void;
	onReset?: () => void;
	nextBtnAriaLabel?: string;
	previousBtnAriaLabel?: string;
	columns?: grid.BreakpointColumn[];
	scrollX?: number;
	stopEventPropagation?: boolean;
	arrowClassname?: string;
	adaptiveScroll?: AdaptiveScroll;
	needToResize?: () => boolean;
	showPaginationBullets?: boolean;
	currentIndex?: number;
	alignToCenter?: boolean;
	isGuidingTip?: boolean;
	onCloseGuidingTips?: () => void;
	wrap?: boolean;
	resetEndPosition?: boolean;
	showArrowsOnMobile?: boolean;
}

interface ScrollableState {
	transformPosition?: number;
	currentIndex: number;
	noScrollTransition?: boolean;
	overflows?: boolean;
	showArrows?: boolean;
	inputMode?: input.Mode;
	childFocused?: boolean;
	totalPages?: number;
	singularFirstElement: boolean;
	firstItemOffset: number;
	itemsPerColumn: number;
	maxTransformPosition: number;
	viewPortWidth: number;
	allowResetTransformPosition?: boolean;
}

interface ChildOffset {
	offset: number;
	index: number;
}

const bem = new Bem('scrollable');

/**
 * EASING_MULTIPLIER
 *
 * Used for determining how quickly the transition when swiping will ease out.
 * A number between 1 - 5 is generally recommended, but higher numbers can be used.
 * Under no circumstances should a number less than 1 be used.
 * @type {number}
 */
const EASING_MULTIPLIER = 2; // This should be something between 1 and 5

/**
 * EASING_COUNTER_MAX
 *
 * Number of frames that the ease out animation will take to complete.
 * This is currently set to 60, which is equivalent to 1 second.
 * @type {number}
 */
const EASING_COUNTER_MAX = 100;

/**
 * TOUCH_SPEED_MULTIPLIER
 *
 * Used to give the speed calculated as a result of the user's touch interactions
 * some actual velocity so that it doesn't just crawl after the touchEnd event fires.
 *
 * Decreasing this will reduce the distance that the Scrollable will travel as part
 * of the animation after the touchEnd event fires, while increasing it will increase
 * the distance travelled.
 * @type {number}
 */
const TOUCH_SPEED_MULTIPLIER = 50;

/**
 * Horizontal Scrolling Container
 *
 * Enables horizontal scrolling of an element with overflowing children.
 *
 * Scrolling is supported for mouse, keyboard, and touch input modes.
 *
 * This component blocks free-form scrolling instead opting for paginated scrolling
 * via arrow buttons. We use `translate` rather than `scrollLeft`.
 *
 * Mouse:
 * Scroll arrows are presented on hover allowing the user to click an arrow button
 * to trigger content scrolling.
 *
 * Keyboard:
 * Scroll arrows are presented when a child element within this container is focused.
 * Users can action an arrow button while it is focused to trigger content scrolling.
 *
 * Touch:
 * Scroll arrows are never presented for touch devices. Instead users can swipe left
 * and right to trigger content scrolling.
 */
export default class Scrollable extends React.Component<ScrollableProps, ScrollableState> {
	private container: HTMLElement;
	private scrollArea: HTMLElement;
	private startX: number;
	private startY: number;
	private startTouchTime: Date;
	private momentumAnimation: number;
	private currentX: number;
	private startPacklistScrolling: boolean;
	private startVerticalScrollingFlg: boolean;
	private scrollAreaChildrenOffsets: ChildOffset[] = [];
	private touchXDirection: 'right' | 'left' | undefined;

	static defaultProps = {
		previousBtnAriaLabel: '@{carousel_arrow_left_aria|See previous}',
		nextBtnAriaLabel: '@{carousel_arrow_right_aria|See more}'
	};

	constructor(props: ScrollableProps) {
		super(props);
		this.state = {
			transformPosition:
				props.adaptiveScroll && props.adaptiveScroll.startScrollPerPage ? props.adaptiveScroll.startScrollPerPage : 0,
			currentIndex: 0,
			noScrollTransition: false,
			overflows: false,
			showArrows: props.showArrowsOnMobile && isSmallTabletSize(),
			childFocused: false,
			singularFirstElement: false,
			firstItemOffset: 0,
			itemsPerColumn: 0,
			maxTransformPosition: 0,
			viewPortWidth: 0
		};
	}

	componentDidMount() {
		this.setState({ viewPortWidth: window.innerWidth });
		window.addEventListener('resize', this.onResize, false);
		subscribeToInputModeChanges(this.onInputModeChange);
		this.onInputModeChange(getCurrentInputMode());
		this.setupOffsets();

		const { scrollWidth, offsetWidth } = this.scrollArea;
		this.setState(
			{
				overflows: scrollWidth > offsetWidth,
				totalPages: scrollWidth / this.container.clientWidth
			},
			this.setInitialPosition
		);

		this.restoreScrollPosition(this.props.scrollX);
	}

	componentDidUpdate(prevProps: ScrollableProps, prevState: ScrollableState) {
		const { transformPosition, noScrollTransition } = this.state;
		const { onScroll, onLoadNext, length, scrollX } = this.props;
		if (onScroll && prevState.transformPosition !== transformPosition && this.scrollArea) {
			// Save scroll position - we are using transform, so have to change it to a pixel position
			onScroll(transformPosition, noScrollTransition);
		}

		if (!this.state.overflows && prevState.overflows && onLoadNext) {
			onLoadNext();
		}

		if (length !== prevProps.length) {
			this.doAfterItemsUpdate();
		}

		if (prevProps.scrollX > scrollX && scrollX === 0) {
			this.setState({ transformPosition: 0 });
		}
	}

	componentWillUnmount() {
		if (this.container) {
			this.container.removeEventListener('touchstart', this.onTouchStart);
			this.container.removeEventListener('touchmove', this.onTouchMove, { passive: false } as any);
			this.container.removeEventListener('touchend', this.onTouchEnd);
		}
		window.removeEventListener('resize', this.onResize);
		unsubscribeFromInputModeChanges(this.onInputModeChange);
		this.removeChildFocusListeners(this.state.inputMode);
		this.clearAnimationInterval(false);
	}

	setInitialPosition() {
		const { alignToCenter, currentIndex } = this.props;
		if (alignToCenter) {
			this.setCenteredPosition();
		}

		const itemsCount = this.getItemsPerColumn();
		if (currentIndex && currentIndex > itemsCount && !alignToCenter) {
			const targetIndex = currentIndex - itemsCount;
			this.scrollToTargetIndex(targetIndex, itemsCount);
		}
	}

	setCenteredPosition() {
		const { currentIndex } = this.props;
		const { maxTransformPosition } = this.state;
		const itemsPerColumn = this.getItemsPerColumn();
		const centerItemPosition = currentIndex / itemsPerColumn;
		const itemOffset = (itemsPerColumn - 1) / (itemsPerColumn * 2);
		const currentPosInPercentage = centerItemPosition - itemOffset;
		let transformPosition = Math.max(0, currentPosInPercentage);
		transformPosition = Math.min(transformPosition, maxTransformPosition);
		this.setState({ transformPosition, overflows: this.hasOverflows(transformPosition) });
	}

	private dispatchScrollEvent(direction: ScrollDirection) {
		const domNode = findDOMNode(this);
		const detail = { direction: ScrollDirection[direction] };
		domNode && domNode.dispatchEvent(new CustomEvent('hscroll', { bubbles: true, cancelable: false, detail }));
	}

	private addChildFocusListeners = (mode: input.Mode) => {
		if (mode === 'key') {
			// When in key mode we need to display the scroll arrows however we only want to
			// display the arrows on the row which is currently active/focused.
			// Regular `focus` and `blur` events don't bubble, and our focused elements
			// are external children passed in through props so we can't leverage those events
			// directly. Instead, these `focusin` and `focusout` events do bubble, allowing us
			// to respond to focus changes which allows us to contextually show arrows only on
			// the active/focused row.
			this.container.addEventListener('focusin', this.onChildFocus, false);
			this.container.addEventListener('focusout', this.onChildBlur, false);
		}
	};

	private removeChildFocusListeners = (mode: input.Mode) => {
		if (mode === 'key') {
			this.container.removeEventListener('focusin', this.onChildFocus);
			this.container.removeEventListener('focusout', this.onChildBlur);
		}
	};

	private getBreakpoints = (): string[] => {
		const winWidth = window.innerWidth;

		// always assume phone.
		let breakpoints: string[] = ['phone'];

		if (winWidth > BREAKPOINT_RANGES.phablet.min) {
			breakpoints.push('phablet');
		}

		if (winWidth > BREAKPOINT_RANGES.tablet.min) {
			breakpoints.push('tablet');
		}

		if (winWidth >= BREAKPOINT_RANGES.laptop.min) {
			breakpoints.push('laptop');
		}

		if (winWidth >= BREAKPOINT_RANGES.desktop.min) {
			breakpoints.push('desktop');
		}

		if (winWidth >= BREAKPOINT_RANGES.desktopWide.min) {
			breakpoints.push('desktopWide');
		}

		if (winWidth >= BREAKPOINT_RANGES.uhd.min) {
			breakpoints.push('uhd');
		}

		return breakpoints;
	};

	private getClosestBreakpoint = (breakpoints: grid.BreakpointColumn[]) => {
		if (!breakpoints) return;

		const possibleBreakpoints = this.getBreakpoints();
		const filteredBreakpoints = breakpoints.filter(bp => {
			const breakpointName = Object.keys(bp)[0];
			return breakpointName && possibleBreakpoints.indexOf(breakpointName) > -1;
		});

		return filteredBreakpoints[filteredBreakpoints.length - 1];
	};

	private getElementIndex(currentIndex: number, increment: number) {
		const { length } = this.props;
		const { firstItemOffset, singularFirstElement } = this.state;
		const offset = currentIndex === 0 ? (singularFirstElement ? 1 : 0) + firstItemOffset : 0;

		let nextIndex: number;

		// example of columns
		// columns: [{ phone: 12 }, { phablet: 8 }, { tablet: 6 }, { laptop: 4 }, { desktop: 3 }]

		nextIndex = currentIndex + increment - offset;

		nextIndex = Math.max(0, nextIndex);
		nextIndex = Math.min(nextIndex, length);
		return nextIndex;
	}

	private recalculateCurrentIndex = (transformPosition: number): number => {
		const closestChild = this.scrollAreaChildrenOffsets.sort((child1, child2) => {
			return (
				Math.abs(child1['offset'] - this.scrollArea.offsetWidth * transformPosition) -
				Math.abs(child2['offset'] - this.scrollArea.offsetWidth * transformPosition)
			);
		})[0];

		return closestChild.index;
	};

	private scrollToElement(targetElementIndex: number, noTransitionFlag?: boolean) {
		const newState: any = {};
		const { maxTransformPosition, firstItemOffset } = this.state;
		const { offsetWidth, children } = this.scrollArea;
		const { adaptiveScroll } = this.props;

		targetElementIndex = Math.min(children.length - 1, targetElementIndex);
		const targetElement = children[targetElementIndex] as HTMLElement;

		if (targetElement) {
			let offset = targetElement.offsetLeft;
			// This is required as Safari's implementation of `offsetLeft` includes the padding of the parent
			// whereas other browsers do not.
			// We check for the presence of "chrome" as at time of writing Chrome's useragent is
			// "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
			const userAgent = navigator.userAgent.toLowerCase();
			if (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1)
				offset -= parseInt(window.getComputedStyle(this.container).paddingLeft);

			let targetTransformPosition = offset / offsetWidth;

			if (adaptiveScroll && adaptiveScroll.scrollPerPage) {
				targetTransformPosition = targetTransformPosition - adaptiveScroll.scrollPerPage;
			}

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
		newState.noScrollTransition = noTransitionFlag;

		newState.allowResetTransformPosition = newState.transformPosition >= maxTransformPosition;

		this.saveTransformPosition();
		return newState;
	}

	public restoreScrollPosition(targetTransformPosition: number, forceScroll = false) {
		if (targetTransformPosition > 0 || (targetTransformPosition === 0 && forceScroll)) {
			const length = this.props.length;
			if (!length) return;

			const newState: any = {};
			newState.maxTransformPosition = this.getMaxTransformPosition();

			newState.transformPosition =
				targetTransformPosition > newState.maxTransformPosition
					? newState.maxTransformPosition
					: targetTransformPosition;
			newState.currentIndex = this.recalculateCurrentIndex(newState.transformPosition);
			newState.overflows = this.hasOverflows(newState.transformPosition);
			newState.noScrollTransition = true;
			this.setState(newState);

			// if we are at the end of the collection after scroll position restoration, let's check next items page
			if (newState.transformPosition === newState.maxTransformPosition) {
				this.onScrollAreaTransitioned();
			}
		}
	}

	private getClosestOffset = (classList: string[]): string => {
		const breakpoints = this.getBreakpoints();

		do {
			let bp = breakpoints.pop();
			let filteredClassList = classList.filter(className => className.indexOf(bp) > -1);
			if (filteredClassList.length > 0) return filteredClassList.reverse()[0];
		} while (breakpoints.length > 0);

		return undefined;
	};

	private scrollToTargetIndex = (targetIndex: number, itemsPerColumn: number, noScrollTransition = false) => {
		if (targetIndex !== this.state.currentIndex) {
			const next = targetIndex > this.state.currentIndex ? ScrollDirection.Right : ScrollDirection.Left;
			this.dispatchScrollEvent(next);
		}

		let newState = this.scrollToElement(targetIndex);

		newState.itemsPerColumn = itemsPerColumn;
		newState.noScrollTransition = noScrollTransition;

		this.setState(newState);
	};

	private forward = () => {
		const { wrap } = this.props;
		const { overflows } = this.state;
		const itemsPerColumn = this.getItemsPerColumn();
		const nextIndex = this.getElementIndex(this.state.currentIndex, itemsPerColumn);
		if (wrap && !overflows) {
			// Scroll back to start of array of items.
			this.scrollToTargetIndex(0, itemsPerColumn);
		} else {
			this.scrollToTargetIndex(nextIndex, itemsPerColumn);
		}
	};

	private backward = () => {
		const itemsPerColumn = this.getItemsPerColumn();
		const prevIndex = this.getElementIndex(this.state.currentIndex, itemsPerColumn * -1);
		this.scrollToTargetIndex(prevIndex, itemsPerColumn);
	};

	private getItemsPerColumn() {
		let { itemsPerColumn } = this.state;

		if (itemsPerColumn === 0) {
			const closestBreakpoint = this.getClosestBreakpoint(this.props.columns);
			if (this.props.columns && closestBreakpoint) {
				const columnSize = Object.values(closestBreakpoint)[0];
				itemsPerColumn = NUM_COLUMNS / columnSize;
			} else {
				// Ensure that the children are ordered. Sometimes they can be out of order.
				this.scrollAreaChildrenOffsets.sort((child1, child2) => {
					return child1.index - child2.index;
				});

				do {
					itemsPerColumn++;
				} while (
					this.scrollAreaChildrenOffsets[itemsPerColumn] &&
					this.scrollAreaChildrenOffsets[itemsPerColumn].offset < this.scrollArea.offsetWidth
				);
			}
		}

		return itemsPerColumn;
	}

	private stopEventPropagation(e: React.SyntheticEvent<HTMLElement>, force?: boolean) {
		if (e && (this.props.stopEventPropagation || force)) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	private setupOffsets() {
		const newState: any = {};

		let firstItem: HTMLElement;
		if (this.scrollArea.children.length > 0) {
			firstItem = this.scrollArea.children[0] as HTMLElement;
			const firstItemOffsetClasses = Array.from(firstItem.classList).filter(
				className => className.indexOf('-offset-') > -1
			);
			const closestOffset = this.getClosestOffset(firstItemOffsetClasses);

			newState.firstItemOffset = 0;
			if (closestOffset) {
				// This is relative to the screen size, but always equates to two items. For now this can be hardcoded.
				newState.firstItemOffset = 2;
			}
		}

		const closestBreakpoint = this.getClosestBreakpoint(this.props.columns);
		if (this.props.columns && firstItem && closestBreakpoint) {
			const columnName = Object.keys(closestBreakpoint)[0];
			const columnSize = Object.values(closestBreakpoint)[0];
			newState.itemsPerColumn = Math.floor(NUM_COLUMNS / columnSize);

			newState.singularFirstElement =
				firstItem && !firstItem.classList.contains('col-' + columnName + '-' + columnSize);
		}

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
				offset: child.offsetLeft,
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
		const { overflows, transformPosition, inputMode, childFocused } = this.state;
		return overflows || transformPosition > 0 || (childFocused && inputMode === 'key');
	};

	private getMaxTransformPosition() {
		const { scrollWidth, offsetWidth } = this.scrollArea;
		return (scrollWidth - offsetWidth) / offsetWidth;
	}

	private hasOverflows(position: number) {
		const { offsetWidth, children } = this.scrollArea;
		const targetElement = children[this.props.length - 1] as HTMLElement;
		const maxPosition = this.getMaxTransformPosition();
		return (
			position < maxPosition &&
			(targetElement ? maxPosition - position >= (targetElement.scrollWidth * 0.5) / offsetWidth : true)
		);
	}

	private clearAnimationInterval = (animateToClosest: boolean) => {
		if (this.momentumAnimation) cancelAnimationFrame(this.momentumAnimation);

		if (animateToClosest) {
			const { transformPosition } = this.state;

			const closeChildren = this.scrollAreaChildrenOffsets.sort((child1, child2) => {
				return (
					Math.abs(child1['offset'] - this.scrollArea.offsetWidth * transformPosition) -
					Math.abs(child2['offset'] - this.scrollArea.offsetWidth * transformPosition)
				);
			});

			const closest = closeChildren[0];
			this.setState(this.scrollToElement(closest.index));

			this.saveTransformPosition();
		}
	};

	private saveTransformPosition = () => {
		const { onScroll } = this.props;
		if (onScroll) onScroll(this.state.transformPosition);
	};

	private static convertCssTransformMatrix(matrix: string): number[] {
		matrix = matrix.replace('matrix(', '');
		matrix = matrix.replace(')', '');
		const stringArray = matrix.split(',');

		let numArray: number[] = [];
		for (let i in stringArray) {
			numArray.push(parseFloat(stringArray[i]));
		}

		return numArray;
	}

	private determineTouchEndTargetElementIndex = (speed: number, transformPosition: number, counter = 0) => {
		const nextSpeed = speed * (1 - Math.pow(counter++ / EASING_COUNTER_MAX, EASING_MULTIPLIER));
		const nextTransformPosition = transformPosition + nextSpeed / this.scrollArea.scrollWidth;
		const { maxTransformPosition } = this.state;

		if (nextTransformPosition < 0) return 0;
		else if (nextTransformPosition > maxTransformPosition)
			return this.scrollAreaChildrenOffsets.sort(function(a, b) {
				return b.index - a.index;
			})[0].index;
		else if (Math.abs(nextSpeed) < 1 || counter >= EASING_COUNTER_MAX) {
			const targetScroll = transformPosition * this.scrollArea.offsetWidth;
			const orderedChildren = this.scrollAreaChildrenOffsets.sort((a, b) => {
				const aDiff = Math.abs(targetScroll - a.offset);
				const bDiff = Math.abs(targetScroll - b.offset);

				return aDiff > bDiff ? 1 : -1;
			});

			return orderedChildren[0].index;
		}

		return this.determineTouchEndTargetElementIndex(speed, nextTransformPosition, counter);
	};

	private onInputModeChange = (inputMode: input.Mode) => {
		if (inputMode === 'key') {
			this.addChildFocusListeners(inputMode);
		} else {
			this.removeChildFocusListeners(inputMode);
		}
		this.setState({ inputMode });
	};

	private onChildFocus = () => {
		const newState: any = { childFocused: true };
		if (this.state.inputMode === 'key') newState.showArrows = true;
		this.setState(newState);
	};

	private onChildBlur = (e: FocusEvent) => {
		const newState: any = { childFocused: false };
		if (this.state.inputMode === 'key') {
			const currentTarget = e.currentTarget as HTMLElement;
			const newFocusedElement = e.relatedTarget as HTMLElement;
			if (!currentTarget.contains(newFocusedElement)) newState.showArrows = false;
		}
		this.setState(newState);
	};

	private onContainerReference = ref => {
		this.container = ref;
		if (this.container) {
			this.container.addEventListener('touchstart', this.onTouchStart);
			this.container.addEventListener('touchmove', this.onTouchMove, { passive: false } as any);
			this.container.addEventListener('touchend', this.onTouchEnd);
		}
	};

	private onScrollAreaReference = ref => {
		this.scrollArea = ref;

		if (this.scrollArea) {
			const { scrollWidth, offsetWidth } = this.scrollArea;
			const overflows = scrollWidth > offsetWidth;
			if (overflows !== this.state.overflows) {
				this.setState({ overflows });
			}
		}
	};

	private onScrollAreaTransitioned = () => {
		const { onLoadNext, length } = this.props;
		const { currentIndex } = this.state;
		const itemsPerColumn = this.getItemsPerColumn();
		// try to load next items page while at the end of the list or not full item's page remains for scrolling
		if (onLoadNext && (!this.state.overflows || currentIndex + itemsPerColumn < length)) {
			onLoadNext();
		}
	};

	private onResize = () => {
		const scrollArea = this.scrollArea;
		const { length } = this.props;
		if (!scrollArea || !scrollArea.offsetWidth || !length) return;
		// Check if viewport width has changed horizontally, not just
		// vertically due to navigation bar: ie: Safari iPad
		const currentViewPortWidth = window.innerWidth;
		// This check prevents the scroll event firing unnecessarily when
		// there has been no horizontal change to the viewport size
		if (currentViewPortWidth !== this.state.viewPortWidth) {
			this.setState({ viewPortWidth: currentViewPortWidth });
			this.setupOffsets();
			this.setState(this.scrollToElement(this.state.currentIndex, true));
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

	private onScroll = (e: React.SyntheticEvent<HTMLElement>) => {
		this.stopEventPropagation(e);
		// We block horizontal scrolling since we're using `transform` instead.
		// This is necessary because when tabbing through elements the browser will attempt
		// to automatically scroll the newly focused content into view. Instead we want to
		// redirect the user to the scroll arrows.
		const target = e.currentTarget;
		if (target.scrollLeft !== 0) {
			// the scroll event occurs after it has moved so we can't prevent it, we can only reset it.
			target.scrollLeft = 0;
		}

		this.saveTransformPosition();
	};

	private onTouchStart = (e: any) => {
		this.setupOffsets();
		this.stopEventPropagation(e);
		const { clientX, clientY } = e.changedTouches[0];
		this.startX = this.currentX = clientX;
		this.startY = clientY;
		this.touchXDirection = undefined;
		// Save current transformPosition for future use
		this.clearAnimationInterval(false);
		this.startTouchTime = new Date();

		const transformValue = window.getComputedStyle(this.scrollArea).getPropertyValue('transform');
		const transformArray = Scrollable.convertCssTransformMatrix(transformValue);
		const currentTransformPosition = Math.abs(transformArray[4]) / this.scrollArea.offsetWidth;

		this.setState({ transformPosition: currentTransformPosition, noScrollTransition: true });
	};

	private onTouchMove = (e: any) => {
		this.stopEventPropagation(e);
		const { clientX, clientY } = e.changedTouches[0];

		const { transformPosition, maxTransformPosition } = this.state;

		const xDiff = Math.abs(clientX - this.startX);

		// Check move direction first
		if (!this.startPacklistScrolling && !this.startVerticalScrollingFlg) {
			const yDiff = Math.abs(clientY - this.startY);

			this.startVerticalScrollingFlg = yDiff > xDiff;
			this.startPacklistScrolling = !this.startVerticalScrollingFlg;
		}

		if (this.startVerticalScrollingFlg) {
			return;
		}
		this.stopEventPropagation(e, true);

		this.clearAnimationInterval(false);
		// For horizontal move, need to stop page scrolling and change the current transform position
		this.momentumAnimation = window.requestAnimationFrame(() => {
			const delta = (this.currentX - clientX) / this.scrollArea.offsetWidth;
			const touchXDirection = this.currentX - clientX >= 0 ? 'right' : 'left';

			if (this.touchXDirection !== touchXDirection) {
				this.startX = clientX;
				this.startTouchTime = new Date();
				this.touchXDirection = touchXDirection;
			}

			this.currentX = clientX;

			let newTransformPosition = transformPosition + delta;

			if (newTransformPosition < 0) {
				newTransformPosition = 0;
			} else if (newTransformPosition > maxTransformPosition) {
				newTransformPosition = maxTransformPosition;
			}

			this.setState({ transformPosition: newTransformPosition, noScrollTransition: true });
		});
	};

	private onTouchEnd = (e: any) => {
		this.stopEventPropagation(e);
		const { clientX } = e.changedTouches[0];
		const { maxTransformPosition, transformPosition, currentIndex, allowResetTransformPosition } = this.state;
		const { resetEndPosition } = this.props;

		if (this.startPacklistScrolling) {
			// determine the end scroll location rather than scrolling. let the system handle the animation

			if (clientX === this.startX) return;

			const xDiff = this.startX - this.currentX;

			const endTouchTime = new Date();
			const timeDiff = endTouchTime.getTime() - this.startTouchTime.getTime();

			const speed = (xDiff / timeDiff) * TOUCH_SPEED_MULTIPLIER;

			// Inform parent elements when transition should be aborted
			if (xDiff === 0 && this.state.currentIndex === 0 && this.props.onReset) {
				this.props.onReset();
			}

			this.clearAnimationInterval(false);

			// Check if at the end of scrollable area, scroll back to beginning
			if (maxTransformPosition === transformPosition && allowResetTransformPosition && resetEndPosition) {
				this.setState({ transformPosition: 0, currentIndex: 0, noScrollTransition: false });
			} else {
				// Ensures that can't swipe further than next 'set' of items per column.
				const itemsPerColumn = this.getItemsPerColumn();
				const maxNextIndex = currentIndex + itemsPerColumn;
				const newTransformIndex = this.determineTouchEndTargetElementIndex(speed, transformPosition);
				const newState = this.scrollToElement(Math.min(newTransformIndex, maxNextIndex));
				this.setState(newState);
			}
		}

		this.startVerticalScrollingFlg = false;
		this.startPacklistScrolling = false;
	};

	renderPaginationBullets() {
		return (
			<div className={bem.e('pagination')}>
				{this.getGuidingTips().map((el, index) => (
					<div
						key={index}
						className={cx(
							bem.e('bullet'),
							{ 'current-index ': index === this.state.currentIndex },
							{ 'margin-left': !!index }
						)}
					/>
				))}
			</div>
		);
	}

	getGuidingTipCTAMap() {
		const { currentIndex } = this.state;
		const { onCloseGuidingTips } = this.props;
		const guidingTipsLength = this.getGuidingTips().length;
		const isLastGuidingTip = currentIndex === guidingTipsLength - 1;

		let action = {
			label: '@{guiding_tip_btn_label_next}',
			onClick: this.forward
		};

		if (guidingTipsLength === 1 || isLastGuidingTip) {
			action = {
				label: '@{guiding_tip_btn_label_gotit}',
				onClick: onCloseGuidingTips
			};
		}

		return action;
	}

	getGuidingTips() {
		const { children } = this.props;
		return Object.keys(children).map(key => {
			return [children[key]];
		});
	}

	renderGuidingTipCTA() {
		const { label, onClick } = this.getGuidingTipCTAMap();

		return (
			<div className={bem.e('gudingTip-btn')} onClick={onClick}>
				<CtaButton ordinal="primary">
					<IntlFormatter>{label}</IntlFormatter>
				</CtaButton>
			</div>
		);
	}

	render() {
		const {
			className,
			children,
			nextBtnAriaLabel,
			previousBtnAriaLabel,
			arrowClassname,
			showPaginationBullets,
			isGuidingTip,
			wrap
		} = this.props;
		const { transformPosition, noScrollTransition, overflows, showArrows, inputMode, childFocused } = this.state;
		const isKeyMode = childFocused && inputMode === 'key';
		const containerClasses = bem.e('container', {
			'no-transition': noScrollTransition
		});
		const transformStyle =
			transformPosition !== 0 ? { transform: `translateX(-${transformPosition * 100}%)` } : undefined;
		const leftArrowVisible = showArrows && transformPosition > 0;
		const rightArrowVisible = showArrows && (overflows || wrap);

		return (
			<div
				className={cx(bem.b(isKeyMode ? 'key-mode' : ''), className)}
				ref={this.onContainerReference}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
				onScroll={this.onScroll}
			>
				<SlideArrow
					direction={'left'}
					visible={leftArrowVisible}
					onClick={this.backward}
					disabled={!leftArrowVisible}
					ariaLabel={previousBtnAriaLabel}
					className={arrowClassname}
				/>
				<div className={containerClasses} style={transformStyle} ref={this.onScrollAreaReference}>
					{children}
				</div>
				<SlideArrow
					direction={'right'}
					visible={rightArrowVisible}
					onClick={this.forward}
					disabled={!rightArrowVisible}
					ariaLabel={nextBtnAriaLabel}
					className={arrowClassname}
				/>
				{showPaginationBullets && this.renderPaginationBullets()}
				{!showPaginationBullets && <div className={bem.e('no-pagination-spacer')} />}
				{isGuidingTip && this.renderGuidingTipCTA()}
			</div>
		);
	}
}
