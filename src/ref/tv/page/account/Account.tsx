import * as React from 'react';
import { configPage } from 'shared/';
import { Account as template } from 'shared/page/pageTemplate';
import entryRenderers from './accountEntries';
import SwitchProfile from 'ref/tv/pageEntry/account/a/SwitchProfile';
import SignoutButton from 'ref/tv/pageEntry/account/a/SignoutButton';
import { promptSignOut } from 'shared/account/sessionWorkflow';

interface AccountProps extends PageProps {
	account?: state.Account;
	profile?: state.Profile;
	promptSignOut?: () => void;
	pageLoading?: boolean;
}

interface AccountDispatchProps {
	promptSignOut: () => void;
}

class Account extends React.Component<AccountProps & AccountDispatchProps> {
	render() {
		return (
			<div className="pg-account">
				<SwitchProfile account={this.props.account} />
				{!this.props.loading && this.renderEntries(this.props)}
				<SignoutButton pageLoading={this.props.pageLoading} promptSignOut={this.props.promptSignOut} />
			</div>
		);
	}

	private renderEntries({ entries, renderEntry, account, profile }: AccountProps & AccountDispatchProps) {
		return (entries || []).map((entry, index) => {
			return renderEntry(entry, index, { account, profile });
		});
	}
}

function mapStateToProps({ account, profile, page }: state.Root) {
	return { account, profile, pageLoading: page.loading };
}

function mapDispatchToProps(dispatch: any): AccountDispatchProps {
	return {
		promptSignOut: () => dispatch(promptSignOut())
	};
}

export default configPage(Account, {
	template,
	entryRenderers,
	mapStateToProps,
	mapDispatchToProps
} as any);
