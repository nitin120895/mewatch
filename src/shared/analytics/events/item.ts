import { merge, EMPTY, interval } from 'rxjs';
import { delay, distinctUntilChanged, filter, map, mergeMap, switchMap, take, withLatestFrom } from 'rxjs/operators';
import { isNumber, isBoolean } from 'util';

import { ANALYTICS_EVENT } from 'shared/analytics/analyticsWorkflow';
import { toEvent, withContext, withItemContext } from 'shared/analytics/events/toEvent';
import { get, isEmptyObject, isObject, pick } from 'shared/util/objects';
import { FOCUS_TIME_SECS } from 'shared/analytics/config';
import { checkHooqContent, getItemData, getPageContext } from 'shared/analytics/getContext';
import { getUndoRemoveData } from 'shared/analytics/mixpanel/util';
import { Sources, StreamHandler } from 'shared/analytics/types/stream';
import {
	AddItemBookmarkAction,
	BOOKMARK_ITEM,
	DELETE_ITEM_BOOKMARK,
	DeleteItemBookmarkAction,
	GET_PAGE_DETAIL,
	GetPageDetailAction,
	ItemRatedAction,
	RATE_ITEM,
	UNDO_DELETE_CONTINUE_WATCHING
} from 'shared/analytics/types/v3/action/redux-actions';
import { VideoEntryPoint } from 'shared/analytics/types/types';
import { ContextProperty, ItemContextProperty } from 'shared/analytics/types/v3/context';
import { ItemContext, ItemTypeKeys } from 'shared/analytics/types/v3/context/entry';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { CTATypes, DomEventItem, DomEventSourceType, EventName } from 'shared/analytics/types/types';
import { isActionOfType, isCTAType, isEventOfSource, isEventOfType } from 'shared/analytics/util/stream';
import { ContinueWatching, ContinueWatchingAnonymous } from 'shared/list/listId';
import { isBookmarksList, isContinueWatching } from 'shared/list/listUtil';
import { ShowDetail } from 'shared/page/pageKey';
import {
	CHD2,
	D2EpisodeList,
	ResultsPeople,
	XD1,
	XD2,
	UX5Recommendation,
	UX6Recommendation,
	UX7Recommendation,
	UX8Recommendation,
	XEPG6,
	Xh2Autoplay
} from 'shared/page/pageEntryTemplate';
import { getCachedTvItem, selectActivePage, selectPreviousPagePath } from 'shared/page/pageUtil';
import { isChannel } from 'toggle/responsive/util/epg';

type ItemActions = ItemRatedAction | AddItemBookmarkAction | DeleteItemBookmarkAction;

// API Expects n/10 - RWA uses n/5
const getItemRatingFromAction = ({ payload: { rating }, meta }: ItemRatedAction) => ({
	rating: rating / meta.info.ratingScale
});

const getContextFromItemAction = (ctx: any, action: ItemActions): ItemContextProperty => {
	const { id, title, path, type, customId } = action.meta.info.item;
	return { ...ctx, item: { id, title, path, type: type as ItemTypeKeys, customId } };
};

const getContextFromAnalyticsAction = ({ data }, ctx: ContextProperty) => {
	return {
		...ctx,
		item: data.item
	};
};

const getContextForIDPPage = (item, ctx) => {
	const { page } = ctx;

	// Required as /item returns type season on show detail page
	const showItemDetails = get(item, 'show') || item;
	const itemDetails = page.key === ShowDetail ? showItemDetails : item;

	return {
		item: getItemData(itemDetails)
	};
};

const getCardTotal = data => {
	const { entry, totalScheduleCount, totalCastCount, item } = data;
	const { template, userList } = entry;

	if (userList && (isBookmarksList(userList) || isContinueWatching(userList))) return get(entry, 'userList.size');

	switch (template) {
		case CHD2:
		case XEPG6:
			return totalScheduleCount;

		case D2EpisodeList:
			return get(entry, 'item.episodes.size') || get(item, 'season.availableEpisodeCount');

		case ResultsPeople:
			return totalCastCount;

		case UX5Recommendation:
		case UX6Recommendation:
		case UX7Recommendation:
			return get(entry, 'userList.size');
		case UX8Recommendation:
			return get(entry, 'userList.size');

		case XD1:
			const extras = get(entry, 'item.extras');
			return Array.isArray(extras) ? extras.length : undefined;

		case XD2:
			const similar = get(entry, 'item.similar');
			return Array.isArray(similar) ? similar.length : undefined;

		case Xh2Autoplay:
			return 1;

		default:
			return get(entry, 'list.size');
	}
};

const getVideoData = payload => {
	const { player } = payload;
	const { item, data: streamInfo } = player;

	let subtitleLanguages;
	if (Array.isArray(streamInfo) && streamInfo.length > 0) {
		const { subtitlesCollection } = streamInfo[0];

		if (Array.isArray(subtitlesCollection)) {
			subtitleLanguages = subtitlesCollection.map(subtitle => subtitle.language.toLowerCase());
		}
	}

	return { item, subtitleLanguages };
};

const getCwMenuData = data => {
	const { index, railPosition, cwDeleteList } = data;
	const cwList = get(data, `cw.${ContinueWatching}.list`) || get(data, `cw.${ContinueWatchingAnonymous}.list`);
	const cardTotal = cwList.size - cwDeleteList.length;

	const eventDetail = {
		position: index,
		cardTotal: cardTotal,
		railPosition: railPosition
	};
	return eventDetail;
};

const getDetailFromDomEvent = data => {
	const { index, image, entry, entryPoint, size, list, listData, filters } = data;
	const eventDetail = {
		position: index,
		image: image,
		entryPoint: entryPoint,
		cardTotal: entry ? getCardTotal(data) : size,
		list: list || listData,
		...filters
	};

	return eventDetail;
};

const getDetailFromCTA = ({ data }) => ({ ...data.data });

const getInfoLinkFromDomEvent = data => {
	const { currentTime, linkUrl, linkDescription, linkCta, startTime, subtitleLanguages } = data;
	return {
		currentTime,
		linkUrl,
		linkDescription,
		linkCta,
		startTime,
		subtitleLanguages
	};
};

const getContextFromDomEvent = ({ data: { item, entry, listData } }: DomEventItem, ctx: ContextProperty) => {
	return {
		...ctx,
		entry: entry || ctx.entry,
		item: getItemData(item),
		listData: listData || {}
	};
};

const getContextWithPage = ({ item, page }, ctx) => ({ ...ctx, ...page, item });

const getContextWithItem = ({ item }, ctx) => ({ ...ctx, item });

const getContextFromPageDetailAction = (item: api.ItemDetail): { item: ItemContext } => ({
	item: getItemData(item)
});

const getDelayedEventOrEmpty = event =>
	event.eventName === EventName.MOUSEENTER || event.eventName === EventName.CLICK
		? interval(FOCUS_TIME_SECS * 1000).pipe(
				take(1),
				map(() => event)
		  )
		: EMPTY;

const isItemClickTrackable = data => {
	const { edit } = data;
	const editModeExists = typeof edit !== 'undefined';

	// Track click only if packshot is not in edit mode
	// All other items with no edit modes e.g carousel item should still be tracked
	return !editModeExists || (editModeExists && edit === false);
};

const isPackshotInEditMode = data => {
	const { edit } = data;
	return typeof edit !== 'undefined' && edit === true;
};

const isPlayerDataReady = (player, itemId) => {
	const playerLoadedItem = get(player, 'item.id') === itemId;

	// Kaltura player - Waits for stream data to be ready
	const playerStatusReady = player.hasOwnProperty('data');

	return player && playerLoadedItem && playerStatusReady;
};

export const itemStreamHandler: StreamHandler = function itemStreamHandler(sources: Sources) {
	const { DOM_EVENT, CONTEXT, ACTION, STATE } = sources;

	const cwDeleteList$ = STATE.pipe(
		map(
			state =>
				(state && state.profile && state.profile.continueWatching && state.profile.continueWatching.deleteList) || []
		),
		filter(deleteList => Array.isArray(deleteList)),
		distinctUntilChanged()
	);

	const cwList$ = STATE.pipe(
		map(state => state && state.cache.list),
		filter(isObject)
	);

	const page$ = STATE.pipe(
		filter(isObject),
		map(selectActivePage),
		map(page => getPageContext(page)),
		mergeMap(pageInfo =>
			STATE.pipe(
				filter(isObject),
				map(selectPreviousPagePath),
				map(prevPath => ({ page: { ...pageInfo, prevPath } }))
			)
		)
	);

	const filters$ = STATE.pipe(
		map(state => state && state.page && state.page.history && state.page.history.filters),
		filter(filters => isObject(filters)),
		distinctUntilChanged()
	);

	const videoData$ = STATE.pipe(
		map(state => state && state.player),
		filter(player => isObject(player) && player.entryId && !isEmptyObject(player.players)),
		map(player => {
			const { players, entryId } = player;
			return {
				player: players[entryId]
			};
		})
	);

	const videoDataReady$ = itemId =>
		videoData$.pipe(
			filter(({ player }) => isPlayerDataReady(player, itemId)),
			distinctUntilChanged((prev, curr) => get(prev, 'player.item.id') === get(curr, 'player.item.id'))
		);

	const reminders$ = STATE.pipe(
		map(state => state && state.profile && state.profile.reminders),
		filter(reminderList => Array.isArray(reminderList))
	);

	const itemClicked$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.Item),
		// Exclude clicks on My List edit mode where clicking on item "deletes" item from My List
		filter(({ data }) => isItemClickTrackable(data)),

		// Filters required for Listing card pages
		// Page required to get current page at moment of click.
		// Cannot use page context from event as we might have navigated while waiting for items api
		withLatestFrom(filters$, page$),
		map(([event, filters, page]) => ({ ...event.data, filters, page })),
		toEvent(AnalyticsEventType.ITEM_CLICKED, data => getDetailFromDomEvent(data)),
		withItemContext(CONTEXT, getContextWithPage)
	);

	const itemClickedToWatch$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.CTA),
		isCTAType(CTATypes.Watch, CTATypes.Trailer),
		withLatestFrom(page$),
		map(([event, page]) => ({ ...event.data.data, page })),
		toEvent(AnalyticsEventType.ITEM_CLICKED_TO_WATCH, data => getDetailFromDomEvent(data)),
		withItemContext(CONTEXT, getContextWithPage)
	);

	const itemUserPreferencesClicked$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.CTA),
		isCTAType(CTATypes.Preferences),
		toEvent(AnalyticsEventType.ITEM_USER_PREFERENCES_CLICKED, data => getDetailFromCTA(data)),
		withContext(CONTEXT)
	);

	const TV_ITEMS: api.ItemDetail['type'][] = ['show', 'season', 'episode'];

	const currentTime$ = STATE.pipe(
		map(state => state && state.player && state.player.currentTime),
		filter(isNumber),
		distinctUntilChanged()
	);

	const playerStartTime$ = STATE.pipe(
		map(state => state && state.player && state.player.startTime),
		filter(startTime => startTime !== undefined),
		distinctUntilChanged()
	);

	const hooqContent$ = STATE.pipe(
		map(state => checkHooqContent(state)),
		filter(isBoolean),
		distinctUntilChanged()
	);

	// Using switchMap cancels the in progress hover - if a MOUSELEAVE event isn't received then fires after focus time
	const itemFocused$ = DOM_EVENT.pipe(
		isEventOfType(EventName.MOUSEENTER, EventName.MOUSELEAVE, EventName.CLICK),
		isEventOfSource(DomEventSourceType.Item),
		switchMap(event => getDelayedEventOrEmpty(event)),
		toEvent(AnalyticsEventType.ITEM_FOCUSED, getDetailFromDomEvent),
		withItemContext(CONTEXT, getContextFromDomEvent)
	);

	const itemRated$ = ACTION.pipe(
		isActionOfType<ItemRatedAction>(RATE_ITEM),
		toEvent(AnalyticsEventType.ITEM_RATED, getItemRatingFromAction),
		withItemContext(CONTEXT, (action, ctx) => getContextFromItemAction(ctx, action))
	);

	// Use ACTION instead of DOM_EVENT as CTAWrapper component does not update addToBookmark state
	// Event is triggered regardless of login state and regardless of whether bookmark gets successfully added to My List
	const itemBookmarkAddClicked$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.ITEM_BOOKMARK_ADD_CLICKED),
		toEvent(AnalyticsEventType.ITEM_BOOKMARK_ADD_CLICKED),
		withItemContext(CONTEXT, getContextFromAnalyticsAction)
	);

	const itemBookmarkRemoveClickedInIDP$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.ITEM_BOOKMARK_REMOVE_CLICKED),
		toEvent(AnalyticsEventType.ITEM_BOOKMARK_REMOVE_CLICKED),
		withItemContext(CONTEXT, getContextFromAnalyticsAction)
	);

	// Click of Remove Bookmark CTA in My List does not mean that bookmark is really deleted
	// from user's My List as real delete is only done after user clicks on Finish
	const itemBookmarkRemoveClickedInMyList$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.Item),
		filter(({ data }) => isPackshotInEditMode(data)),
		withLatestFrom(filters$),
		map(([event, filter]) => ({ ...event, filter })),
		toEvent(AnalyticsEventType.ITEM_BOOKMARK_REMOVE_CLICKED, ({ data, filter }) => ({
			...getDetailFromDomEvent(data),
			...filter
		})),
		withItemContext(CONTEXT, getContextFromDomEvent)
	);

	const itemBookmarkEvent$ = ACTION.pipe(
		isActionOfType<AddItemBookmarkAction | DeleteItemBookmarkAction>(BOOKMARK_ITEM, DELETE_ITEM_BOOKMARK),
		toEvent(AnalyticsEventType.ITEM_BOOKMARKED, ({ type }) => ({ isBookmarked: type === BOOKMARK_ITEM })),
		withItemContext(CONTEXT, (action, ctx) => getContextFromItemAction(ctx, action))
	);

	const itemDetailViewed$ = ACTION.pipe(
		isActionOfType<GetPageDetailAction>(GET_PAGE_DETAIL),
		filter(({ payload }) => isObject(payload.item)),
		withLatestFrom(STATE, ({ payload, meta: { info: location } }, state) =>
			TV_ITEMS.includes(payload.item.type) ? getCachedTvItem(state, location, payload) : payload.item
		),
		toEvent(AnalyticsEventType.ITEM_DETAIL_VIEWED),
		withItemContext(CONTEXT, (item, ctx) => ({ ...ctx, ...getContextFromPageDetailAction(item) }))
	);

	const isLoggedInUser$ = STATE.pipe(
		map(state => state && state.account && state.account.active),
		filter(isloggedIn => isloggedIn)
	);

	const itemOffered$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.CTA),
		isCTAType(CTATypes.Offer),
		withLatestFrom(isLoggedInUser$, page$, (event, loggedIn, page) => ({ event, loggedIn, page })),
		filter(({ event, loggedIn }) => {
			const entryPoint = get(event, 'data.data.entryPoint');
			return entryPoint === VideoEntryPoint.IDPWatch && loggedIn;
		}),
		map(({ event, page }) => ({ ...event.data.data, page })),
		toEvent(AnalyticsEventType.ITEM_OFFERED),
		withItemContext(CONTEXT, getContextWithPage)
	);

	const itemSubscribeClicked$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.ITEM_SUBSCRIBE_CLICKED),
		toEvent(AnalyticsEventType.ITEM_SUBSCRIBE_CLICKED),
		withItemContext(CONTEXT, getContextFromAnalyticsAction)
	);

	const itemWatched$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.CTA),
		isCTAType(CTATypes.Watch),
		withLatestFrom(currentTime$, hooqContent$, ({ data }, currentTime, hooqContent) => ({
			...data.data,
			currentTime,
			hooqContent
		})),
		toEvent(AnalyticsEventType.ITEM_WATCHED),
		withItemContext(CONTEXT, ({ item, currentTime, hooqContent }, ctx) => ({
			...ctx,
			item: {
				...getItemData(item),
				currentTime,
				hooqContent
			}
		}))
	);

	const itemWatchProgramTrailer$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.CTA),
		isCTAType(CTATypes.Trailer),
		switchMap(event => {
			const itemId = get(event, 'data.data.item.id');
			if (itemId) return videoDataReady$(itemId);
		}),
		map(videoData => getVideoData(videoData)),
		toEvent(AnalyticsEventType.ITEM_WATCH_PROGRAM_TRAILER, data => pick(data, 'subtitleLanguages')),
		withItemContext(CONTEXT, ({ item }, ctx) => ({ ...ctx, item: getItemData(item) }))
	);

	const itemProgramTagClicked$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.CTA),
		isCTAType(CTATypes.ProgramTag),
		map(data => getDetailFromCTA(data)),
		toEvent(AnalyticsEventType.ITEM_PROGRAM_TAG_CLICKED, ({ tagType, tagValue }) => ({ tagType, tagValue })),
		withItemContext(CONTEXT, ({ item }, ctx) => ({ ...ctx, ...getContextForIDPPage(item, ctx) }))
	);

	const itemProgramEpisodeSynopsisClicked$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.CTA),
		isCTAType(CTATypes.Synopsis),
		filter(({ data: { data } }) => data.isCollapsed),
		map(data => getDetailFromCTA(data)),
		toEvent(AnalyticsEventType.ITEM_PROGRAM_SYNOPSIS_CLICKED),
		withItemContext(CONTEXT, ({ item }, ctx) => ({ ...ctx, ...getContextForIDPPage(item, ctx) }))
	);

	const itemIdpLinkClick$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.CTA),
		isCTAType(CTATypes.IDPLink),
		map(data => getDetailFromCTA(data)),
		toEvent(AnalyticsEventType.ITEM_IDP_LINK_CLICKED, ({ linkUrl }) => ({ linkUrl })),
		withItemContext(CONTEXT, ({ item }, ctx) => ({ ...ctx, ...getContextForIDPPage(item, ctx) }))
	);

	const itemInfoLinkClick$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.CTA),
		isCTAType(CTATypes.InfoLink),
		// need to delay this event because hover event for info icon click has a focus delay of 3s
		delay(4000),
		withLatestFrom(playerStartTime$, videoData$),
		map(([{ data }, startTime, playerData]) => {
			const item = get(data, 'data.item');
			if (isChannel(item)) return { ...data.data, startTime };
			return { ...data.data, ...getVideoData(playerData) };
		}),
		toEvent(AnalyticsEventType.ITEM_INFO_LINK_CLICKED, data => getInfoLinkFromDomEvent(data)),
		withItemContext(CONTEXT, ({ item }, ctx) => ({ ...ctx, item }))
	);

	const itemInfoIconClick$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK, EventName.MOUSEENTER),
		isEventOfSource(DomEventSourceType.CTA),
		isCTAType(CTATypes.InfoIcon),
		switchMap(event => getDelayedEventOrEmpty(event)),
		withLatestFrom(playerStartTime$, videoData$),
		map(([{ data }, startTime, playerData]) => {
			const item = get(data, 'data.item');
			if (isChannel(item)) return { ...data.data, startTime };
			return { ...data.data, ...getVideoData(playerData) };
		}),
		toEvent(AnalyticsEventType.ITEM_INFO_ICON_CLICKED, data => getInfoLinkFromDomEvent(data)),
		withItemContext(CONTEXT, ({ item }, ctx) => ({ ...ctx, item }))
	);

	const itemSetReminder$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.CTA),
		isCTAType(CTATypes.SetReminder),
		map(data => getDetailFromCTA(data)),
		withLatestFrom(reminders$, (streamData, reminders) => ({ ...streamData, reminders })),
		// Reminder not in user's reminder list. This implies that reminder is about to be set.
		filter(
			({ item, reminders }) =>
				reminders.findIndex(reminder => reminder.schedule.customId === item.scheduleItem.customId) === -1
		),
		toEvent(AnalyticsEventType.ITEM_SET_REMINDER, data => pick(data, 'entryPoint')),
		withItemContext(CONTEXT, ({ item }, ctx) => ({ ...ctx, item }))
	);

	const itemCwPageSelectSingleRemove$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.CW_PAGE_SELECT_SINGLE_REMOVE),
		map(({ data }) => ({ ...data })),
		toEvent(AnalyticsEventType.CW_PAGE_SELECT_SINGLE_REMOVE, ({ cardTotal, position }) => ({ cardTotal, position })),
		withItemContext(CONTEXT, (item, ctx) => ({ ...ctx, ...item }))
	);

	const itemCWMenuClicked$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.CTA),
		isCTAType(CTATypes.CWMenu),
		withLatestFrom(cwDeleteList$, cwList$),
		map(([event, cwDeleteList, cw]) => ({ ...event.data.data, cwDeleteList, cw })),
		toEvent(AnalyticsEventType.CW_MENU_CLICKED, data => getCwMenuData(data)),
		withItemContext(CONTEXT, getContextWithItem)
	);

	const itemCWMenuRemoveCW$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.CTA),
		isCTAType(CTATypes.CWMenuRemoveCW),
		withLatestFrom(cwDeleteList$, cwList$),
		map(([event, cwDeleteList, cw]) => ({ ...event.data.data, cwDeleteList, cw })),
		toEvent(AnalyticsEventType.CW_MENU_REMOVE_CW, data => getCwMenuData(data)),
		withItemContext(CONTEXT, getContextWithItem)
	);
	const itemCwMenuUndoRemove$ = ACTION.pipe(
		isActionOfType(UNDO_DELETE_CONTINUE_WATCHING),
		filter(({ payload }) => Array.isArray(payload.undoList) && get(payload, 'undoList').length === 1),
		map(({ payload }) => ({ ...payload, item: payload.undoList[0] })),
		withLatestFrom(cwList$, (data, cw) => ({ ...data, cw })),
		toEvent(AnalyticsEventType.CW_MENU_UNDO_REMOVE, data => getUndoRemoveData(data)),
		withItemContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	const itemCWViewInfo$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.CTA),
		isCTAType(CTATypes.CWMenuViewInfo),
		withLatestFrom(cwDeleteList$, cwList$),
		map(([event, cwDeleteList, cw]) => ({ ...event.data.data, cwDeleteList, cw })),
		toEvent(AnalyticsEventType.CW_MENU_VIEW_INFO, data => getCwMenuData(data)),
		withItemContext(CONTEXT, getContextWithItem)
	);

	return {
		EVENT: merge(
			itemClicked$,
			itemClickedToWatch$,
			itemFocused$,
			itemRated$,
			itemDetailViewed$,
			itemBookmarkAddClicked$,
			itemBookmarkRemoveClickedInIDP$,
			itemBookmarkRemoveClickedInMyList$,
			itemBookmarkEvent$,
			itemOffered$,
			itemSubscribeClicked$,
			itemWatched$,
			itemWatchProgramTrailer$,
			itemProgramTagClicked$,
			itemProgramEpisodeSynopsisClicked$,
			itemUserPreferencesClicked$,
			itemIdpLinkClick$,
			itemInfoLinkClick$,
			itemInfoIconClick$,
			itemSetReminder$,
			itemCWMenuClicked$,
			itemCWMenuRemoveCW$,
			itemCwMenuUndoRemove$,
			itemCwPageSelectSingleRemove$,
			itemCWViewInfo$
		)
	};
};
