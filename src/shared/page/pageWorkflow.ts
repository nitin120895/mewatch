import { Dispatch } from 'redux';
import { clearContinueWatchingPageState } from 'shared/account/profileWorkflow';
import { copy, get } from 'shared/util/objects';
import { ESearch, Search } from 'shared/page/pageKey';
import { ContinueWatch as continueWatchingTemplate, dynamicTemplate } from 'shared/page/pageTemplate';
import { findPageSummary, PAGE_404 } from 'shared/page/sitemapLookup';
import { getPage, GET_PAGE_START } from 'shared/service/action/app';
import { GetPageOptions } from 'shared/service/app';
import { getPageRequestData, preventScrollRestore, selectPageState } from 'shared/page/pageUtil';
import { GET_ENHANCE_SEARCH_CACHE_CLEAR } from 'shared/cache/cacheWorkflow';
import { populatePageLists } from 'shared/list/listWorkflow';
import { restoreScrollPosition as restoreScroll } from 'shared/util/browser';
import { validateLocation } from 'shared/util/urls';
import { isEnhancedSearchEnabled } from 'toggle/responsive/util/enhancedSearchUtil';

// ACTIONS

export const PAGE_CHANGE = 'page/PAGE_CHANGE';
export const PAGE_QUERY_PARAMS_UPDATE = 'page/PAGE_QUERY_PARAMS_UPDATE';
export const REFRESH_PAGE = 'page/REFRESH_PAGE';
export const GET_PAGE_SUMMARY = 'page/GET_PAGE_SUMMARY';
export const GET_PAGE_DETAIL = 'page/GET_PAGE_DETAIL';
export const REQUEST_BACK_NAVIGATION = 'page/REQUEST_BACK_NAVIGATION';
export const RESET_BACK_NAVIGATION = 'page/RESET_BACK_NAVIGATION';
export const UPDATE_SAVED_STATE = 'page/UPDATE_SAVED_STATE';
export const SET_LIST_SCROLL_POSITION = 'page/SET_LIST_SCROLL_POSITION';
export const GET_PAGE_NOT_FOUND_ERROR = 'page/GET_PAGE_NOT_FOUND_ERROR';
export const UPDATE_PAGE_ENTRY_POINT = 'page/UPDATE_PAGE_ENTRY_POINT';
export const UPDATE_PAGE_FILTER = 'page/UPDATE_PAGE_FILTER';
export const UPDATE_PAGE_FILTERS_SIZE = 'page/UPDATE_PAGE_FILTERS_SIZE';
export const UPDATE_SUBSCRIPTION_ENTRY_POINT = 'page/UPDATE_SUBSCRIPTION_ENTRY_POINT';
export const REMOVE_SUBSCRIPTION_ENTRY_POINT = 'page/REMOVE_SUBSCRIPTION_ENTRY_POINT';

export function refreshPage(): any {
	return (dispatch, getState) => {
		const state: state.Root = getState();
		const location = state.page.history.location;
		const pageSummary = findPageSummary(location.pathname, state);
		const { key, template } = pageSummary;
		const isEnhancedSearchEnabledFlag = isEnhancedSearchEnabled(state);
		const isEnhancedSearch = key === ESearch && isEnhancedSearchEnabledFlag;

		if (dynamicTemplate[template] || isEnhancedSearch) {
			return dispatch(getPageDetail(location, pageSummary));
		} else {
			return dispatch(getPageSummary(location, pageSummary));
		}
	};
}

/**
 * Notify of a change in page.
 *
 * For dynamic pages this will trigger the loading of page content if not available from cache.
 */
export const pageChange = (location: HistoryLocation) => (dispatch, getState): Dispatch<any> => {
	const state: state.Root = getState();

	// Clear Continue Watching page state if navigating away from CW page
	const currentPage = get(state, 'page.history.pageSummary');
	if (currentPage && currentPage.template === continueWatchingTemplate) {
		dispatch(clearContinueWatchingPageState());
	}

	const pageSummary = findPageSummary(location.pathname, state);
	dispatch({ type: PAGE_CHANGE, payload: location, meta: pageSummary });

	const { key, template } = pageSummary;
	const isEnhancedSearchEnabledFlag = isEnhancedSearchEnabled(state);
	const isEnhancedSearch = key === ESearch && isEnhancedSearchEnabledFlag;
	const isInvalidSearchCase =
		(key === Search && isEnhancedSearchEnabledFlag) || (key === ESearch && !isEnhancedSearchEnabledFlag);

	if (isInvalidSearchCase) {
		return; // If user bookmarks search page and loads when the isEnhancedSearchEnabledFlag is enabled or vice versa, then on render page api of search gets called before redirecting to esearch page. To avoid the case this condition was added
	}

	if (dynamicTemplate[template] || isEnhancedSearch) {
		const audio = isEnhancedSearch ? get(location, 'query.audio') : undefined; // add audio only if is enhanced search page
		return dispatch(getPageDetail(location, pageSummary, audio));
	} else {
		return dispatch(getPageSummary(location, pageSummary));
	}
};

export const filterChange = (type, value) => (dispatch, getState): Dispatch<any> => {
	return dispatch({ type: UPDATE_PAGE_FILTER, payload: { type, value } });
};

/**
 * Get the summary of a page.
 *
 * Finds a page summary from the sitemap and bundles it as its payload.
 *
 * Should be called for static pages which do not require dynamic content
 * to be loaded from the server.
 */
export function getPageSummary(location: HistoryLocation, pageSummary?: api.PageSummary): any {
	return (dispatch, getState) => {
		if (!pageSummary) {
			const state: state.Root = getState();
			pageSummary = findPageSummary(location.pathname, state);
		}
		return dispatch({
			type: GET_PAGE_SUMMARY,
			payload: pageSummary,
			meta: location
		});
	};
}

/**
 * Get the detail of a page.
 *
 * This will load the page from the server if it's not in local cache.
 *
 * Should only be called for dynamic pages i.e. pages which contain content
 * from the server like items or lists.
 */
export function getPageDetail(
	location: HistoryLocation,
	pageSummary: api.PageSummary,
	itemAudioLanguage?: GetPageOptions['itemAudioLanguage']
): any {
	return (dispatch, getState) => {
		const state: state.Root = getState();
		const page = state.cache.page[location.pathname];
		const item = page && (page['item'] as api.ItemSummary);

		// Fix bug: make sure only use item page cache if page.path === item.path
		// in case sometimes a show page returns season data from the service
		if (page && (!item || page.path === item.path)) {
			dispatch({
				type: GET_PAGE_DETAIL,
				payload: page,
				meta: { info: location }
			});
			// Lists of a page will most likely be in memory, however if some user lists
			// have been cleared, for example a bookmark list was changed, then
			// we reload these. Also if we've rendered the page on the server then
			// some of the standard lists further down the page will need loaded.
			return dispatch(populatePageLists());
		} else {
			const data = getPageRequestData(state, location, pageSummary, itemAudioLanguage);

			// For certain pages we may want to formulate a page shell to put in
			// place while we load the real page. This can help maintain visual state
			// and avoid refreshing for example in a show or season page while navigating episodes.
			if (data.tempPage) {
				dispatch({
					type: GET_PAGE_DETAIL,
					payload: data.tempPage,
					meta: { info: location }
				});
			}

			const search = location.search || '';
			return dispatch(getPage(location.pathname + search, data.options, location)).then(action => {
				action = copy(action, { type: GET_PAGE_DETAIL });
				dispatch(action); // updates our cache

				if (action.payload.status === 404) {
					return dispatch({ type: GET_PAGE_NOT_FOUND_ERROR, showPageNotFound: true });
				}

				dispatch({ type: GET_PAGE_NOT_FOUND_ERROR, showPageNotFound: false });

				if (!action.error && !_SERVER_) {
					return dispatch(populatePageLists(action.payload));
				}
			});
		}
	};
}

let currentRequestTimestamp = undefined;
export function getEnhancedSearchPageDetail(
	location: HistoryLocation,
	pageSummary: api.PageSummary,
	query: string,
	isSearchTyped?: boolean,
	itemAudioLanguage?: GetPageOptions['itemAudioLanguage']
): any {
	return (dispatch, getState) => {
		const state: state.Root = getState();
		const data = getPageRequestData(state, location, pageSummary, itemAudioLanguage);
		const search = query ? `?q=${query}` : '' || location.search;

		// As search responses are asynchronous, there is a risk of race conditions
		// when multiple search requests are triggered.
		// To handle this, we use requestTimestamp as a proxy
		// to track each request and ensure that only the most recent response is considered.
		const requestTimestamp = Date.now().toString();
		currentRequestTimestamp = requestTimestamp;

		dispatch({ type: GET_ENHANCE_SEARCH_CACHE_CLEAR, payload: { path: location.pathname, query } });

		return dispatch(getPage(location.pathname + search, data.options, location)).then(action => {
			// Check if the requestTimestamp is the latest
			if (requestTimestamp === currentRequestTimestamp) {
				action = copy(action, { type: GET_PAGE_DETAIL, meta: { isSearchTyped, term: query } });
				dispatch(action);

				if (action.payload.status === 404) {
					return dispatch({ type: GET_PAGE_NOT_FOUND_ERROR, showPageNotFound: true });
				}

				dispatch({ type: GET_PAGE_NOT_FOUND_ERROR, showPageNotFound: false });

				if (!action.error && !_SERVER_) {
					return dispatch(populatePageLists(action.payload));
				}
			}
		});
	};
}

/**
 * Dispatched when the query parameters are updated on the current page.
 *
 * This is only dispatched when the parameters are replaced, not
 * when the same page is pushed onto the history stack again with
 * new parameters.
 */
export function pageParamsUpdated(location: HistoryLocation) {
	return { type: PAGE_QUERY_PARAMS_UPDATE, payload: location };
}

/**
 * Attempt to reset or restore the browser scroll position
 * for the current page.
 */
export function restoreScrollPosition() {
	return (dispatch, getState) => {
		const state: state.Root = getState();
		if (preventScrollRestore(state)) return;
		const savedState = selectPageState(state);
		restoreScroll(savedState.scrollY || 0);
	};
}

export function setListScrollPosition(listId: string, scrollX: number) {
	return { type: SET_LIST_SCROLL_POSITION, payload: { listId, scrollX } };
}

// REDUCERS

export function requestBackNavigation(path: string) {
	return { type: REQUEST_BACK_NAVIGATION, payload: path };
}

export function resetBackNavigation() {
	return { type: RESET_BACK_NAVIGATION };
}

function updatePageFilter(state: state.Page, action: Action<any>) {
	const filters = state.history.filters;
	const { type, value } = action.payload;
	if (filters[type] === value) return state;
	filters[type] = value;
	return {
		...state,
		history: {
			...state.history,
			filters: {
				...state.history.filters,
				[type]: value
			}
		}
	};
}

const initState: state.Page = {
	history: { entries: [], index: 0, location: <any>{}, pageSummary: PAGE_404, filters: <any>{}, filtersSize: 0 },
	loading: false,
	requestBackNavigation: undefined,
	savedState: undefined,
	subscriptionEntryPoint: undefined
};

export default function reducePage(state: state.Page = initState, action: Action<any>): state.Page {
	switch (action.type) {
		case REQUEST_BACK_NAVIGATION:
			return { ...state, requestBackNavigation: action.payload };
		case RESET_BACK_NAVIGATION:
			return { ...state, requestBackNavigation: undefined };
		case PAGE_CHANGE:
			return reducePageHistory(state, action);
		case GET_PAGE_START:
			return reducePageLoadStart(state);
		case GET_PAGE_DETAIL:
		case GET_PAGE_SUMMARY:
			return reducePageLoadEnd(state);
		case PAGE_QUERY_PARAMS_UPDATE:
			return reduceLocation(state, action);
		case UPDATE_SAVED_STATE:
			return { ...state, savedState: action.payload };
		case SET_LIST_SCROLL_POSITION:
			return reduceSetListScrollPosition(state, action);
		case GET_PAGE_NOT_FOUND_ERROR:
			return reducePageNotFound(state, action);
		case UPDATE_PAGE_ENTRY_POINT:
			return reduceEntryPoint(state, action);
		case UPDATE_PAGE_FILTER:
			return updatePageFilter(state, action);
		case UPDATE_PAGE_FILTERS_SIZE:
			return reducePageFiltersSize(state, action);
		case UPDATE_SUBSCRIPTION_ENTRY_POINT:
			return reduceSubscriptionEntryPoint(state, action);
		case REMOVE_SUBSCRIPTION_ENTRY_POINT:
			return { ...state, subscriptionEntryPoint: undefined };

		default:
			return state;
	}
}

/**
 * Given a change in browser history position, update our
 * history.entries to store the current pages state.
 *
 * The history.entries array may be sparce if a user has navigated the site
 * and then refreshes a page, or if they've navigated away and then hit back
 * to return to the site. In this case the entries will be repopulates as the user
 * navigates again to those previous pages via back or forward browser buttons.
 *
 * If we detect a PUSH then all entries beyond the current index will be expelled.
 */
function reducePageHistory(state: state.Page, action: Action<HistoryLocation>): state.Page {
	if (action.error) return state;

	const location = validateLocation(action.payload);
	const pageSummary = action.meta;
	const index = location.index;
	if (JSON.stringify(state.history.pageSummary) !== JSON.stringify(pageSummary)) state.history.filters = {};
	const history = copy(state.history, { location, index, pageSummary });
	let entries = history.entries;

	if (location.action === 'PUSH') {
		// remove any orphaned entries that have been pushed over
		entries = entries.slice(0, index);
	} else if (entries === initState.history.entries) {
		// make sure we don't edit the initial state entries array as
		// this is global state so shared between server renders
		entries = entries.slice();
	}

	if (!entries[index]) {
		entries[index] = {
			index,
			state: {},
			key: location.key,
			path: `${location.pathname}${location.search || ''}`
		};
	} else if (location.action === 'REPLACE' || entries[index].path !== location.pathname) {
		const entry = entries[index];
		entry.key = location.key;
		entry.path = location.pathname;
	}
	history.entries = entries;
	history.filtersSize = 0;

	return copy(state, { history });
}

function reducePageLoadStart(state: state.Page): state.Page {
	return copy(state, { loading: true });
}

function reducePageLoadEnd(state: state.Page): state.Page {
	return state.loading ? copy(state, { loading: false }) : state;
}

function reduceLocation(state: state.Page, action: Action<HistoryLocation>) {
	const history = copy(state.history, { location: action.payload });
	return copy(state, { history });
}

function reduceSetListScrollPosition(state: state.Page, action: Action<{ listId: string; scrollX: number }>) {
	const { listId, scrollX } = action.payload;
	const { entries, index } = state.history;
	const currentEntryState = entries[index].state;
	const currentListState = currentEntryState[listId];
	const newListState = copy(currentListState, { scrollX });
	const newEntryState = copy(currentEntryState, { [listId]: newListState });

	const newEntries = entries.map((entry, i) => {
		if (i === index) {
			return copy(entry, { state: newEntryState });
		}
		return entry;
	});

	const history = copy(state.history, { entries: newEntries });

	return copy(state, { history });
}

function reducePageNotFound(state: state.Page, action) {
	return copy(state, { showPageNotFound: action.showPageNotFound });
}

function reduceEntryPoint(state: state.Page, action: Action<any>) {
	const history = copy(state.history, { entryPoint: action.payload });
	return copy(state, { history });
}

function reduceSubscriptionEntryPoint(state: state.Page, action: Action<string>): state.Page {
	return {
		...state,
		subscriptionEntryPoint: action.payload
	};
}

function reducePageFiltersSize(state: state.Page, action) {
	const history = copy(state.history, { filtersSize: action.payload });
	return copy(state, { history });
}
