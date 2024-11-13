/// <reference path="types.ts"/>
/** @module content */
// Auto-generated, edits will be overwritten
import * as gateway from './gateway';

/**
 * Returns the details of an item with the specified id.
 *
 * @param {string} id The identifier of the item to load.
 *
 * 	The custom identifier of an item can be used here if the `use_custom_id` parameter is true.
 * @param {object} options Optional options
 * @param {string} [options.maxRating] The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
 * @param {string} [options.expand] Enum: all, children, ancestors, parent. If no value is specified no dependencies are expanded.
 *
 * 	If 'children' is specified then the list of any direct children will be expanded. For example
 * 	seasons of a show or episodes of a season.
 *
 * 	If 'all' is specified then the parent chain will be expanded along with any child list at each level.
 * 	For example if an episode is specified then its season will be expanded and that season's episode list.
 * 	The season will have its show expanded and the show will have its season list expanded.
 *
 * 	The 'all' options is useful when you deep link into a show/season/episode for the first time as
 * 	it provides full context for navigating around the show page. Subsequent navigation around
 * 	children of the show should only need to request expand of children.
 *
 * 	If 'ancestors' is specified then only the parent chain is included.
 *
 * 	If 'parent' is specified then only the direct parent is included.
 *
 * 	If an expand is specified which is not relevant to the item type, it will be ignored.
 * @param {string} [options.selectSeason] Enum: first, latest. Given a provided show id, it can be useful to get the details of a child season. This option
 * 	provides a means to return the `first` or `latest` season of a show given the show id.
 *
 * 	The `expand` parameter also works here so for example you could land on a show page and request the
 * 	latest season along with `expand=all`. This would then return the detail of the latest season with
 * 	its list of child episode summaries, and also expand the detail of the show with its list of seasons summaries.
 *
 * 	Note the `id` parameter must be a show id for this parameter to work correctly.
 * @param {boolean} [options.useCustomId] Set to true when passing a custom Id as the `id` path parameter.
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
 * @return {Promise<module:types.ItemDetail>} The item requested
 */
export function getItem(id: string, options?: GetItemOptions): Promise<api.Response<api.ItemDetail>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			id
		},
		query: {
			max_rating: options.maxRating,
			expand: options.expand,
			select_season: options.selectSeason,
			use_custom_id: options.useCustomId,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getItemOperation, parameters);
}

/**
 * Returns the List of child summary items under an item.
 *
 * If the item is a Season then the children will be episodes and ordered by episode number.
 *
 * If the item is a Show then the children will be Seasons and ordered by season number.
 *
 * Returns 404 if no children found.
 *
 * @param {string} id The identifier of the item whose children to load.
 * @param {object} options Optional options
 * @param {number} [options.episodeNumber] The filter by episode number.
 * @param {number} [options.seasonNumber] The filter by season number.
 * @param {number} [options.page=1] The page of items to load. Starts from page 1.
 * @param {number} [options.pageSize=12] The number of items to return in a page.
 * @param {string} [options.maxRating] The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
 * @param {string} [options.order=asc] Enum: asc, desc. The sort order of the returned list, either 'asc' or 'desc'.
 * 	If a list of Seasons the list is ordered by season number.
 * 	If a list of Episodes the list is ordered by episode number.
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
export function getItemChildrenList(
	id: string,
	options?: GetItemChildrenListOptions
): Promise<api.Response<api.ItemList>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			id
		},
		query: {
			episode_number: options.episodeNumber,
			season_number: options.seasonNumber,
			page: options.page,
			page_size: options.pageSize,
			max_rating: options.maxRating,
			order: options.order,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getItemChildrenListOperation, parameters);
}

/**
 * Returns the list of recommended similar items.
 * The similarity of two items is determined by the similarity of their corresponding fields, which are set in 'Recommendations' section of ISL configuration file.
 * That configuration specifies some aspects of output of this list:
 * Each configured field has a weigth, which indicates how much the equality of two items' values makes them more or less similar (the bigger the weigth is - the more similar items with equal values are).
 * Additionally, 'UseCosine' configuration option determines how fast similarity of multi-value fields grows.
 *
 * This list is not determined by assets' relations and is used by rows D5, D6, D7 "Related" to load more assets.
 *
 * Note for now, due to the size of the list being unknown, only a single page will be returned.
 * However, the count of returned items will not exceed the limit, which is set in configuration 'NumberOfRecommendation' field.
 *
 * @param {string} id The identifier of the item to based related items off.
 * @param {object} options Optional options
 * @param {number} [options.page=1] The page of items to load. Starts from page 1.
 * @param {number} [options.pageSize=12] The number of items to return in a page.
 * @param {string} [options.maxRating] The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
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
export function getItemRelatedList(
	id: string,
	options?: GetItemRelatedListOptions
): Promise<api.Response<api.ItemList>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			id
		},
		query: {
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
	return gateway.request(getItemRelatedListOperation, parameters);
}

/**
 * Returns the episodes information under a show.
 *
 * @param {string} id The identifier of the item whose children to load.
 * @param {object} options Optional options
 * @param {number} [options.page=1] The page of items to load. Starts from page 1.
 * @param {number} [options.pageSize=12] The number of items to return in a page.
 * @param {string} [options.maxRating] The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
 * @param {string} [options.order=asc] Enum: asc, desc. The sort order of the returned list, either 'asc' or 'desc'.
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
 * @return {Promise<module:types.ShowEpisodesResponse>} The list of episodes and season information requested.
 */
export function getShowEpisodes(
	id: string,
	options?: GetShowEpisodesOptions
): Promise<api.Response<api.ShowEpisodesResponse>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			id
		},
		query: {
			page: options.page,
			page_size: options.pageSize,
			max_rating: options.maxRating,
			order: options.order,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getShowEpisodesOperation, parameters);
}

/**
 * Get the start-over video files associated with a live channel given maximum resolution, device type
 * and schedule custom id.
 *
 * Returns an array of video file objects which each include a url to a video.
 *
 * The first entry in the array contains what is predicted to be the best match.
 * The remainder of the entries, if any, may contain resolutions below what was
 * requests. For example if you request HD-720 the response may also contain
 * SD entries.
 *
 * If no files are found a 404 is returned.
 *
 * @param {string} id The identifier of the live channel whose video files to load.
 * @param {string} scheduleCustomId The identifier of the schedule.
 * @param {string} resolution Enum: HD-4K, HD-1080, HD-720, VR-360, SD, External. The maximum resolution the device to playback the media can present.
 * @param {string} device The type of device the content is targeting.
 * @param {object} options Optional options
 * @param {string[]} [options.formats] The set of media file formats that the device supports, in the order of preference.
 *
 * 	When provided, Rocket API returns only media files in formats specified in this parameter. For each resolution, only the first media file of matching supported format is returned. Files of different resolutions may be of different supported media file formats.
 *
 * 	`external` value is reserved for project customizations where the real MIME type of the file on the specified URL is unknown at the time of ingestion.
 *
 * 	When not provided, Rocket API uses the legacy `User-Agent` header-based logic to find matching media files.
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
 * @return {Promise<module:types.MediaFile[]>} The list of video files available.
 * 	The first entry containing what is predicted to be the best match.
 */
export function getPublicStartOverFiles(
	id: string,
	scheduleCustomId: string,
	resolution: 'HD-4K' | 'HD-1080' | 'HD-720' | 'VR-360' | 'SD' | 'External',
	device: string,
	options?: GetPublicStartOverFilesOptions
): Promise<api.Response<api.MediaFile[]>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			id
		},
		query: {
			scheduleCustomId,
			resolution,
			formats: gateway.formatArrayParam(options.formats, 'csv', 'formats'),
			device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getPublicStartOverFilesOperation, parameters);
}

/**
 * Get the free / public video files associated with an item given maximum resolution,
 * device type and one or more delivery types.
 *
 * Returns an array of video file objects which each include a url to a video.
 *
 * The first entry in the array contains what is predicted to be the best match.
 * The remainder of the entries, if any, may contain resolutions below what was
 * requests. For example if you request HD-720 the response may also contain
 * SD entries.
 *
 * If you specify multiple delivery types, then the response array will insert
 * types in the order you specify them in the query. For example `stream,progressive`
 * would return an array with 0 or more stream files followed by 0 or more progressive files.
 *
 * If no files are found a 404 is returned.
 *
 * @param {string} id The identifier of the item whose video files to load.
 * @param {string[]} delivery The video delivery type you require.
 * @param {string} resolution Enum: HD-4K, HD-1080, HD-720, VR-360, SD, External. The maximum resolution the device to playback the media can present.
 * @param {string} device The type of device the content is targeting.
 * @param {object} options Optional options
 * @param {string[]} [options.formats] The set of media file formats that the device supports, in the order of preference.
 *
 * 	When provided, Rocket API returns only media files in formats specified in this parameter. For each resolution, only the first media file of matching supported format is returned. Files of different resolutions may be of different supported media file formats.
 *
 * 	`external` value is reserved for project customizations where the real MIME type of the file on the specified URL is unknown at the time of ingestion.
 *
 * 	When not provided, Rocket API uses the legacy `User-Agent` header-based logic to find matching media files.
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
 * @return {Promise<module:types.MediaFile[]>} The list of video files available.
 * 	The first entry containing what is predicted to be the best match.
 */
export function getPublicItemMediaFiles(
	id: string,
	delivery: ('stream' | 'progressive' | 'download')[],
	resolution: 'HD-4K' | 'HD-1080' | 'HD-720' | 'VR-360' | 'SD' | 'External',
	device: string,
	options?: GetPublicItemMediaFilesOptions
): Promise<api.Response<api.MediaFile[]>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			id
		},
		query: {
			delivery: gateway.formatArrayParam(delivery, 'csv', 'delivery'),
			resolution,
			formats: gateway.formatArrayParam(options.formats, 'csv', 'formats'),
			device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getPublicItemMediaFilesOperation, parameters);
}

/**
 * Identical to GET /account/profile/items/{itemId}/next route but for users
 * that are not logged in i.e. this endpoint does not require authorisation
 *
 * @param {string} itemId The identifier of the source item to base the next to watch item off.
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
export function getAnonymousNextPlaybackItem(
	itemId: string,
	options?: GetAnonymousNextPlaybackItemOptions
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
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getAnonymousNextPlaybackItemOperation, parameters);
}

/**
 * Returns a list of recommendation items for a widget.
 *
 * @param {string} widgetId The identifier of the widget.
 * @param {object} options Optional options
 * @param {string} [options.currentUrl] The url of the page where the widget is displayed.
 * @param {string} [options.prnd] The string parameter used for page view tracking.
 * @param {string[]} [options.genres] The list of genres from the item detail page.
 * 	Use with "You May Also Like" and "End of playback" widgets.
 * @param {string[]} [options.genreAliases] The list of genre aliases from the profile recommendation settings.
 * 	Use with "Cold Start" and "Top Picks" widgets.
 *
 * 	### Aliases
 *
 * 	- `b` - Comedy
 * 	- `c` - Drama
 * 	- `d` - Documentary
 * 	- `g` - Variety
 * 	- `h` - Kids
 * 	- `i` - Current Affairs
 * 	- `k` - Sports
 * @param {string[]} [options.audioLanguages] The list of audio languages from the profile recommendation settings
 * 	or from item detail page.
 * @param {string[]} [options.credits] The list of credits from the profile recommendation settings
 * 	or from item detail page.
 * @param {number} [options.page=1]
 * @param {number} [options.pageSize=12]
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
export function getRecommendationsList(
	widgetId: string,
	options?: GetRecommendationsListOptions
): Promise<api.Response<api.ItemList>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			widgetId
		},
		query: {
			current_url: options.currentUrl,
			prnd: options.prnd,
			genres: gateway.formatArrayParam(options.genres, 'csv', 'genres'),
			genre_aliases: gateway.formatArrayParam(options.genreAliases, 'csv', 'genre_aliases'),
			audio_languages: gateway.formatArrayParam(options.audioLanguages, 'csv', 'audio_languages'),
			credits: gateway.formatArrayParam(options.credits, 'csv', 'credits'),
			page: options.page,
			page_size: options.pageSize,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getRecommendationsListOperation, parameters);
}

/**
 * Returns a list of recommendation items for a BOOST widget.
 *
 * @param {string} widgetId The identifier of the widget.
 * @param {object} options Optional options
 * @param {string} [options.meId] The unique identifier of anonymous or signed in user.
 * @param {string} [options.contentId] The content's external identifier.
 * 	Expected to be populated when widget is placed on IDP
 * 	should not be specified otherwise (widget placed on home page etc).
 * @param {number} [options.DeviceType] Device unique identifier
 * @param {string[]} [options.product] The list of product IDs from the profile recommendation settings
 * 	or from item detail page.
 * @param {string} [options.timeZone] The time zone of anonymous or signed in user.
 * @param {string} [options.countryCode] Country Code of the user.
 * @param {string} [options.age] The age of anonymous or signed in user.
 * @param {string} [options.subGenre] Specific sub Genre filter.
 * @param {number} [options.page=1]
 * @param {number} [options.pageSize=12]
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
 * @return {Promise<module:types.BoostItemList>} The list of items requested.
 */
export function getBoostRecommendationsList(
	widgetId: string,
	options?: GetBoostRecommendationsListOptions
): Promise<api.Response<api.BoostItemList>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			widgetId
		},
		query: {
			meId: options.meId,
			contentId: options.contentId,
			DeviceType: options.DeviceType,
			product: gateway.formatArrayParam(options.product, 'csv', 'product'),
			timeZone: options.timeZone,
			countryCode: options.countryCode,
			age: options.age,
			subGenre: options.subGenre,
			page: options.page,
			page_size: options.pageSize,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getBoostRecommendationsListOperation, parameters);
}

/**
 * Returns a list of recommendation items for a widget.
 *
 * @param {string} widgetId The identifier of the widget.
 * @param {object} options Optional options
 * @param {string} [options.currentUrl] The url of the page where the widget is displayed.
 * @param {string[]} [options.genres] The list of genres from the item detail page.
 * 	Use with "You May Also Like" and "End of playback" widgets.
 * @param {string[]} [options.genreAliases] The list of genre aliases from the profile recommendation settings.
 * 	Use with "Cold Start" and "Top Picks" widgets.
 *
 * 	### Aliases
 *
 * 	- `b` - Comedy
 * 	- `c` - Drama
 * 	- `d` - Documentary
 * 	- `g` - Variety
 * 	- `h` - Kids
 * 	- `i` - Current Affairs
 * 	- `k` - Sports
 * @param {string[]} [options.audioLanguages] The list of audio languages from the profile recommendation settings
 * 	or from item detail page.
 * @param {string[]} [options.credits] The list of credits from the profile recommendation settings
 * 	or from item detail page.
 * @param {number} [options.page=1]
 * @param {number} [options.pageSize=12]
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
export function getCxenseRecommendationsList(
	widgetId: string,
	options?: GetCxenseRecommendationsListOptions
): Promise<api.Response<api.ItemList>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			widgetId
		},
		query: {
			current_url: options.currentUrl,
			genres: gateway.formatArrayParam(options.genres, 'csv', 'genres'),
			genre_aliases: gateway.formatArrayParam(options.genreAliases, 'csv', 'genre_aliases'),
			audio_languages: gateway.formatArrayParam(options.audioLanguages, 'csv', 'audio_languages'),
			credits: gateway.formatArrayParam(options.credits, 'csv', 'credits'),
			page: options.page,
			page_size: options.pageSize,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getCxenseRecommendationsListOperation, parameters);
}

/**
 * Returns a list of recommendation items for a ZOOM widget.
 *
 * @param {string} widgetId The identifier of the widget.
 * @param {object} options Optional options
 * @param {string} [options.meId] The unique identifier of anonymous or signed in user.
 * @param {string} [options.currentUrl] The url of the page where the widget is displayed.
 * @param {string} [options.contentId] The content's external identifier.
 * 	Expected to be populated when widget is placed on IDP
 * 	should not be specified otherwise (widget placed on home page etc).
 * @param {string} [options.cxenseId] The content's external identifier in Cxense recommendations engine.
 * 	Expected to be populated when widget is placed on IDP
 * 	should not be specified otherwise (widget placed on home page etc).
 * @param {string} [options.prnd] The string parameter used for page view tracking.
 * @param {string[]} [options.genres] The list of genres from the item detail page.
 * 	Use with "You May Also Like" and "End of playback" widgets.
 * @param {string[]} [options.genreAliases] The list of genre aliases from the profile recommendation settings.
 * 	Use with "Cold Start" and "Top Picks" widgets.
 *
 * 	### Aliases
 *
 * 	- `b` - Comedy
 * 	- `c` - Drama
 * 	- `d` - Documentary
 * 	- `g` - Variety
 * 	- `h` - Kids
 * 	- `i` - Current Affairs
 * 	- `k` - Sports
 * @param {string[]} [options.audioLanguages] The list of audio languages from the profile recommendation settings
 * 	or from item detail page.
 * @param {string[]} [options.credits] The list of credits from the profile recommendation settings
 * 	or from item detail page.
 * @param {number} [options.page=1]
 * @param {number} [options.pageSize=12]
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
export function getZoomRecommendationsList(
	widgetId: string,
	options?: GetZoomRecommendationsListOptions
): Promise<api.Response<api.ItemList>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			widgetId
		},
		query: {
			meId: options.meId,
			current_url: options.currentUrl,
			contentId: options.contentId,
			cxenseId: options.cxenseId,
			prnd: options.prnd,
			genres: gateway.formatArrayParam(options.genres, 'csv', 'genres'),
			genre_aliases: gateway.formatArrayParam(options.genreAliases, 'csv', 'genre_aliases'),
			audio_languages: gateway.formatArrayParam(options.audioLanguages, 'csv', 'audio_languages'),
			credits: gateway.formatArrayParam(options.credits, 'csv', 'credits'),
			page: options.page,
			page_size: options.pageSize,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getZoomRecommendationsListOperation, parameters);
}

/**
 * Returns an array of item lists with their first page of content resolved.
 *
 * @param {string[]} ids A comma delimited list of item list identifiers.
 *
 * 	These can be list ids e.g. `14354,65473,3234`
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
 * 	  - `audio_language`
 * 	  - `genre`
 * 	  - `param`
 * @param {object} options Optional options
 * @param {number} [options.pageSize=12] The number of items to return in a page.
 * @param {string} [options.maxRating] The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
 * @param {string} [options.order=desc] Enum: asc, desc. The list sort order, either 'asc' or 'desc'.
 * @param {string} [options.orderBy] Enum: a-z, release-year, date-added. What to order by.
 * @param {string} [options.itemType] Enum: movie, show, season, episode, program, link, trailer, channel, customAsset, event, competition, confederation, stage, persona, team, credit, article. The item type to filter by. Defaults to unspecified.
 * @param {string} [options.audioLanguage] filters the list result based on the content language
 * @param {string} [options.genre] filters the list result based on the genre
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
 * @return {Promise<module:types.ItemList[]>} The array of item lists requested.
 */
export function getLists(ids: string[], options?: GetListsOptions): Promise<api.Response<api.ItemList[]>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			ids: gateway.formatArrayParam(ids, 'csv', 'ids'),
			page_size: options.pageSize,
			max_rating: options.maxRating,
			order: options.order,
			order_by: options.orderBy,
			item_type: options.itemType,
			audio_language: options.audioLanguage,
			genre: options.genre,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getListsOperation, parameters);
}

/**
 * Returns a list of items under the specified item list
 *
 * @param {string} id The identifier of the list to load.
 * @param {object} options Optional options
 * @param {number} [options.page=1] The page of items to load. Starts from page 1.
 * @param {number} [options.pageSize=12] The number of items to return in a page.
 * @param {string} [options.maxRating] The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
 * @param {string} [options.order=desc] Enum: asc, desc. The list sort order, either 'asc' or 'desc'.
 * @param {string} [options.orderBy] Enum: a-z, release-year, date-added. What to order by.
 * @param {string} [options.param] The list parameter in format 'key:value', e.g. 'genre:action'.
 * @param {string} [options.itemType] Enum: movie, show, season, episode, program, link, trailer, channel, customAsset, event, competition, confederation, stage, persona, team, credit, article. The item type to filter by. Defaults to unspecified.
 * @param {string} [options.audioLanguage] filters the list result based on the content language
 * @param {string} [options.genre] filters the list result based on the genre
 * @param {string[]} [options.relations] A comma separated list of a colon delimited pairs where first member is a relationship type and the second member is the id of an asset that all the returned assets must be related to in that type of relationship (e.g. relations=stage:1234,other:4567).
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
export function getList(id: string, options?: GetListOptions): Promise<api.Response<api.ItemList>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			id
		},
		query: {
			page: options.page,
			page_size: options.pageSize,
			max_rating: options.maxRating,
			order: options.order,
			order_by: options.orderBy,
			param: options.param,
			item_type: options.itemType,
			audio_language: options.audioLanguage,
			genre: options.genre,
			relations: gateway.formatArrayParam(options.relations, 'csv', 'relations'),
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getListOperation, parameters);
}

/**
 * Returns the current and next schedules for a defined set of channels from the requested time
 * in the requested number.
 *
 * Schedules are requested in hour blocks and returned grouped by the channel
 * they belong to.
 *
 * For example, to load 12 hours of schedules for channels `4343` and `5234`,
 * on 21/2/2017 starting from 08:00.
 *
 * ```
 * channels=4343,5234
 * date=2017-02-21
 * hour=8
 * minute=15
 * limit=1
 * ```
 *
 * Examples:
 *
 * ```
 *   ---| P1  |      P2     | P3 | P4 |------ gap -------| P5 |    P6    |---
 *         ^
 * ```
 *
 *   Limit 1 will return: P1
 *   Limit 5 will return: P1, P2, P3, P4, P5
 *
 * ```
 *   ---| P1  |      P2     | P3 | P4 |------ gap -------| P5 |    P6    |---
 *                                               ^
 * ```
 *
 *   Limit 1 will return: P5
 *
 * Where
 * ```
 * ---- the timeline (also mean no program)
 *  ^   the specified date and time
 * |Px| the program
 * ```
 *
 * If a channel id is passed which doesn't exist then this endpoint will
 * return an empty schedule list for it. If instead we returned 404,
 * this would invalidate all other channel schedules in the same request
 * which would be unfriendly for clients presenting these channel schedules.
 *
 * @param {string[]} channels The list of channel ids to get schedules for.
 * @param {date} date The date to target in ISO format, e.g. `2017-05-23`.
 *
 * 	The base hour and minute requested will belong to this date.
 * @param {number} hour The base hour in the day, defined by the `date` parameter, you wish to load schedules for.
 *
 * 	From 0 to 23, where 0 is midnight.
 * @param {number} minute The base minute in the hour, defined by the `date` parameter, you wish to load schedules for.
 *
 * 	From 0 to 59.
 * @param {object} options Optional options
 * @param {number} [options.limit=2] The maxium number of the items
 * 	by default it will return 2 items (the current and very next item)
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
 * @return {Promise<module:types.ItemScheduleList[]>} An array of schedule lists for each channel requested.
 *
 * 	The order of the channels will match the order of channel ids passed during the request.
 */
export function getNextSchedules(
	channels: string[],
	date: Date,
	hour: number,
	minute: number,
	options?: GetNextSchedulesOptions
): Promise<api.Response<api.ItemScheduleList[]>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			channels: gateway.formatArrayParam(channels, 'csv', 'channels'),
			date: gateway.formatDate(date, 'date'),
			hour,
			minute,
			limit: options.limit,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getNextSchedulesOperation, parameters);
}

/**
 * Returns the details of a Plan with the specified id.
 *
 * @param {string} id The identifier of the Plan to load.
 * @param {object} options Optional options
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
 * @return {Promise<module:types.Plan>} The Plan requested.
 */
export function getPlan(id: string, options?: GetPlanOptions): Promise<api.Response<api.Plan>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			id
		},
		query: {
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getPlanOperation, parameters);
}

/**
 * Returns schedules for a defined set of channels over a requested period.
 *
 * Schedules are requested in hour blocks and returned grouped by the channel
 * they belong to.
 *
 * For example, to load 12 hours of schedules for channels `4343` and `5234`,
 * on 21/2/2017 starting from 08:00.
 *
 * ```
 * channels=4343,5234
 * date=2017-02-21
 * hour=8
 * duration=12
 * ```
 *
 * Please remember that `date` and `hour` combined represent a normal datetime,
 * so they should be converted to UTC on the client - this will help to avoid
 * issues with EPG schedules near midnight.
 *
 * If a channel id is passed which doesn't exist then this endpoint will
 * return an empty schedule list for it. If instead we returned 404,
 * this would invalidate all other channel schedules in the same request
 * which would be unfriendly for clients presenting these channel schedules.
 *
 * @param {string[]} channels The list of channel ids to get schedules for.
 * @param {date} date The date to target in ISO format, e.g. `2017-05-23` (converted to UTC - see main description).
 *
 * 	The base hour requested will belong to this date.
 * @param {number} hour The base hour in the day, defined by the `date` parameter, you wish to load schedules for
 * 	(converted to UTC - see main description).
 *
 * 	From 0 to 23, where 0 is midnight.
 * @param {number} duration The number of hours of schedules to load from the base `hour` parameter.
 *
 * 	This may be negative or positive depending on whether you want to load past or future schedules.
 *
 * 	Minimum value is -24, maximum is 24. A value of zero is invalid.
 * @param {object} options Optional options
 * @param {boolean} [options.intersect] Flag indicating whether schedules should intersect or be contained in the
 * 	provided interval.
 *
 * 	If set to `true`, the result will contain all schedules where either
 * 	schedule start time or end time touches the provided interval.
 *
 * 	If set to `false`, only schedules fully contained in the given period
 * 	will be returned.
 * @param {number} [options.limit] The number of schedule items Rocket's schedules endpoint should return.
 *
 * 	Parameter applies (if provided) in conjunction with `duration` parameter with logical `AND`
 *
 * 	If more than one channel schedule is requested, then the `limit` parameter applies to each schedule independently on the others.
 *
 * 	The `limit` will apply only after the first hour of schedules returned. Thats mean that for next parameters combination: duration=1 limit=1, limit parameter will be ignored.
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
 * @return {Promise<module:types.ItemScheduleList[]>} An array of schedule lists for each channel requested.
 *
 * 	The order of the channels will match the order of channel ids passed during the request.
 */
export function getSchedules(
	channels: string[],
	date: Date,
	hour: number,
	duration: number,
	options?: GetSchedulesOptions
): Promise<api.Response<api.ItemScheduleList[]>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			channels: gateway.formatArrayParam(channels, 'csv', 'channels'),
			date: gateway.formatDate(date, 'date'),
			hour,
			duration,
			intersect: options.intersect,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getSchedulesOperation, parameters);
}

/**
 * Returns the details of an item schedule with the specified id.
 *
 * @param {string} id The identifier of the item schedule to load.
 * @param {object} options Optional options
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
 * @return {Promise<module:types.ItemScheduleDetail>} The item schedule requested
 */
export function getSchedule(id: string, options?: GetScheduleOptions): Promise<api.Response<api.ItemScheduleDetail>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		path: {
			id
		},
		query: {
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getScheduleOperation, parameters);
}

/**
 * Search the catalog of items and people.
 *
 * @param {string} term The search term to query.
 * @param {object} options Optional options
 * @param {string[]} [options.include] By default people (credits only), movies, extras, sports and tv (shows + programs) will be included in the search results.
 *
 * 	If the `cas` feature flag is set, "other" items (`customAsset`s, stage) will
 * 	also be included by default
 *
 * 	If the `sv2` feature flag is set, events, competitions, teams, confederations and newsHighlights will be included in the search results
 * 	Also, when `sv2` feature flag is set, search results include persons (credits and personas) by default instead of people (credits only).
 *
 * 	If you don't want all of these types you can specifiy the specific
 * 	includes you care about.
 * @param {boolean} [options.group] When this option is set, instead of all search result items being returned
 * 	in a single list, they will instead be returned under two lists. One for
 * 	movies and another for tv (shows + programs).
 *
 * 	if the `cas` feature flag is set, a third `other` list will be
 * 	included containing `customAsset` and `sport`s (stage) results
 *
 * 	if the `sv2` feature flag is set, a new lists (events, competitions, teams, confederations and newsHighlights)
 * 	will be included in search results
 *
 * 	Default is undefined meaning items will be returned in a single list.
 *
 * 	The array of `people` (credits only) results is separate from items.
 * @param {number} [options.maxResults=40] The maximum number of results to return.
 * @param {string} [options.maxRating] The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
 * @param {string} [options.itemAudioLanguage] Enum: en, zh, ta, ms, other. Filter search result based on the item audio language.
 *
 * 	By default it will return with all the results.
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
 * @return {Promise<module:types.SearchResults>} OK.
 */
export function search(term: string, options?: SearchOptions): Promise<api.Response<api.SearchResults>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			term,
			include: gateway.formatArrayParam(options.include, 'csv', 'include'),
			group: options.group,
			max_results: options.maxResults,
			max_rating: options.maxRating,
			item_audio_language: options.itemAudioLanguage,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(searchOperation, parameters);
}

/**
 * Accepts one or more search queries and returns responses as item lists
 *
 * This operation should be used to populate search result (`SR*`) rows.
 *
 * If you need to populate multipe rows in parallel, make one batch request to this endpoint,
 * passing in each row query in the `queries` parameter
 *
 * Default parameters for all search queries given in `queries` can be set as top level parameters
 * on this request, then each can be overriden by specifying parameters in the `queries` string.
 *
 * for example the following makes two queries with the following parameters:
 *
 *   - term=tom             - shared
 *     item_types=show      - overridden
 *
 *   - term=tom             - shared
 *     item_types=movie     - shared
 *     item_sub_types=news  - overridden
 *
 *   `/search?term=tom&item_types=movie&queries=item_types%3Dshow,item_sub_types=news`
 *
 * if `queries` is ommitted or empty, one query will be made with the given default parameters
 *
 * in general the default queries will be used for:
 *   - `term`: likely shared for all rows on the page
 *   - user context filters (`segments`, `device` etc)
 *   - `page` and `page_size` to fetch the first page for all lists
 *
 * @param {string} term The default search term to query.
 * @param {object} options Optional options
 * @param {string[]} [options.queries] A comma delimited array of search queries to make. Each member of this array results in a
 * 	separate `ItemList` in the response.
 *
 * 	- Each _query_ in this array is a set of 0 or more parameters in the format `key=value`.
 * 	- Each parameter should be separated by a pipe `|` character
 * 	- Parameter values must be url encoded
 * 	- Parameter keys can be any parameter supported by this operation, apart from `quieries`
 * 	- Parameters set at the top level of this request (i.e. alongside this `queries` parameter) act
 * 	  as default values for all queries
 *
 * 	For example:
 *
 * 	  two queries, overriding the `term` in the first, and `item_types` in the second
 *
 * 	    `queries=term%3Dnew,item_types%3Dmovie`
 *
 * 	  two queries, overriding nothing in the first, then `item_types` and `page_size` in the second
 *
 * 	    `queries=,item_types%3Dmovie%2Cshow|page_size%3D1`
 * @param {number} [options.page=1] The default page of items to load. Starts from page 1.
 * @param {number} [options.pageSize=12] The default number of items to return in a page.
 * @param {string} [options.maxRating] The default maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
 * @param {string[]} [options.itemTypes] Default list of item types to include in the results. Returned items will have one of these types **OR** a sub type given in
 * 	`item_sub_types`.
 *
 * 	By default, all types are returned
 * @param {string[]} [options.itemSubTypes] Default list of item sub types to include in the results. Returned items will have one of these sub types **OR** a type given in
 * 	`item_types`.
 *
 * 	By default, all sub types are returned
 * @param {string[]} [options.excludeItemSubTypes] Default list of item sub types to specifically **exclude** from the results. Returned items will not have a sub type given in this list
 * 	regardless of the values given for `item_types` and `item_sub_types`
 *
 * 	By default, all sub types are returned
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
 * @param {string} [options.itemAudioLanguage] Enum: en, zh, ta, ms, other. Filter search result based on the item audio language.
 *
 * 	By default it will return with all the results.
 * @return {Promise<module:types.SearchListsResults>} OK.
 */
export function getSearchLists(
	term: string,
	options?: GetSearchListsOptions
): Promise<api.Response<api.SearchListsResults>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			queries: gateway.formatArrayParam(options.queries, 'csv', 'queries'),
			term,
			page: options.page,
			page_size: options.pageSize,
			max_rating: options.maxRating,
			item_types: gateway.formatArrayParam(options.itemTypes, 'csv', 'item_types'),
			item_sub_types: gateway.formatArrayParam(options.itemSubTypes, 'csv', 'item_sub_types'),
			exclude_item_sub_types: gateway.formatArrayParam(options.excludeItemSubTypes, 'csv', 'exclude_item_sub_types'),
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang,
			item_audio_language: options.itemAudioLanguage
		}
	};
	return gateway.request(getSearchListsOperation, parameters);
}

export interface GetItemOptions {
	/**
	 * The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
	 */
	maxRating?: string;
	/**
	 * If no value is specified no dependencies are expanded.
	 *
	 * 	If 'children' is specified then the list of any direct children will be expanded. For example
	 * 	seasons of a show or episodes of a season.
	 *
	 * 	If 'all' is specified then the parent chain will be expanded along with any child list at each level.
	 * 	For example if an episode is specified then its season will be expanded and that season's episode list.
	 * 	The season will have its show expanded and the show will have its season list expanded.
	 *
	 * 	The 'all' options is useful when you deep link into a show/season/episode for the first time as
	 * 	it provides full context for navigating around the show page. Subsequent navigation around
	 * 	children of the show should only need to request expand of children.
	 *
	 * 	If 'ancestors' is specified then only the parent chain is included.
	 *
	 * 	If 'parent' is specified then only the direct parent is included.
	 *
	 * 	If an expand is specified which is not relevant to the item type, it will be ignored.
	 */
	expand?: 'all' | 'children' | 'ancestors' | 'parent';
	/**
	 * Given a provided show id, it can be useful to get the details of a child season. This option
	 * 	provides a means to return the `first` or `latest` season of a show given the show id.
	 *
	 * 	The `expand` parameter also works here so for example you could land on a show page and request the
	 * 	latest season along with `expand=all`. This would then return the detail of the latest season with
	 * 	its list of child episode summaries, and also expand the detail of the show with its list of seasons summaries.
	 *
	 * 	Note the `id` parameter must be a show id for this parameter to work correctly.
	 */
	selectSeason?: 'first' | 'latest';
	/**
	 * Set to true when passing a custom Id as the `id` path parameter.
	 */
	useCustomId?: boolean;
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

export interface GetItemChildrenListOptions {
	/**
	 * The filter by episode number.
	 */
	episodeNumber?: number;
	/**
	 * The filter by season number.
	 */
	seasonNumber?: number;
	/**
	 * The page of items to load. Starts from page 1.
	 */
	page?: number;
	/**
	 * The number of items to return in a page.
	 */
	pageSize?: number;
	/**
	 * The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
	 */
	maxRating?: string;
	/**
	 * The sort order of the returned list, either 'asc' or 'desc'.
	 * 	If a list of Seasons the list is ordered by season number.
	 * 	If a list of Episodes the list is ordered by episode number.
	 */
	order?: 'asc' | 'desc';
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

export interface GetItemRelatedListOptions {
	/**
	 * The page of items to load. Starts from page 1.
	 */
	page?: number;
	/**
	 * The number of items to return in a page.
	 */
	pageSize?: number;
	/**
	 * The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
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

export interface GetShowEpisodesOptions {
	/**
	 * The page of items to load. Starts from page 1.
	 */
	page?: number;
	/**
	 * The number of items to return in a page.
	 */
	pageSize?: number;
	/**
	 * The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
	 */
	maxRating?: string;
	/**
	 * The sort order of the returned list, either 'asc' or 'desc'.
	 */
	order?: 'asc' | 'desc';
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

export interface GetPublicStartOverFilesOptions {
	/**
	 * The set of media file formats that the device supports, in the order of preference.
	 *
	 * 	When provided, Rocket API returns only media files in formats specified in this parameter. For each resolution, only the first media file of matching supported format is returned. Files of different resolutions may be of different supported media file formats.
	 *
	 * 	`external` value is reserved for project customizations where the real MIME type of the file on the specified URL is unknown at the time of ingestion.
	 *
	 * 	When not provided, Rocket API uses the legacy `User-Agent` header-based logic to find matching media files.
	 */
	formats?: ('mp4' | 'mpd' | 'mpd:wv' | 'mpd:pr' | 'ism' | 'hls' | 'external')[];
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

export interface GetPublicItemMediaFilesOptions {
	/**
	 * The set of media file formats that the device supports, in the order of preference.
	 *
	 * 	When provided, Rocket API returns only media files in formats specified in this parameter. For each resolution, only the first media file of matching supported format is returned. Files of different resolutions may be of different supported media file formats.
	 *
	 * 	`external` value is reserved for project customizations where the real MIME type of the file on the specified URL is unknown at the time of ingestion.
	 *
	 * 	When not provided, Rocket API uses the legacy `User-Agent` header-based logic to find matching media files.
	 */
	formats?: ('mp4' | 'mpd' | 'mpd:wv' | 'mpd:pr' | 'ism' | 'hls' | 'external')[];
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

export interface GetAnonymousNextPlaybackItemOptions {
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

export interface GetRecommendationsListOptions {
	/**
	 * The url of the page where the widget is displayed.
	 */
	currentUrl?: string;
	/**
	 * The string parameter used for page view tracking.
	 */
	prnd?: string;
	/**
	 * The list of genres from the item detail page.
	 * 	Use with "You May Also Like" and "End of playback" widgets.
	 */
	genres?: string[];
	/**
	 * The list of genre aliases from the profile recommendation settings.
	 * 	Use with "Cold Start" and "Top Picks" widgets.
	 *
	 * 	### Aliases
	 *
	 * 	- `b` - Comedy
	 * 	- `c` - Drama
	 * 	- `d` - Documentary
	 * 	- `g` - Variety
	 * 	- `h` - Kids
	 * 	- `i` - Current Affairs
	 * 	- `k` - Sports
	 */
	genreAliases?: ('b' | 'c' | 'd' | 'g' | 'h' | 'i' | 'k')[];
	/**
	 * The list of audio languages from the profile recommendation settings
	 * 	or from item detail page.
	 */
	audioLanguages?: string[];
	/**
	 * The list of credits from the profile recommendation settings
	 * 	or from item detail page.
	 */
	credits?: string[];
	page?: number;
	pageSize?: number;
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

export interface GetBoostRecommendationsListOptions {
	/**
	 * The unique identifier of anonymous or signed in user.
	 */
	meId?: string;
	/**
	 * The content's external identifier.
	 * 	Expected to be populated when widget is placed on IDP
	 * 	should not be specified otherwise (widget placed on home page etc).
	 */
	contentId?: string;
	/**
	 * Device unique identifier
	 */
	DeviceType?: number;
	/**
	 * The list of product IDs from the profile recommendation settings
	 * 	or from item detail page.
	 */
	product?: string[];
	/**
	 * The time zone of anonymous or signed in user.
	 */
	timeZone?: string;
	/**
	 * Country Code of the user.
	 */
	countryCode?: string;
	/**
	 * The age of anonymous or signed in user.
	 */
	age?: string;
	/**
	 * Specific sub Genre filter.
	 */
	subGenre?: string;
	page?: number;
	pageSize?: number;
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

export interface GetCxenseRecommendationsListOptions {
	/**
	 * The url of the page where the widget is displayed.
	 */
	currentUrl?: string;
	/**
	 * The list of genres from the item detail page.
	 * 	Use with "You May Also Like" and "End of playback" widgets.
	 */
	genres?: string[];
	/**
	 * The list of genre aliases from the profile recommendation settings.
	 * 	Use with "Cold Start" and "Top Picks" widgets.
	 *
	 * 	### Aliases
	 *
	 * 	- `b` - Comedy
	 * 	- `c` - Drama
	 * 	- `d` - Documentary
	 * 	- `g` - Variety
	 * 	- `h` - Kids
	 * 	- `i` - Current Affairs
	 * 	- `k` - Sports
	 */
	genreAliases?: ('b' | 'c' | 'd' | 'g' | 'h' | 'i' | 'k')[];
	/**
	 * The list of audio languages from the profile recommendation settings
	 * 	or from item detail page.
	 */
	audioLanguages?: string[];
	/**
	 * The list of credits from the profile recommendation settings
	 * 	or from item detail page.
	 */
	credits?: string[];
	page?: number;
	pageSize?: number;
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

export interface GetZoomRecommendationsListOptions {
	/**
	 * The unique identifier of anonymous or signed in user.
	 */
	meId?: string;
	/**
	 * The url of the page where the widget is displayed.
	 */
	currentUrl?: string;
	/**
	 * The content's external identifier.
	 * 	Expected to be populated when widget is placed on IDP
	 * 	should not be specified otherwise (widget placed on home page etc).
	 */
	contentId?: string;
	/**
	 * The content's external identifier in Cxense recommendations engine.
	 * 	Expected to be populated when widget is placed on IDP
	 * 	should not be specified otherwise (widget placed on home page etc).
	 */
	cxenseId?: string;
	/**
	 * The string parameter used for page view tracking.
	 */
	prnd?: string;
	/**
	 * The list of genres from the item detail page.
	 * 	Use with "You May Also Like" and "End of playback" widgets.
	 */
	genres?: string[];
	/**
	 * The list of genre aliases from the profile recommendation settings.
	 * 	Use with "Cold Start" and "Top Picks" widgets.
	 *
	 * 	### Aliases
	 *
	 * 	- `b` - Comedy
	 * 	- `c` - Drama
	 * 	- `d` - Documentary
	 * 	- `g` - Variety
	 * 	- `h` - Kids
	 * 	- `i` - Current Affairs
	 * 	- `k` - Sports
	 */
	genreAliases?: ('b' | 'c' | 'd' | 'g' | 'h' | 'i' | 'k')[];
	/**
	 * The list of audio languages from the profile recommendation settings
	 * 	or from item detail page.
	 */
	audioLanguages?: string[];
	/**
	 * The list of credits from the profile recommendation settings
	 * 	or from item detail page.
	 */
	credits?: string[];
	page?: number;
	pageSize?: number;
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

export interface GetListsOptions {
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
		| 'credit'
		| 'article';
	/**
	 * filters the list result based on the content language
	 */
	audioLanguage?: string;
	/**
	 * filters the list result based on the genre
	 */
	genre?: string;
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

export interface GetListOptions {
	/**
	 * The page of items to load. Starts from page 1.
	 */
	page?: number;
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
	 * The list parameter in format 'key:value', e.g. 'genre:action'.
	 */
	param?: string;
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
	 * filters the list result based on the content language
	 */
	audioLanguage?: string;
	/**
	 * filters the list result based on the genre
	 */
	genre?: string;
	/**
	 * A comma separated list of a colon delimited pairs where first member is a relationship type and the second member is the id of an asset that all the returned assets must be related to in that type of relationship (e.g. relations=stage:1234,other:4567).
	 */
	relations?: string[];
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

export interface GetNextSchedulesOptions {
	/**
	 * The maxium number of the items
	 * 	by default it will return 2 items (the current and very next item)
	 */
	limit?: number;
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

export interface GetPlanOptions {
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

export interface GetSchedulesOptions {
	/**
	 * Flag indicating whether schedules should intersect or be contained in the
	 * 	provided interval.
	 *
	 * 	If set to `true`, the result will contain all schedules where either
	 * 	schedule start time or end time touches the provided interval.
	 *
	 * 	If set to `false`, only schedules fully contained in the given period
	 * 	will be returned.
	 */
	intersect?: boolean;
	/**
	 * The number of schedule items Rocket's schedules endpoint should return.
	 *
	 * 	Parameter applies (if provided) in conjunction with `duration` parameter with logical `AND`
	 *
	 * 	If more than one channel schedule is requested, then the `limit` parameter applies to each schedule independently on the others.
	 *
	 * 	The `limit` will apply only after the first hour of schedules returned. Thats mean that for next parameters combination: duration=1 limit=1, limit parameter will be ignored.
	 */
	limit?: number;
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

export interface GetScheduleOptions {
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

export interface SearchOptions {
	/**
	 * By default people (credits only), movies, extras, sports and tv (shows + programs) will be included in the search results.
	 *
	 * 	If the `cas` feature flag is set, "other" items (`customAsset`s, stage) will
	 * 	also be included by default
	 *
	 * 	If the `sv2` feature flag is set, events, competitions, teams, confederations and newsHighlights will be included in the search results
	 * 	Also, when `sv2` feature flag is set, search results include persons (credits and personas) by default instead of people (credits only).
	 *
	 * 	If you don't want all of these types you can specifiy the specific
	 * 	includes you care about.
	 */
	include?: (
		| 'tv'
		| 'movies'
		| 'people'
		| 'extras'
		| 'sports'
		| 'persons'
		| 'other'
		| 'events'
		| 'competitions'
		| 'teams'
		| 'confederations'
		| 'newsHighlights')[];
	/**
	 * When this option is set, instead of all search result items being returned
	 * 	in a single list, they will instead be returned under two lists. One for
	 * 	movies and another for tv (shows + programs).
	 *
	 * 	if the `cas` feature flag is set, a third `other` list will be
	 * 	included containing `customAsset` and `sport`s (stage) results
	 *
	 * 	if the `sv2` feature flag is set, a new lists (events, competitions, teams, confederations and newsHighlights)
	 * 	will be included in search results
	 *
	 * 	Default is undefined meaning items will be returned in a single list.
	 *
	 * 	The array of `people` (credits only) results is separate from items.
	 */
	group?: boolean;
	/**
	 * The maximum number of results to return.
	 */
	maxResults?: number;
	/**
	 * The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
	 */
	maxRating?: string;
	/**
	 * Filter search result based on the item audio language.
	 *
	 * 	By default it will return with all the results.
	 */
	itemAudioLanguage?: 'en' | 'zh' | 'ta' | 'ms' | 'other';
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

export interface GetSearchListsOptions {
	/**
	 * A comma delimited array of search queries to make. Each member of this array results in a
	 * 	separate `ItemList` in the response.
	 *
	 * 	- Each _query_ in this array is a set of 0 or more parameters in the format `key=value`.
	 * 	- Each parameter should be separated by a pipe `|` character
	 * 	- Parameter values must be url encoded
	 * 	- Parameter keys can be any parameter supported by this operation, apart from `quieries`
	 * 	- Parameters set at the top level of this request (i.e. alongside this `queries` parameter) act
	 * 	  as default values for all queries
	 *
	 * 	For example:
	 *
	 * 	  two queries, overriding the `term` in the first, and `item_types` in the second
	 *
	 * 	    `queries=term%3Dnew,item_types%3Dmovie`
	 *
	 * 	  two queries, overriding nothing in the first, then `item_types` and `page_size` in the second
	 *
	 * 	    `queries=,item_types%3Dmovie%2Cshow|page_size%3D1`
	 */
	queries?: string[];
	/**
	 * The default page of items to load. Starts from page 1.
	 */
	page?: number;
	/**
	 * The default number of items to return in a page.
	 */
	pageSize?: number;
	/**
	 * The default maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
	 */
	maxRating?: string;
	/**
	 * Default list of item types to include in the results. Returned items will have one of these types **OR** a sub type given in
	 * 	`item_sub_types`.
	 *
	 * 	By default, all types are returned
	 */
	itemTypes?: (
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
		| 'credit')[];
	/**
	 * Default list of item sub types to include in the results. Returned items will have one of these sub types **OR** a type given in
	 * 	`item_types`.
	 *
	 * 	By default, all sub types are returned
	 */
	itemSubTypes?: string[];
	/**
	 * Default list of item sub types to specifically **exclude** from the results. Returned items will not have a sub type given in this list
	 * 	regardless of the values given for `item_types` and `item_sub_types`
	 *
	 * 	By default, all sub types are returned
	 */
	excludeItemSubTypes?: string[];
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
	/**
	 * Filter search result based on the item audio language.
	 *
	 * 	By default it will return with all the results.
	 */
	itemAudioLanguage?: 'en' | 'zh' | 'ta' | 'ms' | 'other';
}

const getItemOperation: api.OperationInfo = {
	path: '/items/{id}',
	method: 'get'
};

const getItemChildrenListOperation: api.OperationInfo = {
	path: '/items/{id}/children',
	method: 'get'
};

const getItemRelatedListOperation: api.OperationInfo = {
	path: '/items/{id}/related',
	method: 'get'
};

const getShowEpisodesOperation: api.OperationInfo = {
	path: '/items/{id}/show-episodes',
	method: 'get'
};

const getPublicStartOverFilesOperation: api.OperationInfo = {
	path: '/items/{id}/start-over',
	method: 'get'
};

const getPublicItemMediaFilesOperation: api.OperationInfo = {
	path: '/items/{id}/videos',
	method: 'get'
};

const getAnonymousNextPlaybackItemOperation: api.OperationInfo = {
	path: '/items/{itemId}/next',
	method: 'get',
	security: [
		{
			id: 'anonymousAuth',
			scopes: ['Catalog']
		}
	]
};

const getRecommendationsListOperation: api.OperationInfo = {
	path: '/items/recommendations/{widgetId}/list',
	method: 'get'
};

const getBoostRecommendationsListOperation: api.OperationInfo = {
	path: '/items/recommendations/boost/{widgetId}/list',
	method: 'get'
};

const getCxenseRecommendationsListOperation: api.OperationInfo = {
	path: '/items/recommendations/cxense/{widgetId}/list',
	method: 'get'
};

const getZoomRecommendationsListOperation: api.OperationInfo = {
	path: '/items/recommendations/zoom/{widgetId}/list',
	method: 'get'
};

const getListsOperation: api.OperationInfo = {
	path: '/lists',
	method: 'get'
};

const getListOperation: api.OperationInfo = {
	path: '/lists/{id}',
	method: 'get'
};

const getNextSchedulesOperation: api.OperationInfo = {
	path: '/next-schedules',
	method: 'get'
};

const getPlanOperation: api.OperationInfo = {
	path: '/plans/{id}',
	method: 'get'
};

const getSchedulesOperation: api.OperationInfo = {
	path: '/schedules',
	method: 'get'
};

const getScheduleOperation: api.OperationInfo = {
	path: '/schedules/{id}',
	method: 'get'
};

const searchOperation: api.OperationInfo = {
	path: '/search',
	method: 'get'
};

const getSearchListsOperation: api.OperationInfo = {
	path: '/search/lists',
	method: 'get'
};
