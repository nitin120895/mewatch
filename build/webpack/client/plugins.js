'use strict';
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const vars = require(path.resolve('./build/variables'));

const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const StatsPlugin = require('webpack-stats-plugin').StatsWriterPlugin;
const TerserPlugin = require('terser-webpack-plugin'); // new name of Uglify JS

const modules = require(path.resolve('./build/webpack/common/modules'));
const utils = require(path.resolve('./build/webpack/client/utils'));

function getBasicPlugins(env) {
	return [new webpack.DefinePlugin(utils.getClientEnvVars(env))];
}

exports.getTestPlugins = function(env) {
	if (env.test) {
		return getBasicPlugins(env);
	}
	return [];
};

exports.getDefaultDevProdQAPlugins = function(env) {
	if (!env.test) {
		return [...getBasicPlugins(env), ...modules.getModulePlugins(env, 'client')];
	}
	return [];
};

exports.getStaticPlugins = function(env, locale) {
	if (!env.test && (env.static || env.dev)) {
		const strings = require(path.resolve(path.join(vars.resources.stringsBase, `strings-${locale}`))) || {};
		return [
			new HtmlWebpackPlugin({
				chunksSortMode: 'dependency',
				excludeChunks: (utils.includeViewer(env) ? ['components', 'componentsIFrame'] : []).concat(
					env.dev ? [] : ['manifest']
				),
				template: path.resolve(getIndexTemplate(process.env.CLIENT_DEVICE_PLATFORM)),
				title: strings.app_title || '',
				filename: 'index.html',
				lang: locale,
				viewport: process.env.RES === 'RES_720p' ? 'width=1280, height=720' : 'width=1920, height=1080',
				locales: process.env.CLIENT_LOCALES.split(','),
				charset: 'utf-8',
				favicon: path.resolve(vars.resources.favicon),
				inject: 'body',
				minify: {
					removeComments: true,
					collapseWhitespace: true
				}
			})
		];
	}
	return [];
};

exports.getProdPlugins = function(env) {
	if (!env.test && env.prod) {
		return [
			// Prod specific plugins
			new StatsPlugin({
				fields: ['assetsByChunkName', 'assets', 'hash', 'publicPath', 'namedChunkGroups']
			}),
			new webpack.LoaderOptionsPlugin({
				minimize: true,
				debug: false
			}),
			new MiniCssExtractPlugin({
				filename: '[name].[contenthash:7].css',
				chunkFilename: '[id].[contenthash:7].css',
				ignoreOrder: true
			})
		];
	}
	return [];
};

exports.getProdQAPlugins = function(env) {
	if (env.analyzer || env.qa) {
		const base = env.qa ? '.' : '../report';
		return [
			new BundleAnalyzerPlugin({
				// Can be `server`, `static` or `disabled`.
				analyzerMode: 'static',
				openAnalyzer: false,
				// Path to bundle report file that will be generated in `static` mode.
				reportFilename: `${base}/bundle-report.html`,
				// If `true`, Webpack Stats JSON file will be generated in bundles output directory
				generateStatsFile: true,
				statsFilename: `${base}/report-stats.json`
			})
		];
	}
	return [];
};

exports.getProdServiceWorkerPlugin = function(env) {
	if (!env.test && env.prod && !env.qa) {
		return [
			new SWPrecacheWebpackPlugin({
				cacheId: 'assets',
				filename: 'sw.js',
				staticFileGlobs: [
					'bin/app/pub/**/!(app.*.css|manifest.*.js|manifest.json|stats.json|chunk-manifest.json|favicon*.png|icon-*.png)'
				],
				stripPrefixMulti: {
					'bin/app/pub/': '{{CLIENT_ASSET_URL}}/'
				},
				navigateFallback: '{{APP_SHELL_PATH}}',
				dontCacheBustUrlsMatching: /\.[a-z0-9]{7}\.[\w\.-]{2,5}$/, // any asset with hash sig doesn't need cache busted
				templateFilePath: path.resolve('./resource/sw.template'),
				verbose: false,
				minify: env.prod,
				runtimeCaching: [
					{
						urlPattern: '/api/*',
						handler: 'networkFirst',
						options: {
							cache: {
								maxEntries: 50,
								name: 'services'
							},
							origin: '{{ROCKET_SERVICE_ORIGIN}}'
						}
					},
					{
						urlPattern: '/isl/api/v1/dataservice/ResizeImage/*',
						handler: 'cacheFirst',
						options: {
							cache: {
								maxEntries: 100,
								name: 'images'
							},
							origin: '{{IMAGE_SERVICE_ORIGIN}}'
						}
					}
				]
			})
		];
	}
	return [];
};

exports.getDevPlugins = function(env) {
	if (!env.test && !env.prod) {
		return [
			new webpack.HotModuleReplacementPlugin(),
			new ProgressBarPlugin({ format: '  [:bar] :percent - :msg ' }),
			new StyleLintPlugin({
				configFile: '.stylelintrc.json',
				syntax: 'scss'
			})
		];
	}
	return [];
};

exports.getViewerPlugins = function(env, locale) {
	const includeViewer = utils.includeViewer(env);
	if (!env.test && includeViewer) {
		return [
			new webpack.DefinePlugin(utils.getClientEnvVars(env, ['WEBSITE_URL'])),
			new HtmlWebpackPlugin({
				chunksSortMode: 'dependency',
				title: 'Component Library',
				template: path.resolve('./resource/index.html.js'),
				filename: 'components.html',
				chunks: ['components', 'libs'].concat(env.static ? [] : ['manifest']),
				lang: locale,
				locales: process.env.CLIENT_LOCALES.split(','),
				charset: 'utf-8',
				inject: 'body'
			}),
			new HtmlWebpackPlugin({
				chunksSortMode: 'dependency',
				title: 'Components',
				template: path.resolve('./resource/index.html.js'),
				filename: 'components-iframe.html',
				chunks: ['componentsIFrame', 'libs'].concat(env.static ? [] : ['manifest']),
				lang: locale,
				locales: process.env.CLIENT_LOCALES.split(','),
				charset: 'utf-8',
				inject: 'body',
				/**
				 * Because the component viewer uses an iframe the react dev tools extension only presents the 'Component Library'
				 * nodes skipping all of the nodes from this 'Components' page. To allow access to both levels the below script
				 * joins them together.
				 */
				bodyScripts: [
					`<script>if (window.self !== window.top) { __REACT_DEVTOOLS_GLOBAL_HOOK__ = parent.__REACT_DEVTOOLS_GLOBAL_HOOK__; }</script>`
				]
			})
		];
	}
	return [];
};

exports.getMinimizers = function() {
	return [
		new TerserPlugin({
			exclude: /pageEntryTemplate\.ts$/,
			cache: true,
			parallel: true,
			terserOptions: {
				safari10: true,
				mangle: {
					reserved: getReservedNames()
				}
				// https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
			}
		})
	];
};

/**
 * We reserve all variable names of page entry templates as we use these names
 * to define the class / function which implements it (i.e. the react component).
 * If we don't then UglifyJS will mangle them so they're not accessible at
 * runtime in production builds.
 */
function getReservedNames() {
	return ['./src/shared/page/pageEntryTemplate.ts'].reduce((reserved, filePath) => {
		const contents = fs.readFileSync(path.resolve(filePath), 'utf8');
		const REGEX = /^export\s+const\s([A-Z0-9_$][\w\$]+)\s=/gm;
		let match = REGEX.exec(contents);
		while (match) {
			reserved.push(match[1]);
			match = REGEX.exec(contents);
		}
		return reserved;
	}, []);
}

function getIndexTemplate(platform) {
	switch (platform) {
		case 'tv_samsung':
			return './resource/ref/tv/index.html.tizen.js';
		case 'tv_lg_webos':
			return './resource/ref/tv/index.html.webos.js';
		case 'tv_xboxone':
			return './resource/ref/tv/index.html.xbox.js';
		case 'tv_generic':
			return './resource/ref/tv/index.html.js';
		default:
			return './resource/index.html.js';
	}
}
