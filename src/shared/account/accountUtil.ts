import * as Redux from 'redux';
import { hasCommonElement, getActiveSubscriptions } from 'toggle/responsive/pageEntry/account/accountUtils';
import { validateOnlyAlphanumericSpaceInputs } from 'toggle/responsive/pageEntry/account/ssoValidationUtil';
import { get } from 'shared/util/objects';
import { getAutoSigninUrl } from 'shared/service/authorization';
import { findToken } from 'shared/util/tokens';

let store: Redux.Store<state.Root>;
export function init(appStore: Redux.Store<state.Root>) {
	store = appStore;
}
export interface DisplayFormState {
	displayState: form.DisplayState;
	message: string | JSX.Element;
}

export function getActiveProfile(): api.ProfileDetail {
	const profile = store.getState().profile;
	return profile ? profile.info : undefined;
}

export function getAccount(): api.Account {
	const account = store.getState().account;
	return account.active ? account.info : undefined;
}

export function isEntitledItem(item: api.ItemSummary): boolean {
	const account = getAccount();
	if (!account) return false;

	const activeSubscriptionsCodes = getActiveSubscriptions(account.subscriptions).map(
		subscription => subscription.planId
	);

	if (!activeSubscriptionsCodes.length || !item.offers) return false;

	const offers = item.offers.map(offer => offer.subscriptionCode);

	return hasCommonElement(activeSubscriptionsCodes, offers);
}

export const AccountListState = {
	MARITAL: { key: 'maritalStatus', value: '@{account_marital_status}' },
	INCOME: { key: 'income', value: '@{account_income}' },
	OCCUPATION: { key: 'occupation', value: '@{account_occupation}' },
	ETHNICITY: { key: 'ethnicity', value: '@{account_ethnicity}' },
	NATIONALITY: { key: 'nationality', value: '@{account_nationality}' },
	COUNTRY: { key: 'country', value: '@{account_country}' }
};

export function getAccountLists(object: any) {
	const accountList = [];
	for (let [key, value] of Object.entries(object)) {
		accountList.push({ code: `${key}`, value: `${value}` });
	}
	return accountList;
}

export function validateDeviceName(code: string, touched: any): DisplayFormState {
	return validateOnlyAlphanumericSpaceInputs(
		code,
		touched.deviceName,
		'@{codePage_device_name_form_validation_empty}',
		'@{codePage_device_name_form_validation_error}'
	);
}

export function isSignedIn(account: state.Account): boolean {
	return account.active;
}

export function normalizeError(error: any): { error: string } {
	if (error.message) {
		return { error: 'form_register_first_step_validation_error: in form error.message' };
	} else if (error.payload && error.payload.message) {
		return { error: 'form_register_first_step_validation_error: in form error.payload.message' };
	} else if (error.error) {
		return { error: 'form_register_first_step_validation_error' };
	} else {
		return error;
	}
}

export const enum AccountEditSelectors {
	Occupation = 'Occupation',
	Ethnicity = 'Ethnicity',
	Nationality = 'Nationality',
	Income = 'Income',
	MaritalStatus = 'MaritalStatus',
	Country = 'Country'
}

export function getUserEmail(): string {
	return get(getAccount(), 'email');
}

export function getUserId(): string {
	return get(getAccount(), 'id');
}

export function redirectToMeConnectSettings() {
	let windowReference = window.open();
	getAutoSigninUrl().then(res => {
		if (res.data && res.data.url) {
			windowReference.location.href = res.data.url;
		}
	});
}

export function isValidOTP() {
	const { tokens } = store.getState().session;
	const accountToken = findToken(tokens, 'UserAccount', 'Settings');

	// MEDTOG-18770 Newly signed up user already has Settings scope token, but they should be OTP challenged
	return accountToken && !accountToken.accountCreated;
}
