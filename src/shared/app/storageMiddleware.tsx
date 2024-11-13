import * as cookieUtils from '../util/cookies';
import { UPDATE_LOCALE } from '../app/appWorkflow';
import { VOLUME_SAVE } from '../app/playerWorkflow';
import { saveLanguagePreference } from './localeUtil';
import { saveVolume } from '../util/volume';

const storageMiddleware = store => next => action => {
	if (!cookieUtils.cookiesEnabled()) {
		return next(action);
	}

	switch (action.type) {
		case VOLUME_SAVE:
			saveVolume(action.payload);
			break;

		case UPDATE_LOCALE:
			saveLanguagePreference(action.payload.lang);
			break;
	}

	return next(action);
};

export default storageMiddleware;
