import { compareDate } from 'shared/util/dates';
import { DefaultRatedAge } from 'toggle/responsive/pageEntry/account/a1/pin/CreatePinParentalControl';
import { AgeGroup } from 'toggle/responsive/pageEntry/account/a1/pin/AccountManagePinComponent';

export const VALID_AGE = 21;
export const MAX_AGE = 85;

export const birthDateRegex: RegExp = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i;

export function formatDateInputToISO(dateOfBirth: string): string {
	return (
		dateOfBirth &&
		dateOfBirth
			.split('/')
			.reverse()
			.join('-')
	);
}

export function formatISODateInput(dateOfBirth: string): string {
	return (
		dateOfBirth &&
		dateOfBirth
			.split('-')
			.reverse()
			.join('/')
	);
}

export function validateAge(dateOfBirth: string | Date, age?: number): boolean {
	const validAge = age || VALID_AGE;
	dateOfBirth = getDateFormat(dateOfBirth);
	const validDate = new Date();
	validDate.setFullYear(validDate.getFullYear() - validAge);
	return compareDate(dateOfBirth, validDate) >= 0;
}
/* A: age >= 21
 * 	B: age from 18 to 20
 * 	C: age from 16 to 17
 * 	D: age < 16
 * 	E: not specified
 */
export function validateAgeGroup(ageGroup: string | Date, age?: number): boolean {
	const validAge = age || VALID_AGE;
	switch (validAge) {
		case DefaultRatedAge.R21:
			if (ageGroup === AgeGroup.A) return true;
			break;
		case DefaultRatedAge.M18:
			if (ageGroup === AgeGroup.A || ageGroup === AgeGroup.B) return true;
			break;
		case DefaultRatedAge.NC16:
			if (ageGroup === AgeGroup.A || ageGroup === AgeGroup.B || ageGroup === AgeGroup.C) return true;
			break;
		default:
			return false;
	}
}

export function validateMaxAge(dateOfBirth: string | Date): boolean {
	dateOfBirth = getDateFormat(dateOfBirth);
	const validDate = new Date();
	validDate.setFullYear(validDate.getFullYear() - MAX_AGE);
	return compareDate(validDate, dateOfBirth) >= 0;
}

function getDateFormat(dateOfBirth: string | Date): Date {
	dateOfBirth = dateOfBirth instanceof Date ? dateOfBirth : new Date(formatDateInputToISO(dateOfBirth));
	return dateOfBirth;
}

export enum ValidationState {
	VALID = 'VALID',
	REQUIRED = 'REQUIRED',
	INVALID = 'INVALID',
	BELOW_VALID_AGE = 'BELOW_VALID_AGE',
	ABOVE_VALID_AGE = 'ABOVE_VALID_AGE'
}

export function validateDateOfBirth(dateOfBirth: string, age?: number): ValidationState {
	if (!dateOfBirth) return ValidationState.REQUIRED;

	if (birthDateRegex.test(dateOfBirth)) {
		const date = new Date(formatDateInputToISO(dateOfBirth));

		if (compareDate(new Date(), getDateFormat(dateOfBirth)) > 0 || isNaN(Number(date))) {
			return ValidationState.INVALID;
		}

		if (!validateMaxAge(dateOfBirth)) return ValidationState.ABOVE_VALID_AGE;

		return validateAge(dateOfBirth, age) ? ValidationState.VALID : ValidationState.BELOW_VALID_AGE;
	}

	return ValidationState.INVALID;
}

export function getAgeGroupMinAge(ageGroup: string) {
	switch (ageGroup) {
		case AgeGroup.A:
			return DefaultRatedAge.R21;
		case AgeGroup.B:
			return DefaultRatedAge.M18;
		case AgeGroup.C:
			return DefaultRatedAge.NC16;
		default:
			return 15;
	}
}
