import * as React from 'react';
import Link from 'shared/component/Link';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import Scrollable from 'ref/responsive/component/Scrollable';

import './SeasonList.scss';

interface SeasonListProps {
	className?: string;
	seasons: api.ItemSummary[];
	selectedSeasonId: string;
	itemClassName?: string;
	reverse?: boolean;
	scrollable?: boolean;
}

const bem = new Bem('d1-season-list');

export default class SeasonList extends React.Component<SeasonListProps, any> {
	render() {
		const { reverse, scrollable } = this.props;
		let seasons = this.props.seasons;

		if (!seasons || !seasons.length) {
			return false;
		}

		if (reverse) seasons = seasons.slice(0).reverse();

		return scrollable ? this.renderScrollable(seasons) : this.renderList(seasons);
	}

	private renderScrollable = seasons => {
		const { className } = this.props;
		return (
			<Scrollable className={cx(bem.b(), className)} length={seasons.length} arrowClassname={bem.e('arrow')}>
				{seasons.map(this.renderItem)}
			</Scrollable>
		);
	};

	private renderList = seasons => {
		const { className } = this.props;
		return <ul className={cx(bem.b('list'), className)}>{seasons.map(this.renderItem)}</ul>;
	};

	private renderItem = (season, index) => {
		const { selectedSeasonId, itemClassName, scrollable } = this.props;
		const active = season.id === selectedSeasonId;
		const className = cx(bem.e('item', { active, scrollable, list: !scrollable }), itemClassName);
		const Component = scrollable ? 'div' : 'li';
		return (
			<Component key={season.id} className={className}>
				<IntlFormatter
					elementType={Link}
					className={bem.e('link')}
					componentProps={{ to: season.path }}
					values={{ season: season.seasonNumber }}
				>
					{'@{itemDetail_seasonList_season_label|Season {season}}'}
				</IntlFormatter>
			</Component>
		);
	};
}
