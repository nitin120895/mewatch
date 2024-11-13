import * as React from 'react';
import { findDOMNode } from 'react-dom';
import * as PropTypes from 'prop-types';
import { Bem } from 'shared/util/styles';
import TriggerProvider from 'shared/analytics/components/TriggerProvider';
import { DomTriggerPoints } from 'shared/analytics/types/types';
import SearchIcon from '../../../../ref/responsive/component/SearchIcon';
import Spinner from '../../../../ref/responsive/component/Spinner';
import HeaderSearchResults from './HeaderSearchResults';
import DropMenu from '../../../../ref/responsive/app/nav/DropMenu';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';

import './HeaderSearch.scss';

interface HeaderSearchProps extends React.Props<any> {
	className?: string;
	insideHero?: boolean;
	isSignedIn?: boolean;
	recentSearches: string[];
	recentResults: api.SearchResults[];
	erroredQueries?: string[];
	searchPagePath: string;
	onSearch: (query: string) => Promise<any>;
	onSearchSave: (query: string) => void;
	onSearchClear: () => void;
}

interface HeaderSearchState {
	focused?: boolean;
	query?: string;
	resultsQuery?: string;
	itemEntries?: api.NavEntry[];
	personEntries?: api.NavEntry[];
	recentSearchesEntries?: api.NavEntry[];
	erroredQuery?: string;
	menuEdgePadding?: number;
}

const MAX_ITEM_ENTRIES = 5;
const MAX_PERSON_ENTRIES = 3;

const bem = new Bem('header-search');

export default class HeaderSearch extends React.Component<HeaderSearchProps, HeaderSearchState> {
	static contextTypes = {
		router: PropTypes.object.isRequired
	};

	context: {
		router: ReactRouter.InjectedRouter;
	};

	private form: HTMLFormElement;
	private input: HTMLInputElement;
	private blurTimeout: any;

	constructor(props) {
		super(props);
		this.state = {
			focused: false,
			query: '',
			resultsQuery: '',
			itemEntries: [],
			personEntries: [],
			recentSearchesEntries: props.recentSearches.map(this.createRecentSearchEntry)
		};
	}

	componentWillReceiveProps(nextProps) {
		const newState: HeaderSearchState = { erroredQuery: undefined };
		const { query, resultsQuery } = this.state;
		const { recentResults, recentSearches, erroredQueries } = nextProps;
		const trimmed = query.trim();
		const queryResults = recentResults.find(r => r.term === trimmed);
		if (queryResults) {
			if (trimmed !== resultsQuery) {
				newState.resultsQuery = trimmed;
				newState.itemEntries = queryResults.items.items.slice(0, MAX_ITEM_ENTRIES).map(this.createItemEntry);
				newState.personEntries = queryResults.people.slice(0, MAX_PERSON_ENTRIES).map(this.createPersonEntry);
			}
		} else if (~erroredQueries.indexOf(trimmed)) {
			newState.erroredQuery = trimmed;
		}

		if (this.props.recentSearches !== recentSearches) {
			newState.recentSearchesEntries = recentSearches.map(this.createRecentSearchEntry);
		}

		this.setState(newState);
	}

	componentWillUnmount() {
		if (this.blurTimeout) clearTimeout(this.blurTimeout);
	}

	// Public method to allow input to be blurred externally
	blurInput() {
		if (this.input) this.input.blur();
	}

	private createItemEntry(item: api.ItemSummary) {
		let label = item.title;
		if (item.type === 'movie' && item.releaseYear) {
			label += ` (${item.releaseYear})`;
		}
		return {
			label,
			path: item.path,
			depth: 2,
			item
		};
	}

	private createPersonEntry(person: api.Person): api.NavEntry {
		return {
			label: person.name,
			path: person.path,
			depth: 2
		};
	}

	private createRecentSearchEntry = (query: string): api.NavEntry => {
		return {
			label: query,
			path: `${this.props.searchPagePath}?q=${encodeURIComponent(query)}`,
			depth: 2
		};
	};

	private updateEdgePadding = () => {
		if (!this.form) return;
		const menuEdgePadding = window.innerWidth - this.form.getBoundingClientRect().right;
		if (menuEdgePadding !== this.state.menuEdgePadding) {
			this.setState({ menuEdgePadding });
		}
	};

	private onFormRef = ref => {
		this.form = findDOMNode<HTMLFormElement>(ref);
	};

	private onInputRef = ref => {
		this.input = findDOMNode<HTMLInputElement>(ref);
	};

	private clearFocus = () => {
		this.setState({ focused: false });
	};

	private setFocus() {
		this.setState({ focused: true });
	}

	private onQueryChange = e => {
		// Remove leading spaces and double spaces within query
		// Replace all occurances of ’ Smart Punctuation in iOS>=11 with '
		const query = e.target.value
			.replace(/^\s+/g, '')
			.replace(/\s\s+/g, ' ')
			.replace(/’/g, "'");
		if (this.state.query === query) return;
		const newState: HeaderSearchState = { query };
		this.setFocus();
		if (!query) {
			newState.resultsQuery = '';
			newState.itemEntries = [];
			newState.personEntries = [];
		}
		this.setState(newState);
		if (query) {
			window.requestAnimationFrame(() => {
				this.props.onSearch(query);
			});
		}
	};

	private navigateToSearchPage = (e?) => {
		if (e) e.preventDefault();

		const query = this.state.query;
		const { onSearchSave, searchPagePath } = this.props;
		if (!query) return;
		onSearchSave(query);
		this.context.router.push(`${searchPagePath}?q=${encodeURIComponent(query)}`);
	};

	private onSubmit = e => {
		e.preventDefault();
		this.navigateToSearchPage();
	};

	private onFocus = (e?) => {
		if (this.blurTimeout) clearTimeout(this.blurTimeout);
		// We update the edge padding after animation frame when the layout rendering is
		// finished so we can get the final right edge position of the rendered form
		window.requestAnimationFrame(this.updateEdgePadding);
		this.setFocus();
	};

	private onBlur = (e?) => {
		if (this.blurTimeout) clearTimeout(this.blurTimeout);
		this.blurTimeout = setTimeout(this.clearFocus, 10);
	};

	private onInputClick = (e?) => {
		this.setFocus();
	};

	private onMouseDown = (e?) => {
		setTimeout(() => {
			if (this.input) this.input.focus();
		}, 0);
	};

	private onClearRecentSearches = () => {
		this.props.onSearchClear();
		this.setState({ recentSearchesEntries: [] });
		if (this.input) this.input.focus();
	};

	private onDismissResults = () => {
		this.onBlur();
		if (this.input) this.input.focus();
	};

	private onClickEntry = (entry: api.NavEntry, event: any) => {
		const { query, recentSearchesEntries } = this.state;
		this.setState({ query: '', resultsQuery: '' });

		if (~recentSearchesEntries.indexOf(entry)) {
			this.props.onSearchSave(entry.label);
		} else {
			this.props.onSearchSave(query);
		}

		this.clearFocus();
		this.blurInput();
	};

	render() {
		const { className, insideHero } = this.props;
		const focused = this.state.focused;
		const classes = cx(bem.b({ focused, hero: insideHero }), className);
		return (
			<div className={classes} onFocus={this.onFocus} onBlur={this.onBlur} onMouseDown={focused && this.onMouseDown}>
				{this.renderForm()}
				{this.renderResults()}
			</div>
		);
	}

	private renderForm() {
		const { query, resultsQuery, focused, erroredQuery } = this.state;
		const trimmed = query.trim();
		const isErrored = erroredQuery && erroredQuery === trimmed;
		const pending = !isErrored && trimmed !== resultsQuery;
		const ariaLabel = '@{nav_search_aria|Catalogue Search}';
		return (
			<IntlFormatter
				elementType="form"
				ref={this.onFormRef}
				className={bem.e('form')}
				onSubmit={this.onSubmit}
				onMouseDown={!focused && this.onMouseDown}
				role="search"
				formattedProps={{ 'aria-label': ariaLabel }}
			>
				<TriggerProvider trigger={DomTriggerPoints.SearchBar}>
					<IntlFormatter
						elementType="input"
						ref={this.onInputRef}
						className={bem.e('input')}
						value={query}
						onChange={this.onQueryChange}
						onClick={this.onInputClick}
						formattedProps={{
							placeholder: focused ? '@{search_header_placeholder|Search}' : undefined,
							'aria-label': ariaLabel
						}}
					/>
				</TriggerProvider>
				{pending ? (
					<Spinner className={bem.e('icon')} />
				) : (
					<IntlFormatter
						elementType="button"
						className={bem.e('icon')}
						onClick={focused ? this.navigateToSearchPage : undefined}
						tabIndex={query ? undefined : -1}
						aria-hidden={!query}
						formattedProps={query ? { 'aria-label': '@{search_header_all_label|Show all results}' } : undefined}
					>
						<SearchIcon />
					</IntlFormatter>
				)}
			</IntlFormatter>
		);
	}

	private renderResults() {
		const { focused, query, recentSearchesEntries, erroredQuery, menuEdgePadding } = this.state;
		const trimmed = query.trim();
		const isErrored = erroredQuery && erroredQuery === trimmed;
		const resultsQuery = query ? this.state.resultsQuery : '';
		if (!focused || (!isErrored && !resultsQuery && !recentSearchesEntries.length)) return;
		return (
			<div className={bem.e('menu-container')}>
				<DropMenu
					autoFocus={false}
					captureFocus={false}
					onDismiss={this.onDismissResults}
					edgePadding={menuEdgePadding}
				>
					<HeaderSearchResults
						query={resultsQuery}
						errored={isErrored}
						itemEntries={this.state.itemEntries}
						personEntries={this.state.personEntries}
						recentSearchesEntries={this.state.recentSearchesEntries}
						onClear={this.onClearRecentSearches}
						onShowAll={this.navigateToSearchPage}
						onClickEntry={this.onClickEntry}
					/>
				</DropMenu>
			</div>
		);
	}
}
