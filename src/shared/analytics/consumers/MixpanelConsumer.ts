import { MixpanelAnalytics } from 'shared/analytics/mixpanel/MixpanelAnalytics';
import { MixpanelEvent } from 'shared/analytics/mixpanel/util';
import { TrackingEvent } from 'shared/analytics/types/v3/event';
import { DomTriggerPoints, EventConsumer, VideoEntryPoint } from 'shared/analytics/types/types';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { isBookmarksList, isContinueWatching } from 'shared/list/listUtil';
import { isCarousel, isListingCard, isRailCard, isEnhancedSearchCard } from 'shared/page/pageEntryTemplate';
import { Search, EXCLUDED_PAGES_FOR_PAGE_LOAD_EVENT, ESearch } from 'shared/page/pageKey';
import { EXCLUDED_PAGE_TEMPLATES_FOR_PAGE_LOAD_EVENT } from 'shared/page/pageTemplate';
import { get } from 'shared/util/objects';
import { onLibraryLoaded } from 'shared/util/scripts';
import { getmeID } from 'toggle/responsive/pageEntry/advertising/adsUtils';
import { isChannel } from 'toggle/responsive/util/epg';

export function isMixpanelEnabled(): boolean {
	return typeof process.env.CLIENT_MIXPANEL_TOKEN !== 'undefined';
}

export const MixpanelConsumer: EventConsumer = function httpEndpoint() {
	const mixpanelAnalytics = isMixpanelEnabled() ? MixpanelAnalytics.getInstance() : undefined;

	let appStartedPromise;
	let isNewUser = false;
	let hasVideoFirstPlayed = false;
	let newsletters;

	return (event: TrackingEvent): void => {
		if (!event.context || !mixpanelAnalytics) return;

		if (event.type === AnalyticsEventType.APP_STARTED) {
			// Wrap the entire processing of APP_STARTED event in a promise
			const meIDReady = onLibraryLoaded(() => getmeID());
			const eventsMapReady = mixpanelAnalytics.getEventsMap();
			// Wait for meID to be ready and reference events map to be fetched before starting mixpanel
			appStartedPromise = Promise.all([meIDReady, eventsMapReady])
				.then(() => {
					mixpanelAnalytics.enqueueEvent(MixpanelEvent.AppLaunch, event);
				})
				.catch(function(err) {
					if (_DEV_) console.log(err);
				});
		}

		// Queue other events until APP_STARTED is processed
		else {
			appStartedPromise.then(() => {
				// Handle other event types here
				switch (event.type) {
					case AnalyticsEventType.USER_REGISTERED:
						// These properties are forwarded to the USER_SIGNED_IN event
						// Required for tracking register_complete mixpanel event
						isNewUser = true;
						newsletters = get(event.detail, 'newsletters');

						break;

					case AnalyticsEventType.USER_SIGNED_IN:
						// Check if user has just registered and send registration_complete event for new users
						const eventName = isNewUser ? MixpanelEvent.RegistrationComplete : MixpanelEvent.LoginSuccessful;
						const eventData = newsletters ? { ...event, detail: { ...event.detail, newsletters } } : event;
						mixpanelAnalytics.enqueueEvent(eventName, eventData);

						// Reset isNewUser flag and newsletters in case of another new user registration
						isNewUser = false;
						newsletters = undefined;

						break;

					case AnalyticsEventType.USER_SIGN_OUT:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.LogoutSuccessful, event);
						break;

					case AnalyticsEventType.PAGE_VIEWED:
						const pageKeys = get(event, 'context.page.key');
						const template = get(event, 'context.page.template.name');
						if (
							!EXCLUDED_PAGES_FOR_PAGE_LOAD_EVENT.includes(pageKeys) &&
							!EXCLUDED_PAGE_TEMPLATES_FOR_PAGE_LOAD_EVENT.includes(template)
						) {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.PageLoads, event);
						}
						break;

					case AnalyticsEventType.LIST_PAGE_VIEWED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.PageLoads, event);
						break;

					case AnalyticsEventType.ITEM_DETAIL_PAGE_VIEWED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.ProgramDetailPage, event);
						break;

					case AnalyticsEventType.MY_LIST_PAGE_VIEWED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.MyListPage, event);
						break;

					case AnalyticsEventType.MENU_CLICKED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.MenuClick, event);
						break;

					case AnalyticsEventType.SEARCHED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.SearchRequest, event);
						break;
					case AnalyticsEventType.AUTOFILL_SEARCH_CLICK:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.AutoFillSearchClick, event);
						break;
					case AnalyticsEventType.FILTER_REQUEST:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.FilterRequest, event);
						break;

					case AnalyticsEventType.RAIL_HEADER_CLICKED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.RailHeaderClick, event);
						break;

					case AnalyticsEventType.ITEM_CLICKED:
						const entryTemplate = get(event, 'context.entry.template');
						const pageKey = get(event, 'context.page.key');
						const entryType = get(event, 'context.entry.type');
						const userList = get(event, 'context.entry.userList');

						if (isRailCard(entryTemplate)) {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.RailCardClick, event);
							break;
						}

						if (isCarousel(entryTemplate)) {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.CarouselCardClick, event);
							break;
						}

						if (isListingCard(entryTemplate, pageKey)) {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.ListingCardClick, event);
							break;
						}

						if (userList && isBookmarksList(userList)) {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.MyListCardClick, event);
							break;
						}

						if (
							(entryType === Search.toLowerCase() && pageKey === Search) ||
							(isEnhancedSearchCard(entryTemplate) && pageKey === ESearch)
						) {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.SearchCardClick, event);
							break;
						}
						break;

					case AnalyticsEventType.ITEM_CLICKED_TO_WATCH:
						const list = get(event, 'detail.list');

						mixpanelAnalytics.enqueueEvent(MixpanelEvent.ClickToWatch, event);

						if (list && isContinueWatching(list)) {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.ContinueWatching, event);
						}
						break;

					case AnalyticsEventType.ITEM_WATCH_PROGRAM_TRAILER:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.WatchProgramTrailer, event);
						break;

					case AnalyticsEventType.ITEM_BOOKMARK_ADD_CLICKED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.AddToMyList, event);
						break;

					case AnalyticsEventType.ITEM_BOOKMARK_REMOVE_CLICKED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.RemoveFromMyList, event);
						break;

					case AnalyticsEventType.ITEM_PROGRAM_TAG_CLICKED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.ProgramTagClick, event);
						break;

					case AnalyticsEventType.ITEM_PROGRAM_SYNOPSIS_CLICKED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.ProgrameEpisodeSynopsisClick, event);
						break;

					case AnalyticsEventType.ITEM_IDP_LINK_CLICKED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.IdpLinkClick, event);
						break;

					case AnalyticsEventType.ITEM_INFO_ICON_CLICKED:
						const itemDetail = get(event, 'context.item');
						if (isChannel(itemDetail)) {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.LiveInfoClick, event);
						} else {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.VodInfoClick, event);
						}
						break;

					case AnalyticsEventType.ITEM_INFO_LINK_CLICKED:
						const item = get(event, 'context.item');
						if (isChannel(item)) {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.LiveLinkClick, event);
						} else {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.VodLinkClick, event);
						}
						break;

					case AnalyticsEventType.ITEM_OFFERED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.IdpSubscribeClick, event);
						break;

					case AnalyticsEventType.ITEM_SET_REMINDER:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.LiveStreamSetReminder, event);
						break;

					case AnalyticsEventType.VIDEO_FIRST_PLAYING:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.VideoStart, event);
						hasVideoFirstPlayed = true;
						break;

					case AnalyticsEventType.VIDEO_RESTARTED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.VideoStart, event);
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.ClickToWatch, event);
						break;

					case AnalyticsEventType.VIDEO_ACTUATE_PAUSE:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.VideoPause, event);
						break;

					case AnalyticsEventType.VIDEO_ACTUATE_PLAY:
						if (hasVideoFirstPlayed) mixpanelAnalytics.enqueueEvent(MixpanelEvent.VideoResume, event);
						break;

					case AnalyticsEventType.VIDEO_SEEKED:
						const seekTrigger = get(event, 'detail.trigger');

						if (seekTrigger === DomTriggerPoints.Scrubber) {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.VideoSeek, event);
							break;
						}

						if (seekTrigger === DomTriggerPoints.BtnBackward) {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.VideoBackward, event);
							break;
						}

						if (seekTrigger === DomTriggerPoints.BtnForward) {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.VideoForward, event);
							break;
						}

						if (seekTrigger === DomTriggerPoints.BtnSkipIntro) {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.VideoSkipIntro, event);
						}

						break;

					case AnalyticsEventType.VIDEO_ITEM_CLICKED:
						const entryPoint = get(event, 'detail.entryPoint');

						if (entryPoint === VideoEntryPoint.SwitchEpisode) {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.VideoSelectEpisode, event);
						} else {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.VideoEndRecoCardClick, event);
						}

						break;

					case AnalyticsEventType.VIDEO_SELECT_AUDIO:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.VideoSelectAudio, event);
						break;

					case AnalyticsEventType.VIDEO_SELECT_QUALITY:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.VideoSelectQuality, event);
						break;

					case AnalyticsEventType.VIDEO_SELECT_SUBTITLE:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.VideoSelectSubtitle, event);
						break;

					case AnalyticsEventType.VIDEO_START_OVER_CLICKED:
						const isStartOverEnabled = get(event, 'detail.startoverInfo.startover');

						if (isStartOverEnabled) {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.ExitStartOver, event);
						} else {
							mixpanelAnalytics.enqueueEvent(MixpanelEvent.EnableStartOver, event);
						}
						break;

					case AnalyticsEventType.VIDEO_WATCH_COMPLETED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.VideoWatchCompleted, event);
						break;

					case AnalyticsEventType.VIDEO_EXIT:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.VideoExit, event);
						break;

					case AnalyticsEventType.SUBSCRIBE_PAGE:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.SubscribePage, event);
						break;

					case AnalyticsEventType.SUBSCRIPTION_VIEW_PLAN:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.SubscribeViewPlan, event);
						break;

					case AnalyticsEventType.SUBSCRIBE_SELECT_PLANS:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.SubscribeSelectPlans, event);
						break;

					case AnalyticsEventType.SUBSCRIBE_APPLY_PROMO:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.SubscribeApplyPromo, event);
						break;

					case AnalyticsEventType.SUBSCRIBE_PROCEED_TO_PAYMENT:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.SubscribeProceedToPayment, event);
						break;

					case AnalyticsEventType.SUBSCRIBE_PROCEED_TO_PAY:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.SubscribeProceedToPay, event);
						break;

					case AnalyticsEventType.SUBSCRIBE_CONFIRM_AND_PROCEED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.SubscribeConfirmAndProceed, event);
						break;

					case AnalyticsEventType.SUBSCRIPTION_FAILURE:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.SubscriptionFailure, event);
						break;

					case AnalyticsEventType.SUBSCRIPTION_SUCCESS:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.SubscriptionSuccess, event);
						break;

					case AnalyticsEventType.BANNER_SHOWN:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.BannerShown, event);
						break;

					case AnalyticsEventType.BANNER_CLICKED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.BannerClicked, event);
						break;

					case AnalyticsEventType.BANNER_CLOSED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.BannerClosed, event);
						break;

					case AnalyticsEventType.CW_PAGE_EDIT:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.CWPageEdit, event);
						break;

					case AnalyticsEventType.CW_PAGE_SELECT_ALL:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.CWPageSelectAll, event);
						break;

					case AnalyticsEventType.CW_PAGE_DESELECT_ALL:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.CWPageDeselectAll, event);
						break;

					case AnalyticsEventType.CW_PAGE_REMOVE_SELECTED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.CWPageRemoveSelected, event);
						break;

					case AnalyticsEventType.CW_PAGE_SELECT_SINGLE_REMOVE:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.CWPageSelectSingleRemove, event);
						break;

					case AnalyticsEventType.CW_MENU_CLICKED:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.CWMenu, event);
						break;

					case AnalyticsEventType.CW_MENU_REMOVE_CW:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.CWMenuRemoveCW, event);
						break;

					case AnalyticsEventType.CW_MENU_UNDO_REMOVE:
					case AnalyticsEventType.CW_MENU_UNDO_REMOVE_MULTIPLE:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.CWMenuUndoRemove, event);
						break;

					case AnalyticsEventType.CW_MENU_VIEW_INFO:
						mixpanelAnalytics.enqueueEvent(MixpanelEvent.CWMenuViewInfo, event);
						break;
				}
			});
		}
	};
};
