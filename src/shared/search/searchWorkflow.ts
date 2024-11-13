import { copy } from '../util/objects';
import { getRecentSearches } from '../util/search';
import { EMPTY_SEARCH_RESULT } from '../cache/searchNormalizer';
import { search as loadSearch, SEARCH } from '../service/action/content';
import { debounce } from '../util/performance';

// ACTIONS
export const SEARCH_CHANGE = 'search/SEARCH_CHANGE';
export const SEARCH_SAVE = 'search/SEARCH_SAVE';
export const SEARCH_CLEAR = 'search/SEARCH_CLEAR';

export function search(query: string, group = true, itemAudioLanguage?: string) {
	if (itemAudioLanguage === 'all') itemAudioLanguage = undefined;
	return (dispatch, getState) => {
		if (!query) {
			return dispatch({
				type: SEARCH,
				payload: EMPTY_SEARCH_RESULT,
				meta: { res: {}, info: { itemAudioLanguage, group } }
			});
		}
		query = query.trim();
		const state: state.Root = getState();
		const fieldName = 'recentResults' + (group ? '' : 'Ungrouped');
		const recentResults = state.cache.search[fieldName];
		const result = recentResults.find(
			result => result.term === query && result.itemAudioLanguage === itemAudioLanguage
		);
		if (result) {
			dispatch({
				type: SEARCH,
				payload: result,
				meta: { res: {}, info: { itemAudioLanguage, group } }
			});
		} else {
			debounceSearch(dispatch, query, itemAudioLanguage, group);
		}
	};
}

const debounceSearch: any = debounce((dispatch, query, itemAudioLanguage, group) => {
	return dispatch(loadSearch(query, { itemAudioLanguage, group }, { itemAudioLanguage, group, query }));
});

export function searchSave(query: string) {
	return { type: SEARCH_SAVE, payload: { query: query.trim() } };
}

export function searchClear() {
	return { type: SEARCH_CLEAR };
}

// REDUCERS
const initState: state.Search = {
	recentSearches: getRecentSearches()
};

export default function reduceSearch(state: state.Search = initState, action: Action<any>): state.Search {
	switch (action.type) {
		case SEARCH_SAVE:
			return reduceSearchSave(state, action);
		case SEARCH_CLEAR:
			return reduceSearchClear(state, action);
	}
	return state;
}

function reduceSearchSave(state: state.Search, action: Action<any>) {
	const query = action.payload.query;
	if (!query.length) return state;
	const recentSearches = state.recentSearches.slice();
	// remove the query from the list if it exists already
	const existingIndex = recentSearches.indexOf(query);
	if (~existingIndex) recentSearches.splice(existingIndex, 1);
	// add the query to the beginning of the list
	const length = recentSearches.unshift(query);
	// trim list down to a maximum of 5 entries
	if (length > 5) recentSearches.splice(5, length - 5);
	return copy(state, { recentSearches });
}

function reduceSearchClear(state: state.Search, action: Action<any>) {
	const recentSearches = [];
	return copy(state, { recentSearches });
}
