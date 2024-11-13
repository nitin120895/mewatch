import * as Redux from 'redux';
import { SignIn as signinPageKey, Account as accountPageKey, Register as registerPageKey } from 'shared/page/pageKey';
/**
 * Used by react router when it's traversing the route tree looking
 * for the correct route given the current location.
 *
 * For each checked route we take the route's page template and
 * determine all possible sitemap entries that use that template
 * we then get the current location and attempt to find if one of
 * these entries paths is a match, if so we return its path. React router
 * should then match it and render the correct component tree.
 *
 * If no match is found we return an empty string and react router
 * will continue its search.
 */

export const PAGE_404: api.PageSummary = {
	id: '404page',
	title: 'Page Not Found',
	path: '/__404__',
	template: '404',
	isSystemPage: true,
	isStatic: true
};

/**
 * Resolve a page path via a template or key value.
 *
 * @param templateOrKey If the value is prefixed with an '@' then it is assumed to be a page key rather than a template.
 * @param store The application store.
 */
export const resolvePath = (templateOrKey: string, store: Redux.Store<state.Root>) => (route, loc: HistoryLocation) => {
	const state: state.Root = store.getState();
	if (templateOrKey.startsWith('@')) {
		return getPathByKey(templateOrKey.substr(1), state.app.config) || '';
	}
	const sitemapByTemplate = getSitemapByPageTemplate(state);
	const entries = sitemapByTemplate[templateOrKey];
	if (entries && entries.length) {
		const entry = entries.find(entry => !!getEntryPath(entry, loc.pathname));
		if (entry) return entry.path;
	}
	return '';
};

function getEntryPath(entry: api.PageSummary, path: string): string {
	if (!entry.path || !path) return '';

	if (entry.pattern) {
		if (!entry.regex) entry = createPathRegex(entry);
		if (entry.regex.test(path)) {
			return entry.path;
		}
	} else if (entry.path.toLowerCase() === path.toLowerCase()) {
		return entry.path;
	}
	return '';
}

function getSitemapByPageTemplate(state: state.Root) {
	let sitemapByTemplate = state.app.config.sitemapByTemplate;
	if (!sitemapByTemplate) {
		sitemapByTemplate = groupSitemapByTemplate(state.app.config.sitemap);
		// cache for later usage but avoid making it enumerable
		// so we don't ever json serialize it
		Object.defineProperty(state.app.config, 'sitemapByTemplate', {
			value: sitemapByTemplate,
			enumerable: false,
			configurable: true,
			writable: true
		});
	}
	return sitemapByTemplate;
}

function getSitemapByPageKey(config: state.Config) {
	let sitemapByKey = config.sitemapByKey;
	if (!sitemapByKey) {
		sitemapByKey = mapSitemapEntriesToPageKey(config.sitemap);
		// cache for later usage but avoid making it enumerable
		// so we don't ever json serialize it
		Object.defineProperty(config, 'sitemapByKey', {
			value: sitemapByKey,
			enumerable: false,
			configurable: true,
			writable: true
		});
	}
	return sitemapByKey;
}

/**
 * Group sitemap entries by template.
 *
 * During routing we need fast lookup of entries based on their template type.
 */
function groupSitemapByTemplate(sitemap: api.PageSummary[]) {
	return sitemap.reduce(
		(groups, entry) => {
			const group = groups[entry.template] || [];
			group.push(entry);
			groups[entry.template] = group;
			return groups;
		},
		<{ [key: string]: api.PageSummary[] }>{}
	);
}

/**
 * Formulate a map of page keys to sitemap entries.
 *
 * Any page without a key is skipped.
 *
 * All page keys are lowercased to normalize casing.
 *
 * When statically linking to pages we should use the
 * page key to lookup the path instead of hard coding
 * paths. We do this as paths are configurable via
 * Presentation Manager so are open to change.
 */
function mapSitemapEntriesToPageKey(sitemap: api.PageSummary[]) {
	return sitemap.reduce(
		(groups, entry) => {
			if (entry.key) groups[entry.key.toLowerCase()] = entry;
			return groups;
		},
		<{ [key: string]: api.PageSummary }>{}
	);
}

function createPathRegex(entry) {
	const value = new RegExp(`${entry.pattern}`, 'im');
	// ensure the value is not enumerable so we can still serialize state
	Object.defineProperty(entry, 'regex', {
		value,
		enumerable: false,
		configurable: true,
		writable: true
	});
	return entry;
}

/**
 * Search the sitemap for a page summary with the given path.
 *
 * If none is found then the 404 page summary will be returned.
 */
export function findPageSummary(path: string, state: state.Root): api.PageSummary {
	return state.app.config.sitemap.find(entry => !!getEntryPath(entry, path)) || PAGE_404;
}

export function findPageSummaryByPath(path: string, config: state.Config): api.PageSummary {
	return config.sitemap.find(entry => !!getEntryPath(entry, path)) || PAGE_404;
}

/**
 * Find the page summary with the given key.
 *
 * If none is found then the 404 page summary will be returned.
 */
export function findPageSummaryByKey(key = '', config: state.Config): api.PageSummary {
	const sitemapByKey = getSitemapByPageKey(config) || {};
	return sitemapByKey[key.toLowerCase()];
}

/**
 * Given a page key, find the page summary in the sitemap and return its path.
 *
 * If no page is found then `undefined` is returned.
 *
 * @param key page key of page entry to find the path for
 * @param config config containing sitemap to lookup
 */
export function getPathByKey(key: string, config: state.Config): string {
	const page = findPageSummaryByKey(key, config);
	return page ? page.path : undefined;
}

export function getSignInPath(config): string {
	return getPathByKey(signinPageKey, config).slice(1);
}

export function getRegisterPath(config): string {
	return getPathByKey(registerPageKey, config).slice(1);
}

export function getAccountPath(config): string {
	return getPathByKey(accountPageKey, config).slice(1);
}
