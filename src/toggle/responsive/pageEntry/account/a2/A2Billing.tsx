import * as React from 'react';
import AccountEntryWrapper from 'ref/responsive/pageEntry/account/common/AccountEntryWrapper';
import A2PaymentMethod from 'ref/responsive/pageEntry/account/a2/components/A2PaymentMethod';
import { Bem } from 'shared/util/styles';
import { getPaymentMethods, getAccountUser, getAccount } from 'shared/service/action/account';
import { connect } from 'react-redux';
import { A2Billing as template } from 'shared/page/pageEntryTemplate';
import { REMOVE_SUBSCRIPTION_ENTRY_POINT } from 'shared/page/pageWorkflow';
import { AccountBilling as billingPageKey, PricePlan as subscriptionsPageKey } from 'shared/page/pageKey';
import { omit, get } from 'shared/util/objects';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Link from 'shared/component/Link';
import SubscriptionItem from '../../../app/subscription/SubscriptionItem';
import { extendSubscriptionsListWithPriceInfo, getActiveSubscriptions, getExpiredSubscriptions } from '../accountUtils';
import { EXPIRED } from 'toggle/responsive/util/subscriptionUtil';
import { getExpiredSubscriptionTitle, getViewAllButtonLabel } from '../../subscription/subscriptionsUtils';
import { getSubscriptionDetails } from 'shared/account/accountWorkflow';

import './A2Billing.scss';

const bem = new Bem('a2');

interface OwnProps extends PageEntryPropsBase {
	account?: api.Account;
}

interface StateProps {
	paymentMethod?: api.PaymentMethod;
	subscriptions?: api.Subscription[];
	plans?: api.PricePlan[];
	accountInfo?: api.Account;
}

interface DispatchProps {
	getAccountUser: typeof getAccountUser;
	getPaymentMethods: typeof getPaymentMethods;
	getSubscriptionDetails: typeof getSubscriptionDetails;
	getAccount: typeof getAccount;
	resetSubscriptionEntryPoint: () => void;
}

export type Props = OwnProps & StateProps & DispatchProps;

export class A2Billing extends React.Component<Props> {
	componentDidMount() {
		const { getAccountUser, getPaymentMethods, getSubscriptionDetails, resetSubscriptionEntryPoint } = this.props;
		resetSubscriptionEntryPoint();
		Promise.all([getAccountUser(), getPaymentMethods(), getSubscriptionDetails()]);
		document.addEventListener('visibilitychange', this.visibilityChange);
	}

	componentWillUnmount() {
		document.removeEventListener('visibilitychange', this.visibilityChange);
	}

	private visibilityChange = () => {
		if (!document.hidden) {
			const { getAccountUser, accountInfo, getAccount } = this.props;
			getAccountUser().then(res => {
				let profileChanged = false;
				for (let item in res.paypayload) {
					if (res.paypayload[item] !== accountInfo[item]) profileChanged = true;
				}
				if (!res.error || profileChanged) {
					getAccount();
				}
			});
		}
	};

	render() {
		const props = omit(this.props, 'paymentMethod', 'subscription') as Props;
		const subscriptionsCount = get(props, 'subscriptions.length');

		const buttonLabel = '@{account_common_row_button_label|Manage}';

		const buttonPath = subscriptionsCount ? `@${billingPageKey}` : `@${subscriptionsPageKey}`;

		return (
			<div className={'form-white'}>
				<AccountEntryWrapper buttonLabel={buttonLabel} buttonPath={buttonPath} {...props}>
					{this.renderSections()}
				</AccountEntryWrapper>
			</div>
		);
	}

	renderSections() {
		const { paymentMethod, subscriptions } = this.props;
		const activeSubscriptionsInfo = getActiveSubscriptions(subscriptions);
		const expiredSubscriptionsInfo = getExpiredSubscriptions(subscriptions);
		return (
			<div className={bem.b()}>
				{activeSubscriptionsInfo &&
					activeSubscriptionsInfo.length > 0 &&
					this.renderSubscriptions(activeSubscriptionsInfo, '@{subscription_active_subscription_title}', false)}

				{expiredSubscriptionsInfo &&
					expiredSubscriptionsInfo.length > 0 &&
					this.renderSubscriptions(
						expiredSubscriptionsInfo,
						getExpiredSubscriptionTitle(expiredSubscriptionsInfo.length),
						true
					)}

				{paymentMethod && <A2PaymentMethod {...paymentMethod} />}
			</div>
		);
	}

	renderSubscriptions = (subscriptions, title, expired) => {
		const { plans } = this.props;
		const extendedSubscriptions = extendSubscriptionsListWithPriceInfo(subscriptions, plans);
		return (
			<div className={bem.e('sub-section')}>
				<div className={bem.e('title')}>
					<IntlFormatter values={{ count: subscriptions.length }}>{title}</IntlFormatter>
				</div>

				{expired ? (
					<Link className={bem.e('view-all')} to={`@${billingPageKey}?${EXPIRED}`}>
						<IntlFormatter>{getViewAllButtonLabel(subscriptions.length)}</IntlFormatter>
					</Link>
				) : (
					extendedSubscriptions.map(subscription => (
						<SubscriptionItem
							key={subscription.id}
							plan={subscription}
							isPrimaryProfile={true}
							expired={expired}
							fromAccount={true}
						/>
					))
				)}
			</div>
		);
	};
}

function mapStateToProps({ account, app }: state.Root) {
	if (!account.info) return {};
	const paymentMethods = get(account, 'paymentData.paymentMethods') || [];
	const defaultPaymentId = account.info && account.info.defaultPaymentMethodId;
	const subscriptions = account.subscriptionDetails;
	const plans = app.config.subscription.plans;
	const paymentMethod = paymentMethods.find(method => method.id === defaultPaymentId);
	const accountInfo = account.info;

	return { paymentMethod, subscriptions, plans, accountInfo };
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		getAccountUser: () => dispatch(getAccountUser()),
		getPaymentMethods: () => dispatch(getPaymentMethods()),
		getSubscriptionDetails: () => dispatch(getSubscriptionDetails()),
		getAccount: () => dispatch(getAccount()),
		resetSubscriptionEntryPoint: () => dispatch({ type: REMOVE_SUBSCRIPTION_ENTRY_POINT })
	};
}

const Component: any = connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(A2Billing);
Component.template = template;

export default Component;
