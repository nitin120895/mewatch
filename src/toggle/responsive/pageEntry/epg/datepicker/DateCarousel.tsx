import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { Bem } from 'shared/util/styles';
import Scrollable, { AdaptiveScroll } from '../../../component/Scrollable';
import DateEntry from './DateEntry';
import { BREAKPOINTS, isPortrait, isSmallTabletSize } from '../../../util/grid';
import { checkNeedToResize, scrollCarouselToActiveItem } from '../../utils/epg';

import './DateCarousel.scss';

const bemDateCarousel = new Bem('date-carousel');
export const SCROLL_ON_RESIZE_TIMEOUT = 200;

interface DateCarouselOwnProps {
	dates: Date[];
	onChange: (date: Date, index: number) => void;
	currentDateIndex: number;
}

export default class DateCarousel extends React.Component<DateCarouselOwnProps> {
	private dateEntryRef: HTMLElement;
	private scrollContainer: Scrollable;
	private onResizeTimeout: number;
	private initialWidth = window.outerWidth;
	private initialHeight = window.outerHeight;
	private previousIndex: number;

	componentDidMount() {
		scrollCarouselToActiveItem(this.scrollContainer, this.dateEntryRef);
		window.addEventListener('resize', this.onResize, false);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onResize);
		clearTimeout(this.onResizeTimeout);
	}

	private onResize = () => {
		// This check is added to avoid resetScroll calling on scroll for some android devices where browser
		// shows/hides navigation bar on scroll and trigger resize event.
		if (checkNeedToResize({ width: this.initialWidth, height: this.initialHeight })) {
			clearTimeout(this.onResizeTimeout);
			this.onResizeTimeout = window.setTimeout(this.resetScroll, SCROLL_ON_RESIZE_TIMEOUT);
			this.initialWidth = window.outerWidth;
			this.initialHeight = window.outerHeight;
		}
	};

	private resetScroll = () => {
		scrollCarouselToActiveItem(this.scrollContainer, this.dateEntryRef);
	};

	render() {
		const { dates, currentDateIndex } = this.props;
		return (
			<div className={bemDateCarousel.b()}>
				<Scrollable
					ref={this.setScrollContainerRef}
					adaptiveScroll={this.getScrolableAdaptiveScroll()}
					className={bemDateCarousel.e('scrollable')}
					length={dates.length}
					currentIndex={currentDateIndex}
					alignToCenter={true}
					needToResize={() => checkNeedToResize({ width: this.initialWidth, height: this.initialHeight })}
				>
					{dates.map(this.renderDate)}
				</Scrollable>
			</div>
		);
	}

	onChange = (date: Date, index: number) => {
		if (this.previousIndex === index) return;
		this.previousIndex = index;
		this.props.onChange(date, index);
	};

	// isMobile return not correct value in this case
	private isMobileSizeOverride(): boolean {
		return window.innerWidth < BREAKPOINTS.tablet && window.innerHeight < BREAKPOINTS.tablet;
	}

	private getScrolableAdaptiveScroll(): AdaptiveScroll {
		// Calculating how many items we need to scroll per page, at the beginning and at the end of the list
		if (this.isMobileSizeOverride()) return { scrollPerPage: 1, startScrollPerPage: 1 };
		else if (isPortrait() && isSmallTabletSize()) return { scrollPerPage: 0.5 / 6, startScrollPerPage: 0.5 / 6 };
		else return { scrollPerPage: 0.5 / 8, startScrollPerPage: 0.5 / 8 };
	}

	private renderDate = (date: Date, index: number) => {
		const { currentDateIndex } = this.props;
		return (
			<DateEntry
				ref={e => this.setTodayDateEntry(e, index)}
				key={date.toString()}
				date={date}
				index={index}
				isActive={index === currentDateIndex}
				onClick={this.onChange}
			/>
		);
	};

	private setScrollContainerRef = (ref: any) => {
		if (!this.scrollContainer) this.scrollContainer = ref;
	};

	private setTodayDateEntry = (ref: any, index: number) => {
		if (index === this.props.currentDateIndex) {
			this.dateEntryRef = findDOMNode<HTMLElement>(ref);
			scrollCarouselToActiveItem(this.scrollContainer, this.dateEntryRef);
		}
	};
}
