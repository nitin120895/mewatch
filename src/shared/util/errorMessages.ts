import {
	AUTHORIZATION_ACCOUNT_LOCKED,
	AUTHORIZATION_INVALID_ACCESS_TOKEN_TYPE,
	PROFILE_LOCKED_OUT,
	OTP_FAILED_TO_VERIFY,
	OTP_EXPIRED
} from './errorCodes';
import { get } from './objects';
/**
 * Returns custom error message by error code for PIN input dialog
 */
export function getPINErrorByCode(code: number): string {
	let message: string;
	switch (code) {
		case AUTHORIZATION_ACCOUNT_LOCKED:
			message = '@{form_signIn_locked_account_msg|This account is currently locked. Please try again later.}';
			break;
		case AUTHORIZATION_INVALID_ACCESS_TOKEN_TYPE:
			message = '@{app.dialogs.pinError|Invalid PIN, please try again}';
			break;
		case PROFILE_LOCKED_OUT:
			message = '@{profileSelector_locked_out_msg|This profile has been locked, please try again after 5 minutes.}';
			break;
		default:
			message = '@{app.dialogs.pinError|Invalid PIN, please try again}';
	}
	return message;
}

/**
 * Returns custom error message by error code for Password input dialog
 */
export function getPasswordErrorByCode(code: number): string {
	let message: string;
	switch (code) {
		case AUTHORIZATION_ACCOUNT_LOCKED:
			message = '@{form_signIn_locked_account_msg|This account is currently locked. Please try again later.}';
			break;
		case AUTHORIZATION_INVALID_ACCESS_TOKEN_TYPE:
			message = '@{app.dialogs.passwordError|Password is incorrect. Please try again.}';
			break;
		default:
			message = '@{app.dialogs.passwordError|Password is incorrect. Please try again.}';
	}
	return message;
}

const OTPErrorsMap = new Map([
	[OTP_EXPIRED, '@{one-time-password_expired}'],
	[OTP_FAILED_TO_VERIFY, '@{one-time-password_incorrect}']
]);

const OTPErrorsMapResetPin = new Map([
	[OTP_EXPIRED, '@{reset_pin_error_expired}'],
	[OTP_FAILED_TO_VERIFY, '@{reset_pin_error_invalid_otp}']
]);

const ERROR_NOT_ADULT_PROFILE = 'Cannot set a pin for not adult profile';
/**
 * Returns custom error message by error code for OTP input dialog
 */
export function getOTPErrorByCode(code: number, fromResetPin?: boolean): string {
	if (fromResetPin) {
		if (!OTPErrorsMapResetPin.has(code)) return '@{one-time-password_default}';
		return OTPErrorsMapResetPin.get(code);
	} else {
		if (!OTPErrorsMap.has(code)) return '@{one-time-password_default}';
		return OTPErrorsMap.get(code);
	}
}

export function getResetPINError(payload) {
	const message = get(payload, 'message');
	return message === ERROR_NOT_ADULT_PROFILE ? '@{reset_pin_overlay_restricted_age_label}' : message;
}
