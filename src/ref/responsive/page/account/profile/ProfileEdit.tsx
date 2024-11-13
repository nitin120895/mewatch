import * as React from 'react';
import configAccountPage, { AccountPageProps } from '../common/configAccountPage';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountProfileEdit as key } from 'shared/page/pageKey';
import ProfilesForm from './ProfilesForm';

const labels = {
	standard: '@{account_profile_button_standard|Standard}',
	kids: '@{account_profile_button_kids|Kids}',
	restricted: '@{account_profile_button_restricted|Restricted}'
};

const helpText = {
	kids: '@{account_profile_helpText_kids|Only content up to 12 years}',
	restricted: '@{account_profile_helpText_restricted|Pin required to switch to this component}'
};

const inputs = {
	textInput: '@{account_profile_input_name|Profile name}',
	accountButton: '@{account_profile_edit_button_submit|Submit}'
};

function ProfileEdit(props: AccountPageProps) {
	const { account, profile } = props;
	const { query } = props.location;

	// it might happen in deep link case with unauthorized user
	if (!account || !profile) return <div />;

	return (
		<div className={'form-white'}>
			<ProfilesForm
				labels={labels}
				inputs={inputs}
				helpText={helpText}
				id={query.id}
				isPrimaryProfile={account.primaryProfileId === query.id}
				isCurrentProfile={profile.id === query.id}
			/>
		</div>
	);
}

export default configAccountPage(ProfileEdit, { template, key }, true);
