import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation, GlobalEvent } from 'ref/tv/DirectionalNavigation';
import { skipMove, transform, wrapValue } from 'ref/tv/util/focusUtil';
import { checkHorizontalArrowDisplay } from 'ref/tv/util/domUtils';
import ArrowButton from 'ref/tv/component/ArrowButton';
import sass from 'ref/tv/util/sass';
import './ScrollableList.scss';

export interface ScrollableListProps {
	index: number;
	rowIndex?: number;
	itemWidth: number;
	itemSpace: number;
	items: any[];
	refRowType?: string;
	entryProps?: object;
	invokeItem?: (index: number) => void;
	focusChanged?: (index: number) => void;
	selectedIndex?: number;
	rowHeight: number;
	scrollableListHeight: number;
	template?: string;
	d3SavedState?: any;
	restoreSavedState?: (state: any) => void;
	trackedItemFocused?: (isMouseLeave?: boolean) => void;
}

type ScrollableListState = Partial<{
	d3SavedState: any;
	listTrans: number;
	selectedIndex: number;
	maxIndex: number;
	isFocused: boolean;
	showPrevArrow: boolean;
	showNextArrow: boolean;
}>;

const bem = new Bem('scrollable-list');

export default class ScrollableList extends React.Component<ScrollableListProps, ScrollableListState> {
	static defaultProps = {
		selectedIndex: 0,
		forceOffset: false
	};

	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: React.PropTypes.object.isRequired
	};

	private scrollArea: HTMLElement;
	private focusableRow: Focusable;
	private ref: HTMLElement;

	constructor(props) {
		super(props);

		this.state = {
			d3SavedState: props.d3SavedState,
			listTrans: 0,
			selectedIndex: props.selectedIndex,
			maxIndex: props.items.length - 1,
			showPrevArrow: false,
			showNextArrow: false
		};

		this.focusableRow = {
			focusable: true,
			index: props.index,
			height: props.rowHeight,
			template: props.template,
			refRowType: props.refRowType,
			entryProps: props.entryProps,
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: skipMove,
			moveDown: this.moveDown,
			exec: this.exec,
			getLeftToViewport: this.getLeftToViewport
		};
	}

	componentDidMount() {
		this.context.focusNav.registerRow(this.focusableRow);
		this.calcPosition(this.state.selectedIndex);
		this.focusableRow.ref = this.ref && this.ref.parentElement;
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
		this.context.focusNav.removeEventHandler(GlobalEvent.RESIZED, 'row' + this.props.rowIndex);
	}

	componentWillReceiveProps(nextProps: ScrollableListProps) {
		if (nextProps.items) {
			this.setState({ maxIndex: nextProps.items.length - 1 });
		}

		if (this.props.selectedIndex !== nextProps.selectedIndex) {
			this.changeFocus(nextProps.selectedIndex);
		}

		if (nextProps.d3SavedState !== this.props.d3SavedState) {
			this.setState({ d3SavedState: nextProps.d3SavedState });
		}

		this.focusableRow.entryProps = nextProps.entryProps;
	}

	componentDidUpdate() {
		this.focusableRow.savedState = Object.assign({}, this.state);
	}

	shouldComponentUpdate(nextProps, nextState: ScrollableListState) {
		if (nextProps.template && nextState.listTrans !== this.state.listTrans) {
			this.context.focusNav.analytics.triggerEntryInteracted(nextProps);
		}

		return true;
	}

	private restoreSavedState = (savedState: object) => {
		const state = savedState as ScrollableListState;
		const { restoreSavedState } = this.props;

		if (state) {
			if (restoreSavedState) {
				restoreSavedState(state.d3SavedState);
			}

			this.setState({
				listTrans: state.listTrans,
				selectedIndex: state.selectedIndex,
				maxIndex: state.maxIndex,
				isFocused: state.isFocused
			});

			this.changeFocus(state.selectedIndex);
		}
	};

	private getLeftToViewport = () => {
		const { itemWidth } = this.props;
		const { listTrans, selectedIndex } = this.state;
		const offset = itemWidth * selectedIndex;
		return offset + listTrans;
	};

	private setFocus = (isFocus?: boolean, sourceLeftToViewport?: number): boolean => {
		this.setState({ isFocused: isFocus });

		if (isFocus) {
			this.changeFocus(wrapValue(this.state.selectedIndex, 0, this.state.maxIndex));
			this.props.trackedItemFocused && this.props.trackedItemFocused();
		} else {
			this.props.trackedItemFocused && this.props.trackedItemFocused(true);
		}

		return true;
	};

	private moveLeft = (): boolean => {
		this.changeFocus(wrapValue(this.state.selectedIndex - 1, 0, this.state.maxIndex));
		return true;
	};

	private moveRight = (): boolean => {
		this.changeFocus(wrapValue(this.state.selectedIndex + 1, 0, this.state.maxIndex));
		return true;
	};

	private moveDown = (): boolean => {
		return false;
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
		const { invokeItem } = this.props;
		invokeItem && invokeItem(this.state.selectedIndex);
	};

	private changeFocus = (index: number) => {
		this.setState({ selectedIndex: index });
		this.calcPosition(index);
		this.props.focusChanged && this.props.focusChanged(index);
	};

	onReference = ref => {
		this.scrollArea = ref;
	};

	private next = () => {
		this.shift(true);
	};

	private previous = () => {
		this.shift(false);
	};

	private calcPosition = (index: number) => {
		if (!this.scrollArea) return;

		const { listTrans } = this.state;
		const { itemWidth, itemSpace } = this.props;
		const contentClientWidth = this.scrollArea.clientWidth;
		const min = contentClientWidth - this.scrollArea.scrollWidth;
		const left = Math.max(0, index * itemWidth);
		const right = left + itemWidth - itemSpace;

		if (left < Math.abs(listTrans)) {
			this.shift(false, left, right);
		}

		if (right - contentClientWidth > Math.abs(listTrans) || listTrans < min) {
			this.shift(true, left, right);
		}
	};

	private shift = (right: boolean, leftDistance?: number, rightDistance?: number, listTransDistance?: number) => {
		const { itemWidth, itemSpace } = this.props;
		const contentClientWidth = this.scrollArea.clientWidth;
		const ipp = Math.floor((contentClientWidth + itemSpace) / itemWidth);
		const min = contentClientWidth - this.scrollArea.scrollWidth;
		const distance = ipp * itemWidth;
		let { listTrans } = this.state;

		if (listTransDistance) listTrans = listTransDistance;

		if (right) {
			listTrans -= distance;
			listTrans = Math.max(listTrans, min);
		} else {
			listTrans += distance;
			listTrans = Math.min(listTrans, 0);
		}

		if (listTrans !== 0 && leftDistance < Math.abs(listTrans)) {
			this.shift(false, leftDistance, rightDistance, listTrans);
			return;
		}

		if (listTrans !== min && rightDistance - contentClientWidth > Math.abs(listTrans)) {
			this.shift(true, leftDistance, rightDistance, listTrans);
			return;
		}

		const arrowDisplay = this.checkArrowDisplay(listTrans);

		this.setState({
			showPrevArrow: arrowDisplay.showPrevArrow,
			showNextArrow: arrowDisplay.showNextArrow,
			listTrans
		});
	};

	private checkArrowDisplay = (listTrans?: number) => {
		if (listTrans === undefined) {
			listTrans = this.state.listTrans;
		}

		return checkHorizontalArrowDisplay(listTrans, this.scrollArea.clientWidth, this.scrollArea.scrollWidth);
	};

	private handleMouseEnter = () => {
		if (!this.context.focusNav.disableMouseFocus) {
			this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);

			const arrowDisplay = this.checkArrowDisplay();
			this.setState({ showPrevArrow: arrowDisplay.showPrevArrow, showNextArrow: arrowDisplay.showNextArrow });
		}
	};

	private handleMouseLeave = () => {
		this.setState({ isFocused: false, showPrevArrow: false, showNextArrow: false });
	};

	render(): any {
		const { items, scrollableListHeight } = this.props;
		const { showPrevArrow, showNextArrow, listTrans, isFocused } = this.state;

		if (items.length === 0) return false;

		const styleTransform = transform(listTrans + 'px', sass.transitionDuration, 0, false, undefined, true);

		return (
			<div
				className={bem.b({ focused: isFocused })}
				ref={ref => (this.ref = ref)}
				style={{ height: `${scrollableListHeight}px` }}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
			>
				<div ref={this.onReference} className={bem.e('list')} style={styleTransform}>
					{items}
				</div>

				<ArrowButton
					direction={'left'}
					className={bem.e('arrow', 'prev')}
					onClick={this.previous}
					show={showPrevArrow}
				/>
				<ArrowButton direction={'right'} className={bem.e('arrow', 'next')} onClick={this.next} show={showNextArrow} />
			</div>
		);
	}
}
