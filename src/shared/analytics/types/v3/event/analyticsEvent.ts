import { BasicContextProperty, EntryContextProperty, ItemContextProperty, StandardContextProperty } from '../context';
import { AnalyticsEventMap } from './analyticsEventMap';

export type ContextProperties =
	| BasicContextProperty
	| StandardContextProperty
	| EntryContextProperty
	| ItemContextProperty;

export enum AnalyticsEventType {
	APP_STARTED = 'App Started',
	APP_READY = 'App Ready',
	APP_CLOSED = 'App Closed',
	APP_OFFLINE = 'App Offline',
	APP_ONLINE = 'App Online',

	BANNER_SHOWN = 'Banner Shown',
	BANNER_CLICKED = 'Banner Clicked',
	BANNER_CLOSED = 'Banner Closed',

	PAGE_VIEWED = 'Page Viewed',
	ITEM_DETAIL_PAGE_VIEWED = 'Item Detail Page Viewed',
	MY_LIST_PAGE_VIEWED = 'My List Page Viewed',
	LIST_PAGE_VIEWED = 'List Page Viewed',
	WATCH_PAGE_VIEWED = 'Watch Page Viewed',
	FILTER_REQUEST = 'Filter Request',
	CW_MENU_CLICKED = 'CW Menu Clicked',
	CW_MENU_REMOVE_CW = 'CW Menu Remove CW',
	CW_MENU_VIEW_INFO = 'CW Menu View Info',
	CW_PAGE_EDIT = 'CW Page Edit',
	CW_PAGE_SELECT_ALL = 'CW Page Select All',
	CW_PAGE_DESELECT_ALL = 'CW Page Deselect All',
	CW_PAGE_REMOVE_SELECTED = 'CW Page Remove Selected',
	CW_MENU_UNDO_REMOVE = 'CW Menu Undo Remove',
	CW_MENU_UNDO_REMOVE_MULTIPLE = 'CW Menu Undo Remove Multiple',
	CW_PAGE_SELECT_SINGLE_REMOVE = 'CW Page Select Single Remove',
	AUTOFILL_SEARCH_CLICK = 'Autofill Search Item Clicked',
	SEARCHED = 'Searched',
	ENTRY_VIEWED = 'Entry Viewed',
	ENTRY_INTERACTED = 'Entry Interacted',
	RAIL_HEADER_CLICKED = 'Rail Header Clicked',

	MENU_CLICKED = 'Menu Clicked',
	ITEM_VIEWED = 'Item Viewed',
	ITEM_FOCUSED = 'Item Focused',
	ITEM_CLICKED = 'Item Clicked',
	ITEM_CLICKED_TO_WATCH = 'Item Clicked To Watch',
	ITEM_DETAIL_VIEWED = 'Item Detail Viewed',
	ITEM_WATCHED = 'Item Watched',
	ITEM_ACTIONED = 'Item Actioned',
	ITEM_BOOKMARK_ADD_CLICKED = 'Item Bookmark Add Clicked',
	ITEM_BOOKMARK_REMOVE_CLICKED = 'Item Bookmark Remove Clicked',
	ITEM_BOOKMARKED = 'Item Bookmarked',
	ITEM_RATED = 'Item Rated',
	ITEM_OFFERED = 'Item Offered',
	ITEM_RENTED = 'Item Rented',
	ITEM_OWNED = 'Item Owned',
	ITEM_SUBSCRIBE_CLICKED = 'Item Subscribe Clicked',
	ITEM_WATCH_PROGRAM_TRAILER = 'Item Watch Program Trailer',
	ITEM_PROGRAM_TAG_CLICKED = 'Item Program Tag Clicked',
	ITEM_PROGRAM_SYNOPSIS_CLICKED = 'Item Program Synopsis Clicked',
	ITEM_IDP_LINK_CLICKED = 'Item IDP Link Clicked',
	ITEM_INFO_LINK_CLICKED = 'Item Info Link Clicked',
	ITEM_INFO_ICON_CLICKED = 'Item Info Icon Clicked',
	ITEM_SET_REMINDER = 'Item Set Reminder',
	ITEM_USER_PREFERENCES_CLICKED = 'Item User Preferences Clicked',

	CTA_CLICKED = 'CTA Clicked',
	CTA_SOCIAL_SHARE_CLICKED = 'CTA Social Share Clicked',

	SUBSCRIBE_PAGE = 'Subscribe Page',
	SUBSCRIPTION_VIEW_PLAN = 'Subscription View Plan',
	SUBSCRIBE_SELECT_PLANS = 'Subscribe Select Plans',
	SUBSCRIBE_PROCEED_TO_PAY = 'Subscribe Proceed To Pay',
	SUBSCRIBE_CONFIRM_AND_PROCEED = 'Subscribe Confirm And Proceed',
	SUBSCRIBE_APPLY_PROMO = 'Subscribe Apply Promo',
	SUBSCRIBE_PROCEED_TO_PAYMENT = 'Subscribe Proceed To Payment',
	SUBSCRIPTION_SUCCESS = 'Subscription Success',
	SUBSCRIPTION_FAILURE = 'Subscription Failure',

	RESOURCE_ERROR = 'Resource Error',
	CLIENT_ERROR = 'Client Error',
	UNKNOWN_ERROR = 'Unknown Error',
	SERVER_ERROR = 'Server Error',
	SYSTEM_ERROR = 'System Error',

	VIDEO_INITIALIZED = 'Video Initialized',
	VIDEO_FIRST_PLAYING = 'Video First Playing',
	VIDEO_CAN_PLAY = 'Video Can Play',
	VIDEO_REQUESTED = 'Video Requested',
	VIDEO_BUFFERING = 'Video Buffering',
	VIDEO_PLAYING = 'Video Playing',
	VIDEO_PROGRESSED = 'Video Progressed',
	VIDEO_COMPLETED = 'Video Completed',
	VIDEO_ERROR = 'Video Error',
	VIDEO_EXIT = 'Video Exit',

	VIDEO_ACTUATE_PAUSE = 'Video Actuate Pause',
	VIDEO_PAUSED = 'Video Paused',
	VIDEO_ACTUATE_PLAY = 'Video Actuate Play',
	VIDEO_RESUMED = 'Video Resumed',
	VIDEO_SEEKED = 'Video Seeked',
	VIDEO_RESTARTED = 'Video Restarted',
	VIDEO_CHAINPLAYED = 'Video Chainplayed',
	VIDEO_LINEAR_PROGRAM_UPDATED = 'Video Linear Program Updated',
	VIDEO_ACTIONED = 'Video Actioned',
	VIDEO_ITEM_CLICKED = 'Video Item Clicked',
	VIDEO_START_OVER_CLICKED = 'Video Start Over Clicked',

	VIDEO_SELECT_AUDIO = 'Video Select Audio',
	VIDEO_SELECT_QUALITY = 'Video Select Quality',
	VIDEO_SELECT_SUBTITLE = 'Video Select Subtitle',
	VIDEO_WATCH_COMPLETED = 'Video Watch Completed',

	VIDEO_AD_LOADED = 'Video Ad Loaded',
	VIDEO_AD_STARTED = 'Video Ad Started',
	VIDEO_AD_PROGRESS = 'Video Ad Progress',
	VIDEO_AD_QUARTILE = 'Video Ad Quartile',
	VIDEO_AD_PAUSED = 'Video Ad Paused',
	VIDEO_AD_COMPLETED = 'Video Ad Completed',
	VIDEO_AD_SKIPPED = 'Video Ad Skipped',
	VIDEO_AD_VOLUMECHANGED = 'Video Ad Volume Changed',

	USER_PROFILE_SELECTED = 'User Profile Selected',
	USER_ACTIONED = 'User Actioned',
	USER_REGISTERING = 'User Registering',
	USER_REGISTERED = 'User Registered',
	USER_IDENTIFIED = 'User Identified',
	USER_SIGNED_IN = 'User Signed In',
	USER_SIGN_OUT = 'User Signed Out',

	USER_PROFILE_PERSONALISATION_PREFERENCES_GENRES = 'User Personalisation Preferences Genres',
	USER_PROFILE_PERSONALISATION_PREFERENCES_ASSETS = 'User Personalisation Preferences Assets',

	GENERIC_ANALYTICS_EVENT = 'Generic Analytics Event'
}

export type AnalyticsEvent<C extends ContextProperties = BasicContextProperty, D extends object = undefined> = {
	// type: T;
	detail: D;
	context: C;
	timestamp: number;
};

export interface PartialEvent {
	type: keyof AnalyticsEventMap;
	timestamp: number;
	detail: object;
}
export type PartialEventMapped<T extends PartialEvent> = Pick<T, 'type' | 'timestamp' | 'detail'>;
export type EventWithContext<P extends PartialEvent, C extends ContextProperties> = {
	type: P['type'];
	timestamp: P['timestamp'];
	detail: P['detail'];
	context: C;
};
