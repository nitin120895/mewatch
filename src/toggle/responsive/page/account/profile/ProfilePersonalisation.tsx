import * as React from 'react';
import { connect } from 'react-redux';
import { updateLocale } from 'shared/app/appWorkflow';
import { updateProfile } from 'shared/account/accountWorkflow';
import { goToAccounts, openSystemErrorModal } from 'shared/account/profileUtil';
import { getPathByKey } from 'shared/page/sitemapLookup';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import { Account } from 'shared/page/pageKey';
import { Personalizations } from 'toggle/responsive/util/profileUtil';
import PlaybackSettings from './PlaybackSettings';
import AX3ProfilePersonalisation from './AX3ProfilePersonalisation';
import { ConfirmationDialogProps } from '../../../component/dialog/ConfirmationDialog';

import './ProfilePersonalisation.scss';

interface DispatchProps {
	showModal: (modal: ModalConfig) => void;
	updateProfile: (state: api.ProfileDetail) => Promise<any>;
	updateLocale: typeof updateLocale;
}
type OwnProps = {
	profile?: api.ProfileDetail | api.ProfileSummary;
	account?: api.Account;
	config?: state.Config;
	activeProfile?: api.ProfileDetail;
	updatePersonalization?: (name: Personalizations, value: string | string[]) => void;
};

type Props = OwnProps & DispatchProps;

interface State {
	audioLanguage: string;
	subtitleLanguage: string;
	languageCode: string;
	loading: boolean;
	categories: string[];
}

class ProfilePersonalisation extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		if (!props.profile) {
			this.state = {
				audioLanguage: '',
				subtitleLanguage: 'off',
				languageCode: '',
				categories: [],
				loading: false
			};
		} else {
			const { audioLanguage, subtitleLanguage, languageCode, segments } = props.profile;
			this.state = {
				audioLanguage: audioLanguage || '',
				subtitleLanguage:
					!this.isVersionOfNull(subtitleLanguage) || subtitleLanguage !== undefined ? subtitleLanguage : 'off',
				languageCode: languageCode || '',
				categories: segments || [],
				loading: false
			};
		}
	}

	componentDidUpdate(prevProps, prevState) {
		const { profile } = this.props;
		if (profile && profile.languageCode !== prevProps.profile.languageCode) {
			this.setState({ languageCode: profile.languageCode });
		}
	}

	render() {
		const { account, profile, activeProfile } = this.props;
		if (!account) return <div />;

		const { audioLanguage, subtitleLanguage, categories } = this.state;
		const { primaryProfileId } = account;
		const isNewProfile = !profile;
		const editingActiveProfile = !isNewProfile && profile.id === activeProfile.id;
		const isPrimaryProfileActive = primaryProfileId === activeProfile.id;

		return (
			<div className={'personalization'}>
				<div className="edit-account-entry">
					<PlaybackSettings
						onSelectAudio={this.onSelectAudio}
						onSelectSubtitle={this.onSelectSubtitle}
						audioLanguage={audioLanguage}
						subtitleLanguage={subtitleLanguage}
						editingActiveProfile={editingActiveProfile}
						isPrimaryProfileActive={isPrimaryProfileActive}
						updateProfile={this.updateProfile}
						newProfile={isNewProfile}
					/>
				</div>
				{!isNewProfile && (
					<div className="edit-account-entry">
						<AX3ProfilePersonalisation
							editingActiveProfile={editingActiveProfile}
							isPrimaryProfileActive={isPrimaryProfileActive}
							categories={categories}
							newProfile={isNewProfile}
							profileId={profile && profile.id}
						/>
					</div>
				)}
			</div>
		);
	}

	private getAccountPath = () => getPathByKey(Account, this.props.config);

	private isVersionOfNull = (value: string) => {
		if (value === null || value === undefined) return true;
		return value.includes('null');
	};

	private openModal = (props: ConfirmationDialogProps) => {
		this.props.showModal({
			id: props.id,
			type: ModalTypes.CONFIRMATION_DIALOG,
			componentProps: props,
			disableAutoClose: true
		});
	};

	private updateProfile = profile => {
		const { updateProfile, account, activeProfile, updateLocale } = this.props;
		const { primaryProfileId } = account;
		const isPrimaryProfileActive = primaryProfileId === activeProfile.id;
		if (!profile.id) {
			profile.id = this.props.profile.id;
		}

		return updateProfile(profile)
			.then(res => {
				if (res.error) {
					this.openModal(openSystemErrorModal());
				} else {
					updateLocale(profile.languageCode);
					if (isPrimaryProfileActive) {
						goToAccounts(this.getAccountPath());
					} else {
						this.updateState(profile);
					}
				}
			})
			.catch(() => {
				this.openModal(openSystemErrorModal());
			})
			.finally(() => {
				this.setState({ loading: false });
			});
	};

	private updateState = profile => {
		const { segments } = profile;
		this.setState({
			...profile,
			categories: segments || this.state.categories
		});
	};

	private onSelectAudio = audioLanguage => {
		this.setState({ audioLanguage });
		this.updatePersonalization(Personalizations.audioLanguage, audioLanguage);
	};

	private onSelectSubtitle = subtitleLanguage => {
		this.setState({ subtitleLanguage });
		this.updatePersonalization(Personalizations.subtitleLanguage, subtitleLanguage);
	};

	private updatePersonalization(name: Personalizations, value: string | string[]) {
		const { updatePersonalization } = this.props;
		if (updatePersonalization) updatePersonalization(name, value);
	}
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		updateProfile: profile => dispatch(updateProfile(profile)),
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		updateLocale: locale => dispatch(updateLocale(locale))
	};
}

export default connect<{}, DispatchProps, OwnProps>(
	undefined,
	mapDispatchToProps
)(ProfilePersonalisation);
