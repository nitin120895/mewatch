import { PageDataTag } from 'shared/analytics/consumers/analyticsConsumersUtil';
import { TrackingEvent } from 'shared/analytics/types/v3/event';
import { EventConsumer } from '../types/types';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { AnalyticsEventMap } from 'shared/analytics/types/v3/event/analyticsEventMap';
import { explicitDTMpageview } from '../axisAnalytics';
import { isChannel } from 'toggle/responsive/util/epg';
import { Watch, STATIC, Subscription, ColdStart } from 'shared/page/pageTemplate';
import { AccountProfilePersonalisation } from 'shared/page/pageKey';
import * as PageApi from 'shared/analytics/api/page';
import * as VideoApi from 'shared/analytics/api/video';
import { get } from 'shared/util/objects';
import { ItemContextProperty } from '../types/v3/context';
import { mapYouboraVideoData } from 'shared/analytics/api/util';
import { PLACEHOLDER_PAGE_ID } from 'shared/page/pageUtil';
import { setCookie } from 'shared/util/cookies';
import { onLibraryLoaded } from '../../util/scripts';

export type DTMLoginProviders = 'Mediacorp' | 'Facebook' | 'Google' | 'Apple' | 'NA';

type DTMOmniMediaContext = 'play' | 'pause' | 'resume' | 'complete';

type DTMOmniMediaArguments = [string, (number | undefined), (number | string)?];

type DTMCallEvent =
	| AnalyticsEventMap['Video First Playing']
	| AnalyticsEventMap['Video Paused']
	| AnalyticsEventMap['Video Resumed']
	| AnalyticsEventMap['Video Completed']
	| AnalyticsEventMap['Video Error']
	| AnalyticsEventMap['Video Ad Started']
	| AnalyticsEventMap['Video Seeked'];

export interface DTMGeneralMetaData {
	channel: string;
	pagename: string;
	language: string;
	contentid: 'NA' | string;
	contentname: 'NA' | string;
	contentpublishdate: 'NA' | string;
	contentlength: 'NA' | number;
	loggedinstatus: boolean;
	ssoid: string;
	loginsource: DTMLoginProviders | 'NA';
	usertype: string;
}

export interface DTMItemMetaData extends DTMGeneralMetaData {
	doctype: string;
	mediainfo: string;
}

export interface DTMVideoTrackingMetaData {
	mediatype: 'Video';
	mediaid: string | number;
	mediatitle: string;
	mediaseriestitle: 'NA' | string;
	mediacategory: 'NA' | string;
	mediapublishdate: 'NA' | string;
	mediaurl: string;
	referenceid: 'NA' | number;
	masrefid: 'NA' | string;
	mediagenre: string;
	mediaclassification: 'Long' | 'Short';
}

declare global {
	interface Window {
		mcDataLayer: PageApi.PageAnalyticsData;
		MediaInfo: VideoApi.VideoAnalyticsData;
		omniInitMediaTracking?(assetName: string, itemDuration: number, playerName: string): void;
		omniMediaTrackingStop?(assetName: string, currentTime: number): void;
		omniMediaTrackingResume?(assetName: string, currentTime: number): void;
		omniMediaTrackingDone?(assetName: string, itemDuration: number): void;
		omniLoad(player: any, playerVersion?: string): void;
	}
}

export const DTMGlobal: Window | undefined = (function() {
	if (_SSR_ || typeof window === 'undefined') return undefined;
	return window;
})();

const safeToMakeDTMCalls = (): boolean =>
	!!DTMGlobal.omniInitMediaTracking ||
	!!DTMGlobal.omniMediaTrackingStop ||
	!!DTMGlobal.omniMediaTrackingDone ||
	!!DTMGlobal.omniMediaTrackingResume;

const omniLoadReady = (): boolean => !!DTMGlobal.omniLoad && !!DTMGlobal.MediaInfo;
export const ANALYTICS_SSO_ID = 'sso_id';

export const DTMAnalyticsConsumer: EventConsumer = function httpEndpoint(): (event: TrackingEvent) => void {
	let hasVideoFirstPlayed = false;

	return (event: TrackingEvent): void | Promise<void> => {
		try {
			switch (event.type) {
				case AnalyticsEventType.USER_SIGNED_IN:
				case AnalyticsEventType.USER_REGISTERED:
				case AnalyticsEventType.APP_STARTED:
				case AnalyticsEventType.USER_SIGN_OUT:
					return updateSSOCookies(event);
				case AnalyticsEventType.GENERIC_ANALYTICS_EVENT:
					return updatePageProps(event, AnalyticsEventType.GENERIC_ANALYTICS_EVENT);
				case AnalyticsEventType.USER_PROFILE_PERSONALISATION_PREFERENCES_GENRES:
					return updatePageProps(event, AnalyticsEventType.USER_PROFILE_PERSONALISATION_PREFERENCES_GENRES);
				case AnalyticsEventType.ITEM_DETAIL_VIEWED:
					return updateItemDetailProps(event);
				case AnalyticsEventType.WATCH_PAGE_VIEWED:
					const { item } = event.context;
					// Avoid firing DTM page view when item is a channel
					// Required to prevent double counting as channel media on Watch page will get redirected to Channel page
					if (!isChannel(item)) {
						updateItemDetailProps(event);
					}
					return;
				case AnalyticsEventType.PAGE_VIEWED:
					return updatePageProps(event);
				case AnalyticsEventType.VIDEO_INITIALIZED:
					return updateVideoTrackingProps(event);
				case AnalyticsEventType.VIDEO_FIRST_PLAYING:
					updateVideoTrackingProps(event).then(() => initMediaTracking(event));
					hasVideoFirstPlayed = true;
					return;
				case AnalyticsEventType.VIDEO_AD_STARTED:
					return;
				case AnalyticsEventType.VIDEO_RESTARTED:
					hasVideoFirstPlayed = false;
					return updateVideoTrackingProps(event).then(() => initMediaTracking(event));
				case AnalyticsEventType.VIDEO_PAUSED:
					hasVideoFirstPlayed && callOmniMediaTrackingStop(event);
					return;
				case AnalyticsEventType.VIDEO_RESUMED:
					return callOmniMediaTrackingResume(event);
				case AnalyticsEventType.VIDEO_SEEKED:
					callOmniMediaTrackingStop(event);
					callOmniMediaTrackingResume(event);
					return;
				case AnalyticsEventType.VIDEO_COMPLETED:
				case AnalyticsEventType.VIDEO_ERROR:
					hasVideoFirstPlayed && callOmniMediaTrackingDone(event);
					hasVideoFirstPlayed = false;
					return;
			}
		} catch (error) {
			console.error('DTM: ', error);
		}
	};
};

type UpdatePageEvents =
	| AnalyticsEventMap['Page Viewed']
	| AnalyticsEventMap['User Personalisation Preferences Genres']
	| AnalyticsEventMap['Generic Analytics Event'];

export function callOmniLoad(player: any, version: string) {
	onLibraryLoaded(omniLoadReady).then(() => {
		DTMGlobal.omniLoad(player, version);
	});
}

function updateSSOCookies(
	event:
		| AnalyticsEventMap['User Signed In']
		| AnalyticsEventMap['User Registered']
		| AnalyticsEventMap['App Started']
		| AnalyticsEventMap['User Signed Out']
) {
	if (event.type === AnalyticsEventType.USER_SIGN_OUT) {
		setCookie(ANALYTICS_SSO_ID, 'NA');
	} else {
		const { user } = event.context;
		setCookie(ANALYTICS_SSO_ID, (user && user.userId) || 'NA');
		const refreshMeID = get(window, 'refreshMeID');
		typeof refreshMeID === 'function' && refreshMeID();
	}
}

function updatePageProps(event: UpdatePageEvents, analyticsEventType?: AnalyticsEventType): void {
	const { user, page } = event.context;
	const { name } = page.template;
	const followCountry = get(event, 'detail.payload.data.originator');
	if (followCountry) {
		if (
			followCountry.analytics === 'unFollowTeam' ||
			(followCountry.analytics === 'followTeam' && event.type === AnalyticsEventType.GENERIC_ANALYTICS_EVENT)
		) {
			return;
		}
	}
	if (event.type === AnalyticsEventType.PAGE_VIEWED && page.id === PLACEHOLDER_PAGE_ID) {
		return;
	}

	const { pageKey } = page;

	if (
		analyticsEventType !== AnalyticsEventType.GENERIC_ANALYTICS_EVENT &&
		(PageDataTag.isItemDetailPage(name) ||
			name === Watch ||
			name === STATIC ||
			name === Subscription ||
			name === ColdStart ||
			pageKey === AccountProfilePersonalisation)
	) {
		return;
	}

	let path: string;
	const detailPath = get(event, 'detail.payload.data.path');
	if (detailPath) {
		path = detailPath;
	} else {
		path = PageApi.getPagePath(event, analyticsEventType);
	}

	const pageTemplate = get(page, 'template.name');

	PageApi.getAnalyticsData(user, path, pageTemplate).then((data: PageApi.PageAnalyticsData) => {
		const { omniture, lotame, comscore } = data;
		const adobePageData = mapAdobePageData(omniture);

		DTMGlobal.mcDataLayer = {
			omniture: adobePageData,
			lotame,
			comscore
		};
		explicitDTMpageview();
	});
}

function updateItemDetailProps(
	event: AnalyticsEventMap['Item Detail Viewed'] | AnalyticsEventMap['Watch Page Viewed']
): void {
	if (!PageDataTag.isItemContext(event.context)) return;
	const { user, page } = event.context;
	const path = get(page, 'path');
	const pageTemplate = get(page, 'template.name');

	PageApi.getAnalyticsData(user, path, pageTemplate).then((data: PageApi.PageAnalyticsData) => {
		const { omniture, lotame, comscore } = data;
		const adobePageData = mapAdobePageData(omniture);

		DTMGlobal.mcDataLayer = {
			omniture: adobePageData,
			lotame,
			comscore
		};
		explicitDTMpageview();
	});
}

function updateVideoTrackingProps(
	event:
		| AnalyticsEventMap['Video First Playing']
		| AnalyticsEventMap['Watch Page Viewed']
		| AnalyticsEventMap['Item Detail Viewed']
		| AnalyticsEventMap['Video Ad Started']
		| AnalyticsEventMap['Video Restarted']
		| AnalyticsEventMap['Entry Viewed']
		| AnalyticsEventMap['Video Initialized']
): Promise<void> {
	if (!(PageDataTag.isItemContext(event.context as ItemContextProperty) || PageDataTag.isEntryContext(event.context))) {
		return;
	}

	const { user, page } = event.context;
	const itemContexItem = get(event.context, 'item');
	const item = itemContexItem ? itemContexItem : get(event.context, 'entry.item');
	if (!item) {
		return;
	}

	const pageTemplate = get(page, 'template.name') || Watch;
	const startoverInfo = get(event.detail, 'startoverInfo');
	return VideoApi.getAnalyticsData(user, {
		mediaId: item.customId,
		pageTemplate,
		startoverInfo,
		channelName: item.title
	}).then(updateMediaInfo);
}

export function updateMediaInfo(data: VideoApi.VideoAnalyticsData) {
	const { omniture, comscore, gfk, lotame, gam, youbora: youboraData, pubmatic } = data;
	const adobeVideoData = mapAdobeVideoData(omniture);
	const gamData = mapGamVideoData(gam);
	const pubmaticData = mapPubmaticVideoData(pubmatic);
	const youbora = mapYouboraVideoData(youboraData);

	DTMGlobal.MediaInfo = {
		omniture: adobeVideoData,
		gam: gamData,
		comscore,
		gfk,
		lotame,
		youbora,
		pubmatic: pubmaticData
	};
}

function initMediaTracking(event) {
	if (!safeToMakeDTMCalls()) return;
	DTMGlobal.MediaInfo && DTMGlobal.omniInitMediaTracking.apply(window, getOmniMediaArguments(event, 'play'));
}

function mapAdobePageData(omniture: PageApi.DTMPageAnalyticsData): PageApi.DTMPageAnalyticsData {
	return Object.assign(omniture, {
		channel: omniture.channel,
		pagename: omniture.pagename,
		language: omniture.language,
		contentid: 'NA',
		contentname: 'NA',
		contentpublishdate: 'NA',
		contentlength: 'NA',
		loggedinstatus: omniture.loginstatus,
		ssoid: omniture.ssoid,
		loginsource: omniture.loginsource,
		usertype: omniture.usertype
	});
}

function mapAdobeVideoData(omniture: VideoApi.DTMVideoAnalyticsData): VideoApi.DTMVideoAnalyticsData {
	// Mapped as per https://wiki.massiveinteractive.com/display/MEDTOG/DC7+-+Adobe+Analytics+Data+Mapping
	return Object.assign(omniture, {
		['mediatype']: omniture.mediatype,
		['mediaid']: omniture.contentid,
		['mediatitle']: omniture.mediatitle,
		['mediaseriestitle']: omniture.mediaseriesname,
		['mediacategory']: omniture.mediacontenttype,
		['mediapublishdate']: omniture.mediapublishdate,
		['mediaurl']: omniture.mediaurl,
		['referenceid']: omniture.mediareferenceid,
		['masrefid']: omniture.mediamasrefid,
		['mediagenre']: omniture.mediacontenttype,
		['mediaclassification']: omniture.mediaclassification,
		['info']: omniture.mediainfo
	});
}

function callOmniMediaTrackingStop(event: AnalyticsEventMap['Video Paused'] | AnalyticsEventMap['Video Seeked']): void {
	safeToMakeDTMCalls() &&
		!isChannel(event.context && event.context.item) &&
		DTMGlobal.omniMediaTrackingStop.apply(window, getOmniMediaArguments(event, 'pause'));
}

function callOmniMediaTrackingResume(
	event: AnalyticsEventMap['Video Resumed'] | AnalyticsEventMap['Video Seeked']
): void {
	safeToMakeDTMCalls() &&
		!isChannel(event.context && event.context.item) &&
		DTMGlobal.omniMediaTrackingResume.apply(window, getOmniMediaArguments(event, 'resume'));
}

function callOmniMediaTrackingDone(
	event: AnalyticsEventMap['Video Completed'] | AnalyticsEventMap['Video Error']
): void {
	safeToMakeDTMCalls() &&
		!isChannel(event.context && event.context.item) &&
		DTMGlobal.omniMediaTrackingDone.apply(window, getOmniMediaArguments(event, 'complete'));
}

function getOmniMediaArguments(event: DTMCallEvent, context: DTMOmniMediaContext): DTMOmniMediaArguments {
	const { item } = event.context;
	const { type, duration } = item;
	const { getAssetName, getItemDuration, getCurrentTime, getPlayerName } = PageDataTag;
	switch (context) {
		case 'play':
			return [getAssetName(item), getItemDuration(type, duration), getPlayerName()];
		case 'pause':
		case 'resume':
			return [getAssetName(item), getCurrentTime()];
		case 'complete':
			return [getAssetName(item), getItemDuration(type, duration)];
	}
}

function mapGamVideoData(gam: VideoApi.GamVideoAnalyticsData): VideoApi.GamVideoAnalyticsData {
	// Mapped as per https://wiki.massiveinteractive.com/display/MEDTOG/DC15+-+Ads+Data+Mapping
	return Object.assign(gam, {
		medialanguage: gam.medialanguage,
		mediarights: gam.mediarights,
		genre1: gam.genre1,
		genre2: gam.genre2,
		genre3: gam.genre3,
		mediaid: gam.mediaid,
		seriestitle: gam.seriestitle,
		seriesid: gam.seriesid,
		mediatitle: gam.mediatitle,
		noadflag: gam.noadflag,
		profiletype: gam.profiletype,
		kidscontent: gam.kidscontent,
		product: gam.product
	});
}

function mapPubmaticVideoData(pubmatic: VideoApi.PubmaticAnalyticsData): VideoApi.PubmaticAnalyticsData {
	return Object.assign(pubmatic, {
		openwrapapi: pubmatic.openwrapapi
	});
}
