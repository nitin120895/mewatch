/// <reference path="types.ts"/>
/** @module anonymous */
// Auto-generated, edits will be overwritten
import * as gateway from './gateway';

/**
 * Remove continue watching item(s) under the anonymous profile.
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
export function deleteAnonymousContinueWatching(
	options?: DeleteAnonymousContinueWatchingOptions
): Promise<api.Response<any>> {
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
	return gateway.request(deleteAnonymousContinueWatchingOperation, parameters);
}

/**
 * Returns a list of items which have been watched but not completed under the anonymous
 * user.
 *
 * Multiple episodes under the same show may be watched or in progress, however only a
 * single item belonging to a particular show will be included in the returned list.
 *
 * The next episode to continue watching for a particular show will be the most recent
 * incompletely watched episode, or the next episode following the most recently
 * completely watched episode. Based on the specified `show_item_type` type, either the next
 * episode, the season of the next episode, or the show will be included in the list.
 *
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
export function getAnonymousContinueWatchingList(
	options?: GetAnonymousContinueWatchingListOptions
): Promise<api.Response<api.ItemList>> {
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
	return gateway.request(getAnonymousContinueWatchingListOperation, parameters);
}

/**
 * Request Country code with 'X-Forwarded-For' value for anonymous user.
 */
export function requestCountryCode(): Promise<api.Response<api.CountryCode>> {
	return gateway.request(requestCountryCodeOperation);
}

/**
 * Get the map of watched item ids (itemId => last playhead position) under the anonymous user.
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
export function getWatchedAnonymous(
	options?: GetWatchedAnonymousOptions
): Promise<api.Response<{ [key: string]: api.Watched }>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getWatchedAnonymousOperation, parameters);
}

/**
 * Remove the watched status of items under the anonymous user. Passing in
 * specific `itemId`s to the `item_ids` query parameter will cause only these
 * items to be removed. **If this list is missing all watched items will be
 * removed**
 *
 * @param {object} options Optional options
 * @param {string[]} [options.itemIds] List of `itemId`s to delete. Omit this parameter to delete all items
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
 * @return {Promise<object>} Watched statuses deleted.
 */
export function deleteWatchedAnonymous(options?: DeleteWatchedAnonymousOptions): Promise<api.Response<any>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			item_ids: gateway.formatArrayParam(options.itemIds, 'csv', 'item_ids'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(deleteWatchedAnonymousOperation, parameters);
}

/**
 * Returns the list of watched items under the anonymous user.
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
export function getWatchedListAnonymous(options?: GetWatchedListAnonymousOptions): Promise<api.Response<api.ItemList>> {
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
	return gateway.request(getWatchedListAnonymousOperation, parameters);
}

/**
 * Get the watched status info for an item under the anonymous user.
 *
 * @param {string} itemId The id of the item to get the watched status for.
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
 * @return {Promise<module:types.Watched>} OK
 */
export function getItemWatchedStatusAnonymous(
	itemId: string,
	options?: GetItemWatchedStatusAnonymousOptions
): Promise<api.Response<api.Watched>> {
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
	return gateway.request(getItemWatchedStatusAnonymousOperation, parameters);
}

/**
 * Record the watched playhead position of a video under the anonymous user.
 *
 * Can be used later to resume a video from where it was last watched.
 *
 * Creates one if it doesn't exist, overwrites one if it does.
 *
 * @param {string} itemId The id of the item being watched.
 * @param {number} position The playhead position to record.
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
 * @return {Promise<module:types.Watched>} OK.
 */
export function setItemWatchedStatusAnonymous(
	itemId: string,
	position: number,
	options?: SetItemWatchedStatusAnonymousOptions
): Promise<api.Response<api.Watched>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			itemId
		},
		query: {
			position,
			lang: options.lang,
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff')
		}
	};
	return gateway.request(setItemWatchedStatusAnonymousOperation, parameters);
}

export interface DeleteAnonymousContinueWatchingOptions {
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

export interface GetAnonymousContinueWatchingListOptions {
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

export interface GetWatchedAnonymousOptions {
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

export interface DeleteWatchedAnonymousOptions {
	/**
	 * List of `itemId`s to delete. Omit this parameter to delete all items
	 */
	itemIds?: string[];
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

export interface GetWatchedListAnonymousOptions {
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
		| 'credit'
		| 'article';
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

export interface GetItemWatchedStatusAnonymousOptions {
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

export interface SetItemWatchedStatusAnonymousOptions {
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
}

const deleteAnonymousContinueWatchingOperation: api.OperationInfo = {
	path: '/continue-watching',
	method: 'delete',
	security: [
		{
			id: 'anonymousAuth',
			scopes: ['Catalog']
		}
	]
};

const getAnonymousContinueWatchingListOperation: api.OperationInfo = {
	path: '/continue-watching/list',
	method: 'get',
	security: [
		{
			id: 'anonymousAuth',
			scopes: ['Catalog']
		}
	]
};

const requestCountryCodeOperation: api.OperationInfo = {
	path: '/country-code',
	method: 'get',
	security: [
		{
			id: 'anonymousAuth',
			scopes: ['Catalog']
		}
	]
};

const getWatchedAnonymousOperation: api.OperationInfo = {
	path: '/watched',
	method: 'get',
	security: [
		{
			id: 'anonymousAuth',
			scopes: ['Catalog']
		}
	]
};

const deleteWatchedAnonymousOperation: api.OperationInfo = {
	path: '/watched',
	method: 'delete',
	security: [
		{
			id: 'anonymousAuth',
			scopes: ['Catalog']
		}
	]
};

const getWatchedListAnonymousOperation: api.OperationInfo = {
	path: '/watched/list',
	method: 'get',
	security: [
		{
			id: 'anonymousAuth',
			scopes: ['Catalog']
		}
	]
};

const getItemWatchedStatusAnonymousOperation: api.OperationInfo = {
	path: '/watched/{itemId}',
	method: 'get',
	security: [
		{
			id: 'anonymousAuth',
			scopes: ['Catalog']
		}
	]
};

const setItemWatchedStatusAnonymousOperation: api.OperationInfo = {
	path: '/watched/{itemId}',
	method: 'put',
	security: [
		{
			id: 'anonymousAuth',
			scopes: ['Catalog']
		}
	]
};
