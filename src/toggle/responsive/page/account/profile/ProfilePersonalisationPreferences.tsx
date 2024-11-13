import * as React from 'react';
import configAccountPage, { AccountPageProps } from 'ref/responsive/page/account/common/configAccountPage';
import { parseQueryParams } from 'ref/responsive/util/browser';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountProfilePersonalisation as key } from 'shared/page/pageKey';
import { getProfiles, getProfileById } from 'shared/selectors/personalisation';
import { Account } from 'shared/page/pageKey';
import { get } from 'shared/util/objects';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { AccountProfileEdit } from 'shared/page/pageKey';
import { goToAccounts, goToEditProfileById } from 'shared/account/profileUtil';
import { resetBackNavigation } from 'shared/page/pageWorkflow';
import PersonalisationSettings from './PersonalisationSettings';

interface State {
	profileId: string;
	isPrimary: boolean;
}

interface StateProps {
	profiles: api.ProfileSummary[];
	primaryProfileId: string;
	accountPath: string;
	accountEditPath: string;
	requestBackNavigation: string;
}

interface OwnProps {
	location: HistoryLocation;
}

interface DispatchProps {
	resetBackNavigation: () => void;
}

type Props = AccountPageProps & StateProps & DispatchProps & OwnProps;

class ProfilePersonalisationPreferences extends React.Component<Props, State> {
	state: State = {
		profileId: '',
		isPrimary: false
	};

	componentWillMount() {
		const { search } = this.props.location;

		const { profiles, primaryProfileId } = this.props;
		const { profileId } = search && parseQueryParams(search);

		if (profileId && getProfileById(profiles, profileId)) {
			this.setState({
				profileId,
				isPrimary: primaryProfileId === profileId
			});
		}

		window.addEventListener('popstate', this.preventBackNavigation);
	}

	componentWillReceiveProps(newProps) {
		if (newProps.requestBackNavigation && newProps.requestBackNavigation !== this.props.requestBackNavigation) {
			this.preventBackNavigation();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('popstate', this.preventBackNavigation);
	}

	private preventBackNavigation = () => {
		const { resetBackNavigation, accountPath, accountEditPath } = this.props;
		const { isPrimary, profileId } = this.state;

		window.onpopstate = undefined;
		resetBackNavigation();

		isPrimary ? goToEditProfileById(accountEditPath, profileId) : goToAccounts(accountPath);
	};

	render() {
		const { profileId } = this.state;
		return <PersonalisationSettings profileManagement={true} profileId={profileId} />;
	}
}

const mapStateToProps = ({ account, app, page }: state.Root): StateProps => ({
	profiles: getProfiles(account),
	primaryProfileId: get(account, 'info.primaryProfileId'),
	accountPath: getPathByKey(Account, app.config),
	accountEditPath: getPathByKey(AccountProfileEdit, app.config),
	requestBackNavigation: page.requestBackNavigation
});

const mapDispatchToProps = (dispatch): DispatchProps => ({
	resetBackNavigation: () => dispatch(resetBackNavigation())
});

export default configAccountPage(
	ProfilePersonalisationPreferences,
	{
		template,
		key,
		mapStateToProps,
		mapDispatchToProps
	},
	true
);
