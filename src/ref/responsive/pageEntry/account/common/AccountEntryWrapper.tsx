import * as React from 'react';
import * as cx from 'classnames';
import CtaButton, { CtaButtonOrdinal } from 'ref/responsive/component/CtaButton';
import IntlFormatter, { IntlValue } from 'ref/responsive/component/IntlFormatter';
import Link from 'shared/component/Link';
import { Bem } from 'shared/util/styles';

import './AccountEntryWrapper.scss';

const bem = new Bem('account-entry');

interface AccountEntryWrapperProps {
	buttonPath?: string;
	buttonDisabled?: boolean;
	buttonLabel?: string;
	title?: IntlValue;
	className?: string;
	children: React.ReactNode;
	onClick?: (e?) => void;
	ordinal?: CtaButtonOrdinal;
}

export default class AccountEntryWrapper extends React.Component<AccountEntryWrapperProps, any> {
	static defaultProps = {
		ordinal: 'secondary',
		buttonLabel: `@{account_common_row_button_label|Manage}`
	};

	render() {
		const { children, title, className } = this.props;
		return (
			<div className={cx(bem.b(), className)}>
				<div className={bem.e('header')}>
					<IntlFormatter elementType="h4" className={bem.e('title')}>
						{title}
					</IntlFormatter>
					{this.renderButton()}
				</div>
				{children}
			</div>
		);
	}

	private renderButton() {
		const { buttonLabel, buttonPath, buttonDisabled, ordinal, onClick } = this.props;
		if (!onClick && !buttonPath) return false;
		const button = (
			<IntlFormatter
				elementType={CtaButton}
				className={bem.e('action-btn')}
				disabled={buttonDisabled}
				onClick={onClick}
				componentProps={{
					ordinal,
					focusable: !buttonPath
				}}
			>
				{buttonLabel}
			</IntlFormatter>
		);

		return buttonPath ? <Link to={buttonPath}>{button}</Link> : button;
	}
}
