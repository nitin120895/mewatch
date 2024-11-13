import * as React from 'react';
import configAccountPage, { AccountPageProps } from 'ref/responsive/page/account/common/configAccountPage';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountProfileAdd as key, Account } from 'shared/page/pageKey';
import ProfilesForm from './ProfilesForm';
import A5ParentalLock from '../../../pageEntry/account/a5/A5ParentalLock';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { ProfilesError, ProfileTypes, profileMap } from 'ref/responsive/page/account/profile/ProfilesForm';
import { newProfile } from 'shared/account/accountWorkflow';
import { resetBackNavigation } from 'shared/page/pageWorkflow';
import { setKidsProfile, unsetKidsProfile } from 'ref/responsive/util/kids';
import createMockPageEntry from 'viewer/ref/page/util/mockData';
import {
	labels,
	helpText,
	inputs,
	openSaveAccountChangesModal,
	openSystemErrorModal,
	goToAccounts,
	SAVE_CHANGES_MODAL_ID
} from 'shared/account/profileUtil';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { isMobile } from 'shared/util/browser';
import { OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { browserHistory } from 'shared/util/browserHistory';
import { AccountProfilePersonalisation } from 'shared/page/pageKey';
import { ConfirmationDialogProps } from '../../../component/dialog/ConfirmationDialog';
import ProfilePersonalisation from './ProfilePersonalisation';
import {
	Personalizations,
	RESTRICTED_PROFILE_PIN,
	RESTRICTED_PROFILE_DOB,
	getRestrictedProfileModalData,
	getRestrictedProfileDOBModalData,
	isKidsProfile,
	isStandardProfile,
	isRestrictedProfile
} from 'toggle/responsive/util/profileUtil';
import CreatePinOverlay from '../../../pageEntry/account/a1/pin/CreatePinOverlay';
import { validateAgeGroup } from '../../../util/dateOfBirth';

import './Profile.scss';

const a5MockEntry = createMockPageEntry('A5', 'Parental Control', 'A5');

interface StateProps {
	requestBackNavigation: string;
	config: state.Config;
	profile: api.ProfileDetail;
	account: api.Account;
	profileRecommendations: string;
}

interface DispatchProps {
	createPin?: (pin?: string) => Promise<any>;
	resetBackNavigation: () => void;
	newProfile: (newProfile) => Promise<any>;
	showModal: (modal: ModalConfig) => void;
	closeModal: (id: string | number) => void;
}

type Props = AccountPageProps & StateProps & DispatchProps;

interface State {
	error: ProfilesError;
	loading: boolean;
	name: string;
	profileType: ProfileTypes;
	audioLanguage: string;
	subtitleLanguage: string;
	languageCode: string;
	categories: string[];
	minRatingPlaybackGuard: string;
	createdProfileId: string;
}

class ProfileAdd extends React.Component<Props, State> {
	state: State = {
		error: undefined,
		loading: false,
		name: undefined,
		profileType: profileMap(this.props.profile),
		audioLanguage: undefined,
		subtitleLanguage: undefined,
		languageCode: undefined,
		categories: [],
		minRatingPlaybackGuard: undefined,
		createdProfileId: ''
	};

	componentWillMount() {
		history.pushState(undefined, undefined, location.href);
		window.addEventListener('popstate', this.preventBackNavigation);
	}

	componentWillReceiveProps(newProps) {
		if (newProps.requestBackNavigation && newProps.requestBackNavigation !== this.props.requestBackNavigation) {
			this.showModal();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('popstate', this.preventBackNavigation);
	}

	private preventBackNavigation = () => {
		window.onpopstate = undefined;
		this.showModal();
	};

	private showModal = () => {
		const props = openSaveAccountChangesModal(this.confirmChanges, this.discardChangesOnSave, this.onCloseModal);
		this.openModal(props);
	};

	private openModal = (props: ConfirmationDialogProps) => {
		this.props.showModal({
			id: props.id,
			type: ModalTypes.CONFIRMATION_DIALOG,
			componentProps: props,
			disableAutoClose: true
		});
	};

	private onSubmit = (e?) => {
		if (e) e.preventDefault();
		const { account } = this.props;
		const { profileType } = this.state;

		if (!validateAgeGroup(account.ageGroup) && isRestrictedProfile(profileType)) {
			this.showRestrictedProfileDOBModal();
		} else if (!account.pinEnabled && isRestrictedProfile(profileType)) {
			this.showCreatePinOverlay();
		} else {
			this.onProceedCreateProfile();
		}
	};

	private showRestrictedProfileDOBModal() {
		const props = getRestrictedProfileDOBModalData();

		this.props.showModal({
			id: RESTRICTED_PROFILE_DOB,
			type: ModalTypes.CONFIRMATION_DIALOG,
			componentProps: {
				children: <IntlFormatter>{'@{restricted_profile_dob_description}'}</IntlFormatter>,
				...props
			},
			disableAutoClose: true
		});
	}

	private showCreatePinOverlay() {
		const { account, showModal } = this.props;
		const props = getRestrictedProfileModalData(account, this.onProceedCreateProfile);

		showModal({
			id: RESTRICTED_PROFILE_PIN,
			type: ModalTypes.CUSTOM,
			element: <CreatePinOverlay {...props} />,
			disableAutoClose: true
		});
	}

	private onProceedCreateProfile = () => {
		const {
			name,
			profileType,
			languageCode,
			audioLanguage,
			subtitleLanguage,
			error,
			categories,
			minRatingPlaybackGuard
		} = this.state;

		if (!name) {
			this.setError(ProfilesError.Required);
			return;
		}

		if (error) {
			window.scrollTo(0, 0);
			return;
		} else {
			this.setState({
				error: undefined,
				loading: true
			});
		}

		let profileSubSet: any = {};
		const purchaseEnabled = isStandardProfile(profileType);
		const isKids = isKidsProfile(profileType);
		const pinEnabled = isRestrictedProfile(profileType) && this.props.account.pinEnabled;
		const segments = isKids ? categories : categories.concat('all');

		profileSubSet = {
			...profileSubSet,
			name: name.trim(),
			segments: isKids ? setKidsProfile(segments) : unsetKidsProfile(segments),
			audioLanguage,
			languageCode,
			subtitleLanguage,
			purchaseEnabled,
			pinEnabled,
			minRatingPlaybackGuard
		};

		this.createProfile(profileSubSet);
	};

	render() {
		const { account } = this.props;
		const { loading, profileType, error } = this.state;
		return (
			<div className={'form-white'}>
				<div className="add-account-entry">
					<ProfilesForm
						labels={labels}
						textInput={inputs.textInput}
						helpText={helpText}
						onSelectProfile={this.onSelectProfile}
						onNameChange={this.onNameChange}
						setError={this.setError}
						account={account}
						error={error}
					/>
				</div>
				<div className="add-account-entry">
					<A5ParentalLock
						fromProfileAdd={true}
						profileType={profileType}
						onSelectClassification={this.onSelectClassification}
						{...a5MockEntry}
					/>
				</div>

				<ProfilePersonalisation {...this.props} updatePersonalization={this.updatePersonalization} />

				<div className="add-account-entry-buttons">
					<AccountButton
						onClick={!isMobile() && this.onSubmit}
						onTouchStart={isMobile() && this.onSubmit}
						type="submit"
						loading={loading}
						className={'submit-profile'}
					>
						<IntlFormatter>{inputs.accountButtonAddProfile}</IntlFormatter>
					</AccountButton>
				</div>
			</div>
		);
	}

	private updatePersonalization = (name: Personalizations, value: string | string[]) => {
		const newState: any = { [name]: value };
		this.setState(newState);
	};

	private confirmChanges = () => {
		this.props.resetBackNavigation();
		this.onSubmit();
	};

	private discardChangesOnSave = () => {
		const { resetBackNavigation } = this.props;
		resetBackNavigation();
		goToAccounts(this.getAccountPath());
	};

	private onCloseModal = () => {
		const { closeModal, resetBackNavigation } = this.props;
		closeModal(SAVE_CHANGES_MODAL_ID);
		resetBackNavigation();
	};

	private onSelectProfile = id => {
		this.setState({ profileType: id });
	};

	private onNameChange = name => {
		this.setState({ name });
	};

	private getAccountPath = () => getPathByKey(Account, this.props.config);

	private confirmGoToPersonalisation = () => {
		const { createdProfileId } = this.state;
		browserHistory.replace(`${this.props.profileRecommendations}?profileId=${createdProfileId}`);
	};

	private cancelGoToPersonalisation = () => {
		goToAccounts(this.getAccountPath());
	};

	private getCreateAccountModalProps = (): ConfirmationDialogProps => {
		const props: ConfirmationDialogProps = {
			title: '@{account_profile_created_title}',
			children: (
				<div className="created-profile__modal">
					<IntlFormatter>{'@{account_profile_create_modal_body_1}'}</IntlFormatter>
					<IntlFormatter>{'@{account_profile_create_modal_body_2}'}</IntlFormatter>
					<IntlFormatter>{'@{account_profile_create_modal_body_3}'}</IntlFormatter>
				</div>
			),
			confirmLabel: '@{account_profile_create_button_submit}',
			cancelLabel: '@{account_profile_create_button_cancel}',
			onConfirm: this.confirmGoToPersonalisation,
			onCancel: this.cancelGoToPersonalisation,
			closeOnConfirm: true,
			hideCloseIcon: true,
			className: 'create-account-modal',
			id: 'create-account-modal'
		};

		return props;
	};

	private createProfile(profile) {
		const { newProfile } = this.props;

		return newProfile(profile)
			.then(res => {
				if (res.error) {
					const error = ProfilesError.Server;
					this.setState({
						error,
						loading: false
					});
					const props = openSystemErrorModal();
					this.openModal(props);
				} else if (!res.error) {
					this.setState({ createdProfileId: res.payload.id }, () => {
						const props = this.getCreateAccountModalProps();
						this.openModal(props);
					});
				}
			})
			.catch(() => {
				this.setState({ loading: false });
			});
	}

	private setError = (error: ProfilesError) => {
		this.setState({ error });
	};

	private onSelectClassification = minRatingPlaybackGuard => {
		this.setState({ minRatingPlaybackGuard });
	};
}

function mapStateToProps({ app, account, page }: state.Root, props: AccountPageProps): StateProps {
	return {
		config: app.config,
		requestBackNavigation: page.requestBackNavigation,
		profile: undefined,
		account: account.info,
		profileRecommendations: getPathByKey(AccountProfilePersonalisation, app.config)
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		newProfile: profile => dispatch(newProfile(profile)),
		resetBackNavigation: () => dispatch(resetBackNavigation()),
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id))
	};
}

export default configAccountPage(ProfileAdd, { template, key, mapStateToProps, mapDispatchToProps }, true);
