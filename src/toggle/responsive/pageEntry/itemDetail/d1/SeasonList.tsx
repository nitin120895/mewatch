import * as React from 'react';
import Link from 'shared/component/Link';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import Scrollable from 'ref/responsive/component/Scrollable';
import { subTypeLabels } from 'shared/util/itemUtils';

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

	private renderScrollable = (seasons: api.ItemSummary[]) => {
		const { className } = this.props;
		return (
			<Scrollable
				className={cx(bem.b(), className)}
				length={seasons.length}
				currentIndex={this.getSelectedSeasonIndex(seasons)}
				arrowClassname={bem.e('arrow')}
			>
				{seasons.map(this.renderItem)}
			</Scrollable>
		);
	};

	private getSelectedSeasonIndex = (seasons: api.ItemSummary[]) => {
		const { selectedSeasonId } = this.props;
		let selectedItemIndex = 0;
		seasons.forEach((season, index) => {
			if (season.id === selectedSeasonId) {
				selectedItemIndex = index + 1;
			}
		});

		return selectedItemIndex;
	};

	private renderList = seasons => {
		const { className } = this.props;
		return <ul className={cx(bem.b('list'), className)}>{seasons.map(this.renderItem)}</ul>;
	};

	private renderItem = season => {
		const { selectedSeasonId, itemClassName, scrollable } = this.props;
		const { id, subtype, path, seasonNumber } = season;
		const active = id === selectedSeasonId;
		const className = cx(bem.e('item', { active, scrollable, list: !scrollable }), itemClassName);
		const Component = scrollable ? 'div' : 'li';
		const tabName = subTypeLabels[subtype] || subTypeLabels.EntertainmentSeason;
		return (
			<Component key={id} className={className}>
				<IntlFormatter
					elementType={Link}
					className={bem.e('link')}
					componentProps={{ to: path }}
					values={{ season: seasonNumber }}
				>
					{tabName}
				</IntlFormatter>
			</Component>
		);
	};
}
