import * as React from 'react';
import AccordionItem from 'ref/responsive/component/AccordionItem';
import SmileyIcon from 'ref/responsive/component/icons/SmileyIcon';
import BearIcon from 'ref/responsive/component/icons/BearIcon';
import LockIcon from 'ref/responsive/component/icons/LockIcon';
import BinIcon from 'ref/responsive/component/icons/BinIcon';
import TextInput from 'ref/responsive/component/input/TextInput';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import CreatePin from '../../../component/CreatePin';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import { Account } from 'shared/page/pageKey';
import { getPathByKey } from 'shared/page/sitemapLookup';
import * as AccountActions from 'shared/account/accountWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import * as UILayerActions from 'shared/uiLayer/uiLayerWorkflow';
import { withRouter } from 'react-router';
import { isKidsProfile, setKidsProfile, unsetKidsProfile } from 'ref/responsive/util/kids';
import { pick } from 'shared/util/objects';
import * as cx from 'classnames';

import './ProfilesForm.scss';

const enum ProfileTypes {
	Standard,
	Kids,
	Restricted
}

const enum ProfilesError {
	Server,
	NameTooShort,
	NameUsed
}

interface DispatchProps {
	showPassiveNotification: (config: PassiveNotificationConfig) => void;
	showModal: (config: ModalConfig) => void;
	updateProfile: (state: api.ProfileDetail) => Promise<any>;
	deleteProfile: (id: string) => Promise<any>;
	newProfile: (newProfile) => Promise<any>;
	setPin: (pin: string) => Promise<any>;
}

const MAXIMUM_LENGTH_OF_PROFILE_NAME = 20;
const MINIMUM_LENGTH_OF_PROFILE_NAME = 2;

interface ProfilesFormProps {
	labels: { standard: string; kids: string; restricted: string };
	inputs: { textInput: string; accountButton: string };
	helpText: { kids: string; restricted: string };
	id?: string;
	profile?: api.ProfileDetail;
	router?: ReactRouter.InjectedRouter;
	config?: state.Config;
	accountPinEnabled?: boolean;
	isPrimaryProfile?: boolean;
	isCurrentProfile?: boolean;
}

interface ProfilesFormState {
	selected: ProfileTypes;
	profile: api.ProfileDetail;
	name: string;
	pin: number[];
	loading: boolean;
	error: ProfilesError;
	pinError?: boolean;
	deleting?: boolean;
}

const bem = new Bem('profiles-form');

function profileMap(profile: api.ProfileDetail) {
	if (profile && profile.isRestricted) return ProfileTypes.Restricted;
	else if (profile && isKidsProfile(profile.segments)) return ProfileTypes.Kids;
	return ProfileTypes.Standard;
}

const errorMap = {
	[ProfilesError.NameTooShort]:
		'@{account_profile_error_nameTooShort|Please enter a name between 2 and 20 characters.}',
	[ProfilesError.NameUsed]:
		'@{account_profile_error_nameUsed|This name is already in use, please try a different name.}',
	[ProfilesError.Server]: '@{app_error_unknown|Sorry something went wrong. Please try again later.}'
};

type ProfileTypeChoice = {
	icon: any;
	title: (labels) => string;
	id: ProfileTypes;
};

const ProfileTypeChoices: Array<ProfileTypeChoice> = [
	{
		icon: <SmileyIcon className={bem.e('icon')} />,
		title: labels => labels.standard,
		id: ProfileTypes.Standard
	},
	{
		icon: <BearIcon className={bem.e('icon')} />,
		title: labels => labels.kids,
		id: ProfileTypes.Kids
	},
	{
		icon: <LockIcon className={bem.e('icon', 'lock')} />,
		title: labels => labels.restricted,
		id: ProfileTypes.Restricted
	}
];

class ProfilesForm extends React.Component<ProfilesFormProps & DispatchProps, ProfilesFormState> {
	state: ProfilesFormState = {
		profile: this.props.profile,
		loading: false,
		name: this.props.profile ? this.props.profile.name : '',
		selected: profileMap(this.props.profile),
		pin: [],
		error: undefined,
		pinError: false
	};

	private verifyPin(profile, pin) {
		const { accountPinEnabled } = this.props;

		if (profile.isRestricted && !accountPinEnabled && !pin) {
			return Promise.reject({ error: true });
		}

		if (profile.isRestricted && !accountPinEnabled && pin) {
			return this.props.setPin(pin);
		}

		return Promise.resolve();
	}

	private goToAccounts = () => {
		this.setState({ loading: false });
		const path = getPathByKey(Account, this.props.config);
		this.props.router.push(path);
	};

	private updateProfile(profile) {
		const { updateProfile, showPassiveNotification } = this.props;
		updateProfile(profile as api.ProfileDetail)
			.then(res => {
				if (res.error) {
					const { body } = res.payload;
					const error = body && body.code === 0 ? ProfilesError.NameTooShort : ProfilesError.NameUsed;
					this.setState({
						error,
						loading: false
					});
					return;
				}

				showPassiveNotification({
					content: (
						<IntlFormatter values={{ profile: profile.name }}>
							{'@{account.profile.updateMessage|Profile Update Succesful}'}
						</IntlFormatter>
					)
				});
				this.goToAccounts();
			})
			.catch(error => {
				this.setState({
					loading: false,
					error: !error.isCancelled ? ProfilesError.Server : undefined
				});
			});
	}

	private createProfile(profile) {
		const { newProfile, showPassiveNotification } = this.props;
		newProfile(profile)
			.then(res => {
				if (res.error) {
					const { body } = res.payload;
					const error = body && body.code === 0 ? ProfilesError.NameTooShort : ProfilesError.NameUsed;
					this.setState({
						error,
						loading: false
					});
					return;
				}

				showPassiveNotification({
					content: (
						<IntlFormatter values={{ profile: profile.name }}>
							{'@{account.profile.createMessage|Profile Create Succesful}'}
						</IntlFormatter>
					)
				});
				this.goToAccounts();
			})
			.catch(error => {
				this.setState({
					loading: false,
					error: !error.isCancelled ? ProfilesError.Server : undefined
				});
			});
	}

	private inputState() {
		const { error, loading } = this.state;
		if (loading) return 'disabled';
		else if (error) return 'error';
		else return 'default';
	}

	private isDisabled(name: string) {
		return !name || name.length < MINIMUM_LENGTH_OF_PROFILE_NAME || name.length > MAXIMUM_LENGTH_OF_PROFILE_NAME;
	}

	private onTypeClick = id => this.setState({ selected: id });

	private onSubmit = e => {
		e.preventDefault();
		const { profile, name, selected, pin } = this.state;

		if (this.isDisabled(name.trim())) return;

		this.setState({
			error: undefined,
			loading: true,
			pinError: false
		});

		// Pick is now typed - so we can't say "or empty object"
		const profileSubSet = profile
			? pick(profile, 'id', 'name', 'isRestricted', 'purchaseEnabled', 'segments')
			: ({} as api.ProfileDetail);
		const restricted = selected === ProfileTypes.Restricted;
		const purchaseEnabled = selected === ProfileTypes.Standard;
		const isKids = selected === ProfileTypes.Kids;
		const stringPin = restricted ? pin.join('') : undefined;
		const segments = profileSubSet.segments || [];

		profileSubSet.segments = isKids ? setKidsProfile(segments) : unsetKidsProfile(segments);
		profileSubSet.isRestricted = restricted;
		profileSubSet.purchaseEnabled = restricted || purchaseEnabled;
		profileSubSet.name = name.trim();

		this.verifyPin(profileSubSet, stringPin)
			.then(res => {
				if (profileSubSet.id) {
					this.updateProfile(profileSubSet);
				} else {
					this.createProfile(profileSubSet);
				}
			})
			.catch(error => {
				this.setState({
					loading: false,
					pinError: !error.isCancelled,
					error: !error.isCancelled ? ProfilesError.Server : undefined
				});
			});
	};

	private onNameChange = e => {
		this.setState({
			name: e.target.value,
			error: undefined
		});
	};

	private onDelete = e => {
		e.preventDefault();
		const { showModal } = this.props;

		showModal({
			id: 'profile-delete',
			type: ModalTypes.CONFIRMATION_DIALOG,
			componentProps: {
				title: '@{account.profile.deleteModalTitle|Delete Profile?}',
				confirmLabel: '@{app.delete|Delete}',
				children: (
					<IntlFormatter>{'@{account.profile.deleteModalMessage|Are you sure you want to delete?}'}</IntlFormatter>
				),
				onConfirm: this.deleteProfile
			}
		});
	};

	private deleteProfile = () => {
		const { deleteProfile, profile, showPassiveNotification } = this.props;
		// we're assuming happy here by returning to accounts straight away
		this.goToAccounts();
		deleteProfile(profile.id)
			.then(() => {
				showPassiveNotification({
					content: (
						<IntlFormatter values={{ profile: profile.name }}>
							{'@{account.profile.deleteMessageSuccess|Profile Delete Successful}'}
						</IntlFormatter>
					)
				});
			})
			.catch(error => {
				showPassiveNotification({
					content: (
						<IntlFormatter values={{ profile: profile.name }}>
							{'@{account.profile.deleteMessageFailure|Profile Delete Unsuccesful}'}
						</IntlFormatter>
					)
				});
			});
	};

	private onPinChange = val => {
		this.setState({ pin: val });
	};

	render() {
		const { inputs, accountPinEnabled, isPrimaryProfile, isCurrentProfile, profile } = this.props;
		const { loading, error, deleting } = this.state;
		const { textInput, accountButton } = inputs;
		const { name, selected, pin, pinError } = this.state;
		let choices = ProfileTypeChoices;
		// don't allow primary profile change type to Kids
		if (isPrimaryProfile) {
			choices = choices.filter(item => item.id !== ProfileTypes.Kids);
		}

		return (
			<div className={bem.b()}>
				<form className={cx(bem.e('form-wrap'))} onSubmit={this.onSubmit} noValidate>
					<div className={bem.e('choices')}>{choices.map(this.renderProfileType)}</div>
					<div className={bem.e('helper-text-wrap')}>{this.renderHelpText()}</div>
					<TextInput
						displayState={this.inputState()}
						label={textInput}
						id={'profile-name'}
						name={'profile-name'}
						required={true}
						className={bem.e('input')}
						onChange={this.onNameChange}
						value={name}
						message={error ? errorMap[error] : `@{account_profile_notice|2-20 characters}`}
						maxLength={MAXIMUM_LENGTH_OF_PROFILE_NAME}
						minLength={MINIMUM_LENGTH_OF_PROFILE_NAME}
					/>

					{!accountPinEnabled && (
						<AccordionItem open={selected === ProfileTypes.Restricted}>
							<div className={bem.e('create-pin')}>
								<CreatePin
									pin={pin}
									error={pinError}
									onChange={this.onPinChange}
									disable={loading}
									title={`@{account_profile_createPin_title|Create a PIN}`}
									children={`@{account_createPin_hint|The account PIN is applicable for all profiles}`}
								/>
							</div>
						</AccordionItem>
					)}
					<div className={bem.e('buttons')}>
						<AccountButton
							type={'submit'}
							loading={loading}
							className={bem.e('submit-profile')}
							disabled={this.isDisabled(name.trim())}
						>
							<IntlFormatter>{accountButton}</IntlFormatter>
						</AccountButton>
						{!isPrimaryProfile && profile && profile.id && (
							<AccountButton
								loading={deleting}
								className={bem.e('delete-profile')}
								onClick={this.onDelete}
								ordinal="naked"
								spinnerLocation="right"
								disabled={isCurrentProfile || loading}
								small
							>
								<div className={bem.e('delete-contents')}>
									<BinIcon height={20} width={20} className={bem.e('delete-icon')} />
									<IntlFormatter>{`@{account_profile_delete_button|Delete Profile}`}</IntlFormatter>
								</div>
							</AccountButton>
						)}
					</div>
				</form>
			</div>
		);
	}

	private renderHelpText() {
		const { kids, restricted } = this.props.helpText;
		const { selected } = this.state;
		const message = {
			[ProfileTypes.Kids]: kids,
			[ProfileTypes.Restricted]: restricted
		}[selected];

		if (!message) return '';
		return (
			<p className={bem.e('helper-text')}>
				<i>
					<IntlFormatter>{message}</IntlFormatter>
				</i>
			</p>
		);
	}

	private renderProfileType = (ProfileType: ProfileTypeChoice) => {
		const { labels } = this.props;
		const { loading } = this.state;
		const { title, icon, id } = ProfileType;
		return (
			<button
				key={id}
				type={'button'}
				className={bem.e('button', { chosen: id === this.state.selected })}
				onClick={() => this.onTypeClick(id)}
				disabled={loading}
			>
				{icon}
				<IntlFormatter key={'text'} className={cx(bem.e('label'), 'truncate')}>
					{title(labels)}
				</IntlFormatter>
			</button>
		);
	};
}

const actions = {
	updateProfile: AccountActions.updateProfile,
	newProfile: AccountActions.newProfile,
	deleteProfile: AccountActions.deleteProfile,
	showPassiveNotification: UILayerActions.ShowPassiveNotification,
	showModal: UILayerActions.OpenModal,
	setPin: AccountActions.changePin
};

function mapStateToProps({ app, account }: state.Root, ownProps) {
	let profile, accountPinEnabled;
	if (account.active) {
		profile = account.info.profiles.find(profile => ownProps.id === profile.id);
		accountPinEnabled = account.info.pinEnabled;
	}
	return {
		profile,
		config: app.config,
		accountPinEnabled
	};
}

export default connect<any, DispatchProps, ProfilesFormProps>(
	mapStateToProps,
	actions
)(withRouter(ProfilesForm));
