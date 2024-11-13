/**
 * Environment variables are injected into the page on the server at the global scope.
 * Here we copy them down into the `process.env` shim defined by webpack and which
 * all required modules have access to.
 */
const w: any = window;
if (w && process && w.process && w.process !== process && w.process.env) {
	const env = w.process.env;
	for (let key in env) {
		process.env[key] = env[key];
	}
}

/**
 * Split the main app entry point - this allows Webpack to automatically extract the vendor libs
 * Note: don't rename chunk, remap `axis-index` in `tsconfig.json`
 */
import(/* webpackChunkName: "axis" */ 'axis-index').then(_ => {});
