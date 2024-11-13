import * as React from 'react';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import { getPurchasesExtended } from 'shared/service/action/account';
import AccountEntryWrapper from 'ref/responsive/pageEntry/account/common/AccountEntryWrapper';
import ContinuousScroll from 'toggle/responsive/component/ContinuousScroll';
import BillingHistoryItem from './BillingHistoryItem';
import BillingHistoryListHeader from './BillingHistoryListHeader';

import { noop } from 'shared/util/function';

import './BillingHistory.scss';

interface OwnProps {}

interface StateProps {
	purchases?: api.PurchaseExtended[];
	purchasesLoaded?: boolean;
	paging?: api.Pagination;
}

interface DispatchProps {
	getPurchasesExtended?: typeof getPurchasesExtended;
}

type Props = OwnProps & StateProps & DispatchProps;

const bem = new Bem('billing-history');
const BILLING_HISTORY_PAGE_SIZE = 24;

export class BillingHistory extends React.PureComponent<Props> {
	static defaultProps = {
		purchases: [],
		paymentMethods: [],
		getPurchases: noop,
		getPaymentMethods: noop
	};

	componentDidMount() {
		this.onShowTransactions();
	}

	private onShowTransactions = () => {
		this.props.getPurchasesExtended({ page: 1, pageSize: BILLING_HISTORY_PAGE_SIZE });
	};

	private onLoadNextPage = () => {
		if (!this.props.purchasesLoaded) {
			return;
		}
		const page: number = this.props.paging.page;
		this.props.getPurchasesExtended({ page: page + 1, pageSize: BILLING_HISTORY_PAGE_SIZE });
	};

	render() {
		const { purchases, paging } = this.props;
		const hasNextPage = paging && paging.page < paging.total;
		if (purchases.length) {
			return (
				<ContinuousScroll hasNextPage={hasNextPage} loadNextPage={this.onLoadNextPage}>
					<AccountEntryWrapper className={bem.b()} title={'@{account.billing.billingHistory|Billing History}'}>
						{this.renderPurchases()}
					</AccountEntryWrapper>
				</ContinuousScroll>
			);
		}
		return <div />;
	}

	private renderPurchases() {
		const { purchases } = this.props;
		return [
			<BillingHistoryListHeader key="header" classname={bem.e('header')} />,
			...purchases.map(purchase => (
				<BillingHistoryItem key={purchase.authorizationDate.toString()} purchase={purchase} />
			))
		];
	}
}

const mapStateToProps = ({ account }: state.Root): StateProps => {
	return {
		purchases: account.purchases.items,
		paging: account.purchases.paging,
		purchasesLoaded: account.purchasesLoaded
	};
};

const mapDispatchToProps = {
	getPurchasesExtended
};

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(BillingHistory);
