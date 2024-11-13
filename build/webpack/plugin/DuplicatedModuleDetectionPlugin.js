'use strict';

const path = require('path');

/**
 * Plugin for detecting duplicated module load
 *
 * The goal of this plugin is help to the Axis developer to find and eliminate
 * faster the problems which caused by loading the same react components two
 * times, once the customised component and once the reference version
 *
 * This plugin should added after NormalModuleReplacementPlugin-s
 *
 * Please check the default strategy:
 * @see DMDPOptionIncludes
 * @see DMDPOptionMatchPath
 */
class DuplicatedModuleDetectionPlugin {
	/**
	 *
	 * @param options
	 * @param {DMDP>OptionIncludes} [options.includes] - Checked modules.
	 * @param {DMDP>OptionMatchPath} [options.matchPath] - Module path comparator.
	 */
	constructor(options) {
		this.moduleMap = new Map();
		this.options = Object.assign({}, defaultOptions, options);

		this.afterResolve = this.afterResolve.bind(this);
		this.isDuplicatedModule = this.isDuplicatedModule.bind(this);
	}

	apply(compiler) {
		compiler.plugin('normal-module-factory', nmf => {
			nmf.plugin('after-resolve', this.afterResolve);
		});

		compiler.plugin('emit', (compilation, callback) => {
			this.formatErrors().map(error => compilation.errors.push(new Error(error)));
			callback();
		});
	}

	afterResolve(result, callback) {
		if (!result) return callback();

		const resPath = result.resource;
		if (this.options.includes(resPath)) {
			const basename = path.basename(resPath);

			if (!this.moduleMap.has(basename)) this.moduleMap.set(basename, new Set());

			const entry = this.moduleMap.get(basename);

			// collect duplicated modules
			if (!entry.has(resPath) && (entry.size === 0 || this.isDuplicatedModule(resPath, [...entry]))) {
				entry.add(resPath);
			}
		}

		return callback(null, result);
	}

	isDuplicatedModule(newPath, registeredPaths) {
		return registeredPaths.some(p => this.options.matchPath(p, newPath));
	}

	formatErrors() {
		return [...this.moduleMap].reduce((errors, [key, set]) => {
			if (set.size > 1) {
				const paths = [...set];
				errors.push(`Duplicated modules detected: ${[path.basename(paths[0]), ...paths.sort()].join('\n   ')}`);
			}
			return errors;
		}, []);
	}
}

///

const defaultIncludeRegexp = /\.(tsx|scss)$/i;
// normalize path by replace src/ref and other brand name (ex: src/acme) in the path
const defaultMatchPathRegExp = /(src[\/\\]).*?([\/\\])/i;

const defaultOptions = {
	/**
	 * Check module path and add to the duplication detection if the result is true
	 *
	 * by default include only TSX and SCSS modules if they not loaded from the viewer
	 *
	 * @callback DMDPOptionIncludes
	 * @param {string} path - Module path
	 * @return {boolean}
	 */
	includes: path => defaultIncludeRegexp.test(path),
	/**
	 * Compare two module paths
	 * If the to modules are equal then the function should return with true
	 *
	 * By default it normalize the path by replace src/ref and other brand name (ex: src/acme)
	 * then compare the paths so we assume when the developer copy the component s/he will
	 * use the same path under and only the brand name change (ex: ref, acme, etc)
	 *
	 * @callback DMDPOptionMatchPath
	 * @param {string} path1 - Module first path
	 * @param {string} path2 - Module second path
	 * @return {boolean}
	 */
	matchPath: (path1, path2) => path1.replace(defaultMatchPathRegExp, '') === path2.replace(defaultMatchPathRegExp, '')
};

///

module.exports = DuplicatedModuleDetectionPlugin;
