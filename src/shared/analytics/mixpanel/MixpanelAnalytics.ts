import mixpanel from 'mixpanel-browser';
import { getResumePosition } from 'shared/account/profileUtil';
import { getSSOId, isRegisteredUser } from 'shared/analytics/api/util';
import { EventsQueue } from 'shared/analytics/mixpanel/EventsQueue';
import {
	MIXPANEL_ENTRY_POINTS,
	MIXPANEL_EVENT_DETAILS,
	MixpanelEntryPoint,
	MixpanelEvent,
	MixpanelProperty,
	MixpanelPropertySource,
	MixpanelPropertyType,
	MixpanelVariable,
	QUERY_PARAMS,
	getAdobeId,
	getAudioLanguages,
	getDefaultAudioLanguage,
	getFormattedPath,
	getItemProperty,
	getPrefixSSOID,
	getRefreshedMeid,
	getSeasonNumber,
	getSeriesTitle,
	getUpdatedItem,
	getUpdatedItemFromEPG,
	validateTxDatePattern
} from 'shared/analytics/mixpanel/util';
import { PlayerType } from 'shared/analytics/types/types';
import { TrackingEvent } from 'shared/analytics/types/v3/event';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { getFormattedMenuOption } from 'shared/app/navUtil';
import { isContinueWatching } from 'shared/list/listUtil';
import { SRP1 } from 'shared/page/pageEntryTemplate';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import { isMobile } from 'shared/util/browser';
import { isEpisode } from 'shared/util/itemUtils';
import { clamp } from 'shared/util/math';
import { get, isEmptyObject, isString } from 'shared/util/objects';
import { capitalizeStr } from 'shared/util/strings';
import { videoTimeStamp, formatSecondstoHhMmSs, getElapsedTime } from 'shared/util/time';
import { getQueryParam } from 'shared/util/urls';
import { newslettersClassification } from 'toggle/responsive/pageEntry/account/accountUtils';
import { Providers, getLoginSource } from 'toggle/responsive/util/authUtil';
import { isChannel } from 'toggle/responsive/util/epg';

const MIXPANEL_DEBUG_MODE = String(process.env.CLIENT_MIXPANEL_DEBUG) === 'true' || _DEV_;

export class MixpanelAnalytics {
	private static instance: MixpanelAnalytics;
	private mixpanelMap: any;
	private event: TrackingEvent;
	private eventsQueue: EventsQueue;

	static getInstance() {
		if (!MixpanelAnalytics.instance) MixpanelAnalytics.instance = new MixpanelAnalytics();

		return MixpanelAnalytics.instance;
	}

	constructor() {
		mixpanel.init(process.env.CLIENT_MIXPANEL_TOKEN, { debug: MIXPANEL_DEBUG_MODE });
		this.eventsQueue = new EventsQueue(this.processQueue);
	}

	getEventsMap() {
		return new Promise((resolve, reject) => {
			fetch(process.env.CLIENT_MIXPANEL_JSON)
				.then(res => res.json())
				.then(data => {
					const { events, metadata, superProperties, eventProperties, userProperties } = data;

					this.mixpanelMap = {
						events,
						superProperties: { ...superProperties.all, ...superProperties.web },
						eventProperties: { ...eventProperties.all, ...eventProperties.web },
						userProperties: { ...userProperties.all, ...userProperties.web },
						metadata: { ...metadata.all, ...metadata.web }
					};
					resolve(true);
				})
				.catch(err => reject());
		});
	}

	handleAnonymousUser() {
		mixpanel.alias(mixpanel.get_distinct_id(), getRefreshedMeid());
		mixpanel.identify(mixpanel.get_distinct_id());
	}

	handleSignedInUser(user) {
		const ssoId = getSSOId(user);
		mixpanel.identify(getPrefixSSOID(ssoId));
		mixpanel.alias(mixpanel.get_distinct_id(), ssoId);
	}

	manageIdentities() {
		const user = get(this.event, 'context.user');
		if (isRegisteredUser(user)) {
			this.handleSignedInUser(user);
		} else {
			this.handleAnonymousUser();
		}
	}

	processQueue = async () => {
		const firstItem = this.eventsQueue.peek();
		const { eventName, event, index } = firstItem;

		if (MIXPANEL_DEBUG_MODE) console.log(`%c[Mixpanel] Processing #${index}: ${eventName}`, 'color: blue');

		await this.track(eventName, event);

		// Remove from queue after mixpanel track
		this.eventsQueue.dequeue();
	};

	enqueueEvent = (eventName: MixpanelEvent, event: TrackingEvent) => {
		const eventMap = get(this.mixpanelMap, 'events');
		const eventInMap = eventMap && eventMap.hasOwnProperty(eventName);
		if (!eventInMap) return;

		this.eventsQueue.enqueue({ eventName, event });
	};

	async track(eventName: MixpanelEvent, event: TrackingEvent) {
		if (event) {
			this.event = event;
		}

		const { context } = this.event;
		const { events: eventMap } = this.mixpanelMap;
		const { setSuperProps, setUserProps, setEventProps, unionUserProps } = eventMap[eventName];

		// Super props
		const superProps = this.getProperties(MixpanelPropertyType.Super, setSuperProps);
		if (!isEmptyObject(superProps)) mixpanel.register(superProps);

		// Custom handlers for different events
		switch (eventName) {
			case MixpanelEvent.AppLaunch:
				this.manageIdentities();
				break;

			case MixpanelEvent.LoginSuccessful:
			case MixpanelEvent.RegistrationComplete:
				this.handleSignedInUser(event.context.user);
				break;

			case MixpanelEvent.CarouselCardClick:
			case MixpanelEvent.ClickToWatch:
			case MixpanelEvent.ContinueWatching:
			case MixpanelEvent.CWMenu:
			case MixpanelEvent.CWMenuRemoveCW:
			case MixpanelEvent.CWMenuUndoRemove:
			case MixpanelEvent.CWMenuViewInfo:
			case MixpanelEvent.CWPageSelectSingleRemove:
			case MixpanelEvent.IdpSubscribeClick:
			case MixpanelEvent.ListingCardClick:
			case MixpanelEvent.MyListCardClick:
			case MixpanelEvent.RailCardClick:
			case MixpanelEvent.SearchCardClick:
			case MixpanelEvent.AutoFillSearchClick:
				if ('item' in context) {
					const updatedItemData = await getUpdatedItem(context);
					context.item = updatedItemData.item;
				}
				break;

			case MixpanelEvent.LiveStreamSetReminder:
				const updatedEPGData = await getUpdatedItemFromEPG(context);
				if ('item' in context) context.item = updatedEPGData.item;
				break;

			default:
				break;
		}

		// User props
		const userPropsToSet = this.getProperties(MixpanelPropertyType.User, setUserProps);
		const userPropsToUnion = this.getProperties(MixpanelPropertyType.User, unionUserProps);
		if (!isEmptyObject(userPropsToSet)) mixpanel.people.set(userPropsToSet);
		if (!isEmptyObject(userPropsToUnion)) mixpanel.people.union(userPropsToUnion);

		// Event props and Tracking
		// Added additional eventName prop to getProperties for debug logs, will be removed later
		const eventProps = this.getProperties(MixpanelPropertyType.Event, setEventProps, eventName);
		if (isEmptyObject(eventProps)) {
			mixpanel.track(eventName);
		} else {
			mixpanel.track(eventName, eventProps);
		}
	}

	private getMetadata(variable: string) {
		const metadata = get(this.mixpanelMap, 'metadata');
		if (metadata && metadata.hasOwnProperty(variable)) return metadata[variable];

		return undefined;
	}

	private getProperties(propertyType: MixpanelPropertyType, propertyList: string[], eventLabel?: MixpanelEvent) {
		if (!propertyList || propertyList.length === 0) return {};
		const { eventName = eventLabel } = this.eventsQueue.peek() || {};

		const properties = {};
		for (let i = 0; i < propertyList.length; i++) {
			let propertyName = propertyList[i];
			if (propertyName in this.mixpanelMap[propertyType]) {
				let property = this.mixpanelMap[propertyType][propertyName];
				let propertyValue = this.getPropertyValue(property);
				const notEmptyArray = Array.isArray(propertyValue) && propertyValue.length > 0;
				const valueExistAndNotArray =
					!Array.isArray(propertyValue) && typeof propertyValue !== 'undefined' && propertyValue !== '';

				if (valueExistAndNotArray || notEmptyArray) properties[propertyName] = propertyValue;
				this.valueChecker(eventName, propertyName, propertyValue);
			}
		}
		return properties;
	}

	private getPropertyValue(property: MixpanelProperty) {
		const { source, variable } = property;

		switch (source) {
			case MixpanelPropertySource.Axis:
				return this.getAxisValue(variable);

			case MixpanelPropertySource.Client:
				return this.getClientValue(variable);

			case MixpanelPropertySource.String:
				return property.variable;

			default:
				return;
		}
	}

	private getAxisValue(variable: string) {
		const [source, fields] = variable.split('|');
		let value = get(this.event.context, source);

		// To handle array type values
		if (value && fields) {
			value = value.map(val => val[fields]);
		}

		return value;
	}

	private getClientValue(variable: string) {
		const item = get(this.event.context, 'item') || {};
		const userContext = get(this.event.context, 'user');
		const userId = get(this.event.context, 'user.userId');

		switch (variable) {
			case MixpanelVariable.AdobeId:
				return getAdobeId();

			case MixpanelVariable.AtVideoTimestamp:
				const startOverMode = get(this.event.detail, 'startoverInfo.startover');

				if (isChannel(item) && !startOverMode) {
					const epgStartDate = get(item, 'scheduleItem.startDate');
					return videoTimeStamp(epgStartDate);
				} else {
					const currentTime = get(this.event.detail, 'currentTime');
					const clampedTime = clamp(0, currentTime, currentTime);
					return formatSecondstoHhMmSs(clampedTime);
				}

			case MixpanelVariable.AvailableAudioLanguages:
				return getAudioLanguages(item);

			case MixpanelVariable.BrazeId:
				if (isRegisteredUser(userContext)) {
					return userId;
				}

				return getRefreshedMeid();

			case MixpanelVariable.CastName:
				const template = get(this.event.context, 'entry.template');
				if (template === SRP1) {
					return get(item, 'title');
				} else {
					return get(item, 'name');
				}

			case MixpanelVariable.Casts:
				const { credits } = item;
				if (!Array.isArray(credits)) return;

				return credits.filter(cast => cast.role === 'actor').map(cast => cast.name);

			case MixpanelVariable.ConnectivityStatus:
				return 'Online';

			case MixpanelVariable.ContentProvider:
				const provider = get(item, 'customFields.Provider');
				if (!provider) return;

				return isString(provider) && provider.toLowerCase();

			case MixpanelVariable.DefaultAudioLanguage:
				return getDefaultAudioLanguage(item);

			case MixpanelVariable.PlayedAudioLanguage:
				const playedAudioLanguage = this.getEventDetail(variable);
				return isString(playedAudioLanguage) ? playedAudioLanguage.toLowerCase() : getDefaultAudioLanguage(item);

			case MixpanelVariable.DownloadedVideo:
				return false;

			case MixpanelVariable.EnabledEdmMediacorp:
			case MixpanelVariable.EnabledEdmMediacorpPartners:
				const newsletters = get(this.event.detail, 'newsletters');

				const mixpanelNewsletterMap = {
					[MixpanelVariable.EnabledEdmMediacorp]: newslettersClassification.meWatch,
					[MixpanelVariable.EnabledEdmMediacorpPartners]: newslettersClassification.promotions
				};

				if (newsletters) {
					return newsletters.indexOf(mixpanelNewsletterMap[variable]) > -1;
				}
				return;

			case MixpanelVariable.EntryPoint:
				// Custom entry points can be supplied through the event detail
				// e.g. my_list_page, click_to_watch, etc
				const customEntryPoint = this.getEventDetail(variable);
				if (customEntryPoint) {
					return MIXPANEL_ENTRY_POINTS.hasOwnProperty(customEntryPoint)
						? MIXPANEL_ENTRY_POINTS[customEntryPoint]
						: customEntryPoint;
				}

				// If no custom entry point specified, return path of entry point page
				const entryPointPage =
					this.event.type === AnalyticsEventType.ITEM_CLICKED_TO_WATCH ? 'entry.pagePath' : 'page.prevPath';
				const entryPointPath = get(this.event.context, entryPointPage);
				if (entryPointPath) return getFormattedPath(entryPointPath);

				const isWscEvent = get(this.event, 'isWsc');
				if (isWscEvent) return getFormattedPath(window.location.pathname);

				return MixpanelEntryPoint.Direct;

			case MixpanelVariable.EpgStartDateTime:
				const epgStartDate = get(item, 'scheduleItem.startDate');
				if (epgStartDate) return new Date(epgStartDate).toISOString();
				return;

			case MixpanelVariable.EpgTitle:
				return get(item, 'scheduleItem.item.title');

			case MixpanelVariable.FilterType:
				const filterType = this.getEventDetail(variable);
				if (!filterType) return;

				return capitalizeStr(filterType);

			case MixpanelVariable.LastStopTimestamp:
				if (!isEmptyObject(item)) return getResumePosition(item.id);
				return;

			case MixpanelVariable.LoginType:
			case MixpanelVariable.RegistrationType:
				const loginSource = getLoginSource();
				if (loginSource === Providers.MEDIACORP) {
					return 'Email';
				}
				return loginSource;

			case MixpanelVariable.LoggedIn:
				// Return false when user signs out because user context returned is the previous logged in user
				if (this.event.type === AnalyticsEventType.USER_SIGN_OUT) return false;
				return isRegisteredUser(userContext);

			case MixpanelVariable.MediaAirtime:
				// TxDate is in format DD/MM/YYYY HH:mm
				const airtime = get(item, 'customFields.TxDate');

				if (!airtime || !validateTxDatePattern.test(airtime)) return;

				const [txDate, txTime] = airtime.split(' ');
				const [day, month, year] = txDate.split('/');

				const validDateStr = `${year}/${month}/${day} ${txTime}`;

				return new Date(validDateStr).toISOString();

			case MixpanelVariable.MediaChannel:
				const mediaChannelKeywords = this.getMetadata(variable);
				if (mediaChannelKeywords && item.categories) {
					// Split category string by / to find channel string
					// which is either standalone or after the / in the category string
					const searchCategories = item.categories.map(category => {
						const splitCategories = category.split('/');
						return splitCategories[splitCategories.length - 1];
					});

					// Do exact match of channel string
					return searchCategories.find(category => mediaChannelKeywords.indexOf(category) > -1);
				}
				return;

			case MixpanelVariable.MediaGroup:
				const mediaGroupKeywords = this.getMetadata(variable);
				if (mediaGroupKeywords && item.categories) {
					// Do exact match of categories with keyword list
					const filteredCategories = item.categories.filter(category => {
						return mediaGroupKeywords.indexOf(category.toLowerCase()) > -1;
					});

					if (filteredCategories.length > 0) {
						return filteredCategories.join('|');
					}
				}

				return;

			case MixpanelVariable.MediaRights:
				const searchKey = 'rights/';

				if (Array.isArray(item.categories)) {
					const rights = item.categories.find(cat => cat.indexOf(searchKey) > -1);

					if (rights) {
						return rights.split('/')[1].toLowerCase();
					}
				}
				return;

			case MixpanelVariable.PageLocation:
				const path = get(this.event.context, 'page.path');
				return getFormattedPath(path);

			case MixpanelVariable.PageType:
				const pageURL = get(this.event.context, 'page.path');

				if (pageURL === '/') {
					return 'Homepage';
				} else {
					const slashes = pageURL.split('/').length;
					if (slashes === 2) {
						return 'Section Page';
					} else if (slashes >= 3) {
						return 'Detail Page';
					}
					return;
				}

			case MixpanelVariable.PageUrl:
				return get(this.event.context, 'page.url');

			case MixpanelVariable.PlayerWindowMode:
				return fullscreenService.isFullScreen() ? 'Full Screen' : 'Windowed';

			case MixpanelVariable.PremiumVideo:
				const product = get(item, 'customFields.Product');
				if (product === 'SVOD') return true;
				if (product === 'PREV') return false;
				return;

			case MixpanelVariable.SeasonNumber:
				const seasonNumFromList = this.getInfoFromListData('entry.userList', 'season.seasonNumber', item.id);
				if (seasonNumFromList) return seasonNumFromList;

				return getSeasonNumber(item);

			case MixpanelVariable.SeriesTitle:
				const seriesTitleFromList = this.getInfoFromListData('entry.userList', 'show.title', item.id);
				if (seriesTitleFromList) return seriesTitleFromList;

				return getSeriesTitle(item);

			case MixpanelVariable.EpisodeId:
				return isEpisode(item) ? item.id : undefined;

			case MixpanelVariable.EpisodeNumber:
				return isEpisode(item) ? item.episodeNumber : undefined;

			case MixpanelVariable.EpisodeTitle:
				return isEpisode(item) ? item.title : undefined;

			case MixpanelVariable.EpisodeTotal:
				return get(item, 'season.availableEpisodeCount');

			case MixpanelVariable.ContentType:
			case MixpanelVariable.ProgramTitle:
			case MixpanelVariable.SeasonId:
			case MixpanelVariable.SeasonTotal:
			case MixpanelVariable.SeriesId:
				if (!isEmptyObject(item)) return getItemProperty(variable, item);
				return;
			case MixpanelVariable.SelectedContentType:
			case MixpanelVariable.SelectedProgramTitle:
			case MixpanelVariable.SelectedSeasonId:
			case MixpanelVariable.SelectedSeasonNumber:
			case MixpanelVariable.SelectedSeriesId:
			case MixpanelVariable.SelectedSeriesTitle:
				const selectedItem = get(this.event.detail, 'selectedItem');
				return getItemProperty(variable, selectedItem);

			case MixpanelVariable.RailPosition:
				const railPosition = this.getEventDetail(variable);
				if (railPosition) return railPosition;
				return get(this.event.context, 'entry.position');

			case MixpanelVariable.RailTotal:
				return get(this.event.context, 'page.entries');

			case MixpanelVariable.Meid:
				return getRefreshedMeid();

			case MixpanelVariable.MenuOption:
				const menuItemsOrder = this.getEventDetail(variable);
				return getFormattedMenuOption(menuItemsOrder);

			case MixpanelVariable.RegistrationDate:
				const time = get(this.event, 'timestamp') || new Date().getTime();
				return new Date(time).toISOString();

			case MixpanelVariable.SourcePlatform:
				return isMobile() ? 'Mobile Web' : 'Desktop';

			case MixpanelVariable.StartoverMode:
				return this.getEventDetail(variable) || false;

			case MixpanelVariable.StoryExitTrigger:
			case MixpanelVariable.StoryPageNavigationDirection:
			case MixpanelVariable.StoryPageNavigationType:
			case MixpanelVariable.StoryStartTrigger:
				const props = this.getEventDetail(variable);
				if (isString(props)) return props.toUpperCase();
				return;

			case MixpanelVariable.Subscriber:
				const subscriptions = get(userContext, 'subscriptions');
				if (subscriptions) {
					const subscribePlan = subscriptions.filter(sub => sub.status === 'Active');
					return subscribePlan.length > 1;
				}

				return false;

			case MixpanelVariable.SubscriptionPlanIds:
				const planIds = this.getEventDetail(variable);
				return planIds.map(plan => plan.id);

			case MixpanelVariable.UniqueUserId:
				if (isRegisteredUser(userContext)) {
					return getPrefixSSOID(userId);
				}

				return;

			case MixpanelVariable.AudioFilter:
			case MixpanelVariable.AvailableSubtitleLanguages:
			case MixpanelVariable.CardPosition:
			case MixpanelVariable.CardTotal:
			case MixpanelVariable.CastResultsCount:
			case MixpanelVariable.ClickableLinkCta:
			case MixpanelVariable.ClickableLinkDescription:
			case MixpanelVariable.ClickableLinkValue:
			case MixpanelVariable.CtaDestination:
			case MixpanelVariable.Currency:
			case MixpanelVariable.ExtraResultsCount:
			case MixpanelVariable.FailureCode:
			case MixpanelVariable.FilterValue:
			case MixpanelVariable.GenreFilter:
			case MixpanelVariable.ItemResultsCount:
			case MixpanelVariable.MenuType:
			case MixpanelVariable.MovieResultsCount:
			case MixpanelVariable.PaymentMethod:
			case MixpanelVariable.RatingFilter:
			case MixpanelVariable.SearchKeyword:
			case MixpanelVariable.SearchType:
			case MixpanelVariable.SeriesResultsCount:
			case MixpanelVariable.SelectedEpisodeId:
			case MixpanelVariable.SelectedEpisodeNumber:
			case MixpanelVariable.SelectedEpisodeTitle:
			case MixpanelVariable.SelectedMediaId:
			case MixpanelVariable.SelectedProgramGenres:
			case MixpanelVariable.SelectedProgramTaxonomyTier1:
			case MixpanelVariable.SelectedProgramTaxonomyTier2:
			case MixpanelVariable.SelectedTotal:
			case MixpanelVariable.SelectedVideoQuality:
			case MixpanelVariable.SelectedVideoType:
			case MixpanelVariable.SortingFilter:
			case MixpanelVariable.SportsResultsCount:
			case MixpanelVariable.StoryId:
			case MixpanelVariable.StoryPageCount:
			case MixpanelVariable.StoryPageDuration:
			case MixpanelVariable.StoryPageDurationViewedPercent:
			case MixpanelVariable.StoryPageId:
			case MixpanelVariable.StoryPageIndex:
			case MixpanelVariable.StoryTitle:
			case MixpanelVariable.SubscriptionDiscountedPrice:
			case MixpanelVariable.SubscriptionEndDate:
			case MixpanelVariable.SubscriptionGroup:
			case MixpanelVariable.SubscriptionPlanId:
			case MixpanelVariable.SubscriptionPrice:
			case MixpanelVariable.SubscriptionPromoCode:
			case MixpanelVariable.SubscriptionStartDate:
			case MixpanelVariable.TimestampUTC:
			case MixpanelVariable.TimestampUserTZ:
			case MixpanelVariable.UndoNumber:
			case MixpanelVariable.VideoQuality:
				return this.getEventDetail(variable);

			case MixpanelVariable.PlayedSubtitleLanguage:
			case MixpanelVariable.SelectedAudioLanguage:
			case MixpanelVariable.SelectedSubtitleLanguage:
			case MixpanelVariable.TagType:
			case MixpanelVariable.TagValue:
				const prop = this.getEventDetail(variable);
				if (isString(prop)) return prop.toLowerCase();
				return;

			case MixpanelVariable.Cid:
			case MixpanelVariable.InternalId:
			case MixpanelVariable.UtmCampaignLastTouch:
			case MixpanelVariable.UtmContentLastTouch:
			case MixpanelVariable.UtmMediumLastTouch:
			case MixpanelVariable.UtmSourceLastTouch:
			case MixpanelVariable.UtmTermLastTouch:
				return getQueryParam(QUERY_PARAMS[variable]);

			case MixpanelVariable.BackwardTimestamp:
			case MixpanelVariable.ForwardTimestamp:
			case MixpanelVariable.SeekEndTimestamp:
			case MixpanelVariable.SeekStartTimestamp:
				const seekTime = this.getEventDetail(variable);
				// Needed to ensure seekTime is not negative during transition between startover mode
				const clampedSeekTime = clamp(0, seekTime, seekTime);
				return formatSecondstoHhMmSs(clampedSeekTime);

			case MixpanelVariable.VideoDuration:
				return item.duration;

			case MixpanelVariable.VideoPlayer:
				return PlayerType.Kaltura;

			case MixpanelVariable.VideoState:
				if (!isEmptyObject(item)) return getResumePosition(item.id) === 0 ? 'New' : 'Unfinish';
				return;

			case MixpanelVariable.WatchedDurationSec:
				const startTime = get(this.event.detail, 'startTime');
				if (startTime) {
					const timestamp = getElapsedTime(startTime);
					return timestamp;
				}
				return;

			default:
				return;
		}
	}

	private getEventDetail(variable: string) {
		return get(this.event.detail, MIXPANEL_EVENT_DETAILS[variable]);
	}

	private getInfoFromListData(listContextName: string, dataType: string, itemId: string) {
		const userList = get(this.event.context, listContextName);
		if (userList && isContinueWatching(userList)) {
			return get(this.event.context, `listData.ContinueWatching.itemInclusions.${itemId}.${dataType}`);
		}

		return undefined;
	}

	private valueChecker = (name: String, variable: string, value: any) => {
		if (MIXPANEL_DEBUG_MODE && (value === undefined || value === null)) {
			const debugString = `${name} var: ${variable} has no value`;
			console.log(`%c[Mixpanel] ${debugString}`, 'color: red');
		}
		return value;
	};
}
