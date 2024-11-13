/**
 * Cancelation of Promises is still in the works so in the meantime
 * use this basic version from React docs.
 *
 * See
 * - https://facebook.github.io/react/blog/2015/12/16/ismounted-antipattern.html
 * - https://domenic.github.io/cancelable-promise/
 * - https://github.com/domenic/cancelable-promise
 */
import { defer } from 'shared/util/performance';

export type CancelablePromise<T> = { cancel: () => void; promise: Promise<T> };

export function makeCancelable<T>(promise: Promise<T>): CancelablePromise<T> {
	let hasCanceled = false;

	const wrappedPromise = new Promise<T>((resolve, reject) => {
		promise.then(val => (hasCanceled ? reject({ canceled: true }) : resolve(val)));
		promise.catch(error => (hasCanceled ? reject({ canceled: true }) : reject(error)));
	});

	return {
		promise: wrappedPromise,
		cancel() {
			hasCanceled = true;
		}
	};
}

export function timeout(msec: number): Promise<void> {
	return new Promise((resolve, reject) => {
		if (msec < 0) {
			return reject(new Error('Invalid time value'));
		}
		if (msec === 0) {
			return defer(resolve);
		}
		setTimeout(resolve, msec);
	});
}
