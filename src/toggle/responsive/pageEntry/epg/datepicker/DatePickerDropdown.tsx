import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { compareDate } from 'shared/util/dates';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { FormattedDate } from 'react-intl';

import './DatePickerDropdown.scss';

interface DatePickerDropdownProps {
	selectedOption: Date;
	onClick: (selectedOption: Date) => void;
}

const bem = new Bem('date-picker-dropdown');

function selectOption(selectedOption, onClick) {
	onClick(selectedOption);
}

export default function DatePickerDropdown({ selectedOption, onClick }: DatePickerDropdownProps) {
	const today = new Date();

	return (
		<div className={cx(bem.b())} onClick={() => selectOption(selectedOption, onClick)}>
			<div className={bem.e('dropdown-label')}>
				{compareDate(selectedOption, today) === 0 ? (
					<IntlFormatter>{'@{epg_datepicker_label_today}'}</IntlFormatter>
				) : (
					<FormattedDate value={selectedOption} weekday="short" />
				)}
				{', '}
				<FormattedDate value={selectedOption} day="2-digit" /> <FormattedDate value={selectedOption} month="long" />
			</div>
			<div className={bem.e('svg-icon')} />
		</div>
	);
}
