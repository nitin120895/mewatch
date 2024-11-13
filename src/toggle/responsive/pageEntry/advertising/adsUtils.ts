import { isKidsProfile } from 'ref/responsive/util/kids';
import { isTabletSize, isLessThanTabletSize, isScreenMobileSize } from '../../util/grid';
import { getActiveProfile } from 'shared/account/accountUtil';
import { MEDIA_RIGHTS, PageDataTag } from 'shared/analytics/consumers/analyticsConsumersUtil';
import { get } from 'shared/util/objects';
import * as VideoApi from 'shared/analytics/api/video';
import * as fetch from 'isomorphic-fetch';
import { Option } from 'shared/analytics/types/types';
import { GamVideoAnalyticsData, VideoAnalyticsData, VideoAnalyticsErrorData } from 'shared/analytics/api/video';
import { getCookie } from 'shared/util/cookies';

const imuBannerSize = {
	desktop: [[300, 250]],
	tablet: [[300, 250]],
	mobile: [[300, 250]]
};
const leaderboard1Size = {
	desktop: [[970, 250], [970, 90], [728, 90]],
	tablet: [[728, 90]],
	mobile: [[300, 250], [320, 100], [320, 50]]
};
const leaderboardXSize = {
	desktop: [[970, 250], [970, 90], [728, 90]],
	tablet: [[728, 90]],
	mobile: [[300, 250], [320, 50], [320, 100]]
};
const leaderboard0Size = {
	desktop: [[728, 90]],
	tablet: [[728, 90]],
	mobile: [[320, 100], [320, 50]]
};
const outOfPageBannerSize = {
	desktop: [[1, 1]],
	tablet: [[1, 1]],
	mobile: [[1, 1]]
};
const adUnitMap = {
	oop: 'out-of-page'
};
const custParamsCharacter = process.env.CLIENT_GAM_SEPERATOR || ',';
const STORAGE_KEY_LOTAME_UID = '_cc_id';
const STORAGE_KEY_LOTAME_AUDIENCE_SEGMENT =
	process.env.CLIENT_LOTAME_CLIENT_ID && `lotame_${process.env.CLIENT_LOTAME_CLIENT_ID}_auds`;
export const GOOGLETAG_DEVICE_IU_DESKTOP = 'mewatch_desktop';
export const GOOGLETAG_DEVICE_IU_MOBILE = 'mewatch_mobileweb';

export enum UnitDefinition {
	Desktop = 'mewatch_desktop',
	Mobile = 'mewatch_mobileweb',
	Embed = 'mewatch_embed'
}

export enum DeviceDefinition {
	Desktop = 'desktop',
	Tablet = 'tablet',
	Mobile = 'mobile'
}

export const enum ProfileTypes {
	Standard = 'standard',
	Kids = 'kids',
	Restricted = 'restricted'
}

declare global {
	interface Window {
		lotauds: {
			Profile: {
				tpid: string;
				pid: string;
				Audiences: {
					Audience: {
						id: string;
						abbr: string;
					}[];
				};
			};
		};
		meID: string;
		meid_seg: string;
		google: {
			ima: {
				UiElements: {
					COUNTDOWN: string;
					AD_ATTRIBUTION: string;
				};
			};
		};
		googletag: {
			pubads(): { addEventListener(event: string, callback: any): void };
		};
	}
}

const NA = 'NA';

export const OUT_OF_PAGE = 'out_of_page';
export const GOOGLETAG_EVENT_SLOT_RENDER_END = 'slotRenderEnded';

export const bannerSizes = {
	leaderboard1: leaderboard1Size,
	leaderboard2: leaderboardXSize,
	leaderboard3: leaderboardXSize,
	leaderboard4: leaderboardXSize,
	leaderboard5: leaderboardXSize,
	leaderboard0: leaderboard0Size,
	imu1: imuBannerSize,
	imu2: imuBannerSize,
	imu3: imuBannerSize,
	imu4: imuBannerSize,
	imu5: imuBannerSize,
	out_of_page: outOfPageBannerSize,
	out_of_page_small: outOfPageBannerSize
};

export const IMA_AD_DEFAULT_VALUES = {
	sz: '1024x768',
	env: 'vp',
	gdfp_req: '1',
	output: 'xml_vast4',
	adsUrl: 'https://pubads.g.doubleclick.net/gampad/ads'
};

export async function generateAdsTag(
	videoData: VideoAnalyticsData | VideoAnalyticsErrorData,
	websiteUrl: string,
	item: api.ItemDetail,
	ads: api.AppConfigAdvertisments,
	list: api.ItemList,
	profile: api.ProfileDetail,
	account: api.Account,
	language: string,
	plans?: Option<api.Plan[]>,
	embed?: boolean
) {
	const { sz, gdfp_req, output, env, adsUrl } = IMA_AD_DEFAULT_VALUES;
	let adsType;
	if (embed) {
		adsType = UnitDefinition.Embed;
	} else {
		adsType = isTabletSize() ? UnitDefinition.Mobile : UnitDefinition.Desktop;
	}

	const { typeId, mediaChannel, videoType, cmsid } = getAdUnitFromAnalyticData(videoData.gam);
	const iu = `${ads.adsNetworkCode}/${adsType}/${item.type}/${typeId}/${mediaChannel}/${videoType}`;
	const vid = item.customId;
	const classification = item.classification ? item.classification.code : undefined;
	const correlator = Math.round(new Date().getTime() / 1000);
	let customParameters;
	let encodedUrl;
	if (videoData.gam === 'NA') {
		customParameters = getCustomParametersURI(account, item, language);
		encodedUrl = encodeURIComponent(websiteUrl + item.watchPath);
	} else {
		customParameters = constructCustomParametersURI(videoData.gam, classification);
		encodedUrl = encodeURIComponent(videoData.gam.url);
	}

	let pubmaticData;
	if (videoData.pubmatic !== 'NA') {
		pubmaticData = await getPubmaticParameters(videoData.pubmatic.openwrapapi);
	}

	if (pubmaticData) {
		const pubmaticParameters = pubmaticsParametersURI(pubmaticData[0], pubmaticData[1]);
		customParameters += pubmaticParameters;
	}

	let descriptionUrl = encodedUrl;
	if (embed) {
		const domainUrl = document.referrer || location.href;
		descriptionUrl = encodeURIComponent(domainUrl);
		customParameters += encodeURIComponent(`&domain=${domainUrl}`);
	}

	return {
		adTagUrl: `${adsUrl}?sz=${sz}&iu=/${iu}&vid=${vid}&cmsid=${cmsid}&correlator=${correlator}&description_url=${descriptionUrl}&url=${encodedUrl}&env=${env}&gdfp_req=${gdfp_req}&output=${output}&cust_params=${customParameters}&plcmt=${
			embed ? 2 : 1
		}`,
		customParameters,
		itemURL: encodedUrl,
		unitDefinition: adsType,
		videoType
	};
}

function getAdUnitFromAnalyticData(gam: GamVideoAnalyticsData | 'NA') {
	return {
		typeId: get(gam, 'mediatype') || 'NA',
		mediaChannel: get(gam, 'mediachannel') || 'NA',
		videoType: get(gam, 'videotype') || 'NA',
		cmsid: get(gam, 'cmsid') || 'NA'
	};
}

export function getUnit(
	location: HistoryLocation,
	profile: api.ProfileSummary,
	item: api.ItemDetail,
	gam: GamVideoAnalyticsData,
	textAdFormat: string,
	isPausedAd: boolean,
	adUnitOverride?: string
) {
	const unit1 = isTabletSize() ? UnitDefinition.Mobile : UnitDefinition.Desktop;
	if (isPausedAd) {
		const { typeId, mediaChannel } = getAdUnitFromAnalyticData(gam);
		return `${unit1}/${item.type}/${typeId}/${mediaChannel}/${textAdFormat}`;
	} else {
		let pathArray = location.pathname.split('/');
		pathArray.splice(0, 1);
		if (pathArray.length === 1 && pathArray[0] === '') {
			pathArray = ['homepage'];
		}
		const unit2 = profile && profile.segments && isKidsProfile(profile.segments) ? ['kidsprofile'] : pathArray;
		const unitArray = !!adUnitOverride
			? [adUnitOverride, ...[NA, NA].map((item, i) => (item = unit2[i] ? unit2[i] : item))]
			: [NA, NA, NA].map((item, i) => (item = unit2[i] ? unit2[i] : item));
		return `${unit1}/${unitArray.join('/')}/${textAdFormat}`;
	}
}

export function getSizes(textAdFormat: string, isPausedAd?: boolean) {
	const adFormatDimensions = bannerSizes[textAdFormat];
	if (!adFormatDimensions) return;
	return adFormatDimensions[getDevice(isPausedAd)];
}

export function getDevice(isPausedAd?: boolean) {
	if ((isLessThanTabletSize() && !isPausedAd) || (isScreenMobileSize() && isPausedAd)) return DeviceDefinition.Mobile;
	else if (isTabletSize()) return DeviceDefinition.Tablet;
	else return DeviceDefinition.Desktop;
}

export function buildSlotId(textAdFormat: string) {
	return `ad-${getDevice()}-${textAdFormat}`;
}

function getKeywords(adCommaDelimitedTags: string) {
	if (!adCommaDelimitedTags) return NA;
	return adCommaDelimitedTags.split(' ').join('');
}

function getKidsContent(kidsContent: boolean) {
	if (!kidsContent) return NA;
	return 'Yes';
}

export function getTargetingArguments(
	account: api.Account,
	profile: api.ProfileSummary,
	item: api.ItemDetail,
	gam?: GamVideoAnalyticsData | 'NA',
	language?: string,
	adCommaDelimitedTags?: string,
	kidsContent?: boolean
) {
	let profiletype = NA;

	if (profile) {
		if (profile.segments && isKidsProfile(profile.segments)) profiletype = ProfileTypes.Kids;
		else profiletype = account.pinEnabled ? ProfileTypes.Restricted : ProfileTypes.Standard;
	}

	let customParameters = {};
	if (!gam || gam === 'NA') {
		customParameters = getCustomParameters(account, item, language);
	} else {
		const classification = item.classification ? item.classification.code : undefined;
		customParameters = constructCustomParameters(gam, classification);
	}

	return {
		profiletype,
		device: getDevice(),
		doctype: NA,
		keywords: getKeywords(adCommaDelimitedTags),
		contentid: NA,
		kidscontent: getKidsContent(kidsContent),
		...customParameters
	};
}

const pubmaticsParametersURI = (s1: any, s2: any): any => {
	const { s1_pwtcid, s1_pwtdealtier, s1_pwtdid, s1_pwtdur, s1_pwtpb, s1_pwtpid } = s1;
	const { s2_pwtcid, s2_pwtdealtier, s2_pwtdid, s2_pwtdur, s2_pwtpb, s2_pwtpid } = s2;
	return encodeURIComponent(
		`&s1_pwtcid=${s1_pwtcid}&s1_pwtdealtier=${s1_pwtdealtier}&s1_pwtdid=${s1_pwtdid}&s1_pwtdur=${s1_pwtdur}&s1_pwtpb=${s1_pwtpb}&s1_pwtpid=${s1_pwtpid}&s2_pwtcid=${s2_pwtcid}&s2_pwtdealtier=${s2_pwtdealtier}&s2_pwtdid=${s2_pwtdid}&s2_pwtdur=${s2_pwtdur}&s2_pwtpb=${s2_pwtpb}&s2_pwtpid=${s2_pwtpid}`
	);
};

const getCustomParametersURI = (account: api.Account, item: api.ItemDetail, language: string): string => {
	const {
		product,
		mediaLanguage,
		mediaRights,
		genre1,
		genre2,
		genre3,
		mediaId,
		seriesTitle,
		seriesId,
		classification,
		lotameId,
		uid,
		meid,
		meidSeg,
		profileType,
		kidsContent
	} = getCustomParameters(account, item, language);

	return encodeURIComponent(
		`product=${product}&medialanguage=${mediaLanguage}&mediarights=${mediaRights}&genre1=${genre1}&genre2=${genre2}&genre3=${genre3}&mediaid=${mediaId}&seriestitle=${seriesTitle}&seriesid=${seriesId}&UID=${uid}&meid=${meid}&meid_seg=${meidSeg}&profiletype=${profileType}&kidscontent=${kidsContent}&lotameId=${lotameId}&classification=${classification}`
	);
};

const getCustomParameters = (account: api.Account, item: api.ItemDetail, language: string): any => {
	const subscriptions =
		account && account.subscriptions ? account.subscriptions.map(subscription => subscription.planId) : [];
	const currentProfile = getActiveProfile();
	return {
		product: subscriptions.length !== 0 ? subscriptions.join(custParamsCharacter) : NA,
		mediaLanguage: language && language.toLocaleUpperCase(),
		mediaRights: item ? PageDataTag.getCategories(item.categories, MEDIA_RIGHTS) : NA,
		genre1: item && item.genres.length !== 0 ? item.genres.join(custParamsCharacter) : NA,
		genre2: NA,
		genre3: NA,
		mediaId: get(item, 'customId') || '',
		seriesTitle: get(item, 'title') || '',
		seriesId: get(item, 'season.show.customId') || '',
		classification: get(item, 'classification.code') || '',
		lotameId: getLotameAbbreviations() || '',
		uid: getLotameID() || '',
		meid: getmeID() || '',
		meidSeg: get(window, 'meid_seg') || '',
		profileType: getProfiletype(currentProfile),
		kidsContent: currentProfile && currentProfile.segments && isKidsProfile(currentProfile.segments) ? 'Yes' : NA
	};
};

const constructCustomParametersURI = (gamObj: VideoApi.GamVideoAnalyticsData, classification: string): string => {
	const {
		lotameId,
		uid,
		meid,
		meidSeg,
		profiletype,
		kidscontent,
		product,
		genre1,
		genre2,
		genre3,
		medialanguage,
		mediarights,
		mediaid,
		seriestitle,
		seriesid,
		mediatitle,
		noadflag
	} = constructCustomParameters(gamObj);

	return encodeURIComponent(
		`product=${product}&medialanguage=${medialanguage}&mediarights=${mediarights}&genre1=${genre1}&genre2=${genre2}&genre3=${genre3}&mediaid=${mediaid}&seriestitle=${seriestitle}&seriesid=${seriesid}&UID=${uid}&meid=${meid}&meid_seg=${meidSeg}&profiletype=${profiletype}&kidscontent=${kidscontent}&mediatitle=${mediatitle}&noadflag=${noadflag}&lotameId=${lotameId}&classification=${classification}`
	);
};

const getPubmaticParameters = async (openWrapApiUrl: string) => {
	const response = await fetch(openWrapApiUrl, {
		method: 'GET',
		credentials: 'include' /* same as withCredentials:true in XMLHTTPRequest */
	});
	const data = await response.json();
	const pubmaticData = get(data, 'adpods');
	const targetingData = Array.isArray(pubmaticData) && pubmaticData.length !== 0 && pubmaticData[0].targeting;
	return targetingData;
};

const constructCustomParameters = (gamObj: VideoApi.GamVideoAnalyticsData, classification?: string): any => {
	// Mapped as per https://wiki.massiveinteractive.com/display/MEDTOG/DC15+-+Ads+Data+Mapping
	let { product, genre1, genre2, genre3 } = gamObj;
	const regxAllPipe = /\||\_/g;
	const { medialanguage, mediarights, mediaid, seriestitle, seriesid, mediatitle, noadflag } = gamObj;

	return {
		lotameId: getLotameAbbreviations(),
		uid: getLotameID() || '',
		meid: getmeID() || '',
		meidSeg: get(window, 'meid_seg') || '',
		profiletype: NA,
		kidscontent: NA,
		product: typeof product === 'string' ? gamObj.product.replace(regxAllPipe, custParamsCharacter) : NA,
		genre1: genre1 || NA,
		genre2: genre2 || NA,
		genre3: genre3 || NA,
		medialanguage,
		mediarights,
		mediaid,
		seriestitle,
		seriesid,
		mediatitle,
		noadflag,
		classification
	};
};

const getLotameAbbreviations = (): string => {
	if (STORAGE_KEY_LOTAME_AUDIENCE_SEGMENT) {
		const segment: any =
			window && window.localStorage && window.localStorage.getItem(STORAGE_KEY_LOTAME_AUDIENCE_SEGMENT);
		if (segment) {
			return segment instanceof Array
				? segment.reduce<string>((prev, curr, val) => (val ? `${prev},${curr.abbr}` : curr.abbr), '')
				: segment;
		}
		return '';
	}
};

const getLotameID = (): string => window && window.localStorage && window.localStorage.getItem(STORAGE_KEY_LOTAME_UID);

export function getProfiletype(profile: api.ProfileDetail) {
	if (!profile) return NA;
	if (profile.isRestricted) return ProfileTypes.Restricted;
	if (profile.segments && isKidsProfile(profile.segments)) return ProfileTypes.Kids;
	return ProfileTypes.Standard;
}

function getUnits(
	location: HistoryLocation,
	profile: api.ProfileSummary,
	item: api.ItemDetail,
	gam: GamVideoAnalyticsData,
	textAdFormat: string,
	isPausedAd: boolean,
	adUnitOverride?: string
) {
	const unitsArray = getUnit(location, profile, item, gam, textAdFormat, isPausedAd, adUnitOverride).split('/');
	const units = {};
	unitsArray.map((unit, i) => {
		units[`adunit${i + 1}`] = unit;
	});
	return units;
}

export function getDataJsOptions(
	location: HistoryLocation,
	profile: api.ProfileSummary,
	account: api.Account,
	item: api.ItemDetail,
	gam: GamVideoAnalyticsData,
	language,
	adUnit: string,
	adCommaDelimitedTags: string,
	kidsContent: boolean,
	networkCode: string,
	isPausedAd?: boolean,
	adUnitOverride?: string
) {
	const textAdFormat = adUnitMap[adUnit] || adUnit;
	const options = {
		networkCode,
		sizes: getSizes(textAdFormat, isPausedAd),
		...getTargetingArguments(account, profile, item, gam, language, adCommaDelimitedTags, kidsContent),
		...getUnits(location, profile, item, gam, textAdFormat, isPausedAd, adUnitOverride)
	};
	return JSON.stringify(options);
}

const STORAGE_KEY_UID = 'UID';
export const getmeID = (): string => (window && get(window, 'meID')) || getCookie(STORAGE_KEY_UID) || '';
