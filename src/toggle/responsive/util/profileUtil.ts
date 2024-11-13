import { CreatePinOverlayOwnProps } from '../pageEntry/account/a1/pin/CreatePinOverlay';
import { noop } from 'shared/util/function';
import { ConfirmationDialogProps } from 'ref/responsive/component/dialog/ConfirmationDialog';
import { ProfileTypes } from 'ref/responsive/page/account/profile/ProfilesForm';
import { get } from 'shared/util/objects';

export enum Personalizations {
	languageCode = 'languageCode',
	audioLanguage = 'audioLanguage',
	subtitleLanguage = 'subtitleLanguage',
	categories = 'categories'
}

export function compareSegments(prev: string[], next: string[]) {
	if (prev.length !== next.length) return false;
	for (let i = 0; i < prev.length; ++i) {
		if (prev[i] !== next[i]) return false;
	}
	return true;
}
export const RESTRICTED_PROFILE_PIN = 'restrictedProfilePin';
export const RESTRICTED_PROFILE_DOB = 'restrictedProfileDOB';

export interface UpdateProfileData extends api.ProfileUpdateRequest {
	id: string;
}

export function getRestrictedProfileModalData(
	account: api.Account,
	onSuccess: () => void,
	onError?: () => void,
	onClose?: () => void
): CreatePinOverlayOwnProps {
	return {
		account,
		id: RESTRICTED_PROFILE_PIN,
		restricted: true,
		onSuccess,
		onError,
		onClose
	};
}

export function getRestrictedProfileDOBModalData(): ConfirmationDialogProps {
	return {
		title: '@{restricted_profile_label}',
		confirmLabel: '@{app.ok}',
		onConfirm: () => noop,
		id: RESTRICTED_PROFILE_DOB,
		className: RESTRICTED_PROFILE_DOB
	};
}

export function isKidsProfile(type: ProfileTypes): boolean {
	return type === ProfileTypes.Kids;
}

export function isStandardProfile(type: ProfileTypes): boolean {
	return type === ProfileTypes.Standard;
}

export function isRestrictedProfile(type: ProfileTypes): boolean {
	return type === ProfileTypes.Restricted;
}

export const errorMap = {
	[4]: '@{profileSelector_error_invalidPin|Invalid PIN}',
	[5]: '@{profileSelector_error_invalidPin|Invalid PIN}',
	[333]: '@{profileSelector_error_lockedProfile|This profile has been locked, please try again after 5 minutes.}'
};

export const isSubprofilesFeatureEnabled = false;

export function getMinRatingPlaybackGuard(profile: api.ProfileDetail): string {
	return get(profile, 'minRatingPlaybackGuard.code') || get(profile, 'minRatingPlaybackGuard') || '';
}
