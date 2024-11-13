import * as React from 'react';
import * as cx from 'classnames';
import CtaButton from 'ref/responsive/component/CtaButton';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';

import './AccountActionButtons.scss';

interface AccountActionButtonsProps {
	className?: string;
	primaryLabel?: string;
	secondaryLabel?: string;
	onSubmit?: (e?) => void;
	onCancel?: (e?) => void;
	loading?: boolean;
	disabled?: boolean;
}

const bem = new Bem('account-action-btns');

export default function AccountActionButtons(props: AccountActionButtonsProps) {
	const { className, onSubmit, onCancel, primaryLabel, secondaryLabel, loading, disabled } = props;
	return (
		<div className={cx(className, bem.b())}>
			<IntlFormatter
				elementType={AccountButton}
				className={bem.e('primary')}
				onClick={onSubmit}
				componentProps={{ ordinal: 'primary', type: 'submit', loading, disabled }}
			>
				{primaryLabel || '@{account_common_save_button_label|Save}'}
			</IntlFormatter>
			<IntlFormatter
				elementType={CtaButton}
				className={bem.e('secondary')}
				onClick={onCancel}
				componentProps={{ ordinal: 'secondary', theme: 'light' }}
			>
				{secondaryLabel || '@{account_common_cancel_button_label|Cancel}'}
			</IntlFormatter>
		</div>
	);
}
