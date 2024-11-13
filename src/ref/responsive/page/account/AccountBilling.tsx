import * as React from 'react';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountBilling as billingPageKey } from 'shared/page/pageKey';
import configAccountPage from './common/configAccountPage';
import BillingHistory from 'ref/responsive/pageEntry/account/a2/billingHistory/BillingHistory';
import PaymentMethods from 'ref/responsive/pageEntry/account/a2/paymentMethods/PaymentMethods';

interface AccountBillingPageProps extends PageProps {
	account?: api.Account;
}

class AccountBilling extends React.Component<AccountBillingPageProps, any> {
	render() {
		const { account } = this.props;
		if (!account) return false;
		return (
			<div>
				<section className="page-entry">
					<PaymentMethods defaultPaymentMethodId={account.defaultPaymentMethodId} />
				</section>
				<section className="page-entry">
					<BillingHistory />
				</section>
			</div>
		);
	}
}

export default configAccountPage(AccountBilling, { template, key: billingPageKey }, false);
