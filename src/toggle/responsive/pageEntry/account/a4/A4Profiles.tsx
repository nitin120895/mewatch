import * as React from 'react';
import AccountEntryWrapper from 'ref/responsive/pageEntry/account/common/AccountEntryWrapper';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import WarningIcon from '../../../component/icons/WarningIcon';
import { Bem } from 'shared/util/styles';
import { connect } from 'react-redux';
import { A4Profiles as template } from 'shared/page/pageEntryTemplate';
import { isSubprofilesFeatureEnabled } from 'toggle/responsive/util/profileUtil';

import ProfilesList from './ProfileList';

interface OwnProps extends PageEntryPropsBase {
	account?: api.Account;
}

interface StateProps {
	maximumNumberOfProfile: number;
}

type Props = OwnProps & StateProps;

const bem = new Bem('profile-list-entry');

class A4Profiles extends React.PureComponent<Props> {
	render() {
		const { account, maximumNumberOfProfile, ...rest } = this.props;
		const { profiles, primaryProfileId } = account;
		const renderError = isSubprofilesFeatureEnabled && profiles.length === maximumNumberOfProfile;
		return (
			<div className="form-white">
				<AccountEntryWrapper {...rest} className={bem.b()}>
					{this.renderProfilesInformationMessage()}
					<ProfilesList profiles={profiles} primaryId={primaryProfileId} />
					{renderError && this.renderErrorMessage()}
				</AccountEntryWrapper>
			</div>
		);
	}
	renderProfilesInformationMessage() {
		return (
			<IntlFormatter elementType="div" className={bem.e('profiles-info')}>
				{
					'@{profile_info_message|Select your profile to update profile details, rated content control and personal preferences.}'
				}
			</IntlFormatter>
		);
	}
	renderErrorMessage() {
		return (
			<IntlFormatter elementType="div" className={bem.e('max-profiles-error')}>
				<WarningIcon className="warning-icon" />
				{'@{profile_maximum_number|You have created the maximum number of profiles.}'}
			</IntlFormatter>
		);
	}
}

function mapStateToProps(state: state.Root): StateProps {
	return {
		maximumNumberOfProfile: state.app.config.general.customFields.MaximumNumberOfProfile
	};
}

const Component: any = connect<StateProps, any, Props>(
	mapStateToProps,
	undefined
)(A4Profiles);
Component.template = template;

export default Component;
