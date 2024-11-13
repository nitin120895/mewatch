import { getAccount } from 'shared/service/action/account';
import { getProfile } from 'shared/service/action/profile';
import DeviceModel from 'shared/util/platforms/deviceModel';
import {
	getAccountTokenByCode,
	generateDeviceAuthorizationCode,
	GENERATE_DEVICE_AUTHORIZATION_CODE
} from '../service/action/authorization';
import {
	PROMPT_SIGN_IN,
	PROMPT_PASSWORD,
	PROMPT_PIN,
	ADD_PROMPT,
	REPLACE_PROMPTS,
	CANCEL_PROMPT,
	createPrompt
} from './sessionWorkflow';
import { hardRefresh } from '../app/appWorkflow';
import { Store, Dispatch } from 'redux';

// This variable indicates whether app in the process of checking device activation
let isPollingAccountTokenByCode: string = undefined;
let pollRequestTimer;
let stopPollRequest = false;

/**
 * Explicitly request a sign-in by code prompt
 * Use 'promptSignIn' instead
 */
export function promptDeviceCodeSignin() {
	const prompt = createPrompt('gencode', ['Catalog']);
	return { type: REPLACE_PROMPTS, payload: prompt };
}

/**
 * Refresh sign-in by code prompt
 */
export function renewDeviceCode() {
	return promptDeviceCodeSignin();
}

/**
 * Get a generated device authorization code
 */
export function refreshDeviceAuthorizationCode(): any {
	return dispatch => {
		const { getId } = DeviceModel.deviceInfo();
		getId().then(id => {
			return dispatch(generateDeviceAuthorizationCode({ id, brandId: 1 }));
		});
	};
}

/**
 * Process actions to hook TV-specific features:
 * - sign-in with code
 * - generate device code and poll for activation
 */
export const middleware = (store: Store<state.Root>) => (next: Dispatch<any>) => (action: Action<any>) => {
	switch (action.type) {
		case GENERATE_DEVICE_AUTHORIZATION_CODE: {
			generateCode(store, next, action);
			return;
		}
		case PROMPT_SIGN_IN:
		case PROMPT_PASSWORD:
		case PROMPT_PIN:
		case ADD_PROMPT: {
			// replace 'signIn' with device sign-in
			if (action.payload.type === 'signIn') {
				action = promptDeviceCodeSignin();
			}
			maybeGenerateDeviceCode(store.dispatch, action);
			break;
		}
		case CANCEL_PROMPT: {
			// cancel device polling when prompts are cancelled
			const state = store.getState();
			const prompts = state.session.authPrompts;
			if (isCancelGenPrompt(prompts)) {
				isPollingAccountTokenByCode = undefined;
			}
			break;
		}
		case REPLACE_PROMPTS: {
			// cancel device polling when prompts are cancelled
			isPollingAccountTokenByCode = undefined;
			maybeGenerateDeviceCode(store.dispatch, action);
		}
	}
	return next(action);
};

function generateCode(store: Store<state.Root>, next: Dispatch<any>, action: Action<any>) {
	// when device code is generated
	const state = store.getState();
	const prompts = state.session.authPrompts;
	if (prompts.length === 0) return;

	// update the prompt
	const prompt = createPrompt('gencode_ok', ['Catalog']);
	const code = action.payload.code;
	prompt['code'] = code;
	next({ type: REPLACE_PROMPTS, payload: prompt });

	// and poll for activation
	const { getId } = DeviceModel.deviceInfo();
	pollRequestTimer = undefined;
	stopPollRequest = false;
	getId().then(id => {
		pollAccountTokenByCode(store.dispatch, { id, code }, 15);
	});
}

function isCancelGenPrompt(prompts: Prompt<string[]>[]) {
	if (!prompts || !prompts.length) return true;
	const type = prompts[prompts.length - 1].type;
	return type === 'gencode' || type === 'gencode_ok';
}

function maybeGenerateDeviceCode(dispatch, action: Action<{ type: string }>) {
	if (action.payload.type === 'gencode') {
		dispatch(refreshDeviceAuthorizationCode());
	}
}

export function pollAccountTokenByCode(dispatch, reqBody: { id: string; code: string }, requestTime = 5) {
	const code = reqBody.code;
	isPollingAccountTokenByCode = code;

	function handleExpired() {
		clearTimeout(pollRequestTimer);
		pollRequestTimer = undefined;
		stopPollRequest = false;
		const prompt = createPrompt('code_expired', ['Catalog']);
		dispatch({ type: REPLACE_PROMPTS, payload: prompt });
	}

	function handleError(errorCode: number, reqCode: string) {
		// -1: unknown error
		// 1: code not found
		// 2: code expired
		// 3: code not activated
		if (errorCode === 2) {
			handleExpired();
		} else {
			if (stopPollRequest) {
				const prompt = createPrompt('action_request', ['Catalog']);
				prompt['code'] = reqCode;
				dispatch({ type: REPLACE_PROMPTS, payload: prompt });
			} else {
				pollAccountTokenByCode(dispatch, reqBody);
			}
		}
	}

	setTimeout(() => {
		if (isPollingAccountTokenByCode !== code) return;

		dispatch(getAccountTokenByCode(reqBody)).then(
			(action: Action<{ code: number; message: string }>) => {
				if (isPollingAccountTokenByCode !== code) return;

				if (action.error) {
					!pollRequestTimer && pollRequestTimeout();
					return handleError(action.payload ? action.payload.code : -1, code);
				}

				Promise.all([dispatch(getAccount())])
					.then(actions => {
						clearTimeout(pollRequestTimer);
						pollRequestTimer = undefined;
						stopPollRequest = false;
						const account: api.Account = actions[0] && actions[0].payload;
						validateAccount(dispatch, account);
					})
					.catch(error => {
						console.log(error.message);
						handleExpired();
					});
			},
			error => {
				pollAccountTokenByCode(dispatch, reqBody);
			}
		);
	}, requestTime * 1000);
}

function validateAccount(dispatch, account: api.Account) {
	if (account.profiles && account.profiles.length > 1) {
		const prompt = createPrompt('choose_profile', ['Catalog']);
		dispatch({ type: REPLACE_PROMPTS, payload: prompt });
	} else {
		dispatch(getProfile());
		const prompt = createPrompt('signin_suc', ['Catalog']);
		dispatch({ type: REPLACE_PROMPTS, payload: prompt });
		dispatch(hardRefresh());
	}
}

function pollRequestTimeout() {
	pollRequestTimer = setTimeout(() => {
		stopPollRequest = true;
	}, 120 * 1000);
}
