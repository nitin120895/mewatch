import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { enhancedSearch } from 'shared/enhancedSearch/enhancedSearchWorkflow';
import { ESearch } from 'shared/page/pageKey';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { searchSave } from 'shared/search/searchWorkflow';
import { get } from 'shared/util/objects';
import { LANGUAGES_OPTION_ALL, LANGUAGES_OPTION_ALL_CODE } from 'shared/app/localeUtil';
import { SSB1 as template } from 'shared/page/pageEntryTemplate';
import { getErroredQueries } from 'shared/selectors/search';
import { GET_ENHANCE_SEARCH_CACHE_CLEAR } from 'shared/cache/cacheWorkflow';
import LanguageFilter from 'toggle/responsive/component/LanguageFilter';
import SearchInput from 'toggle/responsive/page/search/SearchInput';

interface SearchProps extends PageProps {
	onSearch: (query: string, isSearchTyped?: boolean, audio?: string) => Promise<any>;
	onSearchSave: (query: string) => void;
	clearSearchCache: () => void;
	enhancedSearchResults: { [id: string]: state.ListCache };
	languages: Array<api.Language>;
	searchPagePath?: string;
	erroredQueries?: string[];
	customProps: {
		query?: string;
		setQuery: (query: string) => void;
	};
}

interface SearchState {
	selectedLanguageCode: string;
}

let isFirstPageLoad = false;

class SSB1 extends React.Component<SearchProps, SearchState> {
	static contextTypes = {
		router: PropTypes.object.isRequired
	};

	context: {
		router: ReactRouter.InjectedRouter;
	};

	constructor(props) {
		super(props);
		this.state = {
			selectedLanguageCode: LANGUAGES_OPTION_ALL_CODE
		} as SearchState;
	}

	componentDidMount() {
		this.checkRefreshQuery(this.props);
	}

	componentWillReceiveProps(newProps: SearchProps) {
		this.checkRefreshQuery(newProps);
	}

	private shouldUpdateQuery(props: SearchProps) {
		const { location, customProps } = props;
		const query = get(location.query, 'q') || '';
		return query !== customProps.query;
	}

	private async checkRefreshQuery(props: SearchProps) {
		const { location, customProps } = props;
		const query = get(location, 'query.q') || '';
		const audio = get(location, 'query.audio');
		if (this.shouldUpdateQuery(props)) {
			if (isFirstPageLoad) {
				await this.updateQuery(query, audio);
			} else {
				customProps.setQuery && customProps.setQuery(query);
				if (audio) {
					this.setState({ selectedLanguageCode: audio });
				}
			}
		}
		isFirstPageLoad = true;
	}

	private async updateQuery(query: string, audio?: string) {
		const { onSearch, customProps } = this.props;
		const { setQuery } = customProps;
		const selectedLanguageCode = audio ? audio : this.state.selectedLanguageCode;
		setQuery(query);
		this.setState({ selectedLanguageCode });
		await onSearch(query, true, selectedLanguageCode);
	}

	private isErrored(): boolean {
		const { customProps, erroredQueries } = this.props;
		const query = customProps.query ? customProps.query.trim() : '';
		return erroredQueries && erroredQueries.includes(query);
	}

	private isLoading(): boolean {
		const { enhancedSearchResults, customProps } = this.props;
		if (this.isErrored()) return false;
		return !!customProps.query && !!enhancedSearchResults.loading;
	}

	private onQueryChange = (query: string) => {
		const { location, clearSearchCache, customProps } = this.props;
		if (query === undefined) {
			return;
		}
		customProps.setQuery(query);

		clearSearchCache(); // Clear the enhanceSearch cache

		// Remove leading spaces and double spaces within query
		// Replace all occurences of ’ Smart Punctuation in iOS>=11 with '
		query = query
			? query
					.replace(/^\s+/g, '')
					.replace(/\s\s+/g, ' ')
					.replace(/’/g, "'")
			: '';
		const audio = get(location, 'query.audio');
		if (query === customProps.query && audio === this.state.selectedLanguageCode) return;
		this.updateQuery(query);
		const q = query ? `?q=${encodeURIComponent(query)}` : '';
		const audioParamQueryString = this.addAudioParamToQueryString(query);
		this.context.router.replace(`${this.props.searchPagePath}${q}${audioParamQueryString}`);
	};

	private onSubmit = (query: string) => {
		const { onSearchSave } = this.props;
		this.updateQuery(query);
		onSearchSave(query);
	};

	private addAudioParamToQueryString = query => {
		const { selectedLanguageCode } = this.state;
		if (query && selectedLanguageCode !== LANGUAGES_OPTION_ALL_CODE) return `&audio=${selectedLanguageCode}`;
		return '';
	};

	private onLanguageSelected = (code: string) => {
		const { onSearch, customProps } = this.props;
		const { query } = customProps;
		onSearch(query, false, code);
		this.setState({ selectedLanguageCode: code }, () => this.onQueryChange(query));
	};

	render() {
		const { languages, customProps } = this.props;
		const { query } = customProps;
		const { selectedLanguageCode } = this.state;
		return (
			<section>
				<SearchInput
					onValueChange={this.onQueryChange}
					onInputSubmit={this.onSubmit}
					autoFocus={true}
					value={query}
					loading={this.isLoading()}
				/>
				{languages && (
					<LanguageFilter
						onLanguageChange={this.onLanguageSelected}
						languages={languages}
						selectedLanguageCode={selectedLanguageCode}
					/>
				)}
			</section>
		);
	}
}

function mapStateToProps({ cache, app }: state.Root) {
	const currentPath = getPathByKey(ESearch, app.config);
	const pagePath = cache.page[currentPath].path;
	const audioLanguages = get(app, 'config.general.audioLanguages');
	const languages = (audioLanguages && audioLanguages.concat()) || [];
	const allOptionExist = languages.find(lang => lang.code === LANGUAGES_OPTION_ALL.code);
	if (!allOptionExist) languages.unshift(LANGUAGES_OPTION_ALL);
	return {
		enhancedSearchResults: cache.enhanceSearch,
		searchPagePath: pagePath,
		erroredQueries: getErroredQueries(app.erroredActions),
		languages
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onSearch: (query, isSearchTyped, itemAudioLanguage?: string) =>
			dispatch(enhancedSearch(query, isSearchTyped, itemAudioLanguage)),
		onSearchSave: query => dispatch(searchSave(query)),
		clearSearchCache: () => dispatch({ type: GET_ENHANCE_SEARCH_CACHE_CLEAR, payload: { path: location.pathname } })
	};
}

const Component: any = connect<any, any, SearchProps>(
	mapStateToProps,
	mapDispatchToProps
)(SSB1);
Component.template = template;

export default Component;
