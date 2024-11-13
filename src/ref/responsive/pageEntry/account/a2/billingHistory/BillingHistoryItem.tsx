import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { FormattedDate, FormattedNumber } from 'react-intl';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CreditCardIcon from 'ref/responsive/component/icons/CreditCard';
import HelpCircle from 'ref/responsive/component/HelpCircle';

import './BillingHistoryItem.scss';

interface BillingHistoryItemProps {
	purchase: api.PurchaseExtended;
	paymentMethod?: api.PaymentMethod;
}

const bem = new Bem('billing-history-item');

export default class BillingHistoryItem extends React.Component<BillingHistoryItemProps, any> {
	render() {
		const { purchase, paymentMethod } = this.props;
		const { authorizationDate, currency, total, title } = purchase;

		return (
			<div className={bem.b()}>
				<div className={bem.e('description')}>
					<div className={bem.e('title')}>{title}</div>
				</div>
				<div className={bem.e('amount')}>
					<FormattedNumber value={total} currency={currency} style="currency" />
				</div>
				<div className={bem.e('info')}>
					<span className={bem.e('method')}>{this.renderPaymentMethod(paymentMethod)}</span>
					<span className={bem.e('date')}>
						<FormattedDate value={authorizationDate} year="2-digit" month="2-digit" day="2-digit" />
					</span>
				</div>
			</div>
		);
	}

	private renderPaymentMethod(paymentMethod: api.PaymentMethod) {
		if (paymentMethod) {
			return (
				<IntlFormatter
					className={bem.e('digits')}
					elementType="div"
					values={{
						lastFourDigits: paymentMethod.lastDigits.toString().padStart(4, '0')
					}}
				>
					{`${paymentMethod.brand} @{account.billing.lastFourDigits|XXXX {lastFourDigits}}`}
				</IntlFormatter>
			);
		}
		return (
			<div className={bem.e('unavail')}>
				<CreditCardIcon className={bem.e('no-card')} />
				<HelpCircle>{'@{account.billing.unavailableTooltip|Payment Method Unavailable}'}</HelpCircle>
			</div>
		);
	}
}
