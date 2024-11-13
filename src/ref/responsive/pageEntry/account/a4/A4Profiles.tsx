import * as React from 'react';
import AccountEntryWrapper from '../common/AccountEntryWrapper';
import ProfilesList from './ProfileList';

interface A4ProfilesProps extends PageEntryPropsBase {
	account?: api.Account;
}

export default class A4Profiles extends React.Component<A4ProfilesProps, {}> {
	render() {
		const { account, ...rest } = this.props;
		if (!account) return false;
		const { profiles, primaryProfileId } = account;
		return (
			<div className="form-white">
				<AccountEntryWrapper {...rest}>
					<ProfilesList profiles={profiles} primaryId={primaryProfileId} />
				</AccountEntryWrapper>
			</div>
		);
	}
}
