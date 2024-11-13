import * as React from 'react';
import * as PropTypes from 'prop-types';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { Search as key } from 'shared/page/pageKey';
import entryRenderers from './searchEntries';
import { search, searchSave, searchClear } from 'shared/search/searchWorkflow';
import { getErroredQueries } from 'shared/selectors/search';
import SearchInput from './SearchInput';
import RecentSearches from './RecentSearches';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { ResultsMovies, ResultsPeople, ResultsTv } from 'shared/page/pageEntryTemplate';
import { EntryContextTypes } from 'shared/analytics/types/v3/context/entry';

import './Search.scss';

interface SearchProps extends PageProps {
	onSearch: (query: string) => Promise<any>;
	onSearchSave: (query: string) => void;
	onSearchClear: () => void;
	recentSearches: string[];
	recentResults: api.SearchResults[];
	searchPagePath?: string;
	erroredQueries?: string[];
}

interface SearchState {
	query?: string;
	results?: api.SearchResults;
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
			query: ''
		};
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
		const query = props.location.query.q || '';
		if (this.shouldUpdateQuery(props)) {
			this.updateQuery(query);
		} else if (query) {
			const trimmed = query.trim();
			const results = props.recentResults.find(r => r.term === trimmed);
			if (results) this.setState({ results });
		} else {
			this.setState({ results: undefined });
		}
	}

	private updateQuery(query: string) {
		this.setState({ query });
		this.props.onSearch(query);
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
		const { movies, tv, people } = results;
		switch (entry.template) {
			case 'results-movies':
				return movies && movies.size > 0;
			case 'results-tv':
				return tv && tv.size > 0;
			case 'results-people':
				return people && !!people.length;
		}
		return false;
	};

	private onQueryChange = (query: string) => {
		// Remove leading spaces and double spaces within query
		query = query.replace(/^\s+/g, '').replace(/\s\s+/g, ' ');
		if (query === this.state.query) return;
		this.updateQuery(query);
		// This url query update won't trigger a search, we just keep
		// the query param in sync so if the user refreshes the
		// browser or wants to share the url they can.
		const q = query ? `?q=${encodeURIComponent(query)}` : '';
		this.context.router.replace(`${this.props.searchPagePath}${q}`);
	};

	private onSubmit = (query: string) => {
		this.updateQuery(query);
		this.props.onSearchSave(query);
	};

	render() {
		return (
			<section className={bem.b()}>
				<SearchInput
					onValueChange={this.onQueryChange}
					onInputSubmit={this.onSubmit}
					autoFocus={true}
					value={this.state.query}
					loading={this.isLoading()}
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
		return this.props.renderEntry(entry, index, {
			customFields: {
				assetTitlePosition: 'below',
				analytics: {
					entry: {
						// For Analytics there is psuedo search result entry type
						list: undefined,
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

function mapStateToProps({ search, cache, app }: state.Root) {
	return {
		recentSearches: search.recentSearches,
		recentResults: cache.search.recentResults,
		searchPagePath: cache.search.pagePath,
		erroredQueries: getErroredQueries(app.erroredActions)
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onSearch: query => dispatch(search(query)),
		onSearchSave: query => dispatch(searchSave(query)),
		onSearchClear: () => dispatch(searchClear())
	};
}

export default configPage(Search, {
	key,
	template,
	mapStateToProps,
	mapDispatchToProps,
	entryRenderers
} as any);
