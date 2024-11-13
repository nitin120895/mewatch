import { merge, combineLatest } from 'rxjs';
import {
	debounceTime,
	delayWhen,
	distinctUntilChanged,
	filter,
	map,
	sample,
	switchMap,
	withLatestFrom
} from 'rxjs/operators';
import {
	getUndoRemoveData,
	isSocialMediaReferrer,
	MixpanelEntryPoint,
	enhanceSearchRequestEventPropMap,
	SearchType
} from 'shared/analytics/mixpanel/util';
import { ANALYTICS_EVENT } from 'shared/analytics/analyticsWorkflow';
import { isActionOfType, isCTAType, isEventOfSource, isEventOfType } from 'shared/analytics/util/stream';
import { SEARCH } from 'shared/service/action/content';
import { isObject, isString, get } from 'shared/util/objects';
import { StreamHandler } from 'shared/analytics/types/stream';
import { CTATypes, DomEventSourceType, DomTriggerPoints, EventName } from 'shared/analytics/types/types';
import {
	GET_PAGE_SUMMARY,
	GET_PAGE_DETAIL,
	UNDO_DELETE_CONTINUE_WATCHING,
	SearchAction,
	GetPageDetailAction
} from '../types/v3/action/redux-actions';
import { EntryContextTypes, ItemContext } from '../types/v3/context/entry';
import { AnalyticsEventType } from '../types/v3/event/analyticsEvent';
import { toEvent, withContext, withEntryContext, withItemContext } from './toEvent';
import { getItemData } from '../getContext';
import { AccountProfileBookmarks, List, ShowDetail, Watch } from 'shared/page/pageKey';
import { ProgramDetailTemplates, ListDetailFeatured } from 'shared/page/pageTemplate';

const SEARCH_DEBOUNCE_INTERVAL = 250;

const getContextForIDPPage = (action: GetPageDetailAction): { item: ItemContext } => {
	const pageKey = get(action, 'payload.key');

	// Required as /page api returns item as a season on show detail page
	const genericItemDetails = get(action, 'payload.item');
	const showItemDetails = get(action, 'payload.item.show') || genericItemDetails;
	const itemDetails = pageKey === ShowDetail ? showItemDetails : genericItemDetails;

	return {
		item: getItemData(itemDetails)
	};
};

const getContextForWatchPage = (action: GetPageDetailAction): { item: ItemContext } => {
	const itemDetails = get(action, 'payload.entries.0.item');
	return {
		item: getItemData(itemDetails)
	};
};

const getSearchEventDetail = action => {
	const { term, total: totalResults, people } = action.payload;
	const resultsByType = {};
	if (Array.isArray(people)) {
		resultsByType['people'] = people.length;
	}

	const resultTypes = ['extras', 'items', 'movies', 'tv', 'sports'];
	for (let i = 0; i < resultTypes.length; i++) {
		let type = resultTypes[i];

		if (action.payload.hasOwnProperty(type)) {
			resultsByType[type] = get(action.payload[type], 'size') || 0;
		}
	}

	return {
		term,
		totalResults,
		resultsByType
	};
};

const getRecommendedSearchDomEvent = data => {
	const { index, item, term } = data;
	// term: Search_keyword, position:card_position, item:Clicked item detail
	const eventDetail = {
		term,
		position: index,
		item
	};
	return eventDetail;
};

const getEnhancedSearchEventDetail = action => {
	const { entries } = action.payload;
	const { term } = action;
	const resultsByType = {};
	let totalResults = 0;

	(entries || []).forEach(entry => {
		if (entry.type === 'ListEntry') {
			const customItemTypeIds = get(entry, 'customFields.itemTypeIds');
			if (Array.isArray(customItemTypeIds) && customItemTypeIds.length > 0) {
				const itemTypeId = customItemTypeIds[0];
				if (itemTypeId && enhanceSearchRequestEventPropMap.hasOwnProperty(itemTypeId)) {
					const value = enhanceSearchRequestEventPropMap[itemTypeId];
					const itemLength = get(entry, 'list.size') || 0;
					totalResults += itemLength;
					resultsByType[value] = itemLength; // Set the item length to the mapped value
				}
			}
		}
	});

	return {
		term,
		totalResults,
		resultsByType
	};
};

const getSearchType = trigger => {
	switch (trigger) {
		case DomTriggerPoints.RecentSearch:
			return SearchType.RecentSearch;
		case DomTriggerPoints.RecommendedSearch:
			return SearchType.RecommendedSearch;
		case DomTriggerPoints.SearchPage:
			return SearchType.SearchPage;
		case DomTriggerPoints.ShowAllResults:
			return SearchType.ShowAllResults;
		default:
			return SearchType.SearchBar;
	}
};

const getPageSearchEventContext = ({ payload: { term, total } }, ctx) => {
	const key = 'items';
	const template = '';
	const { path: pagePath } = ctx.page;
	const search = { term, size: total };
	return {
		...ctx,
		entry: { pagePath, position: 0, key, template, type: EntryContextTypes.Search, title: 'Search', search }
	};
};

export const browseStreamHandler: StreamHandler = function browseStreamHandler({ ACTION, STATE, DOM_EVENT, CONTEXT }) {
	const pageUrl$ = CONTEXT.pipe(
		map(({ page }) => page),
		filter(isObject)
	);

	const user$ = CONTEXT.pipe(
		map(({ user }) => user && user.userId),
		distinctUntilChanged()
	);

	const action$ = ACTION.pipe(map(({ payload, meta }) => ({ payload, meta })));

	const idpPage$ = ACTION.pipe(
		isActionOfType(GET_PAGE_DETAIL),
		filter(({ payload }) => ProgramDetailTemplates.indexOf(payload.template) > -1),
		toEvent(AnalyticsEventType.ITEM_DETAIL_PAGE_VIEWED),
		withItemContext(CONTEXT, (item, ctx) => ({ ...ctx, ...getContextForIDPPage(item) }))
	);

	const watchPage$ = ACTION.pipe(
		isActionOfType(GET_PAGE_DETAIL),
		filter(({ payload }) => payload.template === Watch),
		toEvent(AnalyticsEventType.WATCH_PAGE_VIEWED),
		withItemContext(CONTEXT, (item, ctx) => ({ ...ctx, ...getContextForWatchPage(item) }))
	);

	const bookmarksReady$ = STATE.pipe(
		map(state => state && state.cache && state.cache.list && state.cache.list.Bookmarks),
		filter(bookmarks => isObject(bookmarks)),
		map(({ list }) => list.size),
		filter(cardTotal => cardTotal > -1),
		distinctUntilChanged()
	);

	const myListPageReady$ = ACTION.pipe(
		isActionOfType(GET_PAGE_DETAIL),
		filter(({ payload }) => payload.key === AccountProfileBookmarks),
		delayWhen(() => bookmarksReady$),
		withLatestFrom(bookmarksReady$),
		map(([payload, cardTotal]) => {
			return { cardTotal };
		})
	);

	const routeHistory$ = STATE.pipe(
		map(state => state && state.page && state.page.history && state.page.history),
		filter(history => isObject(history) && history.entries.length > 0)
	);

	const myListPageDirectEntry$ = myListPageReady$.pipe(
		withLatestFrom(routeHistory$),
		filter(([cardTotal, routesHistory]) => {
			// Check if is first page in history to determine direct access
			const { entries, index } = routesHistory;
			const prevIndex = index - 1;
			return index < 0 || typeof entries[prevIndex] === 'undefined';
		}),
		map(([cardTotal]) => cardTotal),
		toEvent(AnalyticsEventType.MY_LIST_PAGE_VIEWED, detail => detail),
		withContext(CONTEXT)
	);

	const trigger$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.Trigger),
		map(({ data: { trigger } }) => trigger)
	);

	const myListPageViaTrigger$ = myListPageReady$.pipe(
		withLatestFrom(trigger$),
		map(([payload, trigger]) => {
			const entryPoint =
				trigger === DomTriggerPoints.NavAccount ? MixpanelEntryPoint.NavAccount : MixpanelEntryPoint.HomepageList;

			return {
				...payload,
				entryPoint
			};
		}),
		toEvent(AnalyticsEventType.MY_LIST_PAGE_VIEWED, detail => detail),
		withContext(CONTEXT)
	);

	const myListPage$ = merge(myListPageDirectEntry$, myListPageViaTrigger$);

	const pageFilters$ = payload => {
		const { path } = payload;

		return STATE.pipe(
			map(state => state && state.page && state.page.history),
			filter(
				({ filters, filtersSize, location }) =>
					location.pathname === path &&
					isObject(filters) &&
					filtersSize > 0 &&
					Object.keys(filters).length === filtersSize
			),
			distinctUntilChanged((prev, curr) => prev.location.pathname === curr.location.pathname),
			map(({ filters }) => ({ filters, ...payload }))
		);
	};

	const listingPage$ = ACTION.pipe(
		isActionOfType(GET_PAGE_DETAIL),
		filter(({ payload }) => payload.key === List || payload.template === ListDetailFeatured),
		switchMap(({ payload }) => pageFilters$(payload)),
		withLatestFrom(pageUrl$),
		map(([payload, page]) => {
			return { ...payload, page };
		}),
		toEvent(AnalyticsEventType.LIST_PAGE_VIEWED, ({ list, filters, page: { referrer } }: any) => {
			if (referrer && isSocialMediaReferrer(referrer)) {
				return { cardTotal: list.size, ...filters, entryPoint: MixpanelEntryPoint.SocialMedia };
			}
			return { cardTotal: list.size, ...filters };
		}),
		withContext(CONTEXT)
	);

	const pageViewed$ = combineLatest(pageUrl$, action$, user$).pipe(
		sample(ACTION.pipe(isActionOfType(GET_PAGE_DETAIL))),
		filter(([page, action]) => page.id !== 'null-page' && !get(action, 'meta.isSearchTyped')),
		map(([page]) => page),
		toEvent(AnalyticsEventType.PAGE_VIEWED, detail => {
			if (detail.referrer && isSocialMediaReferrer(detail.referrer)) {
				return { entryPoint: MixpanelEntryPoint.SocialMedia };
			}
			return;
		}),
		withContext(CONTEXT)
	);

	const pageSummaryViewed$ = combineLatest(pageUrl$, user$).pipe(
		filter(([page]) => page.id !== 'null-page'),
		map(([page]) => page),
		sample(ACTION.pipe(isActionOfType(GET_PAGE_SUMMARY))),
		toEvent(AnalyticsEventType.PAGE_VIEWED),
		withContext(CONTEXT)
	);

	const searchEvent$ = ACTION.pipe(
		isActionOfType<SearchAction>(SEARCH),
		filter(({ payload: { term } }) => isString(term) && term !== ''),
		debounceTime(SEARCH_DEBOUNCE_INTERVAL),
		withLatestFrom(trigger$),
		map(([payload, trigger]) => {
			return {
				...payload,
				trigger: getSearchType(trigger)
			};
		}),
		toEvent(AnalyticsEventType.SEARCHED, action => ({ ...getSearchEventDetail(action), searchType: action.trigger })),
		withEntryContext(CONTEXT, getPageSearchEventContext)
	);

	const enhancedSearchEvent$ = ACTION.pipe(
		isActionOfType(GET_PAGE_DETAIL),
		debounceTime(SEARCH_DEBOUNCE_INTERVAL),
		filter(({ meta }) => get(meta, 'isSearchTyped') && get(meta, 'term')),
		withLatestFrom(trigger$),
		map(([payload, trigger]) => {
			return {
				...payload,
				term: payload.meta.term,
				trigger: getSearchType(trigger)
			};
		}),
		toEvent(AnalyticsEventType.SEARCHED, action => ({
			...getEnhancedSearchEventDetail(action),
			searchType: action.trigger
		})),
		withContext(CONTEXT)
	);

	const recommendedSearchEvent$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.Trigger),
		filter(({ data: { trigger, data } }) => trigger === DomTriggerPoints.RecommendedSearch && isObject(data)),
		map(({ data: { trigger, data: { index, item, term } } }) => {
			return {
				trigger,
				index,
				item,
				term
			};
		}),
		toEvent(AnalyticsEventType.AUTOFILL_SEARCH_CLICK, payload => ({
			...getRecommendedSearchDomEvent(payload)
		})),
		withItemContext(CONTEXT, (item, ctx) => ({ ...ctx, ...item }))
	);

	const filterRequestEvent$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.FILTER_REQUEST),
		toEvent(AnalyticsEventType.FILTER_REQUEST, ({ data }) => data),
		withContext(CONTEXT)
	);

	const cwList$ = STATE.pipe(
		map(state => state && state.cache.list),
		filter(isObject)
	);

	const cwMenuUndoRemoveMultiple$ = ACTION.pipe(
		isActionOfType(UNDO_DELETE_CONTINUE_WATCHING),
		filter(({ payload }) => Array.isArray(payload.undoList) && get(payload, 'undoList').length > 1),
		map(({ payload }) => payload),
		withLatestFrom(cwList$, (data, cw) => ({ ...data, cw })),
		map(data => getUndoRemoveData(data)),
		toEvent(AnalyticsEventType.CW_MENU_UNDO_REMOVE_MULTIPLE, data => ({ ...data })),
		withContext(CONTEXT)
	);

	const cwPageEdit$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.CW_PAGE_EDIT),
		map(({ data }) => ({ ...data })),
		toEvent(AnalyticsEventType.CW_PAGE_EDIT, ({ cardTotal }) => ({ cardTotal })),
		withEntryContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	const cwPageSelectAll$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.CW_PAGE_SELECT_ALL),
		map(({ data }) => ({ ...data })),
		toEvent(AnalyticsEventType.CW_PAGE_SELECT_ALL, ({ cardTotal }) => ({ cardTotal })),
		withEntryContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	const cwPageDeselectAll$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.CW_PAGE_DESELECT_ALL),
		map(({ data }) => ({ ...data })),
		toEvent(AnalyticsEventType.CW_PAGE_DESELECT_ALL, ({ cardTotal }) => ({ cardTotal })),
		withEntryContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	const cwPageRemoveSelected$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.CTA),
		isCTAType(CTATypes.RemoveSelected),
		map(({ data }) => ({ ...data })),
		toEvent(AnalyticsEventType.CW_PAGE_REMOVE_SELECTED, ({ data }) => ({ ...data })),
		withEntryContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	const entryInteracted$ = DOM_EVENT.pipe(
		isEventOfSource(DomEventSourceType.Entry),
		isEventOfType(EventName.HSCROLL),
		toEvent(AnalyticsEventType.ENTRY_INTERACTED),
		withEntryContext(CONTEXT, ({ data: { entry } }, ctx) => ({ ...ctx, entry }))
	);

	const entryViewed$ = DOM_EVENT.pipe(
		isEventOfSource(DomEventSourceType.Entry),
		isEventOfType(EventName.VIEWED),
		toEvent(AnalyticsEventType.ENTRY_VIEWED),
		withEntryContext(CONTEXT, ({ data: { entry } }, ctx) => ({ ...ctx, entry }))
	);

	const railHeaderClick$ = DOM_EVENT.pipe(
		isEventOfType(EventName.CLICK),
		isEventOfSource(DomEventSourceType.RailHeader),
		toEvent(AnalyticsEventType.RAIL_HEADER_CLICKED),
		withEntryContext(CONTEXT, ({ data: { entry } }, ctx) => ({ ...ctx, entry }))
	);

	const bannerClicked$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.BANNER_CLICKED),
		toEvent(AnalyticsEventType.BANNER_CLICKED, ({ data: { payload } }) => ({ ...payload })),
		withContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	const bannerClosed$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.BANNER_CLOSED),
		toEvent(AnalyticsEventType.BANNER_CLOSED, ({ data: { payload } }) => ({ ...payload })),
		withContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	const bannerShown$ = ACTION.pipe(
		isActionOfType(ANALYTICS_EVENT),
		map(({ payload }) => payload),
		filter(({ event }) => event === AnalyticsEventType.BANNER_SHOWN),
		toEvent(AnalyticsEventType.BANNER_SHOWN, ({ data: { payload } }) => ({ ...payload })),
		withContext(CONTEXT, (data, ctx) => ({ ...ctx, ...data }))
	);

	return {
		EVENT: merge(
			pageSummaryViewed$,
			pageViewed$,
			idpPage$,
			myListPage$,
			listingPage$,
			watchPage$,
			entryInteracted$,
			entryViewed$,
			filterRequestEvent$,
			cwPageEdit$,
			cwPageSelectAll$,
			cwPageDeselectAll$,
			cwPageRemoveSelected$,
			cwMenuUndoRemoveMultiple$,
			searchEvent$,
			enhancedSearchEvent$,
			recommendedSearchEvent$,
			railHeaderClick$,
			bannerClicked$,
			bannerClosed$,
			bannerShown$
		)
	};
};
