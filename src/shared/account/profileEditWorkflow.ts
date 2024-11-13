import { ADD_PROMPT, REPLACE_PROMPTS, createPrompt, cancelPrompt } from './sessionWorkflow';
import { createProfile, getAccount, updateProfileWithId, deleteProfileWithId } from '../service/action/account';
import { getProfile } from '../service/action/profile';

export function promptStartEditProfile(profileId: string) {
	const prompt = createPrompt('edit_profile_start', ['Catalog'], undefined, undefined, 'UserProfile', profileId);
	return { type: ADD_PROMPT, payload: prompt };
}

export function promptDeleteProfile() {
	const prompt = createPrompt('delete_profile', ['Catalog']);

	return { type: REPLACE_PROMPTS, payload: prompt };
}

export function promptEditProfile() {
	const prompt = createPrompt('edit_profile', ['Catalog']);

	return { type: REPLACE_PROMPTS, payload: prompt };
}

export function promptNewProfile() {
	const prompt = createPrompt('new_profile', ['Catalog']);

	return { type: REPLACE_PROMPTS, payload: prompt };
}

export function newProfile(name: string, isRestricted: boolean, tags: string[]): any {
	return dispatch => {
		return dispatch(createProfile({ name, isRestricted, segments: tags })).then(action => {
			if (!action.error) {
				return dispatch(getAccount()).then(() => {
					return dispatch(cancelPrompt());
				});
			}
		});
	};
}

export function editProfile(id: string, name: string, isRestricted: boolean, tags: string[]): any {
	return dispatch => {
		return dispatch(updateProfileWithId(id, { name, isRestricted, segments: tags }, {}, { id })).then(action => {
			if (!action.error) {
				return dispatch(getAccount()).then(() => {
					return dispatch(getProfile()).then(() => {
						return dispatch(cancelPrompt());
					});
				});
			}
		});
	};
}

export function deleteProfile(id: string): any {
	return dispatch => {
		return dispatch(deleteProfileWithId(id, undefined, { id })).then(action => {
			if (!action.error) {
				return dispatch(getAccount()).then(() => {
					return dispatch(cancelPrompt());
				});
			}
		});
	};
}
