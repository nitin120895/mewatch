import ModalTypes from 'shared/uiLayer/modalTypes';
import { ErrorCta } from './Player';
import * as React from 'react';
import { RestrictedContentModal } from 'toggle/responsive/component/modal/RestrictedContentModal';
import CreatePinOverlay from '../pageEntry/account/a1/pin/CreatePinOverlay';
import { RESTRICTED_PROFILE_PIN, getRestrictedProfileModalData } from '../util/profileUtil';
import ShareVideoModal from '../component/modal/ShareVideoModal';
import { ConfirmationDialogProps } from 'ref/responsive/component/dialog/ConfirmationDialog';

export const RESTRICTED_CONTENT_MODAL_ID = 'restricted-content';
export const REQUIRE_MODAL_ID = 'required-modal';

export function getRestrictedModalForAnonymous(onSignIn, onSignUp, onClose?): ModalConfig {
	const props = {
		description: '@{restricted_content_for_anonymous}',
		signedOut: true,
		onSignIn,
		onSignUp
	};

	return {
		id: RESTRICTED_CONTENT_MODAL_ID,
		type: ModalTypes.CONFIRMATION_DIALOG,
		onClose,
		componentProps: {
			children: <RestrictedContentModal {...props} />,
			className: 'restricted-content-modal-anonymous-underage'
		}
	};
}

export function getRequiredModalForAnonymous(onSignIn, onClose, disableAutoClose = false): ModalConfig {
	const props = {
		title:
			'@{require_modal_header|Sign in to enjoy this feature for free. If you do not have an account, create one now.}',
		confirmLabel: '@{form_signIn_signInButton_label|Sing In}',
		onConfirm: onSignIn,
		onCancel: onClose,
		className: REQUIRE_MODAL_ID,
		closeOnConfirm: false,
		disableAutoClose
	};

	return {
		id: REQUIRE_MODAL_ID,
		type: ModalTypes.CONFIRMATION_DIALOG,
		onClose,
		componentProps: props
	};
}

export function getSignInRequiredModalForAnonymous(onSignIn, onSignup, onClose?): ModalConfig {
	const props = {
		title:
			'@{restricted_content_for_anonymous|Sign in to watch for free. If you do not have an account, please create one.}',
		confirmLabel: '@{form_signIn_signInButton_label|Sing In}',
		cancelLabel: '@{form_register_createAccount_label|Create Account}',
		onConfirm: onSignIn,
		onCancel: onSignup,
		className: REQUIRE_MODAL_ID,
		closeOnConfirm: false,
		closeOnCancel: false
	};

	return {
		id: REQUIRE_MODAL_ID,
		type: ModalTypes.CONFIRMATION_DIALOG,
		onClose,
		componentProps: props
	};
}

export function getSignInRequiredModalAnonymousForCampaigns(onSignIn, onSignup, onClose?): ModalConfig {
	const props = {
		title: '@{restricted_content_for_anonymous_campaigns|Sign in is required.}',
		confirmLabel: '@{form_signIn_signInButton_label|Sign In}',
		cancelLabel: '@{form_register_createAccount_label|Create Account}',
		onConfirm: onSignIn,
		onCancel: onSignup,
		className: REQUIRE_MODAL_ID,
		closeOnConfirm: false,
		closeOnCancel: false,
		children:
			'@{sign_in_modal_campaigns_description|Sign in for free to participate. If you do not have an account, please create one.}'
	};

	return {
		id: REQUIRE_MODAL_ID,
		type: ModalTypes.CONFIRMATION_DIALOG,
		onClose,
		componentProps: props
	};
}

export function getSignInRequiredModalForFavouriteTeamAnonymous(onSignIn, onSignup, onClose?): ModalConfig {
	const props = {
		title:
			'@{account_add_favourite_team_anonymous_login_model|Sign in to {follow your favourite teams}. If you do not have an account, please create one.}',

		confirmLabel: '@{form_signIn_signInButton_label|Sing In}',
		cancelLabel: '@{form_register_createAccount_label|Create Account}',
		onConfirm: onSignIn,
		onCancel: onSignup,
		className: REQUIRE_MODAL_ID,
		closeOnConfirm: false,
		closeOnCancel: false
	};

	return {
		id: REQUIRE_MODAL_ID,
		type: ModalTypes.CONFIRMATION_DIALOG,
		onClose,
		componentProps: props,
		disableAutoClose: true
	};
}

export function getRestrictedContentModal(onClose: () => void, age: number): ModalConfig {
	const props = {
		description: '@{restricted_content_age_lower}',
		age
	};
	return {
		id: RESTRICTED_CONTENT_MODAL_ID,
		type: ModalTypes.SYSTEM_ERROR,
		onClose,
		componentProps: {
			children: <RestrictedContentModal {...props} />,
			className: 'restricted-content-modal-underage',
			cta: ErrorCta.OK
		}
	};
}

export function showCreatePinOverlay(
	account: api.Account,
	onSuccess: () => void,
	onError?: () => void,
	onClose?: () => void,
	age?: number
) {
	const props = { fromR21: true, ...getRestrictedProfileModalData(account, onSuccess, onError, onClose), age };
	return {
		id: RESTRICTED_PROFILE_PIN,
		type: ModalTypes.CUSTOM,
		element: <CreatePinOverlay {...props} />,
		disableAutoClose: true
	};
}

export const SHARE_VIDEO_MODAL_ID = 'share-video-modal';
export function getShareVideoModalData(
	id: string,
	item: api.ItemSummary,
	allowEmbed?: boolean,
	onClose?: () => void,
	onShare?: () => void
) {
	const props = { title: '@{share_modal_title}', item, allowEmbed, onShare };

	return {
		id,
		type: ModalTypes.CUSTOM,
		onClose,
		element: <ShareVideoModal {...props} />,
		disableAutoClose: false,
		componentProps: {
			className: 'share-modal'
		}
	};
}

export const SWITCH_TO_LIVE_MODAL_ID = 'switch-to-live-modal';

export const SWITCH_TO_LIVE_WARNING_MODAL_ID = 'switch-to-live-warning-modal';
export function getSwitchLiveWarningModal(title: string, onConfirm, onCancel): ModalConfig {
	const props: ConfirmationDialogProps = {
		title: '@{player_modal_start_over_live_ended_exit_confirm}',
		children: `@{${title}}`,
		confirmLabel: '@{player_modal_start_over_live_ended_exit_confirm_cta_yes|Yes, Exit}',
		cancelLabel: '@{player_modal_start_over_live_ended_exit_confirm_cta_no|No, Stay}',
		onConfirm,
		onCancel,
		hideCloseIcon: true
	};

	return {
		id: SWITCH_TO_LIVE_WARNING_MODAL_ID,
		type: ModalTypes.CONFIRMATION_DIALOG,
		componentProps: props
	};
}

export const PROGRAMME_ENDED_MODAL_ID = 'programme-ended-modal';

export const VOTING_REQUIRE_MODAL_ID = 'voting-required-modal';
export function getVotingRequiredModal(onSignIn, onSignup, onClose?): ModalConfig {
	const props = {
		title: '@{voting_require_modal_header|Sign in to vote. If you do not have an account, create one for free.}',
		confirmLabel: '@{form_signIn_signInButton_label|Sing In}',
		cancelLabel: '@{form_register_createAccount_label|Create Account}',
		onConfirm: onSignIn,
		onCancel: onSignup,
		className: VOTING_REQUIRE_MODAL_ID,
		closeOnConfirm: false,
		closeOnCancel: false
	};

	return {
		id: VOTING_REQUIRE_MODAL_ID,
		type: ModalTypes.CONFIRMATION_DIALOG,
		onClose,
		componentProps: props
	};
}
export const PROGRAMME_ERROR_MODAL_ID = 'programme-error-modal';
