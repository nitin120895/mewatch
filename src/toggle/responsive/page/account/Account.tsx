import * as React from 'react';
import { Account as template } from 'shared/page/pageTemplate';
import entryRenderers from './accountEntries';
import configAccountPage, { AccountPageProps } from 'ref/responsive/page/account/common/configAccountPage';
import ProfilePersonalisation from './profile/ProfilePersonalisation';
import * as cx from 'classnames';
import * as support from 'shared/service/support';
import { requestOneTimePassword } from 'shared/service/action/support';
import { isValidOTP } from 'shared/account/accountUtil';
import AccountOTP from './AccountOTP';

interface AccountPageComponentProps extends AccountPageProps {
	account: api.Account;
	profile: api.ProfileDetail | api.ProfileSummary;
	config: state.Config;
	activeProfile?: api.ProfileDetail;
}

interface StateProps {
	account: api.Account;
	tokens: api.AccessToken[];
}

interface DispatchProps {
	requestOTP: (options?: support.RequestOneTimePasswordOptions, info?: any) => any;
}

class AccountPage extends React.Component<AccountPageComponentProps & StateProps & DispatchProps, any> {
	componentWillMount() {
		this.setState({ isValidOTP: isValidOTP() });
	}

	render() {
		const { activeProfile } = this.props;

		return <div className="pg-account-overview">{!this.props.loading && activeProfile && this.renderContent()}</div>;
	}

	private renderContent() {
		const { activeProfile, entries, account } = this.props;
		const isPrimaryProfile = activeProfile.id === account.primaryProfileId;
		const filteredEntries = (entries || []).filter(entry => isPrimaryProfile || entry.type === 'UserEntry');

		return [
			this.renderEntries(filteredEntries),
			!isPrimaryProfile && (
				<section key="personalisation" className={cx('page-entry', 'no-padding')}>
					<ProfilePersonalisation {...this.props} />
				</section>
			)
		];
	}

	private onSuccessOTP = () => {
		this.setState({ isValidOTP: true });
	};

	private renderEntries(entries) {
		const { renderEntry, account, profile } = this.props;
		const { isValidOTP } = this.state;

		const filteredEntries = (entries || []).map((entry, index) => {
			return isValidOTP || index === 0 ? renderEntry(entry, index, { account, profile }) : undefined;
		});

		if (!isValidOTP) {
			filteredEntries.push(
				<section key={`otp`} className={cx('page-entry')}>
					<AccountOTP key={'account'} onSuccessOTP={this.onSuccessOTP} />
				</section>
			);
		}

		return filteredEntries;
	}
}

const mapStateToProps = ({ account, profile, session }: state.Root): StateProps => ({
	account: account.info,
	tokens: session.tokens
});

const mapDispatchToProps = (dispatch): DispatchProps => ({
	requestOTP: (options?: support.RequestOneTimePasswordOptions, info?: any) =>
		dispatch(requestOneTimePassword(options, info))
});

export default configAccountPage(AccountPage, { template, entryRenderers, mapStateToProps, mapDispatchToProps });
