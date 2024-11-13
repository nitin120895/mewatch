import * as React from 'react';
import MosaicCell from 'ref/responsive/pageEntry/hero/h7/MosaicCell';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import SlideArrow from 'ref/responsive/component/SlideArrow';
import PageScroll from 'ref/responsive/util/PageScroll';

import './H7Mosaic.scss';
import { isIE11 } from 'shared/util/browser';

const bemEntry = new Bem('h7-entry');
const bemMosaic = new Bem('h7-mosaic');

interface H7MosaicState {
	activeCellId?: string;
	list?: api.ItemSummary[];
	enableAnimations?: boolean;
	freeScrollEnabled?: boolean;
	currentSlidePos?: number;
}

let pageScroller;

export default class H7Mosaic extends React.Component<PageEntryListProps, H7MosaicState> {
	private minimumCellNumber = 9; // minimum amount of cells needed
	private row: HTMLElement;
	private itemGroup: HTMLElement;
	private itemGroupWidth: number;
	private itemGroupMatrix = {};
	private firstIndex = 1;
	private lastIndex: number;

	constructor(props: PageEntryListProps) {
		super(props);
		this.state = {
			activeCellId: undefined,
			list: this.groupListItems(props.list ? props.list.items : []),
			enableAnimations: false,
			freeScrollEnabled: true,
			currentSlidePos: 1
		};
	}

	componentDidMount() {
		window.addEventListener('resize', this.onResize, false);
		this.onResize();
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onResize);
		this.reset();
	}

	componentWillReceiveProps(nextProps: PageEntryListProps) {
		if (nextProps.list !== this.props.list) {
			const list = this.groupListItems(nextProps.list.items);
			if (this.state.list !== list) {
				this.reset();
				this.setState({ list, currentSlidePos: 1, activeCellId: undefined });
			}
		}
	}

	public shouldComponentUpdate(nextProps: PageEntryListProps, nextState: H7MosaicState): boolean {
		const { list } = this.props;
		const { enableAnimations, activeCellId } = this.state;
		return (
			nextProps.list !== list ||
			nextState.activeCellId !== activeCellId ||
			(!isIE11() && nextState.enableAnimations !== enableAnimations)
		);
	}

	componentDidUpdate(prevProps: PageEntryListProps) {
		if (prevProps.list !== this.props.list) {
			this.scrollCalculations();
		}
	}

	private reset = () => {
		// Reset the scroll position ready for a new list
		pageScroller.cancelAnimation();
		this.lastIndex = undefined;
		this.itemGroupMatrix = {};
		this.row.scrollLeft = 0;
	};

	private groupListItems(listItems: api.ItemSummary[]) {
		const list = [];
		let tempArray: api.ItemSummary[] = listItems.slice(0);
		const minimumCellDiff = tempArray.length - this.minimumCellNumber;

		const padArray = amount => {
			return tempArray.concat(sparseToDenseArray(amount));
		};

		if (minimumCellDiff < 0) tempArray = padArray(minimumCellDiff);
		else if (tempArray.length % 3 !== 0)
			// fill array up to this.minimumCellNumber
			tempArray.length = tempArray.length - (tempArray.length % 3); // fill to be multiple of 3

		while (tempArray.length > 0) list.push(tempArray.splice(0, 3));

		return list;
	}

	private getAnimateParams = index => {
		// reset if at end || beginning
		if (index < this.firstIndex) index = this.firstIndex;
		if (index > this.lastIndex) index = this.lastIndex;

		const startPos = this.calculateLeftScrollPos(this.itemGroupMatrix[index]);
		const endPos = this.row.scrollLeft;
		this.setState({ currentSlidePos: index });
		pageScroller.scroll(startPos, endPos);
	};

	private moveSlide = direction => {
		pageScroller.cancelAnimation();
		let currentSlidePos = this.state.currentSlidePos;

		if (direction === 'forward') currentSlidePos++;
		if (direction === 'backward') currentSlidePos--;

		this.getAnimateParams(currentSlidePos);
	};

	private calculateLeftScrollPos = toPosition => toPosition - this.itemGroupWidth * 0.055;

	private scrollCalculations = () => {
		if (this.itemGroup) {
			this.itemGroupWidth = this.itemGroup.offsetWidth;
			const wasLastIndex = this.lastIndex === this.state.currentSlidePos;

			// this is to work out last index - if `itemGroup` takes up 47% of the viewport it means
			// two groups are always showing so we need to shorten lastIndex by 1.
			const sizeCheck = Math.floor((this.itemGroup.offsetWidth / this.row.offsetWidth) * 100) === 47;
			this.lastIndex = this.state.list.length + (sizeCheck ? -1 : 0);

			let currentSlidePos = this.state.currentSlidePos;

			// check for when the list props change after first render
			if (this.state.currentSlidePos > this.lastIndex || wasLastIndex) {
				currentSlidePos = this.lastIndex;
				this.setState({ currentSlidePos });
			}

			this.state.list.forEach((item, i) => {
				this.itemGroupMatrix[i + 1] = this.itemGroupWidth * i;
			});

			// Maintain relative scroll offset when resizing the viewport
			this.row.scrollLeft = this.calculateLeftScrollPos(this.itemGroupMatrix[currentSlidePos]);
		}
	};

	private onGroupReference = node => (this.itemGroup = node);
	private onRowReference = node => {
		this.row = node;
		pageScroller = new PageScroll({
			element: this.row,
			duration: 50,
			scrollType: 'scrollLeft'
		});
	};

	private onMouseOver = () => {
		this.setState({
			enableAnimations: true,
			freeScrollEnabled: false
		});
	};

	private onMouseLeave = () => {
		this.setState({
			enableAnimations: false,
			freeScrollEnabled: true
		});
	};

	private onFirstCellFocused = (index: number) => {
		if (index === 0) {
			// Ensure we're always in the top left when focusing the first item. This is particularly import
			// when reverse tab traversing on the vertical mobile layout.
			window.scrollTo(0, 0);
		}
	};

	private onGroupFocused = e => {
		const index = Number(e.currentTarget.getAttribute('data-key'));
		if (index && index !== this.state.currentSlidePos) {
			pageScroller.cancelAnimation();
			this.getAnimateParams(index);
		}
	};

	private onCellMouseOver = id => this.setState({ activeCellId: id });
	private onClickLeftArrow = () => this.moveSlide('backward');
	private onClickRightArrow = () => this.moveSlide('forward');
	private onResize = (e?) => window.requestAnimationFrame(this.scrollCalculations);

	render() {
		const classes = cx(this.state.freeScrollEnabled ? bemEntry.b() : bemEntry.b('scroll', 'disable-scroll'));

		let buttonRight, buttonLeft;

		if (!this.state.freeScrollEnabled) {
			buttonRight = this.state.currentSlidePos !== this.lastIndex;
			buttonLeft = this.state.currentSlidePos !== this.firstIndex;
		} else {
			buttonRight = false;
			buttonLeft = false;
		}

		return (
			<div className="full-bleed">
				<div
					className={classes}
					onMouseOver={this.onMouseOver}
					onMouseLeave={this.onMouseLeave}
					onMouseEnter={this.onMouseOver}
				>
					<div className={bemEntry.e('scroll')} ref={this.onRowReference}>
						<div className={bemMosaic.b()}>
							{this.state.list.map((groupTile, i) => this.renderGroupTile(groupTile, i))}
						</div>
					</div>
					<SlideArrow
						direction={'left'}
						visible={buttonLeft}
						disabled={!buttonLeft}
						onClick={this.onClickLeftArrow}
						ariaLabel={'@{carousel_arrow_left_aria|See previous}'}
						ariaHidden={true}
					/>
					<SlideArrow
						direction={'right'}
						visible={buttonRight}
						disabled={!buttonRight}
						onClick={this.onClickRightArrow}
						ariaLabel={'@{carousel_arrow_right_aria|See more}'}
						ariaHidden={true}
					/>
				</div>
			</div>
		);
	}

	private renderGroupTile = (groupTile, i) => {
		// We only need the reference for the first group since they're all the same dimensions.
		let groupIndex = i * 3;
		return (
			<div
				className={bemMosaic.e('group')}
				key={i}
				ref={i === 0 ? this.onGroupReference : undefined}
				data-key={i + 1}
				onFocus={this.onGroupFocused}
			>
				{groupTile.map((item, i) => {
					let index = groupIndex + i;
					let isActive;
					if (item) isActive = !this.state.enableAnimations || this.state.activeCellId === item.id;
					return (
						<MosaicCell
							index={index}
							onFocus={index === 0 ? this.onFirstCellFocused : undefined}
							onMouseOver={this.onCellMouseOver}
							isHovered={isActive}
							key={`cell-${i}`}
							item={item}
							isPrimary={i === 0}
						/>
					);
				})}
			</div>
		);
	};
}

// Array.map skips undefined pointers so this allows us to use map with a seemingly sparse array
// ES6 way "[...Array(amount)]" of creating sparse array doesn't work becuase we transpile to es5
// http://stackoverflow.com/questions/5501581/javascript-new-arrayn-and-array-prototype-map-weirdness

function sparseToDenseArray(amount: number) {
	return new Array(Math.abs(amount)).fill(undefined);
}
