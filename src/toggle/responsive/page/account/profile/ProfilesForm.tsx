import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import SmileyIcon from 'ref/responsive/component/icons/SmileyIcon';
import BearIcon from 'ref/responsive/component/icons/BearIcon';
import LockIcon from 'ref/responsive/component/icons/LockIcon';
import TextInput from 'ref/responsive/component/input/TextInput';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { isKidsProfile as isKidsProfiles } from 'ref/responsive/util/kids';
import { Bem } from 'shared/util/styles';
import { CloseModal, OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import { isKidsProfile, isSubprofilesFeatureEnabled } from 'toggle/responsive/util/profileUtil';
import { onlyAlphaRegex } from 'toggle/responsive/pageEntry/account/ssoValidationUtil';

import './ProfilesForm.scss';

const KIDS_PROFILE_MODAL_ID = 'kids-profile-modal';

export const enum ProfileTypes {
	Standard,
	Kids,
	Restricted
}

export const enum ProfilesError {
	Server,
	NameUsed,
	Required,
	Invalid
}

const MAXIMUM_LENGTH_OF_PROFILE_NAME = 20;
const MINIMUM_LENGTH_OF_PROFILE_NAME = 2;

interface ProfilesFormProps {
	labels: { standard: string; kids: string; restricted: string };
	textInput: string;
	helpText: { kids: string; restricted: string };
	profile?: api.ProfileDetail;
	accountPinEnabled?: boolean;
	isPrimaryProfile?: boolean;
	isCurrentProfile?: boolean;
	error?: ProfilesError;
	onNameChange?: (name: string) => void;
	onSelectProfile?: (id: number) => void;
	onPinChange?: (pin: number) => void;
	showModal?: (modal: ModalConfig) => void;
	closeModal?: (id: string) => void;
	pinError?: boolean;
	profiles?: api.ProfileSummary[];
	setError?: (error: ProfilesError) => void;
	account?: api.Account;
}

interface ProfilesFormState {
	selected: ProfileTypes;
	profile: api.ProfileDetail;
	name: string;
	loading: boolean;
	error: any;
	touched: boolean;
}

export function profileMap(profile: api.ProfileDetail) {
	if (profile && profile.isRestricted) return ProfileTypes.Restricted;
	else if (profile && isKidsProfiles(profile.segments)) return ProfileTypes.Kids;
	return ProfileTypes.Standard;
}

const errorMap = {
	[ProfilesError.NameUsed]:
		'@{account_profile_error_nameUsed|This name is already in use, please try a different name.}',
	[ProfilesError.Server]: '@{app_error_unknown|Sorry something went wrong. Please try again later.}',
	[ProfilesError.Required]: '@{form_register_required_field_error}',
	[ProfilesError.Invalid]: '@{account_profile_invalid_name}'
};

const bem = new Bem('profiles-form');

type ProfileTypeChoice = {
	icon: any;
	title: (labels) => string;
	id: ProfileTypes;
};

export const ProfileTypeChoices: Array<ProfileTypeChoice> = [
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

class ProfilesForm extends React.Component<ProfilesFormProps, ProfilesFormState> {
	constructor(props, ...args) {
		super(props, ...args);
		const { profile } = this.props;
		this.state = {
			profile,
			name: profile ? profile.name : '',
			selected: profileMap(profile),
			loading: false,
			error: undefined,
			touched: false
		};
	}

	componentWillReceiveProps(nextProps: ProfilesFormProps) {
		if (nextProps.error && this.props.error !== nextProps.error) {
			const error = this.checkInputValidation(this.state.name);
			this.setState({ touched: true, error });
		}
	}

	private inputState() {
		if (this.state.loading) return 'disabled';
		else if (this.state.error || this.props.error) return 'error';
		else return 'default';
	}

	private onClick = id => {
		this.changeProfileType(id);
	};

	private changeProfileType = id => {
		this.setState({ selected: id });
		const { onSelectProfile } = this.props;
		if (onSelectProfile) onSelectProfile(id);
	};

	private onNameChange = e => {
		const { onNameChange } = this.props;
		const value = e.target.value;
		const name =
			value.length > MAXIMUM_LENGTH_OF_PROFILE_NAME ? value.substring(0, MAXIMUM_LENGTH_OF_PROFILE_NAME) : value;
		const error = this.checkInputValidation(value);

		this.setState({
			touched: true,
			name,
			error
		});

		this.props.setError(error);

		if (onNameChange) onNameChange(name);
	};

	private checkUserExists = (name: string) => {
		const { profile } = this.props;
		return this.props.account.profiles.some(
			profileInfo => profileInfo.name === name && (!profile || (profile && profile.id !== profileInfo.id))
		);
	};

	private checkInputValidation = value => {
		value = value && value.trim();
		if (!value.length) {
			return ProfilesError.Required;
		}

		if (!onlyAlphaRegex.test(value)) {
			return ProfilesError.Invalid;
		}

		return this.checkUserExists(value) ? ProfilesError.NameUsed : undefined;
	};

	private getProfileChoices(): Array<ProfileTypeChoice> {
		const noKidsProfileTypeChoices = ProfileTypeChoices.filter(choice => choice.id !== ProfileTypes.Kids);

		if (!this.props.profile) return ProfileTypeChoices;
		if (isKidsProfile(this.state.selected)) return [];
		return noKidsProfileTypeChoices;
	}

	private renderProfileChoices() {
		const choices = this.getProfileChoices();

		return [
			<div key="buttons" className={bem.e('choices')}>
				{choices.map(this.renderButtons)}
			</div>,
			<div key="help-text" className={bem.e('helper-text-wrap')}>
				{this.renderHelpText()}
			</div>
		];
	}

	render() {
		const { textInput } = this.props;
		const { name, touched } = this.state;

		return (
			<div className={bem.b()}>
				{isSubprofilesFeatureEnabled && this.renderProfileChoices()}
				<TextInput
					displayState={this.inputState()}
					label={textInput}
					id={'profile-name'}
					onBlur={() => this.checkInputValidation(name)}
					name={'profile-name'}
					required={true}
					className={bem.e('input')}
					onChange={this.onNameChange}
					value={name}
					message={touched && errorMap[this.checkInputValidation(name)]}
					maxLength={MAXIMUM_LENGTH_OF_PROFILE_NAME}
					minLength={MINIMUM_LENGTH_OF_PROFILE_NAME}
				/>
			</div>
		);
	}

	private renderHelpText() {
		if (this.state.selected === ProfileTypes.Standard) return;
		const { kids, restricted } = this.props.helpText;
		const { selected } = this.state;
		const message = {
			[ProfileTypes.Kids]: kids,
			[ProfileTypes.Restricted]: restricted
		}[selected];

		if (!message) return '';
		return (
			<IntlFormatter elementType="p" className={bem.e('helper-text')}>
				{message}
			</IntlFormatter>
		);
	}

	private renderButtons = item => {
		const { loading } = this.state;
		const { title, icon, id } = item;
		const { labels } = this.props;

		return (
			<button
				key={title}
				type={'button'}
				className={bem.e('button', { chosen: id === this.state.selected })}
				onClick={() => this.onClick(id)}
				disabled={loading}
			>
				{icon}
				<IntlFormatter key={'text'} className={cx(bem.e('label'), 'truncate')}>
					{title(labels)}
				</IntlFormatter>
			</button>
		);
	};

	closeModal = () => {
		this.props.closeModal(KIDS_PROFILE_MODAL_ID);
	};
}

function mapDispatchToProps(dispatch) {
	return {
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id))
	};
}

export default connect<any, any, ProfilesFormProps>(
	undefined,
	mapDispatchToProps
)(ProfilesForm);
