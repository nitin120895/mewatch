'use strict';
const path = require('path');

const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');
const MassModuleReplacementPlugin = require(path.resolve('./build/webpack/plugin/MassModuleReplacementPlugin'));
const DuplicatedModuleDetectionPlugin = require(path.resolve('./build/webpack/plugin/DuplicatedModuleDetectionPlugin'));
const utils = require(path.resolve('./build/webpack/common/utils'));
const vars = require(path.resolve('./build/variables'));
const getPlatformReplacements = require(path.resolve('./build/webpack/vendor/platform-replacements.js'));

/**
 * Create Webpack module replacements for each of the remapped modules.
 * Paths should be relative to `src/`.
 *
 * TypeScript mappings should be set in `tsconfig.json`, under `compilerOptions`:
 *
 *     "paths": {
 *         "ref/responsive/component/EntryTitle": ["myproject/responsive/component/EntryTitle"]
 *     }
 *
 * @param mappings	Provide non-TypeScript mappings, following format of the `paths` object
 */
function getModuleReplacements(mappings) {
	const map = utils.getModuleMappings(mappings);
	return [new MassModuleReplacementPlugin(map, { verify: false })];
}

/**
 * Create a NodeSass importer function
 *
 * @link: https://www.npmjs.com/package/node-sass#importer--v200---experimental
 *
 *
 * Few rules for the configuration:
 *  - Source and target paths should be relative to `src/`
 *  - Source should be normalized (without _ and .scss) ex: "ref/tv/style/modules" instead of ref/tv/style/_modules.scss
 *  - Target should be normalized too, but it is less important
 *
 * TypeScript mappings should be set in `tsconfig.json`, under `compilerOptions`:
 *
 *     "paths": {
 *         "ref/tv/style/modules": ["bbc/tv/style/modules"]
 *     }
 *
 * @param mappings
 * @returns {function(*=, *=, *): *}
 */
exports.getNodeSassModuleReplacementImporter = function(mappings) {
	const moduleMap = utils.getModuleMappings(mappings);
	const moduleMatch = Object.keys(moduleMap).reduce((result, source) => {
		if (source.indexOf('*') >= 0 || utils.matchExtension(source, ['scss'], true) || moduleMap[source].length !== 1) {
			return result;
		}

		const newPath = path.resolve('./src/', moduleMap[source][0]);
		const pattern = utils.pathEndsWithPatternForScss(source);

		result.push({ pattern, newPath });
		return result;
	}, []);

	return function nodeSassImporter(url, prev, done) {
		const fullURL = utils.isAbsolutePath(url) ? url : path.join(path.dirname(prev), url);
		const firstMatch = moduleMatch.find(x => fullURL.match(x.pattern));

		return firstMatch ? { file: firstMatch.newPath } : null;
	};
};

exports.resolve = function(env) {
	return {
		modules: [path.resolve('./src'), 'node_modules'],
		extensions: ['.ts', '.tsx', '.js', '.json'],
		alias: {
			resource: path.resolve('./resource'),
			'resource-string': path.resolve(vars.resources.stringsBase)
		}
	};
};

///

exports.getModulePlugins = function(env, config) {
	return [
		...getModuleReplacements(getPlatformReplacements(process.env.CLIENT_DEVICE_PLATFORM)),
		// Running TypeScript typer in parallel
		new ForkTsCheckerPlugin({
			tsconfig: path.resolve(`./build/ts/tsconfig.${config}${env.tv ? '.tv' : ''}.json`),
			compilerOptions: {
				noUnusedLocals: !!env.prod
			}
		}),
		new DuplicatedModuleDetectionPlugin()
	];
};
