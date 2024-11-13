import * as React from 'react';
import { Account as template } from 'shared/page/pageTemplate';
import entryRenderers from './accountEntries';
import configAccountPage, { AccountPageProps } from './common/configAccountPage';

import './Account.scss';

class AccountOverview extends React.Component<AccountPageProps, any> {
	render() {
		return <div className="pg-account-overview">{!this.props.loading && this.renderEntries(this.props)}</div>;
	}

	private renderEntries({ entries, renderEntry, account, profile }: AccountPageProps) {
		return (entries || []).map((entry, index) => {
			return renderEntry(entry, index, { account, profile });
		});
	}
}

export default configAccountPage(AccountOverview, { template, entryRenderers });
