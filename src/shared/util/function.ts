/**
 * A 'noop' or a function that does nothing
 * This allows for a single function to be created to be used everywhere
 * where a 'do nothing' function is needed.
 *
 * An example usage is in defaultProps for react objects that accept an event
 * By using noop you can always safely call them without null checking.
 */
export const noop = (...args: any[]) => {};

/**
 * Ensures that the two functions given are called when the function returned is invoked
 * Don't rely on this for return values, you will not get the result you want
 * @param wrapper The function that is to be called with the original
 * @param original The original function
 */
export const wrap = (...funcs: ((...args: any[]) => any)[]) => {
	return (...args) => {
		funcs.forEach(func => {
			if (func) func(...args);
		});
	};
};

export const negate = (func: (...args: any[]) => boolean) => (...args: any[]) => !func(...args);

export const compareKey = <T, K extends keyof T = keyof T>(key: K) => (curr: T, prev: T) =>
	(curr && curr[key]) === (prev && prev[key]);

export function copyToClipboard(text, onSuccess = noop, onError = noop) {
	if (navigator.clipboard) {
		navigator.clipboard.writeText(text).then(onSuccess, onError);
	}
}
