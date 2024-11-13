import * as Redux from 'redux';
import { UNCAUGHT_EXCEPTION_ERROR, UNCAUGHT_PROMISE_ERROR } from './errors';

export function init(store: Redux.Store<state.Root>) {
	catchUncaughtErrors(store);
}

function catchUncaughtErrors(store) {
	if (_DEV_ || typeof window === 'undefined') return;

	window.addEventListener('unhandledrejection', function(event: PromiseRejectionEvent) {
		// Because it's from a promise we've no way of know where it came from
		store.dispatch({
			type: UNCAUGHT_PROMISE_ERROR,
			payload: { error: new Error(JSON.stringify(event.reason)) }
		});
		console.error('Unhandled rejection (promise: ', event.promise, ', reason: ', event.reason, ').');
	});
	window.addEventListener('error', function(this: Window, error: ErrorEvent) {
		store.dispatch({
			type: UNCAUGHT_EXCEPTION_ERROR,
			payload: error
		});
	});
}
