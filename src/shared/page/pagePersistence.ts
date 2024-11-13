import * as Redux from 'redux';
import * as storage from '../util/sessionStorage';
import { selectPageState } from './pageUtil';
import { get } from 'shared/util/objects';

let store: Redux.Store<state.Root>;

export function init(appStore: Redux.Store<state.Root>) {
	store = appStore;
}

if (typeof window !== 'undefined') {
	window.addEventListener('unload', () => {
		if (store) {
			const state = store.getState();
			saveScrollPosition(state);
			saveLastPageState(state);
		}
	});
}

export function setHistoryIndex(state: state.Root, action: Action<HistoryLocation>) {
	const loc = action.payload;
	const savedState = storage.getItem(loc.key) || {};
	if (loc.action === 'PUSH' || savedState.i === undefined) {
		const currentIndex = state.page.history.index;
		if (loc.action === 'PUSH') {
			savedState.i = currentIndex + 1;
		} else if (currentIndex) {
			savedState.i = currentIndex;
		} else {
			savedState.i = 0;
		}
		storage.setItem(loc.key, savedState);
	}
	loc.index = savedState.i;
}

export function saveScrollPosition(state: state.Root) {
	if (typeof window === 'undefined') return;
	const pageState = selectPageState(state);
	pageState.scrollY = window.pageYOffset;
}

export function saveLastPageState(state: state.Root, action?: Action<HistoryLocation>) {
	const currentIndex = state.page.history.index;
	const historyEntry = state.page.history.entries[currentIndex];
	if (!historyEntry || !historyEntry.key) return;

	if (action && action.payload.action === 'REPLACE') {
		historyEntry.state = {};
	} else {
		historyEntry.state = stripEmptyObjects(historyEntry.state);
	}
	storage.setItem(historyEntry.key, {
		i: historyEntry.index,
		state: historyEntry.state
	});
}

export function restorePageState(state: state.Root) {
	const index = state.page.history.index;
	const historyEntry = state.page.history.entries[index];
	if (historyEntry) {
		const pageState = historyEntry.state;
		const savedState = storage.getItem(historyEntry.key);
		if (savedState) {
			historyEntry.index = savedState.i;
			Object.assign(pageState, savedState.state);
		}
	}
}

function stripEmptyObjects(obj) {
	if (!obj) return {};

	const keys = Object.keys(obj).filter(key => {
		const val = obj[key];
		if (val && typeof val === 'object') {
			return Object.keys(val).length > 0;
		}
		return true;
	});
	return keys.reduce((obj2, key) => {
		obj2[key] = obj[key];
		return obj2;
	}, {});
}

export function getPathname() {
	const state = store.getState();
	return get(state, 'page.history.location.pathname');
}
