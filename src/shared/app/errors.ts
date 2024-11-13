/**
 * Error type thrown to signify a cancellation e.g. in auth prompts.
 */
export class Cancellation extends Error {
	constructor(message?: string) {
		super(message);
		updatePrototype(this, Cancellation);
	}
}

/**
 * Fixes the prototype and stack trace for custom error classes.
 *
 * In order to extend built in types like Error/Array we need to manually
 * assign the correct prototype due to typescript transpiling issues.
 *
 * See:
 * - https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
 * - https://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax-babel
 *
 * @param error The error instance.
 * @param ErrorType The class type which has the desired prototype to apply to the object instance.
 */
function updatePrototype(error: Error, ErrorType: any) {
	Object.setPrototypeOf(error, ErrorType.prototype);
	error.name = ErrorType.name;
	if (typeof Error.captureStackTrace === 'function') {
		Error.captureStackTrace(error, error.constructor);
	} else {
		error.stack = new Error(error.message).stack;
	}
}

export const SERVICE_ERROR = 'system/SERVICE_ERROR';
export const UNCAUGHT_EXCEPTION_ERROR = 'system/UNCAUGHT_EXCEPTION_ERROR';
export const UNCAUGHT_PROMISE_ERROR = 'system/UNCAUGHT_PROMISE_ERROR';
