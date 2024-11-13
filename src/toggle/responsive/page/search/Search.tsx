import * as React from 'react';
import * as PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Bem } from 'shared/util/styles';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { ESearch, Search as key } from 'shared/page/pageKey';
import entryRenderers from 'ref/responsive/page/search/searchEntries';
import { search, searchSave, searchClear } from 'shared/search/searchWorkflow';
import { getErroredQueries } from 'shared/selectors/search';
import SearchInput from 'ref/responsive/page/search/SearchInput';
import RecentSearches from 'ref/responsive/page/search/RecentSearches';
import LanguageFilter from '../../component/LanguageFilter';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { EntryContextTypes } from 'shared/analytics/types/v3/context/entry';
import { ResultsMovies, ResultsPeople, ResultsTv } from 'shared/page/pageEntryTemplate';
import { LANGUAGES_OPTION_ALL_CODE, LANGUAGES_OPTION_ALL } from 'shared/app/localeUtil';
import { get } from 'shared/util/objects';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { Search as SearchPageKey } from 'shared/page/pageKey';
import { pageAnalyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { searchLanguagePath } from 'shared/analytics/util/analyticsPath';
import { isEnhancedSearchEnabled, redirectOnEnhancedSearchFlag } from 'toggle/responsive/util/enhancedSearchUtil';

import 'ref/responsive/page/search/Search.scss';

interface SearchProps extends PageProps {
	onSearch: (query: string, audio?: string) => Promise<any>;
	onSearchSave: (query: string, audio?: string) => void;
	onSearchClear: () => void;
	pageAnalyticsEvent: (path: string) => any;
	isEnhancedSearchEnabledFlag: boolean;
	recentSearches: string[];
	recentResults: api.SearchResults[];
	searchPagePath?: string;
	enhancedSearchPath?: string;
	erroredQueries?: string[];
	languages: Array<api.Language>;
}

interface SearchState {
	query?: string;
	results?: api.SearchResults;
	selectedLanguageCode: string;
}

const bem = new Bem('search-page');

const entryTemplateToResultType = {
	[ResultsMovies]: 'movies',
	[ResultsPeople]: 'people',
	[ResultsTv]: 'tv'
};

class Search extends React.PureComponent<SearchProps, SearchState> {
	static contextTypes = {
		router: PropTypes.object.isRequired
	};

	context: {
		router: ReactRouter.InjectedRouter;
	};

	constructor(props) {
		super(props);
		this.state = {
			query: '',
			selectedLanguageCode: LANGUAGES_OPTION_ALL_CODE
		} as SearchState;
	}

	componentWillMount(): void {
		const { isEnhancedSearchEnabledFlag, enhancedSearchPath, location } = this.props;
		if (isEnhancedSearchEnabledFlag) {
			redirectOnEnhancedSearchFlag(enhancedSearchPath, location);
		}
	}

	componentDidMount() {
		this.checkRefreshQuery(this.props);
	}

	componentWillReceiveProps(newProps: SearchProps) {
		this.checkRefreshQuery(newProps);
	}

	private shouldUpdateQuery(props: SearchProps) {
		const { location, customFields, recentResults } = props;
		const query = location.query.q || '';
		const trimmed = query.trim();
		// We only maintain a single cached list of search results which gets fed into the result entries.
		// This list will contain the results for the most recent entry in the `recentResults` list.
		// If the results for the current searched term appear further up the `recentResults` list, then we
		// trigger a search to move that term to the top of the list.
		const mostRecentTerm = recentResults.length ? recentResults[recentResults.length - 1].term : undefined;
		return (
			query !== this.state.query ||
			(customFields && customFields['refresh']) ||
			(trimmed && mostRecentTerm !== trimmed && recentResults.some(result => result.term === trimmed))
		);
	}

	private checkRefreshQuery(props: SearchProps) {
		const { q: query = '', audio } = props.location.query;

		if (this.shouldUpdateQuery(props)) {
			this.updateQuery(query, audio);
		} else if (query) {
			const trimmed = query.trim();
			const results = props.recentResults.find(r => r.term === trimmed && r.itemAudioLanguage === audio);

			if (results) this.setState({ results });
		} else {
			this.setState({ results: undefined });
		}
	}

	private updateQuery(query: string, audio?: string) {
		const selectedLanguageCode = audio ? audio : this.state.selectedLanguageCode;
		this.setState({
			query,
			selectedLanguageCode
		});
		this.props.onSearch(query, selectedLanguageCode);
	}

	private isErrored(): boolean {
		const query = this.state.query.trim();
		const results = this.state.results;
		if (results && results.term === query) return false;
		return !!~this.props.erroredQueries.indexOf(query);
	}

	private isLoading(): boolean {
		if (this.isErrored()) return false;
		const query = this.state.query.trim();
		const results = this.props.recentResults;
		return query && (!results || !results.some(r => r.term === query));
	}

	private shouldRenderEntry = (entry: api.PageEntry): boolean => {
		const results = this.state.results;
		if (!results) return false;
		const { movies, tv, people, sports, extras } = results;
		switch (entry.template) {
			case 'results-movies':
				return movies && movies.size > 0;
			case 'results-tv':
				return tv && tv.size > 0;
			case 'results-sports':
				return sports && sports.size > 0;
			case 'results-extras':
				return extras && extras.size > 0;
			case 'results-people':
				return people && !!people.length;
		}
		return false;
	};

	private onQueryChange = (query: string) => {
		// Remove leading spaces and double spaces within query
		// Replace all occurences of ’ Smart Punctuation in iOS>=11 with '
		query = query
			.replace(/^\s+/g, '')
			.replace(/\s\s+/g, ' ')
			.replace(/’/g, "'");
		const audio = this.addAudioParamToQueryString(query);
		const selectedLanguageCode = this.state.selectedLanguageCode;
		if (query === this.state.query && this.props.location.query.audio === selectedLanguageCode) return;
		this.updateQuery(query);

		// This url query update won't trigger a search, we just keep
		// the query param in sync so if the user refreshes the
		// browser or wants to share the url they can.
		const q = query ? `?q=${encodeURIComponent(query)}` : '';
		this.context.router.replace(`${this.props.searchPagePath}${q}${audio}`);
	};

	private addAudioParamToQueryString = query => {
		const { selectedLanguageCode } = this.state;
		if (query && selectedLanguageCode !== LANGUAGES_OPTION_ALL_CODE) return `&audio=${selectedLanguageCode}`;

		return '';
	};

	private onSubmit = (query: string) => {
		this.updateQuery(query);
		this.props.onSearchSave(query, this.state.selectedLanguageCode);
	};

	private onLanguageSelected = (code: string) => {
		const { query } = this.state;
		this.props.onSearch(query, code);
		this.props.pageAnalyticsEvent(searchLanguagePath(code));
		this.setState({ selectedLanguageCode: code }, () => this.onQueryChange(query));
	};

	render() {
		const { languages } = this.props;

		return (
			<section className={bem.b()}>
				<SearchInput
					onValueChange={this.onQueryChange}
					onInputSubmit={this.onSubmit}
					autoFocus={true}
					value={this.state.query}
					loading={this.isLoading()}
				/>
				<LanguageFilter
					onLanguageChange={this.onLanguageSelected}
					languages={languages}
					selectedLanguageCode={this.state.selectedLanguageCode}
				/>
				{this.renderSearchBody()}
			</section>
		);
	}

	private renderSearchBody() {
		const { entries } = this.props;
		if (this.isErrored()) {
			return this.renderMessage('@{search_error_heading|An error occurred}');
		} else if (!this.state.query) {
			return this.renderRecentSearches();
		} else if (!this.state.results) {
			return;
		}
		const filtered = (entries || []).filter(this.shouldRenderEntry);
		if (!filtered.length) {
			return this.renderMessage('@{search_empty_heading|No results}', '@{search_empty_info|please try again}');
		}
		return filtered.map(this.renderEntry);
	}

	private renderEntry = (entry: api.PageEntry, index: number, entries: api.PageEntry[]) => {
		// The signature of `Array.map` differs from the signature of `api.renderEntry` where the last param will be
		// an array of all the entries instead of an optional `customEntryProps` object.
		const { query: term, results } = this.state;
		const key = entryTemplateToResultType[entry.template] || 'items';

		const listItems = Object.keys(results);
		const listId = get(entry, 'list.id');
		let list = undefined;

		listItems.some(li => {
			if ((listId && results[li].id === listId) || (!listId && Array.isArray(results[li]))) {
				list = results[li];
				return true;
			}
			return false;
		});

		return this.props.renderEntry(entry, index, {
			customFields: {
				assetTitlePosition: 'below',
				analytics: {
					entry: {
						// For Analytics there is pseudo search result entry type
						list: list,
						type: EntryContextTypes.Search,
						key,
						search: {
							term,
							size: results.total
						}
					}
				}
			}
		});
	};

	private renderRecentSearches() {
		const { recentSearches, searchPagePath, onSearchClear, onSearchSave } = this.props;
		if (!recentSearches.length) return;
		return (
			<RecentSearches
				searches={recentSearches}
				searchPagePath={searchPagePath}
				onClearSearches={onSearchClear}
				onSearchSave={onSearchSave}
				pageKey={SearchPageKey}
			/>
		);
	}

	private renderMessage(title: string, info?: string) {
		return (
			<div className={bem.e('message')}>
				<IntlFormatter elementType="h2" className={bem.e('message-title')}>
					{title}
				</IntlFormatter>
				{info && <IntlFormatter className={bem.e('message-info')}>{info}</IntlFormatter>}
			</div>
		);
	}
}

function mapStateToProps(state: state.Root) {
	const { search, cache, app } = state;
	const languages = app.config.general.audioLanguages.concat();
	const allOptionExist = languages.find(lang => lang.code === LANGUAGES_OPTION_ALL.code);
	if (!allOptionExist) languages.unshift(LANGUAGES_OPTION_ALL);

	const isEnhancedSearchEnabledFlag = isEnhancedSearchEnabled(state);
	const safeSearchPagePath = get(cache, 'search.pagePath') || getPathByKey(SearchPageKey, app.config);

	const enhancedSearchPath = getPathByKey(ESearch, app.config);
	return {
		isEnhancedSearchEnabledFlag,
		recentSearches: search.recentSearches,
		recentResults: cache.search.recentResults,
		searchPagePath: safeSearchPagePath,
		enhancedSearchPath,
		erroredQueries: getErroredQueries(app.erroredActions),
		languages
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onSearch: (query: string, itemAudioLanguage?: string) => dispatch(search(query, true, itemAudioLanguage)),
		onSearchSave: query => dispatch(searchSave(query)),
		onSearchClear: () => dispatch(searchClear()),
		pageAnalyticsEvent: path => dispatch(pageAnalyticsEvent(path))
	};
}

export default configPage(injectIntl(Search), {
	key,
	template,
	mapStateToProps,
	mapDispatchToProps,
	entryRenderers
} as any);
