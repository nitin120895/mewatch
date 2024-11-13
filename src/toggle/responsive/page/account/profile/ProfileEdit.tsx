import * as React from 'react';
import * as cx from 'classnames';
import configAccountPage, { AccountPageProps } from 'ref/responsive/page/account/common/configAccountPage';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountProfileEdit as key, Account } from 'shared/page/pageKey';
import ProfilesForm, { ProfileTypes, ProfilesError, profileMap } from './ProfilesForm';
import createMockPageEntry from 'viewer/ref/page/util/mockData';
import A5ParentalLock from '../../../pageEntry/account/a5/A5ParentalLock';
import ProfilePersonalisation from './ProfilePersonalisation';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { resetBackNavigation } from 'shared/page/pageWorkflow';
import { updateLocale } from 'shared/app/appWorkflow';
import { noop } from 'shared/util/function';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import BinIcon from 'ref/responsive/component/icons/BinIcon';
import { changePin, deleteProfile, updateProfile } from 'shared/account/accountWorkflow';
import { setKidsProfile, unsetKidsProfile } from 'ref/responsive/util/kids';
import { pick } from 'shared/util/objects';
import {
	labels,
	helpText,
	inputs,
	goToAccounts,
	openSaveAccountChangesModal,
	openSystemErrorModal,
	SAVE_CHANGES_MODAL_ID
} from 'shared/account/profileUtil';
import { ConfirmationDialogProps } from '../../../component/dialog/ConfirmationDialog';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { isMobile } from 'shared/util/browser';
import { ShowPassiveNotification, OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import {
	Personalizations,
	RESTRICTED_PROFILE_PIN,
	getRestrictedProfileModalData,
	getRestrictedProfileDOBModalData,
	RESTRICTED_PROFILE_DOB,
	isRestrictedProfile,
	isStandardProfile,
	isKidsProfile,
	UpdateProfileData,
	getMinRatingPlaybackGuard
} from 'toggle/responsive/util/profileUtil';
import { DisableProfilePlaybackGuardOptions } from 'shared/service/account';
import { disableProfilePlaybackGuard } from 'shared/service/action/account';
import CreatePinOverlay from '../../../pageEntry/account/a1/pin/CreatePinOverlay';
import { pageAnalyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { AgeGroup } from 'toggle/responsive/pageEntry/account/a1/pin/AccountManagePinComponent';
import { validateAgeGroup } from 'toggle/responsive/util/dateOfBirth';

import './Profile.scss';

const DELETE_PROFILE_MODAL_ID = 'delete-profile';
const a5MockEntry = createMockPageEntry('A5', 'Rated Content Control', 'A5');

interface StateProps {
	requestBackNavigation: string;
	config: state.Config;
	accountPinEnabled: boolean;
	profile: api.ProfileDetail;
	account: api.Account;
}

interface DispatchProps {
	showModal: (modal: ModalConfig) => void;
	closeModal: (id: string | number) => void;
	createPin?: (pin?: string) => Promise<any>;
	resetBackNavigation: () => void;
	updateProfile: (state: api.ProfileDetail) => Promise<any>;
	deleteProfile: (id: string) => Promise<any>;
	setPin: (pin: string) => Promise<any>;
	updateLocale: typeof updateLocale;
	disableProfilePlaybackGuard: (
		id: string,
		body: api.ProfileDisableProfilePlaybackGuardRequest,
		options?: DisableProfilePlaybackGuardOptions,
		info?: any
	) => Promise<any>;
	showPassiveNotification: (config: PassiveNotificationConfig) => Promise<any>;
	sendRegisterAnalyticsEvent: () => void;
}
type Props = PageProps & StateProps & DispatchProps;

interface State {
	audioLanguage: string;
	subtitleLanguage: string;
	languageCode: string;
	categories: string[];
	error: ProfilesError;
	loading: boolean;
	name: string;
	profileType: ProfileTypes;
	deleting: boolean;
	pinError?: boolean;
	pin: string;
	minRatingPlaybackGuard: string;
	touched: boolean;
}

class ProfileEdit extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		const { profile } = props;
		this.state = {
			audioLanguage: profile ? profile.audioLanguage : '',
			subtitleLanguage: profile ? profile.subtitleLanguage : '',
			languageCode: profile ? profile.languageCode : '',
			categories: profile ? profile.segments : [],
			error: undefined,
			loading: false,
			name: profile ? profile.name : '',
			profileType: profileMap(profile),
			deleting: false,
			pin: '',
			pinError: false,
			minRatingPlaybackGuard: undefined,
			touched: false
		};
	}

	componentWillMount() {
		history.pushState(undefined, undefined, location.href);
		window.addEventListener('popstate', this.preventBackNavigation);
		window.scrollTo({ top: 0 });
	}

	componentWillReceiveProps(newProps) {
		if (newProps.requestBackNavigation && newProps.requestBackNavigation !== this.props.requestBackNavigation) {
			this.showModal();
		}
	}

	componentDidMount() {
		this.props.sendRegisterAnalyticsEvent();
	}

	componentWillUnmount() {
		window.removeEventListener('popstate', this.preventBackNavigation);
	}

	private preventBackNavigation = () => {
		window.onpopstate = undefined;
		this.showModal();
	};

	private showModal = () => {
		if (!this.state.touched) {
			this.discardChangesOnSave();
			return;
		}
		const props = openSaveAccountChangesModal(this.confirmChanges, this.discardChangesOnSave, this.onCloseModal);
		this.openModal(props);
	};

	private confirmChanges = () => {
		this.props.resetBackNavigation();
		this.onSubmit();
	};

	private discardChangesOnSave = () => {
		const { resetBackNavigation, profile } = this.props;

		if (this.state.profileType !== profileMap(profile))
			this.setState({
				profileType: profileMap(profile)
			});

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

	render() {
		const { account, profile, accountPinEnabled, activeProfile } = this.props;
		if (!account || !profile) return <div />;
		const { loading, deleting, pinError, profileType, touched } = this.state;
		const { primaryProfileId } = account;
		const editingActiveProfile = profile.id === activeProfile.id;
		const isPrimaryProfileActive = primaryProfileId === activeProfile.id;
		return (
			<div className={'form-white'}>
				{isPrimaryProfileActive && (
					<div className={cx('edit-account-entry', { 'no-padding': editingActiveProfile })}>
						<ProfilesForm
							accountPinEnabled={accountPinEnabled}
							labels={labels}
							textInput={inputs.textInput}
							helpText={helpText}
							profile={profile}
							isPrimaryProfile={editingActiveProfile}
							onSelectProfile={this.onSelectProfile}
							onNameChange={this.onNameChange}
							setError={this.setError}
							onPinChange={this.onPinChange}
							pinError={pinError}
							account={account}
						/>
					</div>
				)}
				{isPrimaryProfileActive && (
					<div className="edit-account-entry">
						<A5ParentalLock
							editingActiveProfile={editingActiveProfile}
							isPrimaryProfile={isPrimaryProfileActive}
							profileType={profileType}
							profile={profile}
							onSelectClassification={this.onSelectClassification}
							{...a5MockEntry}
						/>
					</div>
				)}

				<ProfilePersonalisation {...this.props} updatePersonalization={this.updatePersonalization} />

				<div className="edit-account-entry-buttons">
					{isPrimaryProfileActive && (
						<AccountButton
							onClick={!isMobile() && this.onSubmit}
							onTouchStart={isMobile() && this.onSubmit}
							disabled={!touched}
							type={'submit'}
							loading={loading}
							className={'submit-profile'}
						>
							<IntlFormatter>{inputs.accountButtonEditProfile}</IntlFormatter>
						</AccountButton>
					)}
					{!editingActiveProfile && (
						<AccountButton
							loading={deleting}
							disabled={!isPrimaryProfileActive}
							className={'delete-profile'}
							onClick={!isMobile() && this.openDeleteModal}
							onTouchStart={isMobile() && this.openDeleteModal}
							ordinal="naked"
							spinnerLocation="right"
							small
						>
							<div className={'delete-contents'}>
								<BinIcon height={20} width={20} className={'delete-icon'} />
								<IntlFormatter>{`@{account_profile_delete_button|Delete Profile}`}</IntlFormatter>
							</div>
						</AccountButton>
					)}
				</div>
			</div>
		);
	}

	private setTouched = () => {
		this.setState({ touched: true });
	};

	private updatePersonalization = (name: Personalizations, value: string | string[]) => {
		const newState: any = { [name]: value };
		this.setState(newState);
		this.setTouched();
	};

	private onPinChange = pin => {
		this.setState({ pin });
		this.setTouched();
	};

	private onNameChange = name => {
		this.setState({ name });
		this.setTouched();
	};

	private onSelectClassification = (minRatingPlaybackGuard, pin) => {
		this.setState({ minRatingPlaybackGuard, pin });
		this.setTouched();
	};

	private openDeleteModal = e => {
		e.preventDefault();

		const props: ConfirmationDialogProps = {
			title: '@{account_common_delete}',
			children: '@{account_common_delete_prompt}',
			confirmLabel: '@{app.delete|Delete}',
			cancelLabel: '@{app.cancel|Cancel}',
			onConfirm: this.onDelete,
			hideCloseIcon: true,
			onCancel: noop,
			id: DELETE_PROFILE_MODAL_ID
		};

		this.openModal(props);
	};

	private onDelete = () => {
		this.deleteUser();
	};

	private deleteUser = () => {
		const { deleteProfile, profile } = this.props;

		deleteProfile(profile.id)
			.then(() => {
				goToAccounts(this.getAccountPath());
			})
			.catch(() => {
				// don't let it sit in a persistant loading state
				// but we're not showing errors yet...
				this.setState({
					deleting: false
				});
			});
	};

	private getAccountPath = () => getPathByKey(Account, this.props.config);

	private onSubmit = (e?) => {
		if (e) e.preventDefault();
		const { account } = this.props;
		const restricted = isRestrictedProfile(this.state.profileType);

		if (account.ageGroup !== AgeGroup.E && !validateAgeGroup(account.ageGroup) && restricted) {
			this.showRestrictedProfileDOBModal();
		} else if (!account.pinEnabled && restricted) {
			this.showCreatePinOverlay();
		} else {
			this.onProceedEditProfile();
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
		const props = getRestrictedProfileModalData(account, this.onProceedEditProfile);

		showModal({
			id: RESTRICTED_PROFILE_PIN,
			type: ModalTypes.CUSTOM,
			element: <CreatePinOverlay {...props} />,
			disableAutoClose: true
		});
	}

	private onProceedEditProfile = () => {
		const { profile, accountPinEnabled } = this.props;
		const {
			name,
			profileType,
			subtitleLanguage,
			audioLanguage,
			languageCode,
			error,
			categories,
			pin,
			minRatingPlaybackGuard
		} = this.state;

		if (error) {
			window.scrollTo(0, 0);
			return;
		} else {
			this.setState({
				error: undefined,
				loading: true
			});
		}

		// Pick is now typed - so we can't say "or empty object"
		let profileSubSet: UpdateProfileData = pick(
			profile,
			'id',
			'name',
			'purchaseEnabled',
			'segments',
			'languageCode',
			'subtitleLanguage',
			'audioLanguage',
			'isRestricted'
		);

		const restricted = isRestrictedProfile(profileType);
		const purchaseEnabled = isStandardProfile(profileType);
		const isKids = isKidsProfile(profileType);
		const stringPin = restricted ? pin : undefined;
		const segments = categories;
		const isRestricted = restricted && accountPinEnabled;

		profileSubSet = {
			...profileSubSet,
			name: name.trim(),
			segments: isKids ? setKidsProfile(segments) : unsetKidsProfile(segments),
			audioLanguage,
			languageCode,
			subtitleLanguage,
			purchaseEnabled: restricted || purchaseEnabled,
			isRestricted
		};

		if (minRatingPlaybackGuard && minRatingPlaybackGuard !== '') {
			profileSubSet.minRatingPlaybackGuard = minRatingPlaybackGuard || getMinRatingPlaybackGuard(profile);
		} else {
			profileSubSet.minRatingPlaybackGuard = undefined;
		}

		this.verifyPin(stringPin)
			.then(() => {
				this.updateProfile(profileSubSet);
			})
			.catch(error => {
				this.setState({
					loading: false,
					pinError: !error.isCancelled,
					error: !error.isCancelled ? ProfilesError.Server : undefined
				});
				if (!error.isCancelled) {
					const props = openSystemErrorModal();
					this.openModal(props);
				}
			});
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
		const {
			updateProfile,
			account,
			activeProfile,
			updateLocale,
			disableProfilePlaybackGuard,
			showPassiveNotification
		} = this.props;
		const { name, minRatingPlaybackGuard, pin } = this.state;
		const { primaryProfileId } = account;
		const isPrimaryProfileActive = primaryProfileId === activeProfile.id;
		if (!profile.id) {
			profile.id = this.props.profile.id;
		}
		if (!profile.name && name) profile.name = name;

		return updateProfile(profile)
			.then(res => {
				if (res.error) {
					const error = ProfilesError.Server;
					this.setState({
						error,
						loading: false
					});
					this.openModal(openSystemErrorModal());
				} else {
					updateLocale(profile.languageCode);
					if (minRatingPlaybackGuard === '') {
						disableProfilePlaybackGuard(profile.id, { pin }, {}, { profile });
					}

					if (isPrimaryProfileActive) {
						goToAccounts(this.getAccountPath());
					} else {
						this.updateState(profile);
					}

					showPassiveNotification({
						content: <IntlFormatter>{'@{account_profile_updated}'}</IntlFormatter>
					});
				}
			})
			.catch(() => {
				this.setState({ loading: false });
				this.openModal(openSystemErrorModal());
			});
	};

	private updateState = profile => {
		const { segments } = profile;
		this.setState({
			...profile,
			categories: segments ? [...segments] : this.state.categories
		});
	};

	private verifyPin(pin) {
		const { accountPinEnabled } = this.props;

		if (!accountPinEnabled && pin) {
			return this.props.setPin(pin);
		}

		return Promise.resolve();
	}

	private setError = (error: ProfilesError) => {
		this.setState({ error });
	};
}

function mapStateToProps({ app, account, page }: state.Root, props: AccountPageProps): StateProps {
	let profile,
		accountPinEnabled = false;
	const { query } = props.location;

	if (account.active) {
		profile = account.info.profiles.find(profile => profile.id === query.id);
		accountPinEnabled = account.info.pinEnabled;
	}

	return {
		config: app.config,
		requestBackNavigation: page.requestBackNavigation,
		profile,
		accountPinEnabled,
		account: account.info
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		setPin: pin => dispatch(changePin('', pin)),
		updateProfile: profile => dispatch(updateProfile(profile)),
		deleteProfile: id => dispatch(deleteProfile(id)),
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		resetBackNavigation: () => dispatch(resetBackNavigation()),
		updateLocale: locale => dispatch(updateLocale(locale)),
		disableProfilePlaybackGuard: (
			id: string,
			body: api.ProfileDisableProfilePlaybackGuardRequest,
			options?: DisableProfilePlaybackGuardOptions,
			info?: any
		) => dispatch(disableProfilePlaybackGuard(id, body, options, info)),
		showPassiveNotification: (config: PassiveNotificationConfig): Promise<any> =>
			dispatch(ShowPassiveNotification(config)),
		sendRegisterAnalyticsEvent: () => dispatch(pageAnalyticsEvent(window.location.pathname))
	};
}

export default configAccountPage(ProfileEdit, { template, key, mapStateToProps, mapDispatchToProps }, true);
