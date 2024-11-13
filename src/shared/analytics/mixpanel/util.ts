import { isSeason } from 'ref/responsive/util/item';
import { get } from 'shared/util/objects';
import { DomTriggerPoints, VideoEntryPoint } from 'shared/analytics/types/types';
import { ContinueWatching, ContinueWatchingAnonymous } from 'shared/list/listId';
import { getItemWithCacheCreator, isEpisode, isShow } from 'shared/util/itemUtils';
import { isVodAvailable } from 'shared/util/schedule';
import { getmeID } from 'toggle/responsive/pageEntry/advertising/adsUtils';
import { DropdownSelectName } from 'toggle/responsive/pageEntry/continuous/ContinuousScrollPackshotList';

export const enum MixpanelEvent {
	AddToMyList = 'add_to_my_list',
	AppLaunch = 'mewatch_app_launch',
	AutoFillSearchClick = 'autofill_search_click',
	BannerClicked = 'banner_clicked',
	BannerClosed = 'banner_closed',
	BannerShown = 'banner_shown',
	CarouselCardClick = 'carousel_card_click',
	ClickToWatch = 'click_to_watch',
	ContinueWatching = 'continue_watching',
	CWMenu = 'cw_menu',
	CWMenuRemoveCW = 'cw_menu_remove_cw',
	CWMenuUndoRemove = 'cw_menu_undo_remove',
	CWMenuViewInfo = 'cw_menu_view_info',
	CWPageEdit = 'cw_page_edit',
	CWPageSelectAll = 'cw_page_select_all',
	CWPageDeselectAll = 'cw_page_deselect_all',
	CWPageRemoveSelected = 'cw_page_remove_selected',
	CWPageSelectSingleRemove = 'cw_page_select_single_remove',
	EnableStartOver = 'enable_start_over',
	ExitStartOver = 'exit_start_over',
	FilterRequest = 'filter_request',
	IdpLinkClick = 'idp_link_click',
	IdpSubscribeClick = 'idp_subscribe_click',
	ListingCardClick = 'listing_card_click',
	LiveInfoClick = 'live_info_click',
	LiveLinkClick = 'live_link_click',
	LiveStreamSetReminder = 'livestream_set_reminder',
	LoginSuccessful = 'login_successful',
	LogoutSuccessful = 'logout_successful',
	MenuClick = 'menu_click',
	MyListCardClick = 'my_list_card_click',
	MyListPage = 'my_list_page',
	PageLoads = 'page_loads',
	ProgramDetailPage = 'program_detail_page',
	ProgrameEpisodeSynopsisClick = 'program_episode_synopsis_click',
	ProgramTagClick = 'program_tag_click',
	RailCardClick = 'rail_card_click',
	RailHeaderClick = 'rail_header_click',
	RegistrationComplete = 'registration_complete',
	RemoveFromMyList = 'remove_from_my_list',
	SearchCardClick = 'search_card_click',
	SearchRequest = 'search_request',
	StoriesCtaClick = 'stories_cta_click',
	StoryExit = 'story_exit',
	StoryStart = 'story_start',
	StoryPageStart = 'story_page_start',
	StoryPageExit = 'story_page_exit',
	SubscribeConfirmAndProceed = 'subscribe_confirm_and_proceed',
	SubscribeApplyPromo = 'subscribe_apply_promo',
	SubscribePage = 'subscribe_page',
	SubscribePaymentPage = 'subscribe_payment_page',
	SubscriptionSuccess = 'subscription_success',
	SubscribeProceedToPay = 'subscribe_proceed_to_pay',
	SubscribeProceedToPayment = 'subscribe_proceed_to_payment',
	SubscribeSelectPlans = 'subscribe_select_plans',
	SubscribeViewPlan = 'subscribe_view_plans',
	SubscriptionFailure = 'subscription_failure',
	VideoBackward = 'video_backward',
	VideoEndRecoCardClick = 'video_end_reco_card_click',
	VideoExit = 'video_exit',
	VideoForward = 'video_forward',
	VideoPause = 'video_pause',
	VideoResume = 'video_resume',
	VideoSeek = 'video_seek',
	VideoSelectAudio = 'video_select_audio',
	VideoSelectEpisode = 'video_select_episode',
	VideoSelectQuality = 'video_select_quality',
	VideoSelectSubtitle = 'video_select_subtitle',
	VideoSkipIntro = 'video_skip_intro',
	VideoStart = 'video_start',
	VideoWatchCompleted = 'video_watch_completed',
	VodInfoClick = 'vod_info_click',
	VodLinkClick = 'vod_link_click',
	WatchProgramTrailer = 'watch_program_trailer'
}

export interface MixpanelProperty {
	source: MixpanelPropertySource;
	variable: string;
}

export const enum MixpanelPropertyType {
	Super = 'superProperties',
	User = 'userProperties',
	Event = 'eventProperties'
}

export const enum MixpanelPropertySource {
	Client = 'client',
	Axis = 'axis',
	String = 'string'
}

// Client side variables
export const enum MixpanelVariable {
	AdobeId = 'adobeId',
	AtVideoTimestamp = 'atVideoTimestamp',
	AudioFilter = 'audioFilter',
	AvailableAudioLanguages = 'availableAudioLanguages',
	AvailableSubtitleLanguages = 'availableSubtitleLanguages',
	BackwardTimestamp = 'backwardTimestamp',
	BrazeId = 'brazeid',
	CastName = 'castName',
	CardPosition = 'cardPosition',
	CardTotal = 'cardTotal',
	CastResultsCount = 'castResultsCount',
	Casts = 'casts',
	Cid = 'cid',
	ClickableLinkCta = 'clickableLinkCta',
	ClickableLinkDescription = 'clickableLinkDescription',
	ClickableLinkValue = 'clickableLinkValue',
	ConnectivityStatus = 'connectivityStatus',
	ContentProvider = 'contentProvider',
	ContentType = 'contentType',
	Currency = 'currency',
	CtaDestination = 'ctaDestination',
	DefaultAudioLanguage = 'defaultAudioLanguage',
	DownloadedVideo = 'downloadedVideo',
	EnabledEdmMediacorp = 'enabledEdmMediacorp',
	EnabledEdmMediacorpPartners = 'enabledEdmMediacorpPartners',
	EntryPoint = 'entryPoint',
	EpgStartDateTime = 'epgStartDateTime',
	EpgTitle = 'epgTitle',
	EpisodeId = 'episodeId',
	EpisodeNumber = 'episodeNumber',
	EpisodeTitle = 'episodeTitle',
	EpisodeTotal = 'episodeTotal',
	ExtraResultsCount = 'extraResultsCount',
	FailureCode = 'failureCode',
	FilterType = 'filterType',
	FilterValue = 'filterValue',
	ForwardTimestamp = 'forwardTimestamp',
	GenreFilter = 'genreFilter',
	InternalId = 'internalId',
	ItemResultsCount = 'itemResultsCount',
	LastStopTimestamp = 'lastStopTimestamp',
	LoggedIn = 'loggedIn',
	LoginType = 'loginType',
	MediaAirtime = 'mediaAirtime',
	MediaChannel = 'mediaChannel',
	MediaGroup = 'mediaGroup',
	MediaRights = 'mediaRights',
	Meid = 'meid',
	MenuOption = 'menuOption',
	MenuType = 'menuType',
	MovieResultsCount = 'movieResultsCount',
	PageLocation = 'pageLocation',
	PageType = 'pageType',
	PageUrl = 'pageUrl',
	PaymentMethod = 'paymentMethod',
	PlayedAudioLanguage = 'playedAudioLanguage',
	PlayedSubtitleLanguage = 'playedSubtitleLanguage',
	PlayerWindowMode = 'playerWindowMode',
	PremiumVideo = 'premiumVideo',
	ProgramTitle = 'programTitle',
	RailPosition = 'railPosition',
	RailTotal = 'railTotal',
	RatingFilter = 'ratingFilter',
	RegistrationDate = 'registrationDate',
	RegistrationType = 'registrationType',
	SearchKeyword = 'searchKeyword',
	SearchType = 'searchType',
	SeasonId = 'seasonId',
	SeasonNumber = 'seasonNumber',
	SeasonTotal = 'seasonTotal',
	SeekEndTimestamp = 'seekEndTimestamp',
	SeekStartTimestamp = 'seekStartTimestamp',
	SelectedAudioLanguage = 'selectedAudioLanguage',
	SelectedContentType = 'selectedContentType',
	SelectedEpisodeId = 'selectedEpisodeId',
	SelectedEpisodeNumber = 'selectedEpisodeNumber',
	SelectedEpisodeTitle = 'selectedEpisodeTitle',
	SelectedMediaId = 'selectedMediaId',
	SelectedProgramGenres = 'selectedProgramGenres',
	SelectedProgramTaxonomyTier1 = 'selectedProgramTaxonomyTier1',
	SelectedProgramTaxonomyTier2 = 'selectedProgramTaxonomyTier2',
	SelectedProgramTitle = 'selectedProgramTitle',
	SelectedSeasonId = 'selectedSeasonId',
	SelectedSeasonNumber = 'selectedSeasonNumber',
	SelectedSeriesId = 'selectedSeriesId',
	SelectedSeriesTitle = 'selectedSeriesTitle',
	SelectedSubtitleLanguage = 'selectedSubtitleLanguage',
	SelectedTotal = 'selectedTotal',
	SelectedVideoQuality = 'selectedVideoQuality',
	SelectedVideoType = 'selectedVideoType',
	SeriesId = 'seriesId',
	SeriesResultsCount = 'seriesResultsCount',
	SeriesTitle = 'seriesTitle',
	SortingFilter = 'sortingFilter',
	SourcePlatform = 'sourcePlatform',
	SportsResultsCount = 'sportsResultsCount',
	StartoverMode = 'startoverMode',
	StoryExitTrigger = 'storyExitTrigger',
	StoryId = 'storyId',
	StoryPageCount = 'storyPageCount',
	StoryPageDuration = 'storyPageDuration',
	StoryPageDurationViewedPercent = 'storyPageDurationViewedPercent',
	StoryPageId = 'storyPageId',
	StoryPageIndex = 'storyPageIndex',
	StoryPageNavigationDirection = 'storyPageNavigationDirection',
	StoryPageNavigationType = 'storyPageNavigationType',
	StoryStartTrigger = 'storyStartTrigger',
	StoryTitle = 'storyTitle',
	Subscriber = 'subscriber',
	SubscriptionDiscountedPrice = 'subscriptionDiscountedPrice',
	SubscriptionEndDate = 'subscriptionEndDate',
	SubscriptionGroup = 'subscriptionGroup',
	SubscriptionPlanId = 'subscriptionPlanId',
	SubscriptionPlanIds = 'subscriptionPlanIds',
	SubscriptionPrice = 'subscriptionPrice',
	SubscriptionPromoCode = 'subscriptionPromoCode',
	SubscriptionStartDate = 'subscriptionStartDate',
	TagType = 'tagType',
	TagValue = 'tagValue',
	TimestampUserTZ = 'timestampUserTZ',
	TimestampUTC = 'timestampUTC',
	UndoNumber = 'undoNumber',
	UniqueUserId = 'uniqueUserId',
	UtmCampaignLastTouch = 'utmCampaignLastTouch',
	UtmContentLastTouch = 'utmContentLastTouch',
	UtmMediumLastTouch = 'utmMediumLastTouch',
	UtmSourceLastTouch = 'utmSourceLastTouch',
	UtmTermLastTouch = 'utmTermLastTouch',
	VideoDuration = 'videoDuration',
	VideoPlayer = 'videoPlayer',
	VideoState = 'videoState',
	VideoQuality = 'videoQuality',
	WatchedDurationSec = 'watchedDurationSec'
}

export const enum MixpanelEntryPoint {
	Banner = 'Banner',
	Carousel = 'Carousel',
	ContinueWatching = 'Continue Watching',
	Direct = 'direct',
	EOPRecommendation = 'EOP Recommendation',
	EPGRail = 'EPG Rail',
	EpisodePopUp = 'Episode Pop Up',
	Footer = 'Footer',
	Homepage = 'Homepage',
	HomepageList = 'Homepage List',
	IDPEpisode = 'IDP - Episode List',
	IDPSubscribe = 'Item Detail Page',
	IDPHeroAutoPlay = 'IDP - Hero Auto Play',
	IDPWatch = 'IDP - Watch/Resume',
	IDPTrailer = 'IDP - Trailer',
	MarketingCampaign = 'Marketing Campaign',
	Menu = 'Menu',
	NavAccount = 'Settings',
	PlayNext = 'Play Next',
	RailCard = 'Rail Card',
	Replay = 'Replay',
	Search = 'Search Result',
	SocialMedia = 'Social Media',
	SwitchChannel = 'Switch Channel',
	SwitchEpisode = 'Switch Episode'
}

export const enum SearchType {
	RecentSearch = 'Recent Search',
	RecommendedSearch = 'Recommended Search',
	SearchBar = 'Search Bar',
	SearchPage = 'Search Page',
	ShowAllResults = 'Show All Results'
}

export const MIXPANEL_ENTRY_POINTS = {
	[VideoEntryPoint.ContinueWatching]: MixpanelEntryPoint.ContinueWatching,
	[VideoEntryPoint.EOPRecommendation]: MixpanelEntryPoint.EOPRecommendation,
	[DomTriggerPoints.EPGRail]: MixpanelEntryPoint.EPGRail,
	[DomTriggerPoints.EpisodePopUp]: MixpanelEntryPoint.EpisodePopUp,
	[VideoEntryPoint.IDPEpisode]: MixpanelEntryPoint.IDPEpisode,
	[VideoEntryPoint.IDPTrailer]: MixpanelEntryPoint.IDPTrailer,
	[VideoEntryPoint.IDPHeroAutoPlay]: MixpanelEntryPoint.IDPHeroAutoPlay,
	[VideoEntryPoint.IDPWatch]: MixpanelEntryPoint.IDPWatch,
	[VideoEntryPoint.PlayNext]: MixpanelEntryPoint.PlayNext,
	[VideoEntryPoint.Search]: MixpanelEntryPoint.Search,
	[VideoEntryPoint.SwitchChannel]: MixpanelEntryPoint.SwitchChannel,
	[VideoEntryPoint.SwitchEpisode]: MixpanelEntryPoint.SwitchEpisode
};

// Mixpanel properties that read from url query params
export const QUERY_PARAMS = {
	[MixpanelVariable.Cid]: 'cid',
	[MixpanelVariable.InternalId]: 'inid',
	[MixpanelVariable.UtmCampaignLastTouch]: 'utm_campaign',
	[MixpanelVariable.UtmContentLastTouch]: 'utm_content',
	[MixpanelVariable.UtmMediumLastTouch]: 'utm_medium',
	[MixpanelVariable.UtmSourceLastTouch]: 'utm_source',
	[MixpanelVariable.UtmTermLastTouch]: 'utm_term'
};

export const DROPDOWN_SELECT_NAME = {
	[MixpanelVariable.AudioFilter]: DropdownSelectName.AUDIO,
	[MixpanelVariable.GenreFilter]: DropdownSelectName.GENRES,
	[MixpanelVariable.SortingFilter]: DropdownSelectName.SORTING,
	[MixpanelVariable.RatingFilter]: DropdownSelectName.RATING
};

export const MIXPANEL_EVENT_DETAILS = {
	[MixpanelVariable.AudioFilter]: DropdownSelectName.AUDIO,
	[MixpanelVariable.AvailableSubtitleLanguages]: 'subtitleLanguages',
	[MixpanelVariable.BackwardTimestamp]: 'seekStart',
	[MixpanelVariable.CardPosition]: 'position',
	[MixpanelVariable.CardTotal]: 'cardTotal',
	[MixpanelVariable.CastResultsCount]: 'resultsByType.people',
	[MixpanelVariable.ClickableLinkCta]: 'linkCta',
	[MixpanelVariable.ClickableLinkDescription]: 'linkDescription',
	[MixpanelVariable.ClickableLinkValue]: 'linkUrl',
	[MixpanelVariable.Currency]: 'plan.currency',
	[MixpanelVariable.CtaDestination]: 'eventData.cta_destination',
	[MixpanelVariable.EntryPoint]: 'entryPoint',
	[MixpanelVariable.ExtraResultsCount]: 'resultsByType.extras',
	[MixpanelVariable.FailureCode]: 'plan.failureCode',
	[MixpanelVariable.FilterType]: 'filterType',
	[MixpanelVariable.FilterValue]: 'filterValue',
	[MixpanelVariable.ForwardTimestamp]: 'seekStart',

	[MixpanelVariable.GenreFilter]: DropdownSelectName.GENRES,
	[MixpanelVariable.ItemResultsCount]: 'resultsByType.items',
	[MixpanelVariable.MenuOption]: 'data.menuItemsOrder',
	[MixpanelVariable.MenuType]: 'data.type',
	[MixpanelVariable.MovieResultsCount]: 'resultsByType.movies',
	[MixpanelVariable.PaymentMethod]: 'plan.paymentMethod',
	[MixpanelVariable.PlayedAudioLanguage]: 'playedAudioLang.label',
	[MixpanelVariable.PlayedSubtitleLanguage]: 'playedSubtitleLang.label',
	[MixpanelVariable.RatingFilter]: DropdownSelectName.RATING,
	[MixpanelVariable.RailPosition]: 'railPosition',
	[MixpanelVariable.SearchKeyword]: 'term',
	[MixpanelVariable.SearchType]: 'searchType',
	[MixpanelVariable.SeekEndTimestamp]: 'seekEnd',
	[MixpanelVariable.SeekStartTimestamp]: 'seekStart',
	[MixpanelVariable.SelectedAudioLanguage]: 'value',
	[MixpanelVariable.SelectedEpisodeId]: 'selectedItem.id',
	[MixpanelVariable.SelectedEpisodeNumber]: 'selectedItem.episodeNumber',
	[MixpanelVariable.SelectedEpisodeTitle]: 'selectedItem.title',
	[MixpanelVariable.SelectedMediaId]: 'selectedItem.id',
	[MixpanelVariable.SelectedProgramGenres]: 'selectedItem.genres',
	[MixpanelVariable.SelectedProgramTaxonomyTier1]: 'selectedItem.customFields.TaxonomyTier1',
	[MixpanelVariable.SelectedProgramTaxonomyTier2]: 'selectedItem.customFields.TaxonomyTier2',
	[MixpanelVariable.SelectedSubtitleLanguage]: 'value',
	[MixpanelVariable.SelectedTotal]: 'selectedTotal',
	[MixpanelVariable.SelectedVideoQuality]: 'value',
	[MixpanelVariable.SelectedVideoType]: 'selectedItem.customFields.TypeId',
	[MixpanelVariable.SeriesResultsCount]: 'resultsByType.tv',
	[MixpanelVariable.SortingFilter]: DropdownSelectName.SORTING,
	[MixpanelVariable.SportsResultsCount]: 'resultsByType.sports',
	[MixpanelVariable.StartoverMode]: 'startoverInfo.startover',
	[MixpanelVariable.StoryExitTrigger]: 'eventData.story_exit_trigger',
	[MixpanelVariable.StoryId]: 'eventData.story_id',
	[MixpanelVariable.StoryPageCount]: 'eventData.story_page_count',
	[MixpanelVariable.StoryPageDuration]: 'eventData.story_page_duration',
	[MixpanelVariable.StoryPageDurationViewedPercent]: 'eventData.story_page_duration_viewed_percent',
	[MixpanelVariable.StoryPageId]: 'eventData.story_page_id',
	[MixpanelVariable.StoryPageIndex]: 'eventData.story_page_index',
	[MixpanelVariable.StoryPageNavigationDirection]: 'eventData.story_page_navigation_direction',
	[MixpanelVariable.StoryPageNavigationType]: 'eventData.story_page_navigation_type',
	[MixpanelVariable.StoryStartTrigger]: 'eventData.story_start_trigger',
	[MixpanelVariable.StoryTitle]: 'eventData.story_title',
	[MixpanelVariable.SubscriptionDiscountedPrice]: 'plan.discountedPrice',
	[MixpanelVariable.SubscriptionEndDate]: 'endDate',
	[MixpanelVariable.SubscriptionGroup]: 'plan.group',
	[MixpanelVariable.SubscriptionPlanId]: 'plan.id',
	[MixpanelVariable.SubscriptionPlanIds]: 'plan.pricePlans',
	[MixpanelVariable.SubscriptionPrice]: 'plan.price',
	[MixpanelVariable.SubscriptionPromoCode]: 'plan.promoCode',
	[MixpanelVariable.SubscriptionStartDate]: 'startDate',
	[MixpanelVariable.TagType]: 'tagType',
	[MixpanelVariable.TagValue]: 'tagValue',
	[MixpanelVariable.TimestampUserTZ]: 'eventData.timestamp_user_tz',
	[MixpanelVariable.TimestampUTC]: 'eventData.timestamp_utc',
	[MixpanelVariable.UndoNumber]: 'undoNumber',
	[MixpanelVariable.VideoQuality]: 'videoQuality'
};

export const SOCIAL_MEDIA_REFERRER_LINKS = ['facebook.com', 'youtube.com', 'instagram.com', 'twitter.com'];

export function getAdobeId() {
	if (window._satellite && window._satellite.getVisitorId) {
		return window._satellite.getVisitorId().getMarketingCloudVisitorID();
	}
}

export function getAudioLanguages(item) {
	const audioLanguages = get(item, 'customFields.AudioLanguages');
	if (Array.isArray(audioLanguages)) {
		return audioLanguages.map(lang => lang.toLowerCase());
	}
	return undefined;
}

export function getContentType(item) {
	return 'Non-Interactive';
}

export function getDefaultAudioLanguage(item) {
	const audioLanguages = getAudioLanguages(item);
	if (audioLanguages && audioLanguages.length > 0) return audioLanguages[0];
}

export function getFormattedPath(path: string) {
	if (!path) return;

	const removedFirstSlash = path.replace('/', '');
	const formatted = removedFirstSlash.replace(/\//g, '|');

	return formatted || MixpanelEntryPoint.Homepage;
}

export function getPrefixSSOID(ssoID: string) {
	return `mewatch-${ssoID}`;
}

export function getProgramTitle(item) {
	const { title, secondaryLanguageTitle } = item;

	if (secondaryLanguageTitle) {
		return `${title} ${secondaryLanguageTitle}`;
	}
	return title;
}

// Gets the latest meid at any one point by calling the refreshMeID() method if it exists
// Handles the case where User B logs in after User A -> meid should refresh to take User B SSO ID
export function getRefreshedMeid() {
	const refreshMeID = get(window, 'refreshMeID');
	if (typeof refreshMeID === 'function') return refreshMeID();

	return getmeID();
}

export function getSeasonId(item) {
	if (isEpisode(item)) return item.seasonId;
	if (isSeason(item)) return item.id;
	return;
}

export function getSeasonNumber(item) {
	if (isEpisode(item)) return get(item, 'season.seasonNumber');
	if (isSeason(item)) return item.seasonNumber;
}

export function getSeasonTotal(item) {
	if (isEpisode(item)) return get(item, 'season.show.availableSeasonCount');
	if (isSeason(item)) return get(item, 'show.availableSeasonCount');
	if (isShow(item)) return item.availableSeasonCount;
}

export function getItemProperty(variable, item) {
	switch (variable) {
		case MixpanelVariable.ContentType:
		case MixpanelVariable.SelectedContentType:
			return getContentType(item);

		case MixpanelVariable.ProgramTitle:
		case MixpanelVariable.SelectedProgramTitle:
			return getProgramTitle(item);

		case MixpanelVariable.SeasonId:
		case MixpanelVariable.SelectedSeasonId:
			return getSeasonId(item);

		case MixpanelVariable.SeasonNumber:
		case MixpanelVariable.SelectedSeasonNumber:
			return getSeasonNumber(item);

		case MixpanelVariable.SeasonTotal:
			return getSeasonTotal(item);

		case MixpanelVariable.SeriesId:
		case MixpanelVariable.SelectedSeriesId:
			return getSeriesId(item);

		case MixpanelVariable.SelectedSeriesTitle:
			return getSeriesTitle(item);

		default:
			return;
	}
}

export function getSeriesId(item) {
	if (isEpisode(item) || isSeason(item)) return item.showId;
	if (isShow(item)) return item.id;
}

export function getUndoRemoveData(data) {
	const cwList = get(data, `cw.${ContinueWatching}.list`) || get(data, `cw.${ContinueWatchingAnonymous}.list`);
	const cardTotal = cwList.size;
	const undoNumber = get(data, 'undoList.length');
	const railPosition = get(data, 'railPosition');
	const undoDetails = { cardTotal, undoNumber, railPosition };
	if (undoNumber > 1) return undoDetails; // if undo more than one item then no need to send position of the item.
	const itemId = get(data, 'undoList')[0].id;
	const position = cwList.items.findIndex(item => item.id === itemId);
	return { ...undoDetails, position };
}

export function getSeriesTitle(item) {
	if (isShow(item)) return item.title;
	if (isSeason(item)) return get(item, 'show.title');
	if (isEpisode(item)) return get(item, 'season.show.title');
}

export function isSocialMediaReferrer(referrer) {
	return SOCIAL_MEDIA_REFERRER_LINKS.some(link => referrer.includes(link));
}

export async function getUpdatedItem(data) {
	const { item } = data;
	const requiresFetch = isSeason(item) || isShow(item) || isEpisode(item);
	if (!requiresFetch) return data;

	const getItemWithCache = getItemWithCacheCreator();
	const updatedItem = await getItemWithCache(item.id);

	return { ...data, item: updatedItem };
}

export async function getUpdatedItemFromEPG(data) {
	const { scheduleItem } = data.item;

	if (isVodAvailable(scheduleItem)) {
		const updatedItemPayload = await getUpdatedItem(data);
		const { item: updatedItem } = updatedItemPayload;

		return { ...updatedItemPayload, item: { ...updatedItem, scheduleItem } };
	}

	return data;
}

export const enhanceSearchRequestEventPropMap = {
	channel: 'channel',
	credit: 'people',
	customAsset: 'sports',
	items: 'items',
	movie: 'movies',
	program: 'extras',
	show: 'tv'
};

export const validateTxDatePattern = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;
