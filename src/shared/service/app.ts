/// <reference path="types.ts"/>
/** @module app */
// Auto-generated, edits will be overwritten
import * as gateway from './gateway';

/**
 * Get the global configuration for an application. Should be called during app statup.
 *
 * This includes things like device and playback rules, classifications,
 * sitemap and subscriptions.
 *
 * You have the option to select specific configuration objects using the 'include'
 * parameter, or if unspecified, getting all configuration.
 *
 * @param {object} options Optional options
 * @param {string[]} [options.include] A comma delimited list of config objects to return.
 * 	If none specified then all configuration is returned.
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
 * @return {Promise<module:types.AppConfig>} The list of available pages
 */
export function getAppConfig(options?: GetAppConfigOptions): Promise<api.Response<api.AppConfig>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			include: gateway.formatArrayParam(options.include, 'csv', 'include'),
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getAppConfigOperation, parameters);
}

/**
 * Returns a page with the specified id.
 *
 * If targeting the search page you must url encode the search term as a parameter
 * using the `q` key. For example if your browser path looks like `/search?q=the`
 * then what you pass to this endpoint would look like `/page?path=/search%3Fq%3Dthe`.
 *
 * @param {string} path The path of the page to load, e.g. '/movies'.
 * @param {object} options Optional options
 * @param {number} [options.listPageSize=12] The number of items to load when prefetching and paging each list in the page row.
 * @param {number} [options.listPageSizeLarge=50] The number of items to load when prefetching a continuous scroll list entry in a page.
 *
 * 	By default any list page entry with template pattern `/^CS\d+$/` will
 * 	be considered a continuous scroll list.
 * @param {number} [options.maxListPrefetch=2] The maximum number of lists to prefetch in the page.
 * @param {string} [options.itemDetailExpand] Enum: all, children, ancestors. Only relevant when loading item detail pages as these embed a detailed item in the main page entry.
 *
 * 	If no value is specified no item dependencies are expanded.
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
 * 	If 'ancestors' is specified then only the parent chain is included
 *
 * 	If an expand is specified which is not relevant to the item type, it will be ignored.
 * @param {string} [options.itemDetailSelectSeason] Enum: first, latest. Only relevant when loading show detail pages as these embed a detailed item in the main page entry.
 *
 * 	Since the introduction of the D1,2,3 templates this parameter is now somewhat redundant, or less
 * 	likely to have any effect. While it may still be useful in some cases, most of the time the season
 * 	selection will be dictated by the configuration of the rows scheduled on the show detail page.
 * 	This parameter will only take effect if there are rows used to schedule episodes of a season, like
 * 	D1,2,3, or if no rows have a value set for their `seasonOrder` custom field.
 *
 * 	Given a targeted show page, it can be useful to get the details of a child season. This option
 * 	provides a means to return the `first` or `latest` season of a show embedded in the page.
 *
 * 	The `expand` parameter also works here so for example you could land on a show page and request the
 * 	`item_detail_select_season=latest` along with `item_detail_expand=all`. This would then return the
 * 	detail of the latest season with its list of child episode summaries, and also expand
 * 	the detail of the show with its list of seasons summaries.
 * @param {string} [options.textEntryFormat=markdown] Enum: markdown, html. Only relevant to page entries of type `TextEntry`.
 *
 * 	Converts the value of a text page entry to the specified format.
 * @param {string} [options.maxRating] The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
 * @param {string} [options.promocode] Promo code
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
 * @return {Promise<module:types.Page>} The page requested.
 */
export function getPage(path: string, options?: GetPageOptions): Promise<api.Response<api.Page>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			path,
			list_page_size: options.listPageSize,
			list_page_size_large: options.listPageSizeLarge,
			max_list_prefetch: options.maxListPrefetch,
			item_detail_expand: options.itemDetailExpand,
			item_detail_select_season: options.itemDetailSelectSeason,
			text_entry_format: options.textEntryFormat,
			max_rating: options.maxRating,
			promocode: options.promocode,
			device: options.device,
			sub: options.sub,
			segments: gateway.formatArrayParam(options.segments, 'csv', 'segments'),
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang,
			item_audio_language: options.itemAudioLanguage
		}
	};
	return gateway.request(getPageOperation, parameters);
}

export interface GetAppConfigOptions {
	/**
	 * A comma delimited list of config objects to return.
	 * 	If none specified then all configuration is returned.
	 */
	include?: (
		| 'classification'
		| 'playback'
		| 'sitemap'
		| 'navigation'
		| 'subscription'
		| 'general'
		| 'display'
		| 'i18n'
		| 'linear'
		| 'profile'
		| 'brands'
		| 'account'
		| 'personalisation'
		| 'advertisment'
		| 'deeplinking'
		| 'operations'
		| 'segments')[];
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

export interface GetPageOptions {
	/**
	 * The number of items to load when prefetching and paging each list in the page row.
	 */
	listPageSize?: number;
	/**
	 * The number of items to load when prefetching a continuous scroll list entry in a page.
	 *
	 * 	By default any list page entry with template pattern `/^CS\d+$/` will
	 * 	be considered a continuous scroll list.
	 */
	listPageSizeLarge?: number;
	/**
	 * The maximum number of lists to prefetch in the page.
	 */
	maxListPrefetch?: number;
	/**
	 * Only relevant when loading item detail pages as these embed a detailed item in the main page entry.
	 *
	 * 	If no value is specified no item dependencies are expanded.
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
	 * 	If 'ancestors' is specified then only the parent chain is included
	 *
	 * 	If an expand is specified which is not relevant to the item type, it will be ignored.
	 */
	itemDetailExpand?: 'all' | 'children' | 'ancestors';
	/**
	 * Only relevant when loading show detail pages as these embed a detailed item in the main page entry.
	 *
	 * 	Since the introduction of the D1,2,3 templates this parameter is now somewhat redundant, or less
	 * 	likely to have any effect. While it may still be useful in some cases, most of the time the season
	 * 	selection will be dictated by the configuration of the rows scheduled on the show detail page.
	 * 	This parameter will only take effect if there are rows used to schedule episodes of a season, like
	 * 	D1,2,3, or if no rows have a value set for their `seasonOrder` custom field.
	 *
	 * 	Given a targeted show page, it can be useful to get the details of a child season. This option
	 * 	provides a means to return the `first` or `latest` season of a show embedded in the page.
	 *
	 * 	The `expand` parameter also works here so for example you could land on a show page and request the
	 * 	`item_detail_select_season=latest` along with `item_detail_expand=all`. This would then return the
	 * 	detail of the latest season with its list of child episode summaries, and also expand
	 * 	the detail of the show with its list of seasons summaries.
	 */
	itemDetailSelectSeason?: 'first' | 'latest';
	/**
	 * Only relevant to page entries of type `TextEntry`.
	 *
	 * 	Converts the value of a text page entry to the specified format.
	 */
	textEntryFormat?: 'markdown' | 'html';
	/**
	 * The maximum rating (inclusive) of items returned, e.g. 'auoflc-pg'.
	 */
	maxRating?: string;
	/**
	 * Promo code
	 */
	promocode?: string;
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

const getAppConfigOperation: api.OperationInfo = {
	path: '/config',
	method: 'get'
};

const getPageOperation: api.OperationInfo = {
	path: '/page',
	method: 'get'
};
