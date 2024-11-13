import { MOATAnalytics } from 'shared/analytics/moat/MOATAnalytics';
import { TrackingEvent } from 'shared/analytics/types/v3/event';
import { EventConsumer } from 'shared/analytics/types/types';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';

export function isMOATEnabled(): boolean {
	return process.env.CLIENT_MOAT_PARTNER_CODE !== undefined;
}

export const MOATConsumer: EventConsumer = function httpEndpoint() {
	const moat = isMOATEnabled() ? new MOATAnalytics(process.env.CLIENT_MOAT_PARTNER_CODE) : undefined;

	return (event: TrackingEvent): void => {
		if (!event.context || !moat) return;

		switch (event.type) {
			case AnalyticsEventType.VIDEO_AD_LOADED:
				moat.videoAdLoaded(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_AD_STARTED:
				moat.notifyVideoAdStarted(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_AD_PROGRESS:
				moat.notifyVideoAdProgress(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_AD_QUARTILE:
				moat.notifyVideoAdQuartile(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_AD_PAUSED:
				moat.notifyVideoAdPaused(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_AD_COMPLETED:
				moat.notifyVideoAdCompleted(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_AD_SKIPPED:
				moat.notifyVideoAdSkipped(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_AD_VOLUMECHANGED:
				moat.notifyVideoAdVolumeChanged(event.context, event.detail);
				break;
		}
	};
};
