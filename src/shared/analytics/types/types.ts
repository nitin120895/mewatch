import { Middleware, Store } from 'redux';

import { X2PageEntryProps } from 'ref/responsive/pageEntry/custom/X2WebView';
import { IPlayerStateData, VideoPlayerActions, VideoPlayerStates } from 'shared/analytics/types/playerStatus';
import { IVideoProgress } from 'shared/analytics/types/v3/event/videoEvents';

import { EntryContext, Image } from './v3/context/entry';
import { TrackingEvent } from './v3/event';

export type Option<T> = T | undefined;

export interface ServiceErrorActionPayload {
	request: api.ServiceRequest;
	response?: api.Response<api.ServiceError>;
	error: Error | api.ServiceError;
}

export enum EventName {
	'CLICK' = 'click',
	'MOUSEDOWN' = 'mousedown',
	'MOUSEENTER' = 'mouseenter',
	'MOUSELEAVE' = 'mouseleave',
	'TOUCHEND' = 'touchend',
	'ERROR' = 'error',
	'VISIBLE' = 'visible',
	'HIDDEN' = 'hidden',
	'VIEWED' = 'viewed',
	'HSCROLL' = 'hscroll'
}

export enum PixelEvent {
	bag = 'mewatch_shopping-bag',
	like = 'mewatch_like-click',
	share = 'mewatch_social-share',
	copyLink = 'mewatch_copy-sharedlink',
	copyCode = 'mewatch_copy-code',
	product = 'mewatch_view-product',
	comment = 'mewatch_tap-comment'
}

export type PsuedoMenuEntryProps = Pick<PageEntryPropsBase, 'type' | 'title' | 'template' | 'index'> & {
	list: api.ItemList;
	location: { pathname: string };
	template: 'MENU';
};

export type EntryProps = PageEntryPropsBase &
	PageEntryImageProps &
	PageEntryItemDetailProps &
	PageEntryItemProps &
	PageEntryListProps &
	PageEntryPeopleProps &
	PageEntryTextProps &
	X2PageEntryProps &
	PsuedoMenuEntryProps;

export enum DomEventSourceType {
	CTA = 'CTA',
	Entry = 'entry',
	Item = 'item',
	Menu = 'menu',
	RailHeader = 'railHeader',
	Trigger = 'trigger',
	VideoItem = 'videoItem'
}

export enum CTATypes {
	Default = 'default',
	Bag = 'bag',
	Comment = 'comment',
	CopyCode = 'copyCode',
	CopyLink = 'copyLink',
	CWMenu = 'cwMenu',
	CWMenuRemoveCW = 'cwMenuRemoveCW',
	CWMenuViewInfo = 'cwMenuViewInfo',
	IDPLink = 'idpLink',
	Like = 'like',
	InfoIcon = 'infoIcon',
	InfoLink = 'infoLink',
	Preferences = 'preferences',
	Product = 'product',
	ProgramTag = 'programTag',
	Watch = 'watch',
	Offer = 'offer',
	RemoveSelected = 'removeSelected',
	SetReminder = 'setReminder',
	Synopsis = 'synopsis',
	Trailer = 'trailer'
}

export enum MenuTypes {
	Main = 'Main Menu',
	HoverDropdown = 'Hover Dropdown'
}

export enum PlayerType {
	Kaltura = 'kaltura'
}

export enum TagType {
	Genre = 'genre'
}

export enum VideoEntryPoint {
	ContinueWatching = 'ContinueWatching',
	EOPRecommendation = 'EOPRecommendation',
	IDPEpisode = 'IDPEpisode',
	IDPHeroAutoPlay = 'IDPHeroAutoPlay',
	IDPTrailer = 'IDPTrailer',
	IDPWatch = 'IDPWatch',
	PlayNext = 'PlayNext',
	Search = 'Search',
	SwitchChannel = 'SwitchChannel',
	SwitchEpisode = 'SwitchEpisode'
}

interface IDomEvent<D, S extends DomEventSourceType & string> {
	sourceType: S;
	eventName: EventName;
	data: D;
}

// For stricter check on trigger points
export enum DomTriggerPoints {
	BtnBackward = 'btn_backward',
	BtnForward = 'btn_forward',
	BtnSkipIntro = 'btn_skip_intro',
	DropSelect = 'drop_select',
	EPGRail = 'EPGRail',
	EpisodePopUp = 'EpisodePopUp',
	NavAccount = 'navigation_account',
	NavRegister = 'navigation_register',
	NavSignIn = 'navigation_signin',
	RailTitle = 'rail_title',
	RecentSearch = 'recent_search',
	RecommendedSearch = 'recommended_search',
	Scrubber = 'scrubber',
	SearchBar = 'search_bar',
	SearchPage = 'search_page',
	ShowAllResults = 'show_all_results'
}

// Fallback strings required for old ref app to compile.
// For future trigger points, add to enum DomTriggerPoints
export type DomEventTriggers =
	| DomTriggerPoints
	| 'dh1_primary'
	| 'dh1_bookmark'
	| 'navigation_register'
	| 'navigation_signin'
	| '_UKNOWN_';

export type DomEventItem = IDomEvent<
	{
		item: api.ItemSummary;
		entry: EntryContext | undefined;
		index: number;
		image: Image;
		edit?: boolean;
		listData?: api.ListData;
		totalScheduleCount?: number;
		totalCastCount?: number;
	},
	DomEventSourceType.Item
>;

export type DomEventVideoItem = IDomEvent<
	{
		item: api.ItemSummary;
		selectedItem: api.ItemSummary;
	},
	DomEventSourceType.VideoItem
>;

export type DomEventEntry = IDomEvent<{ entry: EntryContext }, DomEventSourceType.Entry>;

export type DomEventMenu = IDomEvent<{ type: any; menuItemsOrder: any }, DomEventSourceType.Menu>;

export type DomEventRailHeader = IDomEvent<{ entry: EntryContext }, DomEventSourceType.RailHeader>;

export type DomEventTrigger = IDomEvent<{ trigger: DomEventTriggers; data: any }, DomEventSourceType.Trigger>;

export type DomEventCta = IDomEvent<{ type: any }, DomEventSourceType.CTA>;

export type DomEventOfferCta = IDomEvent<
	{ type: CTATypes.Offer; data: { offer: api.Offer; item: api.ItemDetail; title: string } },
	DomEventSourceType.CTA
>;

export type DomEventCWPageRemoveSelectedCta = IDomEvent<
	{ type: CTATypes.RemoveSelected; data: { cardTotal: number; selectedTotal: number } },
	DomEventSourceType.CTA
>;

export type DomEventProductCta = IDomEvent<
	{ type: CTATypes.Product; data: { name: string; revenue: number } },
	DomEventSourceType.CTA
>;

export type DomEventItemCta = IDomEvent<
	{ type: any; data: { item: api.ItemDetail; entryPoint?: string } },
	DomEventSourceType.CTA
>;

export type DomEventInfoLinkCta = IDomEvent<
	{
		type: CTATypes.InfoLink;
		data: { item: any; linkCta: string; linkDescription: string; linkUrl: string; currentTime?: number };
	},
	DomEventSourceType.CTA
>;

export type DomEventInfoIconCta = IDomEvent<
	{
		type: CTATypes.InfoIcon;
		data: { linkUrl: string; linkDescription: string; linkCta: string; currentTime?: number; item: any };
	},
	DomEventSourceType.CTA
>;

export type DomEventIDPLinkCta = IDomEvent<
	{ type: CTATypes.IDPLink; data: { linkUrl: string; item: api.ItemDetail } },
	DomEventSourceType.CTA
>;

export type DomEventPreferencesCta = IDomEvent<
	{
		type: CTATypes.Preferences;
		data: { items: api.ItemDetail[]; subgenre: string; refUsecase: string; list: object };
	},
	DomEventSourceType.CTA
>;

export type DomEventProgramTagCta = IDomEvent<
	{ type: CTATypes.ProgramTag; data: { tagType: string; tagValue: string; item: api.ItemDetail } },
	DomEventSourceType.CTA
>;

export type DomEventSynopsisCta = IDomEvent<
	{ type: CTATypes.Synopsis; data: { item: api.ItemDetail; isCollapsed: boolean } },
	DomEventSourceType.CTA
>;

export type DomEvents =
	| DomEventCta
	| DomEventCWPageRemoveSelectedCta
	| DomEventEntry
	| DomEventItem
	| DomEventItemCta
	| DomEventIDPLinkCta
	| DomEventInfoLinkCta
	| DomEventInfoIconCta
	| DomEventMenu
	| DomEventOfferCta
	| DomEventProductCta
	| DomEventProgramTagCta
	| DomEventRailHeader
	| DomEventSynopsisCta
	| DomEventTrigger
	| DomEventPreferencesCta
	| DomEventVideoItem;

export interface IVideoAction {
	type: 'action';
	action: VideoPlayerActions;
	data: Partial<IPlayerStateData> & IVideoProgress;
}

export interface IVideoState {
	type: 'state';
	state: VideoPlayerStates;
	data: Partial<IPlayerStateData> & IVideoProgress;
}

export type VideoEvent = IVideoAction | IVideoState;

export interface AnalyticsContext {
	emitDomEvent: (eventSource: DomEventSourceType, event: Event, data: DomEvents['data']) => void;
	emitVideoEvent: (event: VideoEvent) => void;
}

export type EventConsumer = () => (event: TrackingEvent) => void;

export interface AxisAnalytics {
	middleware: Middleware;
	run: (store: Store<state.Root | undefined>) => void;
	emitDomEvent: (event: DomEvents) => void;
	emitVideoEvent: (event: VideoEvent) => void;
}
