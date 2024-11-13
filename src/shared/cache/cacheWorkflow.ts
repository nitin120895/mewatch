import { HARD_REFRESH } from '../app/appWorkflow';
import { PAGE_CHANGE, GET_PAGE_DETAIL, GET_PAGE_SUMMARY } from '../page/pageWorkflow';
import { PLACEHOLDER_PAGE_ID } from '../page/pageUtil';
import { ASSOCIATE_LIST_WITH_PAGE, GET_LIST_FROM_CACHE, GET_SEARCH_LIST_FROM_CACHE } from 'shared/list/listWorkflow';
import { GET_APP_CONFIG } from '../service/action/app';
import { genId } from '../util/strings';
import {
	normalizeList,
	normalizeLists,
	normalizeNavLists,
	updateListPageRefs,
	updateListPage,
	normalizeEsearchLists,
	updateEnhanceSearchListPage
} from 'shared/cache/listNormalizer';
import {
	updateSearchLists,
	SEARCH_RESULTS_CACHE_LIMIT,
	MOVIES_LIST_ID,
	TV_LIST_ID,
	SPORTS_LIST_ID,
	EXTRAS_LIST_ID
} from './searchNormalizer';
import { normalizeItemDetail, updateItemDetailPageRefs } from './itemDetailNormalizer';
import {
	getItem,
	GET_LIST,
	GET_LISTS,
	SEARCH,
	GET_ANONYMOUS_NEXT_PLAYBACK_ITEM_START as GET_ANON_NEXT_PLAYBACK_ITEM_START,
	GET_ANONYMOUS_NEXT_PLAYBACK_ITEM as GET_ANON_NEXT_PLAYBACK_ITEM,
	GET_BOOST_RECOMMENDATIONS_LIST,
	GET_RECOMMENDATIONS_LIST,
	GET_ZOOM_RECOMMENDATIONS_LIST
} from 'shared/service/action/content';
import { GET_ENHANCED_SEARCH_LISTS } from 'shared/enhancedSearch/enhancedSearchWorkflow';
import {
	GET_BOOKMARK_LIST,
	GET_WATCHED_LIST,
	GET_CONTINUE_WATCHING_LIST,
	BOOKMARK_ITEM,
	DELETE_ITEM_BOOKMARK,
	GET_NEXT_PLAYBACK_ITEM,
	GET_NEXT_PLAYBACK_ITEM_START,
	DELETE_ITEM_BOOKMARKS,
	DELETE_CONTINUE_WATCHING
} from '../service/action/profile';
import { copy, get } from '../util/objects';
import { itemDetailTemplate } from '../page/pageTemplate';
import { findPageSummaryByKey } from '../page/sitemapLookup';
import { getListKey, listParamsToOptions, createListVariant, SORT_OPTIONS_LOOKUP } from 'shared/list/listUtil';
import { Bookmarks as bookmarksListId, ContinueWatching as continueWatchingListId } from '../list/listId';
import { DELETE_ANONYMOUS_CONTINUE_WATCHING, GET_ANONYMOUS_CONTINUE_WATCHING_LIST } from '../service/action/anonymous';
import { ESearch } from 'shared/page/pageKey';
import { getQueryParams } from 'shared/util/urls';

const CLEAR_CACHE = 'cache/CLEAR_CACHE';
const CLEAR_NEXT_ITEM_CACHE = 'cache/CLEAR_NEXT_ITEM_CACHE';
const GET_SEASON_DETAIL = 'cache/GET_SEASON_DETAIL';
export const REMOVE_NEXT_ITEM = 'cache/REMOVE_NEXT_ITEM';
export const REMOVE_LIST_CACHE = 'cache/REMOVE_LIST_CACHE';
export const NORMALIZE_NAV_LISTS = 'cache/NORMALIZE_NAV_LISTS';
export const GET_ENHANCE_SEARCH_CACHE_CLEAR = 'cache/GET_ENHANCE_SEARCH_CACHE_CLEAR';
export function clearCache() {
	return { type: CLEAR_CACHE };
}

export function clearNextItemCache() {
	return { type: CLEAR_NEXT_ITEM_CACHE };
}

export function getSeasonDetail(itemId: string) {
	return dispatch => {
		return dispatch(getItem(itemId, { expand: 'all', device: process.env.CLIENT_DEVICE_PLATFORM })).then(response => {
			const { payload, error, meta } = response;
			dispatch({ type: GET_SEASON_DETAIL, payload, error, meta });
		});
	};
}

export function removeNextItem(itemId: string) {
	return { type: REMOVE_NEXT_ITEM, payload: itemId };
}

export function removeListCache(listId: string) {
	return { type: REMOVE_LIST_CACHE, payload: listId };
}

export function doNormalizeNavLists(navigation: api.Navigation) {
	return { type: NORMALIZE_NAV_LISTS, payload: navigation };
}

export function startedPlaying(item: api.ItemDetail): any {
	return (dispatch, getState) => {
		const { type, showId } = item;

		// if an episode started, let's clear it from get next item cache
		if (type === 'episode') dispatch(removeNextItem(showId));

		dispatch(doNormalizeNavLists(get(getState(), 'app.config.navigation')));
	};
}

export function resumePointChanged(item: api.ItemDetail, isFullyWatched: boolean) {
	return (dispatch, getState) => {
		const { type, showId } = item;

		// remove next item from cache for show, if an episode is fully watched
		if (isFullyWatched && type === 'episode') dispatch(removeNextItem(showId));

		// remove continue watching list from cache in case video content is fully watched
		if (isFullyWatched) {
			dispatch(removeListCache(continueWatchingListId));
			dispatch(doNormalizeNavLists(get(getState(), 'app.config.navigation')));
		}
	};
}

const initState: state.Cache = {
	page: {},
	list: {},
	itemDetail: {},
	nextItem: {},
	search: {
		recentResults: [],
		recentResultsUngrouped: []
	},
	pathHistory: [],
	index: 0,
	enhanceSearch: {}
};

export default function reduceCache(state: state.Cache = initState, action: Action<any>): state.Cache {
	if (action.error) return state;

	switch (action.type) {
		case PAGE_CHANGE:
			return reducePageHistoryPaths(state, action);

		case GET_APP_CONFIG:
			return reduceGetAppConfig(state, action);

		case GET_PAGE_SUMMARY:
			return reducePageSummary(state, action);
		case GET_PAGE_DETAIL:
			return reducePageDetail(state, action);
		case GET_SEASON_DETAIL:
			return reduceSeasonDetail(state, action);
		case GET_LISTS:
			return reduceLists(state, action);
		case HARD_REFRESH:
		case CLEAR_CACHE:
			return reduceClearCache(state);

		case GET_LIST:
		case GET_WATCHED_LIST:
		case GET_BOOKMARK_LIST:
		case GET_LIST_FROM_CACHE:
		case GET_RECOMMENDATIONS_LIST:
		case GET_BOOST_RECOMMENDATIONS_LIST:
		case GET_ZOOM_RECOMMENDATIONS_LIST:
		case GET_CONTINUE_WATCHING_LIST:
		case GET_ANONYMOUS_CONTINUE_WATCHING_LIST:
			return reduceList(state, action);
		case GET_ENHANCED_SEARCH_LISTS:
		case GET_SEARCH_LIST_FROM_CACHE:
			return reduceEnhanceSearchList(state, action);
		case ASSOCIATE_LIST_WITH_PAGE:
			return reduceAssociateListWithPage(state, action);
		case BOOKMARK_ITEM:
		case DELETE_ITEM_BOOKMARK:
		case DELETE_ITEM_BOOKMARKS:
			return reduceBookmarkChange(state, action);

		case DELETE_CONTINUE_WATCHING:
		case DELETE_ANONYMOUS_CONTINUE_WATCHING:
			return reduceDeleteContinueWatching(state, action);

		case SEARCH:
			return reduceSearch(state, action);
		case REMOVE_LIST_CACHE:
			return reduceRemoveList(state, action);
		case GET_ANON_NEXT_PLAYBACK_ITEM:
		case GET_NEXT_PLAYBACK_ITEM:
			return reduceNextItemCache(state, action);
		case GET_ANON_NEXT_PLAYBACK_ITEM_START:
		case GET_NEXT_PLAYBACK_ITEM_START:
			return reduceNextItemStartCache(state, action);
		case CLEAR_NEXT_ITEM_CACHE:
			return reduceClearNextItemCache(state);
		case REMOVE_NEXT_ITEM:
			return reduceRemoveNextItem(state, action);
		case NORMALIZE_NAV_LISTS:
			return reduceNormalizeNavLists(state, action);
		case GET_ENHANCE_SEARCH_CACHE_CLEAR:
			return reduceEnhanceSearchClear(state, action);
		default:
			return state;
	}
}

function reduceGetAppConfig(state: state.Cache, action: Action<GET_APP_CONFIG>) {
	if (!action.payload.navigation) return state;

	// Store search page path in cache state
	const pagePath = findPageSummaryByKey('Search', action.payload).path;
	const search = copy(state.search, { pagePath });
	// Normalize nav content lists into list cache
	const list = copy(state.list);
	normalizeNavLists(list, action.payload.navigation);

	return copy(state, { search, list });
}

/**
 * Maintain a list of page paths in our history.
 *
 * This mimics similar information stored over in the page state
 * but we store here in a lesser form for our own purposes when
 * pruning orphaned cache data.
 *
 * Storing here helps us avoid the situation where we attempt to access
 * another part of the state graph from the cache, which would cause
 * tighter coupling and mean a reference to the store was
 * most likely needed, causing issues for server side rendering.
 */
function reducePageHistoryPaths(state: state.Cache, action: Action<HistoryLocation>) {
	const location = action.payload;
	const index = location.index;
	let pathHistory;
	if (location.action === 'PUSH') {
		// remove any orphaned page paths
		pathHistory = state.pathHistory.slice(0, index);
	} else {
		pathHistory = state.pathHistory.slice();
	}
	pathHistory[index] = location.pathname;

	return copy(state, { pathHistory, index });
}

/**
 * When a user navigates to a page which is static so does not require content
 * to be loaded (e.g. the sign-in page), we store the page summary, found in the
 * sitemap, in cache. This allows us to uniformly present pages found in cache and
 * gives a clear indication of which pages are active in the browser history.
 *
 * When a new page is entered into cache we purge any orphaned page and lists
 * that are no longer referenced in our navigation history.
 *
 * By purging our local cache of orphaned entries we allow future "pushed" pages
 * to be loaded via the browser, which can then adhere to the cache control
 * lifespans set by the server on feed responses i.e. it may still serve from
 * browser cache if a previously loaded feed has not expired.
 */
function reducePageSummary(state: state.Cache, action: Action<api.PageSummary>): state.Cache {
	const page = assignPageIds(action.payload as api.Page);
	const pageState = copy(state.page, { [page.path]: page });
	const listState = copy(state.list);
	state = copy(state, { list: listState, page: pageState });
	state = pruneOrphanedEntries(state);
	return state;
}

/**
 * Update our page cache with a loaded page and purge any orphaned pages.
 *
 * When a new page is entered into cache we purge any orphaned page and lists
 * that are no longer referenced in our navigation history.
 *
 * By purging our local cache of orphaned entries we allow future "pushed" pages
 * to be loaded via the browser, which can then adhere to the cache control
 * lifespans set by the server on feed responses i.e. it may still serve from
 * cache if a previously loaded feed has not expired.
 */
function reducePageDetail(state: state.Cache, action: Action<api.Page>): state.Cache {
	const page = assignPageIds(action.payload);
	const pageCache = copy(state.page, { [page.path]: page });
	state = copy(state, { page: pageCache });

	if (page.key === ESearch) {
		const query = getQueryParams();
		if (query) {
			const term = action.meta.term || query.q;
			state = reduceEnhanceSearchListCache(state, page, term);
		} else {
			state = reduceEnhanceSearchClear(state, action);
		}
	} else {
		state = reduceListCache(state, page, action.meta.info);
	}
	state = reduceItemDetailCache(state, page);

	// For search page we want to sync up our previous result state
	// for the given search term so when moving around in the
	// history stack we retain the correct results
	if (page.key === 'Search' && action.meta.info) {
		const location = action.meta.info;
		const term = location.query.q;

		// When a search page is deeplinked to we pull out the
		// embedded results and add them to our recent search history
		if (page.customFields && page.customFields['term'] === term) {
			state = reduceSearchPageLists(state, page);
		}

		const result = state.search.recentResults.find(result => result.term === term);
		if (result) {
			state = updateSearchLists(state, result);
			page.customFields['refresh'] = false;
		} else {
			state = updateSearchLists(state);
			page.customFields['refresh'] = !!term;
		}
	}

	if (page.id !== PLACEHOLDER_PAGE_ID) {
		// Only prune entries when we have a genuine page detail and
		// not a temporary one used to maintain UI state between page loads
		state = pruneOrphanedEntries(state);
	}

	return state;
}

function reduceSeasonDetail(state: state.Cache, action: Action<api.ItemDetail>) {
	let { itemDetail } = state;
	const item = action.payload;
	const { showId } = item;
	const episodes = item.episodes && item.episodes.items;
	const pageRefs = itemDetail[showId].pageRefs;
	let showItemChilds = itemDetail[showId].childIds;

	if (episodes && episodes.length > 0) {
		episodes.forEach(episode => {
			showItemChilds = copy(showItemChilds, { [episode.id]: episode });
		});
		itemDetail[showId] = copy(itemDetail[showId], { childIds: showItemChilds });
		itemDetail = copy(itemDetail, { [item.id]: { pageRefs, item, childIds: undefined } });
		state = copy(state, { itemDetail });
	}

	return state;
}

/**
 * Give each page entry a unique id we can use for a key when rendering in React
 */
function assignPageIds(page: api.Page): api.Page {
	if (!page.refId) page.refId = _SERVER_ ? page.path : genId();
	if (page.entries) {
		page.entries.forEach((entry, i) => {
			if (!entry.id) {
				entry.id = _SERVER_ ? `entry${i}` : genId();
			}
		});
	}
	return page;
}

/**
 * Update list cache from list page entries.
 *
 * We track references to each list so we know later when we can purge unreferenced ones.
 */
function reduceListCache(state: state.Cache, page: api.Page, location?: HistoryLocation): state.Cache {
	if (!page.entries.length) return state;

	const listCache = (state.list = copy(state.list));
	normalizeLists(listCache, page);

	if (page.list) {
		normalizeList(listCache, page.refId, page.list);
		const locationQuery = get(location, 'query');
		let query = locationQuery && Object.keys(locationQuery).length ? locationQuery : undefined;
		let options;

		if (query) {
			query = copy(query);
			const order = query['order'];
			delete query.order;
			options = copy(listParamsToOptions(query), SORT_OPTIONS_LOOKUP[order]);
		}
		let key = getListKey(page.list, options);
		if (listCache[key]) {
			page.list = listCache[key].list;
		} else {
			page.list = createListVariant(page.list, undefined, key);
		}
		normalizeList(listCache, page.refId, page.list);
	}

	return state;
}

/**
 * Update enhance search list cache from list page entries.
 *
 * We track references to each list so we know later when we can purge unreferenced ones.
 */
function reduceEnhanceSearchListCache(state: state.Cache, page: api.Page, term?: string): state.Cache {
	if (!page.entries.length) return state;
	const listCache = (state.enhanceSearch = copy(state.enhanceSearch));
	normalizeEsearchLists(listCache, page);
	return copy(state, {
		enhanceSearch: {
			...state.enhanceSearch,
			term,
			loading: false // Set loading state to false after search API call completes
		}
	});
}

function pruneOrphanedEntries(state: state.Cache) {
	state = pruneOrphanedPages(state);
	state = pruneOrphanedLists(state);
	state = pruneOrphanedItemDetails(state);
	return state;
}

/**
 * Check if any of the cached pages are no longer referenced in our history.entries,
 * if so then purge from local cache.
 */
function pruneOrphanedPages(state: state.Cache) {
	const pathHistory = state.pathHistory;

	for (let path in state.page) {
		if (!pathHistory.some(p => p === path)) {
			const page = <api.Page>state.page[path];
			updateListPageRefs(state.list, page);
			updateItemDetailPageRefs(state.itemDetail, page);
			(page.entries || []).forEach(entry => {
				// remove any refs to normalized content so the page can be GCd
				entry.list = undefined;
				entry.item = undefined;
			});
			delete state.page[path];
		}
	}
	return state;
}

/**
 * Remove any cached lists which have no pages referencing them.
 */
export function pruneOrphanedLists(state: state.Cache) {
	const listCache = state.list;
	for (let id in listCache) {
		if (!listCache[id].pageRefs.length) {
			delete listCache[id];
		}
	}
	return state;
}

function pruneOrphanedItemDetails(state: state.Cache) {
	const itemDetailCache = state.itemDetail;
	for (let id in itemDetailCache) {
		if (!itemDetailCache[id].pageRefs.length) {
			delete itemDetailCache[id];
		}
	}
	return state;
}

function reduceClearCache(state: state.Cache): state.Cache {
	const pathHistory = state.pathHistory.slice();
	return copy(initState, { pathHistory });
}

function reduceLists(state: state.Cache, action: Action<api.ItemList[]>) {
	const listCache = copy(state.list);
	action.payload.forEach(list => updateListPage(listCache, list));
	return copy(state, { list: listCache });
}

function reduceList(state: state.Cache, action: Action<api.ItemList>) {
	const listCache = copy(state.list);
	const { id, size } = action.payload;

	// Update list size with payload data
	if (listCache.hasOwnProperty(id) && listCache[id].list && listCache[id].list.size) {
		listCache[id].list.size = size;
	}

	updateListPage(listCache, action.payload);
	return copy(state, { list: listCache });
}

function reduceEnhanceSearchList(state: state.Cache, action: any) {
	const enhanceSearchCache = copy(state.enhanceSearch);
	const payloadData = get(action, 'payload.data');
	const nextPagelist = (Array.isArray(payloadData) && payloadData[0].list) || {};
	const { size, paging, listMeta } = nextPagelist as api.ItemList;
	// Update search list size with payload data
	let key;
	const defaultKey = get(listMeta, 'searchQuery.item_types');
	if (!paging.next) {
		key = defaultKey;
	} else {
		const queryString = getQueryParams(paging.next);
		const param = 'item_types';
		key = queryString && param in queryString ? queryString[param] : defaultKey;
	}

	if (enhanceSearchCache.hasOwnProperty(key) && enhanceSearchCache[key].list && enhanceSearchCache[key].list.size) {
		enhanceSearchCache[key].list.size = size;
	}
	const updatedenhanceSearchList = {
		...nextPagelist,
		key: key
	};
	updateEnhanceSearchListPage(enhanceSearchCache, updatedenhanceSearchList);
	return copy(state, { enhanceSearch: enhanceSearchCache });
}

function reduceEnhanceSearchClear(state: state.Cache, action) {
	const currentPath = get(action, 'payload.path');
	const query = get(action, 'payload.query');
	const page = state.page[currentPath] as api.Page;
	const updatedEntries = (page.entries || []).map(entry => {
		/** From the page entries excluding the SSB1 template is of type UserEntry */
		if (entry.type === 'ListEntry') {
			return {
				...entry,
				title: '',
				list: {
					...entry.list,
					items: []
				}
			};
		}
		return entry;
	});

	const updatedPage = {
		...page,
		entries: updatedEntries
	};

	return copy(state, {
		page: {
			...state.page,
			[currentPath]: updatedPage
		},
		enhanceSearch: {
			loading: !!query
		}
	});
}

function reduceAssociateListWithPage(state: state.Cache, action: Action<any>) {
	const listCache = copy(state.list);
	let { pageRefId, list } = action.payload;
	if (!pageRefId) {
		const path = state.pathHistory[state.index];
		const page = state.page[path];
		if (!page) return state;
		pageRefId = page.refId;
	}
	normalizeList(listCache, pageRefId, list);
	return copy(state, { list: listCache });
}

function reduceItemDetailCache(state: state.Cache, page: api.Page): state.Cache {
	if (!itemDetailTemplate[page.template]) return state;
	const itemDetailCache = (state.itemDetail = copy(state.itemDetail));
	normalizeItemDetail(itemDetailCache, page);
	return state;
}

function reduceBookmarkChange(state: state.Cache, action: Action<any>) {
	if (action.type === DELETE_ITEM_BOOKMARK) {
		return removeItemFromUserList(state, bookmarksListId, action.meta.info.itemId);
	}
	return resetUserList(state, bookmarksListId);
}

function reduceDeleteContinueWatching(state: state.Cache, action: Action<any>) {
	const { itemIds, listKey } = action.meta.info;

	const listCache = copy(state.list);

	if (!listCache.hasOwnProperty(listKey)) return state;

	const entry = listCache[listKey];
	const list: api.ItemList = copy(entry.list);
	list.items = list.items.filter(item => !itemIds.includes(item.id));

	if (!list.items.length) {
		// if no items left reset list so it reloads
		return resetUserList(state, listKey);
	}

	if (list.size > 0) {
		list.size = list.size - 1;
		const total = Math.ceil(list.size / list.paging.size);
		const page = Math.ceil(list.items.length / list.paging.size);
		list.paging = copy(list.paging, { total, page });
	}

	listCache[listKey] = copy(entry, { list });

	return copy(state, { list: listCache });
}

function removeItemFromUserList(state: state.Cache, listId: string, itemId: string) {
	const keys = Object.keys(state.list).filter(key => state.list[key].list.id === listId);
	if (!keys.length) return state;
	const listCache = copy(state.list);
	for (let key of keys) {
		const entry = listCache[key];
		const list: api.ItemList = copy(entry.list);
		list.items = list.items.filter(item => item.id !== itemId);

		if (!list.items.length) {
			// if no items left reset list so it reloads
			return resetUserList(state, listId);
		}

		if (list.size > 0) {
			list.size = list.size - 1;
			const total = Math.ceil(list.size / list.paging.size);
			const page = Math.ceil(list.items.length / list.paging.size);
			list.paging = copy(list.paging, { total, page });
		}

		listCache[key] = copy(entry, { list });
	}
	return copy(state, { list: listCache });
}

// If a user list changes we clear it from cache and then reload it next time its
// needed. We could attempt to modify it in memory, but then pagination would
// be out of whack and potentially ordering too.
function resetUserList(state: state.Cache, listId: string | string[]): state.Cache {
	const keys = Object.keys(state.list).filter(key =>
		Array.isArray(listId) ? listId.indexOf(state.list[key].list.id) !== -1 : state.list[key].list.id === listId
	);
	if (!keys.length) return state;

	const listCache = copy(state.list);
	for (let key of keys) {
		const entry = listCache[key];
		const list = copy(entry.list);
		list.items = [];
		list.size = -1;
		list.paging.size = -1;
		list.paging.total = -1;
		list.paging.page = 0;
		listCache[key] = copy(entry, { list });
	}
	return copy(state, { list: listCache });
}

function reduceSearchPageLists(state: state.Cache, page: api.Page) {
	const listCache = state.list;
	const movies = listCache[MOVIES_LIST_ID] ? listCache[MOVIES_LIST_ID].list : undefined;
	const tv = listCache[TV_LIST_ID] ? listCache[TV_LIST_ID].list : undefined;
	const sports = listCache[SPORTS_LIST_ID] ? listCache[SPORTS_LIST_ID].list : undefined;
	const extras = listCache[EXTRAS_LIST_ID] ? listCache[EXTRAS_LIST_ID].list : undefined;
	const people = (page.entries.find(entry => !!entry.people) || { people: [] }).people;

	const results: api.SearchResults = {
		term: page.customFields['term'],
		total: page.customFields['total'],
		movies,
		tv,
		sports,
		extras,
		people
	};

	const recentResults = state.search.recentResults.slice();
	recentResults.push(results);
	const searchCache = copy(state.search, { recentResults });
	return copy(state, { search: searchCache });
}

function reduceSearch(state: state.Cache, action: Action<SEARCH>) {
	const newResult = action.payload;
	const { term, itemAudioLanguage } = newResult;
	const group = action.meta.info.group !== false;
	const fieldName = 'recentResults' + (group ? '' : 'Ungrouped');
	const recentResults: api.SearchResults[] = state.search[fieldName].slice();
	const i = recentResults.findIndex(result => result.term === term && result.itemAudioLanguage === itemAudioLanguage);
	if (~i) {
		// already searched for so move back to top of list
		recentResults.push(recentResults.splice(i, 1)[0]);
	} else {
		recentResults.push(newResult);
		while (recentResults.length > SEARCH_RESULTS_CACHE_LIMIT) {
			recentResults.shift();
		}
	}
	const search = copy(state.search, { [fieldName]: recentResults });
	const newState = copy(state, { search });
	return group ? updateSearchLists(newState, newResult) : newState;
}

function reduceRemoveList(state: state.Cache, action: Action<string>) {
	// Fix bug on TV platforms:
	// When the user goes back from the watch page, the user row is no longer displayed after the refresh.
	// So we should reset the user list in the listCache instead of deleting it.
	if (_TV_) return resetUserList(state, action.payload);

	const listCache = copy(state.list);
	delete listCache[action.payload];

	return copy(state, { list: listCache });
}

function reduceNormalizeNavLists(state: state.Cache, action: Action<any>) {
	const listCache = copy(state.list);

	// Normalize nav content lists into list cache
	normalizeNavLists(listCache, action.payload);

	return copy(state, { list: listCache });
}

function reduceNextItemCache(state: state.Cache, action: Action<api.NextPlaybackItem>): state.Cache {
	const { sourceItemId, next, suggestionType } = action.payload;
	const nextItemCache = copy(state.nextItem);
	nextItemCache[sourceItemId] = { checked: true, item: next, suggestionType };
	return copy(state, { nextItem: nextItemCache });
}

function reduceNextItemStartCache(state: state.Cache, action: Action<any>): state.Cache {
	if (!action.meta || !action.meta.info || !action.meta.info.itemId) return state;
	const { itemId } = action.meta.info;
	const nextItemCache = copy(state.nextItem);
	nextItemCache[itemId] = { checked: false };
	return copy(state, { nextItem: nextItemCache });
}

function reduceClearNextItemCache(state: state.Cache): state.Cache {
	return copy(state, { nextItem: {} });
}

function reduceRemoveNextItem(state: state.Cache, action: Action<string>): state.Cache {
	const nextItemCache = copy(state.nextItem);
	delete nextItemCache[action.payload];
	return copy(state, { nextItem: nextItemCache });
}
