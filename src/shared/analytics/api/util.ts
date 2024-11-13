import { get } from 'shared/util/objects';
import { NA } from 'shared/analytics/consumers/analyticsConsumersUtil';
import { DTMLoginProviders, updateMediaInfo } from 'shared/analytics/consumers/dtmAnalyticsConsumer';
import { SubscriptionState } from 'toggle/responsive/pageEntry/account/accountUtils';
import { getLoginSource as getLocalStorageLoginSource } from 'toggle/responsive/util/authUtil';
import { UserContext, RegisteredUserContext } from 'shared/analytics/types/v3/context/user';
import {
	getItemMediaType,
	getMediaFormatsByType,
	InitialPlayerService,
	isCastConnected,
	isHOOQ
} from 'toggle/responsive/util/playerUtil';
import * as VideoApi from './video';
import { getUserId } from 'shared/account/accountUtil';
import {
	MovieDetail,
	ProgramDetail,
	ShowDetail,
	ChannelDetail,
	SeasonDetail,
	EpisodeDetail,
	Watch,
	ItemDetail
} from 'shared/page/pageTemplate';
import { getUserContext } from '../getContext';
import { GetAnalyticContextData } from './shared';
import { StartoverInfo } from './video';

export const FREE_USER = 'Free';
export const PLAYBACK_TYPE_START_OVER = 'Startover';

export type Platform = 'online' | 'onlinechromecast' | 'onlineairplay';

export function getLoginSource(user: UserContext): DTMLoginProviders {
	if (!isRegisteredUser(user)) return NA;

	return getLocalStorageLoginSource();
}

export function getSSOId(user: UserContext): string {
	return get(user, 'userId') || NA;
}

export function isRegisteredUser(user: UserContext): boolean {
	const userGroup = get(user, 'userGroup');
	return typeof userGroup !== 'undefined' && userGroup !== 'Anonymous';
}

export function getGamProduct(user: UserContext): string {
	if (!isRegisteredUser(user)) return NA;

	const activeSubscriptions = getActivePaidSubscriptions((user as RegisteredUserContext).subscriptions);

	if (!activeSubscriptions.length) return FREE_USER;

	const planIds = activeSubscriptions.map((subscription: api.Subscription) => subscription.planId);
	return `Paid|${planIds.join(',')}`;
}

export function getUserType(user: UserContext): string {
	if (!isRegisteredUser(user)) return FREE_USER;

	const activeSubscriptions = getActivePaidSubscriptions((user as RegisteredUserContext).subscriptions);
	if (!activeSubscriptions.length) return FREE_USER;

	const planIds = activeSubscriptions.map((subscription: api.Subscription) => subscription.planId);
	return `Paid|${planIds.join(',')}`;
}

export function getActivePaidSubscriptions(subscriptions: api.Subscription[]): api.Subscription[] {
	return subscriptions.filter(
		subscription => subscription.status === SubscriptionState.Active && subscription.planId !== 'Registered'
	);
}

export function getPlatform(pageTemplate: string): Platform {
	if (isCastConnected()) {
		return getCastPlatform(pageTemplate);
	}
	return 'online';
}

export function getCastPlatform(pageTemplate: string) {
	if (InitialPlayerService.castOriginalPlayer()) {
		switch (pageTemplate) {
			case MovieDetail:
			case ProgramDetail:
			case ShowDetail:
			case ChannelDetail:
			case SeasonDetail:
			case EpisodeDetail:
			case ItemDetail:
			case Watch:
				return 'onlinechromecast';
			default:
				return 'online';
		}
	}

	return 'online';
}

export function getPageProperty(): string {
	if (process.env.CLIENT_ANALYTICS_PROPERTY && process.env.CLIENT_ANALYTICS_PROPERTY.length > 0) {
		return process.env.CLIENT_ANALYTICS_PROPERTY;
	}

	return 'mewatch';
}

export function getUserLanguage(user: UserContext) {
	return user.locale.split('-').shift();
}

export function getAnalyticData(
	contextData: GetAnalyticContextData,
	videoAnalyticsParams?: VideoApi.VideoAnalyticsParams
): Promise<VideoApi.VideoAnalyticsData | VideoApi.VideoAnalyticsErrorData> {
	const { item, account, plans, activeProfile, startoverInfo } = contextData;
	const segments = activeProfile && activeProfile.segments !== undefined ? activeProfile.segments : [];
	const userContextParams = { info: account, segments, plans };
	return new Promise<VideoApi.VideoAnalyticsData | VideoApi.VideoAnalyticsErrorData>((resolve, reject) => {
		VideoApi.getAnalyticsData(getUserContext(userContextParams), Object.assign(
			{
				mediaId: item.customId,
				startoverInfo,
				channelName: item.title
			},
			videoAnalyticsParams
		) as VideoApi.VideoAnalyticsParams)
			.then((data: VideoApi.VideoAnalyticsData) => {
				updateMediaInfo(data);
				resolve(data);
			})
			.catch(() => {
				reject();
			});
	});
}

export function getYouboraParam(
	item: api.ItemDetail,
	analyticsData: VideoApi.VideoAnalyticsData | VideoApi.VideoAnalyticsErrorData,
	startoverInfo?: any
): VideoApi.KalturaPlayerYouboraPlugin {
	if (isYouboraRequired(item)) {
		const youboraData = mapYouboraVideoData(get(analyticsData, 'youbora'));
		return getYouboraOptions(youboraData, startoverInfo);
	}
}

export function isYouboraRequired(item: api.ItemDetail): boolean {
	return process.env.CLIENT_PLAYER_YOUBORA_PLUGIN && !isHOOQ(item);
}

export function getYouboraOptions(
	youbora: VideoApi.YouboraVideoAnalyticsData,
	startoverInfo?: StartoverInfo
): VideoApi.KalturaPlayerYouboraPlugin {
	if (!youbora) {
		return;
	}

	const accountCode = get(youbora, 'accountCode');
	const media = get(youbora, 'media');
	const extraParams = get(youbora, 'extraParams');
	const properties = get(youbora, 'properties');

	const title = get(media, 'title');
	const duration = get(media, 'duration');
	const isLive = get(media, 'isLive');
	const param5 = get(extraParams, 'param5');
	const username = get(youbora, 'username');
	const startover = startoverInfo && startoverInfo.startover;
	const disabledParse = process.env.CLIENT_YOUBORA_PLUGIN_PARSE_MANIFEST_DISABLED === 'true';

	const options = {
		accountCode: accountCode,
		username,
		'content.id': properties.content_id,
		'content.title': title,
		'content.duration': duration,
		'content.isLive': isLive,
		'content.metadata': properties,
		'extraparam.5': param5,
		'content.playbackType': startover ? PLAYBACK_TYPE_START_OVER : undefined,
		'parse.manifest': !disabledParse
	};
	return {
		options
	};
}

export function mapYouboraVideoData(
	youboraData: VideoApi.YouboraVideoAnalyticsData
): VideoApi.YouboraVideoAnalyticsData {
	if (!youboraData) {
		return;
	}

	const media = get(youboraData, 'media');
	const extraParams = get(youboraData, 'extraParams');
	const title = get(media, 'title') || 'NA';
	const isLiveFlag = get(media, 'isLive');
	const isLive = isLiveFlag !== undefined ? isLiveFlag.toString() === 'true' : 'NA';
	const duration = Number.parseInt(get(media, 'duration'), 10) || 0;

	const resource = get(media, 'resource') || 'NA';
	const param5 = get(extraParams, 'param5') || 'NA';
	const user = getUserId() || 'NA';

	return Object.assign(youboraData, {
		media: {
			title,
			duration,
			isLive,
			resource
		},
		user,
		username: user,
		extraParams: {
			param5
		}
	});
}

export function getNPAWConfig(config: state.Config) {
	const customFields = get(config, 'general.customFields');
	return {
		npawAccountCode: get(customFields, 'NPAWAccountCode'),
		npawMappingVod: get(customFields, 'NPAWMappingVod.Profiles'),
		npawProfileLive: get(customFields, 'NPAWProfileLive'),
		npawProfileVod: get(customFields, 'NPAWProfileVod'),
		rwDisableMCDN: get(customFields, 'RWDisableMCDN')
	};
}

export function getSmartSwitchConfig(params) {
	if (process.env.CLIENT_YOUBORA_MULTIPLE_CDN_SWITCH && !params.rwDisableMCDN) {
		const { item, npawAccountCode, npawMappingVod, npawProfileLive, npawProfileVod } = params;
		const targetProfile = getMediaFormatsByType(getItemMediaType(item))[0];
		const live = item.type === 'channel';

		const application = live ? npawProfileLive || 'live' : npawProfileVod || 'vod';

		const originCode = live
			? process.env.CLIENT_YOUBORA_MULTIPLE_CDN_LIVE_ORIGIN
			: (npawMappingVod && npawMappingVod[targetProfile]) || 'BAU';

		return {
			domainUrl: process.env.CLIENT_YOUBORA_MULTIPLE_CDN_DOMAIN || 'https://southeast-1.gnsnpaw.com',
			accountCode: npawAccountCode,
			application,
			responseTimeoutSec: process.env.CLIENT_YOUBORA_MULTIPLE_CDN_TIMEOUT || 15,
			followRedirects: true,
			optionalParams: {
				extended: true,
				originCode,
				live: !!live
			}
		};
	}
}
