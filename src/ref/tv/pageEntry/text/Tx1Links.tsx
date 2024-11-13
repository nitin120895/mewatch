import * as React from 'react';
import * as PropTypes from 'prop-types';
import EntryTitle from 'ref/tv/component/EntryTitle';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { Focusable } from 'ref/tv/focusableInterface';
import { skipMove, wrapValue } from 'ref/tv/util/focusUtil';
import { checkHorizontalArrowDisplay } from 'ref/tv/util/domUtils';
import { transform } from 'ref/tv/util/focusUtil';
import { Bem } from 'shared/util/styles';
import sass from 'ref/tv/util/sass';
import { setPaddingStyle } from 'ref/tv/util/rows';
import Tx1LinkItem from './Tx1LinkItem';
import ArrowButton from 'ref/tv/component/ArrowButton';
import './Tx1Links.scss';

const bem = new Bem('tx1-links');
const LEFT_EDGE = sass.tx1LeftEdge;
const RIGHT_EDGE = sass.tx1RightEdge;
const ITEM_MARGIN_RIGHT = sass.tx1ItemMarginRight;

interface Tx1LinksState {
	selectedIndex: number;
	isFocused: boolean;
	listTrans: number;
	list: api.ItemSummary[];
	showPrevArrow: boolean;
	showNextArrow: boolean;
}

export default class Tx1Links extends React.Component<PageEntryListProps, Tx1LinksState> {
	context: {
		router: ReactRouter.InjectedRouter;
		focusNav: DirectionalNavigation;
	};

	static contextTypes = {
		router: PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private ref: HTMLElement;
	private listRef: HTMLElement;
	private btnRefs: HTMLDivElement[] = [];
	private colorWhite = '#FFFFFF';
	private colorBlue = '#0099F7';

	constructor(props) {
		super(props);

		this.state = {
			listTrans: 0,
			selectedIndex: 0,
			isFocused: false,
			list: props.list && props.list.items.slice(),
			showPrevArrow: false,
			showNextArrow: false
		};

		this.focusableRow = {
			focusable: true,
			index: (props.index + 1) * 10,
			height: 0,
			template: props.template,
			entryProps: props,
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: skipMove,
			moveDown: skipMove,
			exec: this.exec,
			getLeftToViewport: this.getLeftToViewport
		};
	}

	componentDidMount() {
		let entryNode: HTMLElement = this.context.focusNav.getRowEntry(this.props.index);

		if (!entryNode) entryNode = this.ref;

		setPaddingStyle(entryNode, this.props.customFields);

		const { title, customFields } = this.props;
		let rowHeight = sass.tx1LinksHeight;
		let hasTitle = false;

		if (title) {
			rowHeight += sass.assetListTitleHeight;
			hasTitle = true;
		}

		if (customFields && customFields.customTagline) {
			rowHeight += sass.assetListTaglineHeight;
			hasTitle = true;
		}

		if (hasTitle) {
			rowHeight += sass.assetListTitleMarginBottom;
		}

		this.focusableRow.height = rowHeight;
		this.focusableRow.ref = this.ref;

		this.context.focusNav.registerRow(this.focusableRow);

		this.populateList(this.props);
	}

	componentWillReceiveProps(newProps: PageEntryListProps) {
		if (this.props.list.items.length !== newProps.list.items.length) {
			this.populateList(newProps);
		}

		this.focusableRow.entryProps = newProps;
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	componentDidUpdate() {
		this.focusableRow.savedState = Object.assign({}, this.state);
	}

	shouldComponentUpdate(nextProps, nextState: Tx1LinksState) {
		if (nextState.listTrans !== this.state.listTrans) {
			this.context.focusNav.analytics.triggerEntryInteracted(nextProps);
		}

		return true;
	}

	private populateList = (props: PageEntryListProps) => {
		if (!props.list) return;

		const customLink = props.customFields && props.customFields['moreLinkUrl'];
		const moreLinkUrl = customLink || props.list.path;
		let list = props.list.items.slice();

		if (!list || list.length <= 0) {
			return;
		}

		if (props.list.size > 24) {
			list = list.slice(0, 23);
			list.push({
				id: 'viewall',
				type: 'link',
				title: 'View All',
				path: moreLinkUrl
			});
		} else if (customLink) {
			list.push({
				id: 'viewall',
				type: 'link',
				title: 'View All',
				path: customLink
			});
		}

		this.setState({ list });
	};

	private restoreSavedState = (savedState: object) => {
		const state = savedState as Tx1LinksState;

		if (state) {
			this.setState(
				{
					listTrans: state.listTrans,
					selectedIndex: state.selectedIndex,
					isFocused: state.isFocused
				},
				this.trackedItemFocused
			);
		}
	};

	private getLeftToViewport = () => {
		const { listTrans, selectedIndex } = this.state;
		const offset = this.calcOffset(this.btnRefs[selectedIndex]);
		return offset.left + listTrans;
	};

	private calcFocusableIndex = (sourceLeftToViewport: number): number => {
		const { listTrans } = this.state;
		let chooseIndex = -1;
		let minDistance = 99999;
		const lens = this.btnRefs.length;
		const fullScreenWidth = sass.viewportWidth;

		for (let i = 0; i < lens; ++i) {
			const left = this.calcOffset(this.btnRefs[i]).left;
			const distance = Math.abs(listTrans + left - sourceLeftToViewport);

			if (distance <= minDistance) {
				minDistance = distance;
				chooseIndex = i;
			} else {
				break;
			}
		}

		const chooseBtn = this.btnRefs[chooseIndex];
		const eleLeftToViewport = this.calcOffset(chooseBtn).left;

		if (chooseBtn.offsetWidth + eleLeftToViewport + listTrans > fullScreenWidth) {
			chooseIndex = Math.max(0, chooseIndex - 1);
		}

		if (eleLeftToViewport + listTrans < 0) {
			chooseIndex = Math.min(lens - 1, chooseIndex + 1);
		}

		return chooseIndex;
	};

	private trackedItemFocused = (isMouseLeave?: boolean) => {
		const { list, selectedIndex } = this.state;
		this.context.focusNav.analytics.triggerItemEvents(
			isMouseLeave ? 'MOUSELEAVE' : 'MOUSEENTER',
			list[selectedIndex],
			this.props as any,
			selectedIndex
		);
	};

	private setFocus = (isFocus?: boolean, sourceLeftToViewport?: number): boolean => {
		this.setState({ isFocused: isFocus });

		if (isFocus) {
			const shouldFocusIndex = this.calcFocusableIndex(sourceLeftToViewport || 0);

			if (shouldFocusIndex > -1) {
				this.setState({ selectedIndex: shouldFocusIndex }, this.trackedItemFocused);
			}
		} else {
			this.trackedItemFocused(true);
		}

		return true;
	};

	private moveLeft = (): boolean => {
		this.changeFocus(wrapValue(this.state.selectedIndex - 1, 0, this.state.list.length - 1));
		return true;
	};

	private moveRight = (): boolean => {
		this.changeFocus(wrapValue(this.state.selectedIndex + 1, 0, this.state.list.length - 1));
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
		this.context.focusNav.analytics.triggerItemEvents('CLICK', list[selectedIndex], this.props as any, selectedIndex);
		this.context.router.push(list[selectedIndex].path);
	};

	private changeFocus = (index: number) => {
		let { listTrans, selectedIndex } = this.state;
		const offset = this.calcOffset(this.btnRefs[index]);
		const inbound = this.calcInbound(offset.left, offset.left + offset.width, listTrans);

		if (inbound > 0) {
			listTrans = LEFT_EDGE - offset.left;
		} else if (inbound < 0) {
			listTrans = RIGHT_EDGE - (offset.left + offset.width);
		}

		listTrans = Math.min(listTrans, 0);
		listTrans = Math.max(listTrans, Math.min(0, RIGHT_EDGE - LEFT_EDGE - this.listRef.clientWidth + ITEM_MARGIN_RIGHT));

		if (index !== selectedIndex) {
			this.setState({ selectedIndex: index, listTrans }, this.trackedItemFocused);
		}
	};

	private calcOffset(ref: HTMLElement) {
		return {
			left: LEFT_EDGE + ref.offsetLeft,
			width: ref.offsetWidth
		};
	}

	private calcInbound = (left, right, listTrans) => {
		if (left < LEFT_EDGE - listTrans) {
			return -1;
		} else if (right > RIGHT_EDGE - listTrans) {
			return 1;
		} else {
			return 0;
		}
	};

	private convertColor = (color, opacity) => {
		return `rgba(
			${parseInt(color.substr(1, 2), 16)},
			${parseInt(color.substr(3, 2), 16)},
			${parseInt(color.substr(5, 2), 16)},
			${opacity / 100})`;
	};

	private checkArrowDisplay = (listTrans?: number) => {
		if (listTrans === undefined) {
			listTrans = this.state.listTrans;
		}

		return checkHorizontalArrowDisplay(listTrans, RIGHT_EDGE - LEFT_EDGE + ITEM_MARGIN_RIGHT, this.listRef.clientWidth);
	};

	private handleMouseEnter = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);

		const arrowDisplay = this.checkArrowDisplay();
		this.setState({ showPrevArrow: arrowDisplay.showPrevArrow, showNextArrow: arrowDisplay.showNextArrow });
	};

	private handleMouseLeave = () => {
		this.setState({ showPrevArrow: false, showNextArrow: false });
	};

	private itemMouseEnter = index => {
		this.setState({ selectedIndex: index }, this.trackedItemFocused);
	};

	private shift = (right: boolean) => {
		let { listTrans } = this.state;

		if (right) {
			listTrans -= this.ref.offsetWidth;
		} else {
			listTrans += this.ref.offsetWidth;
		}

		listTrans = Math.min(listTrans, 0);
		listTrans = Math.max(listTrans, Math.min(0, RIGHT_EDGE - LEFT_EDGE - this.listRef.clientWidth + ITEM_MARGIN_RIGHT));

		const arrowDisplay = this.checkArrowDisplay(listTrans);

		this.setState({
			showPrevArrow: arrowDisplay.showPrevArrow,
			showNextArrow: arrowDisplay.showNextArrow,
			listTrans
		});
	};

	private next = () => {
		this.shift(true);
	};

	private previous = () => {
		this.shift(false);
	};

	private onReference = (ref, index) => {
		this.btnRefs[index] = ref;
	};

	render(): any {
		const { customFields } = this.props;
		const { list, selectedIndex, isFocused, listTrans, showPrevArrow, showNextArrow } = this.state;
		const styleTransform = transform(listTrans + 'px');
		const textOpacity = (customFields.textColor && customFields.textColor.opacity) || 100;
		const backgroundOpacity = (customFields.backgroundColor && customFields.backgroundColor.opacity) || 100;
		const textColor = (customFields.textColor && customFields.textColor.color) || this.colorWhite;
		const backgroundColor = (customFields.backgroundColor && customFields.backgroundColor.color) || this.colorWhite;
		const blueColor = this.convertColor(this.colorBlue, textOpacity);
		const whiteColor = this.convertColor(this.colorWhite, textOpacity);
		const color = this.convertColor(textColor, textOpacity);
		const background = this.convertColor(backgroundColor, backgroundOpacity);

		return (
			<div className={bem.b()} ref={ref => (this.ref = ref)} style={{ height: `${this.focusableRow.height}px` }}>
				<EntryTitle {...this.props} />
				<div
					className={bem.e('list-content')}
					onMouseEnter={this.handleMouseEnter}
					onMouseLeave={this.handleMouseLeave}
				>
					<div className={bem.e('list')} style={styleTransform} ref={ref => (this.listRef = ref)}>
						{list.map((item, index) => {
							const focused = isFocused && selectedIndex === index;

							return (
								<Tx1LinkItem
									className={bem.e('button', { focused })}
									setBtnRefs={this.onReference}
									key={`${item.id}-${index}`}
									style={{
										color: focused ? (color === whiteColor ? blueColor : color) : color,
										borderColor: focused ? '' : background
									}}
									index={index}
									item={item}
									onMouseEnter={this.context.focusNav.mouseActive ? this.itemMouseEnter : undefined}
									onClick={this.context.focusNav.mouseActive ? this.invokeItem : undefined}
								/>
							);
						})}
					</div>

					<ArrowButton
						direction={'left'}
						className={bem.e('arrow', 'prev')}
						onClick={this.previous}
						show={showPrevArrow}
					/>
					<ArrowButton
						direction={'right'}
						className={bem.e('arrow', 'next')}
						onClick={this.next}
						show={showNextArrow}
					/>
				</div>
			</div>
		);
	}
}
