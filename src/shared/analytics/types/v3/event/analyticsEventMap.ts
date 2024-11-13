import { BasicContextProperty, EntryContextProperty, ItemContextProperty, StandardContextProperty } from '../context';
import { AnalyticsEvent } from './analyticsEvent';
import {
	BrowserSearchDetails,
	BrowserRecommendSearchDetails,
	FilterRequestDetails,
	ListPageDetails,
	ProgramTagDetails,
	PageViewedDetails
} from './browseEvents';
import * as Error from './errorEvents';
import {
	IItemIDPLinkClickDetails,
	IItemInfoLinkClickDetails,
	IItemInteractionEventDetail,
	IItemCwMenuEventDetail
} from './itemEvents';
import * as Item from './itemEvents';
import * as User from './userEvents';
import * as Video from './videoEvents';

export type AppEvents = {
	'App Started': AnalyticsEvent<BasicContextProperty>;
	'App Ready': AnalyticsEvent<BasicContextProperty>;
	'App Closed': AnalyticsEvent<BasicContextProperty>;
	'App Offline': AnalyticsEvent<BasicContextProperty>;
	'App Online': AnalyticsEvent<BasicContextProperty>;
};

type BrowseEvents = {
	'Banner Shown': AnalyticsEvent<StandardContextProperty>;
	'Banner Clicked': AnalyticsEvent<StandardContextProperty>;
	'Banner Closed': AnalyticsEvent<StandardContextProperty>;
	'Entry Viewed': AnalyticsEvent<EntryContextProperty>;
	'Entry Interacted': AnalyticsEvent<EntryContextProperty>;
	'Filter Request': AnalyticsEvent<StandardContextProperty, FilterRequestDetails>;
	'CW Menu Undo Remove Multiple': AnalyticsEvent<
		StandardContextProperty,
		{ cardTotal: number; undoNumber: number; position?: number; railPosition?: number }
	>;
	'CW Page Edit': AnalyticsEvent<StandardContextProperty, { cardTotal: number }>;
	'CW Page Select All': AnalyticsEvent<StandardContextProperty, { cardTotal: number }>;
	'CW Page Deselect All': AnalyticsEvent<StandardContextProperty, { cardTotal: number }>;
	'CW Page Remove Selected': AnalyticsEvent<StandardContextProperty, { cardTotal: number; selectedTotal: number }>;
	'CW Page Select Single Remove': AnalyticsEvent<ItemContextProperty, { cardTotal: number; position: number }>;
	'Page Viewed': AnalyticsEvent<StandardContextProperty, PageViewedDetails>;
	'Item Detail Page Viewed': AnalyticsEvent<ItemContextProperty>;
	'My List Page Viewed': AnalyticsEvent<StandardContextProperty, ListPageDetails>;
	'List Page Viewed': AnalyticsEvent<StandardContextProperty, ListPageDetails>;
	'Watch Page Viewed': AnalyticsEvent<ItemContextProperty>;
	'Autofill Search Item Clicked': AnalyticsEvent<StandardContextProperty, BrowserRecommendSearchDetails>;
	Searched: AnalyticsEvent<StandardContextProperty, BrowserSearchDetails>;
	'Rail Header Clicked': AnalyticsEvent<EntryContextProperty>;
};

type CTAEvent = {
	'CTA Clicked': AnalyticsEvent<StandardContextProperty>;
	'CTA Social Share Clicked': AnalyticsEvent<StandardContextProperty>;
};

type SubscriptionEvent = {
	'Subscribe Page': AnalyticsEvent<EntryContextProperty, { entryPoint?: any }>;
	'Subscription View Plan': AnalyticsEvent<StandardContextProperty, { plan: any }>;
	'Subscribe Select Plans': AnalyticsEvent<StandardContextProperty, { plan: any }>;
	'Subscribe Apply Promo': AnalyticsEvent<StandardContextProperty, { plan: any }>;
	'Subscribe Proceed To Payment': AnalyticsEvent<StandardContextProperty, { plan: any }>;
	'Subscribe Proceed To Pay': AnalyticsEvent<StandardContextProperty, { plan: any }>;
	'Subscribe Confirm And Proceed': AnalyticsEvent<StandardContextProperty, { plan: any }>;
	'Subscription Failure': AnalyticsEvent<StandardContextProperty, { plan: any }>;
	'Subscription Success': AnalyticsEvent<StandardContextProperty, { plan: any }>;
};

type ErrorEvents = {
	'Resource Error': AnalyticsEvent<StandardContextProperty, Error.IResourceErrorDetail>;
	'Client Error': AnalyticsEvent<StandardContextProperty, Error.IExceptionEventDetail>;
	'Server Error': AnalyticsEvent<StandardContextProperty, Error.IExceptionEventDetail>;
	'System Error': AnalyticsEvent<StandardContextProperty, Error.IExceptionEventDetail>;
	'Unknown Error': AnalyticsEvent<StandardContextProperty, Error.IExceptionEventDetail>;
};

type GenericEvent = {
	'Generic Analytics Event': AnalyticsEvent<StandardContextProperty>;
};

type ItemEvents = {
	'CW Menu Clicked': AnalyticsEvent<ItemContextProperty, IItemCwMenuEventDetail>;
	'CW Menu Remove CW': AnalyticsEvent<ItemContextProperty, IItemCwMenuEventDetail>;
	'CW Menu Undo Remove': AnalyticsEvent<
		ItemContextProperty,
		{ cardTotal: number; undoNumber: number; position?: number; railPosition?: number }
	>;
	'CW Menu View Info': AnalyticsEvent<ItemContextProperty, IItemCwMenuEventDetail>;
	'Item Viewed': AnalyticsEvent<ItemContextProperty, IItemInteractionEventDetail>;
	'Item Clicked': AnalyticsEvent<ItemContextProperty, IItemInteractionEventDetail>;
	'Item Clicked To Watch': AnalyticsEvent<ItemContextProperty, { entryPoint?: string }>;
	'Item User Preferences Clicked': AnalyticsEvent<ItemContextProperty>;
	'Item Watched': AnalyticsEvent<ItemContextProperty>;
	'Item Detail Viewed': AnalyticsEvent<ItemContextProperty>; // SPEC:Position? Image?
	'Item Focused': AnalyticsEvent<ItemContextProperty, IItemInteractionEventDetail>;
	'Item Actioned': AnalyticsEvent<ItemContextProperty, Item.IItemActionedTrackingEventDetail>;
	'Item Bookmark Add Clicked': AnalyticsEvent<ItemContextProperty>;
	'Item Bookmark Remove Clicked': AnalyticsEvent<ItemContextProperty, IItemInteractionEventDetail>;
	'Item Bookmarked': AnalyticsEvent<ItemContextProperty, { isBookmarked: boolean }>;
	'Item Rated': AnalyticsEvent<ItemContextProperty, { rating: number }>;
	'Item Offered': AnalyticsEvent<ItemContextProperty, Item.IItemOfferedTrackingEventDetail>;
	'Item Subscribe Clicked': AnalyticsEvent<ItemContextProperty>;
	'Item Rented': AnalyticsEvent<ItemContextProperty, Item.IItemOfferTrackingEventDetail>;
	'Item Owned': AnalyticsEvent<ItemContextProperty, Item.IItemOfferTrackingEventDetail>;
	'Item Watch Program Trailer': AnalyticsEvent<ItemContextProperty, { subtitleLanguages?: string[] }>;
	'Item Program Tag Clicked': AnalyticsEvent<ItemContextProperty, ProgramTagDetails>;
	'Item Program Synopsis Clicked': AnalyticsEvent<ItemContextProperty>;
	'Item IDP Link Clicked': AnalyticsEvent<ItemContextProperty, IItemIDPLinkClickDetails>;
	'Item Info Icon Clicked': AnalyticsEvent<ItemContextProperty, IItemInfoLinkClickDetails>;
	'Item Info Link Clicked': AnalyticsEvent<ItemContextProperty, IItemInfoLinkClickDetails>;
	'Item Set Reminder': AnalyticsEvent<ItemContextProperty, { entryPoint?: string }>;
};

type MenuEvent = {
	'Menu Clicked': AnalyticsEvent<BasicContextProperty>;
};

type UserEvents = {
	'User Profile Selected': AnalyticsEvent<StandardContextProperty>;
	'User Actioned': AnalyticsEvent<StandardContextProperty, User.IUserActionedTrackingEventDetail>;
	'User Registered': AnalyticsEvent<StandardContextProperty, User.IUserRegisteredEventDetail>;
	'User Registering': AnalyticsEvent<StandardContextProperty, User.IUserRegisteringEventDetail>;
	'User Identified': AnalyticsEvent<StandardContextProperty>;
	'User Signed Out': AnalyticsEvent<StandardContextProperty, { auto: boolean }>;
	'User Signed In': AnalyticsEvent<StandardContextProperty, { newsletters?: string[] }>;

	'User Personalisation Preferences Genres': AnalyticsEvent<StandardContextProperty>;
	'User Personalisation Preferences Assets': AnalyticsEvent<StandardContextProperty>;
};

type VideoEvents = {
	'Video Initialized': AnalyticsEvent<ItemContextProperty, Video.IVideoItemDetail>;
	'Video First Playing': AnalyticsEvent<ItemContextProperty, Video.IVideoEventDetail>;
	'Video Requested': AnalyticsEvent<ItemContextProperty, Video.IVideoEventDetail>;
	'Video Buffering': AnalyticsEvent<ItemContextProperty, Video.IVideoEventDetail>;
	'Video Playing': AnalyticsEvent<ItemContextProperty, Video.IVideoEventDetail>;
	'Video Progressed': AnalyticsEvent<ItemContextProperty, Video.IVideoEventDetail>;
	'Video Completed': AnalyticsEvent<ItemContextProperty, Video.IVideoEventDetail>;
	'Video Error': AnalyticsEvent<ItemContextProperty, Video.IVideoErrorTrackingEventDetail>;
	'Video Exit': AnalyticsEvent<ItemContextProperty, Video.IVideoEventDetail>;
	'Video Actioned': AnalyticsEvent<ItemContextProperty, Video.IVideoActionTrackingEventDetail>;
	'Video Actuate Pause': AnalyticsEvent<ItemContextProperty, Video.IVideoEventDetail>;
	'Video Paused': AnalyticsEvent<ItemContextProperty, Video.IVideoEventDetail>;
	'Video Actuate Play': AnalyticsEvent<ItemContextProperty, Video.IVideoEventDetail>;
	'Video Resumed': AnalyticsEvent<ItemContextProperty, Video.IVideoEventDetail>;
	'Video Seeked': AnalyticsEvent<ItemContextProperty, Video.IVideoEventDetail>;
	'Video Restarted': AnalyticsEvent<ItemContextProperty, { entryPoint: string }>;
	'Video Chainplayed': AnalyticsEvent<ItemContextProperty, Video.IVideoTrackingEventDetail>;
	'Video Linear Program Updated': AnalyticsEvent<ItemContextProperty, Video.IVideoActionTrackingEventDetail>;
	'Video Ad Loaded': AnalyticsEvent<ItemContextProperty, Video.IAdTrackingEventDetail>;
	'Video Ad Started': AnalyticsEvent<ItemContextProperty, Video.IAdTrackingEventDetail>;
	'Video Ad Progress': AnalyticsEvent<ItemContextProperty, Video.IAdTrackingEventDetail>;
	'Video Ad Quartile': AnalyticsEvent<ItemContextProperty, Video.IAdTrackingEventDetail>;
	'Video Ad Paused': AnalyticsEvent<ItemContextProperty, Video.IAdTrackingEventDetail>;
	'Video Ad Completed': AnalyticsEvent<ItemContextProperty, Video.IAdTrackingEventDetail>;
	'Video Ad Skipped': AnalyticsEvent<ItemContextProperty, Video.IAdTrackingEventDetail>;
	'Video Ad Volume Changed': AnalyticsEvent<ItemContextProperty, Video.IAdTrackingEventDetail>;
	'Video Can Play': AnalyticsEvent<ItemContextProperty, Video.IVideoCanPlayActionDetail>;
	'Video Item Clicked': AnalyticsEvent<ItemContextProperty, Video.IVideoItemEventDetail>;
	'Video Select Audio': AnalyticsEvent<ItemContextProperty, Video.IVideoActionTrackingEventDetail>;
	'Video Select Quality': AnalyticsEvent<ItemContextProperty, Video.IVideoActionTrackingEventDetail>;
	'Video Select Subtitle': AnalyticsEvent<ItemContextProperty, Video.IVideoEventDetail>;
	'Video Watch Completed': AnalyticsEvent<ItemContextProperty, Video.IVideoEventDetail>;
	'Video Start Over Clicked': AnalyticsEvent<ItemContextProperty, Video.IVideoActionTrackingEventDetail>;
};

/*
 * This lookup table is necessary for TypeScript to narrow down a union types using generics
 * where normally a discriminant would work
 * see: https://stackoverflow.com/questions/46312206/narrowing-a-return-type-from-a-generic-discriminated-union-in-typescript
 * */

type AnalyticsEvents = AppEvents &
	BrowseEvents &
	CTAEvent &
	SubscriptionEvent &
	ErrorEvents &
	GenericEvent &
	ItemEvents &
	MenuEvent &
	UserEvents &
	VideoEvents;

export type AnalyticsEventMap = { [K in keyof AnalyticsEvents]: { type: K } & AnalyticsEvents[K] };
