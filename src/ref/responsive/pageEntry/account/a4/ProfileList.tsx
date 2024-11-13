import * as React from 'react';
import { connect } from 'react-redux';
import ProfileCircle, { NewProfile } from 'ref/responsive/component/ProfileCircle';
import { Bem } from 'shared/util/styles';
import * as ModalActions from 'shared/uiLayer/uiLayerWorkflow';
import { AccountProfileEdit as profileEditKey } from 'shared/page/pageKey';
import { genId } from 'shared/util/strings';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { browserHistory } from 'shared/util/browserHistory';
import { getPathByKey } from 'shared/page/sitemapLookup';

import './ProfileList.scss';

interface ProfileListProps {
	profiles: api.ProfileSummary[];
	primaryId: string;
	openModal?: (config: ModalConfig) => void;
	hideModal: (id: any) => void;
	config?: state.Config;
}

const bem = new Bem('profile-list');

class ProfileList extends React.Component<ProfileListProps, any> {
	private onProfileSelect = (profile: api.ProfileSummary) => {
		if (profile.isRestricted) {
			const modalId = `${profile.id}-${genId()}`;
			this.props.openModal({
				id: modalId,
				type: ModalTypes.PIN_AUTH,
				componentProps: {
					scopes: ['Catalog'],
					tokenType: 'UserProfile',
					onSuccess: payload => {
						this.props.hideModal(modalId);
						this.navigateToProfile(profile);
					},
					onFailure: error => {
						this.props.hideModal(modalId);
					}
				}
			});
		} else {
			this.navigateToProfile(profile);
		}
	};

	private navigateToProfile(profile: api.ProfileSummary) {
		const path = getPathByKey(profileEditKey, this.props.config);
		browserHistory.push(`${path}?id=${profile.id}`);
	}

	render() {
		const { profiles, primaryId } = this.props;
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
				<NewProfile className={bem.e('circle')} />
			</div>
		);
	}
}

function mapStateToProps(state: state.Root, ownProps): any {
	return {
		config: state.app.config
	};
}

const actions = {
	openModal: ModalActions.OpenModal,
	hideModal: ModalActions.CloseModal
};

export default connect<ProfileListProps, any, any>(
	mapStateToProps,
	actions
)(ProfileList);
