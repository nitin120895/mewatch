import * as React from 'react';
import AccountEntryWrapper from 'ref/responsive/pageEntry/account/common/AccountEntryWrapper';
import A2SubscriptionPlan from './components/A2SubscriptionPlan';
import A2NextBilling from './components/A2NextBilling';
import A2PaymentMethod from './components/A2PaymentMethod';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import { getPaymentMethods } from 'shared/service/action/account';
import { connect } from 'react-redux';
import { A2Billing as template } from 'shared/page/pageEntryTemplate';
import { AccountBilling as billingPageKey } from 'shared/page/pageKey';
import { omit } from 'shared/util/objects';

import './A2Billing.scss';

const bem = new Bem('a2');

export interface A2BillingProps extends PageEntryPropsBase {
	getPaymentMethods: () => void;
	paymentMethod?: api.PaymentMethod;
	subscription?: api.Subscription;
	plan?: api.Plan;
}

export class A2Billing extends React.Component<A2BillingProps, any> {
	componentDidMount() {
		this.props.getPaymentMethods();
	}

	render() {
		const props = omit(this.props, 'paymentMethod', 'subscription', 'plan') as A2BillingProps;
		return (
			<div className={'form-white'}>
				<AccountEntryWrapper
					buttonLabel={`@{account_common_row_button_label|Manage}`}
					buttonPath={`@${billingPageKey}`}
					{...props}
				>
					{this.renderSections()}
				</AccountEntryWrapper>
			</div>
		);
	}

	private renderSections() {
		const { paymentMethod, subscription, plan } = this.props;
		if (!paymentMethod && !plan) {
			return (
				<IntlFormatter elementType="p" className={bem.e('no-plan')}>
					{`@{account.billing.noPlanMessage|You haven't subscribed to a plan yet.}`}
				</IntlFormatter>
			);
		}
		return (
			<div className={bem.b()}>
				{plan && this.renderSubscriptionPlan()}
				{subscription && this.renderNextBilling()}
				{paymentMethod && <A2PaymentMethod {...paymentMethod} />}
			</div>
		);
	}

	private renderSubscriptionPlan() {
		const { price, title, billingPeriodType, currency } = this.props.plan;
		return <A2SubscriptionPlan price={price} title={title} billingPeriodType={billingPeriodType} currency={currency} />;
	}

	private renderNextBilling() {
		const { endDate } = this.props.subscription;
		return endDate && <A2NextBilling date={endDate} />;
	}
}

function mapStateToProps({ account, app }: state.Root) {
	if (!account.info) return {};

	const defaultPaymentId = account.info.defaultPaymentMethodId;
	const subscription = account.info.subscriptions.find(subscription => subscription.status === 'Active');
	const plan = app.config.subscription.plans.find(plan => plan.id === subscription.planId);
	const paymentMethod = account.paymentMethods && account.paymentMethods.find(method => method.id === defaultPaymentId);

	return { paymentMethod, subscription, plan };
}

function mapDispatchToProps(dispatch) {
	return {
		getPaymentMethods: () => dispatch(getPaymentMethods())
	};
}

const Component: any = connect<any, any, A2BillingProps>(
	mapStateToProps,
	mapDispatchToProps
)(A2Billing);
Component.template = template;

export default Component;
