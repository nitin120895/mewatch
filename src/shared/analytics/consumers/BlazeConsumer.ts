import BlazeSDK from 'toggle/responsive/component/shortForm/BlazeWrapper';
import { Delegations } from '@wscsports/blaze-web-sdk';
import * as stateUtil from 'shared/analytics/util/stateUtil';
import { isMixpanelEnabled } from 'shared/analytics/consumers/MixpanelConsumer';
import { MixpanelAnalytics } from 'shared/analytics/mixpanel/MixpanelAnalytics';
import { MixpanelEvent } from 'shared/analytics/mixpanel/util';
import { TrackingEvent } from 'shared/analytics/types/v3/event';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { EventConsumer } from 'shared/analytics/types/types';
import { get } from 'shared/util/objects';
import { BlazeEvent, ctaDestinationProperty } from 'toggle/responsive/util/shortFormUtil';

export function isBlazeConsumerEnabled(): boolean {
	return !_SSR_ && typeof process.env.CLIENT_WSC_API_KEY !== 'undefined';
}

export const BlazeConsumer: EventConsumer = function httpEndpoint() {
	let ctaActionParam = '';

	let ctaProcessing = false;
	let isMiddleEventsTimerRunning = false;
	let middleEventsProcessQueue = [];
	let middleEventsTimerId = undefined;
	let storyEventProcessQueue = [];
	let storyStartTimerId = undefined;
	let storyStartTimerRunning = false;
	let PROCESS_QUEUE_TIMER = 1000;

	const mixpanelAnalytics = isMixpanelEnabled() ? MixpanelAnalytics.getInstance() : undefined;

	const setWidgetActionParam = (event: any) => {
		const { actionParam } = event && event.detail;
		// Get cta_destination from Blaze cta_click event which is a required property for Mixpanel stories_cta_click
		if (actionParam) {
			ctaActionParam = actionParam;
		}
	};

	const processEventQueue = (queue: any[], isTimerRunning: boolean) => {
		while (queue.length && !isTimerRunning) {
			const event = queue.shift();
			sendMixpanelEvent(event);
		}
	};

	// First array to process story_start and story_exit and second array to process middle events
	const handleProcessQueue = () => {
		processEventQueue(storyEventProcessQueue, storyStartTimerRunning);
		processEventQueue(middleEventsProcessQueue, isMiddleEventsTimerRunning);
	};

	const storyStartTimer = () => {
		storyStartTimerId = setTimeout(() => {
			storyStartTimerRunning = false;
			handleProcessQueue();
			storyEventProcessQueue = [];
		}, PROCESS_QUEUE_TIMER);
	};

	const handleStoryStartEvent = event => {
		storyEventProcessQueue.push(event);
		if (!storyStartTimerRunning) {
			storyStartTimer();
		}
		storyStartTimerRunning = true;
	};

	const startMiddleEventsTimer = () => {
		middleEventsTimerId = setTimeout(() => {
			isMiddleEventsTimerRunning = false;
			handleProcessQueue();
			middleEventsProcessQueue = [];
		}, PROCESS_QUEUE_TIMER);
	};

	const handleMiddleEvents = event => {
		middleEventsProcessQueue.push(event);
		if (!isMiddleEventsTimerRunning) {
			startMiddleEventsTimer();
		}
		isMiddleEventsTimerRunning = true;
	};

	const handleExitEvent = event => {
		const { eventType } = event.detail;
		const isStoryExitEvent = eventType === BlazeEvent.StoryExit;
		const isStoryPageExitEvent = eventType === BlazeEvent.StoryPageExit;
		// If isMiddleEventsTimerRunning or storyStartTimerRunning, stop the timer and
		// discard the corresponding queue else append to queue
		if (isStoryExitEvent && storyStartTimerRunning) {
			storyEventProcessQueue = [];
			clearTimeout(storyStartTimerId);
			storyStartTimerRunning = false;
		} else if (isStoryPageExitEvent && isMiddleEventsTimerRunning) {
			middleEventsProcessQueue = [];
			clearTimeout(middleEventsTimerId);
			isMiddleEventsTimerRunning = false;
		} else {
			middleEventsProcessQueue.push(event);
			handleProcessQueue();
		}
	};

	// Edge case to log story exit events also on cta_click when triggered under 2 seconds
	const handleCtaExitEvent = event => {
		const { eventType } = event.detail;
		const isStoryExitEvent = eventType === BlazeEvent.StoryExit;

		sendMixpanelEvent(event);
		ctaProcessing = true;
		if (isStoryExitEvent) {
			ctaProcessing = false;
		}
	};

	const getShortformDelayTime = () => {
		const state = stateUtil.getStoreState();
		return state && get(state, 'app.config.general.customFields.ShortformAnalyticsDelayInMilliseconds');
	};

	const handleEventWithQueue = (event: any) => {
		const { eventType } = event.detail;
		const isStoryStartEvent = eventType === BlazeEvent.StoryStart || eventType === BlazeEvent.StoryPageStart;

		if (!isMiddleEventsTimerRunning && !isStoryStartEvent && !storyStartTimerRunning) {
			// Process event immediately if no isMiddleEventsTimerRunning and no "start_events"
			middleEventsProcessQueue.push(event);
			handleProcessQueue();
			return;
		}

		switch (eventType) {
			case BlazeEvent.StoryStart:
				handleStoryStartEvent(event);
				break;
			case BlazeEvent.StoryPageStart:
				handleMiddleEvents(event);
				break;
			case BlazeEvent.CtaClick:
				handleCtaExitEvent(event);
				break;
			case BlazeEvent.StoryExit:
			case BlazeEvent.StoryPageExit:
				if (ctaProcessing) {
					handleCtaExitEvent(event);
				} else {
					handleExitEvent(event);
				}
				break;
			default:
				if (isMiddleEventsTimerRunning) {
					middleEventsProcessQueue.push(event);
				}
				break;
		}
	};

	const sendMixpanelEvent = (event: any) => {
		event.isWsc = true;
		switch (event.detail.eventType) {
			case BlazeEvent.StoryStart:
				mixpanelAnalytics.enqueueEvent(MixpanelEvent.StoryStart, event);
				break;

			case BlazeEvent.StoryPageStart:
				mixpanelAnalytics.enqueueEvent(MixpanelEvent.StoryPageStart, event);
				break;

			// Map 'cta_click' event from Mixpanel SDK to existing property 'stories_cta_click'
			case BlazeEvent.CtaClick:
				const updateCtaEvent = event;
				updateCtaEvent.detail.eventData = {
					...updateCtaEvent.detail.eventData,
					[ctaDestinationProperty]: ctaActionParam
				};
				mixpanelAnalytics.enqueueEvent(MixpanelEvent.StoriesCtaClick, updateCtaEvent);
				break;

			case BlazeEvent.StoryPageExit:
				mixpanelAnalytics.enqueueEvent(MixpanelEvent.StoryPageExit, event);
				break;

			case BlazeEvent.StoryExit:
				mixpanelAnalytics.enqueueEvent(MixpanelEvent.StoryExit, event);
				break;
		}
	};

	if (isBlazeConsumerEnabled()) {
		return (event: TrackingEvent): Promise<void> => {
			if (!event.context) return;
			switch (event.type) {
				case AnalyticsEventType.PAGE_VIEWED:
					PROCESS_QUEUE_TIMER = getShortformDelayTime() || PROCESS_QUEUE_TIMER;
					BlazeSDK.addDelegateListener(Delegations.onWidgetTriggerCTA, setWidgetActionParam);
					BlazeSDK.addDelegateListener(Delegations.onEventTriggered, handleEventWithQueue);
					break;
			}
		};
	}
};
