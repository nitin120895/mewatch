import * as React from 'react';
import { A2Billing, A2BillingProps } from 'ref/responsive/pageEntry/account/a2/A2Billing';

import './A2BillingComponent.scss';

const subscription: api.Subscription = {
	code: '0',
	startDate: new Date(),
	isTrialPeriod: false,
	planId: '429',
	status: 'Active',
	endDate: new Date()
};

const plan: api.Plan = {
	id: '1',
	title: 'Standard',
	tagline: '',
	type: 'Subscription',
	isFeatured: false,
	isActive: true,
	isPrivate: true,
	revenueType: 'TVOD',
	subscriptionCode: 'string',
	alias: '',
	benefits: [],
	billingPeriodType: 'month',
	billingPeriodFrequency: 1,
	hasTrialPeriod: false,
	trialPeriodDays: 0,
	termsAndConditions: 'some terms and conditions',
	currency: 'AUD',
	price: 7.99
};

const paymentMethod: api.PaymentMethod = {
	id: '1',
	description: 'string',
	type: 'Card',
	brand: 'Visa',
	expiryMonth: 12,
	expiryYear: 2022,
	lastDigits: 1122
};

const mock: A2BillingProps = {
	id: 'A2',
	title: 'Subscription & Billing',
	template: 'A2',
	savedState: undefined,
	paymentMethod,
	subscription,
	plan,
	getPaymentMethods: () => {}
};

const mockMastercard: A2BillingProps = {
	...mock,
	paymentMethod: {
		...paymentMethod,
		brand: 'MasterCard'
	},
	plan: {
		...plan,
		title: 'Platinum'
	}
};

const mockAmex: A2BillingProps = {
	...mock,
	paymentMethod: {
		...paymentMethod,
		brand: 'AmericanExpress'
	},
	plan: {
		...plan,
		title: 'Diamond Level Subscription'
	}
};

const mockLongText: A2BillingProps = {
	...mock,
	plan: {
		...plan,
		title: 'Super Amazing Double Diamond Level Subscription'
	}
};

const mockNoSubscription: A2BillingProps = {
	...mock,
	subscription: undefined,
	plan: undefined
};

const mockNoPayment: A2BillingProps = {
	...mock,
	paymentMethod: undefined
};

const mockExpired: A2BillingProps = {
	...mock,
	paymentMethod: {
		...paymentMethod,
		expiryYear: 2017,
		expiryMonth: 10
	}
};

export default class A2BillingPage extends React.Component<PageEntryItemProps, any> {
	render() {
		return (
			<div className="app--account">
				<div className="a2-page-wrapper page">
					<h4 className="a2-section-description">With Visa as payment method</h4>
					<section className="page-entry">
						<A2Billing {...mock} />
					</section>

					<h4 className="a2-section-description">With a really long plan title</h4>
					<section className="page-entry">
						<A2Billing {...mockLongText} />
					</section>

					<h4 className="a2-section-description">With Mastercard as payment method</h4>
					<section className="page-entry">
						<A2Billing {...mockMastercard} />
					</section>

					<h4 className="a2-section-description">With American Express as payment method</h4>
					<section className="page-entry">
						<A2Billing {...mockAmex} />
					</section>

					<h4 className="a2-section-description">Expired Card</h4>
					<section className="page-entry">
						<A2Billing {...mockExpired} />
					</section>

					<h4 className="a2-section-description">Payment with Visa, no subscription info, no next billing info</h4>
					<section className="page-entry">
						<A2Billing {...mockNoSubscription} />
					</section>

					<h4 className="a2-section-description">No payment info provided</h4>
					<section className="page-entry">
						<A2Billing {...mockNoPayment} />
					</section>
				</div>
			</div>
		);
	}
}
