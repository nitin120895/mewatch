import { GET_PAGE_DETAIL } from '../page/pageWorkflow';
import { runInvalidators } from './cacheInvalidator';

const cacheMiddleware = store => next => action => {
	switch (action.type) {
		case GET_PAGE_DETAIL:
			runInvalidators();
			break;
	}
	return next(action);
};

export default cacheMiddleware;
