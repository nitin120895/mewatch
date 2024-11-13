import * as Redux from 'redux';
import { getItem, setItem } from './localStorage';
import * as SearchSelectors from 'shared/selectors/search';

export const RECENT_SEARCHES_STORAGE_ID = 'search.recent';

export function updateSavedSearches(store: Redux.Store<state.Root>, action: Action<any>) {
	const recentSearches = store.getState().search.recentSearches;
	setItem(RECENT_SEARCHES_STORAGE_ID, recentSearches);
}

const defaultRecentSearches = [];
export function getRecentSearches() {
	return getItem(RECENT_SEARCHES_STORAGE_ID) || defaultRecentSearches;
}

// @deprecated, use the selector instead in selectors/search
export const getErroredQueries = SearchSelectors.getErroredQueries;
