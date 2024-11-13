import * as React from 'react';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import { getPaymentMethods, getPurchasesExtended } from 'shared/service/action/account';
import { AccountBillingHistory as billingHistoryPageKey } from 'shared/page/pageKey';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import AccountEntryWrapper from 'ref/responsive/pageEntry/account/common/AccountEntryWrapper';
import BillingHistoryItem from './BillingHistoryItem';
import { noop } from 'shared/util/function';

import './BillingHistory.scss';

interface BillingHistoryProps {
	purchases?: api.PurchaseExtended[];
	purchasesLoaded?: boolean;
	paymentMethods?: Array<api.PaymentMethod>;
	getPaymentMethods?: () => Promise<any>;
	getPurchases?: () => Promise<any>;
}

interface BillingHistoryState {
	loading: boolean;
}

const MAX_LATEST_PURCHASES_DISPLAY = 3;

const bem = new Bem('billing-history');

export class BillingHistory extends React.Component<BillingHistoryProps, BillingHistoryState> {
	state: BillingHistoryState = {
		loading: false
	};

	static defaultProps = {
		purchases: [],
		paymentMethods: [],
		getPurchases: noop,
		getPaymentMethods: noop
	};

	componentWillMount() {
		this.props.getPaymentMethods();
	}

	private onShowTransactions = () => {
		this.setState({ loading: true });
		this.props
			.getPurchases()
			.then(res => {
				this.setState({ loading: false });
			})
			.catch(error => {
				this.setState({ loading: false });
			});
	};

	render() {
		const { loading } = this.state;
		const { purchases, purchasesLoaded } = this.props;
		const buttonPath = purchases && purchases.length > MAX_LATEST_PURCHASES_DISPLAY && `@${billingHistoryPageKey}`;
		return (
			<AccountEntryWrapper
				className={bem.b()}
				title={'@{account.billing.billingHistory|Billing History}'}
				buttonLabel={'@{account.billing.viewAll|View all}'}
				buttonPath={buttonPath}
			>
				{!purchasesLoaded && (
					<IntlFormatter
						elementType={AccountButton}
						className={bem.e('load-btn')}
						onClick={this.onShowTransactions}
						componentProps={{
							ordinal: 'secondary',
							loading
						}}
					>
						{`@{account.billing.showPurchasesButton|Show transactions}`}
					</IntlFormatter>
				)}
				{purchasesLoaded && this.renderPurchases()}
			</AccountEntryWrapper>
		);
	}

	private renderPurchases() {
		const { purchases, paymentMethods } = this.props;
		if (!purchases.length) {
			return (
				<IntlFormatter elementType="p" className={bem.e('no-purchase')}>
					{`@{account.billing.noPurchaseMessage|You haven't made any purchase yet.}`}
				</IntlFormatter>
			);
		}
		return purchases
			.slice(0, MAX_LATEST_PURCHASES_DISPLAY)
			.map(purchase => (
				<BillingHistoryItem
					key={purchase.id}
					purchase={purchase}
					paymentMethod={paymentMethods.find(method => method.id === purchase.paymentMethod.id)}
				/>
			));
	}
}

const mapStateToProps = ({ account }: state.Root) => {
	return {
		purchases: account.purchases,
		purchasesLoaded: account.purchasesLoaded,
		paymentMethods: account.paymentMethods
	};
};

const actions = {
	getPurchasesExtended,
	getPaymentMethods
};

export default connect<any, any, BillingHistoryProps>(
	mapStateToProps,
	actions
)(BillingHistory);
