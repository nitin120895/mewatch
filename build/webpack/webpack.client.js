'use strict';
require('dotenv').config();

const path = require('path');
const utils = require(path.resolve('./build/webpack/common/utils'));
const modules = require(path.resolve('./build/webpack/common/modules'));
const loaders = require(path.resolve('./build/webpack/common/loaders'));
const plugins = require(path.resolve('./build/webpack/client/plugins'));
const clientUtils = require(path.resolve('./build/webpack/client/utils'));
const clientLoaders = require(path.resolve('./build/webpack/client/loaders'));

const OUT_DIR = path.resolve('./bin/app/pub');

const env = process.env;
const isTV = env.TV === 'true';
if (!env.CLIENT_DEFAULT_LOCALE) env.CLIENT_DEFAULT_LOCALE = 'en';
if (!env.CLIENT_LOCALES) env.CLIENT_LOCALES = env.CLIENT_DEFAULT_LOCALE;
if (!env.CLIENT_SERVICE_CDN_URL) env.CLIENT_SERVICE_CDN_URL = env.CLIENT_SERVICE_URL;

const LOCALE = env.CLIENT_DEFAULT_LOCALE;
let PUBLIC_PATH;

if (isTV) {
	if (env.TIZEN) env.CLIENT_DEVICE_PLATFORM = 'tv_samsung';
	else if (env.WEBOS) env.CLIENT_DEVICE_PLATFORM = 'tv_lg_webos';
	else if (env.XBOX) env.CLIENT_DEVICE_PLATFORM = 'tv_xboxone';
	else env.CLIENT_DEVICE_PLATFORM = 'tv_generic';

	const isPackaged =
		(env.TIZEN && env.TIZEN_HOSTED !== 'true') ||
		(env.WEBOS && env.WEBOS_HOSTED !== 'true') ||
		(env.XBOX && env.XBOX_HOSTED !== 'true');
	PUBLIC_PATH = isPackaged ? './' : env.CLIENT_BASENAME ? `${env.CLIENT_BASENAME}/` : '/';
} else {
	env.CLIENT_DEVICE_PLATFORM = 'web_browser';
	PUBLIC_PATH = '/';
}

const DEVTOOL = env.TIZEN
	? undefined // Tizen doesn't allow `eval` and won't use sourcemaps when debugging
	: 'eval-source-map';

module.exports = env => {
	utils.assignNodeEnv(env);
	if (!env.analyzer && process.env.ANALYZER === 'true') env.analyzer = true;
	const includeViewer = clientUtils.includeViewer(env);
	const entryPoints = getEntryPoints(env, includeViewer);

	const config = {
		mode: env.prod ? 'production' : 'development',
		context: path.resolve('./src'),
		entry: entryPoints,
		output: {
			path: OUT_DIR,
			filename: `[name]${env.prod ? '.[chunkhash]' : ''}.js`,
			chunkFilename: `[name]${env.prod ? '.[chunkhash]' : ''}.c.js`,
			hashDigestLength: 7,
			publicPath:
				env.prod && !env.static
					? '{{CLIENT_ASSET_URL}}/' // This token gets replaced in our generated files during deployemnt
					: PUBLIC_PATH,
			sourceMapFilename: '[file].map',
			pathinfo: !env.prod
		},
		cache: env.dev,
		bail: env.prod,
		devtool: env.prod
			? undefined
			: env.test // Note, tests can't use eval style sourcemaps or they blow up.
			? 'cheap-module-source-map' //'inline-source-map'
			: DEVTOOL,
		resolve: modules.resolve(env),
		performance: {
			assetFilter: function(assetFilename) {
				return assetFilename !== 'stats.json' && assetFilename !== 'report-stats.json';
			},
			hints: env.prod ? 'warning' : false
		},
		stats: {
			entrypoints: false,
			children: false,
			modules: false
		},
		node: {
			// client was loading node 'Buffer' for gateway/index.ts when it's not needed
			// this ensures it doesn't get loaded as it's a fairly sizable polyfill
			Buffer: false
		},
		optimization: getOptimization(env),
		module: {
			rules: [
				loaders.tsLint(),
				loaders.patchRouter(),
				loaders.patchReactIntl(),
				loaders.typeScript(env, includeViewer ? 'viewer' : 'client', env.dev),
				loaders.imageUrl(env),
				loaders.fontFile(env),

				clientLoaders.getCSSLoader(env)
			]
		},
		plugins: [
			// test
			...plugins.getTestPlugins(env),
			// default dev and prod
			...plugins.getDefaultDevProdQAPlugins(env),
			...plugins.getStaticPlugins(env, LOCALE),
			// prod
			...plugins.getProdPlugins(env),
			...plugins.getProdQAPlugins(env),
			...plugins.getProdServiceWorkerPlugin(env),
			// dev
			...plugins.getDevPlugins(env),
			// component viewer
			...plugins.getViewerPlugins(env, LOCALE)
		]
	};

	return utils.postProcessConfig(config, env, [utils.usePrecompiledLibs, utils.aliasPreact]);
};

/**
 * Webpack optimisation/chunking options
 */
function getOptimization(env) {
	if (env.dev) return undefined;
	return {
		minimizer: plugins.getMinimizers(env),
		runtimeChunk: {
			name: 'manifest' // extract webpack runtime chunk
		}
	};
}

/**
 * Declares all the entry points available for each environment.
 */
function getEntryPoints(env, includeViewer) {
	const appEntry = [
		...require(path.resolve('./build/webpack/vendor/vendor-libs')),
		`./shared/boot${env.tv ? '-tv' : ''}`
	];
	const entryPoints = {
		app: env.dev ? ['webpack-hot-middleware/client'].concat(appEntry) : appEntry
	};

	if (includeViewer) {
		// Component Viewer
		entryPoints.components = env.dev
			? ['webpack-hot-middleware/client'].concat(['./viewer/index.tsx'])
			: './viewer/index.tsx';
		entryPoints.componentsIFrame = env.dev
			? ['webpack-hot-middleware/client'].concat(['./viewer/index-iframe.tsx'])
			: './viewer/index-iframe.tsx';
	}

	return entryPoints;
}
