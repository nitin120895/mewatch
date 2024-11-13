import { copy, deepCopy } from '../util/objects';
import { getEnhanceSearchListKey, getItemTypeId, getListKey } from 'shared/list/listUtil';
import { getNavContentLists } from 'shared/selectors/nav';
import { Bookmarks as BookmarksId } from 'shared/list/listId';
const GLOBAL_PAGE_REF_ID = '__global';

export function normalizeLists(listCache, page: api.Page) {
	(page.entries || []).forEach(entry => {
		if (entry.type === 'ListEntry' || entry.type === 'UserEntry') {
			normalizePageEntryList(listCache, page.refId, entry);
		}
	});
	return listCache;
}

export function normalizeEsearchLists(listCache, page: api.Page) {
	(page.entries || []).forEach(entry => {
		if (entry.type === 'ListEntry') {
			normalizePageEntryEsearchList(listCache, page.refId, entry);
		}
	});
	return listCache;
}

export function normalizeNavLists(listCache, navigation: api.Navigation) {
	getNavContentLists(navigation).forEach(list => {
		normalizeList(listCache, GLOBAL_PAGE_REF_ID, list);
	});
	return listCache;
}

const customFieldsToInheritFromEntry = ['ChainPlay'];
function normalizePageEntryList(listCache, pageRef: string, entry: api.PageEntry) {
	const listToNormalized = entry.list;
	if (entry.customFields) {
		for (const [key, value] of Object.entries(entry.customFields)) {
			if (customFieldsToInheritFromEntry.indexOf(key) > -1) {
				listToNormalized.customFields = { ...(listToNormalized.customFields || {}), [key]: value };
			}
		}
	}
	normalizeList(listCache, pageRef, listToNormalized);
	// We store only basic meta around a list in a page entry.
	// The master list with its content is stored in the list cache
	// and this is the one true source of lists.
	// Lists should be looked up in cache via their list id.
	// This allows us to easily use pure React components that get updated
	// when a list in cache changes. It also allows us to purge cache
	// more easily when required.
	if (entry) {
		entry.list = copy(entry.list);
		entry.list.items = [];
	}
}

function normalizePageEntryEsearchList(enhanceListCache, pageRef: string, entry: api.PageEntry) {
	const listToNormalized = entry.list;

	if (entry.customFields) {
		for (const [key, value] of Object.entries(entry.customFields)) {
			listToNormalized.customFields = { ...(listToNormalized.customFields || {}), [key]: value };
		}
	}

	normalizeEsearchList(enhanceListCache, pageRef, listToNormalized);
}

/**
 * Ensure we contain a single version of each item list in cache.
 *
 * Also keep track of which pages reference each list. We can then
 * later determine if a list has no references and is
 * available for cache purging.
 */
export function normalizeList(listCache, pageRef: string, list: api.ItemList) {
	assignListKey(list);

	if (listCache[list.key]) {
		updateList(listCache, pageRef, list.key);
	} else {
		addList(listCache, pageRef, list);
	}
}

/**
 * Ensure we contain a single version of each item list in enhance search cache.
 */
export function normalizeEsearchList(listCache, pageRef: string, list: api.ItemList) {
	assignEnhanceSearchListKey(list);
	const key = getItemTypeId(list);
	if (listCache[key]) {
		updateList(listCache, pageRef, key);
	} else {
		if (key) {
			listCache[key] = {
				pageRefs: [pageRef],
				list: copy(list),
				updateTime: Date.now()
			};
		}
		return listCache;
	}
}

/**
 * Update an existing list in the list cache with a new page reference.
 */
function updateList(listCache, pageRef: string, listKey: string) {
	const cacheEntry = listCache[listKey];
	if (!~cacheEntry.pageRefs.indexOf(pageRef)) {
		cacheEntry.pageRefs.push(pageRef);
	}
	return listCache;
}

/**
 * Add a list to the list cache.
 */
function addList(listCache, pageRef: string, list: api.ItemList) {
	listCache[list.key] = {
		pageRefs: [pageRef],
		list: copy(list),
		updateTime: Date.now()
	};
	return listCache;
}

/**
 * We provide each list a unique key based on its id and parameter, if one exists.
 */
function assignListKey(list: api.ItemList) {
	if (!list.key) {
		list.key = getListKey(list);
	}
	return list;
}

/**
 * We provide each list a unique key based on its id and parameter, if one exists.
 */
function assignEnhanceSearchListKey(list: api.ItemList) {
	if (!list.key) {
		list.key = getEnhanceSearchListKey(list);
	}
	return list;
}

/**
 * Update the master version of a list with a new page of items.
 */
export function updateListPage(listCache, list: api.ItemList) {
	assignListKey(list);
	const master = listCache[list.key];

	if (!master) {
		if (list.id === BookmarksId && list.key === `${BookmarksId}|order_by=date-added`) {
			listCache['Bookmarks']['list'] = list;
			return listCache;
		}
		return listCache;
	} // it has to be in cache already
	let masterList: api.ItemList = copy(master.list);
	const startIndex = Math.max(0, (list.paging.page - 1) * list.paging.size);
	if (startIndex >= 0) {
		let items = [...masterList.items];
		const params: any[] = [startIndex, list.items.length];

		// splice won't create a sparse array so we adjust the length first
		if (items.length < startIndex) {
			items.length = startIndex;
		}

		params.push.apply(params, list.items);
		items.splice.apply(items, params);

		// When the length of `list` and `masterList` are inconsistent, duplicate data may appear in `items`.
		// e.g. User finish watching an item from continue watching row.
		// Remove duplicate data from `items`.
		items = items.filter((item, index, arr) => arr.findIndex(i => i && i.id === item.id) === index);

		masterList.items = items;

		// We only update the paging info of the master copy if this page
		// has populated the end of the items array. This allows us
		// to easily know later how to load the next page of items for a list.
		if (masterList.paging.page < list.paging.page) {
			// A list may initially be a stub giving us enough information to load
			// the fist page of the list. In this case we want to copy over the more
			// complete list properties into the master version of our list.
			if (masterList.paging.page === 0) {
				delete list.items;
				if (!list.path) {
					list.path = masterList.path;
				}
				masterList = copy(masterList, list);
			} else {
				masterList.paging = copy(list.paging);
			}
		}

		if (list.listData) {
			masterList.listData = deepCopy(masterList.listData, list.listData);
		}

		listCache[list.key] = copy(master, { list: masterList });
	}

	return listCache;
}

/**
 * Update the master version of a list with a new page of items.
 */
export function updateEnhanceSearchListPage(enhanceListCache, list: api.ItemList) {
	assignEnhanceSearchListKey(list);
	const master = enhanceListCache[list.key];
	let masterEnhanceList: api.ItemList = copy(master.list);
	const startIndex = Math.max(0, (list.paging.page - 1) * list.paging.size);
	if (startIndex >= 0) {
		let items = [...masterEnhanceList.items];
		const params: any[] = [startIndex, list.items.length];

		// splice won't create a sparse array so we adjust the length first
		if (items.length < startIndex) {
			items.length = startIndex;
		}

		params.push.apply(params, list.items);
		items.splice.apply(items, params);
		masterEnhanceList.items = items;

		if (masterEnhanceList.paging.page < list.paging.page) {
			if (masterEnhanceList.paging.page === 0) {
				delete list.items;
				if (!list.path) {
					list.path = masterEnhanceList.path;
				}
				masterEnhanceList = copy(masterEnhanceList, list);
			} else {
				masterEnhanceList.paging = copy(list.paging);
			}
		}
		if (list.listData) {
			masterEnhanceList.listData = deepCopy(masterEnhanceList.listData, list.listData);
		}
		enhanceListCache[list.key] = copy(master, { list: masterEnhanceList });
	}
	return enhanceListCache;
}

/**
 * Given a page that's been removed from cache, scan the cached
 * lists, find any that had a reference to this page and remove
 * this reference.
 *
 * Note that we don't remove a list from cache here if it has
 * no other page references. The rules around when a list is removed
 * from cache are decided in the cacheWorkflow.
 */
export function updateListPageRefs(listCache, removedPage: api.Page) {
	for (let key in listCache) {
		const cacheEntry: state.ListCache = listCache[key];
		const i = cacheEntry.pageRefs.indexOf(removedPage.refId);
		if (~i) cacheEntry.pageRefs.splice(i, 1);
	}
	return listCache;
}
