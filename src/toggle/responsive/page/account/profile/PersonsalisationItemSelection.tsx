import * as React from 'react';
import * as cx from 'classnames';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { getColumnClasses } from 'ref/responsive/util/grid';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';
import Tick from 'toggle/responsive/component/icons/Tick';
import { pageSize, findCategoryByGenreAliases } from '../../../util/PersonalisationUtil';

const bem = new Bem('personalisation-step2');

import './PersonalisationItemSelection.scss';

interface Props {
	items: api.ItemDetail[];
	onSelectItems: (itemIds: string[]) => void;
	categories: api.ItemList[];
	selectedCategories: string[];
	selectedItemIds: string[];
	scrollable: boolean;
	totalPage: number;
	getRecommendationList: (page: number) => void;
}

export default class PersonalisationItemSelection extends React.PureComponent<Props> {
	shouldComponentUpdate = () => true;

	onClick = id => {
		const { selectedItemIds } = this.props;
		this.findSelectedItemId(id) ? selectedItemIds.splice(selectedItemIds.indexOf(id), 1) : selectedItemIds.push(id);
		this.props.onSelectItems(selectedItemIds);
	};

	findSelectedItemId = (selected): string => this.props.selectedItemIds.find(id => id === selected);

	onScroll = e => {
		e.preventDefault();
		const { items = [], totalPage } = this.props;
		const bottom = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
		const page = items.length / pageSize + 1;
		if (bottom && page <= totalPage) this.props.getRecommendationList(page);
	};

	render() {
		const { selectedCategories, items = [], scrollable } = this.props;

		return (
			<div className={bem.b()}>
				{selectedCategories.length === 1 && this.renderSelectedCategoryList()}
				<div className={bem.e('items', { scrollable })} onScroll={this.onScroll}>
					{items.map(item => this.renderItem(item))}
				</div>
			</div>
		);
	}

	renderSelectedCategoryList() {
		const { selectedCategories, categories } = this.props;
		const titleColumns: grid.BreakpointColumn[] = [{ phone: 11 }, { phablet: 11 }, { tablet: 12 }];

		if (selectedCategories.length !== 1) return;

		return (
			<div className={cx(bem.e('genre'), ...getColumnClasses(titleColumns))}>
				{selectedCategories.map((genreAlias, index) => {
					const lastItem = index === selectedCategories.length - 1;
					const category = findCategoryByGenreAliases(categories, genreAlias[0]);
					const categoryTitle = (category && category.title) || '';

					return <span key={genreAlias}>{`${categoryTitle}${!lastItem ? ', ' : ''}`}</span>;
				})}
			</div>
		);
	}

	renderItem(item: api.ItemDetail) {
		const src = get(item, 'images.tile');
		const { id, title, secondaryLanguageTitle } = item;
		const columns: grid.BreakpointColumn[] = [{ phone: 11 }, { phablet: 11 }, { tablet: 12 }, { laptop: 24 }];
		return (
			<div className={cx(bem.e('item'), ...getColumnClasses(columns))} onClick={() => this.onClick(id)} key={id}>
				{this.findSelectedItemId(id) && <Tick className={'icon-wrapper'} />}
				<div className={cx(bem.e('image'), { 'no-image': !src })}>
					<img src={src} />
				</div>
				<IntlFormatter elementType="div" className={bem.e('title')}>
					{title}
				</IntlFormatter>
				<IntlFormatter elementType="div" className={bem.e('title')}>
					{secondaryLanguageTitle}
				</IntlFormatter>
			</div>
		);
	}
}
