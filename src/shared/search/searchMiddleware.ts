import { SEARCH_SAVE, SEARCH_CLEAR } from './searchWorkflow';
import { updateSavedSearches } from '../util/search';

const searchMiddleware = store => next => action => {
	const result = next(action);
	switch (action.type) {
		case SEARCH_SAVE:
		case SEARCH_CLEAR:
			updateSavedSearches(store, result);
			break;
	}
	return result;
};

export default searchMiddleware;
