import * as React from 'react';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountBilling as billingPageKey } from 'shared/page/pageKey';
import configAccountPage from 'ref/responsive/page/account/common/configAccountPage';
import BillingHistory from 'ref/responsive/pageEntry/account/a2/billingHistory/BillingHistory';
import PaymentMethods from 'ref/responsive/pageEntry/account/a2/paymentMethods/PaymentMethods';
import {
	default as SubscriptionsList,
	SubscriptionsListType
} from '../../pageEntry/account/a2/components/SubscriptionsList';
import { EXPIRED } from 'toggle/responsive/util/subscriptionUtil';
import { Bem } from 'shared/util/styles';
import { getSubscriptionDetails } from 'shared/account/accountWorkflow';
import { pageAnalyticsEvent } from 'shared/analytics/analyticsWorkflow';
import PaymentConfirmationOverlay, {
	PaymentConfirmationOverlayProps
} from 'toggle/responsive/app/subscription/PaymentConfirmationOverlay';

import './AccountBilling.scss';

interface Props extends PageProps {
	account?: api.Account;
	getSubscriptionDetails?: typeof getSubscriptionDetails;
	subscriptions?: state.Account['subscriptionDetails'];
	sendRegisterAnalyticsEvent: () => void;
}

interface State {
	expiredView: boolean;
	showOverlayMessage: boolean;
	overlayProps: PaymentConfirmationOverlayProps;
}

const bem = new Bem('account-billing');

class AccountBilling extends React.PureComponent<Props, State> {
	state = {
		expiredView: false,
		showOverlayMessage: false,
		overlayProps: undefined
	};

	componentDidMount() {
		this.props.getSubscriptionDetails();
		this.updateView();
		this.props.sendRegisterAnalyticsEvent();
	}

	componentDidUpdate(prevProps, prevState) {
		const { getSubscriptionDetails, subscriptions = [] } = this.props;
		if (prevProps.subscriptions && subscriptions.length !== prevProps.subscriptions.length) {
			getSubscriptionDetails();
		}
		this.updateView();
	}

	updateView() {
		const expiredView = window.location.search === `?${EXPIRED}`;
		if (expiredView !== this.state.expiredView) {
			this.setState({ expiredView });
		}
	}

	private setOverlayMessage = (props: PaymentConfirmationOverlayProps) => {
		const onConfirm = () => {
			this.setState({ showOverlayMessage: false });
		};
		const overlayProps = { ...props, onConfirm };
		this.setState({ showOverlayMessage: true, overlayProps });
	};

	render() {
		const { account } = this.props;
		if (!account) return false;

		const { showOverlayMessage, overlayProps, expiredView } = this.state;
		if (showOverlayMessage && overlayProps) {
			return (
				<div className={bem.b()}>
					<section className="page-entry">
						<PaymentConfirmationOverlay {...overlayProps} />
					</section>
				</div>
			);
		}

		if (expiredView) {
			return (
				<div>
					<section className="page-entry">
						<SubscriptionsList type={SubscriptionsListType.EXPIRED} displayAll={true} />
					</section>
				</div>
			);
		}

		return (
			<div className={bem.b()}>
				<section className="page-entry">
					<SubscriptionsList type={SubscriptionsListType.ACTIVE} />
				</section>
				<section className="page-entry">
					<SubscriptionsList type={SubscriptionsListType.EXPIRED} />
				</section>
				<section className="page-entry">
					<PaymentMethods
						defaultPaymentMethodId={account.defaultPaymentMethodId}
						setOverlayMessage={this.setOverlayMessage}
					/>
				</section>
				<section className="page-entry">
					<BillingHistory />
				</section>
			</div>
		);
	}
}

function mapStateToProps({ account }: state.Root) {
	if (!account.info) return {};

	const subscriptions = account.subscriptionDetails;
	return {
		subscriptions,
		account: account && account.info
	};
}

function mapDispatchToProps(dispatch) {
	return {
		getSubscriptionDetails: () => dispatch(getSubscriptionDetails()),
		sendRegisterAnalyticsEvent: () => dispatch(pageAnalyticsEvent(window.location.pathname))
	};
}

export default configAccountPage(
	AccountBilling,
	{ template, key: billingPageKey, mapStateToProps, mapDispatchToProps },
	false
);
