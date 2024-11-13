import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Checkbox from 'ref/responsive/component/input/Checkbox';
import Spinner from 'ref/responsive/component/Spinner';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import ChevronIcon from 'ref/responsive/component/icons/ChevronIcon';
import Policy from './Policy';
import { Bem } from 'shared/util/styles';
import { checkUserExists } from 'shared/service/action/support';
import { getMockedValue } from 'shared/util/input';
import { browserHistory } from 'shared/util/browserHistory';
import { Privacy, TermsAndConditions, ResetPassword } from 'shared/page/pageKey';
import Link from 'shared/component/Link';
import Select, { selectBem } from 'toggle/responsive/component/select/Select';
import { formatDateInputToISO, validateDateOfBirth, ValidationState } from 'toggle/responsive/util/dateOfBirth';
import { newslettersClassification, MIN_SECURE_STRING_LENGTH } from 'toggle/responsive/pageEntry/account/accountUtils';
import DateOfBirthInput from 'toggle/responsive/component/input/DateOfBirthInput';
import PinCodeInput from './PinCodeInput';
import TextInput from '../../../component/input/TextInput';
import PasswordInput from '../../../component/input/PasswordInput';
import { registerFormBem } from './CreateAccountForm';
import { verifyRecaptcha } from 'shared/service/action/support';
import Recaptcha from 'toggle/responsive/page/auth/recaptcha/Recaptcha';
import RecaptchaDisclaimer from 'toggle/responsive/page/auth/recaptcha/RecaptchaDisclaimer';
import {
	Gender,
	formDisplayState,
	validateRegisterDateOfBirth,
	validateGender,
	validatePassword,
	validateConfirmPassword,
	validateFirstName,
	validateLastName,
	validateEmail,
	isGenderValid,
	isEmailSyntaxValid,
	isDoBValid,
	arePasswordsValid,
	isValidPassword,
	isNameValid
} from '../../../pageEntry/account/ssoValidationUtil';
import './RegisterStep1.scss';

const registerFormStep1Bem = new Bem('register-step1');
type Touched = { [key: string]: boolean };

interface State {
	email: string;
	password: string;
	confirmPassword: string;
	touched: Touched;
	displayState: form.DisplayState;
	checkingUsername: boolean;
	usernameExists: boolean;
	firstName: string;
	lastName: string;
	gender?: Gender;
	dateOfBirth: string;
	setUpPIN: boolean;
	confirmAge: boolean;
	pin: string;
	pinConfirm: string;
	displayStateConfirmAge: form.DisplayState;
	newsletters: Set<string>;
	termsCondition: boolean;
	isDropdownExpanded: boolean;
	formSubmitted: boolean;
	submitted: boolean;
}

interface OwnProps {
	previousStep: number;
	loading: boolean;
	signInPath: string;
	continueToNextStep: (config: Partial<api.RegistrationRequest>) => void;
}

interface DispatchProps {
	checkUserExists?: (body: api.UserExistsRequest) => Promise<any>;
	verifyRecaptcha?: (body: api.VerifyRecaptchaRequest) => Promise<any>;
}

type Props = OwnProps & DispatchProps;

class RegisterStep1 extends React.Component<Props, State> {
	email: HTMLInputElement;

	state = {
		email: getMockedValue('email'),
		password: getMockedValue('password'),
		confirmPassword: getMockedValue('password'),
		firstName: getMockedValue('firstName'),
		lastName: getMockedValue('lastName'),
		gender: getMockedValue('gender'),
		dateOfBirth: getMockedValue('dateOfBirth'),
		termsCondition: false,
		touched: {
			email: false,
			password: false,
			confirmPassword: false,
			firstName: false,
			lastName: false,
			dateOfBirth: false,
			pinConfirm: false,
			termsCondition: false,
			pin: false,
			gender: false
		},
		displayState: formDisplayState.DEFAULT,
		checkingUsername: false,
		usernameExists: false,
		setUpPIN: false,
		confirmAge: false,
		pin: '',
		pinConfirm: '',
		displayStateConfirmAge: formDisplayState.DEFAULT,
		formSubmitted: false,
		newsletters: new Set<string>(),
		isDropdownExpanded: false,
		submitted: false
	};

	componentDidMount(): void {
		this.email.focus();
	}

	private onSubmit = e => {
		e.preventDefault();
		if (this.validateStep1()) {
			window.grecaptcha.execute();
		}
	};

	private recaptchaCallback = token => {
		window.grecaptcha.reset();
		this.props
			.verifyRecaptcha({
				response: token,
				type: 2
			})
			.then(res => {
				if (res.payload.success) {
					if (!this.state.usernameExists) {
						this.setState({ formSubmitted: true });
						this.continueToNextStep();
					}
				}
			});
	};

	private continueToNextStep() {
		const {
			firstName,
			lastName,
			termsCondition,
			dateOfBirth,
			newsletters,
			gender,
			pin,
			email,
			password,
			setUpPIN
		} = this.state;

		const config = {
			firstName,
			lastName,
			termsCondition,
			dateOfBirth: formatDateInputToISO(dateOfBirth),
			gender,
			newsletters: Array.from(newsletters),
			pin: setUpPIN ? pin : undefined,
			email,
			password
		};
		this.props.continueToNextStep(config);
	}

	private validateStep1() {
		const {
			firstName,
			lastName,
			password,
			confirmPassword,
			email,
			dateOfBirth,
			gender,
			termsCondition,
			setUpPIN,
			touched
		} = this.state;

		const isValid =
			isNameValid(firstName) &&
			isNameValid(lastName) &&
			arePasswordsValid(password, confirmPassword) &&
			isEmailSyntaxValid(email) &&
			isDoBValid(dateOfBirth) &&
			isGenderValid(gender, touched) &&
			termsCondition &&
			this.isPinValid();

		this.setState({
			touched: {
				email: true,
				password: true,
				confirmPassword: true,
				firstName: true,
				lastName: true,
				dateOfBirth: true,
				gender: true,
				pin: setUpPIN ? true : touched.pin,
				pinConfirm: setUpPIN ? true : touched.pinConfirm,
				termsCondition: true
			},
			displayState: isValid ? formDisplayState.SUCCESS : formDisplayState.ERROR,
			submitted: true
		});
		return isValid;
	}

	isPinValid() {
		const { setUpPIN, dateOfBirth, confirmAge, pin, pinConfirm } = this.state;
		if (setUpPIN) {
			return (
				dateOfBirth &&
				confirmAge &&
				pin.length === MIN_SECURE_STRING_LENGTH &&
				pinConfirm.length === MIN_SECURE_STRING_LENGTH &&
				pin === pinConfirm
			);
		}
		return true;
	}

	getExistingEmailErrorMessage = () => {
		return (
			<div className={registerFormStep1Bem.e('error-msg-userExists')}>
				<IntlFormatter elementType="div">{'@{register_sso_email_already_exists}'}</IntlFormatter>
				<IntlFormatter elementType="div" className={registerFormStep1Bem.e('error-msg-userExists', 'row')}>
					<div className={registerFormStep1Bem.e('error-msg-userExists', 'dot')} />
					<IntlFormatter
						onClick={this.goToSignIn}
						className={registerFormStep1Bem.e('error-msg-userExists', 'underline')}
					>
						{'@{register_sso_email_error__msg_part1}'}
					</IntlFormatter>
					{'@{register_sso_email_error__msg_part2}'}
				</IntlFormatter>
				<IntlFormatter
					elementType={Link}
					className={registerFormStep1Bem.e('error-msg-userExists', 'underline', 'row')}
					componentProps={{ to: `@${ResetPassword}` }}
				>
					<div className={registerFormStep1Bem.e('error-msg-userExists', 'dot')} />
					{'@{form_signIn_forgotPassword_label}'}
				</IntlFormatter>
			</div>
		);
	};

	private onTextChange = e => {
		const { name, value } = e.target;
		const newState = {};
		newState[name] = value;
		this.setState(newState);
	};

	private onEmailTextChange = e => {
		this.onTextChange(e);
		const { touched } = this.state;
		const { name } = e.target;
		touched[name] = false;
		const newState = {
			touched,
			usernameExists: false
		};

		this.setState(newState);
	};

	private onBlur = e => {
		const touched: Touched = this.state.touched;
		touched[e.target.name] = true;
		this.setState({ touched });
	};

	private onEmailBlur = e => {
		this.onTextBlur(e);
		this.validateEmail();
	};

	private validateEmail = () => {
		this.setState({ checkingUsername: true });
		const username: api.UserExistsRequest = { username: this.state.email };

		this.props.checkUserExists(username).then(res => {
			this.setState({ checkingUsername: false });

			if (!res.error && res.payload.value) {
				this.setState({ usernameExists: true });
			} else {
				this.setState({ usernameExists: false });
			}
		});
	};

	private onTextBlur = e => {
		const touched: Touched = this.state.touched;
		const { name, value } = e.target;
		touched[name] = true;
		const newState = { touched };
		newState[name] = value.trim();
		this.setState(newState);
	};

	resetFields = () => {
		this.setState({ email: '' }, () => this.email.focus());
	};

	goToSignIn = () => {
		const { email } = this.state;
		this.setState({ usernameExists: false }, () =>
			browserHistory.push(`/${this.props.signInPath}?email=${encodeURIComponent(email)}`)
		);
	};

	private validatePins(
		pin: string,
		pinConfirm: string,
		touched: boolean
	): { displayState: form.DisplayState; message?: string } {
		if (!touched && pinConfirm.length < MIN_SECURE_STRING_LENGTH) return { displayState: formDisplayState.DEFAULT };

		if (pinConfirm !== '' && pin !== pinConfirm)
			return { displayState: formDisplayState.ERROR, message: '@{form_register_pins_do_not_match_error_message}' };
		else if (touched && pinConfirm === '')
			return { displayState: formDisplayState.ERROR, message: '@{form_register_required_pin_error_message}' };
		else return { displayState: formDisplayState.SUCCESS };
	}

	private onCheckBoxChange = e => {
		const { touched } = this.state;
		const name = e.target.name;
		touched[e.target.name] = true;
		this.setState(previousState => {
			return { [name]: !previousState[name], touched };
		});
	};

	private onConfirmAgeChange = e => {
		this.onCheckBoxChange(e);
		this.setState({ displayStateConfirmAge: formDisplayState.DEFAULT });
	};

	private onChange = e => {
		const value = e.currentTarget.value;
		const newsletters = this.state.newsletters;

		e.currentTarget.checked ? newsletters.add(value) : newsletters.delete(value);
		this.setState({ newsletters });
	};

	private onOptionClick(gender: Gender) {
		this.setState({ gender });
	}

	render() {
		const { signInPath } = this.props;

		return (
			<div className={cx('form', 'form-white', registerFormBem.b(), registerFormStep1Bem.b())}>
				<Link to={`/${signInPath}`} onClick={this.goToSignIn} className={registerFormStep1Bem.e('signin-link')}>
					<ChevronIcon className={registerFormStep1Bem.e('signin-link-icon')} />
					<IntlFormatter>{'@{form_sendEmail_step1_back|Back to Sign In}'}</IntlFormatter>
				</Link>

				<IntlFormatter elementType="h2" className={registerFormStep1Bem.e('form-title')}>
					{'@{form_register_title|Create your meconnect account}'}
				</IntlFormatter>

				<form onSubmit={this.onSubmit} autoComplete="off">
					{this.renderInputs()}
					{this.renderGenderSelector()}
					{this.renderDob()}
					{this.renderPin()}
					{this.renderMarketing()}
					{this.renderPolicy()}
					{this.renderSubmitButton()}
					<RecaptchaDisclaimer />
					<Recaptcha
						id="signup"
						siteKey={process.env.CLIENT_RECAPTCHA_INVISIBLE_SITE_KEY}
						dataSize="invisible"
						callback={this.recaptchaCallback}
					/>
				</form>
			</div>
		);
	}

	private renderInputs() {
		const { email, password, confirmPassword, usernameExists, firstName, lastName, touched } = this.state;
		const { loading } = this.props;
		const { displayState: displayStateEmail, message: messageEmail } = validateEmail(
			email,
			touched,
			usernameExists,
			this.getExistingEmailErrorMessage()
		);
		const { displayState: displayStatePassword, message: messagePassword } = validatePassword(
			password,
			touched.password
		);
		const { displayState: displayStateConfirmPassword, message: messageConfirmPassword } = validateConfirmPassword(
			password,
			confirmPassword,
			touched.confirmPassword
		);
		const { displayState: displayStateFirstName, message: messageFirstName } = validateFirstName(firstName, touched);
		const { displayState: displayStateLastName, message: messageLastName } = validateLastName(lastName, touched);

		return (
			<div>
				<TextInput
					className={registerFormStep1Bem.e('input', { usernameExists })}
					displayState={displayStateEmail}
					required={true}
					name="email"
					label={'@{form_register_email_label|Email}'}
					id="email"
					autoComplete="off"
					disabled={loading}
					onChange={this.onEmailTextChange}
					value={email}
					onBlur={this.onEmailBlur}
					message={messageEmail}
					onReference={ref => (this.email = ref)}
					forceError={usernameExists}
					mePass={true}
				/>
				<PasswordInput
					className={registerFormStep1Bem.e('input')}
					type="password"
					displayState={displayStatePassword}
					name="password"
					label={'@{form_register_password_label|Password}'}
					disabled={loading}
					id="password"
					onChange={this.onTextChange}
					value={password}
					onBlur={this.onBlur}
					message={messagePassword}
					autoComplete="new-password"
					mePass={true}
					hint={{
						enable: !isValidPassword(password),
						enableIcon: isValidPassword(password),
						message: '@{form_register_first_step_password_short}'
					}}
					advisoryText={true}
				/>
				<PasswordInput
					className={registerFormStep1Bem.e('input')}
					type="password"
					displayState={displayStateConfirmPassword}
					name="confirmPassword"
					label={'@{form_register_confirmPassword_label|Confirm Password}'}
					disabled={loading}
					id="confirmPassword"
					onChange={this.onTextChange}
					value={confirmPassword}
					onBlur={this.onBlur}
					message={messageConfirmPassword}
					autoComplete="new-password"
					mePass={true}
				/>
				<TextInput
					className={registerFormStep1Bem.e('input')}
					type="text"
					displayState={displayStateFirstName}
					required={true}
					name="firstName"
					label={'@{form_register_firstName_label|First Name}'}
					id="firstName"
					disabled={loading}
					onChange={this.onTextChange}
					onBlur={this.onTextBlur}
					value={firstName}
					message={messageFirstName}
					mePass={true}
				/>
				<TextInput
					className={registerFormStep1Bem.e('input')}
					type="text"
					displayState={displayStateLastName}
					required={true}
					name="lastName"
					label={'@{form_register_lastName_label|Last Name}'}
					id="lastName"
					disabled={loading}
					onChange={this.onTextChange}
					onBlur={this.onTextBlur}
					value={lastName}
					message={messageLastName}
					mePass={true}
				/>
			</div>
		);
	}

	onDropdownExpand = isDropdownExpanded => {
		const genderTouched = this.state.touched.gender || !isDropdownExpanded;
		this.setState({ isDropdownExpanded, touched: { ...this.state.touched, gender: genderTouched } });
	};

	private renderGenderSelector() {
		const genders: Gender[] = ['female', 'male', 'preferNotToSay'];
		const { gender, touched, isDropdownExpanded, submitted } = this.state;
		const label = gender ? `@{form_gender_step2_${gender}}` : '@{form_register_gender_label}';

		const { displayState } = validateGender(gender, touched, isDropdownExpanded);
		const shouldShowGenderLabel = isDropdownExpanded || displayState === formDisplayState.ERROR;
		const isExpadedAfterError = (submitted || touched.gender) && !gender && isDropdownExpanded;
		const classes = registerFormStep1Bem.e(
			'gender',
			{ error: displayState === formDisplayState.ERROR },
			{ 'after-error': isExpadedAfterError }
		);

		return (
			<div className={classes}>
				{shouldShowGenderLabel && (
					<IntlFormatter className={registerFormStep1Bem.e('gender', 'label')}>
						{'@{form_register_gender_label}'}
					</IntlFormatter>
				)}
				<Select
					className={registerFormStep1Bem.e('input')}
					mePass={true}
					autoExpand={false}
					defaultLabel={'@{form_register_gender_label}'}
					label={label}
					displayState={displayState}
					options={genders.map(gender => this.renderGenderItem(gender, gender))}
					onDropdownExpand={this.onDropdownExpand}
				/>
			</div>
		);
	}

	private renderGenderItem = (gender: string, aciveGender) => {
		const itemClasses: string = cx(
			selectBem.e('item', {
				active: aciveGender === gender,
				'item-position-left': true
			})
		);

		return (
			<li key={gender} className={itemClasses} onClick={this.onOptionClick.bind(this, gender)}>
				<IntlFormatter elementType="span">{`@{form_gender_step2_${gender}}`}</IntlFormatter>
			</li>
		);
	};

	private renderPin = () => {
		const { setUpPIN, pin, pinConfirm, dateOfBirth, confirmAge, touched, displayStateConfirmAge } = this.state;
		const { loading } = this.props;
		const isDoBValid = validateDateOfBirth(dateOfBirth) === ValidationState.VALID;
		const confirmPinState = this.validatePins(pin, pinConfirm, touched.pinConfirm);
		const displayStatePin = touched.pin && pin === '' ? formDisplayState.ERROR : formDisplayState.DEFAULT;
		const isConfirmedAge = isDoBValid && confirmAge;
		const isPinDisabled = !isDoBValid || !isConfirmedAge;

		if (setUpPIN && !isDoBValid) {
			this.setState({
				setUpPIN: false
			});
		}

		return (
			<div className={registerFormBem.e('field-pin', { disabled: !isDoBValid })}>
				<Checkbox
					labelComponent={
						<IntlFormatter>
							{'@{form_register_set_up_pin|Set up a Control PIN}'}
							&nbsp;
							<IntlFormatter className={registerFormBem.e('optional')}>
								{'@{form_register_optional_label|(Optional)}'}
							</IntlFormatter>
							<IntlFormatter elementType="p" className={registerFormBem.e('pin-description')}>
								{'@{form_register_birth_date_error_required|Date of birth is required to set Control PIN.}'}
							</IntlFormatter>
							<IntlFormatter elementType="p" className={registerFormBem.e('pin-description')}>
								{
									'@{form_register_pin_verification|This PIN is for verification purposes. This includes restricting access to rated content (NC16, M18) and unlocking R21 content.}'
								}
							</IntlFormatter>
						</IntlFormatter>
					}
					name="setUpPIN"
					checked={setUpPIN}
					disabled={loading || !isDoBValid}
					className={registerFormBem.e('set-up-pin', { checked: setUpPIN })}
					onChange={this.onCheckBoxChange}
					mePass={true}
				/>

				<div className={registerFormBem.e('nested')}>
					{setUpPIN && (
						<div className={registerFormBem.e('nested', 'container')}>
							<Checkbox
								label={'@{form_register_general_confirmation_label}'}
								name="confirmAge"
								checked={isConfirmedAge}
								className={registerFormBem.e('confirm-age', { checked: isConfirmedAge })}
								onChange={this.onConfirmAgeChange}
								displayState={displayStateConfirmAge}
								message={
									displayStateConfirmAge === 'error' && (
										<IntlFormatter tagName="span" className="checkbox__message">
											{'@{form_register_required_field_error|This field is required}'}
										</IntlFormatter>
									)
								}
								mePass={true}
							/>
							<div>
								<PinCodeInput
									name="pin"
									onChange={this.onTextChange}
									displayState={displayStatePin}
									message={'@{form_register_required_pin_error_message}'}
									required={true}
									disabled={isPinDisabled}
									label={'@{form_register_enter_pin|Enter PIN (6-Digit)}'}
								/>
								<PinCodeInput
									name="pinConfirm"
									onChange={this.onTextChange}
									displayState={confirmPinState.displayState}
									message={confirmPinState.message}
									required={true}
									disabled={isPinDisabled}
									label={'@{form_register_re-enter_pin|Re-enter PIN}'}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	};

	private renderDob() {
		const { dateOfBirth, touched } = this.state;
		const { loading } = this.props;
		const errorMessage = dateOfBirth ? '@{dob_input_enter_valid}' : '@{dob_input_required}';
		const { displayState } = validateRegisterDateOfBirth(dateOfBirth, touched.dateOfBirth, true);
		const hint = (
			<IntlFormatter>
				{'@{dob_input_tip}'}
				<IntlFormatter elementType="b">{'(@{dob_input_tip-example})'}</IntlFormatter>
			</IntlFormatter>
		);

		return (
			<DateOfBirthInput
				className={registerFormStep1Bem.e('input')}
				displayState={displayState}
				required={true}
				name="dateOfBirth"
				label={'@{dob_input_placeholder}'}
				hint={hint}
				disabled={loading}
				onChange={this.onTextChange}
				onBlur={this.onTextBlur}
				value={dateOfBirth}
				errorMessage={errorMessage}
			/>
		);
	}

	private renderMarketing() {
		return (
			<div className={registerFormBem.e('fields-marketing')}>
				<div className={registerFormBem.e('marketing-item')}>
					<Checkbox
						label={'@{form_register_first_step_newsletter_label}'}
						value={newslettersClassification.meWatch}
						onChange={this.onChange}
						mePass={true}
					/>
				</div>

				<div className={registerFormBem.e('marketing-item')}>
					<Checkbox
						label={'@{form_register_first_step_promotions_label}'}
						value={newslettersClassification.promotions}
						onChange={this.onChange}
						mePass={true}
					/>
				</div>
			</div>
		);
	}

	private renderPolicy() {
		const { termsCondition, touched, displayState } = this.state;
		const { loading } = this.props;
		const labelComponent = (
			<IntlFormatter tagName="div" className={registerFormBem.e('field-description')}>
				{'@{form_register_privacy_policy_description}'}
				&nbsp;
				<Policy pageKey={TermsAndConditions} label={'@{form_register_terms_of_service|terms}'} />
				&nbsp;&&nbsp;
				<Policy pageKey={Privacy} label={'@{form_register_privacy_policy|privacy policy.}'} />
			</IntlFormatter>
		);

		return (
			<div>
				<Checkbox
					labelComponent={labelComponent}
					name="termsCondition"
					required={true}
					checked={termsCondition}
					disabled={loading}
					className={registerFormBem.e('policy')}
					onChange={this.onCheckBoxChange}
					displayState={termsCondition ? formDisplayState.DEFAULT : displayState}
					message={
						displayState === formDisplayState.ERROR && touched.termsCondition && !termsCondition ? (
							<IntlFormatter>{'@{empty_required_error|This is required}'}</IntlFormatter>
						) : (
							undefined
						)
					}
					mePass={true}
				/>
			</div>
		);
	}

	private renderSubmitButton() {
		const { loading } = this.props;
		if (loading) {
			return (
				<div className={registerFormBem.e('spinner')}>
					<Spinner />
				</div>
			);
		}

		return (
			<IntlFormatter
				elementType={AccountButton}
				type="submit"
				onClick={this.onSubmit}
				className={registerFormStep1Bem.e('create-account')}
				componentProps={{
					ordinal: 'primary',
					theme: 'light',
					loading,
					mePass: true
				}}
			>
				{'@{form_register_createAccount_label|Create account}'}
			</IntlFormatter>
		);
	}
}

function mapDispatchToProps(dispatch) {
	return {
		checkUserExists: (body: api.UserExistsRequest) => dispatch(checkUserExists(body)),
		verifyRecaptcha: (body: api.VerifyRecaptchaRequest) => dispatch(verifyRecaptcha(body))
	};
}

export default connect<any, any, Props>(
	undefined,
	mapDispatchToProps
)(RegisterStep1);
