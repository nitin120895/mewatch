import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import PaymentMethodIcon from 'ref/responsive/component/icons/paymentMethods';
import PaymentMethodStatus from './PaymentMethodStatus';

import './PaymentMethodRow.scss';

const bem = new Bem('payment-method-row');

interface PaymentMethodRowProps {
	defaultPaymentMethodId?: string;
	method: api.PaymentMethod;
}

export default function PaymentMethodRow({ defaultPaymentMethodId, method }: PaymentMethodRowProps) {
	const { brand, lastDigits, expiryYear, expiryMonth } = method;
	const Icon = PaymentMethodIcon[brand] || 'span';
	return (
		<div className={bem.b()}>
			<div className={bem.e('logo')}>
				<Icon className={bem.e('icon')} />
			</div>
			<div className={bem.e('info')}>
				<IntlFormatter
					className={bem.e('digits')}
					elementType="div"
					values={{
						lastFourDigits: lastDigits.toString().padStart(4, '0')
					}}
				>
					{`@{account.billing.lastFourDigits.icu|XXXX {lastFourDigits}}`}
				</IntlFormatter>
				<IntlFormatter
					className={bem.e('exp')}
					elementType="div"
					values={{
						mm: expiryMonth.toString().padStart(2, '0'),
						yy: expiryYear.toString().substr(2, 2)
					}}
				>
					{`@{account.billing.expiry.icu|Exp {mm}/{yy}}`}
				</IntlFormatter>
			</div>
			<PaymentMethodStatus defaultPaymentMethodId={defaultPaymentMethodId} method={method} />
		</div>
	);
}
