'use strict';
const path = require('path');
const vars = require(path.resolve('./build/variables'));

exports.includeViewer = function(env) {
	return env.viewer || (env.dev && env.components);
};

exports.getClientEnvVars = function(env, whitelist = []) {
	// Any env vars prefixed with CLIENT_ or within `whitelist` we'll surface in the
	// static web app.
	// If not static we don't compile them in. Instead the server will feed them
	// in based on the deployed environment (e.g. test, staging, production).
	const clientEnvVars = Object.keys(process.env)
		.filter(
			name =>
				((env.static || env.dev || exports.includeViewer(env)) &&
					(name.startsWith('CLIENT_') || ~whitelist.indexOf(name))) ||
				name === 'NODE_ENV'
		)
		.reduce((vars, name) => {
			vars[`process.env.${name}`] = JSON.stringify(process.env[name]);
			return vars;
		}, {});
	clientEnvVars._DEV_ = env.dev;
	clientEnvVars._QA_ = env.qa;
	clientEnvVars._SSR_ = env.ssr;
	clientEnvVars._SERVER_ = false;
	clientEnvVars._BRAND_NAME_ = JSON.stringify(vars.brandName);

	clientEnvVars._TV_ = env.tv;

	if (env.tv) {
		clientEnvVars._FHD_ = process.env.RES !== 'RES_720p';
		clientEnvVars._DISCOVER_ = JSON.stringify(process.env.DISCOVER_URL);
		clientEnvVars._NO_CSS_TRANSITION_ = process.env.NO_CSS_TRANSITION === 'true';
	}

	return clientEnvVars;
};
