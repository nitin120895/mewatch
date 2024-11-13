/**
 * Environment variables are injected into the page on the server at the global scope.
 * Here we copy them down into the `process.env` shim defined by webpack and which
 * all required modules have access to.
 */
const win: any = window;
if (win && process && win.process && win.process !== process && win.process.env) {
	const env = win.process.env;
	for (let key in env) {
		process.env[key] = env[key];
	}
}

/**
 * Split the main app entry point - this allows Webpack to automatically extract the vendor libs
 * Note: don't rename chunk, remap `axis-index` in `tsconfig.json`
 */
import(/* webpackChunkName: "axis" */ 'axis-index-tv').then(_ => {});
