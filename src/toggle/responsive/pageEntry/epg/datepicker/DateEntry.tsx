import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { getColumnClasses } from 'ref/responsive/util/grid';
import { FormattedDate } from 'react-intl';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { compareDate } from 'shared/util/dates';

interface DateEntryProps {
	date: Date;
	index: number;
	onClick: (date, index) => void;
	isActive: boolean;
}

const bemDateEntry = new Bem('date-entry');
const columns: grid.BreakpointColumn[] = [{ phablet: 24 }, { tablet: 4 }, { tabletLandscape: 3 }];

export default class DateEntry extends React.PureComponent<DateEntryProps> {
	render() {
		const { date, isActive } = this.props;
		const today = new Date();
		const dateEntryClasses: any = cx(
			`${bemDateEntry.e('grid-cell')} ${bemDateEntry.e('flex-container')}`,
			{ isActive },
			...getColumnClasses(columns)
		);

		return (
			<div key={date.toString()} onClick={this.onDateEntryClick} className={dateEntryClasses}>
				<div className={bemDateEntry.e('day')}>
					{compareDate(date, today) === 0 ? (
						<IntlFormatter>{'@{epg_datepicker_label_today}'}</IntlFormatter>
					) : (
						<FormattedDate value={date} weekday="short" />
					)}
				</div>

				<div className={bemDateEntry.e('date')}>
					<FormattedDate value={date} day="numeric" />
					{'/'}
					<FormattedDate value={date} month="numeric" />
				</div>
			</div>
		);
	}

	private onDateEntryClick = () => {
		const { index, onClick, date } = this.props;
		onClick(date, index);
	};
}
