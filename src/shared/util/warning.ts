/**
 * Prints an error with stack trace within debug builds.
 *
 * Note that if you're conditionally calling this method you likely want
 * to include the `_DEV_` flag at the start to ensure the error message gets
 * stripped from production builds. Otherwise the `msg` value gets compiled
 * in and called on an empty function.
 *
 * ```
 * if (_DEV_ && (...conditions)) {
 * 	warning('description');
 * }
 * ```
 */
export default function warning(msg: string | Error) {
	if (_DEV_) {
		/* tslint:disable:no-console */
		if (msg instanceof Error) {
			console.error(msg);
			console.error(msg.stack);
		} else {
			console.error(new Error(msg));
		}
	}
}
