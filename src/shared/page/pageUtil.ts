import { browserHistory } from 'shared/util/browserHistory';
import { GetPageOptions } from '../service/app';
import { get, isEmptyObject } from 'shared/util/objects';
import { setItem, getItem, removeItem } from '../util/localStorage';
import {
	ChannelDetail as ChannelDetailTemplate,
	SportsEvent as SportsEventTemplate,
	Watch as WatchTemplate,
	Subscription as SubscriptionTemplate
} from 'shared/page/pageTemplate';
import { AccountProfileCW, AnonymousCW, ESearch } from 'shared/page/pageKey';
import { isAnonymousUser } from '../account/sessionWorkflow';
import { findPageSummaryByPath, getPathByKey } from './sitemapLookup';
import { isUnsupportedBrowser } from 'shared/util/browser';

const PageKey = require('./pageKey');

const AUTH_PAGES = [PageKey.SignIn, PageKey.Register, PageKey.ResetPassword];

/**
 * This value should target the number of list entries that can be
 * rendered on screen from the top of a page. The aim is to populate
 * enough rows to present the user with a full screen of content in
 * a single request of a Page.
 *
 * Content below the fold can then be loaded as a secondary step.
 */
const MAX_LIST_PREFETCH = 3;
const ESEARCH_MAX_LIST_PREFETCH = 10;

/**
 * Paging size for item lists.
 */
const LIST_PAGE_SIZE = 24;
const SPORTS_LIST_SIZE = 72;
const CHANNELS_LIST_SIZE = 35;
export const WATCHED_LIST_PAGE_SIZE = 50;

/**
 * The id of a temporary page we may create as a
 * placeholder while the real page loads in.
 */
export const PLACEHOLDER_PAGE_ID = 'placeholder';

export const NULL_PAGE: api.Page = {
	id: 'null-page',
	title: '',
	path: '',
	template: '',
	isSystemPage: true,
	isStatic: true,
	entries: []
};

export const isCWPage = (key: string) => key === AnonymousCW || key === AccountProfileCW;

export function getPageRequestData(
	state: state.Root,
	location: HistoryLocation,
	pageSummary: api.PageSummary,
	itemAudioLanguage?: GetPageOptions['itemAudioLanguage']
): any {
	const itemSummary = getCachedTvItem(state, location, pageSummary);
	const tempPage = createTempPage(state, pageSummary, itemSummary);
	const options = getPageRequestOptions(state, pageSummary, itemSummary, itemAudioLanguage);
	return {
		tempPage,
		options
	};
}

function getPageRequestOptions(
	state: state.Root,
	pageSummary: api.PageSummary,
	itemSummary: api.ItemSummary,
	itemAudioLanguage?: GetPageOptions['itemAudioLanguage']
): GetPageOptions {
	const LIST_PREFETCH_CONFIG = {
		[ESearch]: ESEARCH_MAX_LIST_PREFETCH,
		default: MAX_LIST_PREFETCH
	};

	const pageOptions: GetPageOptions = {
		textEntryFormat: 'html',
		listPageSize: getListPageSize(pageSummary),
		maxListPrefetch: LIST_PREFETCH_CONFIG[pageSummary.key] || LIST_PREFETCH_CONFIG.default,
		itemDetailExpand: getExpandOption(state, pageSummary, itemSummary),
		itemDetailSelectSeason: getSelectOptions(pageSummary),
		itemAudioLanguage: itemAudioLanguage
	};

	if (isAnonymousUser(state)) {
		pageOptions.sub = 'Anonymous';
	}

	return pageOptions;
}

function getListPageSize(pageSummary: api.PageSummary) {
	if (pageSummary.template === SportsEventTemplate) return SPORTS_LIST_SIZE;
	if (pageSummary.template === ChannelDetailTemplate) return CHANNELS_LIST_SIZE;
	return LIST_PAGE_SIZE;
}

function getExpandOption(state: state.Root, pageSummary: api.PageSummary, itemSummary: api.ItemSummary): any {
	// we need to get all data for item we are going to watch, included season and show information for episodes
	// BE is going to add one more option to prevent too much data loading, we will use it asap
	if (pageSummary.template === WatchTemplate || pageSummary.key === PageKey.ShowDetailFeatured) return 'all';

	if (!itemSummary) return undefined;
	if (!itemSummary.showId) return 'all';

	const cache = state.cache.itemDetail;
	switch (pageSummary.key) {
		case PageKey.SeasonDetail:
			if (!cache[itemSummary.id]) return 'all';
			if (!itemSummary.seasonId || !cache[itemSummary.seasonId]) return 'all';
			return undefined;
		case PageKey.EpisodeDetail:
			if (!itemSummary.seasonId || !cache[itemSummary.seasonId]) return 'all'; // 'parent'
	}
	return undefined;
}

function getSelectOptions(pageSummary: api.PageSummary): 'first' | 'latest' {
	if (pageSummary.key === PageKey.ShowDetail) return 'first';
	else return undefined;
}

export function createTempPage(state: state.Root, pageSummary: api.PageSummary, itemSummary) {
	switch (pageSummary.key) {
		case PageKey.SeasonDetail:
		case PageKey.EpisodeDetail:
			if (!itemSummary || !itemSummary.type) return undefined;
			const page = createPageShell(state);
			page.item = itemSummary;
			return page;
	}
	return undefined;
}

export function getCachedTvItem(state: state.Root, location: HistoryLocation, page: api.PageSummary): api.ItemSummary {
	if (page.key !== PageKey.ShowDetail && page.key !== PageKey.SeasonDetail && page.key !== PageKey.EpisodeDetail) {
		return undefined;
	}

	const ID_MATCH = /[a-z0-9]+$/gim;
	const match = ID_MATCH.exec(location.pathname);
	if (match) {
		const id = match[0];
		const itemDetailEntry = state.cache.itemDetail[id];
		if (itemDetailEntry) {
			// if we have that item detail in cache return that
			return itemDetailEntry.item;
		} else {
			// otherwise see if one of our cached item details has the targeted item as a child summary
			const showEntry = Object.values(state.cache.itemDetail).find(
				entry => entry.item.type === 'show' && !!entry.childIds[id]
			);

			if (showEntry) return showEntry.childIds[id];
			else return { id } as any;
		}
	}
	return undefined;
}

function createPageShell(state: state.Root) {
	return {
		id: PLACEHOLDER_PAGE_ID,
		metaddata: {
			description: '',
			keywords: []
		},
		item: undefined,
		path: location.pathname,
		title: '',
		entries: []
	};
}

export function selectActivePage(state: state.Root): api.Page | api.PageSummary {
	const { history } = state.page;
	if (!history.location.pathname) return NULL_PAGE;

	// If the page isn't in cache (loaded) we return the page summary while it's loading.
	// This allows the top level page type to render before the row entries load in.
	return state.cache.page[history.location.pathname] || history.pageSummary || NULL_PAGE;
}

export function selectActivePageId(state: state.Root): string | undefined {
	const activePage = selectActivePage(state) as api.Page;
	return get(activePage, 'item.id');
}

export function selectPreviousPagePath(state: state.Root): string | undefined {
	const { pathHistory, index } = state.cache;
	const prevPageIndex = index - 1;
	// Previous page exists
	if (prevPageIndex >= 0 && pathHistory[prevPageIndex] !== null) {
		return pathHistory[prevPageIndex];
	}

	return undefined;
}

export function isPage(pageOrSummary: api.Page | api.PageSummary): pageOrSummary is api.Page {
	return pageOrSummary && (pageOrSummary.isStatic || pageOrSummary.hasOwnProperty('entries'));
}

export function isValidPageKey(key: string) {
	return PageKey.hasOwnProperty(key);
}

export function selectPageState(state: state.Root): any {
	const index = state.page.history.index;
	const entry = state.page.history.entries[index];
	return entry ? entry.state : {};
}

export function selectPageInHistory({ page, cache }: state.Root, offset = 0): api.Page {
	const index = page.history.index + offset;
	const entry = page.history.entries[index];
	if (!entry || !entry.path) return undefined;
	return cache.page[entry.path] as api.Page;
}

export function isFirstPageInHistory(routeHistory): any {
	const firstValidRoute = routeHistory.find(route => typeof route === 'object' && !isEmptyObject(route));
	if (firstValidRoute) {
		const { path } = firstValidRoute;
		return path && path.indexOf(location.pathname) > -1;
	}
	return true;
}

/**
 * Usually when we push a new page onto the browser history stack we'll
 * want to reset the scroll position to the top of the page.
 *
 * There are some situations where this behavior should be prevented.
 * For example if the app level option `retainShowDetailScroll` is enabled
 * then while PUSHing new season/episode detail pages belonging to the
 * same show we should retain the scroll position of the previous page.
 *
 * This function checks to see if such a override is enabled
 * and if so will prevent scroll position being adjusted.
 */
export function preventScrollRestore(state: state.Root) {
	const activePage = selectPageInHistory(state);

	// block adjusting scroll until the real page has loaded
	if (!activePage || activePage.id === PLACEHOLDER_PAGE_ID) return true;

	const { app, page } = state;
	if (!app.retainShowDetailScroll || !activePage.item) return false;

	const location = page.history.location;
	if (location.action !== 'PUSH') return false;

	const prevPage = selectPageInHistory(state, -1);
	if (!prevPage || !prevPage.item) return false;

	const showId = activePage.item.showId;
	return !!showId && prevPage.item.showId === showId;
}

export function getItemFromCache(
	item: api.ItemDetail,
	itemDetailCache: TPageEntryItemDetailProps<state.ItemDetailCache>['itemDetailCache']
): api.ItemDetail {
	return item && item.showId && itemDetailCache[item.showId] && itemDetailCache[item.showId].item;
}

export function getLastPageInHistoryBeforeIgnored(
	entries: state.PageHistoryEntry[],
	config: state.Config,
	ignoredPageKeys: string[]
): string {
	if (!entries) return;

	const lastIndex = entries.length - 1;
	for (let i = lastIndex; i >= 0; i -= 1) {
		const entry = entries[i];
		if (!entry) continue;
		if (isAuthPage(entry.path, config)) continue;
		if (isChildOfIgnoredPage(entry.path, config, ignoredPageKeys)) continue;
		return entry.path;
	}
}

function isAuthPage(path: string, config: state.Config) {
	return isIgnoredPage(path, config, AUTH_PAGES);
}

export function isSubscriptionPage(template: string) {
	return template === SubscriptionTemplate;
}

function isIgnoredPage(path: string, config: state.Config, ignorePageKeys: string[]) {
	const url = path.split('?')[0];
	const ignoredPaths = ignorePageKeys.map(key => getPathByKey(key, config));

	return ignoredPaths.some((path = '') => {
		const routeParamMarkerIndex = path.indexOf(':');
		if (routeParamMarkerIndex === -1) return path === url;
		return path.slice(0, routeParamMarkerIndex) === url.slice(0, routeParamMarkerIndex);
	});
}

function isChildOfIgnoredPage(path: string, config: state.Config, ignorePageKeys: string[]) {
	const url = path.split('?')[0];
	const ignoredPaths = ignorePageKeys.map(key => getPathByKey(key, config));

	const pageSummary = findPageSummaryByPath(url, config);
	const isPageToIgnore = pageSummary && ignorePageKeys.some(key => key === pageSummary.template);
	return (
		isPageToIgnore ||
		ignoredPaths.some((path: string) => {
			const routeParamMarkerIndex = path.indexOf(':');
			if (routeParamMarkerIndex === -1) {
				return path === url || url.indexOf(path + '/') > -1;
			}
			return path.slice(0, routeParamMarkerIndex) === url.slice(0, routeParamMarkerIndex);
		})
	);
}

const REDIRECT_PATH_AFTER_SIGNIN = 'redirectPathAfterSignin';

export const setRedirectPathAfterSignin = (path: string) => {
	setItem(REDIRECT_PATH_AFTER_SIGNIN, path);
};

export const getRedirectPathAfterSignin = (): string => {
	return getItem(REDIRECT_PATH_AFTER_SIGNIN);
};

export const removeRedirectPathAfterSignin = () => {
	removeItem(REDIRECT_PATH_AFTER_SIGNIN);
};

export function isChannelDetailPage(pageTemplate: string): boolean {
	return pageTemplate === ChannelDetailTemplate;
}

const IS_SOCIAL_ACCOUNT = 'isSocialAccount';

export const getIsSocialAccount = (): boolean => {
	return !!getItem(IS_SOCIAL_ACCOUNT);
};

export const setIsSocialAccount = (value: boolean) => {
	setItem(IS_SOCIAL_ACCOUNT, value);
};

export const removeIsSocialAccount = () => {
	removeItem(IS_SOCIAL_ACCOUNT);
};

export function checkBrowserSupport() {
	if (isUnsupportedBrowser()) {
		browserHistory.push('/unsupported-browser');
		return;
	}
}

const SAVED_SCROLL_Y_POS = 'scrollYPos';

export const getScrollYPosition = (): number => {
	return getItem(SAVED_SCROLL_Y_POS);
};

export const removeScrollYPosition = () => {
	removeItem(SAVED_SCROLL_Y_POS);
};

export const saveScrollYPosition = (yPos: number) => {
	setItem(SAVED_SCROLL_Y_POS, yPos);
};

export function isEmbeddedView(location) {
	return location && location.query && location.query.embedded === 'true';
}

export function isAppWebView(location) {
	return location && location.query && location.query.mobileapp === 'true';
}

export function getAppLink(redirectUrl) {
	if (_SSR_ || typeof window === 'undefined') return '';
	return `${window.location.protocol}//${window.location.host}${redirectUrl}?mcapplink=1`;
}

export function isHideMeWatchMenus(location) {
	return isAppWebView(location) || isEmbeddedView(location);
}

export function normalizeString(urlParam: String) {
	return urlParam
		.toLowerCase()
		.replace(/\s+/g, '')
		.replace(/[^a-zA-Z0-9]/g, '');
}
