import * as React from 'react';
import { configPage } from 'shared';
import { EnhancedSearch as template } from 'shared/page/pageTemplate';
import { ESearch as key, Search } from 'shared/page/pageKey';
import { Bem } from 'shared/util/styles';
import { get } from 'shared/util/objects';
import { SSB1 } from 'shared/page/pageEntryTemplate';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { getErroredQueries } from 'shared/selectors/search';
import { searchClear, searchSave } from 'shared/search/searchWorkflow';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import entryRenderers from 'toggle/responsive/page/enhancedSearch/enhancedSearchEntries';
import { isEnhancedSearchEnabled, redirectOnEnhancedSearchFlag } from 'toggle/responsive/util/enhancedSearchUtil';
import RecentSearches from 'toggle/responsive/page/search/RecentSearches';
import './EnhanceSearch.scss';

const bem = new Bem('enhance-search-page');

interface EnhancedSearchProps extends PageProps {
	onSearchSave: (query: string) => void;
	onSearchClear: () => void;
	isEnhancedSearchEnabledFlag: boolean;
	enhancedSearchResults: { [id: string]: state.ListCache };
	erroredQueries?: string[];
	recentSearches: string[];
	searchPagePath?: string;
	searchPath?: string;
}

class EnhancedSearch extends React.PureComponent<EnhancedSearchProps, any> {
	constructor(props) {
		super(props);
		this.state = {
			query: ''
		};
	}

	componentWillMount(): void {
		const { isEnhancedSearchEnabledFlag, location, searchPath } = this.props;
		if (!isEnhancedSearchEnabledFlag) {
			redirectOnEnhancedSearchFlag(searchPath, location);
		}
	}

	private isSearchResultEmpty() {
		const { enhancedSearchResults } = this.props;
		const enhancedSearchResultsValues = (enhancedSearchResults && Object.values(enhancedSearchResults)) || [];
		return enhancedSearchResultsValues.every(entry => {
			const resultCount = get(entry, 'list.size');
			if (resultCount === -1 || resultCount > 0) return false;
			return resultCount === 0 || resultCount === undefined;
		});
	}

	private renderRecentSearches() {
		const { recentSearches, searchPagePath, onSearchClear, onSearchSave } = this.props;
		if (recentSearches && recentSearches.length > 0) {
			return (
				<RecentSearches
					searches={recentSearches}
					searchPagePath={searchPagePath}
					onClearSearches={onSearchClear}
					onSearchSave={onSearchSave}
					pageKey={key}
				/>
			);
		}
		return;
	}

	private setQuery = (query: string) => {
		this.setState({ query });
	};

	private isError(): boolean {
		const { location, erroredQueries } = this.props;
		const query = location.query && location.query.q && location.query.q.trim();
		return erroredQueries.includes(query);
	}

	private renderSearchBody() {
		const { enhancedSearchResults, pageKey, location } = this.props;
		if (pageKey === key) {
			const allEmpty = this.isSearchResultEmpty();
			const inputQuery = get(location, 'query.q'); // Input query
			const cacheSearchTerm = get(enhancedSearchResults, 'term'); // Get the search term from cache
			if (!inputQuery) {
				return this.renderRecentSearches();
			}

			if (this.isError()) {
				return this.renderMessage('@{search_error_heading|An error occurred}');
			}

			/* tslint:disable-next-line:no-null-keyword */
			if (!cacheSearchTerm) return null;

			if (allEmpty) {
				return this.renderMessage('@{search_empty_heading|No results}', '@{search_empty_info|please try again}');
			}
			/* tslint:disable-next-line:no-null-keyword */
			return null;
		}
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

	private renderEntry(entries) {
		return (entries || []).map(entry => {
			const template = get(entry.props, 'entryProps.template');
			// Update the existing entryProps to pass the query and setQuery props to the SSB1 component
			if (template === SSB1) {
				const customProps: any = {};
				customProps.query = this.state.query;
				customProps.setQuery = this.setQuery;
				return {
					...entry,
					props: {
						...entry.props,
						entryProps: {
							...entry.props.entryProps,
							customProps
						}
					}
				};
			}
			return entry;
		});
	}

	render() {
		const { location, renderEntries } = this.props;
		const allEmpty = this.isSearchResultEmpty();
		const queryLength = location.query && Object.keys(location.query).length;
		return (
			<section className={bem.b({ 'empty-search': !queryLength || allEmpty })}>
				{this.renderEntry(renderEntries())}
				{this.renderSearchBody()}
			</section>
		);
	}
}

function mapStateToProps(state: state.Root) {
	const { search, cache, app } = state;
	const currentPath = getPathByKey(key, app.config);
	const isEnhancedSearchEnabledFlag = isEnhancedSearchEnabled(state);
	const pagePath = cache.page && cache.page[currentPath] && cache.page[currentPath].path;
	const searchPath = get(cache, 'search.pagePath') || getPathByKey(Search, app.config);
	return {
		isEnhancedSearchEnabledFlag,
		enhancedSearchResults: cache.enhanceSearch,
		erroredQueries: getErroredQueries(app.erroredActions),
		recentSearches: search.recentSearches,
		searchPagePath: pagePath,
		searchPath
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onSearchSave: query => dispatch(searchSave(query)),
		onSearchClear: () => dispatch(searchClear())
	};
}

export default configPage(EnhancedSearch, {
	template,
	entryRenderers,
	mapStateToProps,
	mapDispatchToProps,
	key
});
