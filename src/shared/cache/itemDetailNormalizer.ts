import { copy } from '../util/objects';
import { genId } from '../util/strings';
import { ItemDetailStandard } from '../page/pageEntryTemplate';
import { isSeason } from 'ref/responsive/util/item';

export function normalizeItemDetail(cache, page: api.Page) {
	const item = page.item;
	if (item) {
		normalizeParent(cache, page, item);
		normalizeItem(cache, page, item);
	}
	return cache;
}

function normalizeParent(cache, page, child) {
	if (child.show) {
		normalizeItem(cache, page, child.show);
	} else if (child.season) {
		normalizeParent(cache, page, child.season);
		normalizeItem(cache, page, child.season);
	}

	// Ensure previously cached items have their page refs updated if required
	if (child.seasonId) addPageRef(cache[child.seasonId], page);
	if (child.showId) addPageRef(cache[child.showId], page);
}

function normalizeItem(cache, page: api.Page, item: api.ItemDetail) {
	if (!item) return;

	if (cache[item.id]) {
		updateItemDetail(cache, page, item);
	} else {
		addItemDetail(cache, page, item);
	}

	updateChildIdMap(cache, page, item);

	// remove circular references via parent items if item is a season
	if (isSeason(item) && item.season) item.season = undefined;
}

/**
 * Update an existing item detail in the item detail cache with a new page reference.
 */
function updateItemDetail(cache, page: api.Page, item: api.ItemDetail) {
	const cacheEntry = cache[item.id];
	addPageRef(cacheEntry, page);
	return cache;
}

function addPageRef(cacheEntry, page: api.Page) {
	if (cacheEntry && !~cacheEntry.pageRefs.indexOf(page.refId)) {
		cacheEntry.pageRefs.push(page.refId);
	}
}

/**
 * Add an item detail to the item detail cache.
 */
function addItemDetail(cache, page: api.Page, item: api.ItemDetail) {
	cache[item.id] = {
		pageRefs: [page.refId],
		item: copy(item),
		childIds: item.type === 'show' ? {} : undefined
	};
	if (item.credits) {
		item.credits.forEach(credit => (credit.key = genId()));
	}
	return cache;
}

/**
 * We keep a lookup of child -> parent ids to provide fast
 * determination of what episode a season belongs to and what
 * season a show belongs to. This is used during routing to
 * an episode or season to determine if we have the root show
 * we can re-use in memory.
 */
function updateChildIdMap(cache, page: api.Page, item: api.ItemDetail) {
	if (item.seasons || item.episodes) {
		const showId = item.showId || item.id;
		const showEntry = cache[showId];
		if (!showEntry) return;
		addPageRef(showEntry, page);
		const childIds = showEntry.childIds;
		(item.seasons || item.episodes).items.forEach(item => {
			childIds[item.id] = item;
		});
	}
}

export function updateItemDetailPageRefs(cache: { [id: string]: state.ItemDetailCache }, removedPage: api.Page) {
	if (!removedPage.entries) return cache;

	const hasItemDetail = removedPage.entries.some(entry => entry.template === ItemDetailStandard);
	if (hasItemDetail) {
		Object.values(cache).forEach(cacheEntry => {
			const i = cacheEntry.pageRefs.indexOf(removedPage.refId);
			if (~i) cacheEntry.pageRefs.splice(i, 1);
		});
	}
	return cache;
}
