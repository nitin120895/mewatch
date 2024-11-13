'use strict';

exports.getMeta = function(meta) {
	if (!meta) return [];
	if (typeof meta === 'string') return [meta];
	if (Array.isArray(meta)) return meta;
	return [];
};

/**
 * We get webpack to split out vendor libs (react, redux etc) into their own
 * js file for optimal client side caching, however this file also contains the webpack
 * runtime with chunk hash mappings. This means the vendor lib file and its hash changes
 * on each change we make, even if no libs have changed. These leads to its file name
 * hash changing when it shouldn't.
 *
 * To avoid this we create a new manifest chunk which contains the webpack runtime
 * and chunk mappings. We then inline this chunk into our html page.
 *
 * See
 * - https://github.com/webpack/webpack/tree/master/examples/chunkhash
 * - https://github.com/kevinrenskers/chunkhash-problem
 * - https://gist.github.com/sokra/ff1b0290282bfa2c037bdb6dcca1a7aa#level-3-chunk
 * - https://github.com/webpack/webpack/issues/1315
 */
exports.getManifestScripts = function(assets) {
	const scripts = [];
	let name = Object.keys(assets).find(name => name === 'chunk-manifest.json');
	if (name && assets[name]._value) {
		const json = assets[name]._value;
		scripts.push(`<script>window.__chunks=${json}</script>`);
	}

	name = Object.keys(assets).find(name => name.startsWith('manifest'));
	if (name && assets[name]._value) {
		const js = assets[name]._value;
		scripts.push(`<script type="text/javascript">${js}</script>`);
	}
	return scripts;
};
