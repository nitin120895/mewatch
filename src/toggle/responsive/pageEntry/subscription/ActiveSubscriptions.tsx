import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { SX1ActiveSubscription as template } from 'shared/page/pageEntryTemplate';
import SubscriptionItem from '../../app/subscription/SubscriptionItem';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { ActiveSubscriptionProps } from '../../app/subscription/SubscriptionItem';

import './ActiveSubscriptions.scss';

const bem = new Bem('active-subscriptions');

interface OwnProps extends PageEntryListProps {
	subscriptions: ActiveSubscriptionProps[];
	isPrimaryProfile: boolean;
}

export default function ActiveSubscription(props: OwnProps) {
	const { subscriptions, isPrimaryProfile } = props;

	return (
		<div className={bem.b()}>
			<IntlFormatter className={bem.e('title')} values={{ count: subscriptions && subscriptions.length }}>
				{'@{subscription_active_subscription_summary_page_title}'}
			</IntlFormatter>
			{subscriptions &&
				subscriptions.map(plan => (
					<SubscriptionItem key={plan.id} plan={plan} isPrimaryProfile={isPrimaryProfile} expired={false} />
				))}
		</div>
	);
}

ActiveSubscription.template = template;
