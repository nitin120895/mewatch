import {
	GET_ACCOUNT_TOKEN_BY_CODE,
	GET_ACCOUNT_TOKEN,
	GET_PROFILE_TOKEN,
	SINGLE_SIGN_ON,
	REFRESH_TOKEN,
	CREATE_SETTINGS_TOKEN,
	CREATE_PLAYBACK_TOKEN,
	GET_ANONYMOUS_TOKEN,
	SINGLE_SIGN_ON_ANONYMOUS
} from '../service/action/authorization';
import { REGISTER, REGISTER_ANONYMOUS } from '../service/action/registration';
import { SIGN_OUT, SELECT_PROFILE, UNSELECT_PROFILE, CLEAR_ANONYMOUS_TOKEN } from './sessionWorkflow';
import { profileSelected, clearProfileSelected } from './profileUtil';
import { updateSavedTokens, clearSavedTokens, updateSavedAuthTokens } from '../util/tokens';

const sessionMiddleware = store => next => action => {
	const result = next(action);
	switch (action.type) {
		case GET_ACCOUNT_TOKEN_BY_CODE:
		case GET_ACCOUNT_TOKEN:
		case GET_PROFILE_TOKEN:
		case SINGLE_SIGN_ON:
		case SINGLE_SIGN_ON_ANONYMOUS:
		case REFRESH_TOKEN:
		case CREATE_SETTINGS_TOKEN:
		case REGISTER:
		case REGISTER_ANONYMOUS:
		case GET_ANONYMOUS_TOKEN:
		case CLEAR_ANONYMOUS_TOKEN:
			updateSavedTokens(store);
			break;
		case SELECT_PROFILE:
			profileSelected();
			break;
		case UNSELECT_PROFILE:
			clearProfileSelected();
			break;
		case SIGN_OUT:
			clearProfileSelected();
			clearSavedTokens();
			break;
		case CREATE_PLAYBACK_TOKEN:
			updateSavedAuthTokens(store);
			break;
	}
	return result;
};

export default sessionMiddleware;
