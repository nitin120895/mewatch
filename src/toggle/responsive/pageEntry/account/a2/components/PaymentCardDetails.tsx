import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import CtaButton from 'ref/responsive/component/CtaButton';
import { renderIcon } from 'toggle/responsive/util/subscriptionUtil';

import './PaymentCardDetails.scss';

const bem = new Bem('card-details');

interface Props {
	card: api.PaymentMethod;
	removeCard?: (e?) => void;
}

export default function PaymentCardDetails(props: Props) {
	const { brand, isExpired, expiryMonth, expiryYear, lastDigits } = props.card;
	const { removeCard } = props;

	return (
		<div className={bem.b()}>
			{renderIcon(brand)}
			<div className={bem.e('information')}>
				<div className={bem.e('brand-value')}>
					{brand} XXXX {lastDigits}
				</div>
				<IntlFormatter tagName="div" className={bem.e('expiry')}>
					{'@{payment_expiry_label}'}: {expiryMonth}
					{'/'}
					{expiryYear}{' '}
					{isExpired && (
						<IntlFormatter tagName="div" className={bem.e('expired')}>
							{'@{payment_expired_label}'}
						</IntlFormatter>
					)}
				</IntlFormatter>
			</div>
			{removeCard && (
				<CtaButton className={bem.e('remove-card')} ordinal="naked" theme="light" onClick={removeCard}>
					<IntlFormatter>{'@{account.billing.removeCard}'}</IntlFormatter>
				</CtaButton>
			)}
		</div>
	);
}
