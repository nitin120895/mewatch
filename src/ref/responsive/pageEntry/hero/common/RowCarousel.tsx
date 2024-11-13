import * as React from 'react';
import SlideArrow from '../../../component/SlideArrow';
import Swipe from 'ref/responsive/component/Swipe';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';

import './RowCarousel.scss';

interface RowCarouselProps {
	items: any[];
	itemWidthPerc: number;
	itemIndex?: number;
	className?: string;
	scrollX?: number;
	onScroll?: (scrollX: number) => void;
	childRenderTemplate: (item: any, i: number) => any;
	rightMargin?: number;
	onTransition?: () => void;
}

interface RowCarouselState {
	transformPosition?: {};
	noScrollTransition?: boolean;
	showRightArrow?: boolean;
	singleRow?: boolean;
	showArrows?: {
		right: boolean;
		left: boolean;
	};
}

const bem = new Bem('row-carousel');

export default class RowCarousel extends React.Component<RowCarouselProps, RowCarouselState> {
	static defaultProps = { rightMargin: 0 };

	private currentIndex = 0;
	private lastIndex: number;
	private scrollToIndexes = [0];
	private itemsPerPage: number;

	constructor(props) {
		super(props);
		this.state = {
			transformPosition: undefined,
			noScrollTransition: false,
			showRightArrow: true,
			singleRow: false,
			showArrows: {
				right: false,
				left: false
			}
		};
	}

	componentDidMount() {
		this.setup(this.props);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.items !== nextProps.items) this.setup(nextProps);
		if (this.props.itemIndex !== nextProps.itemIndex) this.autoTransition(nextProps.itemIndex);
	}

	private setup = props => {
		const { itemWidthPerc, items, rightMargin } = props;
		const itemAmount = items.length;

		if (itemAmount === 0) return;

		this.scrollToIndexes = [0];
		this.itemsPerPage = Math.ceil(100 / itemWidthPerc);
		let itemAmountCount = itemAmount - this.itemsPerPage;
		let indexCount = 0;

		while (itemAmountCount > indexCount) {
			indexCount += this.itemsPerPage;
			let scrollWidth = indexCount * itemWidthPerc;
			this.scrollToIndexes.push(scrollWidth);
		}

		if (this.scrollToIndexes.length > 1) {
			const lastPos = itemAmount * itemWidthPerc - ((this.scrollToIndexes.length - 1) * 100 + rightMargin);
			this.scrollToIndexes[this.scrollToIndexes.length - 1] = lastPos;
		}

		this.setState({ singleRow: this.scrollToIndexes.length === 1 });
		this.currentIndex = 0;
		this.lastIndex = this.scrollToIndexes.length - 1 || 1;
	};

	private getIndex = direction => {
		if (direction === 'forward') this.currentIndex++;
		else this.currentIndex--;
		if (this.currentIndex < 0) this.currentIndex = 0;
		if (this.currentIndex > this.lastIndex) this.currentIndex = this.lastIndex;
		return this.currentIndex;
	};

	private transition = (index, updateArrowState = true) => {
		const scrollPosVal = -this.scrollToIndexes[index];
		const nextState: RowCarouselState = {
			transformPosition: { transform: `translateX(${scrollPosVal}%)` }
		};

		if (updateArrowState) nextState.showArrows = this.shouldShowArrows();

		this.setState(nextState);
	};

	private autoTransition(itemIndex) {
		this.currentIndex = Math.floor(itemIndex / this.itemsPerPage);
		this.transition(this.currentIndex, false);
	}

	private backward = () => {
		this.transition(this.getIndex('backward'));
		if (this.props.onTransition) this.props.onTransition();
	};

	private forward = () => {
		this.transition(this.getIndex('forward'));
		if (this.props.onTransition) this.props.onTransition();
	};

	private arrowCheck = condition => {
		if (this.state.singleRow) return false;
		else return condition;
	};

	private shouldShowArrows = () => {
		return {
			right: this.arrowCheck(this.currentIndex !== this.lastIndex),
			left: this.arrowCheck(this.currentIndex !== 0)
		};
	};

	private onMouseEnter = e => this.setState({ showArrows: this.shouldShowArrows() });

	private onMouseLeave = e => {
		this.setState({
			showArrows: {
				right: false,
				left: false
			}
		});
	};

	render() {
		const { transformPosition, noScrollTransition, showArrows, singleRow } = this.state;
		const containerClasses = cx(
			'grid-margin',
			bem.e('container', { 'no-transition': noScrollTransition }, { centered: singleRow })
		);
		return (
			<Swipe swipeLeft={this.backward} swipeRight={this.forward} transitionDuration={1000}>
				<div
					className={cx(bem.b(), this.props.className)}
					onMouseEnter={this.onMouseEnter}
					onMouseLeave={this.onMouseLeave}
				>
					<SlideArrow direction={'left'} visible={showArrows.left} onClick={this.backward} />
					<div style={transformPosition} className={containerClasses}>
						{this.props.items.map(this.props.childRenderTemplate)}
					</div>
					<SlideArrow direction={'right'} visible={showArrows.right} onClick={this.forward} />
				</div>
			</Swipe>
		);
	}
}
