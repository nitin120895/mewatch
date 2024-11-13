/**
 * Page Templates
 *
 * This file contains all of the known page template keys (the values returned by Rocket for `page.template`)
 * used when publishing pages within Presentation Manager.
 *
 * We have two types of pages within the system:
 *
 * Dynamic Pages:
 * These pages are curated and have their content defined by an operator within Presentation Manager. The operator
 * schedules rows of page entries. Dynamic pages get their page data returned from Rocket.
 *
 * Static Pages:
 * These pages have a pre-defined look and feel. They aren't curatable by an operator. They don't require page entry
 * data from Rocket. These usually use the 'Static' template and are differeniated via unique page keys, however
 * important pages may have their own templates to aid in discoverability.
 *
 * Dynamic pages need to be added to the `dynamicTemplate` Map at the bottom of this file to ensure they request their
 * data payload from Rocket.
 */

/**
 * Static System Templates
 */
export const STATIC = 'Static';

/**
 * Unique Templates
 */
export const Home = 'Home';
export const Category = 'Category';
export const SubCategory = 'Sub Category';

export const ListDetail = 'List Detail';
export const ListDetailFeatured = 'List Detail Featured';

export const MovieDetail = 'Movie Detail';
export const ProgramDetail = 'Program Detail';
export const ShowDetail = 'Show Detail';
export const ChannelDetail = 'Channel Detail';
export const SeasonDetail = 'Season Detail';
export const EpisodeDetail = 'Episode Detail';

// Named CustomDetail for consistency, AXIS currently returns Custom Asset Detail
export const CustomDetail = 'Custom Asset Detail';

export const Account = 'Account';

export const Search = 'Search';
export const EnhancedSearch = 'Enhanced Search';
export const Watch = 'Watch';
export const Support = 'Support';
export const Editorial = 'Editorial';
export const EPG = 'EPG';
export const Subscription = 'Subscription';
export const ColdStart = 'ColdStart';
export const WebView = 'Web View';
export const Custom = 'Custom';
export const SportsEvent = 'SportsEvent';
export const ContinueWatch = 'ContinueWatch';
export const LiveChannels = 'LiveChannels';

/**
 * Deprecated Templates
 */
export const ItemDetail = 'Item Detail';
export const MyList = 'MyList';

export const itemDetailTemplate = {
	[MovieDetail]: true,
	[ProgramDetail]: true,
	[CustomDetail]: true,
	[ShowDetail]: true,
	[ItemDetail]: true,
	[ChannelDetail]: true
};

export const itemIDPDetailTemplate = {
	[MovieDetail]: true,
	[ShowDetail]: true,
	[EpisodeDetail]: true,
	[SeasonDetail]: true,
	[ProgramDetail]: true
};

export const listDetailTemplate = {
	[ListDetail]: true,
	[ListDetailFeatured]: true
};

// Dynamic page templates defined in this Map will request their page data from Rocket.
// Templates which aren't included within this Map are assumed to be Static.
export const dynamicTemplate = {
	[Home]: true,
	[Category]: true,
	[SubCategory]: true,
	[ListDetail]: true,
	[ListDetailFeatured]: true,
	[ItemDetail]: true,
	[Search]: true,
	[EnhancedSearch]: true,
	[MovieDetail]: true,
	[ProgramDetail]: true,
	[CustomDetail]: true,
	[ShowDetail]: true,
	[Editorial]: true,
	[Support]: true,
	[WebView]: true,
	[Account]: true,
	[Watch]: true,
	[Subscription]: true,
	[EPG]: true,
	[ChannelDetail]: true,
	[MyList]: true,
	[SportsEvent]: true,
	[ContinueWatch]: true,
	[LiveChannels]: true
};

export const ItemDetailTemplates = [
	ItemDetail,
	MovieDetail,
	ShowDetail,
	SeasonDetail,
	EpisodeDetail,
	ProgramDetail,
	CustomDetail,
	ChannelDetail
];

// Mixpanel program_detail_page triggers
export const ProgramDetailTemplates = [EpisodeDetail, MovieDetail, ProgramDetail, ShowDetail, SeasonDetail];

export const EXCLUDED_PAGE_TEMPLATES_FOR_PAGE_LOAD_EVENT = [ListDetailFeatured];
