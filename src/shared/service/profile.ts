/// <reference path="types.ts"/>
/** @module profile */
// Auto-generated, edits will be overwritten
import * as gateway from './gateway';

/**
 * Get the details of the active profile, including watched, bookmarked and rated items.
 *
 * @param {object} options Optional options
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.ProfileDetail>} Details of the active profile.
 */
export function getProfile(options?: GetProfileOptions): Promise<api.Response<api.ProfileDetail>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getProfileOperation, parameters);
}

/**
 * Get the map of bookmarked item ids (itemId => creationDate) under the active profile.
 *
 * @param {object} options Optional options
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<object>} OK
 */
export function getBookmarks(options?: GetBookmarksOptions): Promise<api.Response<{ [key: string]: Date }>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getBookmarksOperation, parameters);
}

/**
 * Unbookmark an item(s) under the active profile.
 *
 * @param {object} options Optional options
 * @param {string[]} [options.itemIds] An array of item ids to be unbookmarked.
 *
 * 	If parameter is not provided or empty, all bookmarks will be cleared.
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<object>} Bookmarks deleted.
 */
export function deleteItemBookmarks(options?: DeleteItemBookmarksOptions): Promise<api.Response<any>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			item_ids: gateway.formatArrayParam(options.itemIds, 'csv', 'item_ids'),
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(deleteItemBookmarksOperation, parameters);
}

/**
 * Returns the list of bookmarked items under the active profile.
 *
 * **NOTE:** the `getProfileLists` service is preferred over this as it supports
 * batching requests for lists
 *
 * @param {object} options Optional options
 * @param {number} [options.page] The page of items to load. Starts from page 1.
 * @param {number} [options.pageSize] The number of items to return in a page.
 * @param {string} [options.orderBy] Enum: a-z, release-year, date-added. The sorting field, either the 'date-added', 'release-year' or 'a-z' (title).
 * @param {string} [options.order=desc] Enum: asc, desc. The sort order of the returned list, either 'asc' or 'desc'.
 * @param {string} [options.maxRating] The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
 * @param {string} [options.itemType] Enum: movie, show, season, episode, program, link, trailer, channel, customAsset, event, competition, confederation, stage, persona, team, credit, article. The item type to filter by. Defaults to unspecified.
 * @param {string} [options.device=web_browser] The type of device the content is targeting.
 * @param {string} [options.sub] The active subscription code.
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.ItemList>} The list of items requested.
 */
export function getBookmarkList(options?: GetBookmarkListOptions): Promise<api.Response<api.ItemList>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			page: options.page,
			page_size: options.pageSize,
			order_by: options.orderBy,
			order: options.order,
			max_rating: options.maxRating,
			item_type: options.itemType,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getBookmarkListOperation, parameters);
}

/**
 * Get the bookmark for an item under the active profile.
 *
 * @param {string} itemId The id of the item to get the bookmark for.
 * @param {object} options Optional options
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.Bookmark>} OK
 */
export function getItemBookmark(itemId: string, options?: GetItemBookmarkOptions): Promise<api.Response<api.Bookmark>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			itemId
		},
		query: {
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getItemBookmarkOperation, parameters);
}

/**
 * Bookmark an item under the active profile.
 *
 * Creates one if it doesn't exist, overwrites one if it does.
 *
 * @param {string} itemId The id of the item to bookmark.
 * @param {object} options Optional options
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.Bookmark>} Bookmark created.
 */
export function bookmarkItem(itemId: string, options?: BookmarkItemOptions): Promise<api.Response<api.Bookmark>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			itemId
		},
		query: {
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(bookmarkItemOperation, parameters);
}

/**
 * Unbookmark an item under the active profile.
 *
 * @param {string} itemId The identifier of the bookmark to delete.
 * @param {object} options Optional options
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<object>} Bookmark deleted.
 */
export function deleteItemBookmark(itemId: string, options?: DeleteItemBookmarkOptions): Promise<api.Response<any>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			itemId
		},
		query: {
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(deleteItemBookmarkOperation, parameters);
}

/**
 * Remove continue watching item(s) under the active profile.
 *
 * @param {object} options Optional options
 * @param {string[]} [options.itemIds] An array of item ids to be removed from continue watching list.
 *
 * 	If parameter is 0, all continue watching items will be cleared.
 * @param {string} [options.device=web_browser] The type of device the content is targeting.
 * @param {string} [options.sub] The active subscription code.
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<object>} Continue watching item(s) deleted.
 */
export function deleteContinueWatching(options?: DeleteContinueWatchingOptions): Promise<api.Response<any>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			item_ids: gateway.formatArrayParam(options.itemIds, 'csv', 'item_ids'),
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(deleteContinueWatchingOperation, parameters);
}

/**
 * Returns a list of items which have been watched but not completed under the active
 * profile.
 *
 * Multiple episodes under the same show may be watched or in progress, however only a
 * single item belonging to a particular show will be included in the returned list.
 *
 * The next episode to continue watching for a particular show will be the most recent
 * incompletely watched episode, or the next episode following the most recently
 * completely watched episode. Based on the specified `show_item_type` type, either the next
 * episode, the season of the next episode, or the show will be included in the list.
 *
 * **NOTE:** the `getProfileLists` service is preferred over this as it supports
 * batching requests for lists
 *
 * @param {string} sub The active subscription code.
 * @param {object} options Optional options
 * @param {string} [options.showItemType=episode] Enum: episode, season, show. The item type to be returned for continue watching items belonging to a show.
 *
 * 	Multiple episodes under the same show may be watched or in progress, however only a
 * 	single item belonging to a particular show will be included in the returned list.
 *
 * 	The next episode to continue watching for a particular show will be the most recent
 * 	incompletely watched episode, or the next episode following the most recently
 * 	completely watched episode. Based on the specified `show_item_type` type, either the next
 * 	episode, the season of the next episode, or the show will be included in the list.
 *
 * 	If `episode` is specified, then only the next episode to continue watching for a
 * 	show will be returned.
 *
 * 	If `season` is specified, then only the season of the next episode will be returned.
 *
 * 	If `show` is specified, then only the show of the next episode will be returned
 *
 * 	The recommended value of this parameter should reflect the desitination the
 * 	user will be sent to when they select this item in the list. So if a user will
 * 	be sent to the show detail page then this should be `show` and you can use
 * 	the `include` parameter to get metadata about the episode or season if needed
 * @param {string[]} [options.include=] Include one opr more ancestor/children for items belonging to a show. Extra items
 * 	will be populated in the `listData` property of the list
 *
 * 	If no value is specified no dependencies are included.
 *
 * 	If `episode` is specified, then the next episode will be added for season/show
 * 	items. Has no effect if `show_item_type` is set to `episode`.
 *
 * 	If `season` is specified, then the season of the next episode will be added for
 * 	episode/show items. Has no effect if `show_item_type` is set to `season`.
 *
 * 	If `show` is specified, then the show of the next episode will be added for
 * 	episode/season items. Has no effect if `show_item_type` is set to `show`.
 * @param {number} [options.page=1] The page of items to load. Starts from page 1.
 * @param {number} [options.pageSize=12] The number of items to return in a page.
 * @param {string} [options.maxRating] The maximum rating (inclusive) of an item returned, e.g. 'auoflc-pg'.
 * @param {string} [options.device=web_browser] The type of device the content is targeting.
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.ItemList>} The list of items requested.
 */
export function getContinueWatchingList(options?: GetContinueWatchingListOptions): Promise<api.Response<api.ItemList>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			show_item_type: options.showItemType,
			include: gateway.formatArrayParam(options.include, 'csv', 'include'),
			page: options.page,
			page_size: options.pageSize,
			max_rating: options.maxRating,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getContinueWatchingListOperation, parameters);
}

/**
 * Get the map of followed item ids (itemId => creationDate) under the active profile.
 *
 * @param {object} options Optional options
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<object>} OK
 */
export function getFollows(options?: GetFollowsOptions): Promise<api.Response<{ [key: string]: Date }>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getFollowsOperation, parameters);
}

/**
 * Returns the list of items followed under the active profile.
 *
 * **NOTE:** the `getProfileLists` service is preferred over this as it supports
 * batching requests for lists
 *
 * @param {object} options Optional options
 * @param {number} [options.page] The page of items to load. Starts from page 1.
 * @param {number} [options.pageSize] The number of items to return in a page.
 * @param {string} [options.order=desc] Enum: asc, desc. The 'date-added' sort order of the returned list, either 'asc' or 'desc'.
 * @param {string} [options.itemType] Enum: movie, show, season, episode, program, link, trailer, channel, customAsset, event, competition, confederation, stage, persona, team, credit, article. The item type to filter by. Defaults to unspecified.
 * @param {string} [options.device=web_browser] The type of device the content is targeting.
 * @param {string} [options.sub] The active subscription code.
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.ItemList>} The list of items requested.
 */
export function getFollowList(options?: GetFollowListOptions): Promise<api.Response<api.ItemList>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			page: options.page,
			page_size: options.pageSize,
			order: options.order,
			item_type: options.itemType,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getFollowListOperation, parameters);
}

/**
 * Get metadata for the "follow" of the given item under the active profile
 *
 * @param {string} itemId The id of the item to get the followed item for.
 * @param {object} options Optional options
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.Follow>} OK
 */
export function getItemFollow(itemId: string, options?: GetItemFollowOptions): Promise<api.Response<api.Follow>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			itemId
		},
		query: {
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getItemFollowOperation, parameters);
}

/**
 * An item followed under the active profile.
 *
 * Creates one if it doesn't exist, overwrites one if it does.
 *
 * @param {string} itemId The id of the item to follow.
 * @param {object} options Optional options
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.Follow>} Followed item created.
 */
export function followItem(itemId: string, options?: FollowItemOptions): Promise<api.Response<api.Follow>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			itemId
		},
		query: {
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(followItemOperation, parameters);
}

/**
 * Unfollow an item under the active profile.
 *
 * @param {string} itemId The identifier of the followed item to delete.
 * @param {object} options Optional options
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<object>} Followed item deleted.
 */
export function unfollowItem(itemId: string, options?: UnfollowItemOptions): Promise<api.Response<any>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			itemId
		},
		query: {
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(unfollowItemOperation, parameters);
}

/**
 * Returns the next item to play given a source item id.
 *
 * For an unwatched show it returns the first episode available to the account.
 *
 * For a watched show it returns the last incompletely watched episode by the profile,
 * or the episode that immediately follows the last completely watched episode
 * or nothing.
 *
 * For an episode it always returns the immediately following episode, if available to
 * the account, or nothing.
 *
 * If the response does not contain a `next` property then no item was found.
 *
 * @param {string} itemId The identifier of the source item to base the next to watch item off.
 * @param {string} sub The active subscription code.
 * @param {object} options Optional options
 * @param {string} [options.maxRating] The maximum rating (inclusive) of an item returned, e.g. 'auoflc-pg'.
 * @param {string} [options.expand] Enum: parent, ancestors. If no value is specified no dependencies are expanded.
 *
 * 	If 'parent' is specified then only the direct parent will be expanded.
 * 	For example if an `Episode` then the `Season` would be included.
 *
 * 	If 'ancestors' is specified then the full parent chain is expanded.
 * 	For example if an `Episode` then both the `Season` and `Show` would be included.
 * @param {string} [options.device=web_browser] The type of device the content is targeting.
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.NextPlaybackItem>} The detail of the next item to play.
 */
export function getNextPlaybackItem(
	itemId: string,
	options?: GetNextPlaybackItemOptions
): Promise<api.Response<api.NextPlaybackItem>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			itemId
		},
		query: {
			max_rating: options.maxRating,
			expand: options.expand,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getNextPlaybackItemOperation, parameters);
}

/**
 * Returns an array of profile lists with their first page of content resolved.
 *
 * @param {string[]} ids A comma delimited list of item profile list identifiers.
 *
 * 	These can be list ids e.g. `14354,65473,3234` or named lists eg `ratings,bookmarks,watched`
 *
 * 	Or more complex sort/filter queries using pipes e.g.
 *
 * 	`14354|max_rating=AUOFLC-E|order=asc|order_by=year-added,65473|page_size=30,3234`
 *
 * 	_Note the id must always come first for each encoded list query_
 *
 * 	List parameters may be provide without the `param=` prefix e.g. `14354|genre:action`
 *
 * 	Only the following options can be present.
 * 	  - `order`
 * 	  - `order_by`
 * 	  - `max_rating`
 * 	  - `page_size`
 * 	  - `item_type`
 * 	  - `param`
 * @param {object} options Optional options
 * @param {number} [options.pageSize=12] The number of items to return in a page.
 * @param {string} [options.maxRating] The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
 * @param {string} [options.order=desc] Enum: asc, desc. The list sort order, either 'asc' or 'desc'.
 * @param {string} [options.orderBy] Enum: a-z, release-year, date-added. What to order by.
 * @param {string} [options.itemType] Enum: movie, show, season, episode, program, link, trailer, channel, customAsset, event, competition, confederation, stage, persona, team, credit, article. The item type to filter by. Defaults to unspecified.
 * @param {string} [options.device=web_browser] The type of device the content is targeting.
 * @param {string} [options.sub] The active subscription code.
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.ItemList[]>} The array of item lists requested. Or empty one if requested list is not profile specific
 */
export function getProfileLists(
	ids: string[],
	options?: GetProfileListsOptions
): Promise<api.Response<api.ItemList[]>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			ids: gateway.formatArrayParam(ids, 'csv', 'ids'),
			page_size: options.pageSize,
			max_rating: options.maxRating,
			order: options.order,
			order_by: options.orderBy,
			item_type: options.itemType,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getProfileListsOperation, parameters);
}

/**
 * Get the map of rated item ids (itemId => rating out of 10) under the active profile.
 *
 * @param {object} options Optional options
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<object>} OK
 */
export function getRatings(options?: GetRatingsOptions): Promise<api.Response<{ [key: string]: number }>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getRatingsOperation, parameters);
}

/**
 * Returns the list of rated items under the active profile.
 *
 * **NOTE:** the `getProfileLists` service is preferred over this as it supports
 * batching requests for lists
 *
 * @param {object} options Optional options
 * @param {number} [options.page=1] The page of items to load. Starts from page 1.
 * @param {number} [options.pageSize=12] The number of items to return in a page.
 * @param {string} [options.order=desc] Enum: asc, desc. The list sort order, either 'asc' or 'desc'.
 * @param {string} [options.orderBy=date-added] Enum: date-added, date-modified. What to order by.
 *
 * 	Ordering by `date-modified` equates to ordering by the last rated date.
 * @param {string} [options.itemType] Enum: movie, show, season, episode, program, link, trailer, channel, customAsset, event, competition, confederation, stage, persona, team, credit, article. The item type to filter by. Defaults to unspecified.
 * @param {string} [options.device=web_browser] The type of device the content is targeting.
 * @param {string} [options.sub] The active subscription code.
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.ItemList>} The list of items requested.
 */
export function getRatingsList(options?: GetRatingsListOptions): Promise<api.Response<api.ItemList>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			page: options.page,
			page_size: options.pageSize,
			order: options.order,
			order_by: options.orderBy,
			item_type: options.itemType,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getRatingsListOperation, parameters);
}

/**
 * Get the rating info for an item under the active profile.
 *
 * @param {string} itemId The id of the item to get the rating info for.
 * @param {object} options Optional options
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.UserRating>} OK
 */
export function getItemRating(itemId: string, options?: GetItemRatingOptions): Promise<api.Response<api.UserRating>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			itemId
		},
		query: {
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getItemRatingOperation, parameters);
}

/**
 * Rate an item under the active profile.
 *
 * Creates one if it doesn't exist, overwrites one if it does.
 *
 * @param {string} itemId The id of the item to rate.
 * @param {number} rating The item rating between 1 and 10 inclusive.
 * @param {object} options Optional options
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.UserRating>} OK.
 */
export function rateItem(
	itemId: string,
	rating: number,
	options?: RateItemOptions
): Promise<api.Response<api.UserRating>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			itemId
		},
		query: {
			rating,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(rateItemOperation, parameters);
}

/**
 * Get the list of reminders under the active profile.
 *
 * @param {object} options Optional options
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.Reminder[]>} OK
 */
export function getReminders(options?: GetRemindersOptions): Promise<api.Response<api.Reminder[]>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			lang: options.lang
		}
	};
	return gateway.request(getRemindersOperation, parameters);
}

/**
 * Add a new future reminder under the active profile.
 *
 * @param {module:types.ReminderRequest} body
 * @param {object} options Optional options
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.Reminder>} Details of the created reminder
 */
export function addReminder(
	body: api.ReminderRequest,
	options?: AddReminderOptions
): Promise<api.Response<api.Reminder>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		body: {
			body
		},
		query: {
			lang: options.lang
		}
	};
	return gateway.request(addReminderOperation, parameters);
}

/**
 * Delete a reminder.
 *
 * @param {string} id The identifier of the reminder to delete.
 * @param {object} options Optional options
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<object>} Profile deleted.
 */
export function deleteReminder(id: string, options?: DeleteReminderOptions): Promise<api.Response<any>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			id
		},
		query: {
			lang: options.lang
		}
	};
	return gateway.request(deleteReminderOperation, parameters);
}

/**
 * Get the map of watched item ids (itemId => last playhead position) under the active profile.
 *
 * @param {object} options Optional options
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<object>} OK
 */
export function getWatched(options?: GetWatchedOptions): Promise<api.Response<{ [key: string]: api.Watched }>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getWatchedOperation, parameters);
}

/**
 * Returns the list of watched items under the active profile.
 *
 * **NOTE:** the `getProfileLists` service is preferred over this as it supports
 * batching requests for lists
 *
 * @param {object} options Optional options
 * @param {number} [options.page=1] The page of items to load. Starts from page 1.
 * @param {number} [options.pageSize=12] The number of items to return in a page.
 * @param {boolean} [options.completed] Filter by whether an item has been fully watched (completed) or not.
 *
 * 	If `undefined` then both partially and fully watched items are returned.
 * @param {string} [options.order=desc] Enum: asc, desc. The list sort order, either 'asc' or 'desc'.
 * @param {string} [options.orderBy=date-added] Enum: date-added, date-modified. What to order by.
 *
 * 	Ordering by `date-modified` equates to ordering by the last watched date.
 * @param {string} [options.itemType] Enum: movie, show, season, episode, program, link, trailer, channel, customAsset, event, competition, confederation, stage, persona, team, credit, article. The item type to filter by. Defaults to unspecified.
 * @param {string} [options.device=web_browser] The type of device the content is targeting.
 * @param {string} [options.sub] The active subscription code.
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.ItemList>} The list of items requested.
 */
export function getWatchedList(options?: GetWatchedListOptions): Promise<api.Response<api.ItemList>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			page: options.page,
			page_size: options.pageSize,
			completed: options.completed,
			order: options.order,
			order_by: options.orderBy,
			item_type: options.itemType,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getWatchedListOperation, parameters);
}

/**
 * Get the watched status info for an item under the active profile.
 *
 * @param {string} itemId The id of the item to get the watched status for.
 * @param {object} options Optional options
 * @param {string[]} [options.segments] The list of segments to filter the response by.
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.Watched>} OK
 */
export function getItemWatchedStatus(
	itemId: string,
	options?: GetItemWatchedStatusOptions
): Promise<api.Response<api.Watched>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			itemId
		},
		query: {
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getItemWatchedStatusOperation, parameters);
}

export interface GetProfileOptions {
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface GetBookmarksOptions {
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface DeleteItemBookmarksOptions {
	/**
	 * An array of item ids to be unbookmarked.
	 *
	 * 	If parameter is not provided or empty, all bookmarks will be cleared.
	 */
	itemIds?: string[];
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface GetBookmarkListOptions {
	/**
	 * The page of items to load. Starts from page 1.
	 */
	page?: number;
	/**
	 * The number of items to return in a page.
	 */
	pageSize?: number;
	/**
	 * The sorting field, either the 'date-added', 'release-year' or 'a-z' (title).
	 */
	orderBy?: 'a-z' | 'release-year' | 'date-added';
	/**
	 * The sort order of the returned list, either 'asc' or 'desc'.
	 */
	order?: 'asc' | 'desc';
	/**
	 * The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
	 */
	maxRating?: string;
	/**
	 * The item type to filter by. Defaults to unspecified.
	 */
	itemType?:
		| 'movie'
		| 'show'
		| 'season'
		| 'episode'
		| 'program'
		| 'link'
		| 'trailer'
		| 'channel'
		| 'customAsset'
		| 'event'
		| 'competition'
		| 'confederation'
		| 'stage'
		| 'persona'
		| 'team'
		| 'credit';
	/**
	 * The type of device the content is targeting.
	 */
	device?: string;
	/**
	 * The active subscription code.
	 */
	sub?: string;
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface GetItemBookmarkOptions {
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface BookmarkItemOptions {
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface DeleteItemBookmarkOptions {
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface DeleteContinueWatchingOptions {
	/**
	 * An array of item ids to be removed from continue watching list.
	 *
	 * 	If parameter is 0, all continue watching items will be cleared.
	 */
	itemIds?: string[];
	/**
	 * The type of device the content is targeting.
	 */
	device?: string;
	/**
	 * The active subscription code.
	 */
	sub?: string;
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface GetContinueWatchingListOptions {
	/**
	 * The item type to be returned for continue watching items belonging to a show.
	 *
	 * 	Multiple episodes under the same show may be watched or in progress, however only a
	 * 	single item belonging to a particular show will be included in the returned list.
	 *
	 * 	The next episode to continue watching for a particular show will be the most recent
	 * 	incompletely watched episode, or the next episode following the most recently
	 * 	completely watched episode. Based on the specified `show_item_type` type, either the next
	 * 	episode, the season of the next episode, or the show will be included in the list.
	 *
	 * 	If `episode` is specified, then only the next episode to continue watching for a
	 * 	show will be returned.
	 *
	 * 	If `season` is specified, then only the season of the next episode will be returned.
	 *
	 * 	If `show` is specified, then only the show of the next episode will be returned
	 *
	 * 	The recommended value of this parameter should reflect the desitination the
	 * 	user will be sent to when they select this item in the list. So if a user will
	 * 	be sent to the show detail page then this should be `show` and you can use
	 * 	the `include` parameter to get metadata about the episode or season if needed
	 */
	showItemType?: 'episode' | 'season' | 'show';
	/**
	 * Include one opr more ancestor/children for items belonging to a show. Extra items
	 * 	will be populated in the `listData` property of the list
	 *
	 * 	If no value is specified no dependencies are included.
	 *
	 * 	If `episode` is specified, then the next episode will be added for season/show
	 * 	items. Has no effect if `show_item_type` is set to `episode`.
	 *
	 * 	If `season` is specified, then the season of the next episode will be added for
	 * 	episode/show items. Has no effect if `show_item_type` is set to `season`.
	 *
	 * 	If `show` is specified, then the show of the next episode will be added for
	 * 	episode/season items. Has no effect if `show_item_type` is set to `show`.
	 */
	include?: ('episode' | 'season' | 'show')[];
	/**
	 * The page of items to load. Starts from page 1.
	 */
	page?: number;
	/**
	 * The number of items to return in a page.
	 */
	pageSize?: number;
	/**
	 * The maximum rating (inclusive) of an item returned, e.g. 'auoflc-pg'.
	 */
	maxRating?: string;
	/**
	 * The type of device the content is targeting.
	 */
	device?: string;
	/**
	 * The active subscription code.
	 */
	sub?: string;
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface GetFollowsOptions {
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface GetFollowListOptions {
	/**
	 * The page of items to load. Starts from page 1.
	 */
	page?: number;
	/**
	 * The number of items to return in a page.
	 */
	pageSize?: number;
	/**
	 * The 'date-added' sort order of the returned list, either 'asc' or 'desc'.
	 */
	order?: 'asc' | 'desc';
	/**
	 * The item type to filter by. Defaults to unspecified.
	 */
	itemType?:
		| 'movie'
		| 'show'
		| 'season'
		| 'episode'
		| 'program'
		| 'link'
		| 'trailer'
		| 'channel'
		| 'customAsset'
		| 'event'
		| 'competition'
		| 'confederation'
		| 'stage'
		| 'persona'
		| 'team'
		| 'credit';
	/**
	 * The type of device the content is targeting.
	 */
	device?: string;
	/**
	 * The active subscription code.
	 */
	sub?: string;
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface GetItemFollowOptions {
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface FollowItemOptions {
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface UnfollowItemOptions {
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface GetNextPlaybackItemOptions {
	/**
	 * The maximum rating (inclusive) of an item returned, e.g. 'auoflc-pg'.
	 */
	maxRating?: string;
	/**
	 * If no value is specified no dependencies are expanded.
	 *
	 * 	If 'parent' is specified then only the direct parent will be expanded.
	 * 	For example if an `Episode` then the `Season` would be included.
	 *
	 * 	If 'ancestors' is specified then the full parent chain is expanded.
	 * 	For example if an `Episode` then both the `Season` and `Show` would be included.
	 */
	expand?: 'parent' | 'ancestors';
	/**
	 * The type of device the content is targeting.
	 */
	device?: string;
	/**
	 * The active subscription code.
	 */
	sub?: string;
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface GetProfileListsOptions {
	/**
	 * The number of items to return in a page.
	 */
	pageSize?: number;
	/**
	 * The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
	 */
	maxRating?: string;
	/**
	 * The list sort order, either 'asc' or 'desc'.
	 */
	order?: 'asc' | 'desc';
	/**
	 * What to order by.
	 */
	orderBy?: 'a-z' | 'release-year' | 'date-added';
	/**
	 * The item type to filter by. Defaults to unspecified.
	 */
	itemType?:
		| 'movie'
		| 'show'
		| 'season'
		| 'episode'
		| 'program'
		| 'link'
		| 'trailer'
		| 'channel'
		| 'customAsset'
		| 'event'
		| 'competition'
		| 'confederation'
		| 'stage'
		| 'persona'
		| 'team'
		| 'credit';
	/**
	 * The type of device the content is targeting.
	 */
	device?: string;
	/**
	 * The active subscription code.
	 */
	sub?: string;
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface GetRatingsOptions {
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface GetRatingsListOptions {
	/**
	 * The page of items to load. Starts from page 1.
	 */
	page?: number;
	/**
	 * The number of items to return in a page.
	 */
	pageSize?: number;
	/**
	 * The list sort order, either 'asc' or 'desc'.
	 */
	order?: 'asc' | 'desc';
	/**
	 * What to order by.
	 *
	 * 	Ordering by `date-modified` equates to ordering by the last rated date.
	 */
	orderBy?: 'date-added' | 'date-modified';
	/**
	 * The item type to filter by. Defaults to unspecified.
	 */
	itemType?:
		| 'movie'
		| 'show'
		| 'season'
		| 'episode'
		| 'program'
		| 'link'
		| 'trailer'
		| 'channel'
		| 'customAsset'
		| 'event'
		| 'competition'
		| 'confederation'
		| 'stage'
		| 'persona'
		| 'team'
		| 'credit';
	/**
	 * The type of device the content is targeting.
	 */
	device?: string;
	/**
	 * The active subscription code.
	 */
	sub?: string;
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface GetItemRatingOptions {
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface RateItemOptions {
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface GetRemindersOptions {
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface AddReminderOptions {
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface DeleteReminderOptions {
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface GetWatchedOptions {
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface GetWatchedListOptions {
	/**
	 * The page of items to load. Starts from page 1.
	 */
	page?: number;
	/**
	 * The number of items to return in a page.
	 */
	pageSize?: number;
	/**
	 * Filter by whether an item has been fully watched (completed) or not.
	 *
	 * 	If `undefined` then both partially and fully watched items are returned.
	 */
	completed?: boolean;
	/**
	 * The list sort order, either 'asc' or 'desc'.
	 */
	order?: 'asc' | 'desc';
	/**
	 * What to order by.
	 *
	 * 	Ordering by `date-modified` equates to ordering by the last watched date.
	 */
	orderBy?: 'date-added' | 'date-modified';
	/**
	 * The item type to filter by. Defaults to unspecified.
	 */
	itemType?:
		| 'movie'
		| 'show'
		| 'season'
		| 'episode'
		| 'program'
		| 'link'
		| 'trailer'
		| 'channel'
		| 'customAsset'
		| 'event'
		| 'competition'
		| 'confederation'
		| 'stage'
		| 'persona'
		| 'team'
		| 'credit';
	/**
	 * The type of device the content is targeting.
	 */
	device?: string;
	/**
	 * The active subscription code.
	 */
	sub?: string;
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface GetItemWatchedStatusOptions {
	/**
	 * The list of segments to filter the response by.
	 */
	segments?: string[];
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

const getProfileOperation: api.OperationInfo = {
	path: '/account/profile',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getBookmarksOperation: api.OperationInfo = {
	path: '/account/profile/bookmarks',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const deleteItemBookmarksOperation: api.OperationInfo = {
	path: '/account/profile/bookmarks',
	method: 'delete',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getBookmarkListOperation: api.OperationInfo = {
	path: '/account/profile/bookmarks/list',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getItemBookmarkOperation: api.OperationInfo = {
	path: '/account/profile/bookmarks/{itemId}',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const bookmarkItemOperation: api.OperationInfo = {
	path: '/account/profile/bookmarks/{itemId}',
	method: 'put',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const deleteItemBookmarkOperation: api.OperationInfo = {
	path: '/account/profile/bookmarks/{itemId}',
	method: 'delete',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const deleteContinueWatchingOperation: api.OperationInfo = {
	path: '/account/profile/continue-watching',
	method: 'delete',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getContinueWatchingListOperation: api.OperationInfo = {
	path: '/account/profile/continue-watching/list',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getFollowsOperation: api.OperationInfo = {
	path: '/account/profile/follows',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getFollowListOperation: api.OperationInfo = {
	path: '/account/profile/follows/list',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getItemFollowOperation: api.OperationInfo = {
	path: '/account/profile/follows/{itemId}',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const followItemOperation: api.OperationInfo = {
	path: '/account/profile/follows/{itemId}',
	method: 'put',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const unfollowItemOperation: api.OperationInfo = {
	path: '/account/profile/follows/{itemId}',
	method: 'delete',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getNextPlaybackItemOperation: api.OperationInfo = {
	path: '/account/profile/items/{itemId}/next',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getProfileListsOperation: api.OperationInfo = {
	path: '/account/profile/lists',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getRatingsOperation: api.OperationInfo = {
	path: '/account/profile/ratings',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getRatingsListOperation: api.OperationInfo = {
	path: '/account/profile/ratings/list',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getItemRatingOperation: api.OperationInfo = {
	path: '/account/profile/ratings/{itemId}',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const rateItemOperation: api.OperationInfo = {
	path: '/account/profile/ratings/{itemId}',
	method: 'put',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getRemindersOperation: api.OperationInfo = {
	path: '/account/profile/reminders',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const addReminderOperation: api.OperationInfo = {
	path: '/account/profile/reminders',
	contentTypes: ['application/json'],
	method: 'post',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const deleteReminderOperation: api.OperationInfo = {
	path: '/account/profile/reminders/{id}',
	method: 'delete',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getWatchedOperation: api.OperationInfo = {
	path: '/account/profile/watched',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getWatchedListOperation: api.OperationInfo = {
	path: '/account/profile/watched/list',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getItemWatchedStatusOperation: api.OperationInfo = {
	path: '/account/profile/watched/{itemId}',
	method: 'get',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};
