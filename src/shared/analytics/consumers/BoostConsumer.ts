import { isSeason } from 'ref/responsive/util/item';
import { getWatchedInfo } from 'shared/account/profileUtil';
import { Boost, ContentSourceId, LearnAction } from 'shared/analytics/boost/boost';
import { isStartoverMode } from 'shared/analytics/consumers/analyticsConsumersUtil';
import { EventConsumer } from 'shared/analytics/types/types';
import { TrackingEvent } from 'shared/analytics/types/v3/event';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { isBoostRecommendationList } from 'shared/list/listUtil';
import { isEpisodeCard, PlayerStandard } from 'shared/page/pageEntryTemplate';
import { get } from 'shared/util/objects';
import { isShow } from 'shared/util/itemUtils';
import { getElapsedTime } from 'shared/util/time';
import { isChannel } from 'toggle/responsive/util/epg';

export function isBoostReady(): boolean {
	return typeof process.env.CLIENT_BOOST_URL !== 'undefined' && typeof process.env.CLIENT_BOOST_TOKEN !== 'undefined';
}

export const BoostConsumer: EventConsumer = function httpEndpoint() {
	const boostProvider = isBoostReady() ? Boost.getInstance() : undefined;

	let startPlayTimer;
	let startPlayVideoPercentage;
	const END_PLAY_TRIGGER_VIDEO_PERCENTAGE = 70;
	const watchCompletedIds = [];

	return (event: TrackingEvent): void => {
		if (!event.context || !boostProvider) return;

		const item = get(event.context, 'item');

		switch (event.type) {
			case AnalyticsEventType.ITEM_CLICKED:
				const { entry } = event.context;

				if (entry && !isEpisodeCard(entry.template)) {
					// Clear cached vals for all clicks except Episode listing of IDP
					boostProvider.clearCachedValues();
				}

				const isEOPRecommendationList = entry.template === PlayerStandard;
				if (isBoostRecommendationList(entry) || isEOPRecommendationList) {
					// Save UX7 cached vals on click of UX7 rail item
					boostProvider.setCachedValues(event);
					const clickData = boostProvider.getVODContentData(event);
					boostProvider.learnAction(event, LearnAction.Clicked, clickData);
				}
				break;

			case AnalyticsEventType.ITEM_BOOKMARKED:
				const isBookmarked = get(event, 'detail.isBookmarked');
				if (isBookmarked) {
					const bookmarkData = boostProvider.getVODContentData(event);
					boostProvider.learnAction(event, LearnAction.Bookmarked, bookmarkData);
				}
				break;

			case AnalyticsEventType.ITEM_USER_PREFERENCES_CLICKED:
				const subgenre = get(event.detail, 'subgenre');
				const refUsecase = get(event.detail, 'refUsecase');
				const items = get(event, 'detail.items');

				const vodContentItemIds = [];
				const seriesContentItemIds = [];

				items &&
					items.forEach(item => {
						const { customId } = item;
						if (isShow(item) || isSeason(item)) {
							seriesContentItemIds.push(customId);
						} else {
							vodContentItemIds.push(customId);
						}
					});

				// Only show, movie & clip items will be recommended in onboarding
				const contentTypes = [
					{
						contentSourceId: ContentSourceId.VOD,
						itemIds: vodContentItemIds
					},
					{
						contentSourceId: ContentSourceId.Series,
						itemIds: seriesContentItemIds
					}
				];

				for (let i = 0; i < contentTypes.length; i++) {
					const { contentSourceId, itemIds } = contentTypes[i];
					const subgenreData = {
						contentSourceId,
						subgenre: subgenre && subgenre.split(', '),
						refUsecase
					};
					boostProvider.learnAction(event, LearnAction.Onboarding, subgenreData);

					if (itemIds.length > 0) {
						const contentData = {
							contentItemId: itemIds,
							contentItemInstanceId: itemIds,
							contentSourceId,
							refUsecase
						};
						boostProvider.learnAction(event, LearnAction.Onboarding, contentData);
					}
				}

				break;

			case AnalyticsEventType.ITEM_SUBSCRIBE_CLICKED:
				boostProvider.setSubscribedItem(event);
				break;

			case AnalyticsEventType.SUBSCRIPTION_SUCCESS:
				if (boostProvider.shouldSendSubscribeLA()) {
					const subscribeData = boostProvider.getSubscribeContentData();
					boostProvider.learnAction(event, LearnAction.Subscribed, subscribeData);
				}
				break;

			case AnalyticsEventType.ITEM_PROGRAM_TAG_CLICKED:
			case AnalyticsEventType.MENU_CLICKED:
			case AnalyticsEventType.SEARCHED:
				// Clear cached vals when user navigates out of IDP page through the above ways
				boostProvider.clearCachedValues();
				break;

			case AnalyticsEventType.VIDEO_FIRST_PLAYING:
				if (isChannel(item)) {
					if (isStartoverMode(event)) {
						clearTimeout(startPlayTimer);
					} else {
						startPlayTimer = boostProvider.learnActionStartPlayLinear(event);
					}
				} else {
					const watchedInfo = getWatchedInfo(item.id);
					const isFullyWatched = get(watchedInfo, 'value.isFullyWatched');
					const videoWatchedPercent = get(event, 'detail.video.percent');
					startPlayVideoPercentage = videoWatchedPercent;
					const isPreviouslyWatched = videoWatchedPercent > 0 || isFullyWatched;
					if (!isPreviouslyWatched) {
						const startPlayData = boostProvider.getVODContentData(event);
						boostProvider.learnAction(event, LearnAction.StartPlay, startPlayData);
					}
				}

				break;

			case AnalyticsEventType.VIDEO_LINEAR_PROGRAM_UPDATED:
				// This ensures START PLAY is not sent when EPG changes in the pre-start zone
				clearTimeout(startPlayTimer);

				if (!isStartoverMode(event)) {
					// Restart timer for START PLAY to be sent with new epg id
					startPlayTimer = boostProvider.learnActionStartPlayLinear(event);
				}
				break;

			case AnalyticsEventType.VIDEO_ACTUATE_PAUSE:
			case AnalyticsEventType.VIDEO_EXIT:
				if (event.type === AnalyticsEventType.VIDEO_EXIT) {
					clearTimeout(startPlayTimer);
				}

				const videoStartTime = get(event, 'detail.startTime');
				const sessionDuration = videoStartTime && getElapsedTime(videoStartTime);

				if (isChannel(item)) {
					if (!isStartoverMode(event)) {
						const epgStartDate = get(item, 'scheduleItem.startDate');
						const linearStopPlayData = {
							sessionDuration,
							lastPosition: getElapsedTime(epgStartDate),
							...boostProvider.getLinearContentData(event)
						};

						boostProvider.learnAction(event, LearnAction.StopPlay, linearStopPlayData);
					}
				} else {
					const currentTime = get(event, 'detail.currentTime');
					const vodStopPlayData = {
						sessionDuration,
						lastPosition: currentTime && Math.floor(currentTime),
						...boostProvider.getVODContentData(event)
					};

					boostProvider.learnAction(event, LearnAction.StopPlay, vodStopPlayData);
				}

				break;

			case AnalyticsEventType.VIDEO_PROGRESSED:
				const videoData = get(event, 'detail.video');
				const videoWatchedPercent = videoData && get(videoData, 'percent');

				if (
					startPlayVideoPercentage < END_PLAY_TRIGGER_VIDEO_PERCENTAGE &&
					videoWatchedPercent >= END_PLAY_TRIGGER_VIDEO_PERCENTAGE &&
					!watchCompletedIds.includes(item.id)
				) {
					watchCompletedIds.push(item.id);

					const videoStartTime = get(event, 'detail.startTime');
					const sessionDuration = videoStartTime && getElapsedTime(videoStartTime);
					const endPlayData = {
						sessionDuration,
						...boostProvider.getVODContentData(event)
					};

					boostProvider.learnAction(event, LearnAction.EndPlay, endPlayData);
				}

				break;
		}
	};
};
