import * as React from 'react';
import { connect } from 'react-redux';
import ProfileCircle, { NewProfile } from 'ref/responsive/component/ProfileCircle';
import { Bem } from 'shared/util/styles';
import { AccountProfileEdit as profileEditKey } from 'shared/page/pageKey';
import { browserHistory } from 'shared/util/browserHistory';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { ModalManagerDispatchProps } from 'ref/responsive/app/modal/ModalManager';

import './ProfileList.scss';

interface OwnProps extends ModalManagerDispatchProps {
	profiles: api.ProfileSummary[];
	primaryId: string;
}

interface StateProps {
	maximumNumberOfProfile: number;
	config?: api.AppConfig;
	profile: api.ProfileDetail;
}

type Props = OwnProps & StateProps;

const bem = new Bem('profile-list');

class ProfileList extends React.PureComponent<Props> {
	private onProfileSelect = (profile: api.ProfileSummary) => {
		this.navigateToProfile(profile);
	};

	private navigateToProfile(profile: api.ProfileSummary) {
		const path = getPathByKey(profileEditKey, this.props.config);
		browserHistory.push(`${path}?id=${profile.id}`);
	}

	render() {
		const { profiles, primaryId, maximumNumberOfProfile } = this.props;
		return (
			<div className={bem.b()}>
				{profiles &&
					profiles.map(profile => (
						<ProfileCircle
							profile={profile}
							key={profile.id}
							isPrimary={profile.id === primaryId}
							displayByline={true}
							className={bem.e('circle')}
							type={'link'}
							onSelect={this.onProfileSelect}
						/>
					))}
				{profiles.length < maximumNumberOfProfile && <NewProfile className={bem.e('circle')} />}
			</div>
		);
	}
}

function mapStateToProps(state: state.Root): StateProps {
	const { config } = state.app;
	return {
		config,
		profile: state.profile.info,
		maximumNumberOfProfile: config.general.customFields.MaximumNumberOfProfile
	};
}

export default connect<StateProps, any, OwnProps>(
	mapStateToProps,
	undefined
)(ProfileList);
