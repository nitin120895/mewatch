import { merge } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Sources, StreamHandler } from 'shared/analytics/types/stream';
import { isActionOfType } from 'shared/analytics/util/stream';
import { toEvent, withContext } from 'shared/analytics/events/toEvent';
import { ANALYTICS_EVENT } from '../analyticsWorkflow';

import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';

const getDetail = (payload: any): any => {
	return payload;
};

export const genericStreamHandler: StreamHandler = function(sources: Sources) {
	const analyticsEvent$ = sources.ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		filter(({ payload }) => payload.event === AnalyticsEventType.GENERIC_ANALYTICS_EVENT),
		toEvent(AnalyticsEventType.GENERIC_ANALYTICS_EVENT, getDetail),
		withContext(sources.CONTEXT)
	);

	return {
		EVENT: merge(analyticsEvent$)
	};
};
