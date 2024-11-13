import { getItemMediaFiles, getItemMediaFilesGuarded, getStartOverFiles } from '../service/action/account';
import { getPublicItemMediaFiles, getItemRelatedList, getPublicStartOverFiles } from '../service/action/content';
import { GET_PROFILE, getNextPlaybackItem, getContinueWatchingList, getWatched } from '../service/action/profile';
import { canPlay, isFree, isRegistrationOnlyRequired } from 'ref/responsive/pageEntry/util/offer';
import { copy, get } from '../util/objects';
import { SIGN_IN, clearPlaybackToken, getPlaybackToken } from '../account/sessionWorkflow';
import ModalTypes from '../uiLayer/modalTypes';
import { genId } from '../util/strings';
import { browserHistory } from 'shared/util/browserHistory';
import { OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import { requestToken } from 'shared/account/sessionWorkflow';
import { createPlaybackToken } from 'shared/service/action/authorization';
import {
	getPlayerDevice,
	isVideoGuarded,
	isItemRestricted,
	IMDA,
	isHOOQ,
	isItemRestrictedR21,
	getFormatsHOOQContent,
	isVideoDRMRestrictedByDistributor,
	isCastConnected,
	setSessionExpiry,
	isLive,
	goBackToPreviousAccessPoint,
	CLICK_TO_PLAY_QUERY_PARAM
} from 'toggle/responsive/util/playerUtil';
import { KalturaHeartbeatActionTypes } from 'toggle/responsive/player/kaltura/KalturaHeartbeatUtil';
import { getAnonymousNextPlaybackItem as getAnonNextPlaybackItem } from '../service/action/content';
import { GetRecommendationsListOptions } from 'shared/service/content';
import { AgeGroup } from 'toggle/responsive/pageEntry/account/a1/pin/AccountManagePinComponent';
import { DefaultRatedAge } from 'toggle/responsive/pageEntry/account/a1/pin/CreatePinParentalControl';
import { validateAgeGroup } from 'toggle/responsive/util/dateOfBirth';
import {
	getRestrictedContentModal,
	getRestrictedModalForAnonymous,
	showCreatePinOverlay,
	getSignInRequiredModalForAnonymous
} from 'toggle/responsive/player/playerModals';
import {
	SubscriptionsModalProps,
	subscriptionRequiredModal,
	upsellModal,
	UpsellModalProps
} from 'toggle/responsive/util/subscriptionUtil';
import { DEFAULT_PLAYBACK_SPEED, OPTION_LABEL_OFF } from 'shared/app/localeUtil';
import { updateProfile } from 'shared/account/accountWorkflow';
import { UX7Recommendation, UX8Recommendation } from 'shared/page/pageEntryTemplate';
import { getActiveProfile } from '../account/accountUtil';
import { onPlayerSignIn, onPlayerSignUp } from 'toggle/responsive/util/playerUtil';
import { redirectToSubscriptions } from 'toggle/responsive/pageEntry/subscription/subscriptionsUtils';
import { getAllowedToWatchAge } from 'shared/util/itemUtils';
import DeviceModel from 'shared/util/platforms/deviceModel';
import { GetContinueWatchingListOptions } from 'shared/service/profile';
import * as content from '../service/content';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import { isAnonymousProfile } from 'shared/account/profileUtil';
import { ItemTypeKeys } from 'shared/analytics/types/v3/context/entry';
import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { InitialPlayerService } from 'toggle/responsive/util/playerUtil';
import { isIOS } from '../util/browser';
import { getBoostRecommendations, getZoomRecommendations } from 'shared/list/listUtil';
import { getClickToPlayWatchPath, getWatchPath } from 'toggle/responsive/page/item/itemUtil';
import { PlayerPlaybackRateInformation, PlayerTrackInformation } from 'toggle/responsive/player/Player';
import { QueryParams } from '../util/urls';

/*
	Constants
 */
export const INIT_PLAYER_STATE = 'player/INIT_PLAYER_STATE';
export const OPEN_PLAYER = 'player/OPEN_VIDEO_PLAYER';
export const CLOSE_PLAYER = 'player/CLOSE_VIDEO_PLAYER';
export const PLAYER_INITIALISED = 'player/PLAYER_INITIALISED';
export const VOLUME_SAVE = 'player/VOLUME_SAVE';
export const TOGGLE_CHANNEL_SELECTOR_VISIBILITY = 'player/TOGGLE_CHANNEL_SELECTOR_VISIBILITY';
export const RELATED_ITEMS = 'player/RELATED_ITEMS';
export const SERVICE_ERROR = 'player/SERVICE_ERROR';
export const NEXT_PLAYBACK_ITEM = 'player/NEXT_PLAYBACK_ITEM';
export const NEXT_PLAYBACK_ITEM_ERROR = 'player/NEXT_PLAYBACK_ITEM_ERROR';
export const SAVE_REAL_VIDEO_POSITION = 'player/SAVE_REAL_VIDEO_POSITION';
export const REMOVE_REAL_VIDEO_POSITION = 'player/REMOVE_REAL_VIDEO_POSITION';
export const TOGGLE_STARTOVER = 'player/TOGGLE_STARTOVER';
export const GET_STARTOVER_MEDIA = 'player/GET_STARTOVER_MEDIA';
export const STARTOVER_MEDIA_LOADED = 'player/STARTOVER_MEDIA_LOADED';
export const RESET_PLAYER_ERRORS = 'player/RESET_PLAYER_ERRORS';

export const CHROMECAST_INTRODUCTION = 'player/CHROMECAST_INTRODUCTION';
export const CHROMECAST_CONNECTING = 'player/CHROMECAST_CONNECTING';
export const CHROMECAST_CONNECTED = 'player/CHROMECAST_CONNECTED';
export const CHROMECAST_DISCONNECTED = 'player/CHROMECAST_DISCONNECTED';
export const CHROMECAST_NO_DEVICES = 'player/CHROMECAST_NO_DEVICES';
export const SAVE_PLAYBACK_TOKEN_CLASSIFICATION = 'player/SAVE_PLAYBACK_TOKEN_CLASSIFICATION';
export const TOGGLE_MUTE = 'player/TOGGLE_MUTE';
export const INTERACT_MUTE = 'player/INTERACT_MUTE';
export const TOGGLE_OVERLAYING_CONTROLS_VISIBILITY = 'player/SHOW_OVERLAYING_CONTROLS';
export const CHANGE_SUBTITLE_LANG = 'player/CHANGE_SUBTITLE_LANG';
export const CHANGE_TRACK_SPEED = 'player/CHANGE_TRACK_SPEED';
export const UPDATE_CURRENT_VIDEO_POSITION = 'player/UPDATE_CURRENT_VIDEO_POSITION';
export const UPDATE_PLAYED_AUDIO_LANG = 'player/UPDATE_PLAYED_AUDIO_LANG';
export const UPDATE_PLAYED_SUBTITLE_LANG = 'player/UPDATE_PLAYED_SUBTITLE_LANG';
export const UPDATE_PLAYER_ENTRY_POINT = 'player/UPDATE_PLAYER_ENTRY_POINT';
export const UPDATE_PLAYER_START_TIME = 'player/UPDATE_PLAYER_START_TIME';
export const UPDATE_PLAYBACK_SPEED = 'player/UPDATE_PLAYBACK_SPEED';
export const UPDATE_VIDEO_QUALITY = 'player/UPDATE_VIDEO_QUALITY';
export const PLAYER_SESSION_STATUS = 'player/PLAYER_SESSION_STATUS';
export const PLAYER_SESSION_TIMER = 'player/PLAYER_SESSION_TIMER';
export const PLAYER_XT1_CHAIN_PLAY_LIST = 'player/PLAYER_XT1_CHAIN_PLAY_LIST';

const CLIENT_WATCHED_REFRESH_TIMEOUT = parseInt(process.env.CLIENT_WATCHED_REFRESH_TIMEOUT) || 30000;

export interface InitialPlayerState {
	/**
	 * the current player volume
	 */
	volume: number;
	thumbnailVisible: boolean;
	maxDRMResolution?: VideoResolution;
}

export function initPlayerState(playerState: InitialPlayerState): any {
	return { type: INIT_PLAYER_STATE, payload: playerState };
}

export function openPlayerWithoutMedia(item: api.ItemDetail, site = 'default') {
	return { type: OPEN_PLAYER, payload: { site, item } };
}

export function getDRMResolution(state, item: api.ItemDetail): VideoResolution {
	let resolution = 'External' as VideoResolution;
	const maxDRMResolution = get(state, 'player.maxDRMResolution');
	const restricted = isVideoDRMRestrictedByDistributor(item);
	if (restricted) {
		resolution = maxDRMResolution;
	}
	return resolution;
}
/**
 * Expected flow for video playback with different user types:
 *
 * ANONYMOUS
 * -------------------------
 * Free + Not rated => Play
 * Free + Rated => Modal: Restricted for anon
 * Free + Sign In Req => Modal: Sign in required
 * Subscription => Modal: Upsell
 *
 * FREE USER
 * ------------------------
 * Free + Not rated => Play
 * Free + Rated => Pin
 * Free + Sign In Req => Play
 * Subscription => Modal: Subscribe
 *
 * ENTITLED USER
 * ------------------------
 * Free + Not rated => Play
 * Free + Rated => Pin
 * Free + Sign In Req => Play
 * Subscription + Not Rated => Play
 * Subscription + Rated => Pin
 *
 */

export function openPlayer(
	item: api.ItemDetail,
	site = 'default',
	subscriptionCode?: string,
	startover?: boolean,
	startoverProgram?: api.ItemSchedule
) {
	return (dispatch, getState) => {
		const state = getState();
		const { active } = state.account;
		const { config } = state.app;
		const classification = get(state, 'app.config.classification');
		const age = getAllowedToWatchAge(item, classification);
		const resolution = getDRMResolution(state, item);
		const query: QueryParams = get(state.page, 'history.location.query');
		const clickedToPlay = query && CLICK_TO_PLAY_QUERY_PARAM in query;
		const watchPath = clickedToPlay ? getClickToPlayWatchPath(item) : getWatchPath(item);

		if (startover && startoverProgram) {
			dispatch({ type: OPEN_PLAYER, payload: { site, item, startoverProgram } });
			return dispatch(getStartoverMedia(item, startoverProgram.customId, site, subscriptionCode));
		}

		dispatch({ type: OPEN_PLAYER, payload: { site, item } });
		const initialPlayer = isCastConnected() ? 'cast' : 'player';
		InitialPlayerService.setOriginalPlayer(initialPlayer);

		const onClose = () => {
			if (isLive(item)) {
				goBackToPreviousAccessPoint();
			}

			dispatch(closePlayer(site));
		};

		const isSubscriptionRequired = !canPlay(item) && !isRegistrationOnlyRequired(item);
		if (isSubscriptionRequired) {
			const onSubscribe = () => {
				redirectToSubscriptions(item, config);
			};
			setTimeout(() => fullscreenService.switchOffFullscreen(), 1000);
			if (active) {
				// Subscribe Modal for free users
				return dispatch(showSubscribeModal(onSubscribe, onClose, active));
			} else {
				// Upsell Modal for anon
				return dispatch(showUpsellModal(onSubscribe, () => onPlayerSignIn(), onClose));
			}
		}

		// Free + Rated or Sign In Required for anon
		if (!active && isRegistrationOnlyRequired(item)) {
			// Handles display of modals for anon user for free + sign in required content
			if (isItemRestricted(item)) {
				return setTimeout(() => {
					dispatch(showRestrictedModalForAnonymous(() => onPlayerSignIn(), () => onPlayerSignUp(), onClose));
				});
			} else {
				return dispatch(
					showSignInRequiredModalForAnonymous(() => onPlayerSignIn(watchPath), () => onPlayerSignUp(watchPath), onClose)
				);
			}
		}

		// Finally to handle remaining cases to display Pin modal or play video
		// Check if content is rated
		if (isItemRestricted(item)) {
			const onSuccess = () => loadVideo(dispatch, state, item, site, subscriptionCode);
			const onError = () => dispatch(showUnderAgeModal(onClose, age));
			return setTimeout(() => {
				dispatch(
					active
						? checkDateOfBirthAndPin(onClose, onSuccess, onError, age, item)
						: showRestrictedModalForAnonymous(() => onPlayerSignIn(watchPath), () => onPlayerSignUp(watchPath), onClose)
				);
			});
		}

		if (active) {
			dispatch({ type: CHANGE_SUBTITLE_LANG, payload: get(state, ['profile', 'info', 'subtitleLanguage']) });
		} else {
			dispatch(getFreeVideo(item, site, resolution))
				.then(res => dispatch(handleVideo(res)))
				.catch(err => dispatch(handleServiceError(item, site, err)));
			return;
		}

		return loadVideo(dispatch, state, item, site, subscriptionCode);
	};
}

function checkDateOfBirthAndPin(
	onClose: () => void,
	onSuccess: () => void,
	onError: () => void,
	age: number,
	item: api.ItemDetail
) {
	return (dispatch, getState) => {
		const state = getState();
		const account = get(state, 'account.info');
		const pinEnabled = get(account, 'pinEnabled');
		const ageGroup = account && account.ageGroup;
		const isValidAge = validateAgeGroup(ageGroup, age);

		if (
			(account.ageGroup === AgeGroup.E && age <= DefaultRatedAge.R21) ||
			(!pinEnabled && isItemRestrictedR21(item) && account.ageGroup === AgeGroup.A)
		) {
			return dispatch(showCreatePinModal(account, onSuccess, onError, onClose, age));
		}

		if (isValidAge) {
			return onSuccess();
		}

		return onError();
	};
}

function showCreatePinModal(account, onSuccess, onError, onClose, age) {
	return dispatch => {
		const onPinCreated = (pin?: string) => {
			dispatch(
				requestPlaybackToken({
					scopes: ['Playback'],
					pin,
					tokenType: 'UserProfile',
					onSuccess,
					onError
				})
			);
		};

		return dispatch(OpenModal(showCreatePinOverlay(account, onPinCreated, onError, onClose, age)));
	};
}

function showUnderAgeModal(onClose: () => void, age: number) {
	return dispatch => dispatch(OpenModal(getRestrictedContentModal(onClose, age)));
}

function showRestrictedModalForAnonymous(onSignIn: () => void, onSignUp: () => void, onClose: () => void) {
	return dispatch => dispatch(OpenModal(getRestrictedModalForAnonymous(onSignIn, onSignUp, onClose)));
}

function showSignInRequiredModalForAnonymous(onSignIn: () => void, onSignUp: () => void, onClose: () => void) {
	return dispatch => dispatch(OpenModal(getSignInRequiredModalForAnonymous(onSignIn, onSignUp, onClose)));
}

function showUpsellModal(onSubscribe: () => void, onSignIn: () => void, onClose: () => void) {
	const upsellModalProps: UpsellModalProps = {
		onSubscribe,
		onSignIn,
		modalTarget: 'app',
		onClose,
		closeOnCancel: false,
		disableAutoClose: true
	};
	return dispatch => dispatch(OpenModal(upsellModal(upsellModalProps)));
}

function showSubscribeModal(onSubscribe: () => void, onClose: () => void, activeAccount) {
	const props: SubscriptionsModalProps = {
		onConfirm: onSubscribe,
		onClose,
		target: 'app',
		isSignedInUser: activeAccount
	};
	return dispatch => dispatch(OpenModal(subscriptionRequiredModal(props)));
}

function isLowerThanParentalRating(contentRating, minUserRating, classification): boolean {
	return (
		contentRating === IMDA.G ||
		(contentRating !== IMDA.G && !isRatingGreaterOrEqual(classification, contentRating, minUserRating))
	);
}

function loadVideo(dispatch, state, item: api.ItemDetail, site, subscriptionCode: string) {
	const classification = get(state, 'app.config.classification');
	const minUserRating = get(getActiveProfile(), 'minRatingPlaybackGuard.code');
	const contentRating = get(item, 'classification.code');
	const tokenClassification = get(state, 'player.tokenClassification');
	const isPlayerSessionValid = get(state, 'player.isSessionValid');
	const sessionTokens = get(state, 'session.tokens');
	const isLowerThanParental = isLowerThanParentalRating(contentRating, minUserRating, classification);
	const isCurrenRatingHigherThanLastWatched = isRatingHigher(classification, contentRating, tokenClassification);

	const playbackToken = getPlaybackToken(sessionTokens);
	const isPlaybackTokenExpired = playbackToken && playbackToken.expirationDate.getTime() < new Date().getTime();
	const shouldClearPlaybackToken =
		(isCurrenRatingHigherThanLastWatched && playbackToken) || !isPlayerSessionValid || !!isPlaybackTokenExpired;
	const resolution = getDRMResolution(state, item);

	return dispatch(getAccountVideo(item, site, resolution, subscriptionCode))
		.then(res => {
			if (isVideoGuarded(res.payload)) {
				if (shouldClearPlaybackToken) {
					dispatch(clearPlaybackToken());
				}

				dispatch(loadGuardedVideo(item, site, subscriptionCode));
			} else {
				if (isLowerThanParental && item.type !== 'trailer') {
					dispatch(clearPlaybackToken());
				}
				dispatch(handleVideo(res));
			}
		})
		.catch(err => {
			dispatch(handleServiceError(item, site, err));
		});
}

function loadGuardedVideo(
	item: api.ItemDetail,
	site = 'default',
	subscriptionCode?: string,
	maxAllowedResolution: VideoResolution = 'External'
) {
	return (dispatch, getStore) => {
		dispatch(getAccountVideoGuarded(item, site, maxAllowedResolution, subscriptionCode))
			.then(res => {
				const contentRating = get(item, 'classification.code');
				const classification = get(getStore(), 'app.config.classification');

				dispatch(handleVideo(res));
				dispatch(savePlaybackTokenClassification(classification[contentRating].code));
			})
			.catch(err => {
				dispatch(handleServiceError(item, site, err));
			});
	};
}

export function getFreeVideo(item: api.ItemDetail, site: string, resolution: VideoResolution) {
	const info = {
		item,
		site
	};
	const device = getPlayerDevice(site);
	const options: content.GetPublicItemMediaFilesOptions = {};

	if (isHOOQ(item)) {
		options.formats = [getFormatsHOOQContent()];
	}
	return dispatch => {
		return dispatch(getPublicItemMediaFiles(item.id, ['stream', 'progressive'], resolution, device, options, info));
	};
}

export function getRelatedItems(itemId: string, site: string) {
	return dispatch => {
		return dispatch(getItemRelatedList(itemId)).then(res => {
			dispatch(handleRelatedItems(res, site));
		});
	};
}

export function getRecommendedItems(
	widgetId: string,
	options?: GetRecommendationsListOptions,
	item?: api.ItemDetail,
	info?: any
) {
	return dispatch => {
		if (info.template === UX7Recommendation || info.template === UX8Recommendation) {
			const isEndofPlayback = true;
			return dispatch(getBoostRecommendations(widgetId, options, item, isEndofPlayback)).then(res => {
				dispatch(handleRelatedItems(res, info.playerId));
			});
		}
		return dispatch(getZoomRecommendations(widgetId, options, item)).then(res => {
			dispatch(handleRelatedItems(res, info.playerId));
		});
	};
}

export function getNextItem(itemId: string, site: string, subscriptionCode: string) {
	return (dispatch, getState) => {
		const store = getState();
		const { active } = store.account;
		const getNextPlaybackItemPromise = active
			? dispatch(
					getNextPlaybackItem(itemId, {
						device: getPlayerDevice(site),
						expand: 'ancestors',
						sub: subscriptionCode
					})
			  )
			: dispatch(getAnonNextPlaybackItem(itemId, { device: getPlayerDevice(site), expand: 'ancestors' }));

		return getNextPlaybackItemPromise
			.then(res => {
				dispatch(handlePlayerNextItem(res, site));
			})
			.catch(err => {
				dispatch(handlePlayerNextItemError(site));
			});
	};
}

export function getAccountVideo(
	item: api.ItemDetail,
	site: string,
	resolution: VideoResolution,
	subscriptionCode?: string
) {
	const info: state.PlayerItem = {
		item,
		site
	};
	const device = getPlayerDevice(site);
	const options: content.GetPublicItemMediaFilesOptions = {
		sub: subscriptionCode
	};

	if (isHOOQ(item)) {
		options.formats = [getFormatsHOOQContent()];
	}
	return dispatch => {
		return dispatch(getItemMediaFiles(item.id, ['stream'], resolution, device, options, info));
	};
}

export function getAccountVideoGuarded(
	item: api.ItemDetail,
	site: string,
	resolution: VideoResolution = 'HD-1080',
	subscriptionCode?: string
) {
	const info: state.PlayerItem = {
		item,
		site
	};
	const device = getPlayerDevice(site);
	const options: content.GetPublicItemMediaFilesOptions = {
		sub: subscriptionCode
	};

	if (isHOOQ(item)) {
		options.formats = [getFormatsHOOQContent()];
	}

	return dispatch => {
		return dispatch(getItemMediaFilesGuarded(item.id, ['stream'], resolution, device, options, info));
	};
}

function handleVideo(res: Action<api.MediaFile[]>) {
	const payload: state.PlayerItem = {
		item: res.meta.info.item,
		site: res.meta.info.site,
		data: res.payload,
		error: res.error && res.payload
	};

	return { type: OPEN_PLAYER, payload: payload };
}

function handleServiceError(item, site, error) {
	// do not show service error in case user cancel popup dialog
	// just leave watch page
	if (error && error.isCancelled) return closePlayer(site);

	const payload: state.PlayerItem = {
		item: item,
		site: site,
		error: error
	};

	return { type: SERVICE_ERROR, payload: payload };
}

function handleRelatedItems(res: any, site: string) {
	const payload: state.PlayerItem = {
		site: site,
		relatedItems: res.payload
	};
	return { type: RELATED_ITEMS, payload };
}

function handlePlayerNextItem(res: any, site: string) {
	if (res.payload && res.payload.next) {
		const payload: state.PlayerItem = {
			site: site,
			nextItem: res.payload.next
		};
		return { type: NEXT_PLAYBACK_ITEM, payload };
	} else {
		return handlePlayerNextItemError(site);
	}
}

function savePlaybackTokenClassification(classification: string) {
	return dispatch => {
		return dispatch({ type: SAVE_PLAYBACK_TOKEN_CLASSIFICATION, payload: classification });
	};
}

export function handlePlayerNextItemError(site: string) {
	const payload: state.PlayerItem = {
		site: site,
		nextItemError: true
	};
	return { type: NEXT_PLAYBACK_ITEM_ERROR, payload };
}

export function getStartoverMedia(item: api.ItemDetail, customId: string, site = 'default', subscriptionCode?: string) {
	return (dispatch, getState) => {
		const state = getState();
		const { active } = state.account;
		const info: state.PlayerItem = {
			item,
			site
		};

		dispatch({ type: GET_STARTOVER_MEDIA, payload: { site, item } });
		const options: content.GetPublicItemMediaFilesOptions = {};

		if (isHOOQ(item)) {
			options.formats = [getFormatsHOOQContent()];
		}

		if (isFree(item) && !active) {
			return dispatch(getPublicStartOverFiles(item.id, customId, 'External', 'web_browser', options, info))
				.then(res => dispatch(handleStartoverVideo(res)))
				.catch(err => dispatch(handleStartoverServiceError(item, site, err)));
		}

		options.sub = subscriptionCode;
		return dispatch(getStartOverFiles(item.id, customId, 'External', 'web_browser', options, info))
			.then(res => dispatch(handleStartoverVideo(res)))
			.catch(err => dispatch(handleStartoverServiceError(item, site, err)));
	};
}

function handleStartoverVideo(res: Action<api.MediaFile[]>) {
	const payload: state.PlayerItem = {
		item: res.meta.info.item,
		site: res.meta.info.site,
		data: res.payload,
		error: res.error && res.payload
	};

	return { type: STARTOVER_MEDIA_LOADED, payload: payload };
}

function handleStartoverServiceError(item, site, error) {
	const payload: state.PlayerItem = {
		item: item,
		site: site,
		error: error
	};

	return { type: SERVICE_ERROR, payload: payload };
}

export function closePlayer(site: string) {
	InitialPlayerService.resetOriginalPlayer();
	return { type: CLOSE_PLAYER, payload: site };
}

export function saveVolume(volume: number) {
	return { type: VOLUME_SAVE, payload: volume };
}

export function toggleMutedState(isMuted: boolean) {
	return { type: TOGGLE_MUTE, payload: isMuted };
}

export function interactMutedState(hasInteracted: boolean) {
	return { type: INTERACT_MUTE, payload: hasInteracted };
}

export function toggleChannelSelectorVisibility(isVisible: boolean) {
	fullscreenService.usePageReloadDelay(isVisible);
	return { type: TOGGLE_CHANNEL_SELECTOR_VISIBILITY, payload: { isVisible } };
}

export function toggleStartover() {
	return { type: TOGGLE_STARTOVER };
}

// chromecast actions
export function chromecastIntroduction(show: boolean) {
	return { type: CHROMECAST_INTRODUCTION, payload: show };
}

export function chromecastConnecting() {
	return { type: CHROMECAST_CONNECTING };
}

export function chromecastConnected(castDevice: string) {
	return { type: CHROMECAST_CONNECTED, payload: castDevice };
}

export const chromecastMediaChanged = (playerId: string) => (dispatch, getState) => {
	dispatch(getWatched());
	getContinueWatchingListOnCastDisconnect(dispatch, getState);
};

export const chromecastDisconnected = (playerId: string) => (dispatch, getState) => {
	dispatch(getWatched());
	getContinueWatchingListOnCastDisconnect(dispatch, getState);
	refreshProfileAfterSetTimeout(dispatch);
	return dispatch({ type: CHROMECAST_DISCONNECTED, payload: playerId });
};

function refreshProfileAfterSetTimeout(dispatch) {
	// Reason for a setTimeOut refresh is that the profile DB needs time to register the Chromecasts
	// Latest Bookmarks	that were not picked up in original getProfile() request
	setTimeout(() => {
		dispatch(getWatched());
	}, CLIENT_WATCHED_REFRESH_TIMEOUT);
}

const getContinueWatchingListOnCastDisconnect = (dispatch, getState) => {
	const { account, profile, cache } = getState();
	const options = <GetContinueWatchingListOptions>{
		device: DeviceModel.deviceInfo().type,
		page: 1,
		pageSize: 12,
		sub: get(account, 'info.subscriptionCode'),
		segments: get(profile, 'info.segments'),
		showItemType: 'episode',
		include: ['show', 'season']
	};
	const info = {
		listKey: get(cache, 'list.ContinueWatching.list.items'),
		pageNo: 1
	};

	return profile && profile.info && dispatch(getContinueWatchingList(options, info));
};

export function chromecastNoDevices() {
	return { type: CHROMECAST_NO_DEVICES };
}

export function saveRealVideoPosition(itemId: string, time: number) {
	return { type: SAVE_REAL_VIDEO_POSITION, payload: { itemId, time } };
}

export function resetPlayerErrors() {
	return { type: RESET_PLAYER_ERRORS, payload: { limitationError: undefined } };
}

export function removeRealVideoPosition(itemId: string) {
	return { type: REMOVE_REAL_VIDEO_POSITION, payload: itemId };
}

export function showThumbnailVisibility(visibility: boolean) {
	return { type: TOGGLE_OVERLAYING_CONTROLS_VISIBILITY, payload: visibility };
}

export function getContentGuarded(
	account: api.Account,
	activeProfile: api.ProfileDetail,
	classification: api.Classification,
	item: api.ItemDetail,
	onSuccessCallback?: () => void
) {
	if (!account) {
		if (onSuccessCallback) onSuccessCallback();
		return;
	}

	const allowedMinRating =
		get(activeProfile, 'minRatingPlaybackGuard.code') || get(activeProfile, 'minRatingPlaybackGuard');
	const pinEnabled = get(account, 'pinEnabled');
	const code = get(item, 'classification.code');

	if (!allowedMinRating && !isRatingGreaterOrEqual(classification, code, IMDA.R21)) {
		if (onSuccessCallback) onSuccessCallback();
		return;
	}

	if (
		(isRatingGreaterOrEqual(classification, code, allowedMinRating) && code !== IMDA.PG) ||
		(pinEnabled && isItemRestrictedR21(item))
	) {
		const modalId = `${activeProfile.id}-${genId()}`;

		return dispatch => {
			dispatch(clearPlaybackToken());

			const onSuccess = () => {
				dispatch(CloseModal(modalId));
				if (onSuccessCallback) onSuccessCallback();
			};
			const onFailure = () => {
				browserHistory.push(item.path);
				dispatch(CloseModal(modalId));
			};

			return dispatch(openPinModal(modalId, onSuccess, onFailure));
		};
	} else {
		if (onSuccessCallback) onSuccessCallback();
	}
}

export function setPlayerInitialised(isInitialised) {
	return dispatch => {
		return dispatch({
			type: PLAYER_INITIALISED,
			payload: { isInitialised }
		});
	};
}

export function setSessionStatus(isSessionValid) {
	return dispatch => {
		return dispatch({
			type: PLAYER_SESSION_STATUS,
			payload: { isSessionValid }
		});
	};
}

export function setInactivityTimer() {
	return (dispatch, getState) => {
		const state = getState();
		const { config } = state.app;

		const playbackTokenExpirationTimeInMinutes = get(config, 'general.playbackTokenExpirationTimeInMinutes');
		const expiryTime = playbackTokenExpirationTimeInMinutes * 60 * 1000;

		const sessionExpiredTimeout = window.setTimeout(() => {
			dispatch(setSessionStatus(false));
		}, expiryTime);

		// iOS workaround
		// A timeout will stop counting down if the user has backgrounded the app
		const iOSExpiryTimestamp = isIOS() ? setSessionExpiry(playbackTokenExpirationTimeInMinutes) : undefined;

		return dispatch({
			type: PLAYER_SESSION_TIMER,
			payload: { sessionExpiredTimeout, iOSExpiryTimestamp }
		});
	};
}

export function resetInactivityTimer() {
	return (dispatch, getState) => {
		const state = getState();
		const { sessionExpiredTimeout } = state.player;

		if (sessionExpiredTimeout) {
			sessionExpiredTimeout && window.clearTimeout(sessionExpiredTimeout);
		}
		dispatch({
			type: PLAYER_SESSION_TIMER,
			payload: {
				sessionExpiredTimeout: undefined,
				iOSExpiryTimestamp: undefined
			}
		});

		return Promise.resolve();
	};
}

function openPinModal(modalId: string, onSuccess: (payload?: any) => void, onFailure: (error?: any) => void) {
	return OpenModal({
		id: modalId,
		type: ModalTypes.PIN_AUTH,
		componentProps: {
			scopes: ['Playback'],
			tokenType: 'UserProfile',
			onSuccess,
			onFailure
		}
	});
}

export function isRatingGreaterOrEqual(classification: api.Classification, rating1: string, rating2: string) {
	return rating1 && rating2 && classification[rating1].level >= classification[rating2].level;
}

export function isRatingHigher(classification: api.Classification, rating1: string, rating2: string) {
	return rating1 && rating2 && classification[rating1].level > classification[rating2].level;
}

export function requestPlaybackToken(body: api.RequestPlaybackToken) {
	const { scopes, pin, tokenType, onSuccess, onError } = body;
	return dispatch => {
		if ((scopes as PlaybackTokenScope[]).includes('Playback')) {
			return dispatch(createPlaybackToken({ pin })).then(response => {
				if (response.error) {
					onError(response.payload);
				} else {
					onSuccess(response.payload);
				}
			});
		}

		return dispatch(requestToken(scopes as TokenScope[], pin, tokenType)).then(response => {
			if (response.error) {
				onError(response.payload);
			} else {
				return createPlaybackToken({ pin }).then(() => {
					onSuccess(response.payload);
				});
			}
		});
	};
}

export function changeSubtitleLang(playerId: string, subtitleLanguage: string) {
	return (dispatch, getState) => {
		const { account, profile, player } = getState();

		const isChannel = get(player, ['players', playerId, 'item', 'type']) === 'channel';
		if (!isChannel && account.active && profile.info && !isAnonymousProfile(profile)) {
			const { id, name } = profile.info;
			const updatedProfile = { id, name, subtitleLanguage };
			dispatch(updateProfile(updatedProfile));
		}

		dispatch({ type: CHANGE_SUBTITLE_LANG, payload: subtitleLanguage });
	};
}

export function changePlaybackSpeed(playerId: string, trackSpeed: number): any {
	return (dispatch, getState) => {
		const { account, profile, player } = getState();

		const isChannel = get(player, ['players', playerId, 'item', 'type']) === ItemTypeKeys.Channel;
		if (!isChannel && account.active && profile.info && !isAnonymousProfile(profile)) {
			const { id, name } = profile.info;
			const updatedProfile = { id, name, trackSpeed };
			dispatch(updateProfile(updatedProfile));
		}

		dispatch({ type: CHANGE_TRACK_SPEED, payload: trackSpeed });
	};
}

export const updateCurrentVideoPosition = (
	currentTime: number
): ThunkAction<{ type: string; payload: number }, state.Player, void> => (
	dispatch: Dispatch<any>
): { type: string; payload: number } =>
	dispatch({
		type: UPDATE_CURRENT_VIDEO_POSITION,
		payload: currentTime
	});

const initialState: state.Player = {
	volume: 0,
	channelSelectorVisible: false,
	thumbnailVisible: false,
	players: {},
	realVideoPosition: {},
	cast: {
		connectionStatus: 'No devices',
		noDevice: true,
		castDevice: undefined,
		showIntroduction: false
	},
	isInitialised: false,
	isMuted: false,
	muteInteraction: false,
	startover: false,
	activeSubtitleLang: OPTION_LABEL_OFF,
	selectedPlaybackSpeed: DEFAULT_PLAYBACK_SPEED,
	tokenClassification: undefined,
	currentTime: 0,
	startTime: undefined,
	isSessionValid: false,
	sessionExpiredTimeout: undefined,
	iOSExpiryTimestamp: undefined,
	entryPoint: undefined,
	entryId: undefined,
	playedAudioLang: undefined,
	playedSubtitleLang: undefined,
	playedTrackSpeed: undefined,
	videoQuality: undefined
};

export default function reducer(state: state.Player = initialState, action: Action<any>): state.Player {
	if (action.error) return state;
	switch (action.type) {
		case INIT_PLAYER_STATE:
			return reduceInitPlayerState(state, action);
		case VOLUME_SAVE:
			return reduceVolumeSave(state, action);
		case TOGGLE_MUTE:
			return reduceMutedState(state, action);
		case INTERACT_MUTE:
			return reduceMuteInteractionState(state, action);
		case TOGGLE_CHANNEL_SELECTOR_VISIBILITY:
			return reduceChannelSelectorVisibility(state, action);
		case RELATED_ITEMS:
			return reduceRelatedItems(state, action);
		case NEXT_PLAYBACK_ITEM:
			return reduceNextPlayerItem(state, action);
		case NEXT_PLAYBACK_ITEM_ERROR:
			return reduceNextPlayerItemError(state, action);
		case CLOSE_PLAYER:
			return reduceClosePlayer(state, action);
		case OPEN_PLAYER:
			return reduceOpenPlayer(state, action);
		case SERVICE_ERROR:
			return reduceServiceError(state, action);
		case CHROMECAST_INTRODUCTION:
			return reduceChromecastIntroduction(state, action);
		case CHROMECAST_CONNECTING:
			return reduceChromecastConnecting(state, action);
		case CHROMECAST_CONNECTED:
			return reduceChromecastConnected(state, action);
		case CHROMECAST_DISCONNECTED:
			return reduceChromecastDisconnected(state, action);
		case CHROMECAST_NO_DEVICES:
			return reduceChromecastNoDevices(state, action);
		case SAVE_REAL_VIDEO_POSITION:
			return reduceSaveRealVideoPosition(state, action);
		case REMOVE_REAL_VIDEO_POSITION:
			return reduceRemoveRealVideoPosition(state, action);
		case TOGGLE_OVERLAYING_CONTROLS_VISIBILITY:
			return reduceToggleOverlayingControlsVisibility(state, action);
		case SIGN_IN:
			return reduceSignIn(state, action);
		case TOGGLE_STARTOVER:
			return reduceStartover(state, !state.startover);
		case STARTOVER_MEDIA_LOADED:
		case GET_STARTOVER_MEDIA:
			return reduceGetStartoverMedia(state, action);
		case KalturaHeartbeatActionTypes.sendPlaybackHeartbeat:
		case RESET_PLAYER_ERRORS:
			return reducePlayback(state, action);
		case GET_PROFILE:
			return reduceProfileSubtitleChange(state, action);
		case CHANGE_SUBTITLE_LANG:
			return reduceSubtitleChange(state, action);
		case CHANGE_TRACK_SPEED:
			return reducePlaybackSpeed(state, action);
		case SAVE_PLAYBACK_TOKEN_CLASSIFICATION:
			return reduceSavePlaybackTokenClassification(state, action);
		case UPDATE_CURRENT_VIDEO_POSITION:
			return reduceCurrentVideoPosition(state, action);
		case UPDATE_PLAYED_AUDIO_LANG:
			return reducePlayedAudioLang(state, action);
		case UPDATE_PLAYBACK_SPEED:
			return reducePlayedTrackSpeed(state, action);
		case UPDATE_PLAYED_SUBTITLE_LANG:
			return reducePlayedSubtitleLang(state, action);
		case UPDATE_PLAYER_ENTRY_POINT:
			return reduceEntryPoint(state, action);
		case UPDATE_VIDEO_QUALITY:
			return reduceVideoQuality(state, action);
		case PLAYER_INITIALISED:
			return reducePlayerInitialised(state, action);
		case PLAYER_SESSION_TIMER:
			return reducePlayerSessionSetTimer(state, action);
		case PLAYER_SESSION_STATUS:
			return reducePlayerSessionStatus(state, action);
		case PLAYER_XT1_CHAIN_PLAY_LIST:
			return reduceXT1ChainPlay(state, action);
		default:
			return state;
	}
}

function reduceSavePlaybackTokenClassification(state: state.Player, action: Action<any>) {
	return {
		...state,
		tokenClassification: action.payload
	};
}

function reducePlayback(state: state.Player, action) {
	const limitationError = get(action.payload, 'result.error');
	return {
		...state,
		limitationError
	};
}

function reduceInitPlayerState(state: state.Player, action: Action<any>) {
	return {
		...state,
		volume: action.payload.volume,
		maxDRMResolution: action.payload.maxDRMResolution
	};
}

function reduceMutedState(state: state.Player, action: Action<any>) {
	return {
		...state,
		isMuted: action.payload
	};
}

function reduceMuteInteractionState(state: state.Player, action: Action<any>) {
	return {
		...state,
		muteInteraction: action.payload
	};
}

function reduceChannelSelectorVisibility(state: state.Player, action: Action<any>) {
	return {
		...state,
		channelSelectorVisible: action.payload.isVisible
	};
}

function reduceStartover(state: state.Player, startover: boolean) {
	return {
		...state,
		startover
	};
}

function reduceVolumeSave(state: state.Player, action: Action<any>) {
	return {
		...state,
		volume: action.payload
	};
}

function reducePlayerInitialised(state: state.Player, action: Action<any>) {
	return {
		...state,
		isInitialised: action.payload.isInitialised,
		startTime: new Date()
	};
}

function reducePlayerSessionSetTimer(state: state.Player, action: Action<any>) {
	const { sessionExpiredTimeout, iOSExpiryTimestamp } = action.payload;
	return {
		...state,
		sessionExpiredTimeout,
		iOSExpiryTimestamp
	};
}

function reducePlayerSessionStatus(state: state.Player, action: Action<any>) {
	return {
		...state,
		isSessionValid: action.payload.isSessionValid
	};
}

function reduceRelatedItems(state: state.Player, action: Action<any>) {
	const { site, relatedItems } = action.payload;
	const playerItem = state.players[site];
	if (playerItem) {
		return {
			...state,
			players: {
				...state.players,
				[site]: {
					...playerItem,
					relatedItems
				}
			}
		};
	} else {
		return state;
	}
}

function reduceNextPlayerItem(state: state.Player, action: Action<any>) {
	const { site, nextItem } = action.payload;
	const playerItem = state.players[site];
	if (playerItem) {
		return {
			...state,
			players: {
				...state.players,
				[site]: {
					...playerItem,
					nextItem
				}
			}
		};
	} else {
		return state;
	}
}

function reduceNextPlayerItemError(state: state.Player, action: Action<any>) {
	const { site, nextItemError } = action.payload;
	const playerItem = state.players[site];
	if (playerItem) {
		return {
			...state,
			players: {
				...state.players,
				[site]: {
					...playerItem,
					nextItemError
				}
			}
		};
	} else {
		return state;
	}
}

function reduceClosePlayer(state: state.Player, action: Action<any>) {
	const players = copy(state.players);
	delete players[action.payload];
	return {
		...state,
		players,
		entryId: undefined,
		isInitialised: false,
		playedAudioLang: undefined,
		playedSubtitleLang: undefined,
		videoQuality: undefined
	};
}

function reduceOpenPlayer(state: state.Player, action: Action<any>) {
	return {
		...state,
		players: {
			...state.players,
			[action.payload.site]: action.payload
		},
		startoverProgram: action.payload.startoverProgram,
		customId: action.payload.customId,
		thumbnailVisible: false,
		entryId: action.payload.site
	};
}

function reduceServiceError(state: state.Player, action: Action<any>) {
	return {
		...state,
		players: {
			...state.players,
			[action.payload.site]: action.payload
		}
	};
}

function reduceGetStartoverMedia(state: state.Player, action: Action<any>) {
	return {
		...state,
		players: {
			...state.players,
			[action.payload.site]: action.payload
		}
	};
}

function reduceChromecastIntroduction(playerState: state.Player, action: Action<boolean>) {
	const showIntroduction = action.payload;
	return {
		...playerState,
		cast: {
			...playerState.cast,
			showIntroduction
		}
	};
}

function reduceChromecastConnecting(playerState: state.Player, action: Action<void>) {
	return {
		...playerState,
		cast: {
			...playerState.cast,
			connectionStatus: 'Connecting' as state.CastConnectionStatus
		}
	};
}

function reduceChromecastConnected(playerState: state.Player, action: Action<string>) {
	return {
		...playerState,
		cast: {
			...playerState.cast,
			connectionStatus: 'Connected' as state.CastConnectionStatus,
			castDevice: action.payload
		}
	};
}

function reduceChromecastDisconnected(playerState: state.Player, action: Action<string>) {
	const players = copy(playerState.players);
	const playerId = action.payload;
	delete players[playerId];
	return {
		...playerState,
		players,
		cast: {
			...playerState.cast,
			noDevice: false,
			connectionStatus: 'Disconnected' as state.CastConnectionStatus,
			castDevice: undefined,
			loadMediaState: false
		}
	};
}

function reduceChromecastNoDevices(playerState: state.Player, action: Action<void>) {
	return {
		...playerState,
		cast: {
			...playerState.cast,
			noDevice: true,
			connectionStatus: 'No devices' as state.CastConnectionStatus
		}
	};
}

function reduceSaveRealVideoPosition(state: state.Player, action: Action<any>) {
	const { itemId, time } = action.payload;
	return {
		...state,
		realVideoPosition: {
			...state.realVideoPosition,
			[itemId]: time
		}
	};
}

function reduceRemoveRealVideoPosition(state: state.Player, action: Action<any>) {
	const realVideoPosition = copy(state.realVideoPosition);
	delete realVideoPosition[action.payload];
	return {
		...state,
		realVideoPosition
	};
}

// reset all palyers and real video positions when user is signing in
function reduceSignIn(state: state.Player, action: Action<any>) {
	const realVideoPosition = copy(state.realVideoPosition);
	delete realVideoPosition[action.payload];
	return {
		...state,
		players: {},
		realVideoPosition: {}
	};
}

function reduceToggleOverlayingControlsVisibility(state: state.Player, action: Action<any>) {
	return {
		...state,
		thumbnailVisible: action.payload
	};
}

function reduceProfileSubtitleChange(state: state.Player, { payload: profile }: Action<any>) {
	return {
		...state,
		activeSubtitleLang: profile.subtitleLanguage || OPTION_LABEL_OFF
	};
}

function reduceSubtitleChange(state: state.Player, { payload: activeSubtitleLang }: Action<any>) {
	if (!activeSubtitleLang) {
		return state;
	} else {
		return {
			...state,
			activeSubtitleLang
		};
	}
}

function reducePlaybackSpeed(state: state.Player, { payload: selectedPlaybackSpeed }: Action<number>) {
	if (!selectedPlaybackSpeed) {
		return state;
	} else {
		return {
			...state,
			selectedPlaybackSpeed
		};
	}
}

function reduceCurrentVideoPosition(state: state.Player, { payload: currentTime }: Action<number>): state.Player {
	return {
		...state,
		currentTime
	};
}

function reduceEntryPoint(state: state.Player, action: Action<any>) {
	return {
		...state,
		entryPoint: action.payload
	};
}

function reducePlayedAudioLang(state: state.Player, { payload: playedAudioLang }: Action<PlayerTrackInformation>) {
	return {
		...state,
		playedAudioLang
	};
}

function reducePlayedSubtitleLang(
	state: state.Player,
	{ payload: playedSubtitleLang }: Action<PlayerTrackInformation>
) {
	return {
		...state,
		playedSubtitleLang
	};
}

function reducePlayedTrackSpeed(
	state: state.Player,
	{ payload: playedTrackSpeed }: Action<PlayerPlaybackRateInformation>
) {
	return {
		...state,
		playedTrackSpeed
	};
}

function reduceVideoQuality(state: state.Player, { payload: videoQuality }: Action<string>) {
	return {
		...state,
		videoQuality
	};
}

export function setXT1ChainPlay(xt1ChainPlayList: number | string, chainPlayOrigin?: string) {
	return {
		type: PLAYER_XT1_CHAIN_PLAY_LIST,
		payload: { xt1ChainPlayList, chainPlayOrigin }
	};
}

function reduceXT1ChainPlay(state: state.Player, action: Action<any>) {
	const { xt1ChainPlayList, chainPlayOrigin } = action.payload;
	return {
		...state,
		xt1ChainPlayList,
		chainPlayOrigin
	};
}
