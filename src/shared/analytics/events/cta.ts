import { merge } from 'rxjs';
import { Sources, StreamHandler } from 'shared/analytics/types/stream';
import { DomEventSourceType, EventName } from 'shared/analytics/types/types';
import { SocialPlatformAction } from 'shared/analytics/types/v3/action/redux-actions';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { isEventOfSource, isEventOfType, isActionOfType } from 'shared/analytics/util/stream';
import { toEvent, withContext } from 'shared/analytics/events/toEvent';
import { SHARE_MODAL_SOCIAL_PLATFORM } from 'shared/uiLayer/uiLayerWorkflow';

const getDetail = (payload: any): any => {
	return payload;
};

export const ctaStreamHandler: StreamHandler = function(sources: Sources) {
	const { ACTION, DOM_EVENT } = sources;

	// Generic CTA clicks
	const ctaClicked$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.CTA),
		toEvent(AnalyticsEventType.CTA_CLICKED, getDetail),
		withContext(sources.CONTEXT)
	);

	// AddThis share button clicks
	const socialShareClicked$ = ACTION.pipe(
		isActionOfType<SocialPlatformAction>(SHARE_MODAL_SOCIAL_PLATFORM),
		toEvent(AnalyticsEventType.CTA_SOCIAL_SHARE_CLICKED, getDetail),
		withContext(sources.CONTEXT)
	);

	return {
		EVENT: merge(ctaClicked$, socialShareClicked$)
	};
};
