import * as React from 'react';
import * as cx from 'classnames';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';
import { ALL_SPORTS_ID } from 'toggle/responsive/pageEntry/gamesSchedule/GamesSchedule';
import { checkNeedToResize } from 'toggle/responsive/pageEntry/utils/epg';
import {
	getColumnClasses,
	isPortrait,
	isSmallTabletSize,
	isLessThanTabletSize,
	isTablet
} from 'toggle/responsive/util/grid';

import Scrollable, { AdaptiveScroll } from 'toggle/responsive/component/Scrollable';
import TickIcon from 'toggle/responsive/component/modal/TickIcon';

import './SportsCarousel.scss';

const bem = new Bem('sports-carousel');
const bemItem = new Bem(bem.e('item'));
const columns: grid.BreakpointColumn[] = [{ phone: 8 }, { phablet: 8 }, { tablet: 4 }, { laptop: 3 }, { desktop: 3 }];
const ADDITION_TO_SCROLL_PER_PAGE = 0.5;
const MOBILE_SCROLL_PER_PAGE = 3;
const TABLET_SCROLL_PER_PAGE = 6;
const LAPTOP_SCROLL_PER_PAGE = 8;
const DESKTOP_SCROLL_PER_PAGE = 12;

interface Props {
	className?: string;
	list: [];
	selectedSports: string[];
	onSelectSport: (selectedSports: any) => void;
}

class SportsCarousel extends React.Component<Props> {
	activeChannelRef: HTMLElement;
	scrollContainer: Scrollable;
	onResizeTimeout: number;
	initialWidth: number;
	initialHeight: number;

	setScrollContainerRef = (ref: Scrollable) => {
		if (!this.scrollContainer) this.scrollContainer = ref;
	};

	componentDidMount() {
		this.initialWidth = window.outerWidth;
		this.initialHeight = window.outerHeight;
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
			this.initialWidth = window.outerWidth;
			this.initialHeight = window.outerHeight;
		}
	};

	private getScrollPerPage = () => {
		// Calculating how many items we need to scroll per page, at the beginning and at the end of the list
		if (isLessThanTabletSize()) {
			return ADDITION_TO_SCROLL_PER_PAGE / MOBILE_SCROLL_PER_PAGE;
		} else if (isPortrait() && isSmallTabletSize()) {
			return ADDITION_TO_SCROLL_PER_PAGE / TABLET_SCROLL_PER_PAGE;
		} else if (isTablet()) {
			return ADDITION_TO_SCROLL_PER_PAGE / LAPTOP_SCROLL_PER_PAGE;
		} else {
			return ADDITION_TO_SCROLL_PER_PAGE / DESKTOP_SCROLL_PER_PAGE;
		}
	};

	getScrollableAdaptiveScroll = (): AdaptiveScroll => {
		return {
			scrollPerPage: this.getScrollPerPage(),
			startScrollPerPage: 0
		};
	};

	renderTick = () => {
		return (
			<div className={bemItem.e('tick')}>
				<TickIcon className={bemItem.e('icon')} width={25} height={22} />
			</div>
		);
	};

	renderSport = sport => {
		const { selectedSports, onSelectSport } = this.props;

		const thumbnail = get(sport, 'images.custom');
		const title = get(sport, 'title');
		const id = get(sport, 'customFields.sport');
		const allSports = id === ALL_SPORTS_ID;
		const allSportsModifier = allSports && ALL_SPORTS_ID;
		const isSelected = (selectedSports.length === 0 && id === ALL_SPORTS_ID) || selectedSports.indexOf(id) > -1;
		const activeSportClass = isSelected ? 'active' : '';

		return (
			<div key={id} className={cx(getColumnClasses(columns))} onClick={() => onSelectSport(id)}>
				<div className={bemItem.b(activeSportClass)}>
					<div className={bemItem.e('thumbnail', allSportsModifier)}>
						<div className={bemItem.e('img')}>
							<img src={thumbnail} />
							{isSelected && this.renderTick()}
						</div>
						<div className={bemItem.e('title')}>{title}</div>
					</div>
				</div>
			</div>
		);
	};

	render() {
		/* tslint:disable-next-line:no-null-keyword */
		if (_SSR_) return null;

		const { className, list } = this.props;

		return (
			<Scrollable
				showArrowsOnMobile={true}
				className={cx(bem.b(), 'row-peek', className)}
				ref={this.setScrollContainerRef}
				length={list.length}
				adaptiveScroll={this.getScrollableAdaptiveScroll()}
				needToResize={() => checkNeedToResize({ width: this.initialWidth, height: this.initialHeight })}
				wrap={false}
			>
				{list.map(this.renderSport)}
			</Scrollable>
		);
	}
}

export default SportsCarousel;
