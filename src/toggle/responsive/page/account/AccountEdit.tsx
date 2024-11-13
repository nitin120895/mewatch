import * as React from 'react';
import * as cx from 'classnames';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountEdit as key } from 'shared/page/pageKey';
import configAccountPage from 'ref/responsive/page/account/common/configAccountPage';
import { Bem } from 'shared/util/styles';
import RadioButtonComponent from '../../component/input/RadioButtonComponent';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import TextInput from '../../component/input/TextInput';
import LockIcon from 'ref/responsive/component/icons/LockIcon';
import Select from '../../component/select/Select';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import { Account } from 'shared/page/pageKey';
import { goToAccounts, openConfirmPageLeavingModal } from 'shared/account/profileUtil';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { updateAccount } from 'shared/service/action/account';
import { GetAppConfigOptions } from 'shared/service/app';
import { getAppConfig } from 'shared/service/action/app';
import { getAccountLists, AccountEditSelectors } from 'shared/account/accountUtil';
import { OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { pick } from 'shared/util/objects';
import { UpdateAccountOptions } from 'shared/service/account';
import { getAddress } from 'shared/service/action/support';
import { GetAddressOptions } from 'shared/service/support';
import { resetBackNavigation } from 'shared/page/pageWorkflow';
import {
	validateFirstName,
	validateLastName,
	formDisplayState,
	Gender
} from '../../pageEntry/account/ssoValidationUtil';
import { ConfirmationDialogProps } from 'toggle/responsive/component/dialog/ConfirmationDialog';
import { PhoneInput } from 'toggle/responsive/component/input/PhoneInput';
import { pageAnalyticsEvent } from 'shared/analytics/analyticsWorkflow';

import './AccountEdit.scss';

interface OwnProps extends PageProps {}

interface State {
	firstName: string;
	lastName: string;
	gender: Gender;
	genderErrorState: formDisplayState;
	maritalStatus: string;
	income: string;
	occupation: string;
	ethnicity: string;
	nationality: string;
	mobilePhone: string;
	homePhone: string;
	country: string;
	postcode: string;
	block: string;
	street: string;
	unit: string;
	city: string;
	touched: any;
	loading: boolean;
	noFormChanges: boolean;
	postalCodeMessage: string;
	activeSelector: AccountEditSelectors;
}
interface StateProps {
	config?: state.Config;
	account: api.Account;
	requestBackNavigation: string;
}
interface DispatchProps {
	updateAccount: (body: api.AccountUpdateRequest, options: UpdateAccountOptions, info?: any) => Promise<any>;
	getAppConfig: (options?: GetAppConfigOptions) => Promise<api.Response<api.AppConfig>>;
	showModal: (modal: ModalConfig) => void;
	closeModal: (id: string) => void;
	getAddress: (options: GetAddressOptions) => Promise<any>;
	resetBackNavigation: () => void;
	sendRegisterAnalyticsEvent: () => void;
}
type Props = OwnProps & StateProps & DispatchProps;

const bem = new Bem('account-edit');

class AccountEdit extends React.Component<Props, State> {
	constructor(props) {
		super(props);
		const { account } = props;

		const {
			firstName,
			lastName,
			gender,
			maritalStatus,
			income,
			occupation,
			ethnicity,
			nationality,
			mobilePhone,
			homePhone,
			address
		} = account;

		const { country, postcode, block, street, unit, city } = address;
		this.state = {
			firstName,
			lastName,
			touched: {
				firstName: false,
				lastName: false
			},
			gender,
			genderErrorState: formDisplayState.DEFAULT,
			maritalStatus: maritalStatus ? maritalStatus : undefined,
			income: income ? income : undefined,
			occupation: occupation ? occupation : undefined,
			ethnicity: ethnicity ? ethnicity : undefined,
			nationality: nationality ? nationality : undefined,
			mobilePhone,
			homePhone,
			country: country ? country : undefined,
			postcode,
			block,
			street,
			unit,
			city,
			loading: false,
			noFormChanges: true,
			postalCodeMessage: undefined,
			activeSelector: undefined
		};
	}
	componentWillMount() {
		history.pushState(undefined, undefined, location.href);
		window.addEventListener('popstate', this.preventBackNavigation);
	}

	componentDidMount() {
		this.validateGender();
		this.props.sendRegisterAnalyticsEvent();
	}

	componentWillReceiveProps(newProps) {
		if (newProps.requestBackNavigation && newProps.requestBackNavigation !== this.props.requestBackNavigation) {
			this.showConfirmPageLeavingModal();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('popstate', this.preventBackNavigation);
	}

	private setActiveSelector = (activeSelector: AccountEditSelectors) => {
		this.setState({ activeSelector });
	};

	private preventBackNavigation = () => {
		window.onpopstate = undefined;
		this.showConfirmPageLeavingModal();
	};

	private showConfirmPageLeavingModal = () => {
		if (this.state.noFormChanges) {
			this.props.resetBackNavigation();
			goToAccounts(this.getAccountPath());
			return;
		}
		const props = openConfirmPageLeavingModal(this.onPageLeaving);
		this.showModal(props);
	};

	private onPageLeaving = () => {
		this.props.resetBackNavigation();
		goToAccounts(this.getAccountPath());
	};

	private showModal = (props: ConfirmationDialogProps) => {
		this.props.showModal({
			id: props.id,
			type: ModalTypes.CONFIRMATION_DIALOG,
			componentProps: props,
			onClose: this.closeModal(props.id)
		});
	};

	closeModal = modalId => () => {
		const { closeModal, resetBackNavigation } = this.props;
		resetBackNavigation();
		closeModal(modalId);
	};

	render() {
		const { noFormChanges, loading } = this.state;
		return (
			<div>
				<div className={bem.b()}>
					<form className={cx(bem.e('form'), 'form-white')}>
						<IntlFormatter tagName="div" className={bem.e('heading')}>
							{'@{account_primary_details|Your details}'}
						</IntlFormatter>
						{this.renderPrimaryDetails()}
						<IntlFormatter tagName="div" className={bem.e('heading')}>
							{'@{account_location_label|Your location}'}
						</IntlFormatter>
						{this.renderLocationDetails()}
					</form>
				</div>
				<div className={bem.e('buttons')}>
					<AccountButton
						onClick={this.onSubmit}
						type="submit"
						disabled={noFormChanges}
						loading={loading}
						className={noFormChanges ? 'disabled' : ''}
					>
						<IntlFormatter>{'@{account_common_save_button_label|Save}'}</IntlFormatter>
					</AccountButton>
					<AccountButton
						onClick={this.showConfirmPageLeavingModal}
						type="button"
						theme="dark"
						ordinal="secondary"
						className="cancel"
					>
						<IntlFormatter>{'@{account_common_cancel_button_label|Cancel}'}</IntlFormatter>
					</AccountButton>
				</div>
			</div>
		);
	}

	onSubmit = () => {
		const { updateAccount } = this.props;
		const { country, postcode, block, street, unit, city } = this.state;
		const address: api.Address = { country, postcode, block, street, unit, city };

		this.setState({ loading: true });

		const accountData = {
			...pick(
				this.state,
				'firstName',
				'lastName',
				'gender',
				'maritalStatus',
				'income',
				'occupation',
				'ethnicity',
				'nationality',
				'mobilePhone',
				'homePhone'
			),
			address
		};

		if (this.validate()) {
			updateAccount(accountData, {}, accountData).then(res => {
				this.setState({ loading: false });
				if (!res.error) {
					goToAccounts(this.getAccountPath());
				}
			});
		} else {
			this.setState({ loading: false });
			window.scrollTo({ top: 0 });
		}
	};

	getAccountPath() {
		return getPathByKey(Account, this.props.config);
	}

	onTextBlur = e => {
		const touched: any = this.state.touched;
		const { name, value } = e.target;
		touched[name] = true;
		const newState = { touched };
		newState[name] = value.trim();
		this.setState(newState);
	};

	onTextChange = e => {
		const newState = {};
		const { name, value } = e.target;
		newState[name] = value;
		newState['noFormChanges'] = false;
		if (name === 'postcode') {
			newState['postalCodeMessage'] = undefined;
		}
		this.setState(newState);
	};

	renderLocationDetails() {
		const { block, street, unit, city, postcode, postalCodeMessage, activeSelector } = this.state;

		const postCodeError = postcode && postalCodeMessage;
		return (
			<div className={bem.e('location-details')}>
				<div>
					<Select
						autoExpand={false}
						setActiveSelector={() => this.setActiveSelector(AccountEditSelectors.Country)}
						isActive={activeSelector === AccountEditSelectors.Country}
					/>
				</div>
				<div className={cx(bem.e('postCode'), 'marginTop', { postCodeError })}>
					<TextInput
						type="text"
						name="postcode"
						label={'@{account_form_postcode_label|Postcode}'}
						id="postcode"
						onChange={this.onTextChange}
						value={postcode}
						displayState={postCodeError ? 'error' : 'default'}
						message={postCodeError && postalCodeMessage}
					/>
					<button onClick={this.getAddress}>
						<IntlFormatter>{'@{account_get_address_label|Get address}'}</IntlFormatter>
					</button>
				</div>
				<TextInput
					type="text"
					name="block"
					label={'@{account_house_no|Block / House No.}'}
					id="block"
					onChange={this.onTextChange}
					value={block}
				/>
				<TextInput
					type="text"
					name="street"
					label={'@{account_location_street|Street}'}
					id="street"
					onChange={this.onTextChange}
					value={street}
				/>
				<TextInput
					type="text"
					name="unit"
					label={'@{account_location_unit|Unit No.}'}
					id="unit"
					onChange={this.onTextChange}
					value={unit}
				/>
				<TextInput
					type="text"
					name="city"
					label={'@{account_location_city|City}'}
					id="city"
					onChange={this.onTextChange}
					value={city}
				/>
			</div>
		);
	}

	getAddress = e => {
		e.preventDefault();

		this.props.getAddress({ postalCode: this.state.postcode }).then(res => {
			if (!res.error) {
				const { block, street, unit, city } = res.payload;
				this.setState({
					block,
					street,
					unit,
					city,
					postalCodeMessage: undefined
				});
			} else {
				this.setState({ postalCodeMessage: '@{account_postal_code}', block: '', street: '', unit: '', city: '' });
			}
		});
	};

	validate = () => {
		const { firstName, lastName, touched, postalCodeMessage, postcode } = this.state;
		return (
			validateFirstName(firstName, touched).displayState !== formDisplayState.ERROR &&
			validateLastName(lastName, touched).displayState !== formDisplayState.ERROR &&
			!(postcode && postalCodeMessage) &&
			this.validateGender()
		);
	};

	getValue(item, list) {
		const selectedItem = list.find(listItem => listItem.code === this.state[item.key]);
		return selectedItem ? selectedItem.value : item.value;
	}

	getItems(value, items): any[] {
		return items.map(item => this.renderItem(value, item, this.state[value] === item.code));
	}

	getAccountConfigData(account) {
		const { maritalStatus, annualIncome, occupation, ethnicity, nationality } = account;
		return {
			maritalStatusList: getAccountLists(maritalStatus),
			incomeList: getAccountLists(annualIncome),
			occupationList: getAccountLists(occupation),
			ethnicityList: getAccountLists(ethnicity),
			nationalityList: getAccountLists(nationality)
		};
	}

	renderPrimaryDetails() {
		const { firstName, lastName, mobilePhone, homePhone, touched, activeSelector } = this.state;
		const { displayState: displayStateFirstName, message: messageFirstName } = validateFirstName(firstName, touched);
		const { displayState: displayStateLastName, message: messageLastName } = validateLastName(lastName, touched);

		return (
			<div className={bem.e('primary-details')}>
				{this.renderEmail()}
				<TextInput
					type="text"
					displayState={displayStateFirstName}
					required={true}
					name="firstName"
					label={'@{form_register_firstName_label|First Name}'}
					id="firstName"
					onBlur={this.onTextBlur}
					onChange={this.onTextChange}
					value={firstName}
					message={messageFirstName}
				/>
				<TextInput
					type="text"
					displayState={displayStateLastName}
					required={true}
					name="lastName"
					label={'@{form_register_lastName_label|Last Name}'}
					id="lastName"
					onBlur={this.onTextBlur}
					onChange={this.onTextChange}
					value={lastName}
					message={messageLastName}
				/>
				<IntlFormatter tagName="h4" className={bem.e('field-title-gender', [this.state.genderErrorState])}>
					{'@{form_register_gender_label|Gender}'}
				</IntlFormatter>
				{this.renderGender()}
				<div className="marital-status">
					<Select
						autoExpand={false}
						setActiveSelector={() => this.setActiveSelector(AccountEditSelectors.MaritalStatus)}
						isActive={activeSelector === AccountEditSelectors.MaritalStatus}
					/>
				</div>
				<div className={cx('income', 'marginTop')}>
					<Select
						autoExpand={false}
						setActiveSelector={() => this.setActiveSelector(AccountEditSelectors.Income)}
						isActive={activeSelector === AccountEditSelectors.Income}
					/>
				</div>
				<div className={cx('occupation', 'marginTop')}>
					<Select
						autoExpand={false}
						setActiveSelector={() => this.setActiveSelector(AccountEditSelectors.Occupation)}
						isActive={activeSelector === AccountEditSelectors.Occupation}
					/>
				</div>
				<div className={cx('ethnicity', 'marginTop')}>
					<Select
						autoExpand={false}
						setActiveSelector={() => this.setActiveSelector(AccountEditSelectors.Ethnicity)}
						isActive={activeSelector === AccountEditSelectors.Ethnicity}
					/>
				</div>
				<div className={cx('nationality', 'marginTop')}>
					<Select
						autoExpand={false}
						setActiveSelector={() => this.setActiveSelector(AccountEditSelectors.Nationality)}
						isActive={activeSelector === AccountEditSelectors.Nationality}
					/>
				</div>
				<PhoneInput
					name="mobilePhone"
					label={'@{account_form_mobile_label|Mobile Phone}'}
					id="mobilePhone"
					onChange={this.onTextChange}
					value={mobilePhone}
					className="marginTop"
				/>
				<PhoneInput
					name="homePhone"
					label={'@{account_form_home_phone_label|Home Phone}'}
					id="homePhone"
					onChange={this.onTextChange}
					value={homePhone}
				/>
			</div>
		);
	}

	renderItem = (label, item, active) => {
		return (
			<li
				key={item.code}
				className={cx(bem.e('item'), { active })}
				onClick={() => this.onOptionClick(label, item.code)}
			>
				<IntlFormatter>{item.value}</IntlFormatter>
			</li>
		);
	};

	onOptionClick = (label, selectedItemCode) => {
		const newState = {};
		newState[label] = selectedItemCode;
		newState['noFormChanges'] = false;
		this.setState(newState);
	};

	renderEmail() {
		const { email } = this.props.account;
		return (
			<div className={bem.e('email')}>
				<TextInput
					type="text"
					name="email"
					label={'@{form_signIn_email_label|Email}'}
					id="email"
					disabled={true}
					value={email}
				/>
				<div className="lock-icon">
					<LockIcon />
				</div>
			</div>
		);
	}

	onRadioButtonChange = e => {
		this.setState({
			gender: e.currentTarget.value,
			genderErrorState: formDisplayState.DEFAULT,
			noFormChanges: false
		});
	};

	renderGender() {
		const genders: Gender[] = ['female', 'male', 'preferNotToSay'];

		return (
			<div className={bem.e('gender')}>
				{genders.map(gender => (
					<RadioButtonComponent
						className={bem.e('gender-radio')}
						checked={this.state.gender === gender}
						name="gender"
						value={gender}
						key={gender}
						onChange={this.onRadioButtonChange}
						label={`@{form_gender_step2_${gender}}`}
					/>
				))}
				<IntlFormatter elementType={'div'} className={bem.e('gender-error', [this.state.genderErrorState])}>
					{`@{empty_required_error}`}
				</IntlFormatter>
			</div>
		);
	}

	private validateGender() {
		const { gender } = this.state;
		this.setState({ genderErrorState: gender ? formDisplayState.DEFAULT : formDisplayState.ERROR });
		return !!gender;
	}
}

function mapStateToProps({ app, account, page }: state.Root): StateProps {
	return {
		config: app.config,
		account: account.info,
		requestBackNavigation: page.requestBackNavigation
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		updateAccount: (body: api.AccountUpdateRequest, options: UpdateAccountOptions, info?: any) =>
			dispatch(updateAccount(body, options, info)),
		getAppConfig: (options?: GetAppConfigOptions) => dispatch(getAppConfig(options)),
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		getAddress: (options: GetAddressOptions) => dispatch(getAddress(options)),
		resetBackNavigation: () => dispatch(resetBackNavigation()),
		sendRegisterAnalyticsEvent: () => dispatch(pageAnalyticsEvent(window.location.pathname))
	};
}

export default configAccountPage(AccountEdit, { template, key, mapStateToProps, mapDispatchToProps }, true);
