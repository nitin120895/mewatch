import {
	REGISTRATION_CANCEL,
	REGISTRATION_COMPLETE,
	REGISTRATION_START,
	SUBSCRIPTION_PROMO_CODE
} from 'shared/account/accountWorkflow';
import { UNDO_DELETE_CONTINUE_WATCHING } from 'shared/account/profileWorkflow';
import { CLEAR_ANONYMOUS_TOKEN, SELECT_PROFILE, SIGN_IN, SIGN_OUT } from 'shared/account/sessionWorkflow';
import { SINGLE_SIGN_ON_ANONYMOUS } from 'shared/service/action/authorization';
import { ServiceErrorActionPayload } from 'shared/analytics/types/types';
import { TRIGGER_SECONDARY_RENDER, UPDATE_ONLINE_STATUS } from 'shared/app/appWorkflow';
import { GET_PAGE_SUMMARY, GET_PAGE_DETAIL, PAGE_CHANGE } from 'shared/page/pageWorkflow';

import {
	CREATE_PROFILE,
	DELETE_PROFILE_WITH_ID,
	GET_ACCOUNT,
	GET_ITEM_MEDIA_FILES,
	GET_PURCHASES_EXTENDED,
	UPDATE_ACCOUNT,
	UPDATE_PROFILE_WITH_ID
} from 'shared/service/action/account';

import { GET_PAGE, GET_APP_CONFIG } from 'shared/service/action/app';
import { GET_PUBLIC_ITEM_MEDIA_FILES, SEARCH } from 'shared/service/action/content';
import { BOOKMARK_ITEM, DELETE_ITEM_BOOKMARK, RATE_ITEM } from 'shared/service/action/profile';
import { SERVICE_ERROR, UNCAUGHT_EXCEPTION_ERROR, UNCAUGHT_PROMISE_ERROR } from 'shared/app/errors';
import { NEXT_PLAYBACK_ITEM } from 'shared/app/playerWorkflow';
import { RWAReduxAction } from './index';
import { ANALYTICS_EVENT } from 'shared/analytics/analyticsWorkflow';
import { SHARE_MODAL_SOCIAL_PLATFORM, SHOW_MODAL } from 'shared/uiLayer/uiLayerWorkflow';

export {
	SELECT_PROFILE,
	SIGN_IN,
	SIGN_OUT,
	REGISTRATION_START,
	REGISTRATION_COMPLETE,
	REGISTRATION_CANCEL,
	TRIGGER_SECONDARY_RENDER,
	UPDATE_ONLINE_STATUS,
	UNCAUGHT_PROMISE_ERROR,
	SERVICE_ERROR,
	UNCAUGHT_EXCEPTION_ERROR,
	GET_ITEM_MEDIA_FILES,
	GET_PUBLIC_ITEM_MEDIA_FILES,
	GET_PAGE_SUMMARY,
	GET_PAGE_DETAIL,
	PAGE_CHANGE,
	CREATE_PROFILE,
	DELETE_PROFILE_WITH_ID,
	GET_ACCOUNT,
	GET_PURCHASES_EXTENDED,
	UPDATE_ACCOUNT,
	UPDATE_PROFILE_WITH_ID,
	GET_PAGE,
	GET_APP_CONFIG,
	SEARCH,
	SHOW_MODAL,
	RATE_ITEM,
	BOOKMARK_ITEM,
	DELETE_ITEM_BOOKMARK,
	NEXT_PLAYBACK_ITEM,
	SUBSCRIPTION_PROMO_CODE,
	UNDO_DELETE_CONTINUE_WATCHING
};

export type RWAAction =
	| typeof CREATE_PROFILE
	| typeof DELETE_PROFILE_WITH_ID
	| typeof GET_PURCHASES_EXTENDED
	| typeof UPDATE_ACCOUNT
	| typeof UPDATE_PROFILE_WITH_ID
	| typeof SELECT_PROFILE
	| typeof TRIGGER_SECONDARY_RENDER
	| typeof UPDATE_ONLINE_STATUS
	| typeof PAGE_CHANGE
	| typeof GET_ITEM_MEDIA_FILES
	| typeof GET_PUBLIC_ITEM_MEDIA_FILES
	| typeof GET_PAGE_SUMMARY
	| typeof GET_PAGE_DETAIL
	| typeof GET_ACCOUNT
	| typeof SIGN_IN
	| typeof CLEAR_ANONYMOUS_TOKEN
	| typeof SINGLE_SIGN_ON_ANONYMOUS
	| typeof SIGN_OUT
	| typeof REGISTRATION_START
	| typeof REGISTRATION_COMPLETE
	| typeof REGISTRATION_CANCEL
	| typeof GET_PAGE
	| typeof SEARCH
	| typeof SHOW_MODAL
	| typeof RATE_ITEM
	| typeof BOOKMARK_ITEM
	| typeof DELETE_ITEM_BOOKMARK
	| typeof NEXT_PLAYBACK_ITEM
	| typeof SERVICE_ERROR
	| typeof UNCAUGHT_PROMISE_ERROR
	| typeof UNCAUGHT_EXCEPTION_ERROR
	| typeof GET_APP_CONFIG
	| typeof ANALYTICS_EVENT
	| typeof SHARE_MODAL_SOCIAL_PLATFORM
	| typeof SUBSCRIPTION_PROMO_CODE
	| typeof UNDO_DELETE_CONTINUE_WATCHING;

type ItemDetailPagePayload = api.PageSummary & { item?: api.ItemDetail };

export type GetPageSummaryAction = RWAReduxAction<
	typeof GET_PAGE_SUMMARY,
	ItemDetailPagePayload,
	{ info: HistoryLocation }
>;

export type GetPageDetailAction = RWAReduxAction<
	typeof GET_PAGE_DETAIL,
	ItemDetailPagePayload,
	{ info: HistoryLocation }
>;
export type AddItemBookmarkAction = RWAReduxAction<typeof BOOKMARK_ITEM, {}, { info: { item: api.ItemDetail } }>;
export type DeleteItemBookmarkAction = RWAReduxAction<
	typeof DELETE_ITEM_BOOKMARK,
	{},
	{ info: { item: api.ItemDetail } }
>;
export type ItemRatedAction = RWAReduxAction<
	typeof RATE_ITEM,
	api.UserRating,
	{ info: { item: api.ItemDetail; ratingScale: number } }
>;
export type ServiceErrorAction = RWAReduxAction<typeof SERVICE_ERROR, ServiceErrorActionPayload>;
export type UpdateOnlineStatusAction = RWAReduxAction<typeof UPDATE_ONLINE_STATUS, boolean>;
export type SearchAction = RWAReduxAction<typeof SEARCH, api.SearchResults>;
export type UpdateAccountAction = RWAReduxAction<
	typeof UPDATE_ACCOUNT,
	undefined,
	{ info: { minRatingPlaybackGuard: string } }
>;
export type SocialPlatformAction = RWAReduxAction<typeof SHARE_MODAL_SOCIAL_PLATFORM, string>;
