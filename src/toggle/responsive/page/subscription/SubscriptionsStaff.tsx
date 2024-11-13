import * as React from 'react';
import configAccountPage, { AccountPageProps } from 'ref/responsive/page/account/common/configAccountPage';
import { STATIC as template } from 'shared/page/pageTemplate';
import { SubscriptionStaff as key } from 'shared/page/pageKey';
import { browserHistory } from 'shared/util/browserHistory';
import { get } from 'shared/util/objects';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { getPathByKey } from 'shared/page/sitemapLookup';
import Subscription from './Subscriptions';
import { redirectToSignPage } from '../../pageEntry/subscription/subscriptionsUtils';
import { ShowPassiveNotification } from 'shared/uiLayer/uiLayerWorkflow';
import { Subscription as SubcsriptionPageKey } from 'shared/page/pageTemplate';
import './SubscriptionsStaff.scss';

interface StateProps {
	account: api.Account;
	config: api.AppConfig;
	segments: string[];
	subscriptionsPath: string;
}

interface DispatchProps {
	showPassiveNotification: (config: PassiveNotificationConfig) => Promise<any>;
}

interface SubscriptionsStaffState {
	isStaffAccount: boolean;
}

type Props = AccountPageProps & StateProps & DispatchProps;

class SubscriptionsStaff extends React.PureComponent<Props, SubscriptionsStaffState> {
	state = {
		isStaffAccount: false
	};

	componentDidMount(): void {
		this.chekcIfStaffMember();
	}

	chekcIfStaffMember() {
		const { account, config, segments, subscriptionsPath, showPassiveNotification } = this.props;
		if (!account) {
			redirectToSignPage(config);
			return;
		}
		const staffSegmentationTag =
			config && config.general.customFields && get(config.general.customFields, 'StaffSegmentationTag');
		const isStaffAccount = segments.includes(staffSegmentationTag);
		if (!isStaffAccount) {
			browserHistory.push(subscriptionsPath);
			showPassiveNotification({
				content: <IntlFormatter>{'@{subscription_modal_only_staff_access_allowed}'}</IntlFormatter>
			});
			return;
		}
		this.setState({ isStaffAccount });
	}

	render() {
		if (this.state.isStaffAccount) {
			return <Subscription />;
		}
		return <div />;
	}
}

const mapStateToProps = ({ account, app, profile }: state.Root): StateProps => ({
	account: account && account.info,
	segments: get(account, 'info.segments') || [],
	config: app.config,
	subscriptionsPath: getPathByKey(SubcsriptionPageKey, app.config)
});

const mapDispatchToProps = (dispatch): DispatchProps => ({
	showPassiveNotification: (config: PassiveNotificationConfig): Promise<any> =>
		dispatch(ShowPassiveNotification(config))
});

export default configAccountPage(SubscriptionsStaff, {
	template,
	key,
	mapStateToProps,
	mapDispatchToProps
});
