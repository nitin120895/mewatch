/*
 * GFK is disabled as per MEDTOG-8479
 */

import { TrackingEvent } from 'shared/analytics/types/v3/event';
import { EventConsumer } from 'shared/analytics/types/types';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { get } from 'shared/util/objects';
import { getAnalyticsData } from 'shared/analytics/api/video';

export const GFKConsumer: EventConsumer = function httpEndpoint() {
	const ssa = get(window, 'gfk.ssa');
	const agent = ssa && ssa.getAgent(process.env.CLIENT_GFK_MEDIA_ID);

	return (event: TrackingEvent): void => {
		if (!agent || !event.context) return;
		switch (event.type) {
			case AnalyticsEventType.VIDEO_CAN_PLAY:
			case AnalyticsEventType.VIDEO_AD_COMPLETED:
				const { item, user, page } = event.context;
				const pageTemplate = get(page, 'context.page.template');
				getAnalyticsData(user, { mediaId: item.customId, pageTemplate }).then(data => {
					agent.notifyLoaded(item.customId, data.gfk);
				});
				break;
			case AnalyticsEventType.VIDEO_AD_STARTED:
			case AnalyticsEventType.VIDEO_PLAYING:
			case AnalyticsEventType.VIDEO_RESUMED:
				agent.notifyPlay();
				break;
			case AnalyticsEventType.VIDEO_PAUSED:
			case AnalyticsEventType.VIDEO_COMPLETED:
				agent.notifyIdle();
				break;
			case AnalyticsEventType.VIDEO_AD_SKIPPED:
				agent.notifySkipped();
				break;
		}
	};
};
