import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import A2Section from './A2Section';
import PaymentMethodIcon from 'ref/responsive/component/icons/PaymentMethodIcon';

import './A2PaymentMethod.scss';

const bem = new Bem('a2-payment-method');

export default class A2PaymentMethod extends React.Component<api.PaymentMethod, any> {
	private isExpired() {
		const { expiryMonth: month, expiryYear: year } = this.props;
		const currentDate = new Date();
		const currentYear = currentDate.getFullYear();
		const currentMonth = currentDate.getMonth() + 1;

		return currentYear > year || (currentYear >= year && currentMonth > month);
	}

	render() {
		return (
			<A2Section
				className={bem.b()}
				sectionTitle={'@{account_a2_selected_payment_method_label|Selected payment method}'}
			>
				{this.renderPaymentMethodInfo()}
			</A2Section>
		);
	}

	private renderPaymentMethodInfo() {
		const { brand, lastDigits } = this.props;

		return (
			<div className={bem.e('info')}>
				<PaymentMethodIcon className={bem.e('icon')} type={brand} />
				<IntlFormatter
					elementType="span"
					values={{
						lastFourDigits: lastDigits.toString().padStart(4, '0')
					}}
				>
					{`@{account.billing.lastFourDigits.icu|XXXX {lastFourDigits}} - `}
				</IntlFormatter>
				{this.isExpired() ? this.renderExpired() : this.renderDate()}
			</div>
		);
	}

	private renderDate() {
		const { expiryMonth: month, expiryYear: year } = this.props;
		const expiryMonth = month.toString().padStart(2, '0');
		const expiryYear = year.toString().substr(2, 2);

		return (
			<IntlFormatter
				elementType="span"
				values={{
					mm: expiryMonth,
					yy: expiryYear
				}}
			>
				{`@{account.billing.expiry.icu|Exp {mm}/{yy}}`}
			</IntlFormatter>
		);
	}

	private renderExpired() {
		return (
			<IntlFormatter className={bem.e('expired')} elementType="span">
				{`@{account.billing.expired|Expired}`}
			</IntlFormatter>
		);
	}
}
