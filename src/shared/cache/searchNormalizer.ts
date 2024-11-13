import { copy } from '../util/objects';

export const MOVIES_LIST_ID = 'search-movies';
export const TV_LIST_ID = 'search-tv';
export const SPORTS_LIST_ID = 'search-sports';
export const EXTRAS_LIST_ID = 'search-extras';

export const SEARCH_RESULTS_CACHE_LIMIT = 10;
export const EMPTY_SEARCH_RESULT: api.SearchResults = {
	term: '',
	total: 0,
	movies: {
		id: MOVIES_LIST_ID,
		key: '',
		size: 0,
		path: '',
		items: [],
		paging: { page: 0, total: 0 }
	},
	tv: {
		id: TV_LIST_ID,
		key: '',
		size: 0,
		path: '',
		items: [],
		paging: { page: 0, total: 0 }
	},
	sports: {
		id: SPORTS_LIST_ID,
		key: '',
		size: 0,
		path: '',
		items: [],
		paging: { page: 0, total: 0 }
	},
	extras: {
		id: EXTRAS_LIST_ID,
		key: '',
		size: 0,
		path: '',
		items: [],
		paging: { page: 0, total: 0 }
	},
	people: []
};

export function updateSearchLists(state: state.Cache, newResult: api.SearchResults = EMPTY_SEARCH_RESULT) {
	const searchPage = state.page[state.search.pagePath] as api.Page;
	if (!searchPage) return state;

	const listCache = copy(state.list);
	const page = copy(searchPage);

	page.customFields['term'] = newResult.term;
	page.customFields['total'] = newResult.total;
	page.customFields['refresh'] = false;

	state.page[state.search.pagePath] = page;

	const { items, movies, tv, people, sports, extras } = newResult;

	if (items) listCache[items.id].list = items;
	if (movies) listCache[movies.id].list = movies;
	if (tv) listCache[tv.id].list = tv;
	if (sports) listCache[sports.id].list = sports;
	if (extras) listCache[extras.id].list = extras;

	const entry = page.entries.find(entry => !!entry.people);
	if (entry) entry.people = people;

	return copy(state, { list: listCache });
}
