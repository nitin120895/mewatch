import { createStore, applyMiddleware, compose } from 'redux';
import sessionMiddleware from './account/sessionMiddleware';
import pageMiddleware from './page/pageMiddleware';
import searchMiddleware from './search/searchMiddleware';
import cacheMiddleware from './cache/cacheMiddleware';
import storageMiddleware from './app/storageMiddleware';
import uiLayerMiddleware from 'shared/uiLayer/uiLayerMiddleware';
import thunk from 'redux-thunk';
import reducer from './reducer';

const w: any = typeof window !== 'undefined' ? window : {};

/*
 *	Note that starting from v2.7, window.devToolsExtension was renamed to
 *	window.__REDUX_DEVTOOLS_EXTENSION__ / window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__.
 * https://github.com/zalmoxisus/redux-devtools-extension#usage
 * */
const devToolsCompose = w['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'];
const composeEnhancers = (_DEV_ || _QA_) && !!devToolsCompose ? devToolsCompose : compose;

export default function configureStore(initialState?, middleware: any[] = []) {
	middleware = [
		thunk,
		pageMiddleware,
		cacheMiddleware,
		searchMiddleware,
		sessionMiddleware,
		storageMiddleware,
		uiLayerMiddleware
	].concat(middleware);

	const state = initialState || w.__data || {};
	state.search = undefined; // always use client-side's initial state

	const store = createStore(reducer, state, composeEnhancers(applyMiddleware(...middleware)));

	return store;
}
