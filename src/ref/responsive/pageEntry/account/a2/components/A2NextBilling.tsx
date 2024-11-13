import * as React from 'react';
import { FormattedDate } from 'react-intl';
import A2Section from './A2Section';

interface A2NextBillingProps {
	date: Date | string | number;
}

export default function A2NextBilling({ date }: A2NextBillingProps) {
	return (
		<A2Section sectionTitle={'@{account_a2_next_billing_date_label|Next billing date:}'} primary>
			<div className="truncate">
				<FormattedDate value={date} year="numeric" month="short" day="numeric" />
			</div>
		</A2Section>
	);
}
