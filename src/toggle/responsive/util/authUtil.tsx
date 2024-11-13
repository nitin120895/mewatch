import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { ResetPassword } from 'shared/page/pageKey';
import Link from 'shared/component/Link';
import { Bem } from 'shared/util/styles';
import { setItem, getItem } from 'shared/util/localStorage';
import { getDeviceId } from 'shared/util/deviceUtil';

const LOGIN_SOURCE = 'loginsource';

export enum Providers {
	FACEBOOK = 'Facebook',
	APPLE = 'Apple',
	GOOGLE = 'Google',
	MEDIACORP = 'Mediacorp',
	NA = 'NA'
}

export const getLoginSource = () => {
	return getItem(LOGIN_SOURCE);
};

export const setLoginSource = (provider: Providers) => {
	setItem(LOGIN_SOURCE, provider);
};

export const INVALID_CREDENTIAL_MODAL = 'invalid-credential-modal';
export const MEPASS_ALERT_MODAL = 'mepass-alert-modal';
export const MEPASS_SIGNOUT_ALERT_MODAL = 'mepass-signout-alert-modal';
export const SUPPORT_MODAL_ID = 'support-modal';
export const SESSION_TIMEOUT_MODAL = 'session-timeout-modal';

export const MAX_ATTEMPTS = 4;

const bem = new Bem(INVALID_CREDENTIAL_MODAL);

export const invalidCredentialModal = () => {
	return {
		title: '@{me_connect_modal_header|meconnect Account}',
		children: (
			<div className={bem.e('info')}>
				<IntlFormatter elementType="div" className={bem.e('invalid-data')}>
					{'@{me_connect_invalid_data}'}
				</IntlFormatter>
				<IntlFormatter>{'@{me_connect_modal_description1}'}</IntlFormatter>
				<IntlFormatter elementType={Link} className={bem.e('forgot-link')} componentProps={{ to: `@${ResetPassword}` }}>
					{'@{me_connect_modal_description2}'}
				</IntlFormatter>
				<IntlFormatter>{'@{me_connect_modal_description3}'}</IntlFormatter>
			</div>
		),
		confirmLabel: '@{form_confirm_ok|Ok}',
		id: INVALID_CREDENTIAL_MODAL,
		hideCloseIcon: true,
		className: bem.b()
	};
};

const bemAlertModal = new Bem(MEPASS_ALERT_MODAL);

export const alertModal = (message: string, title: string) => {
	return {
		title,
		children: (
			<div className={bemAlertModal.e('info')}>
				<IntlFormatter elementType="div">{message}</IntlFormatter>
			</div>
		),
		confirmLabel: '@{form_confirm_ok|Ok}',
		id: MEPASS_ALERT_MODAL,
		hideCloseIcon: true,
		className: bemAlertModal.b()
	};
};

export const SSO_ACCOUNT_DISABLED_MSG = 'Your meconnect Account has been disabled.';
export const SSO_ACCOUNT_DELETED_MSG = 'Account Deleted';

const DEFAULT_SINGLE_SIGNON_OPTIONS: api.SingleSignOnRequest = {
	token: undefined,
	provider: 'Mediacorp',
	linkAccounts: true,
	scopes: ['Catalog', 'Commerce'],
	deviceId: undefined
};

export const getSingleSignOnOptions = () => ({
	...DEFAULT_SINGLE_SIGNON_OPTIONS,
	deviceId: getDeviceId()
});
