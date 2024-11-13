import * as React from 'react';
import * as cx from 'classnames';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';
import { ALL_SPORTS_ID } from 'toggle/responsive/pageEntry/gamesSchedule/GamesSchedule';

import CtaButton from 'toggle/responsive/component/CtaButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import TickIcon from 'toggle/responsive/component/modal/TickIcon';

import './SportsDropdown.scss';

const bem = new Bem('sports-dropdown');
const bemItem = new Bem(bem.e('item'));

interface Props {
	className?: string;
	list: [];
	selectedSports: string[];
	onSelectSport: (selectedSports: any) => void;
	onDoneClick: () => void;
}

class SportsDropdown extends React.Component<Props, any> {
	renderSport = sport => {
		const { selectedSports, onSelectSport } = this.props;
		const thumbnail = get(sport, 'images.custom');
		const title = get(sport, 'title');
		const id = get(sport, 'customFields.sport');
		const isSelected = (selectedSports.length === 0 && id === ALL_SPORTS_ID) || selectedSports.indexOf(id) > -1;

		return (
			<div
				key={id}
				className={bemItem.b({
					active: isSelected
				})}
				onClick={() => onSelectSport(id)}
			>
				<img className={bemItem.e('thumbnail')} src={thumbnail} />
				<div className={bemItem.e('title')}>{title}</div>

				{isSelected && (
					<div className={bemItem.e('tick')}>
						<TickIcon className={bemItem.e('icon')} width={25} height={22} />
					</div>
				)}
			</div>
		);
	};

	render() {
		/* tslint:disable-next-line:no-null-keyword */
		if (_SSR_) return null;

		const { className, list, onDoneClick } = this.props;

		return (
			<div className={cx(bem.b(), className)}>
				<div className={bem.e('list')}>{list.map(sport => this.renderSport(sport))}</div>

				<CtaButton className={bem.e('cta')} ordinal="primary" theme="light" onClick={onDoneClick}>
					<IntlFormatter>{'@{games_schedule_done_label}'}</IntlFormatter>
				</CtaButton>
			</div>
		);
	}
}

export default SportsDropdown;
