import { ValidationState, validateDateOfBirth } from '../../util/dateOfBirth';

export const onlyAlphaRegex: RegExp = /^[a-zA-Z\s\-]+$/;
export const onlyAlphanumeric: RegExp = /^[A-Za-z0-9]+$/;
export const onlyAlphanumericSpace: RegExp = /^[a-zA-Z0-9\s]+$/;

export const emailRegexp = /^\w+([+.-]?\w+)*@\w+([.-]?\w+)*(\.[a-zA-Z]{2,})+$/i;
const passwordRegexp = /.{8,}/;

export enum formDisplayState {
	DEFAULT = 'default',
	SUCCESS = 'success',
	ERROR = 'error',
	DISABLED = 'disabled'
}

export const isError = (state: form.DisplayState): boolean => state === formDisplayState.ERROR;
export const isSuccess = (state: form.DisplayState): boolean => state === formDisplayState.SUCCESS;
export const isDisabled = (state: form.DisplayState): boolean => state === formDisplayState.DISABLED;

export type Gender = api.RegistrationRequest['gender'];

export enum SignupSteps {
	Registration = 1,
	WelcomeMessage = 2
}

export interface InputHint {
	enable: boolean;
	enableIcon: boolean;
	message: string;
}

export interface DisplayFormState {
	displayState: form.DisplayState;
	message: string | JSX.Element;
}

export function validateOnlyAlphanumericSpaceInputs(
	value: string,
	touched: boolean,
	emptyMessage,
	invalidMessage
): DisplayFormState {
	const result: DisplayFormState = { displayState: formDisplayState.DEFAULT, message: '' };
	if (!value && !touched) return result;
	const isValid = value && onlyAlphanumericSpace.test(value);

	let message;
	if (isValid) {
		message = '';
	} else if (!value) {
		message = emptyMessage;
	} else {
		message = invalidMessage;
	}
	result.displayState = isValid ? formDisplayState.SUCCESS : formDisplayState.ERROR;
	result.message = isValid ? '' : message;
	return result;
}

export function validateOnlyAlphaInputs(
	value: string,
	touched: boolean,
	emptyMessage,
	invalidMessage
): DisplayFormState {
	const result: DisplayFormState = { displayState: formDisplayState.DEFAULT, message: '' };
	if (!value && !touched) return result;
	const isValid = value && onlyAlphaRegex.test(value);

	let message;
	if (isValid) {
		message = '';
	} else if (!value) {
		message = emptyMessage;
	} else {
		message = invalidMessage;
	}
	result.displayState = isValid ? formDisplayState.SUCCESS : formDisplayState.ERROR;
	result.message = isValid ? '' : message;
	return result;
}

export function validateFirstName(firstName: string, touched: any): DisplayFormState {
	return validateOnlyAlphaInputs(
		firstName,
		touched.firstName,
		'@{empty_required_error|This is required}',
		'@{form_register_first_name_validation_error}'
	);
}

export function validateLastName(lastName: string, touched: any): DisplayFormState {
	return validateOnlyAlphaInputs(
		lastName,
		touched.lastName,
		'@{empty_required_error|This is required}',
		'@{form_register_last_name_validation_error}'
	);
}

export function validatePassword(password: string, touched: boolean): DisplayFormState {
	let result: DisplayFormState = { displayState: formDisplayState.DEFAULT, message: '' };
	if (!password && !touched) return result;

	const isValid = password && isValidPassword(password);
	if (isValid) {
		result.displayState = formDisplayState.SUCCESS;
		return result;
	}

	result = {
		displayState: formDisplayState.ERROR,
		message: getInvalidPasswordMessage(password)
	};

	return result;
}

export function validateConfirmPassword(password: string, confirmPassword: string, touched: boolean): DisplayFormState {
	let result: DisplayFormState = { displayState: formDisplayState.DEFAULT, message: '' };
	if (!confirmPassword && !touched) return result;

	const isValid = !!confirmPassword && arePasswordsValid(confirmPassword, password);
	if (isValid) {
		result.displayState = formDisplayState.SUCCESS;
		return result;
	}

	result = {
		displayState: formDisplayState.ERROR,
		message: getInvalidConfirmPasswordMessage(password, confirmPassword)
	};

	return result;
}

export function getInvalidPasswordMessage(password: string): string {
	if (!password.length) return '@{empty_required_error|This is required}';
	else if (password.length < 8) return '@{form_register_first_step_password_short}';

	return '';
}

export function getInvalidConfirmPasswordMessage(password: string, confirmPassword: string): string {
	if (!confirmPassword.length) return '@{empty_required_error|This is required}';
	else if (password !== confirmPassword) return '@{register_sso_passwords_no_match}';
	return '';
}

export function isValidPassword(password: string): boolean {
	return passwordRegexp.test(password);
}

export function validateGender(gender: string, touched: any, isExpanded = false): DisplayFormState {
	let result: DisplayFormState = { displayState: formDisplayState.DEFAULT, message: '' };
	if (!gender && touched.gender) {
		result = {
			message: '@{empty_required_error}',
			displayState: formDisplayState.ERROR
		};
	} else if (gender) {
		result = {
			message: '',
			displayState: formDisplayState.SUCCESS
		};
	}
	return result;
}

export function validateRegisterDateOfBirth(dateOfBirth: string, touched: boolean, required = false): DisplayFormState {
	let displayState: form.DisplayState = formDisplayState.DEFAULT;
	let message = '';
	if (touched || dateOfBirth) {
		switch (validateDateOfBirth(dateOfBirth)) {
			case ValidationState.INVALID:
			case ValidationState.ABOVE_VALID_AGE:
				message = '@{dob_input_enter_valid}';
				displayState = formDisplayState.ERROR;
				break;
			case ValidationState.REQUIRED:
				if (required) {
					message = '@{dob_input_required}';
					displayState = formDisplayState.ERROR;
				}
				break;
			default:
				displayState = formDisplayState.SUCCESS;
				break;
		}
	}

	return { displayState, message };
}

export function validateEmail(
	email: string,
	touched: any,
	usernameExists: boolean,
	getExistingEmailErrorMessage
): DisplayFormState {
	let result: DisplayFormState = { displayState: formDisplayState.DEFAULT, message: '' };
	if (!email && !touched.email) return result;
	const isValid = email && isEmailSyntaxValid(email);
	result.displayState = isValid ? formDisplayState.SUCCESS : formDisplayState.ERROR;

	if (isValid && usernameExists) {
		result = {
			displayState: formDisplayState.ERROR,
			message: getExistingEmailErrorMessage
		};
	} else if (!isValid) {
		const message = !email.length
			? '@{empty_required_error|This is required}'
			: '@{form_register_first_step_email_blank|Please enter a valid email address}';
		result = {
			displayState: formDisplayState.ERROR,
			message
		};
	}

	return result;
}

export function isGenderValid(gender: Gender, touched: any): boolean {
	return !!gender && validateGender(gender, { ...touched, gender: true }).displayState === formDisplayState.SUCCESS;
}

export function isEmailSyntaxValid(email): boolean {
	return emailRegexp.test(email);
}

export function isDoBValid(dateOfBirth: string): boolean {
	return validateRegisterDateOfBirth(dateOfBirth, true, true).displayState === formDisplayState.SUCCESS;
}

export function arePasswordsValid(password: string, confirmPassword: string): boolean {
	return isValidPassword(password) && password === confirmPassword;
}

export function isNameValid(name: string): boolean {
	return onlyAlphaRegex.test(name);
}
