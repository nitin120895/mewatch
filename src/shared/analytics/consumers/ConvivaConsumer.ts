import { ConvivaVideoAnalytics } from 'shared/analytics/conviva/ConvivaVideoAnalytics';
import { TrackingEvent } from 'shared/analytics/types/v3/event';
import { EventConsumer } from 'shared/analytics/types/types';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';

export function isConvivaEnabled(): boolean {
	return process.env.CLIENT_PLAYER_CONVIVA_CUSTOMER_KEY && process.env.CLIENT_PLAYER_CONVIVA_SCRIPT_URL;
}

export const ConvivaConsumer: EventConsumer = function httpEndpoint() {
	const agent = new ConvivaVideoAnalytics(
		false,
		process.env.CLIENT_PLAYER_CONVIVA_CUSTOMER_KEY,
		process.env.CLIENT_PLAYER_CONVIVA_GATEWAY_URL
	);

	return (event: TrackingEvent): void => {
		if (!event.context || !agent) return;

		switch (event.type) {
			case AnalyticsEventType.VIDEO_INITIALIZED:
				agent.videoInitialized(event.context);
				break;
			case AnalyticsEventType.VIDEO_REQUESTED:
				agent.videoRequested(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_BUFFERING:
				agent.videoBuffering(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_CAN_PLAY:
				agent.videoCanPlay(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_PLAYING:
				agent.videoPlaying(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_PROGRESSED:
				agent.videoProgressed(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_COMPLETED:
				agent.videoCompleted(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_ERROR:
				agent.videoError(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_ACTIONED:
				agent.videoActioned(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_PAUSED:
				agent.videoPaused(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_RESUMED:
				agent.videoResumed(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_SEEKED:
				agent.videoSeeked(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_RESTARTED:
				agent.videoRestarted(event.context);
				break;
			case AnalyticsEventType.VIDEO_CHAINPLAYED:
				agent.videoChainplayed(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_AD_STARTED:
				agent.videoAdStarted(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_AD_COMPLETED:
				agent.videoAdCompleted(event.context, event.detail);
				break;
			case AnalyticsEventType.VIDEO_AD_SKIPPED:
				agent.videoAdSkipped(event.context, event.detail);
				break;
		}
	};
};
