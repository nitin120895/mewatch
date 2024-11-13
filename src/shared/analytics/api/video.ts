import { DTMLoginProviders } from 'shared/analytics/consumers/dtmAnalyticsConsumer';
import { DTMAnalyticsData } from 'shared/analytics/api/shared';
import { UserContext } from 'shared/analytics/types/v3/context/user';
import * as util from 'shared/analytics/api/util';
import { addQueryParameterToURL } from 'shared/util/urls';
import { getActiveProfile } from 'shared/account/accountUtil';
import { getProfiletype } from 'toggle/responsive/pageEntry/advertising/adsUtils';
import { isKidsProfile } from 'ref/responsive/util/kids';
import { FREE_USER } from 'shared/analytics/api/util';
import { isMobile } from 'shared/util/browser';
import { isLessThanTabletSize, isMobileLandscape, isTabletSize } from 'toggle/responsive/util/grid';

export interface VideoAnalyticsParams {
	mediaId: string | number;
	pageTemplate: string;
	platform?: util.Platform;
	startoverInfo?: StartoverInfo;
	channelName?: string;
}

export interface VideoAnalyticsData {
	omniture: DTMVideoAnalyticsData;
	lotame: LotameVideoAnalyticsData;
	youbora: YouboraVideoAnalyticsData;
	gfk: GFKVideoAnalyticsData;
	comscore: ComscoreVideoAnalyticsData;
	gam: GamVideoAnalyticsData;
	message?: string;
	errorMessage?: string;
	pubmatic: PubmaticAnalyticsData;
}

export interface VideoAnalyticsErrorData {
	omniture: {
		mediatype: 'NA';
		contentid: 'NA';
		mediatitle: 'NA';
		mediaseriesname: 'NA';
		mediacontenttype: 'NA';
		mediapublishdate: 'NA';
		mediaurl: 'NA';
		mediareferenceid: 'NA';
		mediamasrefid: 'NA';
		mediaclassification: 'NA';
		mediainfo: 'NA';
		language: 'NA';
	};
	comscore: 'NA';
	lotame: 'NA';
	gfk: 'NA';
	gam: 'NA';
	youbora: {
		accountCode: 'mediacorp';
		properties: {
			content_id: 'NA';
		};
		media: {
			title: 'NA';
			duration: 'NA';
			isLive: 'NA';
		};
		extraParams: {
			param5: 'NA';
		};
	};
	pubmatic: 'NA';
}

export interface DTMVideoAnalyticsData extends DTMAnalyticsData {
	contentid: string;
	contenttitle: string;
	genre1: string;
	genre2: string;
	genre3: string;
	kidscontent: string | 'NA';
	mediaclassification: string;
	mediacontenttype: string;
	mediaduration: number;
	mediaid: string | number;
	mediainfo: string;
	medialanguage: string;
	mediamasrefid: string;
	mediaplayer: string;
	mediapublishdate: string;
	mediareferenceid: string;
	mediarights: string;
	mediaseriesname: string;
	mediatitle: string;
	mediatype: string;
	mediaurl: string;
	noadflag: string;
	profiletype: string | 'NA';
	product: string | 'NA';
	seriestitle: string;
	seriesid: string;
	comscore: ComscoreVideoAnalyticsData;
	gfk: GFKVideoAnalyticsData;
	lotame: LotameVideoAnalyticsData;
	gam: GamVideoAnalyticsData;
	youbora: YouboraVideoAnalyticsData;
	pubmatic: PubmaticAnalyticsData;
}

export interface LotameVideoAnalyticsData {
	ClientID: string;
	AudienceClientID: string;
	seg: string[];
}

export interface YouboraVideoAnalyticsData {
	media: {
		title: string;
		duration: string;
		isLive: string;
		resource: string;
	};
	properties: {
		filename: string;
		content_id: string;
		content_metadata: {
			content_metadata: string;
			duration: string;
		};
		transaction_type: string;
		quality: string;
	};
	user: string; // To replace on FE (Email)
	system: 'mediacorp';
	accountCode: 'mediacorp';
	username: string; // To replace on FE (Email)
	extraParams: {
		param5: 'MediaCorp';
	};
}

export interface KalturaPlayerYouboraPlugin {
	options: {
		accountCode: string;
		username: string;
		'content.cdn'?: string;
		'content.id': string | number;
		'content.title': string;
		'content.duration': number;
		'content.isLive': boolean;
		'content.metadata': any;
		'content.playbackType': string;
		'extraparam.5': string;
		'parse.manifest'?: boolean;
	};
}

export interface GFKVideoAnalyticsData {
	contentId: string;
	mediaId: string;
	cp: {
		cp1: string;
		cp2: string;
		cp3: string;
		cp4: string;
		cp5: string;
		cp6: string;
		cp7: string;
		cp8: string;
		cp9: string;
		cp10: string;
		cp11: string;
		cp12: string;
		cp13: string;
		cp14: string;
		cp15: string;
		cp16: string;
		cp17: string;
		cp18: string;
	};
}

export interface ComscoreVideoAnalyticsData {
	c1: string;
	c2: string;
	c3: string;
	c4: string;
	c5: string;
	c6: string;
	ns_st_pu: string;
	ns_st_ci: string;
	ns_st_cl: number;
	ns_st_st: string;
	ns_st_pr: string;
	ns_st_ep: string;
	ns_st_sn: number;
	ns_st_en: number;
	ns_st_ge: string;
	ns_st_ti: string;
	ns_st_ia: string;
	ns_st_ce: string;
	ns_st_ddt: string;
	ns_st_tdt: string;
}

export interface GamVideoAnalyticsData {
	product?: '<From subscription API to be set by the client application>' | string;
	mediatitle: string;
	medialanguage: string;
	mediarights: string;
	genre1: string;
	genre2: string;
	genre3: string;
	mediaid: string;
	seriestitle: string;
	seriesid: string;
	noadflag: string;
	lotameid?: '<Lotame Audience Segment ID from the Lotame SDK seperated by commas to be set by the client application>';
	UID?: '<lotauds.profile.pid from the Lotame SDK to be set by the client application>';
	meid?: '<Output from the meID API to be set by the client application>';
	meid_seg?: '<Segments from the meID API to be set by the client application> ';
	contentid?: string;
	doctype?: string;
	profiletype?: '<Profile of the loggedin user to be set by the client application>' | string;
	kidscontent: 'Yes' | 'No';
	sz?: '<Resolution of the Ads to be set by the client application>';
	Site?: '<As per tech specs to be set by the client application>';
	'Site Section'?: '<The location of the video to be set by the client application>';
	'Media Type'?: string;
	'Media Channel'?: string;
	'Video Type'?: string;
	vid?: string;
	cmsid?: string;
	correlator?: '<The UNIX timestamp value to be set by the client application>';
	description_url?: string;
	env?: string;
	gdfp_req?: string;
	output?: string;
	unviewed_position_start?: string;
	url?: string;
	cust_params?: '<Video Metadata to be set by the client application>';
}

export interface AdobeVideoAnalyticsData {
	mediatype: string;
	mediaid: string | number;
	mediatitle: string;
	mediaseriestitle: string;
	mediacategory: string;
	mediapublishdate: string;
	mediaurl: string;
	referenceid: string;
	masrefid: string;
	mediagenre: string;
	mediaclassification: string;
	info: string;
}

export interface StartoverInfo {
	startover: boolean;
	epgID: number | string;
}

export interface PubmaticAnalyticsData {
	openwrapapi?: string;
}

function getVideoEndpoint() {
	return process.env.CLIENT_ANALYTICS_VIDEO_ENDPOINT;
}

interface VideoAnalyticsDataCache {
	[url: string]: VideoAnalyticsData;
}

const cache: VideoAnalyticsDataCache | Promise<Response> = {};

const enum DeviceTypesAbbr {
	Mobile = 'mw',
	Tablet = 'tw',
	PC = 'pc'
}

export async function getAnalyticsData(
	user: UserContext = undefined,
	{ mediaId, platform, pageTemplate, startoverInfo, channelName }: VideoAnalyticsParams
): Promise<VideoAnalyticsData | VideoAnalyticsErrorData> {
	const url = getVideoEndpoint();

	if (!url) return;

	if (typeof platform === 'undefined' || platform.length <= 0) platform = util.getPlatform(pageTemplate);

	let videoAnalyticsData: VideoAnalyticsData;
	const startover = startoverInfo && startoverInfo.startover;
	const epgID = startoverInfo && startoverInfo.epgID;
	const id = startover ? epgID : mediaId;
	const { innerWidth, innerHeight } = window;
	let deviceType: DeviceTypesAbbr;
	const isTabletDevice = isTabletSize() && !isLessThanTabletSize() && !isMobileLandscape();
	if (isTabletDevice) {
		deviceType = DeviceTypesAbbr.Tablet;
	} else {
		deviceType = isMobile() ? DeviceTypesAbbr.Mobile : DeviceTypesAbbr.PC;
	}

	let queryParams: any = { id, platform, w: innerWidth, h: innerHeight, devicetype: deviceType };
	if (startover !== undefined) {
		queryParams = { ...queryParams, startover };
	}
	if (startover) {
		queryParams.channel = channelName;
	}

	const videoDataUrl = addQueryParameterToURL(url, queryParams);

	let response = cache[videoDataUrl];

	if (typeof response === 'undefined') {
		try {
			response = await fetch(videoDataUrl);
		} catch (e) {
			return generateErrorData();
		}
		cache[videoDataUrl] = response;
	}

	if (response instanceof Response) {
		try {
			videoAnalyticsData = await response.clone().json();
			if (response.status !== 200 || videoAnalyticsData.message || videoAnalyticsData.errorMessage) {
				return generateErrorData();
			} else {
				cache[videoDataUrl] = videoAnalyticsData;
			}
		} catch (e) {
			return generateErrorData();
		}
	} else {
		videoAnalyticsData = response;
	}

	if (_DEV_) {
		console.group('videoAnalytics');
		console.log(user);
		console.log(platform);
		console.log(mediaId);
		console.log(videoAnalyticsData);
		console.groupEnd();
	}

	setTimeout(() => {
		const keys = Object.keys(cache);
		const length = keys.length;

		if (length <= 20) return;

		const oldestEntries = keys.slice(0, 10);

		oldestEntries.forEach(key => {
			delete cache[key];
		});
	}, 0);

	const videoAnalytics = populateVideoUserInfo(videoAnalyticsData, user);
	return Promise.resolve(videoAnalytics);
}

function populateVideoUserInfo(videoAnalyticsData: VideoAnalyticsData, user: UserContext) {
	const data = Object.assign({}, videoAnalyticsData);
	if (!user) return data;
	data.omniture = populateOmnitureUserData(data.omniture, user);
	data.lotame = populateLotameUserData(data.lotame, user);
	data.gam = populateGamUserData(data.gam, user);
	// Ensure that data.pubmatic is always an object.
	// If data.pubmatic is undefined or null, we provide an empty object as a default value
	data.pubmatic = populatePubmaticData(data.pubmatic || {}, user);

	return data;
}

function populateGamUserData(gamVideoAnalyticsData: GamVideoAnalyticsData, user: UserContext): GamVideoAnalyticsData {
	const gam = Object.assign({}, gamVideoAnalyticsData);

	// Evaluate and set client-side values to gam object
	const currentProfile = getActiveProfile();
	const profileType = getProfiletype(currentProfile);
	const kidsContent =
		currentProfile && currentProfile.segments && isKidsProfile(currentProfile.segments) ? 'Yes' : 'No';

	gam.product = util.getGamProduct(user);
	gam.profiletype = profileType;
	gam.kidscontent = kidsContent;

	return gam;
}

function populatePubmaticData(pubMaticAnalyticsData: PubmaticAnalyticsData, user: UserContext): PubmaticAnalyticsData {
	const pubmatic = Object.assign({}, pubMaticAnalyticsData);
	// Evaluate and set client-side values to pubmatic object
	pubmatic.openwrapapi = pubMaticAnalyticsData.openwrapapi;
	return pubmatic;
}

function populateOmnitureUserData(
	dtmVideoAnalyticsData: DTMVideoAnalyticsData,
	user: UserContext
): DTMVideoAnalyticsData {
	const omniture = Object.assign({}, dtmVideoAnalyticsData);

	const loginStatus = util.isRegisteredUser(user) ? 'True' : 'False';
	const usertype = util.getUserType(user);

	omniture.loginstatus = loginStatus;
	omniture.ssoid = util.getSSOId(user);
	omniture.usertype = usertype === FREE_USER ? 'NA' : usertype;
	omniture.loginsource = util.getLoginSource(user) as DTMLoginProviders;
	omniture.language = util.getUserLanguage(user) || 'NA';

	return omniture;
}

export function populateLotameUserData(
	lotameVideoAnalyticsData: LotameVideoAnalyticsData,
	user: UserContext
): LotameVideoAnalyticsData {
	const lotame = Object.assign({}, lotameVideoAnalyticsData);
	const segments = [...lotame.seg];

	lotame.seg = segments.map(seg => {
		// "UserType:mewatch:UserType:<Free or Paid to be set by client application>",
		if (seg.indexOf('UserType:mewatch:UserType:') !== -1) {
			return 'UserType:mewatch:UserType:' + util.getUserType(user);
		}

		// "LoggedInStatus:mewatch:LoggedIn:<True/False to be set by client application>",
		if (seg.indexOf('LoggedInStatus:mewatch:LoggedIn:') !== -1) {
			const loginStatus = util.isRegisteredUser(user) ? 'True' : 'False';
			return 'LoggedInStatus:mewatch:LoggedIn:' + loginStatus;
		}

		// "Location:mewatch:<2 digit country code to be set by client appliation>"
		if (seg.indexOf('Location:mewatch:') !== -1) {
			return 'Location:mewatch:' + 'sg';
		}

		return seg;
	});

	return lotame;
}

function generateErrorData(): VideoAnalyticsErrorData {
	return {
		omniture: {
			mediatype: 'NA',
			contentid: 'NA',
			mediatitle: 'NA',
			mediaseriesname: 'NA',
			mediacontenttype: 'NA',
			mediapublishdate: 'NA',
			mediaurl: 'NA',
			mediareferenceid: 'NA',
			mediamasrefid: 'NA',
			mediaclassification: 'NA',
			mediainfo: 'NA',
			language: 'NA'
		},
		comscore: 'NA',
		lotame: 'NA',
		gfk: 'NA',
		gam: 'NA',
		youbora: {
			accountCode: 'mediacorp',
			properties: {
				content_id: 'NA'
			},
			media: {
				title: 'NA',
				duration: 'NA',
				isLive: 'NA'
			},
			extraParams: {
				param5: 'NA'
			}
		},
		pubmatic: 'NA'
	};
}
