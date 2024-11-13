import * as React from 'react';
import { Bem } from 'shared/util/styles';
import A2Section from './A2Section';
import codeToSymbol from 'ref/responsive/util/codeToSymbol';

import './A2SubscriptionPlan.scss';

interface A2SubscriptionPlanProps {
	price: number;
	billingPeriodType: string;
	title: string;
	currency: string;
}

const bem = new Bem('a2-subscription-plan');

export default function A2SubscriptionPlan({ price, billingPeriodType, title, currency }: A2SubscriptionPlanProps) {
	return (
		<A2Section className={bem.b()} sectionTitle={title} primary>
			<div className={bem.e('price')}>{`${codeToSymbol(currency)}${price}/`}</div>
			<div className={bem.e('period')}>{billingPeriodType}</div>
		</A2Section>
	);
}
