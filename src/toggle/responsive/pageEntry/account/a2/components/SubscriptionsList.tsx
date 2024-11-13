import * as React from 'react';
import { connect } from 'react-redux';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import AccountEntryWrapper from 'ref/responsive/pageEntry/account/common/AccountEntryWrapper';
import { Bem } from 'shared/util/styles';
import { PricePlan as subscriptionsPageKey } from 'shared/page/pageKey';
import { browserHistory } from 'shared/util/browserHistory';
import {
	extendSubscriptionsListWithPriceInfo,
	getActiveSubscriptions,
	getExpiredSubscriptions
} from '../../accountUtils';
import SubscriptionItem, { ActiveSubscriptionProps } from 'toggle/responsive/app/subscription/SubscriptionItem';
import { EXPIRED } from 'toggle/responsive/util/subscriptionUtil';
import {
	getExpiredSubscriptionTitle,
	getViewAllButtonLabel,
	EXPIRED_SUBSCRIPTIONS_VISIBLE_NUMBER
} from 'toggle/responsive/pageEntry/subscription/subscriptionsUtils';

import './SubscriptionsList.scss';

const bem = new Bem('account-subscriptions-list');

export enum SubscriptionsListType {
	ACTIVE = 'active',
	EXPIRED = 'expired'
}

interface OwnProps extends React.Props<any> {
	type: SubscriptionsListType;
	displayAll?: boolean;
}
interface StateProps {
	subscriptions?: api.SubscriptionDetail[];
	plans?: api.PricePlan[];
}
type Props = OwnProps & StateProps;

class SubscriptionsList extends React.PureComponent<Props> {
	render() {
		if (this.props.type === SubscriptionsListType.ACTIVE) return this.renderActiveSubscriptions();

		return this.renderExpiredSubscriptions();
	}

	renderActiveSubscriptions() {
		const { subscriptions, plans } = this.props;
		const subscriptionsList = getActiveSubscriptions(subscriptions);
		const extendedList: ActiveSubscriptionProps[] = extendSubscriptionsListWithPriceInfo(subscriptionsList, plans);
		const activeSubscriptionsCount: number = (subscriptionsList && subscriptionsList.length) || 0;

		const title = (
			<IntlFormatter values={{ count: activeSubscriptionsCount }}>
				{'@{subscription_active_subscription_title}'}
			</IntlFormatter>
		);
		return (
			<AccountEntryWrapper
				title={title}
				buttonLabel={'@{account_common_row_button_label|Manage}'}
				buttonPath={`@${subscriptionsPageKey}`}
				className="subscriptions-entry"
				{...this.props}
			>
				{extendedList && extendedList.length > 0 && this.renderSubscriptions(extendedList)}
			</AccountEntryWrapper>
		);
	}

	renderExpiredSubscriptions() {
		const { subscriptions, displayAll } = this.props;
		let expiredSubscriptions = getExpiredSubscriptions(subscriptions);
		const title = getExpiredSubscriptionTitle(expiredSubscriptions.length);

		if (!expiredSubscriptions || expiredSubscriptions.length === 0) return <div />;

		if (displayAll) {
			return this.renderExpiredSubscriptionsView(title, expiredSubscriptions);
		}

		expiredSubscriptions = expiredSubscriptions.slice(0, EXPIRED_SUBSCRIPTIONS_VISIBLE_NUMBER);
		return (
			<AccountEntryWrapper
				title={title}
				buttonLabel={getViewAllButtonLabel(expiredSubscriptions.length)}
				onClick={() => browserHistory.push(`${window.location.pathname}?${EXPIRED}`)}
				className="subscriptions-entry"
				{...this.props}
			>
				{this.renderSubscriptions(expiredSubscriptions)}
			</AccountEntryWrapper>
		);
	}

	renderExpiredSubscriptionsView(title, subscriptions) {
		return (
			<AccountEntryWrapper title={title} className="subscriptions-entry" {...this.props}>
				{this.renderSubscriptions(subscriptions)}
			</AccountEntryWrapper>
		);
	}

	renderSubscriptions(subscriptions) {
		const { type } = this.props;
		return (
			<div className={bem.b()}>
				{subscriptions && (
					<div className={bem.e('sub-section')}>
						{subscriptions.map(subscription => (
							<SubscriptionItem
								key={subscription.id}
								plan={subscription}
								expired={type === SubscriptionsListType.EXPIRED}
								isPrimaryProfile={true}
								fromAccount={true}
							/>
						))}
					</div>
				)}
			</div>
		);
	}
}

function mapStateToProps({ account, app }: state.Root) {
	if (!account.info) return {};

	const plans = app.config.subscription.plans;
	const subscriptions = account.subscriptionDetails;
	return { subscriptions, plans };
}

export default connect<StateProps, {}, OwnProps>(
	mapStateToProps,
	undefined
)(SubscriptionsList);
