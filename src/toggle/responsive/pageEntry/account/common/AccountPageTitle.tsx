import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { parseQueryParams } from 'ref/responsive/util/browser';
import { AccountPageProps } from 'ref/responsive/page/account/common/configAccountPage';
import {
	Account as accountPageKey,
	AccountBilling as accountBillingPageKey,
	AccountProfilePersonalisation as accountPersonalisationPageKey
} from 'shared/page/pageKey';
import { get } from 'shared/util/objects';

import { findPageSummary, findPageSummaryByKey, getAccountPath } from 'shared/page/sitemapLookup';
import Link from 'shared/component/Link';
import { Bem } from 'shared/util/styles';
import { requestBackNavigation } from 'shared/page/pageWorkflow';
import { browserHistory } from 'shared/util/browserHistory';
import { EXPIRED } from 'toggle/responsive/util/subscriptionUtil';
import { selectPageInHistory } from 'shared/page/pageUtil';

import './AccountPageTitle.scss';

const bem = new Bem('acc-pg-title');

interface OwnProps {
	title: string;
	noBackNavigation?: boolean;
	requestBackNavigation?: (path: string) => void;
}

interface StoreProps {
	accountPath?: string;
	pageKey?: string;
	prevPage: api.Page;
	page: api.PageSummary;
	primaryProfileId: string;
}

type Props = OwnProps & StoreProps;

interface State {
	expiredView?: boolean;
}

class AccountPageTitle extends React.Component<Props, State> {
	state = {
		expiredView: false
	};

	componentDidMount() {
		this.updateView();
	}

	componentWillUpdate(nextProps, nextState: State) {
		this.updateView();
	}

	updateView() {
		const expiredView = window.location.search === `?${EXPIRED}`;
		if (expiredView !== this.state.expiredView) {
			this.setState({ expiredView });
		}
	}

	private isCurrentAccountPrimary() {
		const { primaryProfileId } = this.props;
		const { profileId } = location.search && parseQueryParams(location.search);
		return primaryProfileId === profileId;
	}

	getOverviewPageTitle() {
		const { pageKey, page } = this.props;
		const isPrimary = this.isCurrentAccountPrimary();
		if (pageKey === accountPersonalisationPageKey && isPrimary) {
			return (
				<IntlFormatter
					elementType={Link}
					className={bem.e('link')}
					onClick={this.onClick}
					componentProps={{ to: `@${accountPageKey}` }}
				>
					{'@{account_common_backToParent_label_edit|Back to Edit Profile}'}
				</IntlFormatter>
			);
		}
		return (
			<IntlFormatter
				elementType={Link}
				className={bem.e('link')}
				onClick={this.onClick}
				componentProps={{ to: `@${accountPageKey}` }}
				values={{ title: page.title }}
			>
				{'@{account_common_backToParent_label|Back to {title}}'}
			</IntlFormatter>
		);
	}

	render() {
		const { title, noBackNavigation } = this.props;
		const { expiredView } = this.state;
		return (
			<div className={cx(bem.b(), 'ah-row')}>
				{!noBackNavigation && this.getOverviewPageTitle()}
				{!expiredView && !!title && (
					<h1 className={cx(bem.e('heading', { ['no-back-nav']: noBackNavigation }), 'titlecase', 'truncate')}>
						{title}
					</h1>
				)}
				{expiredView && (
					<h1 className={bem.e('heading')}>
						<IntlFormatter>{'@{account.billing.expired.subscriptions}'}</IntlFormatter>
					</h1>
				)}
			</div>
		);
	}

	onClick = e => {
		const { pageKey, requestBackNavigation, prevPage, accountPath } = this.props;
		const isPrevPageAccountBilling = prevPage && prevPage.key === accountBillingPageKey;
		const isCurrPageAccountBilling = pageKey && pageKey === accountBillingPageKey;
		e.preventDefault();

		if (!isCurrPageAccountBilling) {
			requestBackNavigation(accountPath);
		} else if (isPrevPageAccountBilling) {
			browserHistory.goBack();
		} else {
			browserHistory.push(`/${accountPath}`);
		}
	};
}

function mapStateToProps(state: state.Root, ownProps: AccountPageProps) {
	return {
		accountPath: getAccountPath(state.app.config),
		prevPage: selectPageInHistory(state, -1),
		pageKey: findPageSummary(ownProps.path, state).key,
		page: findPageSummaryByKey(accountPageKey, state.app.config),
		primaryProfileId: get(state.account, 'info.primaryProfileId')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		requestBackNavigation: path => dispatch(requestBackNavigation(path))
	};
}

export default connect<StoreProps, {}, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(AccountPageTitle);
