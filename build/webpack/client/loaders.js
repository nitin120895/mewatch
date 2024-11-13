'use strict';
const path = require('path');
const commonLoaders = require('../common/loaders');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

exports.getCSSLoader = function(env) {
	const cssLoader = commonLoaders.css(env, path.resolve('./build/webpack'));

	if (env.prod) {
		// use 'style-loader' in prod only as a fallback
		return {
			test: cssLoader.test,
			exclude: cssLoader.exclude,
			use: [
				{
					loader: MiniCssExtractPlugin.loader
				},
				...cssLoader.loaders
			]
		};
	} else {
		// add style-loader as first loader
		const styleLoader = {
			loader: 'style-loader',
			options: { sourceMap: true }
		};
		cssLoader.loaders.unshift(styleLoader);

		return cssLoader;
	}
};
