'use strict';
const path = require('path');

exports.assignNodeEnv = function(env) {
	if (!process.env.NODE_ENV) {
		if (env.prod) process.env.NODE_ENV = 'production';
		else process.env.NODE_ENV = 'development';
	}
};

exports.postProcessConfig = function(config, env, processors) {
	return (processors || []).reduce((prevConfig, fn) => fn(prevConfig, env), config);
};

exports.aliasPreact = function(config, env) {
	// Enzyme support for Preact not available yet
	// See https://github.com/developit/preact-compat/issues/82
	if (!process.env.FF_PREACT || env.test) return config;

	config.resolve.mainFields = ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'];
	config.resolve.alias = {
		react: 'preact-compat',
		'react-dom': 'preact-compat'
	};
	return config;
};

exports.usePrecompiledLibs = function(config, env) {
	if (env.dev) {
		addCompiledLib(config, 'redux', path.resolve('node_modules/redux/dist/redux.js'), true);

		// Haven't worked out how to alias the below libs *yet* due to 'requires' deep inside the modules.
		// e.g. require('react-intl/locale-data/en')
		// addCompiledLib(config, 'react', path.resolve('node_modules/react/dist/react-with-addons.js'), true);
		// addCompiledLib(config, 'react/addons', 'react');
		// addCompiledLib(config, 'core-js', path.resolve('node_modules/core-js/client/core.js'), true);
		// addCompiledLib(config, 'react-intl', path.resolve('node_modules/react-intl/dist/react-intl.js'), true);
	}
	return config;
};

function addCompiledLib(config, name, path, noParse) {
	if (!config.resolve) config.resolve = {};
	if (!config.resolve.alias) config.resolve.alias = {};
	if (!config.module) config.module = {};
	if (!config.module.noParse) config.module.noParse = [];

	config.resolve.alias[name] = path;

	if (noParse) {
		config.module.noParse.push(new RegExp(path));
	}
	return config;
}

exports.getModuleMappings = function(mappings) {
	if (mappings === undefined) mappings = {};
	const tsconfig = require(path.resolve('./tsconfig.json'));
	const paths = tsconfig.compilerOptions.paths || {};
	return Object.assign({}, paths, mappings);
};

exports.isAbsolutePath = function(url) {
	return !(url.startsWith('./') || url.startsWith('../'));
};

exports.escapeRegExp = function(str) {
	if (typeof str === 'string') return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
	return str;
};

const OS_INDEPENDENT_SEPARATOR_REG_EXP = '[\\/\\\\]';
exports.pathEndsWithPattern = function(path) {
	return (
		path
			.split(/\//g)
			.map(exports.escapeRegExp)
			.join(OS_INDEPENDENT_SEPARATOR_REG_EXP) + '$'
	);
};

exports.pathEndsWithPatternForScss = function(path) {
	const escapedPath = path.split(/\//g).map(exports.escapeRegExp);
	const dirPath = escapedPath.slice(0, -1);
	const fileName = escapedPath.slice(-1);

	// create variants for filename
	const needVariants = fileName && !/(^[*_]|\.scss$)/.test(fileName);
	const fileNameVariants = needVariants ? `(${fileName}|_${fileName}\.scss)` : '';

	return [...dirPath, fileNameVariants].join(OS_INDEPENDENT_SEPARATOR_REG_EXP) + '$';
};

exports.matchExtension = function(filePath, ext, matchEmpty = false) {
	const basename = path.basename(filePath);
	const extSeparatorIdx = basename.lastIndexOf('.');
	const extension = basename.substring(extSeparatorIdx);

	if (extSeparatorIdx === 0 || extension === '') {
		return matchEmpty;
	} else {
		return ext.includes(ext);
	}
};
