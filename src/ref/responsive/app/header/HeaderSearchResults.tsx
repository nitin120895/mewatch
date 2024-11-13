import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { sanitizeForRegExp } from 'shared/util/strings';
import Link from 'shared/component/Link';
import NavEntryLink from '../nav/NavEntryLink';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './HeaderSearchResults.scss';

interface HeaderSearchResultsProps extends React.Props<any> {
	query: string;
	errored: boolean;
	itemEntries: api.NavEntry[];
	personEntries: api.NavEntry[];
	recentSearchesEntries: api.NavEntry[];
	onClear: () => void;
	onShowAll: () => void;
	onClickEntry: (entry: api.NavEntry, event: any) => void;
}

const bem = new Bem('header-search-results');

export default class HeaderSearchResults extends React.Component<HeaderSearchResultsProps, any> {
	constructor(props) {
		super(props);
	}

	render() {
		return <div className={bem.b()}>{this.renderBody()}</div>;
	}

	private onClickClear = e => {
		e.preventDefault();
		this.props.onClear();
	};

	private onClickShowAll = e => {
		e.preventDefault();
		this.props.onShowAll();
	};

	private renderBody() {
		const { query, itemEntries, personEntries, errored } = this.props;
		if (errored) {
			return this.renderMessage('@{search_header_errored_message|An error occurred}');
		} else if (query) {
			const hasResults = itemEntries.length || personEntries.length;
			return hasResults ? this.renderResults() : this.renderMessage('@{search_header_empty_message|No results found}');
		}
		return this.renderRecentSearches();
	}

	private renderRecentSearches() {
		const { recentSearchesEntries } = this.props;
		return (
			<div className={bem.e('recent')}>
				<IntlFormatter className={bem.e('recent-title')}>
					{'@{search_header_recent_heading|Recent Searches}'}
				</IntlFormatter>
				{recentSearchesEntries.map(this.renderEntry)}
				<IntlFormatter
					elementType={Link}
					className={bem.e('clear')}
					onClick={this.onClickClear}
					componentProps={{ to: '#' }}
				>
					{'@{search_header_clear_label|Clear recent searches}'}
				</IntlFormatter>
			</div>
		);
	}

	private renderResults() {
		return (
			<div className={bem.e('results')}>
				{this.renderItemEntries()}
				{this.renderPersonEntries()}
				<IntlFormatter
					elementType={Link}
					className={bem.e('show-all')}
					onClick={this.onClickShowAll}
					componentProps={{ to: '#' }}
				>
					{'@{search_header_all_label|See all results}'}
				</IntlFormatter>
			</div>
		);
	}

	private renderItemEntries() {
		const itemEntries = this.props.itemEntries;
		if (!itemEntries || !itemEntries.length) return;
		return <div className={bem.e('items')}>{itemEntries.map(this.renderEntry)}</div>;
	}

	private renderPersonEntries() {
		const personEntries = this.props.personEntries;
		if (!personEntries || !personEntries.length) return;
		const jsx = personEntries.map(this.renderEntry);
		for (let i = 1; i < jsx.length; i += 2) {
			jsx.splice(
				i,
				0,
				<span key={`pipe-${i}`} className={bem.e('pipe')}>
					|
				</span>
			);
		}
		return <div className={bem.e('people')}>{jsx}</div>;
	}

	private renderEntry = (entry: api.NavEntry) => {
		const isRecentSearchEntry = !!~this.props.recentSearchesEntries.indexOf(entry);
		return (
			<NavEntryLink
				className={bem.e('link')}
				key={entry.label}
				entry={entry}
				onClick={this.props.onClickEntry}
				renderLabel={isRecentSearchEntry ? undefined : this.renderEntryLabel}
			/>
		);
	};

	private renderEntryLabel = (entry: api.NavEntry) => {
		const query = sanitizeForRegExp(this.props.query);
		const regex = new RegExp(`(${query})`, 'ig');
		const __html = entry.label.replace(regex, '<b>$1</b>');
		return <span dangerouslySetInnerHTML={{ __html }} />;
	};

	private renderMessage(message: string) {
		return <IntlFormatter className={bem.e('message')}>{message}</IntlFormatter>;
	}
}
