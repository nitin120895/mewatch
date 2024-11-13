import * as fs from 'fs';
import * as url from 'url';
import * as path from 'path';
import * as crypto from 'crypto';
import * as log from './logger';
import * as parseurl from 'parseurl';
import * as pageKey from 'shared/page/pageKey';
import { isRestrictedPage } from 'shared/page/pageRestrictions';
import { findPageSummary } from 'shared/page/sitemapLookup';
import { getSavedLanguagePreference } from 'shared/app/localeUtil';

import {
	Home,
	Category,
	SubCategory,
	Search,
	Watch,
	itemDetailTemplate,
	listDetailTemplate
} from 'shared/page/pageTemplate';
import cspThirdPartyServices from './security/csp/thirdparty';
import settings from './settings';
import { validateURLPart, validateQuery } from '../shared/util/urls';
import { get } from '../shared/util/objects';
import { stringify } from 'querystring';

type WebpackAsset = {
	name: string;
	size: number;
};

type WebpackStats = {
	assetsByChunkName: {
		[name: string]: string[];
	};
	assets: WebpackAsset[];
	namedChunkGroups: {
		[name: string]: {
			assets: string[];
		};
	};
};

type AssetOptions = {
	inline?: boolean;
	external?: boolean;
	critical?: boolean;
};

type FileInfo = {
	[name: string]: AssetInfo[];
};

type InjectInfo = {
	meta?: string[];
	styles?: string[];
	links?: string[];
	bodyScripts?: string[];
};

type AssetInfo = {
	isCss?: boolean;
	name: string;
	data?: string;
	type?: string;
};

type LinkInfo = {
	rel: string;
	type: string;
	href: string;
	sizes: string;
};

const htmlDefaults: { [key: string]: InjectInfo } = {};
const fileInfoMap: { [key: string]: FileInfo } = {};
const stringBundle = {
	[settings.defaultLocale]: loadJson(`strings-${settings.defaultLocale}.json`, settings.stringDir) || {}
};

export function bestLanguage(req) {
	const lang = getSavedLanguagePreference(req);
	return lang || (req && req.acceptsLanguages(settings.languages)) || settings.defaultLanguage;
}

export function getString(key, locale) {
	const bundle = getStringBundle(locale);
	return bundle[key] || key;
}

export function getHtmlDefaults(type = 'window'): InjectInfo {
	if (htmlDefaults[type]) return htmlDefaults[type];
	const fileInfo = getFileInfo(type);
	return (htmlDefaults[type] = renderHtmlDefaults(fileInfo));
}

export function renderHtmlDefaults(fileInfo: FileInfo): InjectInfo {
	const meta = [
		renderMeta({ name: 'mobile-web-app-capable', content: 'yes' }),
		renderMeta({ name: 'apple-mobile-web-app-capable', content: 'yes' }),
		renderMeta({ name: 'theme-color', content: settings.themeColor })
	];

	const preconnects = fileInfo.preconnects.map(info => renderPreLink(info, 'preconnect'));
	const dnsPrefetches = fileInfo.dnsPrefetches.map(info => renderPreLink(info, 'dns-prefetch'));
	const preloads = fileInfo.preloads.map(info => renderPreLink(info, 'preload'));

	// Note that `prefetches` were also tested for loading route chunks but double
	// downloads were often occuring when that same chunk was requested in the first page,
	// so their usage is parked for now.
	const links = preconnects.concat(dnsPrefetches, preloads);

	links.push(
		renderLink({
			rel: 'icon',
			type: 'image/png',
			href: '/favicon.png?v3',
			sizes: '32x32'
		})
	);

	links.push(
		renderLink({
			rel: 'icon',
			type: 'image/png',
			href: '/favicon-192.png?v3',
			sizes: '192x192'
		})
	);

	links.push(
		renderLink({
			rel: 'apple-touch-icon',
			type: 'image/png',
			href: 'images/icons/icon-ios.png',
			sizes: '192x192'
		})
	);

	links.push(
		renderLink({
			rel: 'apple-touch-icon-precomposed',
			type: 'image/png',
			href: 'images/icons/icon-ios.png',
			sizes: '192x192'
		})
	);

	// MEDTOG-21165: Removing link to manifest to disable install PWA button until feature is fully ready
	// if (settings.manifestFilename) {
	// 	// We'll always serve the manifest from Slingshot as its
	// 	// `start_url` is based off the domain it's served from
	// 	links.push(`<link rel="manifest" href="/${settings.manifestFilename}" />`);
	// }

	const styles: string[] = [];
	const bodyScripts: string[] = [];
	fileInfo.app.forEach(asset => {
		if (asset.isCss) styles.push(renderStyle(asset));
		else bodyScripts.push(renderScript(asset));
	});
	fileInfo.axis.forEach(asset => {
		if (asset.isCss) styles.push(renderStyle(asset));
		else bodyScripts.push(renderScript(asset));
	});

	if (settings.featureServiceWorker) {
		bodyScripts.push(renderScript(fileInfo.sw[0]));
	}

	return {
		meta,
		links,
		styles,
		bodyScripts
	};
}

export function getFileInfo(scope = 'window'): FileInfo {
	if (fileInfoMap[scope]) return fileInfoMap[scope];

	const stats = getStats();
	const info: FileInfo = {
		preloads: [],
		preconnects: []
	};

	// get asset information for all the produced chunks
	if (_DEV_) {
		info.app = [{ name: 'app.js' }];
		info.axis = [];
	} else {
		Object.keys(stats.namedChunkGroups).forEach(chunkName => {
			const group = stats.namedChunkGroups[chunkName];
			const infos = group.assets.map(assetName => getAssetInfo(stats, chunkName, assetName));
			info[chunkName] = infos;
		});
	}

	info.sw = [getSwJs()];

	// provide environment first
	info.app.unshift(getClientEnvVars(scope));

	// extra links
	info.preloads = getPreloadInfo(info);
	info.preconnects = getPreconnectInfo(info);
	info.dnsPrefetches = getDnsPrefetchInfo();

	return (fileInfoMap[scope] = info);
}

function getOptions(chunk: string, name: string): AssetOptions {
	if (chunk === 'app' || chunk === 'axis') {
		if (name.startsWith('manifest') || name.endsWith('.css')) {
			return { critical: true, inline: true };
		}
		return { critical: true };
	}
	return { external: true };
}

function getAssetInfo(stats: WebpackStats, chunk: string, name: string): AssetInfo {
	if (_DEV_) return { name };

	const opt = getOptions(chunk, name);

	const asset = stats.assets.find(asset => asset.name === name);
	if (!asset) {
		if (opt.critical) {
			log.warn(`Failed to find critical asset ${name}`);
		}
		return { name };
	}

	let contents = loadFile(name);
	if (contents.indexOf('{{CLIENT_ASSET_URL}}') > 0) {
		contents = replaceAssetUrl(loadFile(name));
		saveFile(name, contents);
	}

	return {
		name,
		data: !opt.external && (opt.inline || asset.size <= settings.maxInlineSize) ? contents : undefined,
		isCss: name.endsWith('.css')
	};
}

export function getStats(): WebpackStats {
	if (_DEV_) return undefined;
	else return loadJson('stats.json') || {};
}

export function getStringBundle(locale) {
	if (stringBundle[locale]) return stringBundle[locale];

	const bundleStr = loadJson(`strings-${locale}.json`, settings.stringDir);
	stringBundle[locale] = bundleStr ? bundleStr : stringBundle[settings.defaultLocale];
	return stringBundle[locale];
}

export function getIntlProps(locale) {
	return {
		locale: locale,
		messages: getStringBundle(locale)
	};
}

export function loadJson(name, base?) {
	const contents = loadFile(name, base);
	return contents ? JSON.parse(contents) : undefined;
}

export function loadFile(name, base?) {
	base = base || settings.pubDir;
	try {
		const filePath = path.resolve(base, name);
		return fs.readFileSync(filePath, 'utf8');
	} catch (e) {
		return undefined;
	}
}

export function saveFile(name, contents, base?) {
	base = base || settings.pubDir;
	const filePath = path.resolve(base, name);
	fs.writeFileSync(filePath, contents, 'utf8');
}

/**
 * Preload our main JavaScript bundles as this will reduce the time
 * between server render and when JavaScript takes control of the page.
 *
 * Also preload any assets defined via the PRELOAD_ASSET variable.
 */
function getPreloadInfo(info: FileInfo): AssetInfo[] {
	if (_DEV_) return [];

	const preloads = {};
	info.app.forEach(asset => {
		if (asset.name && !asset.isCss && !asset.name.startsWith('manifest')) {
			preloads[asset.name] = 'script';
		}
	});
	info.axis.forEach(asset => {
		if (asset.name && !asset.isCss) {
			preloads[asset.name] = 'script';
		}
	});

	(process.env.PRELOAD_ASSET || '').split(',').reduce((preloads, entry) => {
		entry = entry.trim();
		const i = entry.indexOf(':');
		if (~i) {
			const type = entry.slice(0, i);
			const name = entry.slice(i + 1);
			if (type && name) {
				preloads[name] = type;
			}
		}
		return preloads;
	}, preloads);

	return Object.keys(preloads).map(name => ({ name, type: preloads[name] }));
}

/**
 * Preconnect to our service CDN and static asset domains.
 */
function getPreconnectInfo(info: FileInfo): AssetInfo[] {
	if (_DEV_) return [];
	const preconnect = info.preloads
		.map(pre => pre.name)
		.concat([settings.clientAssetUrl, settings.rocketCdn.href])
		.reduce((preconnect, name) => {
			const parsed = url.parse(name);
			if (parsed.hostname) preconnect[parsed.hostname] = true;
			return preconnect;
		}, {});

	return Object.keys(preconnect).map(name => ({ name }));
}

/**
 * For any CSP thrid party, we'll look to establish early DNS negotiation.
 */
function getDnsPrefetchInfo(): AssetInfo[] {
	if (_DEV_) return [];

	const data = (cspThirdPartyServices || []).reduce((data: any, func: any) => func(data) || data, {});

	const prefetch = Object.keys(data).reduce((prefetch, key) => {
		const value = data[key];
		if (key.endsWith('Src') && Array.isArray(value)) {
			prefetch = value.reduce((acc, res) => {
				const hostname = qualifiedUrl(res) ? url.parse(res).hostname : res;
				if (hostname) prefetch[hostname] = true;
				return prefetch;
			}, prefetch);
		}
		return prefetch;
	}, {});

	return Object.keys(prefetch).map(name => ({ name }));
}

export function renderStyle(info: AssetInfo, opt: any = {}) {
	if (!info) return '';
	else if (info.data && !opt.external) return `<style>${info.data}</style>`;
	else if (info.name)
		return `<link rel="stylesheet" href="${settings.clientAssetUrl}/${info.name}" media="screen" nonce="_">`;
	else return '';
}

export function renderScript(info: AssetInfo) {
	if (!info) return '';
	if (info.data) return `<script>${info.data}</script>`;
	if (info.name) {
		const src = qualifiedUrl(info.name) ? info.name : `${settings.clientAssetUrl}/${info.name}`;
		return `<script src="${src}" nonce="_"></script>`;
	}
	return '';
}

export function renderLink(info: LinkInfo) {
	const atts = Object.keys(info).map(key => {
		let value = info[key];
		if ((key === 'src' || key === 'href') && !value.startsWith('http')) {
			if (value.startsWith('/')) value = value.slice(1);
			value = `${settings.clientAssetUrl}/${value}`;
		}
		return `${key}="${value}"`;
	});
	return `<link ${atts.join(' ')} />`;
}

export function renderMeta(info) {
	const atts = Object.keys(info).map(key => `${key}="${info[key]}"`);
	return `<meta ${atts.join(' ')} />`;
}

export function renderPreLink(info: AssetInfo, rel: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch') {
	if (!info || !info.name) return '';
	if (rel === 'preconnect' || rel === 'dns-prefetch') {
		return `<link rel="${rel}" href="//${info.name}">`;
	}
	const href = qualifiedUrl(info.name) ? info.name : `${settings.clientAssetUrl}/${info.name}`;
	const type = info.type || (info.name.endsWith('.js') ? 'script' : '');
	const as = type ? ` as="${type}"` : '';
	return `<link rel="${rel}" href="${href}"${as} nonce="_">`;
}

/**
 * Env variables used for client configuration, e.g. service url, we want to pass
 * in dynamically and not when we compile the app. This allows us to easily
 * promote a single build through environments e.g. test -> staging -> production.
 *
 * We search here for any variable starting with 'CLIENT_' and embed that in the page
 * under process.env.<CLIENT_VAR>.
 */
const CLIENT_ENV_EXCLUDE_LIST = [
	'CLIENT_MC_SSO_SECRET_KEY',
	'CLIENT_MC_SSO_CLIENT_ID',
	'CLIENT_WEBVIEW_SSO_TOKEN_ENC_KEY',
	'CLIENT_WEBVIEW_SSO_TOKEN_ENC_IV'
];
function getClientEnvVars(scope: string): AssetInfo {
	const vars = Object.keys(process.env)
		.filter(name => name.startsWith('CLIENT_') && !CLIENT_ENV_EXCLUDE_LIST.includes(name))
		.reduce((vars, name) => {
			vars.push(`env.${name}='${process.env[name]}'`);
			return vars;
		}, []);

	const name = undefined; // inline
	if (vars.length) {
		const data = `(function(w){var p=w.process=w.process||{};var env=p.env=p.env||{};${vars.join(';')}}(${scope}))`;
		return { name, data };
	} else {
		return { name, data: '' };
	}
}

/**
 * Guess chunk needed for the requested route
 */
function getChunkName(pageSummary: api.PageSummary) {
	const { template, key } = pageSummary;

	if (template === Home || template === Category || template === SubCategory) return 'category';
	if (itemDetailTemplate[template]) return 'item';
	if (listDetailTemplate[template]) return 'list';
	if (template === Search) return 'search';
	if (template === Watch) return 'watch';
	if (key === pageKey.Register) return 'register';
	if (/profile/i.test(key)) return 'profile';
	if (/account/i.test(key)) return 'account';
	return 'category';
}

export function getDynamicHeaderLinks(store: Redux.Store<state.Root>): InjectInfo {
	if (!store) return {};
	const { page } = store.getState();
	if (!page || !page.history || !page.history.pageSummary) return {};

	const info = getFileInfo();
	const chunkName = getChunkName(page.history.pageSummary);
	const chunk = info[chunkName];
	if (!chunk) return {};

	const links: string[] = [];
	const styles: string[] = [];
	chunk.forEach(asset => {
		if (asset.isCss) styles.push(renderStyle(asset, { external: true }));
		else links.push(renderPreLink(asset, 'preload'));
	});

	// If the request is not targeting one of these common
	// page templates then we'll mark them for prefetch in the
	// likelihood the user will navigate to one later
	if (chunkName !== 'item') {
		const itemChunk = info.item || [];
		itemChunk.forEach(asset => links.push(renderPreLink(asset, 'prefetch')));
	}
	if (chunkName !== 'category') {
		const catChunk = info.category || [];
		catChunk.forEach(asset => links.push(renderPreLink(asset, 'prefetch')));
	}

	return { links, styles };
}

export function etagMatch(req, res) {
	const reqEtag = req.get('if-none-match');
	const resEtag = res.get('etag');
	if (reqEtag && reqEtag === resEtag) {
		res.writeHead(304);
		res.end();
		return true;
	}
	return false;
}

export function genHash(result: string) {
	return crypto
		.createHash('md5')
		.update(result)
		.digest('hex');
}

export function getKey(req): string {
	if (req._cacheKey) return req._cacheKey;

	const filters = getContentFilters(req);
	const parts = [settings.version, req.url];
	const host = req.headers['host'];

	if (host) {
		parts.push(host);
	}

	if (filters) {
		if (filters.sub) parts.push(`s=${filters.sub}`);
		if (filters.device) parts.push(`d=${filters.device}`);
		if (filters.maxRating) parts.push(`m=${filters.maxRating}`);
	}

	const lang = getSavedLanguagePreference(req);

	if (lang) parts.push(lang);

	const raw = parts.join(',');
	const key = genHash(raw);
	req._cacheKey = key;
	return key;
}

export function isKeepAlive(request: Request): boolean {
	const req: any = request;
	if (req._keepAlive !== undefined) {
		return req._keepAlive;
	}
	if (req.headers && req.headers.connection) {
		req._keepAlive = /keep-alive/i.test(this.headers.connection);
	} else {
		req._keepAlive = this.httpVersion === '1.0';
	}
	return req._keepAlive;
}

export function addHtmlHeaders(res) {
	res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
	res.setHeader('Expires', '0');
	res.setHeader('Content-Type', 'text/html;charset=UTF-8');
	res.setHeader('X-Content-Type-Options', 'nosniff');

	addCORSHeaders(res);

	// MEDTOG-21026 Security team advised to remove this
	// res.setHeader('X-Xss-Protection', '1; mode=block');
}

export function addSecurityHeaders(res) {
	const strictTransportSecurityMaxAge = parseInt(process.env.STRICT_TRANSPORT_SECURITY_MAX_AGE, 10);

	if (Number.isInteger(strictTransportSecurityMaxAge) && strictTransportSecurityMaxAge > -1) {
		res.setHeader('Strict-Transport-Security', `max-age=${strictTransportSecurityMaxAge}`);
	}
}

export function addCORSHeaders(res) {
	if (process.env.CORS_HEADERS) {
		res.setHeader('Access-Control-Allow-Origin', process.env.CORS_HEADERS);
	}
}

export function getContentFilters(req): state.ContentFilters {
	if (req._contentFilters) return req._contentFilters;

	const key = getContentFilterKey(req);
	if (!req.cookies || !req.cookies[key]) return undefined;

	const filtersRaw = req.cookies[key];
	const parts = filtersRaw.split(',');
	const filters = parts.reduce((filters, p) => {
		const kvp = p.split(':');
		switch (kvp[0]) {
			case 's':
				filters.sub = kvp[1];
				break;
			case 'm':
				filters.maxRating = kvp[1];
				break;
			case 'd':
				filters.device = kvp[1];
				break;
			case 'a':
				filters.accountSegments = (kvp[1] || '').split('|');
				break;
			case 'p':
				filters.profileSegments = (kvp[1] || '').split('|');
				break;
		}
		return filters;
	}, {});

	if (!filters.device) filters.device = process.env.CLIENT_DEVICE_PLATFORM;

	const segments = (filters.accountSegments || []).concat(filters.profileSegments || []);
	filters.segments = Array.from(new Set(segments)).sort();
	req._contentFilters = filters;
	return filters;
}

function getSwJs(): AssetInfo {
	return {
		name: undefined, // inline
		data: `if ('serviceWorker' in navigator) window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js') });`
	};
}

function getContentFilterKey(req) {
	if (req._cfKey) return req._cfKey;

	const host = req.headers['host'] || 'www.domain.com';
	const parts = host.split('.');
	const subdomain = parts.length > 2 ? parts[0] : 'www';
	const key = subdomain === 'www' ? 'cf' : `${subdomain}-cf`;
	req._cfKey = key;
	return key;
}

export function replaceAssetUrl(str: string): string {
	return str.replace(/{{CLIENT_ASSET_URL}}/g, settings.clientAssetUrl);
}

function qualifiedUrl(href) {
	return (!!href && href.startsWith('http')) || href.startsWith('//');
}

/**
 * Check to see if a location is restricted by an authentication wall or
 * needs to be fully rendered by client.
 *
 * Watch page needs the correct sequence of dispatched actions in order to work.
 * We need to check the media type against the current user in order to display
 * the right flow. Hence, it requires a full client render.
 *
 * @param location history location
 * @param store redux store
 */
export function requiresFullClientRender(location: HistoryLocation, store: Redux.Store<state.Root>): boolean {
	const page = findPageSummary(location.pathname, store.getState());
	return isRestrictedPage(page, location);
}

export function getRequestLocation(req): HistoryLocation {
	const parsed = parseurl(req);

	return {
		pathname: validateURLPart(parsed.pathname) || '/',
		search: validateURLPart(parsed.search),
		query: validateQuery(req.query) || {},
		state: undefined,
		action: 'POP',
		index: 1,
		key: ''
	};
}

/**
 * First use the Express inbuilt accepts check to verify html response
 * is accepted, and then also look at the extension to try and
 * verify it's not an asset request. This can happen when the
 * browser sends a liberal accepts header.
 *
 * That's about as accurate as we can get to avoid serving the
 * html page for requests for assets which aren't found.
 *
 * See https://expressjs.com/en/api.html#req.accepts
 */
export function shouldServeHtml(req) {
	if (!req.accepts('html')) return false;

	const match = (req.path || '').toLowerCase().match(/\.\w+$/);
	if (!match || match[0] === '.html') return true;
	return SUPPORTED_MIME_EXTENSIONS.indexOf(match[0]) === -1;
}

const SUPPORTED_MIME_EXTENSIONS = [
	'.jpg',
	'.jpeg',
	'.png',
	'.webp',
	'.bmp',
	'.gif',
	'.ico',
	'.js',
	'.json',
	'.xml',
	'.css',
	'.svg',
	'.ttf',
	'.otf',
	'.woff',
	'.woff2',
	'.eot',
	'.mp4',
	'.m4v',
	'.webm',
	'.ogg',
	'.mp3',
	'.wav',
	'.html'
];

export function parseArray(str, defaultValue) {
	const list = (str && str.split(',')) || defaultValue || [];
	return list.map(item => item.toString().trim());
}

interface RobotsText {
	[key: string]: string;
}

export function getRobotsBody(host: string | undefined = undefined) {
	try {
		const robotsEnvVar: RobotsText = process.env.ROBOTS_TXT;

		if (!robotsEnvVar) {
			return '';
		}
		const robots = JSON.parse(process.env.ROBOTS_TXT);

		if (robots[host]) {
			return robots[host];
		}

		const defaultRobotsKey = Object.keys(robots).shift();
		return robots[defaultRobotsKey];
	} catch (error) {
		log.error(error, "'Problem getting robots body'");
	}
}

export function getExternalResource(url, req, res) {
	if (!url) {
		return res.status(500).send();
	}

	fetch(url)
		.then(response => {
			if (response.ok) {
				const contentType = response.headers.get('content-type');
				addHtmlHeaders(res);
				contentType && res.setHeader('Content-Type', contentType);
				if (contentType === 'application/json') {
					return response.json();
				}
				return response.text();
			}
		})
		.then(response => {
			if (response) {
				return res.status(200).send(response);
			}
			return res.status(500).send();
		})
		.catch(error => log.error(error, `Problem fetching external URL ${url}`));
}

export function createQueryString(req): string {
	const queryObject = get(req, 'query');
	const queryString = queryObject ? stringify(queryObject) : '';
	return queryString ? `?${queryString}` : '';
}

let vanityPaths = {};
let getResourceTimer;

export function getRedirectPaths() {
	return { vanityPaths };
}

export function getRedirectURL(req, redirectEntry) {
	return redirectEntry.indexOf('://') > -1
		? redirectEntry
		: `${req.protocol}://${req.headers.host}${redirectEntry}${createQueryString(req)}`;
}

export function getRedirectResource() {
	const tableUrl = process.env.CLIENT_AIRTABLE_URL;
	const token = process.env.CLIENT_AIRTABLE_TOKEN;

	if (tableUrl && token) {
		fetch(tableUrl, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
			.then(response => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.json();
			})
			.then(data => {
				data &&
					data.records.forEach(entry => {
						const { From, To } = entry.fields;
						if (vanityPaths[From] !== To) vanityPaths[From] = To;
					});
				getResourceTimer = setTimeout(() => getRedirectResource(), 60 * 60 * 1000);
			})
			.catch(error => {
				console.error('Error fetching data from Airtable:', error);
			});
	}
}

export function clearResourceTimer() {
	getResourceTimer && clearTimeout(getResourceTimer);
}

export function isRequestComingFromAOlderSafariBrowser(source) {
	let shouldDisableNonceHeader = false;

	const isSafariRegex = /safari/i;
	const isChromeRegex = /chrome|crios/i;
	const safariVersionRegex = /(version|safari)\/([\d\w\.\-]+)/i;

	let isSafari = false;
	let safariVersion = '';
	if (isSafariRegex.test(source)) {
		isSafari = true;

		if (isChromeRegex.test(source)) {
			isSafari = false;
		}
		if (isSafari && safariVersionRegex.test(source)) {
			safariVersion = RegExp.$2;
		}
	}

	if (isSafari) {
		// MEDTOG - 23855 - In safari less than 15.6, adding nonce-header to script-src in CSP is throwing error
		// To avoid it, for Safari browsers les than 15.6 we just add unsafe-inline and disable nonceheader in CSP script-src

		const SAFARI_VERSION_THAT_SUPPORTS_NONCE_HEADER = '15.6.1';

		const targetVersionParts = SAFARI_VERSION_THAT_SUPPORTS_NONCE_HEADER.split('.').map(Number);
		const safariVersionParts = safariVersion.split('.').map(Number);

		for (let i = 0; i < safariVersionParts.length; i++) {
			let allEqual = true;
			for (let j = i - 1; j >= 0; j--) {
				if (safariVersionParts[j] !== targetVersionParts[j]) {
					allEqual = false;
				}
			}
			// Check for successive subversion only if earlier version matchs in the order -> Major -> Minor -> Patch
			if (safariVersionParts[i] < targetVersionParts[i] && allEqual === true) {
				shouldDisableNonceHeader = true;
				break;
			}
		}
	}

	return shouldDisableNonceHeader;
}
