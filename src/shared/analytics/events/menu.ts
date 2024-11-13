import { merge } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Sources, StreamHandler } from 'shared/analytics/types/stream';
import { DomEventSourceType, MenuTypes } from 'shared/analytics/types/types';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { isEventOfSource } from 'shared/analytics/util/stream';
import { toEvent, withBasicContext } from 'shared/analytics/events/toEvent';

const getDetail = (payload: any): any => {
	return payload;
};

export const menuStreamHandler: StreamHandler = function({ DOM_EVENT, CONTEXT }: Sources) {
	const menuItemClicked$ = DOM_EVENT.pipe(
		isEventOfSource(DomEventSourceType.Menu),
		filter(event => [MenuTypes.Main, MenuTypes.HoverDropdown].indexOf(event.data.type) > -1),
		toEvent(AnalyticsEventType.MENU_CLICKED, getDetail),
		withBasicContext(CONTEXT)
	);

	return {
		EVENT: merge(menuItemClicked$)
	};
};
