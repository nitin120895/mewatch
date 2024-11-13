import * as React from 'react';
import * as cx from 'classnames';
import Link from 'shared/component/Link';
import { ESearch } from 'shared/page/pageKey';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import TriggerProvider from 'shared/analytics/components/TriggerProvider';
import { DomTriggerPoints } from 'shared/analytics/types/types';

import './RecentSearches.scss';

interface RecentSearchesProps extends React.Props<any> {
	onClearSearches: () => void;
	onSearchSave: (query: string) => void;
	searches: string[];
	searchPagePath: string;
	pageKey: string;
}

const bem = new Bem('recent-searches');

export default class RecentSearches extends React.Component<RecentSearchesProps, any> {
	private onClearSearches = (event: React.SyntheticEvent<any>) => {
		event.preventDefault();
		this.props.onClearSearches();
	};

	render() {
		const { searches } = this.props;
		return (
			<section className={bem.b()}>
				<header className={bem.e('header')}>
					<IntlFormatter elementType="h2" className={bem.e('heading')}>
						{'@{search_recent_heading|Recent Searches}'}
					</IntlFormatter>
					{this.renderClearButton('top')}
				</header>
				<ul className={cx(bem.e('list'))}>{searches.map(this.renderSearchItem)}</ul>
				{this.renderClearButton('bottom')}
			</section>
		);
	}

	private renderSearchItem = (item, index) => {
		const { pageKey } = this.props;
		const location =
			pageKey === ESearch ? `@esearch?q=${encodeURIComponent(item)}` : `@search?q=${encodeURIComponent(item)}`;
		return (
			<TriggerProvider trigger={DomTriggerPoints.RecentSearch} key={item}>
				<li key={item} className={bem.e('item')}>
					<Link to={location} className={bem.e('link')} onClick={e => this.props.onSearchSave(item)}>
						{item}
					</Link>
				</li>
			</TriggerProvider>
		);
	};

	private renderClearButton(position: 'bottom' | 'top') {
		const labelId = 'search_recent_clear_label_' + position;
		const fallbackLabel = position === 'bottom' ? 'clear recent searches' : 'Clear';
		return (
			<IntlFormatter
				elementType="button"
				className={bem.e('clear', position)}
				type="button"
				onClick={this.onClearSearches}
			>
				{`@{${labelId}|${fallbackLabel}}`}
			</IntlFormatter>
		);
	}
}
