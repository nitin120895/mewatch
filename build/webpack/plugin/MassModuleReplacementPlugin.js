'use strict';

const path = require('path');
const fs = require('fs');
const isWin = process.platform === 'win32';

/**
 * Optimised NormalModuleReplacementPlugin for a large number of replacements
 *
 * Usage: `new MassModuleReplacementPlugin(map, options)`
 *
 * Where:
 *
 * - map: `{ "ref/component/Asset": ["brand/component/Asset"] }`
 * - [options]: `{ roots: ['ref', 'shared'], verify: false }`
 */
class MassModuleReplacementPlugin {
	constructor(map, options) {
		this.options = options || {};
		if (!this.options.roots) this.options.roots = ['ref', 'shared'];
		const verify = this.options.verify;
		const isSrcRooted = target => this.isSrcRooted(target, this.options.roots);

		function safeResolve(target) {
			if (!isSrcRooted(target)) {
				return target;
			}
			const resolved = path.resolve('./src/', target);
			if (!verify) {
				return resolved;
			}
			if (path.extname(resolved) === '') {
				if (fs.existsSync(`${resolved}.tsx`) || fs.existsSync(`${resolved}.ts`)) return resolved;
				throw `[MMRP] can not resolve module: ${target}`;
			} else {
				if (fs.existsSync(resolved)) return resolved;
				throw `[MMRP] can not resolve file: ${target}`;
			}
		}

		const resolvedMap = Object.keys(map).reduce((result, source) => {
			if (source.indexOf('*') >= 0 || map[source].length !== 1) {
				return result;
			}
			// resolve and validate absolute paths
			const replacePath = safeResolve(map[source][0]);
			let sourcePath = safeResolve(source);
			if (isWin) {
				// normalise Windows path separators
				sourcePath = sourcePath.replace(/\\/g, '/');
			}
			result[sourcePath] = replacePath;
			return result;
		}, {});

		this.mapping = resolvedMap;
	}

	/**
	 * Test whether `target` path starts with `../` or a src root like `ref`, `shared`
	 */
	isSrcRooted(target, roots) {
		const p = target.indexOf('/');
		if (p < 0) return false;
		const root = target.substr(0, p);
		return root === '..' || roots.includes(root);
	}

	apply(compiler) {
		const mapping = this.mapping;
		const verify = this.options.verify;
		const isSrcRooted = target => this.isSrcRooted(target, this.options.roots);

		function resolveRequest({ request, contextInfo }) {
			if (mapping[request]) {
				// import('axis-index')
				return request;
			}
			if (!contextInfo || !contextInfo.issuer) {
				return null;
			}

			const issuer = contextInfo.issuer;
			const ext = path.extname(issuer);
			if (ext === '.tsx' || ext === '.ts') {
				// from './Foo'
				// from '../../Foo'
				if (request.charAt(0) === '.') {
					const dir = path.dirname(issuer);
					const resolved = path.resolve(dir, request);
					return resolved;
				}
				// from 'react'
				// from 'ref/x/y/Z'
				if (isSrcRooted(request)) {
					const resolved = path.resolve('./src', request);
					return resolved;
				}
			}
			return null;
		}

		compiler.hooks.contextModuleFactory.tap('MassModuleReplacementPlugin', cmf => {
			cmf.hooks.beforeResolve.tap('MassModuleReplacementPlugin', request => {
				const replacePath = mapping[request.request];
				if (replacePath) {
					if (verify) {
						const src = path.resolve('./src');
						console.log('[MMRP]', request, '->', path.relative(src, replacePath));
					}
					request.request = replacePath;
				}
			});
		});

		compiler.hooks.normalModuleFactory.tap('MassModuleReplacementPlugin', nmf => {
			nmf.hooks.beforeResolve.tap('MassModuleReplacementPlugin', request => {
				let sourcePath = resolveRequest(request);
				if (isWin && !!sourcePath) {
					// normalise Windows path separators
					sourcePath = sourcePath.replace(/\\/g, '/');
				}
				const replacePath = !!sourcePath && mapping[sourcePath];
				if (replacePath) {
					if (verify) {
						const src = path.resolve('./src');
						const source = sourcePath === request.request ? sourcePath : path.relative(src, sourcePath);
						console.log('[MMRP]', source, '->', path.relative(src, replacePath));
					}
					request.request = replacePath;
				}
			});
		});
	}
}

module.exports = MassModuleReplacementPlugin;
