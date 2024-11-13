import { DropSelectOption } from 'ref/responsive/component/DropSelect';
import { getRefreshedMeid } from 'shared/analytics/mixpanel/util';
import { VideoEntryPoint } from 'shared/analytics/types/types';
import {
	Watched as watchedListId,
	Bookmarks as bookmarksListId,
	ContinueWatching as continueWatchingListId,
	ContinueWatchingAnonymous as ContinueWatchingAnonymousListId
} from 'shared/list/listId';
import {
	LIST_ROW_TEMPLATES,
	UX1Recommendation,
	UX2Recommendation,
	UX3Recommendation,
	UX4Recommendation,
	UX5Recommendation,
	UX6Recommendation,
	UX7Recommendation,
	UX8Recommendation
} from 'shared/page/pageEntryTemplate';
import { getBoostRecommendationsList, getZoomRecommendationsList } from 'shared/service/action/content';
import * as content from 'shared/service/content';
import { getBoostDeviceType } from 'shared/util/deviceUtil';
import {
	getContentId,
	getEpisodeIdpRecommendationsContentSourceId,
	getRecommendationsContentSourceId,
	getZoomItemParam
} from 'shared/util/itemUtils';
import { copy, get } from 'shared/util/objects';
import { onLibraryLoaded } from 'shared/util/scripts';
import { capitalizeStr } from 'shared/util/strings';
import { getmeID } from 'toggle/responsive/pageEntry/advertising/adsUtils';
import { getAgeGroupMinAge } from 'toggle/responsive/util/dateOfBirth';

export const SORT_OPTIONS_LOOKUP = {
	'a-z': { orderBy: 'a-z', order: 'asc' },
	'z-a': { orderBy: 'a-z', order: 'desc' },
	'latest-release': { orderBy: 'release-year', order: 'desc' },
	'earliest-release': { orderBy: 'release-year', order: 'asc' },
	'latest-added': { orderBy: 'date-added', order: 'desc' }
};

export enum SortingOptions {
	Earliest = 'asc',
	Latest = 'desc'
}

// Only the options that are specific to list and not applied
// accross all endpoints like device, sub and segments.
// `max_rating` is a special case as often just used against
// a list as a filter option and not a general filter.
const LIST_OPTIONS = {
	pageSize: 'page_size',
	orderBy: 'order_by',
	order: 'order',
	maxRating: 'max_rating',
	itemType: 'item_type',
	genres: 'genre',
	audioLanguages: 'audio_language'
};

const LIST_PARAMS = Object.keys(LIST_OPTIONS).reduce((params, key) => {
	params[LIST_OPTIONS[key]] = key;
	return params;
}, {});

export function getListOptions(list, options?) {
	const opts = options || list.paging.options;
	if (!opts) return undefined;

	if (list.parameter) opts.param = list.parameter;
	if (list.paging.options) {
		if (list.paging.options.pageSize && !opts.pageSize) {
			opts.pageSize = list.paging.options.pageSize;
		}
		if (list.paging.options.audioLanguages && list.paging.options.audioLanguages.length) {
			opts.audioLanguage = list.paging.options.audioLanguages.toString();
		}
		if (list.paging.options.genres && list.paging.options.genres.length) {
			opts.genre = list.paging.options.genres.toString();
		}
	}
	return opts;
}

export function listOptionsToParams(options) {
	let opts = {};
	if (options) {
		for (let key in options) {
			if (LIST_OPTIONS[key]) {
				opts[LIST_OPTIONS[key]] = options[key];
			}
		}
	}
	return opts;
}

export function listParamsToOptions(params) {
	let opts = {};
	if (params) {
		for (let key in params) {
			if (LIST_PARAMS[key]) {
				opts[LIST_PARAMS[key]] = params[key];
			}
		}
	}
	return opts;
}

export function getListKey(list, options?) {
	let opts = list.paging.options;
	if (options) {
		const opts2 = Object.assign({}, options);
		if (opts) {
			if (opts.pageSize && !opts2.pageSize) {
				opts2.pageSize = opts.pageSize;
			}
		}
		opts = removeDefaultOptions(list.id, opts2);
	}
	opts = listOptionsToParams(opts);
	if (list.id === watchedListId || isContinueWatching(list)) return list.id;
	const segs = [list.id];
	if (list.parameter) segs.push(list.parameter);
	for (let key in opts) {
		const value = opts[key];
		if (value || value === 0) {
			segs.push(`${key}=${opts[key]}`);
		}
	}
	return segs.sort().join('|');
}

export function getItemTypeId(list) {
	const customItemTypeIds = get(list, 'customFields.itemTypeIds');
	if (Array.isArray(customItemTypeIds) && customItemTypeIds.length > 0) {
		return customItemTypeIds[0];
	} else {
		return undefined;
	}
}

export function getEnhanceSearchListKey(list, options?) {
	let listPagingOpts = get(list, 'paging.options');
	if (options) {
		const updatedOptions = Object.assign({}, options);
		if (listPagingOpts) {
			if (listPagingOpts.pageSize && !updatedOptions.pageSize) {
				updatedOptions.pageSize = listPagingOpts.pageSize;
			}
		}
		listPagingOpts = removeDefaultOptions(getItemTypeId(list), updatedOptions);
	}
	listPagingOpts = listOptionsToParams(listPagingOpts);
	const itemTypeIds = getItemTypeId(list);
	return itemTypeIds;
}

function removeDefaultOptions(listId, options) {
	if (listId === bookmarksListId) {
		if (options.orderBy === 'date-added') options.orderBy = undefined;
	}
	if (options.order === 'desc') options.order = undefined;
	if (options.pageSize === 12 || options.pageSize < 1) options.pageSize = undefined;
	return options;
}

export function getEmptyListKeys(state: state.Root, lists: api.ItemList[]): string[] {
	const map = lists.reduce((keys: object, list) => {
		if (shouldLoadListPage(state, list, 1) && !isSecuredList(list)) {
			keys[list.key] = true;
		}
		return keys;
	}, {});
	return Object.keys(map).sort(); // sort to help CDN cache
}

export function getEmptySecureLists(state: state.Root, entries: api.ItemList[]): api.ItemList[] {
	const recommendations = entries.filter(list => isSecuredList(list));
	if (!state.session.tokens.length && recommendations.length) {
		return entries.reduce((lists: api.ItemList[], list) => {
			if (isSecuredList(list) && shouldLoadListPage(state, list, 1, true)) {
				lists.push(list);
			}
			return lists;
		}, []);
	}

	if (!state.session.tokens.length) return [];
	return entries.reduce((lists: api.ItemList[], list) => {
		if ((list && list.paging && list.paging.authorization) || isSecuredList(list)) {
			if (shouldLoadListPage(state, list, 1, true)) {
				lists.push(list);
			}
		}
		return lists;
	}, []);
}

const isSecuredList = list => list && (isRecommendationList(list) || list.id === bookmarksListId);

export const WIDGET_ID_BOOST = 'boostWidgetId';
export const WIDGET_ID_ZOOM = 'zoomWidgetId';

export const isRecommendationList = list =>
	[WIDGET_ID_BOOST, WIDGET_ID_ZOOM].some(widgetId => typeof get(list, `customFields.${widgetId}`) !== 'undefined');

export function isZoomRecommendationList(opts) {
	return opts && [UX5Recommendation, UX6Recommendation].includes(opts.template);
}

export function isBoostRecommendationList(opts) {
	return opts && (opts.template === UX7Recommendation || opts.template === UX8Recommendation);
}

export const isPersonalizedList = opts => opts && opts.template === UX6Recommendation;

export const isDeprecatedList = (list, opts?) =>
	(opts && [UX1Recommendation, UX2Recommendation, UX3Recommendation, UX4Recommendation].includes(opts.template)) ||
	!!get(list, 'customFields.cxenseWidgetId');

/**
 * Returns an array of list keys targeting lists to load given a page containing ListEntries.
 */
export function getEmptyPageEntryListKeys(state: state.Root, page: api.Page): string[] {
	const lists = page.entries.map(entry => entry.list);
	if (page.list) lists.push(page.list);
	return getEmptyListKeys(state, lists);
}

export function getEmptySecurePageEntryLists(state: state.Root, page: api.Page): api.ItemList[] {
	if (!page || !page.entries || !page.entries.length) return [];

	const lists = page.entries.map(entry => entry.list);
	if (page.list) lists.push(page.list);
	return getEmptySecureLists(state, lists);
}

/**
 * Determine whether we need to load a give page of items of a List.
 *
 * Returns false if
 * - The item page of the list is already loaded
 * - The item page of the list is in the process of being loaded
 * - The item page is beyond the max page count
 * - The item page is less than 1
 * - The list is not found in cache
 */
export function shouldLoadListPage(
	state: state.Root,
	list: api.ItemList,
	pageNo: number,
	includeAuthLists = false,
	options?
): boolean {
	if (!list) return false;

	const key = options ? getListKey(list, options) : list.key;

	const listCache = state.cache.list;
	const cachedListInfo = listCache[key];

	// we don't load any list not in cache
	// lists are normalized into cache as soon as a page loads
	if (!cachedListInfo) return false;

	const cachedList = cachedListInfo.list;
	const paging = cachedList.paging;
	if (!includeAuthLists && paging.authorization) return false;
	if (includeAuthLists && paging.authorization && paging.total === -1) return true;

	if (isDeprecatedList(list, options)) return false;

	// Update recommendation list after page change
	if (isRecommendationList(list)) return true;

	// Update bookmarks list after page change
	if (isBookmarksList(list)) return true;

	if (pageNo < 1 || (paging.total !== -1 && pageNo > paging.total)) return false;

	if (!cachedList.items.length) return true;

	const loadingLists = state.list.loading;
	const loading = loadingLists[cachedList.key];
	if (loading && ~loading.indexOf(pageNo)) return false;

	const index = paging.size * (pageNo - 1);
	if (!cachedList.items[index]) return true;

	return false;
}

export function shouldLoadEnhanceSearchListPage(state: state.Root, list: api.ItemList, pageNo: number): boolean {
	if (!list) return false;

	const key = list.key;

	const enhanceSearchCache = get(state, 'cache.enhanceSearch') || {};
	const cachedListInfo = enhanceSearchCache[key];

	// we don't load any list not in cache
	// lists are normalized into cache as soon as a page loads
	if (!cachedListInfo) return false;

	const cachedList = cachedListInfo.list;
	const paging = cachedList.paging;

	if (pageNo < 1 || (paging.total !== -1 && pageNo > paging.total)) return false;

	if (!cachedList.items.length) return true;

	const loadingLists = state.list.loading;
	const loading = loadingLists[cachedList.key];
	if (loading && ~loading.indexOf(pageNo)) return false;

	const index = paging.size * (pageNo - 1);
	if (!cachedList.items[index]) return true;

	return false;
}

export function shouldLoadSecureListPage(state: state.Root, list: api.ItemList, pageNo: number): boolean {
	return shouldLoadListPage(state, list, pageNo, true);
}

export function isListLoaded(list: api.ItemList): boolean {
	return list.size === list.items.length;
}

export function getNextListPageNo(state: state.Root, list: api.ItemList): number {
	const cachedListInfo = state.cache.list[list.key];
	if (!cachedListInfo) return -1;

	list = cachedListInfo.list;
	const paging = list.paging;
	if (paging.total === 0) return -1;
	if (!list.items.length) return 1;

	const nextPage = Math.floor((list.items.length - 1) / paging.size) + 2;

	if (nextPage > paging.total) return -1;

	return nextPage;
}

export function getNextEnhanceSearchListPageNo(state: state.Root, list: api.ItemList): number {
	const { enhanceSearch } = state.cache;
	const cachedListInfo = enhanceSearch[list.key];

	if (!cachedListInfo) return -1;

	list = cachedListInfo.list;
	const paging = list.paging;
	if (paging.total === 0) return -1;
	if (!list.items.length) return 1;

	const nextPage = Math.floor((list.items.length - 1) / paging.size) + 2;

	if (nextPage > paging.total) return -1;

	return nextPage;
}

export function listLoadStart(loading, listKey, pageNo) {
	if (loading[listKey]) loading[listKey].push(pageNo);
	else loading[listKey] = [pageNo];
	return loading;
}

export function listLoadEnd(loading, listKey, pageNo) {
	const list = loading[listKey];
	if (list) {
		const i = list.indexOf(pageNo);
		if (i !== -1) list.splice(i, 1);
		if (!list.length) delete loading[listKey];
	}
	return loading;
}

export function createListVariant(originalList: api.ItemList, options, key?) {
	const list = copy(originalList);
	list.key = key || getListKey(originalList, options);
	list.paging = {
		total: -1,
		size: -1,
		page: 0
	};

	let pageSize;
	if (options && options.pageSize) pageSize = options.pageSize;
	else if (originalList.paging.options) pageSize = originalList.paging.options.pageSize;

	if (pageSize) {
		list.paging.options = {
			pageSize
		};
	}
	list.items = [];
	list.size = -1;
	return list;
}

const WATCHABLE_LISTS = [watchedListId, continueWatchingListId];
const PROGRESSED_LISTS = [watchedListId, continueWatchingListId, bookmarksListId];

export function canWatchItemFromList(listId: string) {
	return WATCHABLE_LISTS.indexOf(listId) >= 0;
}

export function canShowProgressForList(listId: string) {
	return PROGRESSED_LISTS.indexOf(listId) >= 0;
}

export function checkListData(list: api.ItemList) {
	if (list && list.items && isContinueWatching(list)) {
		list.items.forEach(element => {
			if (element.type === 'episode') {
				element.customFields = { ...element.customFields, ...getEpisodeForShow(element.id, list.listData) };
			}
		});
	}
}

function getEpisodeForShow(showId: string, listData: api.ListData) {
	if (listData && listData.ContinueWatching && listData.ContinueWatching.itemInclusions) {
		return listData.ContinueWatching.itemInclusions[showId];
	}

	return undefined;
}

export function hasEntryEmptyList(template: string, list: api.ItemList) {
	return LIST_ROW_TEMPLATES.indexOf(template) >= 0 && list && list.items && list.items.length < 1;
}

export function getDummyItems(list: api.ItemList) {
	const expectingItemsSize = list.size - list.items.length;
	const itemsCount = expectingItemsSize < list.paging.size ? expectingItemsSize : list.paging.size;
	const items = [];
	for (let i = 0; i < itemsCount; ++i) {
		items.push({ id: i, path: '', type: '' });
	}
	return items;
}

export enum PackshotMetadataFormats {
	Default = 'default',
	Bookmarks = 'Bookmarks',
	ContinueWatching = 'ContinueWatching'
}

export function getPackshotMetadataFormatting(list: api.ItemList): PackshotMetadataFormats {
	if (isBookmarksList(list)) {
		return PackshotMetadataFormats.Bookmarks;
	} else if (isContinueWatching(list)) {
		return PackshotMetadataFormats.ContinueWatching;
	}

	return PackshotMetadataFormats.Default;
}

export function getPackshotTitlePositon(list: api.ItemList): AssetTitlePosition {
	if (isBookmarksList(list) || isContinueWatching(list)) {
		return 'below';
	}
	return undefined;
}

export function isBookmarksList(list: api.ItemList): boolean {
	return list.id === bookmarksListId;
}

export function isContinueWatching(list: api.ItemList): boolean {
	return list.id === continueWatchingListId || list.id === ContinueWatchingAnonymousListId;
}

export function isSearchList(list: api.ItemList): boolean {
	return list.id.includes('search');
}

export function getItemUnwatchedEpisodes(list: api.ItemList, item: api.ItemDetail): number {
	const unwatched = get(list, 'listData.Bookmarks.itemInclusions');
	return unwatched && unwatched[item.id] && unwatched[item.id].unwatchedEpisodes;
}

const PLACEHOLDER_KEY = '__placeholder';

export enum ClassificationOptions {
	Default,
	IMDA_G = 'IMDA-G',
	IMDA_PG = 'IMDA-PG',
	IMDA_PG13 = 'IMDA-PG13',
	IMDA_NC16 = 'IMDA-NC16',
	IMDA_M18 = 'IMDA-M18',
	IMDA_R21 = 'IMDA-R21'
}

export const ClassificationValues = {
	[ClassificationOptions.Default]: { label: 'listPage_rating_default', key: PLACEHOLDER_KEY },
	[ClassificationOptions.IMDA_G]: { label: 'listPage_rating_g', key: 'IMDA-G' },
	[ClassificationOptions.IMDA_PG]: { label: 'listPage_rating_pg', key: 'IMDA-PG' },
	[ClassificationOptions.IMDA_PG13]: { label: 'listPage_rating_pg13', key: 'IMDA-PG13' },
	[ClassificationOptions.IMDA_NC16]: { label: 'listPage_rating_nc16', key: 'IMDA-NC16' },
	[ClassificationOptions.IMDA_M18]: { label: 'listPage_rating_m18', key: 'IMDA-M18' },
	[ClassificationOptions.IMDA_R21]: { label: 'listPage_rating_r21', key: 'IMDA-R21' }
};

export const DEFAULT_CLASSIFICATION_OPTION = ClassificationValues[ClassificationOptions.Default];

export function getClassificationOptions(classifications): DropSelectOption[] {
	return Object.keys(classifications || {}).map(code => {
		const classification = classifications[code];
		return ClassificationValues[classification.code];
	});
}

export const DEFAULT_GENRES_OPTION: DropSelectOption = {
	label: 'listPage_filter_genre_default',
	key: PLACEHOLDER_KEY
};

export function getGenresOptions(list: api.ItemList): DropSelectOption[] {
	const genres = list.itemGenres;
	const isMoreThanOneGenre = genres && genres.length > 1;

	if (!isMoreThanOneGenre) return [];

	return genres.map(genre => ({
		label: capitalizeStr(genre),
		key: genre
	}));
}

export const DEFAULT_LANGUAGE_OPTION: DropSelectOption = {
	label: 'language_label_all',
	key: PLACEHOLDER_KEY
};

export function getAudioLanguageOptions(list: api.ItemList): DropSelectOption[] {
	const audioLanguages = list.itemAudioLanguages;
	const isMoreThanOneLang = audioLanguages && audioLanguages.length > 1;

	if (!isMoreThanOneLang) return [];

	return audioLanguages.map(audioLanguage => ({
		label: capitalizeStr(audioLanguage),
		key: audioLanguage
	}));
}

export const ZOOM_WIDGET_COLD_START_EOP_WEB = 'zoomWidgetIdWeb';

export const getZoomRecommendations: any = (
	widgetId,
	options: content.GetZoomRecommendationsListOptions,
	item?: api.ItemDetail
) => (dispatch, getState) =>
	Promise.all([item && getZoomItemParam(item), onLibraryLoaded(() => getmeID())]).then(values => {
		const [itemParam, meId] = values;
		return dispatch(
			getZoomRecommendationsList(widgetId, {
				...options,
				...itemParam, // credits, genres, audioLanguages
				meId
			})
		);
	});

const enum BoostProduct {
	FreeEPG = 'FREE_EPG',
	FreeVOD = 'FREE_VOD',
	FreeSignInVOD = 'FREE_VOD_FOR_LOGGED_IN_USERS'
}

export const BOOST_WIDGET_COLD_START_EOP_WEB = 'boostWidgetIdWeb';
export const getBoostRecommendations = (
	widgetId: string,
	options: content.GetBoostRecommendationsListOptions,
	item?: api.ItemDetail,
	isEndofPlayback?: boolean,
	isEpisodeDetailPage?: boolean
) => (dispatch, getState) =>
	onLibraryLoaded(getmeID).then(() => {
		const state: state.Root = getState();
		const { app, account } = state;
		const { countryCode } = app;
		const defaultProduct = [BoostProduct.FreeEPG, BoostProduct.FreeVOD];

		const boostOptions: content.GetBoostRecommendationsListOptions = {
			...options,
			age: '15',
			countryCode: countryCode || 'SG',
			DeviceType: getBoostDeviceType(),
			meId: getRefreshedMeid(),
			product: defaultProduct,
			timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
		};

		const isLoggedIn = account.active;
		if (isLoggedIn) {
			const ageGroup = get(account, 'info.ageGroup');
			boostOptions.age = getAgeGroupMinAge(ageGroup).toString();
			boostOptions.meId = get(account, 'info.id');

			const subscriptions = get(account, 'info.subscriptions') || [];
			const userProduct = subscriptions.map(subscription => subscription.planId);
			boostOptions.product = [...defaultProduct, BoostProduct.FreeSignInVOD, ...userProduct];
		}

		if (item) {
			if (isEndofPlayback) {
				const contentId = item.customId;
				return dispatch(
					getBoostRecommendationsList(widgetId, {
						...boostOptions,
						contentId: getRecommendationsContentSourceId(item, contentId)
					})
				);
			} else {
				return getContentId(item).then(contentId => {
					return dispatch(
						getBoostRecommendationsList(widgetId, {
							...boostOptions,
							contentId: isEpisodeDetailPage
								? getEpisodeIdpRecommendationsContentSourceId(contentId)
								: getRecommendationsContentSourceId(item, contentId)
						})
					);
				});
			}
		} else {
			return dispatch(getBoostRecommendationsList(widgetId, boostOptions));
		}
	});

export const isListChainPlayable = list => list && list.customFields && !!list.customFields['ChainPlay'];

export const getVideoEntryPoint = list => {
	if (isContinueWatching(list)) {
		return VideoEntryPoint.ContinueWatching;
	}

	if (isSearchList(list)) {
		return VideoEntryPoint.Search;
	}

	return undefined;
};
