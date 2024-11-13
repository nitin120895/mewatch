const DEFAULT_DEBOUNCE_TIMEOUT = 250;
const DEFAULT_THROTTLE_TIMEOUT = 100;

/**
 * Defers the execution of a function until it has not been triggered for a given timeframe.
 *
 * @param {function} func The function to be fired
 * @param {number} [wait=DEFAULT_DEBOUNCE_TIMEOUT] The time in ms to delay firing
 * @param {boolean} [immediate]	If true, then fires the function on the leading edge instead of the trailing edge
 * @returns {function} An anonymous function that can fire the debounced function
 */
export function debounce(
	func: any,
	wait: number = DEFAULT_DEBOUNCE_TIMEOUT,
	immediate?: boolean
): (...values: any) => void {
	let timeout;
	return function() {
		const args = arguments;
		const later = () => {
			timeout = undefined;
			if (!immediate) func.apply(this, args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(this, args);
	};
}

/**
 * Limits the repeated execution of a function to a defined interval.
 *
 * @param {function} func The function to be fired
 * @param {number} [wait=DEFAULT_THROTTLE_TIMEOUT] The time in ms between firing
 * @param {boolean} [atLeastOnce]	If true, then is guaranteed to fire the callback at least once after initial handler call
 * @returns {function} An anonymous function that can fire the throttled function
 */
export function throttle(func: any, wait: number = DEFAULT_THROTTLE_TIMEOUT, atLeastOnce?: boolean): () => void {
	let timeout,
		time = Date.now();
	return function() {
		const args = arguments;
		if (atLeastOnce) {
			// add a debounce to ensure we fire at least once
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(this, args), wait + 100);
		}
		if (time + wait - Date.now() < 0) {
			func.apply(this, args);
			time = Date.now();
			if (atLeastOnce) clearTimeout(timeout);
		}
	};
}

// Server will always support weak map as we're in control of that.
const supportsWeakMap = typeof WeakMap !== 'undefined';

/**
	Copyright JS Foundation and other contributors <https://js.foundation/>

	Based on Underscore.js, copyright Jeremy Ashkenas,
	DocumentCloud and Investigative Reporters & Editors <http://underscorejs.org/>

	This software consists of voluntary contributions made by many
	individuals. For exact contribution history, see the revision history
	available at https://github.com/lodash/lodash
 */
// Adapted from lodash memoize.js
/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * const object = { 'a': 1, 'b': 2 }
 * const other = { 'c': 3, 'd': 4 }
 *
 * const values = memoize(values)
 * values(object)
 * // => [1, 2]
 *
 * values(other)
 * // => [3, 4]
 *
 * object.a = 2
 * values(object)
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b'])
 * values(object)
 * // => ['a', 'b']
 *
 */

export function memoize<T>(func: (key: Object, ...args: Array<any>) => T) {
	let memoizeCache: any = supportsWeakMap ? new WeakMap<Object, T>() : new Map<Object, T>();
	const memoized = function(key: Object, ...args: Array<any>): T {
		const cache = memoizeCache;

		if (cache.has(key)) {
			return cache.get(key);
		} else if (!supportsWeakMap) {
			// don't want to memory leak in instances where we don't support WeakMap, so if we miss the cache
			// clear it. In theory, in the common case we're using completely new objects each time
			// and it should never need to go back to an old one.
			cache.clear();
		}
		const result = func.call(this, key, ...args);
		memoizeCache = cache.set(key, result) || cache;
		return result;
	};
	memoizeCache = supportsWeakMap ? new WeakMap<Object, T>() : new Map<Object, T>();
	return memoized;
}

export function once(handler) {
	let fired = false;
	return (...args) => {
		!fired && (fired = true) && handler(...args);
	};
}

export function defer(handler) {
	return (<any>window).requestIdleCallback
		? (<any>window).requestIdleCallback(handler)
		: setTimeout(() => requestAnimationFrame(() => handler()), 1);
}
