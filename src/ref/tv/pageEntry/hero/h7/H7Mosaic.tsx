import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Bem } from 'shared/util/styles';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation, GlobalEvent } from 'ref/tv/DirectionalNavigation';
import { checkHorizontalArrowDisplay } from 'ref/tv/util/domUtils';
import { setPaddingStyle } from 'ref/tv/util/rows';
import ArrowButton from 'ref/tv/component/ArrowButton';
import H7MosaicGroup from './H7MosaicGroup';
import sass from 'ref/tv/util/sass';
import { transform } from 'ref/tv/util/focusUtil';
import './H7Mosaic.scss';

const bemEntry = new Bem('h7-entry');
const bemMosaic = new Bem('h7-mosaic');

interface H7MosaicState {
	list?: api.ItemSummary[][];
	curIndex?: number;
	scrollGroup?: number;
	isFocused?: boolean;
	styleTransform?: number;
	showLeftArrow?: boolean;
	showRightArrow?: boolean;
	isGlobalHeaderVisible?: boolean;
}

let count = 0;

export default class H7Mosaic extends React.Component<PageEntryListProps, H7MosaicState> {
	context: {
		router: ReactRouter.InjectedRouter;
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		router: PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired
	};

	private id = 'h7' + count++;
	private ref: HTMLElement;
	private scrollRef: HTMLElement;
	private focusableRow: Focusable;
	private minimumCellNumber = 6; // minimum amount of cells needed
	private focusMap;

	constructor(props, context) {
		super(props);

		this.state = {
			list: this.groupListItems(props.list ? props.list.items : []),
			isFocused: false,
			curIndex: 0,
			scrollGroup: 0,
			styleTransform: 0,
			showLeftArrow: false,
			showRightArrow: false,
			isGlobalHeaderVisible: context.focusNav.isGlobalHeaderVisible
		};

		this.focusableRow = {
			focusable: true,
			index: (props.index + 1) * 10,
			height: sass.h7Height,
			template: props.template,
			entryProps: props,
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: this.exec,
			getLeftToViewport: this.getLeftToViewport
		};
	}

	componentDidMount() {
		this.context.focusNav.addEventHandler(GlobalEvent.GLOBAL_HEADER, this.id, (headerVisible: boolean) => {
			this.setState({ isGlobalHeaderVisible: headerVisible });
		});

		let entryNode: HTMLElement = this.context.focusNav.getRowEntry(this.props.index);

		if (!entryNode) entryNode = this.ref;

		setPaddingStyle(entryNode, this.props.customFields);
		this.focusableRow.ref = this.ref;

		this.context.focusNav.registerRow(this.focusableRow);
	}

	componentWillUnmount() {
		this.context.focusNav.removeEventHandler(GlobalEvent.GLOBAL_HEADER, this.id);
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	componentDidUpdate() {
		this.focusableRow.savedState = Object.assign({}, this.state);
	}

	shouldComponentUpdate(nextProps, nextState: H7MosaicState) {
		if (nextState.styleTransform !== this.state.styleTransform) {
			this.context.focusNav.analytics.triggerEntryInteracted(nextProps);
		}

		return true;
	}

	private buildFocusMap(list) {
		let ret = [];

		for (let i = 0; i < list.length; i++) {
			const curIndex = i;
			const curGroupIndex = Math.floor(curIndex / 3);
			const isEvenGroup = curGroupIndex % 2 === 0;
			const isLargeImage = curIndex % 3 === 0;
			let up, left, right, down;

			if (isEvenGroup) {
				if (isLargeImage) {
					up = -1;
					right = curIndex + 4 < list.length ? curIndex + 4 : -1;
					down = curIndex + 1 < list.length ? curIndex + 1 : -1;
					left = curIndex - 1 < 0 ? -1 : curIndex - 1;
				} else {
					up = curIndex - (curIndex % 3);
					right = curIndex + 1 < list.length ? curIndex + 1 : -1;
					down = -1;
					left = curIndex % 3 === 1 ? (curIndex - 4 < 0 ? -1 : curIndex - 4) : curIndex - 1;
				}
			} else {
				if (isLargeImage) {
					up = curIndex + 1 < list.length ? curIndex + 1 : -1;
					right = curIndex + 4 < list.length ? curIndex + 4 : -1;
					down = -1;
					left = curIndex - 1 < 0 ? -1 : curIndex - 1;
				} else {
					up = -1;
					right = curIndex + 1 < list.length ? curIndex + 1 : -1;
					down = curIndex - (curIndex % 3);
					left = curIndex % 3 === 1 ? (curIndex - 4 < 0 ? -1 : curIndex - 4) : curIndex - 1;
				}
			}

			ret.push({
				up: up,
				left: left,
				right: right,
				down: down
			});
		}

		return ret;
	}

	private restoreSavedState = (savedState: object) => {
		const state = savedState as H7MosaicState;

		if (state) {
			const { list, curIndex, scrollGroup, isFocused, styleTransform } = state;
			this.setState({ list, curIndex, scrollGroup, isFocused, styleTransform }, this.trackedItemFocused);
		}
	};

	private setFocus = (focused?: boolean, sourceLeftToViewport?: number): boolean => {
		const { isFocused } = this.state;

		if (focused !== isFocused) {
			this.setState({ isFocused: focused });

			if (focused) {
				const focusIndex = this.calcFocusableIndex(sourceLeftToViewport ? sourceLeftToViewport : 0);
				this.setState({ curIndex: focusIndex });
				this.trackedItemFocused();
			} else {
				this.trackedItemFocused(true);
			}
		}

		return true;
	};

	private trackedItemFocused = (isMouseLeave?: boolean) => {
		const itemPerGroup = 3;
		const { curIndex, list } = this.state;
		const curGroup = Math.floor(curIndex / itemPerGroup);
		const indexInGroup = curIndex % itemPerGroup;
		const item = list[curGroup][indexInGroup];

		this.context.focusNav.analytics.triggerItemEvents(
			isMouseLeave ? 'MOUSELEAVE' : 'MOUSEENTER',
			item,
			this.props as any,
			curIndex,
			'wallpaper'
		);
	};

	private moveLeft = (): boolean => {
		const { curIndex } = this.state;

		if (this.focusMap && this.focusMap.length > curIndex && this.focusMap[curIndex]['left'] !== -1) {
			this.calcPosition(this.focusMap[curIndex]['left']);
			return true;
		}

		return false;
	};

	private moveRight = (): boolean => {
		const { curIndex } = this.state;

		if (this.focusMap && this.focusMap.length > curIndex && this.focusMap[curIndex]['right'] !== -1) {
			this.calcPosition(this.focusMap[curIndex]['right']);
			return true;
		}

		return false;
	};

	private moveUp = (): boolean => {
		const { curIndex } = this.state;

		if (this.focusMap && this.focusMap.length > curIndex && this.focusMap[curIndex]['up'] !== -1) {
			this.calcPosition(this.focusMap[curIndex]['up']);
			return true;
		}

		return false;
	};

	private moveDown = (): boolean => {
		const { curIndex } = this.state;

		if (this.focusMap && this.focusMap.length > curIndex && this.focusMap[curIndex]['down'] !== -1) {
			this.calcPosition(this.focusMap[curIndex]['down']);
			return true;
		}

		return false;
	};

	private getLeftToViewport = (): number => {
		let { curIndex } = this.state;
		curIndex = curIndex >= 0 ? curIndex : 0;
		return this.getDistance(curIndex);
	};

	private calcFocusableIndex = (sourceLeftToViewport: number): number => {
		const { curIndex } = this.state;
		const leftIndex = this.focusMap[curIndex]['left'];
		const rightIndex = this.focusMap[curIndex]['right'];
		const focusList = [];

		focusList.push({ index: curIndex, distance: Math.abs(this.getDistance(curIndex) - sourceLeftToViewport) });

		if (leftIndex !== -1 && this.isValidItem(leftIndex)) {
			focusList.push({ index: leftIndex, distance: Math.abs(this.getDistance(leftIndex) - sourceLeftToViewport) });
		}

		if (rightIndex !== -1 && this.isValidItem(rightIndex)) {
			focusList.push({ index: rightIndex, distance: Math.abs(this.getDistance(rightIndex) - sourceLeftToViewport) });
		}

		focusList.sort((a, b) => a.distance - b.distance);

		return focusList && focusList[0] ? focusList[0].index : 0;
	};

	private isValidItem = (index: number): boolean => {
		return this.getItemWidth(index) + this.getDistance(index) < sass.viewportWidth && this.getDistance(index) >= 0;
	};

	private getItemWidth = (index: number): number => {
		const itemPerGroup = 3;
		const curGroup = Math.floor(index / itemPerGroup);
		const itemWidth = curGroup % 2 === 1 ? sass.h7GroupWidth : sass.h7SmallItemWidth;

		return itemWidth;
	};

	private getDistance = (index: number): number => {
		const { styleTransform } = this.state;
		const itemPerGroup = 3;
		const curGroup = Math.floor(index / itemPerGroup);
		const indexInGroup = index % itemPerGroup;
		let leftDistance = curGroup * sass.h7GroupWidth;

		if (indexInGroup === 2) {
			leftDistance = leftDistance + sass.h7SmallItemWidth + sass.h7ItemMargin;
		}

		return styleTransform + leftDistance;
	};

	private exec = (act?: string) => {
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
		const itemPerGroup = 3;
		const { curIndex, list } = this.state;
		const curGroup = Math.floor(curIndex / itemPerGroup);
		const indexInGroup = curIndex % itemPerGroup;
		const item = list[curGroup][indexInGroup];

		this.context.focusNav.analytics.triggerItemEvents('CLICK', item, this.props as any, curIndex, 'wallpaper');
		this.context.router.push(item.path);
	};

	private onRef = ref => {
		this.ref = ref;
	};

	private onScrollAreaRef = ref => (this.scrollRef = ref);

	private groupListItems(listItems: api.ItemSummary[]): api.ItemSummary[][] {
		const list = [];
		let tempArray: api.ItemSummary[] = listItems.slice(0);
		const minimumCellDiff = tempArray.length - this.minimumCellNumber;
		const padArray = amount => {
			return tempArray.concat(sparseToDenseArray(amount));
		};

		if (minimumCellDiff < 0) {
			// fill array up to this.minimumCellNumber
			this.focusMap = this.buildFocusMap(tempArray);
			tempArray = padArray(minimumCellDiff);
		} else if (tempArray.length % 3 !== 0) {
			// fill to be multiple of 3
			tempArray.length = tempArray.length - (tempArray.length % 3);
		}

		if (minimumCellDiff >= 0) this.focusMap = this.buildFocusMap(tempArray);

		while (tempArray.length > 0) list.push(tempArray.splice(0, 3));

		return list;
	}

	private calcPosition = (index: number) => {
		const scrollGroup = Math.floor(index / 3);
		this.applyPosition(scrollGroup, index);
	};

	private applyPosition(scrollGroup: number, index?: number) {
		let { curIndex, list } = this.state;
		let indexChanged;

		if (index !== undefined) {
			curIndex = index;
			indexChanged = true;
		}

		const showLeftArrow = scrollGroup > 0;
		const showRightArrow = scrollGroup < list.length - 1;
		const styleTransform = Math.max(-scrollGroup * sass.h7GroupWidth, sass.viewportWidth - this.scrollRef.clientWidth);

		if (indexChanged) {
			this.setState({ curIndex, scrollGroup, styleTransform, showLeftArrow, showRightArrow }, this.trackedItemFocused);
		} else {
			this.setState({ curIndex, scrollGroup, styleTransform, showLeftArrow, showRightArrow });
		}
	}

	private next = () => {
		const { scrollGroup, list } = this.state;
		if (scrollGroup < list.length - 1) this.applyPosition(scrollGroup + 1);
	};

	private previous = () => {
		const { scrollGroup } = this.state;
		if (scrollGroup > 0) this.applyPosition(scrollGroup - 1);
	};

	private checkArrowDisplay = (listTrans?: number) => {
		if (listTrans === undefined) {
			listTrans = this.state.styleTransform;
		}

		return checkHorizontalArrowDisplay(listTrans, sass.viewportWidth, this.scrollRef.clientWidth);
	};

	private handleMouseEnter = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);

		const arrowDisplay = this.checkArrowDisplay();
		this.setState({ showLeftArrow: arrowDisplay.showPrevArrow, showRightArrow: arrowDisplay.showNextArrow });
	};

	private mouseEnterCell = index => {
		this.setState({ curIndex: index }, this.trackedItemFocused);
	};

	render() {
		const { list, isFocused, styleTransform, showLeftArrow, showRightArrow, isGlobalHeaderVisible } = this.state;
		const transformStyle = transform(styleTransform + 'px', sass.transitionDuration, 0, false, undefined, true);

		return (
			<div className="full-bleed" ref={this.onRef} onMouseEnter={this.handleMouseEnter}>
				<div>
					<div className={bemEntry.b({ isFocused })} style={transformStyle}>
						<div className={bemMosaic.b({ isGlobalHeaderVisible })} ref={this.onScrollAreaRef}>
							{list.map((groupTile, i) => this.renderGroupTile(groupTile, i))}
						</div>
					</div>
					<ArrowButton direction={'left'} onClick={this.previous} show={isFocused && showLeftArrow} />
					<ArrowButton direction={'right'} onClick={this.next} show={isFocused && showRightArrow} />
				</div>
			</div>
		);
	}

	private renderGroupTile = (groupTile: api.ItemSummary[], i: number) => {
		const { customFields } = this.props;
		const { isFocused, curIndex, scrollGroup } = this.state;
		const isVisible = _NO_CSS_TRANSITION_ ? i >= scrollGroup - 1 && i < scrollGroup + 3 : true;

		return (
			<H7MosaicGroup
				className={bemMosaic.e('group')}
				key={i}
				curIndex={curIndex}
				groupIndex={i}
				groupTile={groupTile}
				isVisible={isVisible}
				isFocused={isFocused}
				customFields={customFields}
				itemEnter={this.mouseEnterCell}
				itemClick={this.invokeItem}
			/>
		);
	};
}

// Array.map skips undefined pointers so this allows us to use map with a seemingly sparse array
// ES6 way "[...Array(amount)]" of creating sparse array doesn't work because we transpile to es5
// http://stackoverflow.com/questions/5501581/javascript-new-arrayn-and-array-prototype-map-weirdness

function sparseToDenseArray(amount) {
	return new Array(Math.abs(amount)).fill(undefined);
}
