import { debounce } from 'shared/util/performance';
import { getEnhancedSearchPageDetail } from 'shared/page/pageWorkflow';
import { findPageSummary } from 'shared/page/sitemapLookup';
import { get } from 'shared/util/objects';
import { GET_ENHANCE_SEARCH_CACHE_CLEAR } from 'shared/cache/cacheWorkflow';

export function enhancedSearch(query: string, isSearchTyped?: boolean, itemAudioLanguage?: string) {
	return (dispatch, getState) => {
		query = encodeURIComponent(query).trim();
		const state: state.Root = getState();
		const location = get(state, 'page.history.location');
		if (!query) {
			return dispatch({ type: GET_ENHANCE_SEARCH_CACHE_CLEAR, payload: { path: location.pathname } });
		}
		const pageSummary = findPageSummary(location.pathname, state);
		if (itemAudioLanguage === 'all') {
			itemAudioLanguage = undefined;
		}
		debounceEnhancedSearch(dispatch, location, pageSummary, query, isSearchTyped, itemAudioLanguage);
	};
}

const debounceEnhancedSearch: any = debounce(
	(dispatch, location, pageSummary, query, isSearchTyped, itemAudioLanguage) => {
		return dispatch(getEnhancedSearchPageDetail(location, pageSummary, query, isSearchTyped, itemAudioLanguage));
	}
);

export const GET_ENHANCED_SEARCH_LISTS_START = 's/content/GET_ENHANCED_SEARCH_LISTS_START';
export const GET_ENHANCED_SEARCH_LISTS = 's/content/GET_ENHANCED_SEARCH_LISTS';
export type GET_ENHANCED_SEARCH_LISTS = api.SearchListsResults;

export function getEnhancedSearchLists(url: string, info?: any): any {
	return async dispatch => {
		dispatch({ type: GET_ENHANCED_SEARCH_LISTS_START, meta: { info } });
		try {
			const response = await fetch(url);
			const data = await response.json();
			dispatch({
				type: GET_ENHANCED_SEARCH_LISTS,
				payload: data,
				error: undefined,
				meta: {
					res: response,
					info
				}
			});
		} catch (error) {
			if (_DEV_) console.log(error);
			dispatch({
				type: GET_ENHANCED_SEARCH_LISTS,
				payload: undefined,
				error,
				meta: {
					res: undefined,
					info
				}
			});
		}
	};
}
