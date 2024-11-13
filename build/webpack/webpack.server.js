'use strict';
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const vars = require(path.resolve('./build/variables'));
const utils = require(path.resolve('./build/webpack/common/utils'));
const modules = require(path.resolve('./build/webpack/common/modules'));
const loaders = require(path.resolve('./build/webpack/common/loaders'));
const TerserPlugin = require('terser-webpack-plugin'); // new name of UlifyJS

const env = process.env;
const isTV = env.TV === 'true';
const OUT_DIR = path.resolve('./bin/app/server');
const publicPath = `${env.CLIENT_ASSET_URL || ''}/`;

if (isTV) {
	if (env.TIZEN) env.CLIENT_DEVICE_PLATFORM = 'tv_samsung';
	else if (env.WEBOS) env.CLIENT_DEVICE_PLATFORM = 'tv_lg_webos';
	else if (env.XBOX) env.CLIENT_DEVICE_PLATFORM = 'tv_xboxone';
	else env.CLIENT_DEVICE_PLATFORM = 'tv_generic';
} else {
	env.CLIENT_DEVICE_PLATFORM = 'web_browser';
}

module.exports = env => {
	utils.assignNodeEnv(env);

	const config = {
		mode: env.prod ? 'production' : 'development',
		context: path.resolve('./src'),
		entry: {
			server: ['core-js/fn/object/values', `./server/boot`, `./server/index`]
		},
		output: {
			path: OUT_DIR,
			filename: `index.${env.dev ? 'dev.' : ''}${env.tv ? 'tv.' : ''}js`,
			hashDigestLength: 7,
			publicPath,
			sourceMapFilename: '[file].map'
		},
		target: 'node',
		devtool: env.prod
			? undefined
			: // For dev:
			  // : 'cheap-module-eval-source-map', // faster rebuilds at cost of only line level accuracy
			  'source-map', // slower rebuilds but gives line and column accuracy
		node: {
			__dirname: false,
			__filename: false
		},
		externals: getExternals(),
		resolve: modules.resolve(env),
		optimization: getOptimization(env),
		module: {
			noParse: [/webpack\.client/],
			rules: [
				loaders.tsLint(),
				loaders.patchRouter(),
				loaders.patchReactIntl(),
				loaders.typeScript(env, 'server'),
				loaders.imageUrl(env, false),
				loaders.fontFile(env, false),
				loaders.css(env, __dirname)
			]
		},
		plugins: [
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
				_DEV_: env.dev || false,
				_QA_: env.qa || false,
				_TV_: env.tv || false,
				_DISCOVER_: JSON.stringify(process.env.DISCOVER_URL),
				_FHD_: process.env.RES !== 'RES_720p',
				_SSR_: env.prod || (!!env.dev && !!process.env.SSR),
				_BRAND_NAME_: JSON.stringify(`${vars.brandName}${env.tv ? '/tv' : '/responsive'}`),
				_SERVER_: true
			}),
			...modules.getModulePlugins(env, 'server')
		]
	};

	return utils.postProcessConfig(config, env, [utils.aliasPreact]);
};

function getOptimization(env) {
	if (env.dev) return undefined;
	return {
		minimizer: [
			new TerserPlugin({
				parallel: true,
				terserOptions: {
					safari10: false,
					mangle: false
					// https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
				}
			})
		]
	};
}

function getExternals() {
	// This exclude list must contain any react based modules preact will need to re-map using
	// preact-compat, otherwise it will fail to server render those components properly.
	// When this happens you'll usually see "[object object]" rendered instead.
	const excludes = ['.bin', 'react-router', 'react-redux', 'react-helmet', 'react-side-effect', 'react'];
	return fs
		.readdirSync('node_modules')
		.filter(x => !~excludes.indexOf(x))
		.reduce((nodeModules, mod) => {
			nodeModules[mod] = 'commonjs ' + mod;
			return nodeModules;
		}, {});
}
