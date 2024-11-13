import * as PageKey from 'shared/page/pageKey';
import { get } from 'shared/util/objects';
import { MEPASS_SIGNOUT_ALERT_MODAL } from './authUtil';
export const EMAIL_VERIFICATION_CONFIRM_MODAL_ID = 'email-verification-modal';
export const MISSING_VALIDATION_MODAL_ID = 'missing-validation-modal';
export const CONTINUE_WATCHING_MENU_MODAL_ID = 'continue-watching-menu-modal-id';

const NOTIFICATION_TIMEOUT = 8000;

export const keepOpenPermanentModals = modals => {
	const filteredModals: state.UILayerState['modals'] = {};
	filteredModals.player = [];
	filteredModals.linearPlayer = [];
	filteredModals.app = modals.app.filter(
		modal => modal.id === EMAIL_VERIFICATION_CONFIRM_MODAL_ID || modal.id === MISSING_VALIDATION_MODAL_ID
	);

	return filteredModals;
};

export function getNotificationTimeout() {
	const timeout = process.env.CLIENT_TOAST_NOTIFICATION_TIMEOUT;
	if (!timeout || isNaN(timeout)) return NOTIFICATION_TIMEOUT;
	return parseInt(timeout);
}

export function shouldShowNotification(key: string): boolean {
	let show: boolean;
	switch (key) {
		case PageKey.Register:
		case PageKey.AccountDeviceAuthorization:
		case PageKey.AccountProfilePersonalisation:
		case PageKey.ColdStart:
		case PageKey.Watch:
			show = false;
			break;
		default:
			show = true;
	}

	return show;
}

const TOAST_NOTIFICATION_TOGGLE_CSS = 'hide-toast-notifications';

// Can be used to 'fine tune' if toast notifications should or shouldn't
// be shown for a particular component or state. NOTE: should be used in
// conjunction with showToastNotifications(), especially when component is
// unmounting, to 'reset' back to original configuration.

export function hideToastNotifications() {
	document && document.body && document.body.classList.add(TOAST_NOTIFICATION_TOGGLE_CSS);
}

export function showToastNotifications() {
	document && document.body && document.body.classList.remove(TOAST_NOTIFICATION_TOGGLE_CSS);
}

export function sessionExpiredModalIsInProgress(uiModals: any) {
	const appModal = get(uiModals, 'app');
	return appModal && appModal.length && appModal.some(modal => modal.id === MEPASS_SIGNOUT_ALERT_MODAL);
}
