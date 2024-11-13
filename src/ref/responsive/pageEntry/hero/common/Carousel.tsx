import { findDOMNode } from 'react-dom';
import * as React from 'react';
import * as cx from 'classnames';
import { BREAKPOINT_RANGES } from 'ref/responsive/util/grid';
import { Bem } from 'shared/util/styles';
import SlideArrow from 'ref/responsive/component/SlideArrow';
import Swipe from 'ref/responsive/component/Swipe';
import { resolveImages } from 'shared/util/images';
import CarouselItem from './CarouselItem';

import './Carousel.scss';

const BemCarousel = new Bem('carousel');

const tabletBreakpoint = BREAKPOINT_RANGES['tablet'];
const tabletEnd = `(max-width: ${tabletBreakpoint.min - 1}px)`;
const tabletStart = `(min-width: ${tabletBreakpoint.min}px)`;
import { toMedian } from 'shared/util/math';

const mobileImageWidth: number = toMedian([
	BREAKPOINT_RANGES['phone'].min,
	BREAKPOINT_RANGES['tablet'].min,
	BREAKPOINT_RANGES['laptop'].min
]);

const desktopImageWidth: number = toMedian([
	BREAKPOINT_RANGES['desktop'].min,
	BREAKPOINT_RANGES['desktopWide'].min,
	BREAKPOINT_RANGES['uhd'].min
]);

export interface CarouselProps extends PageEntryListProps {
	mobileImageSize?: image.Type;
	desktopImageSize?: image.Type;
	items?: (list: any[]) => void;
	disableArrows?: boolean;
	scrollTo?: number;
	itemIndex?: (number: number) => void;
	onRef?: (e: HTMLElement) => void;
	style?: any;
	imageOffsetTop?: string;
	transitionDisabled?: (state: boolean) => void;
	itemTransitionsDisabled?: boolean;
	scrollToEnabled?: boolean;
	nextBtnAriaLabel?: string;
	previousBtnAriaLabel?: string;

	// turn autoplay on and off
	autoPlayToggle?: boolean;

	// on autoplay state change
	onAutoPlayingChange?: (state: boolean) => void;

	// enable or disable autoplay
	autoPlayEnabled?: boolean;

	// on autoplay enabled state change
	onAutoPlayEnabledChange?: (state: boolean) => void;

	// peeking component based on carousel
	isPeeking?: boolean;
}

type Direction = '<-' | '->';

function transitionTime() {
	let timeToTravel = 1000;
	if (typeof window !== 'undefined') {
		if (window.innerWidth < 960) timeToTravel = Math.max(600, Math.round(timeToTravel * (window.innerWidth / 960)));
	}
	return timeToTravel;
}

function countLoop(index: number, first?: number, last?: number, amount = 0) {
	index += 1;
	first += 1;
	last += 1;
	index += amount;
	if (index > last) {
		const diff = Math.abs(index - last);
		if (diff === 1) return first - 1;
		return first + diff - 2;
	} else if (index < first) {
		const diff = Math.abs(index - first);
		if (diff === 1) return last - 1;
		return last - diff;
	} else {
		index -= 1;
		return index;
	}
}

function onScroll(e: React.SyntheticEvent<HTMLElement>) {
	// We block horizontal scrolling since we're using `transform` instead.
	// This is necessary because when tabbing through elements the browser will attempt
	// to automatically scroll the newly focused content into view. Instead we wan't to
	// redirect the user to the scroll arrows.
	const target = e.currentTarget;

	if (target.scrollLeft !== 0) {
		// the scroll event occurs after it has moved so we can't prevent it, we can only reset it.
		target.scrollLeft = 0;
	}
}

const cloneItem = item => Object.assign({}, item);
const posNeg = (direction: Direction, value) => (direction === '->' ? value : -Math.abs(value));
const transforms = [-200, -100, 0, 100, 200];

const MAX_SLIDES = 12;

export default class Carousel extends React.Component<CarouselProps, any> {
	static defaultProps = {
		className: '',
		disableArrows: false,
		scrollTo: 0,
		customFields: {
			autoCycle: 0,
			textHorizontalAlignment: 'middle' // default for h5
		},
		mobileImageSize: 'hero4x3',
		desktopImageSize: 'hero3x1',
		itemTransitionsDisabled: false,
		scrollToEnabled: false,
		previousBtnAriaLabel: '@{carousel_hero_arrow_left_aria|See previous}',
		nextBtnAriaLabel: '@{carousel_hero_arrow_right_aria|See more}',
		isPeeking: false
	};

	private itemIndex: number; // Index of current item in view
	private viewableItemsIndex = 0; // Index of element to load next item into
	private transitionIndex = 0;
	private firstIndex = 0; // First index in array
	private lastIndex: number; // Last index in array
	private items = [];
	private carousel: HTMLElement;
	private imageReady = false;
	private transitionWaitTime: number;
	private transitionDisabled = false;
	private visibilityToggle = true;
	private newIndex: number;
	private getBoundingClientRect: any;
	private onReference = carousel => (this.carousel = carousel);
	private autoPlaySetInterval: number;
	private autoPlayEnabled = true;
	private autoPlaying: boolean;
	private scrollTimeout: number;
	private hiddenArrows: boolean;

	constructor(props) {
		super(props);

		this.setItems(props.list);
		const initLayoutState = this.getInitLayoutState(this.initPrimaryLayout);

		this.state = {
			arrowsAnimateIn: !props.isPeeking,
			sources: [],
			direction: undefined,
			viewableItems: [],
			showRightPeek: false,
			showLeftPeek: false,
			scrolling: true,
			...initLayoutState
		};
	}

	componentWillReceiveProps(nextProps: CarouselProps) {
		const { list, scrollTo, customFields, autoPlayToggle } = nextProps;
		if (this.transitionDisabled) return;

		// if the autoCycle value changes
		if (customFields.autoCycle !== this.props.customFields.autoCycle) {
			this.setTransitionWaitTime(customFields.autoCycle);
			this.stopAutoPlay();
			this.enableAutoPlay();
			this.autoPlay(customFields.autoCycle);
		}

		// When attempting a manual jump to a different slide
		if (scrollTo !== this.itemIndex && list.items.length !== 0 && this.props.scrollToEnabled) {
			this.jumpToItem(scrollTo);
		}

		if (
			list.id !== this.props.list.id ||
			(list.items.length !== this.props.list.items.length && list.items.length > 0)
		) {
			this.setup(list);
		} else if (list !== this.props.list) {
			this.refresh(list);
		}

		// start or stop auto play
		if (autoPlayToggle !== undefined && autoPlayToggle !== this.props.autoPlayToggle) {
			if (autoPlayToggle) {
				this.enableAutoPlay();
				this.autoPlay();
			} else {
				this.stopAutoPlay();
				this.disableAutoPlay();
			}
		}
	}

	componentDidMount() {
		const { list, autoPlayEnabled } = this.props;
		this.autoPlayEnabled = autoPlayEnabled !== undefined ? autoPlayEnabled : this.autoPlayEnabled;
		this.setup(list);
		window.addEventListener('scroll', this.scrollPage, false);
		document.addEventListener('visibilitychange', this.visibilityChange, false);
	}

	componentWillUnmount() {
		this.stopAutoPlay();
		document.removeEventListener('visibilitychange', this.visibilityChange);
		window.removeEventListener('scroll', this.scrollPage);
	}

	/*
	--------------------------
	Auto Play
	--------------------------
	*/

	private emitPlayStateChange() {
		const { onAutoPlayingChange } = this.props;
		if (onAutoPlayingChange) {
			onAutoPlayingChange(this.autoPlaying);
		}
	}

	private emitEnabledPlayStateChange() {
		const { onAutoPlayEnabledChange } = this.props;
		if (onAutoPlayEnabledChange) {
			onAutoPlayEnabledChange(this.autoPlayEnabled);
		}
	}

	private shouldCarouselAutoplay = (autoCycle = this.props.customFields.autoCycle) => {
		// if the new autoCycle === 0 || there is only one item in the list disable auto play
		if (autoCycle === 0 || this.items.length <= 1) {
			this.stopAutoPlay();
			this.disableAutoPlay();
		}

		return this.autoPlayEnabled;
	};

	private autoPlay = (autoCycle?: number) => {
		if (this.shouldCarouselAutoplay(autoCycle) && !this.autoPlaying) {
			this.autoPlaying = true;
			this.autoPlaySetInterval = window.setInterval(() => {
				this.transitionPane('->', this.itemIndex + 1);
			}, this.transitionWaitTime);
			this.emitPlayStateChange();
		}
	};

	private stopAutoPlay = () => {
		this.autoPlaying = false;
		window.clearInterval(this.autoPlaySetInterval);
		this.autoPlaySetInterval = undefined;
		this.emitPlayStateChange();
	};

	private disableAutoPlay = () => {
		this.autoPlayEnabled = false;
		this.emitEnabledPlayStateChange();
	};

	private enableAutoPlay = () => {
		this.autoPlayEnabled = true;
		this.emitEnabledPlayStateChange();
	};

	/*
	--------------------------
	Position and Transition
	--------------------------
	*/

	private createItems(items) {
		const { mobileImageSize, desktopImageSize, itemTransitionsDisabled } = this.props;
		return items.map(item => {
			return {
				sources: [
					{
						src: resolveImages(item.images, mobileImageSize, {
							width: mobileImageWidth
						})[0].src,
						mediaQuery: tabletEnd,
						imageType: mobileImageSize
					},
					{
						src: resolveImages(item.images, desktopImageSize, {
							width: desktopImageWidth
						})[0].src,
						mediaQuery: tabletStart,
						imageType: desktopImageSize
					}
				],
				brandImage: resolveImages(item.images, 'brand', {
					width: 640,
					format: 'png'
				})[0].src,
				badgeImage: resolveImages(item.images, 'badge', {
					width: 200,
					format: 'png'
				})[0].src,
				item: item,
				isInView: false,
				isLink: item.type === 'link',
				itemTransitionsDisabled
			};
		});
	}

	private jumpForwardLayout = () => {
		return [
			cloneItem(this.items[countLoop(this.itemIndex, this.firstIndex, this.lastIndex, -2)]),
			cloneItem(this.items[countLoop(this.itemIndex, this.firstIndex, this.lastIndex, -1)]),
			cloneItem(this.items[this.itemIndex]),
			cloneItem(this.items[this.newIndex]),
			cloneItem(this.items[countLoop(this.newIndex, this.firstIndex, this.lastIndex, 1)])
		];
	};

	private jumpBackwardLayout = () => {
		return [
			cloneItem(this.items[countLoop(this.newIndex, this.firstIndex, this.lastIndex, -1)]),
			cloneItem(this.items[this.newIndex]),
			cloneItem(this.items[this.itemIndex]),
			cloneItem(this.items[countLoop(this.itemIndex, this.firstIndex, this.lastIndex, 1)]),
			cloneItem(this.items[countLoop(this.itemIndex, this.firstIndex, this.lastIndex, 2)])
		];
	};

	private refreshLayout = () => {
		const viewableItems = [
			cloneItem(this.items[countLoop(this.itemIndex, this.firstIndex, this.lastIndex, -2)]),
			cloneItem(this.items[countLoop(this.itemIndex, this.firstIndex, this.lastIndex, -1)]),
			cloneItem(this.items[this.itemIndex]),
			cloneItem(this.items[countLoop(this.itemIndex, this.firstIndex, this.lastIndex, 1)]),
			cloneItem(this.items[countLoop(this.itemIndex, this.firstIndex, this.lastIndex, 2)])
		];

		viewableItems[2].isInView = true;
		return viewableItems;
	};

	private initPrimaryLayout = () => {
		const viewableItems = [cloneItem(this.items[this.itemIndex])];

		viewableItems[0].isInView = true;
		return viewableItems;
	};

	private initItemLayout = () => {
		let startIndex = this.items.length === 1 ? 0 : (() => countLoop(this.props.scrollTo, 0, this.lastIndex, -2))();

		// Setup the first set of viewable items Iterates over this.items until we have 5 items in viewable items array
		const viewableItems = [0, 1, 2, 3, 4].map(() => {
			const nextItem = cloneItem(this.items[startIndex]);
			startIndex = countLoop(startIndex, 0, this.lastIndex, 1);
			return nextItem;
		});

		viewableItems[2].isInView = true;
		viewableItems[2].onLoad = this.onImageLoaded;
		viewableItems[2].onError = this.onImageError;

		return viewableItems;
	};

	private setItems(list) {
		this.items = [];
		this.items = this.createItems(list.items);

		if (this.items.length > MAX_SLIDES) this.items.length = MAX_SLIDES;

		this.lastIndex = this.items.length - 1;
		this.itemIndex = this.props.scrollTo;
	}

	private setItemTransform = (item, i) => {
		item.style = { transform: `translate(${transforms[i]}%)` };
		item.translate = transforms[i];
		return item;
	};

	private getInitLayoutState(viewableItemSetup) {
		return {
			viewableItems: viewableItemSetup().map(this.setItemTransform),
			scrolling: this.items.length > 1,
			carouselTransitionPos: this.beltTransition(0, 0)
		};
	}

	private initLayout(viewableItemSetup) {
		this.viewableItemsIndex = 0;
		this.transitionIndex = 0;

		this.setState(this.getInitLayoutState(viewableItemSetup));
	}

	private setTransitionWaitTime = val => {
		this.transitionWaitTime = (val || 8) * 1000;
	};

	private setup(list) {
		const { customFields, items } = this.props;
		if (list.items.length === 0) return;

		// Convert all items to new carousel item and save to array
		this.setItems(list);

		// pass the items back up
		if (items) items(this.items);

		this.initLayout(this.initItemLayout);

		this.setTransitionWaitTime(customFields.autoCycle);
		this.getCarouselBoundingBox();
		this.autoPlay();
	}

	private refresh(list) {
		this.items = [];
		this.items = this.createItems(list.items);

		this.initLayout(this.refreshLayout);
	}

	private forward = () => {
		const direction: Direction = '->';
		this.dispatchScrollEvent(direction);
		return this.limitTransition(direction);
	};
	private backward = () => {
		const direction: Direction = '<-';
		this.dispatchScrollEvent(direction);
		return this.limitTransition(direction);
	};

	private disableTransition = time => {
		this.transitionDisabled = true;

		if (this.props.transitionDisabled) this.props.transitionDisabled(this.transitionDisabled);

		setTimeout(() => {
			this.transitionDisabled = false;
			if (this.props.transitionDisabled) this.props.transitionDisabled(this.transitionDisabled);
		}, time);
	};

	private dispatchScrollEvent(direction: Direction) {
		const domNode = findDOMNode(this);
		const detail = { direction: direction === '->' ? 'Right' : 'Left' };
		domNode && domNode.dispatchEvent(new CustomEvent('hscroll', { bubbles: true, cancelable: false, detail }));
	}

	private limitTransition = (direction: Direction, disableTransitionTime?) => {
		this.disableAutoPlay();
		this.stopAutoPlay();
		if (this.transitionDisabled) return;
		this.transitionPane(direction, this.itemIndex + posNeg(direction, 1));
		this.disableTransition(disableTransitionTime || 350);
	};

	private beltTransition = (timeToTravel, transitionAmount = -this.transitionIndex * 100) => {
		return {
			transform: `translate(${transitionAmount}%)`,
			transition: `transform ${timeToTravel}ms cubic-bezier(0.26, 0.005, 0.065, 0.995)`
		};
	};

	private jumpToItem = newIndex => {
		this.newIndex = newIndex;
		const diff = Math.abs(this.itemIndex - newIndex);
		const timeToTravel = transitionTime();
		let direction;

		if (this.itemIndex > newIndex) direction = '<-';
		else direction = '->';

		// if only moving one square use default navigation method
		this.dispatchScrollEvent(direction);
		if (diff === 1) this.limitTransition(direction, timeToTravel);
		else {
			if (direction === '->') this.initLayout(this.jumpForwardLayout);
			else this.initLayout(this.jumpBackwardLayout);

			this.itemIndex = newIndex;
			this.transitionIndex = this.transitionIndex + posNeg(direction, 1);
			this.disableTransition(timeToTravel + 50);
			setTimeout(() => {
				this.setState({
					carouselTransitionPos: this.beltTransition(timeToTravel)
				});
			}, 50);
			setTimeout(() => this.initLayout(this.initItemLayout), timeToTravel);
		}
	};

	private transitionPane(direction: Direction, newIndex) {
		let { viewableItems } = this.state;

		// get the next indexes
		this.transitionIndex = this.transitionIndex + posNeg(direction, 1);
		const nextItemIndex = countLoop(newIndex, this.firstIndex, this.lastIndex);

		// Get the next backward and forward indexes
		const forwardIndex = countLoop(nextItemIndex, this.firstIndex, this.lastIndex, 2);
		const backwardIndex = countLoop(nextItemIndex, this.firstIndex, this.lastIndex, -2);

		// get the next item and add its position
		if (direction === '->') {
			const nextItem = Object.assign({}, this.items[forwardIndex]);
			nextItem.style = {
				transform: `translate(${(this.transitionIndex + 2) * 100}%)`
			};
			nextItem.translate = (this.transitionIndex + 2) * 100;
			viewableItems[this.viewableItemsIndex] = nextItem;
			this.viewableItemsIndex = countLoop(this.viewableItemsIndex, 0, 4, 1);
		} else {
			this.viewableItemsIndex = countLoop(this.viewableItemsIndex, 0, 4, -1);
			const nextItem = Object.assign({}, this.items[backwardIndex]);
			nextItem.style = {
				transform: `translate(${(this.transitionIndex - 2) * 100}%)`
			};
			nextItem.translate = (this.transitionIndex - 2) * 100;
			viewableItems[this.viewableItemsIndex] = nextItem;
		}

		viewableItems = viewableItems.map(item => {
			item.isInView = this.items[nextItemIndex].item.title === item.item.title;
			return item;
		});

		/* Save all values and update state */
		this.itemIndex = nextItemIndex;
		if (this.props.itemIndex) this.props.itemIndex(this.itemIndex);
		this.setState({
			viewableItems: viewableItems,
			showRightPeek: false,
			showLeftPeek: false,
			carouselTransitionPos: this.beltTransition(transitionTime())
		});
	}

	private peekLeft = nextState => this.setState({ showRightPeek: nextState });
	private peekRight = nextState => this.setState({ showLeftPeek: nextState });

	/*
	--------------------------
	Arrows
	--------------------------
	*/

	private onTouchStart = () => {
		if (this.props.isPeeking) this.hiddenArrows = true;
		this.disableAutoPlay();
		this.stopAutoPlay();
	};

	private OnImageReady = () => {
		if (!this.imageReady) {
			this.imageReady = true;
			if (this.autoPlayEnabled && this.inWindowView()) this.autoPlay();
			if (!this.props.isPeeking) this.setState({ arrowsAnimateIn: true });
		}
	};

	private onImageLoaded = () => this.OnImageReady();
	private onImageError = () => this.OnImageReady();

	private onUserInteraction = () => {
		if (!this.hiddenArrows) this.setState({ showArrows: true, arrowsAnimateIn: false });
		this.stopAutoPlay();
	};

	private onUserInteractionEnd = () => {
		this.setState({ showArrows: false });
		this.autoPlay();
	};

	/*
	--------------------------
	In View
	--------------------------
	*/

	private getCarouselBoundingBox = () => (this.getBoundingClientRect = this.carousel.getBoundingClientRect());

	private inWindowView = () => {
		const body = document.body;
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop || body.scrollTop;
		const clientTop = document.documentElement.clientTop || body.clientTop || 0;
		return Math.round(this.getBoundingClientRect.bottom + scrollTop - clientTop) > window.pageYOffset;
	};

	private scrollPage = () => {
		window.cancelAnimationFrame(this.scrollTimeout);
		this.scrollTimeout = window.requestAnimationFrame(() => {
			this.getCarouselBoundingBox();
			const isInView = this.inWindowView();
			if (isInView && !this.visibilityToggle && this.autoPlayEnabled) {
				this.autoPlay();
				this.visibilityToggle = true;
			} else if (!isInView && this.visibilityToggle) {
				this.stopAutoPlay();
				this.visibilityToggle = false;
			}
		});
	};

	private visibilityChange = () => {
		if (!document.hidden && this.inWindowView()) this.autoPlay();
		else if (document.hidden) this.stopAutoPlay();
	};

	private onItemClick = (translate: number) => {
		const itemInView = this.state.viewableItems.filter(item => item.isInView)[0];
		if (itemInView.translate < translate) {
			this.forward();
		} else {
			this.backward();
		}
	};

	render() {
		const { carouselTransitionPos, showArrows, scrolling, viewableItems } = this.state;
		const {
			className,
			children,
			nextBtnAriaLabel,
			previousBtnAriaLabel,
			disableArrows,
			onRef,
			style,
			customFields
		} = this.props;
		const textPosClass = `carousel--${customFields.textHorizontalAlignment}-${customFields.textVerticalAlignment}`;
		const frameClasses = cx(
			BemCarousel.e('frame'),
			{ [BemCarousel.e('frame', 'peek-right')]: this.state.showRightPeek },
			{ [BemCarousel.e('frame', 'peek-left')]: this.state.showLeftPeek }
		);
		return (
			<div
				className={cx(BemCarousel.b({ 'scroll-disabled': !scrolling }), textPosClass, className)}
				style={style}
				onMouseEnter={this.onUserInteraction}
				onFocus={this.onUserInteraction}
				onBlur={this.onUserInteractionEnd}
				onMouseLeave={this.onUserInteractionEnd}
				ref={onRef}
				onScroll={onScroll}
			>
				{!disableArrows && (
					<SlideArrow
						direction={'left'}
						introAnimation={this.state.arrowsAnimateIn}
						visible={showArrows}
						ariaLabel={previousBtnAriaLabel}
						onClick={this.backward}
						onMouseEnter={() => this.peekLeft(true)}
						onMouseLeave={() => this.peekLeft(false)}
					/>
				)}
				<div className={frameClasses}>
					<div style={carouselTransitionPos} ref={this.onReference} className={BemCarousel.e('belt')}>
						<Swipe
							swipeLeft={this.backward}
							swipeRight={this.forward}
							transitionDuration={transitionTime() * 0.9}
							disabled={!scrolling}
							onTouchStart={this.onTouchStart}
						>
							{viewableItems
								.slice(0, 5)
								.filter(item => !!item)
								.map((item, index) => this.renderCarouselItem(index))}
						</Swipe>
					</div>
					{children}
				</div>
				{!disableArrows && (
					<SlideArrow
						direction={'right'}
						introAnimation={this.state.arrowsAnimateIn}
						visible={showArrows}
						ariaLabel={nextBtnAriaLabel}
						onClick={this.forward}
						onMouseEnter={() => this.peekRight(true)}
						onMouseLeave={() => this.peekRight(false)}
					/>
				)}
			</div>
		);
	}

	private renderCarouselItem(index: number) {
		const { viewableItems } = this.state;

		// Carousel item is not properly rendered on server side due to CSP and inline style definition
		// we render just only one item in view for fixing it
		if (_SERVER_ && !viewableItems[index].isInView) return;

		const { imageOffsetTop } = this.props;
		return (
			viewableItems[index] &&
			viewableItems[index].item && (
				<CarouselItem
					key={`item-${viewableItems[index].item.path}-${index}`}
					{...viewableItems[index]}
					imageOffsetTop={imageOffsetTop}
					onItemClick={this.onItemClick}
				/>
			)
		);
	}
}
