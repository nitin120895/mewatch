import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { FormattedDate, FormattedNumber } from 'react-intl';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './BillingHistoryItem.scss';

interface BillingHistoryItemProps {
	purchase: api.PurchaseExtended;
}

const bem = new Bem('billing-history-item');

export default class BillingHistoryItem extends React.PureComponent<BillingHistoryItemProps> {
	render() {
		const { purchase } = this.props;
		const { authorizationDate, currency, total, title, paymentMethod } = purchase;

		return (
			<div className={bem.b()}>
				<div className="column-1">
					<FormattedDate value={authorizationDate} year="2-digit" month="2-digit" day="2-digit" />
				</div>
				<div className="column-2">
					<div className={bem.e('title')}>{title}</div>
				</div>
				<div className="column-3">{this.renderPaymentMethod(paymentMethod)}</div>
				<div className="column-4">
					<FormattedNumber value={total} currency={currency} style="currency" />
				</div>
			</div>
		);
	}

	private renderPaymentMethod(paymentMethod: api.PaymentMethod) {
		switch (paymentMethod && paymentMethod.type) {
			case 'Card':
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
			case 'Telco':
				return <IntlFormatter elementType="div">{'@{account.billing.telco|Telecom Billing}'}</IntlFormatter>;
			case 'Apple':
			case 'Google':
				return <IntlFormatter elementType="div">{'@{account.billing.inAppPurchase|In-App}'}</IntlFormatter>;
			case 'Gift':
				return <IntlFormatter elementType="div">{'@{subscription_payment_method_gift|Gift}'}</IntlFormatter>;
		}
	}
}
