import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import ArrowButton from 'ref/tv/component/ArrowButton';
import HeroItem from './HeroItem';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation, GlobalEvent } from 'ref/tv/DirectionalNavigation';
import { skipMove, focusedClass, transform } from 'ref/tv/util/focusUtil';
import { setPaddingStyle } from 'ref/tv/util/rows';
import sass from 'ref/tv/util/sass';
import './HeroCarousel.scss';

const bem = new Bem('hero-carousel');
const MAX_SLIDES = 12;
let count = 0;

interface HeroCarouselProps extends PageEntryListProps {
	imageType: image.Type;
	itemWidth?: number;
	rowHeight: number;
	verticalSpacing: number;
	showArrow?: boolean;
}

type HeroCarouselState = Partial<{
	list: api.ItemSummary[];
	offset: number;
	wrappedPages: number;
	focused: boolean;
	showPrevArrow: boolean;
	showNextArrow: boolean;
	translates: number[];
}>;

export default class HeroCarousel extends React.Component<HeroCarouselProps, HeroCarouselState> {
	static defaultProps = {
		itemWidth: sass.viewportWidth
	};

	context: {
		router: ReactRouter.InjectedRouter;
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		router: PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired
	};

	private id = 'heroCarousel' + count++;

	constructor(props: HeroCarouselProps) {
		super(props);

		this.state = {
			list: [],
			offset: 0,
			wrappedPages: 0,
			focused: false,
			showPrevArrow: false,
			showNextArrow: false,
			translates: props.itemWidth < sass.viewportWidth ? [-2, -1, 0, 1, 2] : [-1, 0, 1]
		};

		this.focusableRow = {
			focusable: true,
			index: (props.index + 1) * 10,
			height: props.rowHeight + props.verticalSpacing * 2,
			template: props.template,
			entryProps: props,
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: skipMove,
			moveDown: skipMove,
			exec: this.exec
		};
	}

	private focusableRow: Focusable;
	private ref;

	componentWillMount() {
		this.populateList(this.props);
	}

	componentDidMount() {
		const { focusNav } = this.context;
		let entryNode: HTMLElement = focusNav.getRowEntry(this.props.index);

		if (!entryNode) entryNode = this.ref;

		setPaddingStyle(entryNode, this.props.customFields);
		this.focusableRow.ref = this.ref;

		this.autoPlay();
		this.focusableRow.savedState = Object.assign({}, this.state);
		focusNav.registerRow(this.focusableRow);
		focusNav.addEventHandler(GlobalEvent.SCROLL_CHANGED, this.id, this.handleScrollChanged);
	}

	componentWillUnmount() {
		const { focusNav } = this.context;
		focusNav.unregisterRow(this.focusableRow);
		focusNav.removeEventHandler(GlobalEvent.SCROLL_CHANGED, this.id);
		this.clearAutoPlay();
	}

	componentWillReceiveProps(nextProps: HeroCarouselProps) {
		if (nextProps !== this.props) this.populateList(nextProps);
		this.focusableRow.entryProps = nextProps;
	}

	componentDidUpdate() {
		this.focusableRow.savedState = Object.assign({}, this.state);
	}

	private populateList = (props: HeroCarouselProps) => {
		if (!props.list) return;
		let list = [];
		list = list.concat(props.list.items);
		if (list.length > MAX_SLIDES) list.length = MAX_SLIDES;
		this.setState({ list });
	};

	private restoreSavedState = (savedState: object) => {
		const state = savedState as HeroCarouselState;
		const { offset, wrappedPages, focused, translates } = state;

		if (state) {
			this.setState({ offset, wrappedPages, focused, translates }, this.trackedItemFocused);
		}
	};

	private setFocus = (isFocused?: boolean): boolean => {
		this.setState({
			focused: isFocused
		});

		if (isFocused) {
			this.trackedItemFocused(this.state.offset);
			this.clearAutoPlay();
		} else {
			this.trackedItemFocused(this.state.offset, true);
			this.autoPlay();
		}

		return true;
	};

	private trackedItemFocused = (index?: number, isMouseLeave?: boolean) => {
		const { imageType } = this.props;
		const { list, offset } = this.state;
		if (index === undefined) index = offset;
		this.context.focusNav.analytics.triggerItemEvents(
			isMouseLeave ? 'MOUSELEAVE' : 'MOUSEENTER',
			list[index],
			this.props as any,
			index,
			imageType
		);
	};

	private moveLeft = (): boolean => {
		this.decreaseIndex();
		return true;
	};

	private moveRight = (): boolean => {
		this.increaseIndex();
		return true;
	};

	private exec = (act?: string) => {
		switch (act) {
			case 'click':
				this.invokeItem();
				return true;
		}

		return false;
	};

	private autoPlayTimer;

	private invokeItem = () => {
		const { imageType } = this.props;
		const { list, offset } = this.state;
		let index = offset;
		this.context.focusNav.analytics.triggerItemEvents('CLICK', list[index], this.props as any, index, imageType);
		this.context.router.push(list[index].path);
	};

	private handleMouseEnter = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
		this.setState({ showPrevArrow: true, showNextArrow: true });
	};

	private handleMouseLeave = () => {
		this.setState({ showPrevArrow: false, showNextArrow: false });
	};

	private increaseIndex = (isAuto?: boolean) => {
		this.changeOffset(true, isAuto);
	};

	private decreaseIndex = () => {
		this.changeOffset(false);
	};

	private autoPlay = () => {
		const { customFields } = this.props;
		let interval = 0;

		if (customFields) {
			if (customFields.autoCycle === undefined) {
				interval = 3000;
			} else {
				interval = customFields.autoCycle * 1000;
			}
		}

		if (interval === 0) {
			return;
		}

		this.clearAutoPlay();

		this.autoPlayTimer = setTimeout(() => {
			this.increaseIndex(true);
			this.autoPlay();
		}, interval);
	};

	private clearAutoPlay = () => {
		if (this.autoPlayTimer !== undefined) {
			clearTimeout(this.autoPlayTimer);
			this.autoPlayTimer = undefined;
		}
	};

	private allowCycling = (): boolean => {
		return this.state.list.length > 1;
	};

	private changeOffset = (increase: boolean, isAuto?: boolean) => {
		if (!this.allowCycling()) {
			return;
		}

		const { list } = this.state;
		let { offset, wrappedPages } = this.state;

		if (increase) {
			offset++;
			if (offset >= list.length) {
				offset = 0;
				wrappedPages++;
			}
		} else if (list.length > 1) {
			offset--;
			if (offset < 0) {
				offset = list.length - 1;
				wrappedPages--;
			}
		}

		!isAuto && this.trackedItemFocused(offset);
		!isAuto && this.context.focusNav.analytics.triggerEntryInteracted(this.props as any);

		this.setState({ offset, wrappedPages });
	};

	private handleScrollChanged = (offsetY: number) => {
		// autoplay should be canceled when hero row rolls out of the screen
		if (!this.ref) return;
		const { focused } = this.state;
		const { offsetTop, offsetHeight } = this.ref;
		this.clearAutoPlay();
		if (!focused && offsetY <= offsetTop + offsetHeight) this.autoPlay();
	};

	private onRef = ref => {
		this.ref = ref;
	};

	render() {
		const { offset, focused, showPrevArrow, showNextArrow, translates } = this.state;
		const { showArrow, rowHeight } = this.props;
		const classes = cx('h1-entry', 'page-entry--hero');
		const allowCycling = this.allowCycling();

		return (
			<div
				className={cx('full-bleed', focused ? focusedClass : '')}
				tabIndex={1}
				ref={this.onRef}
				style={{ height: `${rowHeight}px` }}
			>
				<section className={classes} tabIndex={-1}>
					<div className={bem.b()} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
						<div className={bem.e('carousel')} onClick={this.invokeItem}>
							{allowCycling ? translates.map(t => this.renderItem(offset + t)) : this.renderItem(0)}
						</div>

						{showArrow && focused && allowCycling && !showPrevArrow && (
							<button type="button" className={bem.e('button left')}>
								<i className="icon icon-arrow-prev" />
							</button>
						)}

						{showArrow && focused && allowCycling && !showNextArrow && (
							<button type="button" className={bem.e('button right')}>
								<i className="icon icon-arrow-next" />
							</button>
						)}

						<ArrowButton direction={'left'} onClick={this.decreaseIndex} show={showPrevArrow && allowCycling} />
						<ArrowButton direction={'right'} onClick={this.increaseIndex} show={showNextArrow && allowCycling} />
					</div>
				</section>
			</div>
		);
	}

	private renderItem(index: number) {
		if (!this.state.list) return undefined;
		const { customFields, imageType, itemWidth, rowHeight } = this.props;
		const { list } = this.state;
		const { offset, wrappedPages } = this.state;
		const wrappedIndex = index < 0 ? list.length + index : index % list.length;
		const item = list[wrappedIndex];
		if (!item) return undefined;
		const left = (index - offset) * itemWidth + 'px';
		const transformStyle = transform(left, sass.transitionDuration, 0, false, undefined, true);
		const inactive = index !== offset;
		const page = index < 0 ? wrappedPages - 1 : index >= list.length ? wrappedPages + 1 : wrappedPages;
		const key = `${imageType}-${item.id}-${wrappedIndex}-${page}`;
		return (
			<div key={key} className={bem.e('item', { active: !inactive, inactive })} style={transformStyle}>
				<HeroItem
					customFields={customFields}
					item={item}
					imageType={imageType}
					itemWidth={itemWidth}
					rowHeight={rowHeight}
				/>
			</div>
		);
	}
}
