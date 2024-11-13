import * as Redux from 'redux';
import { ContinueWatching as continueWatchingListId } from '../list/listId';
import { removeListCache, doNormalizeNavLists } from './cacheWorkflow';

// should been sent from PM
const CONTINUE_WATCHED_INVALIDATION_TIME = 1000 * 60 * 60;

let store: Redux.Store<state.Root>;

type CacheInvalidator = () => void;

const invalidators = new Set<CacheInvalidator>();

export function init(appStore: Redux.Store<state.Root>) {
	store = appStore;
	setupInvalidators();
}

export function runInvalidators() {
	invalidators.forEach(invalidator => invalidator());
}

function setupInvalidators() {
	invalidators.add(continueWatchingListInvalidator);
}

/*
 * Invalidate Continue Watching list in case there is no update of watched collection more than defined time
 */
function continueWatchingListInvalidator() {
	const { profile, cache, app } = store.getState();
	const cwList = !!cache.list && cache.list[continueWatchingListId];

	if (!profile || !cwList) return;
	const lastWatchedUpdateTime = profile.watchedUpdateTime;
	const cwUpdateTime = cwList.updateTime;
	const now = Date.now();

	if (
		now - lastWatchedUpdateTime > CONTINUE_WATCHED_INVALIDATION_TIME &&
		now - cwUpdateTime > CONTINUE_WATCHED_INVALIDATION_TIME
	) {
		store.dispatch(removeListCache(continueWatchingListId));
		store.dispatch(doNormalizeNavLists(app.config.navigation));
	}
}
