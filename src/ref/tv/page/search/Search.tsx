import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as cx from 'classnames';
import { configPage } from 'shared/';
import { Search as template } from 'shared/page/pageTemplate';
import { Search as key } from 'shared/page/pageKey';
import entryRenderers from './searchEntries';
import { search, searchSave, searchClear } from 'shared/search/searchWorkflow';
import { getErroredQueries } from 'shared/util/search';
import SearchInput from './SearchInput';
import RecentSearches from './RecentSearches';
import { Bem } from 'shared/util/styles';
import Spinner from '../../component/Spinner';
import { DirectionalNavigation, GlobalEvent } from 'ref/tv/DirectionalNavigation';
import { FormattedMessage } from 'react-intl';
import { ResultsMovies, ResultsPeople, ResultsTv } from 'shared/page/pageEntryTemplate';
import { EntryContextTypes } from 'shared/analytics/types/v3/context/entry';
import { isArray } from 'shared/util/objects';
import './Search.scss';

const id = 'search';

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
	[ResultsMovies]: { key: 'movies', index: 0 },
	[ResultsTv]: { key: 'tv', index: 1 },
	[ResultsPeople]: { key: 'people', index: 2 }
};

class Search extends React.PureComponent<SearchProps, SearchState> {
	context: {
		router: ReactRouter.InjectedRouter;
		focusNav: DirectionalNavigation;
	};

	static contextTypes = {
		router: PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired
	};

	private newEntryKey: string[] = [];

	constructor(props) {
		super(props);

		this.state = {
			query: '',
			results: undefined
		};
	}

	componentDidMount() {
		this.checkRefreshQuery(this.props);

		this.context.focusNav.addEventHandler(GlobalEvent.KEYBOARD_VISIBILITY_CHANGE, id, e => {
			this.context.focusNav.disableMouseFocus = e;
		});
	}

	componentWillUnmount() {
		this.context.focusNav.removeEventHandler(GlobalEvent.KEYBOARD_VISIBILITY_CHANGE, id);
	}

	componentWillReceiveProps(newProps: SearchProps) {
		this.checkRefreshQuery(newProps);
	}

	shouldComponentUpdate(nextProps: SearchProps, nextState: SearchState) {
		if (nextState.query === this.state.query) {
			if (nextState.results === this.state.results) {
				return this.props.recentSearches.length !== nextProps.recentSearches.length;
			} else {
				if (nextState.results === undefined) {
					this.newEntryKey = [];
					return true;
				}

				if (this.state.results === undefined) {
					const { results } = nextState;
					this.newEntryKey = Object.keys(results).reduce((newEntryKey, key) => {
						const result = results[key];

						if (typeof result === 'object' && ((isArray(result) && result.length > 0) || result.size > 0)) {
							newEntryKey.push('results-' + key);
						}

						return newEntryKey;
					}, this.newEntryKey);

					return true;
				}

				for (let key in nextState.results) {
					if (typeof nextState.results[key] === 'object') {
						let newSize, prevSize;

						if (isArray(nextState.results[key])) {
							newSize = nextState.results[key].length;
							prevSize = this.state.results[key].length;
						} else {
							newSize = nextState.results[key].size;
							prevSize = this.state.results[key].size;
						}

						if (newSize > 0 && prevSize === 0) {
							this.newEntryKey.push('results-' + key);
						} else if (this.newEntryKey.findIndex(entry => entry === 'results-' + key) !== -1) {
							this.newEntryKey.splice(this.newEntryKey.findIndex(entry => entry === 'results-' + key), 1);
						}
					}
				}
			}
		}

		return true;
	}

	componentDidUpdate(prevProps: SearchProps, prevState: SearchState) {
		if (prevState.query === this.state.query) {
			const { focusNav } = this.context;
			focusNav.visibleRows = focusNav.focusableRows.filter(
				row => this.newEntryKey.findIndex(key => key === row.template) !== -1
			);
			focusNav.analytics.triggerEntryViewed();
		}
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
			(trimmed && mostRecentTerm && mostRecentTerm !== trimmed && recentResults.some(result => result.term === trimmed))
		);
	}

	private checkRefreshQuery(props: SearchProps) {
		const { location, recentResults } = props;
		const query = location.query.q || '';

		if (this.shouldUpdateQuery(props)) {
			this.setState({ query });
			if (this.context.focusNav.pageGoBackHandle) this.props.onSearch(query);
		} else if (query) {
			const trimmed = query.trim();
			const results = recentResults.find(r => r.term === trimmed);
			if (results) this.setState({ results });
		} else {
			this.setState({ results: undefined });
		}
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
		if (query === undefined) {
			return;
		}

		query = query.replace(/^\s+/g, '').replace(/\s\s+/g, ' ');
		if (query === this.state.query) return;

		this.setState({ query });
		this.props.onSearch(query);

		// This url query update won't trigger a search, we just keep
		// the query param in sync so if the user refreshes the
		// browser or wants to share the url they can.
		const q = query ? `?q=${encodeURIComponent(query)}` : '';
		this.context.router.replace(`${this.props.searchPagePath}${q}`);
	};

	private onInputBlur = () => {
		const query = this.state.query.trim();
		const results = this.props.recentResults;
		const hasSearchResult = query && results && results.some(result => result.term === query);
		if (hasSearchResult) {
			this.props.onSearchSave(this.state.query);
		}
	};

	render() {
		const filtered = (this.props.entries || []).filter(this.shouldRenderEntry);
		let hasResults = true;

		if (!filtered.length) {
			hasResults = false;
		}

		return (
			<section className={cx(bem.b())}>
				<SearchInput
					onValueChange={this.onQueryChange}
					onInputBlur={this.onInputBlur}
					autoFocus={true}
					value={this.state.query}
					loading={this.isLoading()}
					hasResults={hasResults}
				/>
				<div className={cx(bem.b('body'), 'content-margin')}> {this.renderSearchBody()} </div>
			</section>
		);
	}

	private renderSearchBody() {
		const { entries } = this.props;

		if (this.isErrored()) {
			return this.renderMessage('search_error_heading');
		} else if (this.isLoading()) {
			return <Spinner className={bem.e('spinner')} />;
		} else if (!this.state.query) {
			this.context.focusNav.supportedEntriesCount = 2;
			return this.renderRecentSearches();
		} else if (!this.state.results) {
			return;
		}

		const filtered = (entries || []).filter(this.shouldRenderEntry);

		if (!filtered.length) {
			this.context.focusNav.supportedEntriesCount = 1;
			return this.renderMessage('search_header_empty_message');
		} else {
			this.context.focusNav.supportedEntriesCount = filtered.length + 1;
		}

		return filtered.map(this.renderEntry);
	}

	private renderEntry = (entry: api.PageEntry) => {
		// The signature of `Array.map` differs from the signature of `api.renderEntry` where the last param will be
		// an array of all the entries instead of an optional `customEntryProps` object.
		const { query: term, results } = this.state;
		const key = entryTemplateToResultType[entry.template].key || 'items';
		const size = entry.hasOwnProperty('people') ? results[key].length : results[key].size;
		const index = entryTemplateToResultType[entry.template].index;

		return this.props.renderEntry(entry, index, {
			customFields: {
				assetTitlePosition: 'below',
				analytics: {
					entry: {
						// For Analytics there is pseudo search result entry type
						list: undefined,
						type: EntryContextTypes.Search,
						key,
						search: { term, size }
					}
				}
			}
		});
	};

	private renderRecentSearches() {
		const { recentSearches, onSearchClear, searchPagePath, onSearch } = this.props;
		if (!recentSearches.length) return;

		return (
			<RecentSearches
				searches={recentSearches}
				searchPagePath={searchPagePath}
				onClearSearches={onSearchClear}
				onSearch={onSearch}
			/>
		);
	}

	private renderMessage(id: string) {
		return (
			<FormattedMessage id={id}>
				{title => (
					<div className={bem.e('message')}>
						<div className={bem.e('message-title')}>{title}</div>
					</div>
				)}
			</FormattedMessage>
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
