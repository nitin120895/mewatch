import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { ALL_SPORTS_ID } from 'toggle/responsive/pageEntry/gamesSchedule/GamesSchedule';

import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import SportsCarousel from 'toggle/responsive/pageEntry/gamesSchedule/SportsCarousel';
import SportsDropdown from 'toggle/responsive/pageEntry/gamesSchedule/SportsDropdown';

import './SportsSelector.scss';

const bem = new Bem('sports-selector');

interface Props {
	list: [];
	selectedSports: string[];
	onSelectSport: (selectedSports: any) => void;
	collapsed: boolean;
	onToggleDisplay?: () => void;
	isCollapsible?: boolean;
}

class SportsSelector extends React.Component<Props> {
	onReset = () => {
		this.props.onSelectSport(ALL_SPORTS_ID);
	};

	render() {
		/* tslint:disable-next-line:no-null-keyword */
		if (_SSR_) return null;

		const { list, collapsed, onToggleDisplay, onSelectSport, selectedSports } = this.props;
		const numSportsSelected = selectedSports.length === 0 ? list.length - 1 : selectedSports.length;
		const selectorClass = collapsed ? 'hidden' : '';
		const showReset = selectedSports.length > 0;

		return (
			<div className={bem.b()}>
				{!collapsed && <div className={bem.e('overlay')} onClick={onToggleDisplay} />}
				<div className={bem.e('header', !collapsed && 'open')}>
					<button className={bem.e('title')} onClick={onToggleDisplay}>
						<IntlFormatter>{'@{games_schedule_sports_select|Filter by Sports}'}</IntlFormatter>
						<span className={bem.e('num-selected')}> ({numSportsSelected})</span>
						<div className={cx(bem.e('btn-toggle'), { expanded: !collapsed })} />
					</button>

					{showReset && (
						<button className={bem.e('reset')} onClick={this.onReset}>
							<IntlFormatter>{'@{games_schedule_reset_label|Reset}'}</IntlFormatter>
						</button>
					)}
				</div>

				<div className={selectorClass}>
					<SportsDropdown
						className={bem.e('dropdown')}
						list={list}
						selectedSports={selectedSports}
						onSelectSport={onSelectSport}
						onDoneClick={onToggleDisplay}
					/>

					<div className="grid-margin">
						<SportsCarousel
							className={bem.e('carousel')}
							list={list}
							selectedSports={selectedSports}
							onSelectSport={onSelectSport}
						/>
					</div>
				</div>
				<div className={bem.e('gradient')} />
			</div>
		);
	}
}

export default SportsSelector;
