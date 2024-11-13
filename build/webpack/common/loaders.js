'use strict';
const path = require('path');

const hmrTransformer = require('react-hot-ts/lib/transformer');
const vars = require(path.resolve('./build/variables'));
const modules = require(path.resolve('./build/webpack/common/modules'));

exports.tsLint = function() {
	return {
		test: /\.tsx?/,
		enforce: 'pre',
		loader: 'tslint-loader'
	};
};

exports.typeScript = function(env, config, hotLoader) {
	return {
		test: /\.tsx?$/,
		exclude: /node_modules/,
		use: [
			{
				loader: 'ts-loader',
				options: {
					configFile: path.resolve(`./build/ts/tsconfig.${config}${env.tv ? '.tv' : ''}.json`),
					transpileOnly: true,
					onlyCompileBundledFiles: true,
					compilerOptions: {
						isolatedModules: env.dev
					},
					getCustomTransformers: getCustomTransformers(env, config)
				}
			}
		]
	};
};

// Typescript AST transformers
function getCustomTransformers(env, config) {
	if (config !== 'client' && config !== 'viewer') return undefined;
	return () => ({
		before: [hmrTransformer()]
	});
}

exports.patchRouter = function() {
	return {
		test: /matchRoutes.js$/,
		loader: path.resolve('./build/webpack/patch/react-router-patch.js'),
		include: path.resolve('./node_modules/react-router/')
	};
};

exports.patchReactIntl = function() {
	return {
		test: /.+\.js$/,
		loader: path.resolve('./build/webpack/patch/locale-patch.js'),
		include: path.resolve('./node_modules/react-intl/locale-data/')
	};
};

exports.imageUrl = function(env, emitFile) {
	return {
		test: /\.(gif|jpe?g|png|svg)$/,
		loader: 'url-loader',
		options: {
			limit: 5000,
			name: `images/[name]${env.prod ? '.[hash:7]' : ''}.[ext]`,
			emitFile: emitFile
		},
		exclude: /node_modules/
	};
};

exports.fontFile = function(env, emitFile) {
	return {
		test: /\.(svg|eot|woff2?|ttf)$/,
		loader: 'file-loader',
		options: {
			limit: 5000,
			name: 'fonts/[name].[ext]',
			emitFile: emitFile
		},
		include: path.resolve(vars.resources.font)
	};
};

exports.css = function(env, postcssConfig) {
	const sourceMap = !env.prod;
	return {
		test: /\.(sa|sc|c)ss$/,
		exclude: /node_modules/,
		loaders: [
			{
				loader: 'css-loader',
				options: { sourceMap }
			},
			{
				loader: 'postcss-loader',
				options: {
					sourceMap,
					config: {
						path: postcssConfig
					}
				}
			},
			{
				loader: 'resolve-url-loader'
			},
			{
				loader: 'sass-loader',
				options: {
					// source maps are REQUIRED for resolve-url-loader to work.
					// These maps do not leak into prod code, it's all good.
					// https://github.com/bholloway/resolve-url-loader#source-maps-required
					sourceMap,
					includePaths: [path.resolve('./src')],
					importer: [modules.getNodeSassModuleReplacementImporter()]
				}
			}
		]
	};
};
