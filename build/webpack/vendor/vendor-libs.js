const path = require('path');
const shimsEs6 = require('./shims-es6');
const locales = require('./locale-bundles');

module.exports = [
	path.resolve('./build/webpack/vendor/shims-dom'),
	...(process.env.XBOX ? [] : shimsEs6),
	...locales,
	'cross-fetch/polyfill',
	'picturefill/dist/picturefill.min'
];
