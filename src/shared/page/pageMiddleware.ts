import { HARD_REFRESH } from '../app/appWorkflow';
import { PAGE_CHANGE } from './pageWorkflow';
import { setHistoryIndex, saveLastPageState, restorePageState, saveScrollPosition } from './pagePersistence';

const pageMiddleware = store => next => action => {
	switch (action.type) {
		case HARD_REFRESH:
			// if refreshing the page, store the scroll position
			// so we can attempt to restore it after the hard refresh
			saveScrollPosition(store.getState());
			break;
		case PAGE_CHANGE:
			const state = store.getState();
			setHistoryIndex(state, action);
			saveLastPageState(state, action);
			const result = next(action);
			restorePageState(store.getState());

			return result;
	}
	return next(action);
};

export default pageMiddleware;
