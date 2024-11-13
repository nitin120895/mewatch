import * as React from 'react';
import * as Redux from 'redux';
import ModalTypes from 'shared/uiLayer/modalTypes';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { get } from 'shared/util/objects';
import { noop } from 'shared/util/function';
import { isMasterCard, isTelcoPayment, isVisaCard, PaymentMethods } from 'toggle/responsive/util/paymentUtil';
import { PaymentConfirmationOverlayProps } from '../app/subscription/PaymentConfirmationOverlay';
import { ConfirmationDialogProps } from 'ref/responsive/component/dialog/ConfirmationDialog';
import MasterCardIcon from '../component/icons/MasterCardIcon';
import VisaIcon from '../component/icons/VisaIcon';

export const CANCEL_SUBSCRIPTION_MODAL_ID = 'cancel-subscription';
export const CONFIRM_CANCEL_SUBSCRIPTION_MODAL_ID = 'confirm-cancel-subscription';

export const EXPIRED = 'expired';

let store: Redux.Store<state.Root>;
export function init(appStore: Redux.Store<state.Root>) {
	store = appStore;
}

export const regularCancelSubscriptionModal = (
	cancelSubscription: () => void,
	activeSubscription: api.SubscriptionDetail
) => {
	const { name: packageName, endDate } = activeSubscription;

	const options = { month: 'numeric', day: 'numeric', year: 'numeric' };
	const date = new Date(endDate);
	const formattedDate = new Intl.DateTimeFormat('en', options);
	const [{ value: month }, , { value: day }, , { value: year }] = formattedDate.formatToParts(date);
	const endDateFormatted = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;

	return {
		id: CANCEL_SUBSCRIPTION_MODAL_ID,
		type: ModalTypes.CONFIRMATION_DIALOG,
		componentProps: {
			title: '@{subscription_modal_cancel_title|Cancel Subscription}',
			children: (
				<IntlFormatter values={{ packageName, endDate: endDateFormatted }}>
					{'@{subscription_modal_cancel_message}'}
				</IntlFormatter>
			),
			confirmLabel: '@{app.confirm|Confirm}',
			onConfirm: cancelSubscription
		}
	};
};

export const conflictingCancelSubscriptionModal = (
	cancelSubscription: () => void,
	{ name: packageName }: api.SubscriptionDetail
) => {
	return {
		id: CONFIRM_CANCEL_SUBSCRIPTION_MODAL_ID,
		type: ModalTypes.CONFIRMATION_DIALOG,
		componentProps: {
			title: '@{subscription_modal_confirm_cancel_title|Confirm Subscription Cancellation}',
			children: (
				<div>
					<IntlFormatter values={{ packageName }}>{'@{subscription_modal_confirm_cancel_message}'}</IntlFormatter>
					<br />
					<br />
					<IntlFormatter>{'@{subscription_modal_confirm_cancel_no_refund}'}</IntlFormatter>
				</div>
			),
			confirmLabel: '@{app.confirm|Confirm}',
			onConfirm: cancelSubscription
		}
	};
};

export const SUCCESSFUL_CANCEL_SUBSCRIPTION_MODAL_ID = 'cancel-subscription';

export const successfulCancelSubscriptionFromConflictModal = (
	cancelledSubscriptionName: string,
	subscriptionName: string
) => {
	return {
		id: SUCCESSFUL_CANCEL_SUBSCRIPTION_MODAL_ID,
		type: ModalTypes.CONFIRMATION_DIALOG,
		componentProps: {
			title: '@{subscription_modal_successful_cancel_title}',
			children: (
				<div>
					<IntlFormatter values={{ cancelledSubscriptionName }}>
						{'@{subscription_modal_successful_cancel_conflict_message}'}
					</IntlFormatter>
					<br />
					<br />
					<IntlFormatter values={{ subscriptionName }}>
						{'@{subscription_modal_successful_cancel_message2}'}{' '}
					</IntlFormatter>
				</div>
			),
			confirmLabel: '@{app.continue|Continue}',
			hideCloseIcon: false,
			onConfirm: noop
		}
	};
};

export const successfulCancelSubscriptionModal = () => {
	return {
		id: SUCCESSFUL_CANCEL_SUBSCRIPTION_MODAL_ID,
		type: ModalTypes.CONFIRMATION_DIALOG,
		componentProps: {
			title: '@{subscription_modal_successful_cancel_title}',
			children: <IntlFormatter>{'@{subscription_modal_successful_cancel_message}'} </IntlFormatter>,
			confirmLabel: '@{subscription_modal_cancel_ok|Ok}',
			onConfirm: noop
		}
	};
};

export const UNSUCCESSFUL_CANCEL_SUBSCRIPTION_MODAL_ID = 'cancel-subscription';

export const unsuccessfulCancelSubscriptionModal = () => {
	return {
		id: UNSUCCESSFUL_CANCEL_SUBSCRIPTION_MODAL_ID,
		type: ModalTypes.CONFIRMATION_DIALOG,
		componentProps: {
			title: '@{subscription_modal_unsuccessful_cancel_title}',
			children: (
				<div>
					<IntlFormatter>{'@{subscription_modal_unsuccessful_cancel_message}'} </IntlFormatter>
					<br />
					<br />
					<IntlFormatter>{'@{toggle_customer_care_message}'} </IntlFormatter>
				</div>
			),
			confirmLabel: '@{app.ok|OK}',
			onConfirm: noop
		}
	};
};

export const REMEMBER_CARD_MODAL_ID = 'remember-card';

export const showRememberCardModal = (rememberCardDetails: () => void, discardSavingCardDetails: () => void) => {
	return {
		id: REMEMBER_CARD_MODAL_ID,
		type: ModalTypes.CONFIRMATION_DIALOG,
		componentProps: {
			title: '@{payment_rememberCard_modal_title}',
			children: <IntlFormatter elementType="div">{'@{payment_rememberCard_modal_body}'}</IntlFormatter>,
			confirmLabel: '@{payment_rememberCard_modal_confirm_label}',
			onConfirm: rememberCardDetails,
			cancelLabel: '@{payment_rememberCard_modal_cancel_label}',
			className: REMEMBER_CARD_MODAL_ID,
			closeOnConfirm: true,
			onCancel: discardSavingCardDetails
		}
	};
};

export const getPaymentOverlayData = (
	packageName: string,
	paymentType: string,
	isSuccessfulPayment: boolean,
	failedPaymentConfirmation: () => void,
	successfullPaymentConfirm: () => void,
	isFullDiscountSubscription: boolean
): PaymentConfirmationOverlayProps => {
	const unsuccessfulMessage = isFullDiscountSubscription
		? '@{payment_unsuccessful_full_discount_body_content}'
		: '@{payment_unsuccessful_body_content}';
	return {
		title: isSuccessfulPayment ? '@{payment_successful_label}' : '@{payment_unsuccessful_label}',
		body: isSuccessfulPayment ? (
			<div>
				<IntlFormatter values={{ packageName }} elementType="div">
					{'@{payment_successful_body_content}'}
				</IntlFormatter>
				{!isTelcoPayment(paymentType as PaymentMethods) && (
					<IntlFormatter elementType="div" className="second-line">
						{'@{payment_successful_body_content2}'}
					</IntlFormatter>
				)}
				<IntlFormatter elementType="div" className="margin-top">
					{'@{payment_successful_body_content3}'}
				</IntlFormatter>
			</div>
		) : (
			<IntlFormatter elementType="div">{unsuccessfulMessage}</IntlFormatter>
		),
		confirmLabel: '@{account_common_ok_label}',
		onConfirm: isSuccessfulPayment ? successfullPaymentConfirm : failedPaymentConfirmation,
		className: 'content-position'
	};
};

export interface SubscriptionsModalProps {
	onConfirm: () => void;
	onClose?: () => void;
	target: 'app' | 'player' | 'linearPlayer';
	isSignedInUser: boolean;
}

export const SUBSCRIPTION_REQUIRED_MODAL_ID = 'subscription-required-modal';
export function subscriptionRequiredModal(entry: SubscriptionsModalProps) {
	const { target, isSignedInUser, onConfirm, onClose } = entry;

	const componentProps: ConfirmationDialogProps = {
		title: isSignedInUser ? '@{subscriptions_required_modal_title}' : '@{channel_details_subscribe_modal_title}',
		children: isSignedInUser && (
			<IntlFormatter elementType="div">{'@{subscriptions_required_modal_content}'}</IntlFormatter>
		),
		onConfirm: onConfirm,
		confirmLabel: isSignedInUser
			? '@{subscriptions_subscribe_section_subscribe|Subscribe}'
			: '@{nav_signIn_label|Sign in}',
		className: SUBSCRIPTION_REQUIRED_MODAL_ID,
		closeOnConfirm: false
	};

	if (onClose) componentProps.onClose = onClose;

	return {
		id: SUBSCRIPTION_REQUIRED_MODAL_ID,
		type: ModalTypes.CONFIRMATION_DIALOG,
		target,
		componentProps
	};
}

export function cessationSubscriptionRequiredModal(entry: SubscriptionsModalProps, provider: string) {
	const { target, isSignedInUser, onConfirm, onClose } = entry;
	const state = store.getState();
	const config = get(state, 'app.config');
	const providerGroupName = getProviderGroupName(config, provider);

	const { cessationTitle } = !isSignedInUser
		? getCessationPopUpAnonymousMessage(config, providerGroupName)
		: getCessationPopUpSignInMessage(config, providerGroupName);
	const { cessationMessage } = !isSignedInUser
		? getCessationPopUpAnonymousMessage(config, providerGroupName)
		: getCessationPopUpSignInMessage(config, providerGroupName);

	const componentProps: ConfirmationDialogProps = {
		title: cessationTitle,
		children: cessationMessage,
		onConfirm: onConfirm,
		confirmLabel: !isSignedInUser ? '@{cessation_upsell_cancel}' : '@{cessation_upsell_ok}',
		className: UPSELL_CESSATION_MODAL,
		closeOnConfirm: false
	};

	if (onClose) componentProps.onClose = onClose;

	return {
		id: UPSELL_CESSATION_MODAL,
		type: ModalTypes.CONFIRMATION_DIALOG,
		target,
		componentProps
	};
}

export const CREDIT_CARD_MODAL_ID = 'credit-card-modal';
export function newCreditCardModal(onConfirm: () => void) {
	const componentProps: ConfirmationDialogProps = {
		title: '@{payment_new_card_label}',
		confirmLabel: '@{payment_change_button_label}',
		children: '@{payment_new_card_body}',
		onConfirm: onConfirm,
		id: CREDIT_CARD_MODAL_ID,
		className: 'new-credit-card',
		closeOnConfirm: true
	};

	return {
		id: CREDIT_CARD_MODAL_ID,
		componentProps
	};
}

export function changeCardModal(onConfirm: () => void, onClose?: () => void) {
	const componentProps: ConfirmationDialogProps = {
		title: '@{payment_change_card_label}',
		confirmLabel: '@{payment_change_button_label}',
		children: '@{payment_change_card_text}',
		onConfirm,
		id: CREDIT_CARD_MODAL_ID,
		className: 'change-credit-card',
		closeOnConfirm: true
	};

	return {
		id: CREDIT_CARD_MODAL_ID,
		componentProps,
		onClose
	};
}
export const UNSUCCESSFUL_CARD_REMOVAL_ID = 'unsuccessful-card-removal';
export function removeCardErrorModal(onConfirm: () => void) {
	const componentProps: ConfirmationDialogProps = {
		title: '@{card_removal_title}',
		children: <IntlFormatter elementType="div">{'@{card_removal_body}'}</IntlFormatter>,
		confirmLabel: '@{account_common_ok_label}',
		onConfirm: onConfirm
	};
	return {
		id: UNSUCCESSFUL_CARD_REMOVAL_ID,
		componentProps
	};
}

export const UNSUCCESSFUL_MODAL_ID = 'unsuccessful-modal';
export function changeCardErrorModal(onConfirm: () => void) {
	const componentProps: ConfirmationDialogProps = {
		title: '@{payment_unsuccessful_label}',
		children: <IntlFormatter elementType="div">{'@{payment_unsuccessful_body_content}'}</IntlFormatter>,
		confirmLabel: '@{account_common_ok_label}',
		onConfirm: onConfirm
	};
	return {
		id: UNSUCCESSFUL_MODAL_ID,
		componentProps
	};
}

export const REMOVE_CARD_MODAL_ID = 'remove-card';
export function removeCardModal(onConfirm: () => void) {
	const componentProps: ConfirmationDialogProps = {
		title: '@{account_a2_remove_card_title}',
		children: (
			<div>
				<IntlFormatter elementType="div">{'@{account_a2_remove_card_description1}'}</IntlFormatter>
				<br />
				<IntlFormatter elementType="div">{'@{account_a2_remove_card_description2}'}</IntlFormatter>
			</div>
		),
		confirmLabel: '@{account_confirm_label|Confirm}',
		onConfirm: onConfirm,
		onCancel: undefined,
		cancelLabel: undefined,
		closeOnConfirm: true,
		id: REMOVE_CARD_MODAL_ID
	};

	return {
		id: REMOVE_CARD_MODAL_ID,
		componentProps
	};
}

export function successfulCardRemoval(): PaymentConfirmationOverlayProps {
	return {
		title: '@{account_a2_remove_card_successful_title}',
		body: (
			<div>
				<IntlFormatter elementType="div">{'@{account_a2_remove_card_successful_description}'}</IntlFormatter>
			</div>
		),
		confirmLabel: '@{account_common_ok_label}',
		onConfirm: noop,
		className: 'content-position'
	};
}

export const REMOVE_CARD_ERROR_MODAL_ID = 'remove-card-error';
export function failedCardRemoval() {
	const componentProps: ConfirmationDialogProps = {
		title: '@{account_a2_remove_card_unsuccessful_title|Unsuccessful Card Removal}',
		children: '@{account_a2_remove_card_unsuccessful_description}',
		confirmLabel: '@{account_common_ok_label|OK}',
		onConfirm: noop
	};

	return {
		id: REMOVE_CARD_ERROR_MODAL_ID,
		componentProps
	};
}

export const CARD_CHANGE_SUCCESSFUL_MODAL = 'card-change-successful';
export function successfulCardChange(onConfirm: () => void, disableAutoClose = false) {
	const componentProps: ConfirmationDialogProps = {
		title: '@{card_change_successful_title}',
		children: '@{card_change_successful_body}',
		confirmLabel: '@{subscription_modal_cancel_ok}',
		onConfirm,
		hideCloseIcon: disableAutoClose,
		cancelLabel: undefined
	};

	return {
		id: CARD_CHANGE_SUCCESSFUL_MODAL,
		type: ModalTypes.CONFIRMATION_DIALOG,
		componentProps,
		disableAutoClose
	};
}

export const CARD_CHANGE_UNSUCCESSFUL_MODAL = 'card-change-successful';
export function unsuccessfulCardChange(onConfirm: () => void) {
	const componentProps: ConfirmationDialogProps = {
		title: '@{card_change_unsuccessful_title}',
		children: '@{card_change_unsuccessful_body}',
		confirmLabel: '@{account_common_ok_label}',
		onConfirm: onConfirm,
		cancelLabel: undefined
	};

	return {
		id: CARD_CHANGE_UNSUCCESSFUL_MODAL,
		type: ModalTypes.CONFIRMATION_DIALOG,
		componentProps
	};
}

export const UPSELL_MODAL = 'upsell-modal';
export const UPSELL_CESSATION_MODAL = 'upsell-cessation-modal';
export interface UpsellModalProps {
	onSubscribe?: () => void;
	onSignIn?: () => void;
	modalTarget?: ModalConfig['target'];
	isNextEpisodePaid?: boolean;
	onClose?: () => void;
	closeOnCancel?: boolean;
	disableAutoClose?: boolean;
	LoggedUser?: boolean;
}

export function upsellModal(entry: UpsellModalProps) {
	const { onSubscribe, onSignIn, modalTarget, isNextEpisodePaid, onClose, closeOnCancel, disableAutoClose } = entry;

	const componentProps: ConfirmationDialogProps = {
		title: '@{upsell_modal_title}',
		children: isNextEpisodePaid ? '@{upsell_modal_description_next_episode_paid}' : '@{upsell_modal_description}',
		confirmLabel: '@{itemDetail_labels_subscribe}',
		cancelLabel: '@{nav_signIn_label}',
		onConfirm: onSubscribe,
		onCancel: onSignIn,
		className: UPSELL_MODAL
	};

	if (onClose) componentProps.onClose = onClose;
	if (typeof closeOnCancel !== 'undefined') {
		componentProps.closeOnCancel = closeOnCancel;
		componentProps.closeOnConfirm = closeOnCancel;
	}

	let target = modalTarget || 'app';

	return {
		id: UPSELL_MODAL,
		type: ModalTypes.CONFIRMATION_DIALOG,
		componentProps,
		target,
		disableAutoClose
	};
}

// Helper function to replace placeholder if it exists in the string
export const replacePlaceholder = (text, placeholder, replacement) => {
	return text && text.includes(placeholder) ? text.replace(new RegExp(`\\${placeholder}`, 'g'), replacement) : text;
};

export function upsellCessationModal(entry: UpsellModalProps, provider: string) {
	const { onSignIn, onSubscribe, modalTarget, onClose, closeOnCancel, disableAutoClose } = entry;
	const state = store.getState();
	const config = get(state, 'app.config');
	const providerGroupName = getProviderGroupName(config, provider);

	const { cessationTitle } = onSignIn
		? getCessationPopUpAnonymousMessage(config, providerGroupName)
		: getCessationPopUpSignInMessage(config, providerGroupName);
	const { cessationMessage } = onSignIn
		? getCessationPopUpAnonymousMessage(config, providerGroupName)
		: getCessationPopUpSignInMessage(config, providerGroupName);

	const componentProps: ConfirmationDialogProps = {
		title: cessationTitle,
		children: cessationMessage,
		confirmLabel: onSignIn ? '@{cessation_upsell_cancel}' : '@{cessation_upsell_ok}',
		cancelLabel: '@{nav_signIn_label}',
		onConfirm: onSubscribe,
		onCancel: onSignIn,
		className: UPSELL_CESSATION_MODAL
	};

	if (onClose) componentProps.onClose = onClose;
	if (typeof closeOnCancel !== 'undefined') {
		componentProps.closeOnCancel = closeOnCancel;
		componentProps.closeOnConfirm = closeOnCancel;
	}

	let target = modalTarget || 'app';

	return {
		id: UPSELL_CESSATION_MODAL,
		type: ModalTypes.CONFIRMATION_DIALOG,
		componentProps,
		target,
		disableAutoClose
	};
}

export function renderIcon(brand: string) {
	if (isMasterCard(brand)) return <MasterCardIcon />;
	if (isVisaCard(brand)) return <VisaIcon />;

	return;
}

export function getProviderGroupName(config: api.AppConfig, provider: string) {
	const cessationProviders = get(config, 'general.customFields.CessationProviders');
	return provider && cessationProviders && cessationProviders.hasOwnProperty(provider)
		? cessationProviders[provider]
		: undefined;
}

export function getCessationScheduleMessage(config: api.AppConfig, providerGroupName) {
	const { cpName = '', date: cessationDate = '' } =
		get(config, `general.customFields.CessationProviderDetails.${providerGroupName}`) || {};
	const cessationFallbackMessage =
		'$CPNAME subscription is no longer offered on mewatch. This programme is accessible to existing subscribers until their subscription ends on or before $CESSATIONDATE.';
	let message =
		(providerGroupName &&
			get(config, `general.customFields.CessationScheduleMessage.${providerGroupName}.cessationMessage`)) ||
		cessationFallbackMessage;

	// Replace "$CPNAME" and "$CESSATIONDATE" if it exists
	message = replacePlaceholder(message, '$CPNAME', cpName);
	message = replacePlaceholder(message, '$CESSATIONDATE', cessationDate);
	return message;
}

export function getCessationPopUpAnonymousMessage(config: api.AppConfig, providerGroupName) {
	const { cpName = '', date: cessationDate = '' } =
		get(config, `general.customFields.CessationProviderDetails.${providerGroupName}`) || {};
	const cessationFallbackTitle = '$CPNAME subscription is no longer available on mewatch.';
	const cessationFallbackMessage =
		'This programme is accessible to existing subscribers until their subscription ends on or before $CESSATIONDATE. If you are already subscribed, please sign in to watch.';

	let { cessationTitle = `${cessationFallbackTitle}`, cessationMessage = `${cessationFallbackMessage}` } =
		get(config, `general.customFields.CessationPopUpAnonymousMessage.${providerGroupName}`) || {};

	// Replace "$CPNAME" if it exists
	cessationTitle = replacePlaceholder(cessationTitle, '$CPNAME', cpName);
	cessationMessage = replacePlaceholder(cessationMessage, '$CPNAME', cpName);
	// Replace "$CESSATIONDATE" if it exists
	cessationMessage = replacePlaceholder(cessationMessage, '$CESSATIONDATE', cessationDate);
	return { cessationTitle, cessationMessage };
}

export function getCessationPopUpSignInMessage(config: api.AppConfig, providerGroupName) {
	const { cpName = '', date: cessationDate = '' } =
		get(config, `general.customFields.CessationProviderDetails.${providerGroupName}`) || {};
	const cessationFallbackTitle = '$CPNAME Subscription is no longer offered on mewatch.';
	const cessationFallbackMessage =
		'Our Partnership with $CPNAME ends on $CESSATIONDATE. Existing Subscribers can access content until their subscription ends.';

	let { cessationTitle = `${cessationFallbackTitle}`, cessationMessage = `${cessationFallbackMessage}` } =
		get(config, `general.customFields.CessationPopUpSignInMessage.${providerGroupName}`) || {};

	// Replace "$CPNAME" and "$CESSATIONDATE" if it exists
	cessationTitle = replacePlaceholder(cessationTitle, '$CPNAME', cpName);
	cessationMessage = replacePlaceholder(cessationMessage, '$CPNAME', cpName);
	// Replace "$CESSATIONDATE" if it exists
	cessationMessage = replacePlaceholder(cessationMessage, '$CESSATIONDATE', cessationDate);
	return { cessationTitle, cessationMessage };
}

// get the cessation packageId from config
export const getPackageIds = obj => {
	return Object.values(obj)
		.map(provider => provider['packageId'])
		.flat();
};
