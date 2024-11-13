const autoprefixer = require('autoprefixer')();
const plugins = [autoprefixer];
const env = process.env;
const isTV = env.TV === 'true';

if (env.NO_CSS_TRANSITION === 'true') {
	plugins.push(require('../script/modules/postcss-noTransition')());
}
if (isTV && env.RES === 'RES_720p') {
	plugins.push(require('../script/modules/postcss-resolution-change')());
}

module.exports = {
	plugins: plugins
};
