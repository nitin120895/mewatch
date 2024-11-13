import { isAnonymousProfile } from 'shared/account/profileUtil';
import { getEmptyNavListKeys, getEmptySecureNavLists } from 'shared/app/navUtil';
import { handlePlayerNextItemError, NEXT_PLAYBACK_ITEM } from 'shared/app/playerWorkflow';
import { updateQueryParams } from 'shared/app/requestProcessor';
import {
	GET_ENHANCED_SEARCH_LISTS,
	GET_ENHANCED_SEARCH_LISTS_START,
	getEnhancedSearchLists
} from 'shared/enhancedSearch/enhancedSearchWorkflow';
import {
	Bookmarks as bookmarksListId,
	ContinueWatching as continueWatchingListId,
	ContinueWatchingAnonymous as continueWatchingListAnonymousListId,
	Watched as watchedListId,
	SearchResults
} from 'shared/list/listId';
import {
	createListVariant,
	getBoostRecommendations,
	getEmptyPageEntryListKeys,
	getEmptySecurePageEntryLists,
	getListKey,
	getListOptions,
	getNextListPageNo,
	getZoomRecommendations,
	isBoostRecommendationList,
	isListLoaded,
	isPersonalizedList,
	isRecommendationList,
	isZoomRecommendationList,
	listLoadStart,
	listLoadEnd,
	shouldLoadListPage,
	WIDGET_ID_BOOST,
	WIDGET_ID_ZOOM,
	getNextEnhanceSearchListPageNo,
	shouldLoadEnhanceSearchListPage
} from 'shared/list/listUtil';
import { SeasonDetail, EpisodeDetail, Watch, ESearch, Search } from 'shared/page/pageKey';
import { getPathByKey } from 'shared/page/sitemapLookup';
import {
	getAnonymousContinueWatchingList,
	GET_ANONYMOUS_CONTINUE_WATCHING_LIST,
	GET_ANONYMOUS_CONTINUE_WATCHING_LIST_START
} from 'shared/service/action/anonymous';
import { getList, GET_LIST, getLists, GET_LISTS, GET_LIST_START, GET_LISTS_START } from 'shared/service/action/content';
import {
	getBookmarkList,
	GET_BOOKMARK_LIST,
	GET_BOOKMARK_LIST_START,
	getContinueWatchingList,
	GET_CONTINUE_WATCHING_LIST,
	GET_CONTINUE_WATCHING_LIST_START,
	getWatchedList,
	GET_WATCHED_LIST,
	GET_WATCHED_LIST_START
} from 'shared/service/action/profile';
import { copy, get } from 'shared/util/objects';
import DeviceModel from 'shared/util/platforms/deviceModel';
import { getUpdatedItem } from 'toggle/responsive/page/item/itemUtil';

export const ASSOCIATE_LIST_WITH_PAGE = 'list/ASSOCIATE_LIST_WITH_PAGE';
export const REMOVE_LIST = 's/profile/REMOVE_LIST';
export const GET_LIST_FROM_CACHE = 's/profile/GET_LIST_FROM_CACHE';
export const GET_SEARCH_LIST_FROM_CACHE = 's/profile/GET_SEARCH_LIST_FROM_CACHE';

/**
 * How many lists to load under a single request.
 *
 * Striking a balance between speed of call and latency of excess roundtrips.
 */
const LIST_BATCH_SIZE = 5;

/**
 * Paging size for item lists.
 */
const LIST_PAGE_SIZE = _TV_ ? 24 : 12;

/**
 * Paging size for recommmendation item lists.
 */
const RECOMMENDATION_LIST_PAGE_SIZE = 24;

/**
 * Paging Size for continue watching Page
 */
const CW_PAGE_SIZE = 24;

/**
 * Find all lists in a page which are not loaded and load them.
 *
 * We do this in a batch request to load content below the fold.
 * All content above the fold should have been returned in the
 * request for the Page.
 */
export function populatePageLists(page?: api.Page) {
	return (dispatch, getState) => {
		const state: state.Root = getState();
		page = page || getCurrentPage(state);
		if (page.key === Search || page.key === ESearch) {
			// search page lists are handled as a group via the search endpoint
			return Promise.resolve();
		}
		return Promise.all<any>([populateStandardLists(page, dispatch, state), populateUserLists(page, dispatch, state)]);
	};
}

export function populatePageUserLists(page?: api.Page, sortOptions?: any) {
	return (dispatch, getState) => {
		const state: state.Root = getState();
		page = page || getCurrentPage(state);
		return populateUserLists(page, dispatch, state, sortOptions);
	};
}

function getCurrentPage(state: state.Root): api.Page {
	return state.cache.page[state.page.history.location.pathname] as api.Page;
}

function populateStandardLists(page: api.Page, dispatch, state: state.Root) {
	let listKeys = getEmptyPageEntryListKeys(state, page);
	const options = updateQueryParams({}, getFilterWithDefaultSegment(state), false);
	const requests = [];
	// Sending off all batch requests in parallel seems to work best.
	// Worth keeping an eye on this as we may want to sequence
	// N batch requests in future if there are a lot of list entry rows.
	// Note that we divide these into batch requests to speed
	// up response times. Doing them in a single batch can take too long.
	while (listKeys.length) {
		const batchListKeys = listKeys.splice(0, LIST_BATCH_SIZE);
		requests.push(dispatch(getLists(batchListKeys, options, { listKeys: batchListKeys })));
	}
	return requests.length ? Promise.all(requests) : Promise.resolve();
}

function populateUserLists(page: api.Page, dispatch, state: state.Root, sortOptions?: any) {
	const lists = getEmptySecurePageEntryLists(state, page);
	return Promise.all(
		lists.map(list => {
			const options = {
				template: undefined,
				...sortOptions
			};
			const entry = page.entries.find(entry => {
				const entryListId = get(entry, 'list.id');
				if (!entryListId) return false;
				return list.id === entryListId;
			});
			if (entry) options.template = entry.template;
			return dispatch(loadListPage(list, 1, options));
		})
	);
}

export function loadNextListPage(list: api.ItemList) {
	return (dispatch, getState) => {
		const state: state.Root = getState();
		const eSearchPath = getPathByKey(ESearch, state.app.config);
		const currentPath = get(state, 'page.history.location.pathname');
		const isESearchPath = eSearchPath === currentPath;
		const pageNo = isESearchPath ? getNextEnhanceSearchListPageNo(state, list) : getNextListPageNo(state, list);

		if (pageNo !== -1) {
			return dispatch(loadListPage(list, pageNo));
		}
	};
}

export function loadListPage(list: api.ItemList, pageNo: number, options?) {
	return (dispatch, getState) => {
		let state: state.Root = getState();

		let opts = getListOptions(list, options) || {};
		opts = updateQueryParams(opts, getFilterWithDefaultSegment(state), false);
		opts.page = pageNo;

		let targetList = list;
		const currentPath = get(state, 'page.history.location.pathname');
		const pageKey = currentPath && state.cache.page[currentPath] && state.cache.page[currentPath].key;
		if (list.id === SearchResults || pageKey === ESearch) {
			const baseUrl = process.env.CLIENT_SERVICE_URL;
			const nextPageUrl = get(list, 'paging.next');
			const url = `${baseUrl}${nextPageUrl}`;
			const key = list.key;
			if (key) {
				if (state.cache.enhanceSearch[key]) {
					targetList = state.cache.enhanceSearch[key].list;
				}
			}

			if (!shouldLoadEnhanceSearchListPage(state, targetList, pageNo)) {
				dispatch({ type: GET_SEARCH_LIST_FROM_CACHE, payload: targetList });
			}
			// Call search/lists api with api paging next url
			if (nextPageUrl) {
				return dispatch(getEnhancedSearchLists(url, { pageNo }));
			}
		}
		const key = options ? getListKey(list, opts) : list.key;
		if (key !== list.key) {
			if (state.cache.list[key]) {
				targetList = state.cache.list[key].list;
			} else {
				targetList = createListVariant(list, opts, key);
				dispatch(associateListWithPage(targetList, opts.pageRefId));
				state = getState();
			}
		}

		if (!shouldLoadListPage(state, targetList, pageNo, true)) {
			dispatch({ type: GET_LIST_FROM_CACHE, payload: targetList });
		}

		if (isRecommendationList(list)) {
			let currentUrl = get(state, 'page.history.location.pathname');
			const page = state.cache.page[currentUrl];

			if (currentUrl && page) {
				const { key } = page;

				if ([SeasonDetail, EpisodeDetail].indexOf(key) >= 0) {
					const showId = get(page, 'item.showId');
					const itemCache = get(state, 'cache.itemDetail');
					const show = itemCache[showId] || undefined;
					const showPath = get(show, 'item.path');

					if (showPath) currentUrl = showPath;
				}
			}

			const item = get(page, 'item');

			if (isZoomRecommendationList(opts)) {
				const zoomWidgetId = get(list, `customFields.${WIDGET_ID_ZOOM}`);
				const personalisationSettingsRequired =
					get(list, 'customFields.personalisationSettingsRequired') || isPersonalizedList(opts);
				const recommendationOptions =
					personalisationSettingsRequired && get(state, 'profile.info.recommendationSettings');
				if (recommendationOptions) {
					const audioLanguages = get(recommendationOptions, 'languages');
					recommendationOptions.audioLanguages = audioLanguages;
				}
				opts.pageSize = LIST_PAGE_SIZE;

				dispatch(
					getZoomRecommendations(
						zoomWidgetId,
						{
							...(recommendationOptions || {}), // genreAliases, credits, languages
							page: pageNo,
							currentUrl
						},
						item
					)
				);
			} else if (isBoostRecommendationList(opts) && page.key !== Watch) {
				/*
				Skip early api call on Watch page as we only need to call recommendations api 
				when End of Play screen is shown

				Prevents duplicate boost recommendation api call on Watch page
			*/
				opts.pageSize = RECOMMENDATION_LIST_PAGE_SIZE;

				const isEpisodeDetailPage = page.key === EpisodeDetail;
				const isEndofPlayback = false;
				const boostId = get(list, `customFields.${WIDGET_ID_BOOST}`);
				return dispatch(getBoostRecommendations(boostId, opts, item, isEndofPlayback, isEpisodeDetailPage));
			}
		} else if (list.id === watchedListId) {
			opts.pageSize = LIST_PAGE_SIZE;
			opts.orderBy = 'date-modified';
			return dispatch(getWatchedList(opts as any, { listKey: list.key, pageNo }));
		} else if (list.id === bookmarksListId) {
			opts.pageSize = LIST_PAGE_SIZE;
			return dispatch(getBookmarkList(opts, { listKey: list.key, pageNo }));
		} else if (list.id === continueWatchingListId) {
			opts.pageSize = CW_PAGE_SIZE;
			return dispatch(
				getContinueWatchingList(
					{ ...opts, showItemType: 'episode', include: ['show', 'season'] },
					{ listKey: list.key, pageNo }
				)
			);
		} else if (list.id === continueWatchingListAnonymousListId) {
			if (_SSR_) {
				return;
			}
			opts.pageSize = CW_PAGE_SIZE;
			return dispatch(
				getAnonymousContinueWatchingList(
					{ ...opts, showItemType: 'episode', include: ['show', 'season'] },
					{ listKey: list.key, pageNo }
				)
			);
		} else {
			return dispatch(getList(list.id, opts, { listKey: list.key, pageNo }));
		}
	};
}

export function associateListWithPage(list: api.ItemList, pageRefId: string) {
	return { type: ASSOCIATE_LIST_WITH_PAGE, payload: { list, pageRefId } };
}

export function populateNavLists() {
	return (dispatch, getState) => {
		const state: state.Root = getState();
		const options = updateQueryParams({}, getFilterWithDefaultSegment(state), false);
		const standardListKeys = getEmptyNavListKeys(state);
		const secureLists = getEmptySecureNavLists(state);
		const requests = secureLists.map(list => dispatch(loadListPage(list, 1)));
		if (standardListKeys.length) {
			requests.push(dispatch(getLists(standardListKeys, options, { listKeys: standardListKeys })));
		}
		return requests.length ? Promise.all(requests) : Promise.resolve();
	};
}

export function getEmptyBookmarkList(): any {
	return dispatch => {
		dispatch({
			type: GET_BOOKMARK_LIST,
			payload: {
				id: 'Bookmarks',
				title: 'Bookmarks',
				items: [],
				paging: {
					page: 1,
					size: 12,
					total: 0
				},
				size: 0
			},
			meta: {
				info: {
					listKey: 'Bookmarks',
					pageNo: 1
				}
			}
		});
	};
}

export function removeList(listId: string) {
	return { type: REMOVE_LIST, payload: listId };
}

export function updateContinueWatchingList() {
	return (dispatch, getState) => {
		const state: state.Root = getState();
		const { account, profile } = state;
		const isAnonymous = isAnonymousProfile(profile);
		const getContinueWatchingListAction = isAnonymous ? getAnonymousContinueWatchingList : getContinueWatchingList;
		const listKey = isAnonymous ? continueWatchingListAnonymousListId : continueWatchingListId;
		const deviceType = DeviceModel.deviceInfo().type;
		const options = {
			device: deviceType,
			page: 1,
			pageSize: CW_PAGE_SIZE,
			sub: get(account, 'info.subscriptionCode'),
			segments: isAnonymous ? ['all'] : get(profile, 'info.segments')
		};

		dispatch(
			getContinueWatchingListAction(
				{ ...options, showItemType: 'episode', include: ['show', 'season'] },
				{ listKey, pageNo: 1 }
			)
		);
	};
}

// REDUCERS

const initState = {
	loading: <state.ListsLoadingMap>{}
};

export default function reduceList(state: state.List = initState, action): state.List {
	switch (action.type) {
		case GET_LIST_START:
		case GET_BOOKMARK_LIST_START:
		case GET_WATCHED_LIST_START:
		case GET_CONTINUE_WATCHING_LIST_START:
		case GET_ANONYMOUS_CONTINUE_WATCHING_LIST_START:
		case GET_ENHANCED_SEARCH_LISTS_START:
			return reduceListLoadStart(state, action);

		case GET_LIST:
		case GET_BOOKMARK_LIST:
		case GET_WATCHED_LIST:
		case GET_CONTINUE_WATCHING_LIST:
		case GET_ANONYMOUS_CONTINUE_WATCHING_LIST:
		case GET_ENHANCED_SEARCH_LISTS:
			return reduceListLoadEnd(state, action);

		case GET_LISTS_START:
			return reduceListsLoadStart(state, action);
		case GET_LISTS:
			return reduceListsLoadEnd(state, action);
		default:
			return state;
	}
}

/**
 * Record an individual list which has began loading a page of items.
 */
function reduceListLoadStart(state: state.List, action: Action<any>): state.List {
	const loading = copy(state.loading);
	const { listKey, pageNo } = action.meta.info;
	listLoadStart(loading, listKey, pageNo);
	return copy(state, { loading });
}

/**
 * Remove an individual list which has finished loading a page of items.
 */
function reduceListLoadEnd(state: state.List, action: Action<GET_LIST>): state.List {
	const loading = copy(state.loading);
	const { listKey, pageNo } = action.meta.info;
	listLoadEnd(loading, listKey, pageNo);
	return copy(state, { loading });
}

/**
 * Record each list in batch load which has begin to load its first page.
 */
function reduceListsLoadStart(state: state.List, action: Action<any>): state.List {
	const listKeys = action.meta.info.listKeys;
	const loading = listKeys.reduce((loading, listKey) => {
		return listLoadStart(loading, listKey, 1);
	}, copy(state.loading));
	return copy(state, { loading });
}

/**
 * Remove each list in batch load which has finished loading its first page.
 */
function reduceListsLoadEnd(state: state.List, action: Action<GET_LISTS>): state.List {
	const listKeys = action.meta.info.listKeys;
	const loading = listKeys.reduce((loading, listKey) => {
		return listLoadEnd(loading, listKey, 1);
	}, copy(state.loading));
	return copy(state, { loading });
}

export function getNextItemFromXT1(site: string, itemId: string, key: number | string) {
	return (dispatch, getState) => {
		const state: state.Root = getState();
		const listCache = get(state.cache, 'list');
		const list = get(listCache[key], 'list');

		if (list) {
			if (list.items && list.items.length > 0) {
				const itemIndex = list.items.findIndex(item => item.id === itemId);
				const notFound = itemIndex > -1;
				if (notFound) {
					const nextItemIndex = itemIndex + 1;
					if (nextItemIndex < list.items.length) {
						const cacheItem = list.items[nextItemIndex];
						return getUpdatedItem(cacheItem.id).then(nextItem =>
							dispatch({
								type: NEXT_PLAYBACK_ITEM,
								payload: { site, nextItem }
							})
						);
					}
				}
				if (isListLoaded(list) || notFound) {
					dispatch(handlePlayerNextItemError(site));
				} else {
					dispatch(loadNextListPage(list)).then(() => dispatch(getNextItemFromXT1(site, itemId, key)));
				}
			}
		} else {
			const listSeg = key && key.toString().split('|');
			const id = listSeg && listSeg.length && listSeg[0];
			if (id) {
				dispatch(getList(id, {}, { listKey: key, pageNo: 1 })).then(res => {
					dispatch(associateListWithPage(res.payload, undefined)).then(dispatch(getNextItemFromXT1(site, itemId, id)));
				});
			} else {
				dispatch(handlePlayerNextItemError(site));
			}
		}
	};
}

export function getFilterWithDefaultSegment(state: state.Root) {
	const segments = state.app.config.general.defaultSegmentationTags;
	return { ...state.app.contentFilters, segments };
}
