import Scrollable from '../../component/Scrollable';
import { EPG2ItemState } from '../../util/epg';

export const scrollCarouselToActiveItem = (scrollContainer: Scrollable, item: HTMLElement, forceScroll?: boolean) => {
	if (scrollContainer && item) {
		const viewportMiddlePosition = window.innerWidth / 2 - item.offsetWidth / 2;
		const scrollPosition = (item.offsetLeft - viewportMiddlePosition) / window.innerWidth;
		scrollContainer.restoreScrollPosition(scrollPosition < 0 ? 0 : scrollPosition, forceScroll);
	}
};

export const checkNeedToResize = props => window.outerHeight !== props.height && window.outerWidth !== props.width;

export const getEPGItemState = (startDate: Date, endDate: Date, now: Date): EPG2ItemState => {
	startDate = new Date(startDate);
	endDate = new Date(endDate);
	if (startDate < now && endDate < now) return EPG2ItemState.PAST;
	else if (startDate > now && endDate > now) return EPG2ItemState.FUTURE;
	return EPG2ItemState.ON_NOW;
};
