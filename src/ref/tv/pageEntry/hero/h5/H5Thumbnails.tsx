import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import ArrowButton from 'ref/tv/component/ArrowButton';
import FixedHero from 'ref/tv/component/FixedHero';
import H5AssetList from 'ref/tv/component/H5AssetList';
import H5CarouselItem from './H5CarouselItem';
import H5CarouselItemImage from './H5CarouselItemImage';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation, GlobalEvent } from 'ref/tv/DirectionalNavigation';
import { skipMove, transform } from 'ref/tv/util/focusUtil';
import { fullScreenWidth } from 'ref/tv/util/itemUtils';
import { setPaddingStyle } from 'ref/tv/util/rows';
import sass from 'ref/tv/util/sass';
import './H5Thumbnails.scss';

const bem = new Bem('h5-thumbnail');

type H5ThumbnailsState = Partial<{
	list: api.ItemSummary[];
	selectedIndex: number;
	wrappedPages: number;
	isPreShow: boolean;
	isNexShow: boolean;
	focused: boolean;
	showPrevArrow: boolean;
	showNextArrow: boolean;
	translates: number[];
}>;

let count = 0;
const MAX_SLIDES = 12;

export default class H5Thumbnails extends React.Component<PageEntryListProps, H5ThumbnailsState> {
	context: {
		router: ReactRouter.InjectedRouter;
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		router: PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired
	};

	private id = 'h5' + count++;
	private autoPlayTimer;
	private focusableRow: Focusable;
	private ref: HTMLElement;

	constructor(props: PageEntryListProps) {
		super(props);

		this.state = {
			list: [],
			selectedIndex: 0,
			wrappedPages: 0,
			isPreShow: false,
			isNexShow: false,
			focused: false,
			showPrevArrow: false,
			showNextArrow: false,
			translates: [-1, 0, 1]
		};

		this.focusableRow = {
			focusable: true,
			index: (props.index + 1) * 10,
			height: sass.h5Height,
			forceScrollTop: true,
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

	componentWillMount() {
		this.populateList(this.props);
	}

	componentDidMount() {
		const { focusNav } = this.context;
		const entryNode = focusNav.getRowEntry(this.props.index);

		setPaddingStyle(entryNode, this.props.customFields);
		this.focusableRow.ref = this.ref;

		this.autoPlay();
		focusNav.registerRow(this.focusableRow);
		focusNav.addEventHandler(GlobalEvent.SCROLL_CHANGED, this.id, this.handleScrollChanged);
	}

	componentWillUnmount() {
		const { focusNav } = this.context;
		focusNav.removeEventHandler(GlobalEvent.SCROLL_CHANGED, this.id);
		focusNav.unregisterRow(this.focusableRow);
		this.clearAutoPlay();
	}

	componentDidUpdate() {
		this.focusableRow.savedState = Object.assign({}, this.state);
	}

	componentWillReceiveProps(nextProps: PageEntryListProps) {
		if (nextProps !== this.props) this.populateList(nextProps);
		this.focusableRow.entryProps = nextProps;
	}

	shouldComponentUpdate(nextProps, nextState: H5ThumbnailsState) {
		const { selectedIndex, isPreShow, isNexShow, focused, showPrevArrow, showNextArrow } = this.state;

		if (
			nextState.focused !== focused ||
			showPrevArrow !== nextState.showPrevArrow ||
			showNextArrow !== nextState.showNextArrow
		)
			return true;

		if (focused) {
			if (selectedIndex !== nextState.selectedIndex) {
				this.context.focusNav.analytics.triggerEntryInteracted(nextProps);
			}

			if (
				isPreShow === nextState.isPreShow &&
				isNexShow === nextState.isNexShow &&
				selectedIndex === nextState.selectedIndex
			)
				return false;
		} else {
			if (nextState.selectedIndex === selectedIndex) return false;
		}

		return true;
	}

	private populateList = (props: PageEntryListProps) => {
		if (!props.list) return;
		let list = [];
		list = list.concat(props.list.items);
		if (list.length > MAX_SLIDES) list.length = MAX_SLIDES;
		this.setState({ list });
	};

	private restoreSavedState = (state: H5ThumbnailsState) => {
		if (state) {
			const { list, selectedIndex, wrappedPages, isPreShow, isNexShow, focused, translates } = state;
			this.setState(
				{ list, selectedIndex, wrappedPages, isPreShow, isNexShow, focused, translates },
				this.trackedItemFocused
			);
		}
	};

	private trackedItemFocused = (isMouseLeave?: boolean) => {
		const { selectedIndex, list } = this.state;
		this.context.focusNav.analytics.triggerItemEvents(
			isMouseLeave ? 'MOUSELEAVE' : 'MOUSEENTER',
			list[selectedIndex],
			this.props as any,
			selectedIndex,
			'tile'
		);
	};

	private setFocus = (isFocused?: boolean): boolean => {
		if (isFocused) {
			this.trackedItemFocused();
			this.clearAutoPlay();
		} else {
			this.trackedItemFocused(true);
			this.autoPlay();
		}

		this.setState({ focused: isFocused });

		return true;
	};

	private moveLeft = (): boolean => {
		let { list, selectedIndex, wrappedPages } = this.state;
		if (list.length <= 1) return true;
		if (selectedIndex > 0) selectedIndex--;
		else {
			selectedIndex = list.length - 1;
			wrappedPages--;
		}

		this.setState({ selectedIndex, wrappedPages }, this.trackedItemFocused);

		return true;
	};

	private moveRight = (): boolean => {
		let { list, selectedIndex, wrappedPages } = this.state;
		if (list.length <= 1) return true;
		if (selectedIndex < list.length - 1) selectedIndex++;
		else {
			selectedIndex = 0;
			wrappedPages++;
		}

		this.setState({ selectedIndex, wrappedPages }, this.trackedItemFocused);

		return true;
	};

	private exec = (act?: string): boolean => {
		switch (act) {
			case 'click':
				this.invokeItem();
				return true;
			default:
				break;
		}

		return false;
	};

	private invokeItem = () => {
		const { list, selectedIndex } = this.state;
		const item = list[selectedIndex];
		this.context.focusNav.analytics.triggerItemEvents('CLICK', item, this.props as any, selectedIndex, 'tile');
		this.context.router.push(item.path);
	};

	private increaseIndex = (isAuto?: boolean) => {
		this.slideTo(this.state.selectedIndex + 1, isAuto);
	};

	private slideTo = (index, isAuto?: boolean) => {
		const lastIndex = this.state.list.length;

		if (lastIndex <= 1) return;
		if (index < 0) index = lastIndex - 1;
		if (index >= lastIndex) index = 0;
		if (!isAuto) {
			this.clearAutoPlay();
			this.setState(
				{
					selectedIndex: index,
					isPreShow: true,
					isNexShow: true
				},
				this.trackedItemFocused
			);
		} else {
			this.setState({ selectedIndex: index });
		}
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

		this.autoPlayTimer = setTimeout(() => {
			this.increaseIndex(true);
			this.autoPlay();
		}, interval);
	};

	private clearAutoPlay = () => {
		clearTimeout(this.autoPlayTimer);
	};

	private onRef = ref => {
		this.ref = ref;
	};

	private handleMouseEnter = () => {
		const { list } = this.state;
		const showArrow = list.length > 1;
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
		this.setState({ showPrevArrow: showArrow, showNextArrow: showArrow });
	};

	private handleMouseLeave = () => {
		this.setState({ showPrevArrow: false, showNextArrow: false });
	};

	private handleScrollChanged = (offsetY: number) => {
		// autoplay should be canceled when hero row rolls out of the screen
		if (!this.ref) return;
		const { focused } = this.state;
		const { offsetTop, offsetHeight } = this.ref;
		this.clearAutoPlay();
		if (!focused && offsetY <= offsetTop + offsetHeight) this.autoPlay();
	};

	private renderItem(index: number) {
		const { list, selectedIndex, wrappedPages } = this.state;
		const wrappedIndex = index < 0 ? list.length + index : index % list.length;
		const item = list[wrappedIndex];
		if (!item) return undefined;
		const left = (index - selectedIndex) * sass.viewportWidth + 'px';
		const transformStyle = transform(left, sass.transitionDuration, 0, false, undefined, true);
		const page = index < 0 ? wrappedPages - 1 : index >= list.length ? wrappedPages + 1 : wrappedPages;
		const key = `h5i-${item.id}-${wrappedIndex}-${page}`;
		return (
			<div key={key} className={bem.e('item', { inactive: selectedIndex !== index })} style={transformStyle}>
				<H5CarouselItemImage item={item} />
			</div>
		);
	}

	private renderHeading(index: number) {
		const { customFields } = this.props;
		const { list, selectedIndex, wrappedPages } = this.state;
		const imageOptions: image.Options = { width: fullScreenWidth };
		const wrappedIndex = index < 0 ? list.length + index : index % list.length;
		const item = list[wrappedIndex];
		if (!item) return undefined;
		const left = (index - selectedIndex) * sass.viewportWidth + 'px';
		const transformStyle = transform(left, sass.transitionDuration, 0, false, undefined, true);
		const page = index < 0 ? wrappedPages - 1 : index >= list.length ? wrappedPages + 1 : wrappedPages;
		const key = `h5h-${item.id}-${wrappedIndex}-${page}`;
		return (
			<div key={key} className={bem.e('item', { inactive: selectedIndex !== index })} style={transformStyle}>
				<H5CarouselItem item={item} imageType={'wallpaper'} imageOptions={imageOptions} customFields={customFields} />
			</div>
		);
	}

	render() {
		const { list, selectedIndex, focused, showPrevArrow, showNextArrow, translates } = this.state;
		const hideDownButton = this.context.focusNav.mouseActive;
		const listsClass = cx(bem.e('lists', [list.length > 5 ? 'scrollable' : list.length > 1 ? '' : 'hide']));

		return (
			<div
				className={cx(bem.b(), 'full-bleed')}
				tabIndex={1}
				ref={this.onRef}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
			>
				<div className={bem.e('full')}>
					<div className={bem.e('carousel-image')}>{translates.map(t => this.renderItem(selectedIndex + t))}</div>
					<div className={bem.e('bgCover')} />

					<FixedHero>
						<div className={bem.e('carousel')}>{translates.map(t => this.renderHeading(selectedIndex + t))}</div>

						<div className={listsClass}>
							<H5AssetList
								{...this.props}
								h5List={list}
								imageType={'tile'}
								imageWidth={sass.tileThumbnailWidth}
								itemMargin={sass.h5ItemSpacing}
								rowType={'t1'}
								focusable={false}
								curIndex={selectedIndex}
								focused={focused}
								onFocusTo={this.slideTo}
							/>
						</div>

						{!hideDownButton && (
							<button key={'h5-down'} type="button" tabIndex={-1} className={bem.e('arrow', 'down')}>
								<i className={cx('icon icon-drop-button', bem.e('icon'))} />
							</button>
						)}
						<ArrowButton direction={'left'} onClick={this.moveLeft} show={showPrevArrow} />
						<ArrowButton direction={'right'} onClick={this.moveRight} show={showNextArrow} />
					</FixedHero>
				</div>
			</div>
		);
	}
}
