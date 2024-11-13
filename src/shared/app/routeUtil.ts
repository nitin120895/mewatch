import * as Redux from 'redux';
import { chunkLoading } from './appWorkflow';
import { findPageSummaryByPath, getPathByKey } from 'shared/page/sitemapLookup';
import { Watch as watchPageKey } from '../page/pageKey';

let store: Redux.Store<state.Root>;

export function init(appStore: Redux.Store<state.Root>) {
	store = appStore;
}

/**
 * Loads a route via System.import support in webpack.
 */
export function loadRoute(promise: Promise<any>, cb) {
	store.dispatch(chunkLoading(true));
	const cbw = (...args) => {
		store.dispatch(chunkLoading(false));
		return cb.apply(undefined, args);
	};
	return promise.then(importRoute(cbw)).catch(error => cbw(error));
}

function importRoute(cb) {
	return module => cb(undefined, module.default);
}

export function getPathByPageKey(PageKey: string) {
	return getPathByKey(PageKey, store.getState().app.config);
}

export function isWatchPath(path: string): boolean {
	const summary = findPageSummaryByPath(path, store.getState().app.config);
	return summary.key === watchPageKey;
}
