import * as Redux from 'redux';
import { isMobileSize, isSmallTabletSize, isTabletLandscape } from 'toggle/responsive/util/grid';
import { get } from 'shared/util/objects';
import { CAST_PLAYER_ID } from 'ref/responsive/player/cast/CastLoader';
import { isFree } from 'ref/responsive/pageEntry/util/offer';
import { getPublicItemMediaFiles } from 'shared/service/action/content';
import { getItemMediaFiles, getItemMediaFilesGuarded } from 'shared/service/account';
import { FORBIDDEN_ERROR, PLAYBACK_RATING_RESTRICTION } from 'shared/util/errorCodes';
import { browserHistory } from 'shared/util/browserHistory';
import { getSignInPath } from 'shared/page/sitemapLookup';
import { Register as registerPageKey } from 'shared/page/pageKey';
import { getPagePathByKey } from 'shared/component/Link';
import { getAccount } from 'shared/account/accountUtil';
import { isChrome, isFirefox, isSafari, getSupportedEncryptedMediaExtensions, isMobile } from 'shared/util/browser';
import { GetPublicItemMediaFilesOptions } from 'shared/service/content';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import { ToggleContent } from 'shared/uiLayer/uiLayerWorkflow';
import { getAllowedToWatchAge as getItemAllowedToWatchAge } from 'shared/util/itemUtils';
import { getItem, setItem } from 'shared/util/localStorage';
import { setRedirectPathAfterSignin } from 'shared/page/pageUtil';
import { getQueryParams } from 'shared/util/urls';
import { validateAgeGroup } from 'toggle/responsive/util/dateOfBirth';
import { AgeGroup } from 'toggle/responsive/pageEntry/account/a1/pin/AccountManagePinComponent';

const NUM_SLICES = 100;
const RESTRICTED_DISTRIBUTOR = 'Disney';
export const PLAYER_WRAPPER_ID = 'player-wrapper';
export const PLAYER_360_OVERLAY_CLASS = 'playkit-overlay-action';
export const FULLSCREEN_QUERY_PARAM = 'player-fullscreen';
export const CLICK_TO_PLAY_QUERY_PARAM = 'clickToPlay';
export const STARTOVER_QUERY_PARAM = 'startover';
export const PLAYER_ERROR_DIALOG_ID = 'player-error-dialog';
const MIN_PLAYER_HEIGHT = 320;
const MAX_BITRATE_720P = process.env.CLIENT_MAX_BITRATE_720P || 2600;
const MAX_BITRATE_480P = process.env.CLIENT_MAX_BITRATE_480P || 1800;
export const DISABLED_SQUEEZBACK = true;
export const PLAYER_VERSION_KALTURA = 'KL1';
export const PLAYER_DFP_CUSTOM_PARAMS = 'cust_params';
export const PLAYER_MEDIA_INFO_URL_TYPE_DIRECT = 'DIRECT';
export const DEVICE_LIMIT_REACHED = 'isDeviceLimitReached';
export const DEVICE_LIMIT_REACHED_ERROR_MSG = 'Device limit reached';

export enum FormatTypes {
	DASH_WIDVINE = 'mpd:wv',
	DASH_PLAYREADY = 'mpd:pr',
	HLS = 'hls'
}

export enum MediaTypes {
	Vr360,
	HOOQ,
	Default,
	ClearKeyContent,
	DRM720,
	DRM1080
}

export enum StreamProtocol {
	DASH = 'DASH',
	HLS = 'HLS'
}

export enum IMDA {
	G = 'IMDA-G',
	PG = 'IMDA-PG',
	PG13 = 'IMDA-PG13',
	NC16 = 'IMDA-NC16',
	M18 = 'IMDA-M18',
	R21 = 'IMDA-R21',
	NAR = 'IMDA-NAR'
}

export const HOOQ = 'HOOQ';
export const HBO = 'HBO';

export const PLAYER_VENDOR = 'Kaltura';

// player custom playback speeds, can be modified as per requirement
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5];

let store: Redux.Store<state.Root>;
export function init(appStore: Redux.Store<state.Root>) {
	store = appStore;
}

export function getCurrentTime() {
	return store.getState().player.currentTime;
}

export function getKalturaThumbnailsUrl(entryId, width, playback: api.AppConfigPlayback) {
	const { kalturaThumbnailBaseUrl: URL } = playback;
	return `${URL}thumbnail/entry_id/${entryId}/width/${width}/vid_slices/${NUM_SLICES}`;
}

export function getThumbnailPositionOfset(percentage, width) {
	const imageIndex = Math.round(percentage * NUM_SLICES);

	return width * imageIndex * -1;
}

export function calculateThumbnailSize() {
	let width = 355;
	let height = 200;
	let playerControlsPadding = 60;
	let scaleFactor = 1;

	if (isMobileSize() && !isTabletLandscape()) {
		width = 125;
		height = 70;
		playerControlsPadding = 30;
	} else if (isSmallTabletSize()) {
		width = 225;
		height = 125;
		playerControlsPadding = 30;
	} else {
		scaleFactor = getThumbnailScaleFactor();
	}

	return { width, height, playerControlsPadding, scaleFactor };
}

function getThumbnailScaleFactor(): number {
	// Approximation:
	// 1 for 1920
	// 0.63 for 1024
	return window.innerWidth * 0.000413 + 0.2071;
}

export function getVideoScaleFactor() {
	const height = Math.max(window.innerHeight, MIN_PLAYER_HEIGHT);
	return ((16 / 9) * height) / window.innerWidth;
}

export function isLive(item: api.ItemSummary) {
	return item.type === 'channel';
}

export function isItemVr(item: api.ItemDetail): boolean {
	const subtype = get(item, 'subtype');
	return typeof subtype === 'string' && ['episode360', 'extra360'].includes(subtype.toLowerCase());
}

export function isItem4K(item: api.ItemDetail): boolean {
	const categories = get(item, 'categories');
	return categories && categories.includes('4k');
}

export function isItemSSAI(item: api.ItemDetail): boolean {
	const categories = get(item, 'categories');
	return categories && categories.includes('ssai');
}

export function isHOOQ(item: api.ItemDetail): boolean {
	return item && item.customFields && item.customFields.Provider && item.customFields.Provider.toUpperCase() === HOOQ;
}

export function isContentProviderCeased(item: api.ItemDetail): boolean {
	let isContentProvider = false;
	const config = get(store.getState(), 'app.config.general.customFields');
	const cessationProviders = get(config, 'CessationProviders');

	if (item) {
		const provider = get(item, 'customFields.Provider');
		if (provider && cessationProviders && cessationProviders.hasOwnProperty(provider)) {
			isContentProvider = true;
		}
	}

	return isContentProvider;
}

export function isClearKeyContent(item: api.ItemDetail): boolean {
	return item && get(item, 'customFields.Encryption') === 'False';
}

export function getItemMediaType(item: api.ItemDetail): MediaTypes {
	const state = store.getState();
	const maxDRMResolution = get(state, 'player.maxDRMResolution');

	if (isVideoDRMRestrictedByDistributor(item)) {
		if (maxDRMResolution === 'HD-720' || isMobile()) return MediaTypes.DRM720;
		if (maxDRMResolution === 'HD-1080') return MediaTypes.DRM1080;
	}
	if (isItemVr(item)) return MediaTypes.Vr360;
	if (isHOOQ(item)) return MediaTypes.HOOQ;

	if (isClearKeyContent(item)) return MediaTypes.ClearKeyContent;

	return MediaTypes.Default;
}

export function getStreamProtocol(): StreamProtocol {
	if (isSafari()) return StreamProtocol.HLS;
	return StreamProtocol.DASH;
}

export function getMediaFormatsByType(mediaType?: MediaTypes) {
	switch (mediaType) {
		case MediaTypes.Vr360:
			return ['DASH_360', 'HLS_360', 'SS_360'];
		case MediaTypes.HOOQ:
			return ['DASH/WIDEVINE', 'DASH/PLAYREADY', 'HLS/FAIRPLAY', 'SS/PLAYREADY'];
		case MediaTypes.ClearKeyContent:
			return ['DASH_Web_Clear', 'HLS_Web_Clear'];
		case MediaTypes.DRM720:
			return ['DASH_Web', 'HLS_Mobile'];
		case MediaTypes.DRM1080:
			return ['DASH_TV', 'SS_WEB'];
		default:
			return ['DASH_Web', 'HLS_Web'];
	}
}

export function getItemMedias(
	item: api.ItemDetail,
	site: string,
	subscriptionCode: string,
	active: boolean
): Promise<state.MediaResponse> {
	return new Promise(function(resolve, reject) {
		if (isFree(item) && !active) {
			getPublicItemMediaFiles(item.id, ['stream', 'progressive'], 'External', getPlayerDevice(site), undefined)(
				store.dispatch
			)
				.then(response => {
					if (response.error) {
						return reject({ error: { message: 'Error during get public item media files' } });
					} else {
						return resolve({ media: response.payload });
					}
				})
				.catch(err => {
					return reject({ error: { message: 'Error during get public item media files' } });
				});
		}

		if (!active) return Promise.resolve({ error: 'User is not signed in' });

		const device = getPlayerDevice(site);
		const options: GetPublicItemMediaFilesOptions = {
			sub: subscriptionCode
		};
		if (isHOOQ(item)) {
			options.formats = [getFormatsHOOQContent()];
		}

		return getItemMediaFiles(item.id, ['stream'], 'External', device, options)
			.then(response => {
				const payload = response.data as Partial<api.MediaFile & api.MediaFileError>;
				if (payload && payload.status === 403) {
					if (payload.code === 8012) {
						return getItemMediaFilesGuarded(item.id, ['stream'], 'External', device, {
							sub: subscriptionCode
						})
							.then(response => {
								if (response.error) {
									return reject({ error: { message: 'Error during load guarded video' } });
								} else {
									return resolve({ media: response.data });
								}
							})
							.catch(err => {
								return reject({ error: { message: 'Error during load guarded video' } });
							});
					} else {
						return reject({
							error: {
								status: payload.status,
								message: payload.message,
								code: payload.code
							}
						});
					}
				} else {
					return resolve({ media: response.data });
				}
			})
			.catch(err => {
				return reject({ error: { message: 'Error during get item media files' } });
			});
	});
}

export function getFormatsHOOQContent() {
	if (isSafari()) {
		return FormatTypes.HLS;
	} else if (isChrome() || isFirefox()) {
		return FormatTypes.DASH_WIDVINE;
	} else {
		return FormatTypes.DASH_PLAYREADY;
	}
}

export function getPlayerDevice(site: string) {
	return site === CAST_PLAYER_ID ? 'tv_chromecast' : process.env.CLIENT_DEVICE_PLATFORM;
}

export function getPlayerVendor(): string {
	return PLAYER_VENDOR;
}

export function getPlayerVersion(): string {
	return window.KalturaPlayer ? (window.KalturaPlayer as any).VERSION : 'n/a';
}

export function isItemRestricted(item: api.ItemDetail): boolean {
	const ageCodes = [IMDA.M18, IMDA.NC16, IMDA.R21];
	const age = get(item, 'classification.code');
	return ageCodes.includes(age);
}

export function isItemRestrictedR21(item: api.ItemDetail): boolean {
	return get(item, 'classification.code') === IMDA.R21;
}

export function isRestrictedForAnonymous(item: api.ItemDetail): boolean {
	return !getAccount() && isItemRestricted(item);
}
export function getDefaultAdvisoryMessage(item: api.ItemDetail): string {
	const age = get(item, 'classification.code');
	switch (age) {
		case IMDA.G:
			return 'Suitable For All Ages.';
		case IMDA.PG:
			return 'Parental guidance advised for young children.';
		case IMDA.PG13:
			return 'Parental guidance advised for children below the age of 13.';
		case IMDA.NC16:
			return 'Suitable for persons aged 16 and above.';
		case IMDA.M18:
			return 'Suitable for persons aged 18 and above.';
		case IMDA.R21:
			return 'Restricted to persons aged 21 and above.';
		default:
			return undefined;
	}
}

export function isVideoGuarded(payload?: { status: number; code: number }) {
	return payload && payload.status === FORBIDDEN_ERROR && payload.code === PLAYBACK_RATING_RESTRICTION;
}

export function isVideoDRMRestrictedByDistributor(item: api.ItemDetail): boolean {
	const Provider = get(item, 'customFields.Provider');
	const distributor = get(item, 'distributor');
	const restrictedLinearFlagEnabled = (get(item, 'IsResolutionRestrictionEnabled') || '').toLowerCase() === 'true';

	return distributor === RESTRICTED_DISTRIBUTOR || restrictedLinearFlagEnabled || Provider === RESTRICTED_DISTRIBUTOR;
}

export function isVideoDRMRestricted(item: api.ItemDetail): boolean {
	return (get(item, 'customFields.Encryption') || '').toLowerCase() === 'true';
}

export const onPlayerSignIn = (redirectPath?: string) => {
	const config = get(store.getState(), 'app.config');
	if (redirectPath) {
		const redirect = `?redirect=${redirectPath}`;
		browserHistory.replace(`/${getSignInPath(config)}${redirect}`);
	} else {
		browserHistory.push(`/${getSignInPath(config)}`);
	}
	fullscreenService.switchOffFullscreen();
};

export const onPlayerSignUp = (redirect?: string) => {
	const config = get(store.getState(), 'app.config');
	const path = getPagePathByKey(config, `@${registerPageKey}`);
	redirect && setRedirectPathAfterSignin(redirect);
	browserHistory.push(path);
	fullscreenService.switchOffFullscreen();
};

export function getRelativePosition(position, duration): number {
	if (!duration || !position) return 0;
	if (position >= duration) return 1;
	return Math.round((position / duration) * 100) / 100;
}

export function goToChannel(channel: api.ItemSummary, currentPath: string) {
	if (isCurrentChannelPage(channel, currentPath)) {
		store.dispatch(ToggleContent(true));
		if (!fullscreenService.isFullScreen()) {
			fullscreenService.changeFullscreen();
		}
	} else {
		browserHistory.push(`${channel.path}?${FULLSCREEN_QUERY_PARAM}`);
	}
}

function isCurrentChannelPage(channel: api.ItemSummary, currentPath: string) {
	return currentPath === channel.path;
}

export async function maxAllowedResolution(): Promise<VideoResolution> {
	// Retrieve available DRM systems
	let maxResolution = 'HD-720' as VideoResolution;
	try {
		let drmSystemsAvailable = await getSupportedEncryptedMediaExtensions();
		// Grab first item of array as always ordered in highest to lowest clearance levels
		if (drmSystemsAvailable.length > 0) {
			const keySystemObject = drmSystemsAvailable[0];
			maxResolution = resolutionLookup(keySystemObject);
		}
		return maxResolution;
	} catch (e) {
		return maxResolution;
	}
}

export function resolutionLookup(keySysObj): VideoResolution {
	const { type, level } = keySysObj;
	switch (type) {
		case 'com.widevine.alpha':
			return resolverWideVine(level);
			break;
		case 'com.apple.fairplay':
			return resolverAppleFairplay();
			break;
		case 'com.microsoft.playready.recommendation':
		case 'com.microsoft.playready':
		case 'com.youtube.playready':
			return resolverPlayready(level);
			break;

		// Placeholders if extension needed

		// case 'webkit-org.w3.clearkey':
		// 	return resolverWideVine(level);
		// 	break;
		// case 'org.w3.clearkey':
		// 	return 'HD-720';
		// 	break;
		// case 'com.adobe.access':
		// 	return 'HD-720';
		// 	break;
		// case 'com.adobe.primetime':
		// 	return 'HD-720';
		// 	break;
		default:
			return 'HD-720';
	}
}

export function resolverWideVine(clearanceLevel): VideoResolution {
	const wideVineTable = {
		['']: 'SD', // less than Widevine Security Level 3
		['SW_SECURE_CRYPTO']: 'HD-720', // Widevine Security Level 3
		['SW_SECURE_DECODE']: 'HD-720', // Widevine Security Level 3
		['HW_SECURE_CRYPTO']: 'HD-1080', // Widevine Security Level 2
		['HW_SECURE_DECODE']: 'HD-1080', // Widevine Security Level 1
		['HW_SECURE_ALL']: 'HD-1080' // Widevine Security Level 1
	};

	let allowedResolution = wideVineTable[clearanceLevel];

	return allowedResolution !== undefined ? allowedResolution : 'SD';
}

export function resolverAppleFairplay(): VideoResolution {
	// Default at 720
	let allowedResolution = 'HD-720' as VideoResolution;

	// For fairplay environments we need to check the MAC operating system running:
	// Default as 720 and 1080 if OS is 10.13+
	const osVersionInput = window.navigator.appVersion;
	let majorThreshold = 10;
	let minorThreshold = 12;
	let regex = /Mac OS X (\d{2}_\d{2})/;

	// Check if Device is running IOS:
	if (!!window.navigator.platform.match(/iPhone|iPod|iPad/)) {
		regex = /OS ((\d+_?){2,3})\s/;
		majorThreshold = 11; // IOS 12+ is minimum
		minorThreshold = 5;
	}
	const osVersion = osVersionInput.match(regex);
	const osVersionData = osVersion[1];

	if (typeof osVersionData !== 'string' || osVersionData.length === 0) {
		return allowedResolution;
	}

	const versionData = osVersionData.split('_');

	if (versionData.length < 2) return allowedResolution;

	const majorVersion = parseInt(versionData[0]);
	const minorVersion = parseInt(versionData[1]);

	if (majorVersion > majorThreshold) allowedResolution = 'HD-1080';
	if (majorVersion === majorThreshold && minorVersion > minorThreshold) allowedResolution = 'HD-1080';

	return allowedResolution;
}

export function resolverPlayready(clearanceLevel): VideoResolution {
	const playreadyTable = {
		['']: 'HD-720', // Basic playready support
		['2000']: 'HD-1080', // SL2000 support
		['3000']: 'HD-1080' // SL3000 support
	};

	let allowedResolution = playreadyTable[clearanceLevel];

	return allowedResolution !== undefined ? allowedResolution : 'HD-720';
}

const UPSELL_BACK_BUTTON_CLICKED = 'upsell-modal-times';
const UPSELL_MODAL_DISABLED = 'upsell-modal-disabled';

export function shouldShowUpsellScreenModal(): boolean {
	if (getItem(UPSELL_MODAL_DISABLED)) return false;
	const state = store.getState();
	const upsellScreenViewLimit = get(state, 'app.config.general.upsellScreenViewLimit');
	const upsellScreenShowFrequency = get(state, 'app.config.general.upsellScreenShowFrequency');
	let times = getItem(UPSELL_BACK_BUTTON_CLICKED) || 0;
	if (times / upsellScreenShowFrequency > upsellScreenViewLimit) return false;
	setItem(UPSELL_BACK_BUTTON_CLICKED, ++times);

	return times % upsellScreenShowFrequency === 0;
}

export function disableUpsellScreenModal(): void {
	setItem(UPSELL_MODAL_DISABLED, true);
}

export function isCastConnected() {
	const connectionStatus = get(store.getState(), 'player.cast.connectionStatus');
	return connectionStatus === 'Connecting' || connectionStatus === 'Connected';
}

class InitialPlayer {
	private originalPlayer: 'player' | 'cast' | undefined = undefined;

	public resetOriginalPlayer() {
		this.originalPlayer = undefined;
	}

	public setOriginalPlayer(originalPlayer: 'player' | 'cast') {
		if (this.originalPlayer !== undefined) return;

		this.originalPlayer = originalPlayer;
		if (_DEV_) console.log(this.originalPlayer);
	}

	public castOriginalPlayer() {
		return this.originalPlayer === 'cast';
	}
}

export const InitialPlayerService = new InitialPlayer();

export function getClosestAdRoll(resumePosition: number, midRollTimes: number[]): undefined | number {
	// If the user has not seen the video, or their start time is 0 they should see the PreRoll.
	if (midRollTimes.length === 0 || resumePosition <= 0) return undefined;

	const timesBeforeResumePoint = midRollTimes.filter(val => val <= resumePosition);

	const closestAdRoll = timesBeforeResumePoint.reverse().shift();

	if (!closestAdRoll) return undefined;

	// This has to be the closestAdRoll - 1.
	// According to the docs if the time is equal to a ad roll time that ad roll will not be shown to the user
	// https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/reference/js/google.ima.AdsRenderingSettings#playAdsAfterTime
	return closestAdRoll - 1;
}

export function setSessionExpiry(playbackTokenExpirationTimeInMinutes: number): number {
	const date = new Date();
	// There is a small buffer time required as on iOS the onVisibilityChange
	// doesn't get called until about 10 seconds after the phone is locked.
	const buffer = 10;

	const sessionSeconds = playbackTokenExpirationTimeInMinutes * 60 - buffer;
	date.setSeconds(date.getSeconds() + sessionSeconds);
	return date.getTime();
}

export function isSessionExpired() {
	const expiryTime = get(store.getState(), 'iOSExpiryTimestamp');
	if (expiryTime === undefined) return false;

	const date = new Date();
	return expiryTime !== undefined && date.getTime() > expiryTime;
}

export function getDisneyContentBitRate(item: api.ItemDetail): number {
	if (!item || item.customFields.Provider !== RESTRICTED_DISTRIBUTOR) return undefined;

	const userAgent = window.navigator.userAgent;
	const platform = window.navigator.platform;
	const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
	const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
	const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

	if (macosPlatforms.indexOf(platform) !== -1) {
		const v = navigator.appVersion.match(/OS X (\d+)_(\d+)_?(\d+)?/);
		const version = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || '0', 10)];
		if (isChrome() || isFirefox()) return MAX_BITRATE_720P;
		if (version[0] <= 10 && version[1] < 13) {
			return version[1] < 11 ? MAX_BITRATE_480P : MAX_BITRATE_720P;
		}
	} else if (iosPlatforms.indexOf(platform) !== -1) {
		const v = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
		const version = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || '0', 10)];
		if (version[0] < 12) return MAX_BITRATE_720P;
	} else if (windowsPlatforms.indexOf(platform) !== -1) {
		return MAX_BITRATE_720P;
	} else if (/Android/.test(userAgent)) {
		const v = userAgent.match(/android\s([0-9\.]*)/i);
		if (v && v[1] && parseInt(v[1], 10) < 7) return MAX_BITRATE_720P;
	}
}

export function goBackToPreviousAccessPoint() {
	const state = store.getState();
	const historyIndex = get(state, 'page.history.index');
	const pageHistory = get(state, 'page.history.entries');

	const prevPage = pageHistory[historyIndex - 1];
	if (location && location.pathname && prevPage && prevPage.path) {
		const currentPath = location.pathname.split('?');
		const prevPath = prevPage.path.split('?');
		// anonymous user access rated linear channel directly ,after sign in with no DOB,
		// Date of Birth verification modal is presented, if users select the close button on the modal,
		// then need to go back the previous access point.
		if (prevPath[0] === currentPath[0]) {
			browserHistory.go(-2);
		} else {
			browserHistory.goBack();
		}
	} else {
		browserHistory.goBack();
	}
}

export function hasNoAds() {
	const queryString = getQueryParams(window.location.search);
	return queryString && queryString.ads === 0;
}

export function validateAccountAge(account, age: number): boolean {
	let isValidAge = true;
	if (account && age !== undefined) {
		if (account.ageGroup !== AgeGroup.E) {
			isValidAge = validateAgeGroup(account.ageGroup, age);
		}
	}
	return isValidAge;
}

export function isAccountAgeValid(item: api.ItemSummary): boolean {
	const classification = get(store.getState(), 'app.config.classification');
	const account = get(store.getState(), 'account.info');
	return validateAccountAge(account, getItemAllowedToWatchAge(item, classification));
}

export function getAllowedToWatchAge(item: api.ItemDetail): number {
	const classification = get(store.getState(), 'app.config.classification');
	return getItemAllowedToWatchAge(item, classification);
}

export function isMoviePath(path: string): boolean {
	return path && path.includes('/movie/');
}

export function getHDCPLicenseURL(ks, licenseURL) {
	const url = process.env.CLIENT_KALTURA_HDCP_LICENSE_URL;
	if (!url) {
		return;
	}

	const payload = { ks, licenseURL, apiVersion: process.env.CLIENT_KALTURA_HDCP_API_VERSION };
	const requestInit = {
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
		body: JSON.stringify(payload)
	};
	return fetch(url, requestInit);
}

export const isStartOverEnabled = currentProgram =>
	!!get(store.getState(), 'app.config.general.customFields.ShowStartOverUI') &&
	get(currentProgram, 'item.enableStartOverV2');

export const isShortVideo = item => {
	const categories = get(item, 'categories');
	return categories && categories.includes('shorts');
};
