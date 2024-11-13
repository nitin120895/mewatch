import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter, { IntlValue } from 'ref/responsive/component/IntlFormatter';
import HelpCircle from 'ref/responsive/component/HelpCircle';

import './PaymentMethodStatus.scss';

const bem = new Bem('payment-method-status');
const updateMessage = ' Please update your billing information.';
const tooltipMessages = {
	active: '',
	expiring: `@{account.billing.expiringTooltip|This payment method is about to expire. ${updateMessage}}`,
	expired: `@{account.billing.expiredTooltip|This payment method has expired. ${updateMessage}}`,
	'default-active': `@{account.billing.defaultTooltip|The selected payment method is the preferred option for any transactions.}`,
	'default-expiring': `@{account.billing.defaultExpiringTooltip|This default payment method is about to expire. ${updateMessage}}`,
	'default-expired': `@{account.billing.defaultExpiredTooltip|This default payment method has expired. ${updateMessage}.}`
};
const EXPIRY_WARNING_MONTH_THRESHOLD = 3;

interface PaymentMethodStatusProps {
	defaultPaymentMethodId: string;
	method: api.PaymentMethod;
}

type PaymentMethodStatusType = 'expired' | 'expiring' | 'active';

export default class PaymentMethodStatus extends React.Component<PaymentMethodStatusProps, any> {
	render() {
		const { defaultPaymentMethodId, method } = this.props;
		const isDefault = defaultPaymentMethodId === method.id;
		const status = getExpirationStatus(method);
		return (
			<div className={bem.b()}>
				{isDefault && (
					<IntlFormatter className={bem.e('default')}>{`@{account.billing.default|Expiring soon}`}</IntlFormatter>
				)}
				{status === 'expiring' && (
					<IntlFormatter className={bem.e('expiring-soon')}>
						{`@{account.billing.expiring|Expiring soon}`}
					</IntlFormatter>
				)}
				{status === 'expired' && (
					<IntlFormatter className={bem.e('expired')}>{`@{account.billing.expired|Expired}`}</IntlFormatter>
				)}
				{renderHelpTooltip(isDefault, status)}
			</div>
		);
	}
}

function renderHelpTooltip(isDefault: boolean, status: PaymentMethodStatusType) {
	const helpTooltipMsg = getStatusToolipMsg(isDefault, status);
	if (!helpTooltipMsg) return false;
	return <HelpCircle className={bem.e('help')}>{helpTooltipMsg}</HelpCircle>;
}

function getExpirationStatus({ expiryYear, expiryMonth }: api.PaymentMethod): PaymentMethodStatusType {
	const now = new Date();
	// setting the expiry date to the last day of the previous month
	const expiry = new Date(expiryYear, expiryMonth - 1, 0, 0, 0, 0, 0).getTime();
	const dateDiff = expiry - now.getTime();
	const expireWarningThreshold = new Date(
		now.getFullYear(),
		now.getMonth() + EXPIRY_WARNING_MONTH_THRESHOLD,
		now.getDate()
	).getTime();
	if (dateDiff <= 0) {
		return 'expired';
	}
	return expiry < expireWarningThreshold ? 'expiring' : 'active';
}

function getStatusToolipMsg(isDefault: boolean, status: PaymentMethodStatusType): IntlValue {
	const key = `${isDefault ? 'default-' : ''}${status}`;
	return tooltipMessages[key];
}
