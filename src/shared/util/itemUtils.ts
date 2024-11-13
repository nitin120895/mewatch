import { isSeason } from 'ref/responsive/util/item';
import { ContentSourceId } from 'shared/analytics/boost/boost';
import { getItem } from 'shared/service/content';
import { get } from 'shared/util/objects';
import { getHostURL } from '../page/richSnippetsUtil';
import {
	XT1,
	XTB1,
	XTB2,
	XTB3,
	XTB4,
	XSB1,
	XSB2,
	XSB3,
	XSB4,
	XPB1,
	XPB2,
	XPB3,
	XPB4
} from 'shared/page/pageEntryTemplate';
import { isChannel } from 'toggle/responsive/util/epg';

export enum BaseSubTypes {
	News = 'News',
	Clip = 'Clip',
	Program = 'Program',
	Sports = 'Sports',
	Extra = 'Extra',
	Entertainment = 'Entertainment'
}

export function matchItemSubType(item: api.ItemSummary, subtype: BaseSubTypes): boolean {
	return item.subtype && item.subtype.includes(subtype);
}

let itemCache: Promise<api.Response<api.ItemDetail>>[] = [];
export function getItemWithCacheCreator() {
	return async (itemId: api.ItemDetail['id']): Promise<api.ItemDetail> => {
		let cachedItem = itemCache && itemCache[itemId];

		if (typeof cachedItem === 'undefined') {
			cachedItem = await getItem(itemId, { expand: 'all' });
		}

		if (cachedItem instanceof Response) {
			return (cachedItem as any).data;
		} else if (cachedItem instanceof Promise) {
			cachedItem = await cachedItem;
		}

		if (cachedItem.error) return;

		itemCache[itemId] = cachedItem;
		return cachedItem.data;
	};
}

export const subTypeLabels = {
	EntertainmentSeasonPilot: '@{itemDetail_seasonList_pilot_label|Pilot}',
	EntertainmentSeasonPrequal: '@{itemDetail_seasonList_prequel_label|Prequel}',
	SeasonPrequel: '@{itemDetail_seasonList_prequel_label|Prequel}',
	EntertainmentSeasonTelemovie: '@{itemDetail_seasonList_telemovie_label|Telemovie}',
	EntertainmentSeason: '@{itemDetail_seasonList_season_label|Season {season}}'
};

export function isEpisode(item: api.ItemSummary): boolean {
	return item && item.type === 'episode';
}

export function isMovie(item: api.ItemSummary): boolean {
	return item && item.type === 'movie';
}

export function isShow(item: api.ItemSummary): boolean {
	return item && item.type === 'show';
}

export function isNews(item: api.ItemSummary): boolean {
	return matchItemSubType(item, BaseSubTypes.News);
}

export function isClip(item: api.ItemSummary): boolean {
	return matchItemSubType(item, BaseSubTypes.Clip);
}

export function isExtra(item: api.ItemSummary): boolean {
	return matchItemSubType(item, BaseSubTypes.Extra);
}

export function isProgram(item: api.ItemSummary): boolean {
	return matchItemSubType(item, BaseSubTypes.Program);
}

export function getItemId(item: api.ItemSummary): string {
	return item.customId;
}

export function getItemWatchPath(item: api.ItemSummary): string {
	return item.watchPath;
}

export function getItemFullPath(item: api.ItemSummary): string {
	return `${getHostURL()}${item.path}`;
}

export function getItemTitle(item: api.ItemSummary): string {
	return item.title;
}

export function getAllowedToWatchAge(item: api.ItemDetail, classification: api.Classification) {
	const age = get(item, 'classification.code');
	const ageNumber = age && classification[age].level;
	return ageNumber ? ageNumber : undefined;
}

export function isClickable(ignoreLink: boolean, isRestricted: boolean) {
	return !ignoreLink && !isRestricted;
}

export function isXRowSubscriptionContent(item: api.ItemDetail, template: string): boolean {
	return (
		[XT1, XTB1, XTB2, XTB3, XTB4, XSB1, XSB2, XSB3, XSB4, XPB1, XPB2, XPB3, XPB4].includes(template) &&
		!isShow(item) &&
		!isSeason(item)
	);
}

const listEntries = {
	ListEntry: 'ListEntry',
	ListDetailEntry: 'ListDetailEntry',
	UserEntry: 'UserEntry'
};

export const itemEntries = {
	ItemEntry: 'ItemEntry',
	ItemDetailEntry: 'ItemDetailEntry'
};

export function isListEntry(type: string): boolean {
	return type in listEntries;
}

export function isItemEntry(type: string): boolean {
	return type in itemEntries;
}

export function formatMediaTitleValues(value: number | string) {
	if (!value) return '';
	value = value.toString();
	return value.length > 1 ? `${value}` : `0${value}`;
}

export function isTitleClickable(list: api.ItemList, currentPath: HistoryLocation['pathname']): boolean {
	if (!list) return false;
	return list.path !== currentPath;
}

export function getProgress(item: api.ItemSummary, watchedData: { [key: string]: api.Watched }): number | undefined {
	const itemWatchedData: api.Watched = get(watchedData, item.id);

	if (!itemWatchedData) return undefined;

	if (itemWatchedData.isFullyWatched) return 100;

	const currentTime: number = get(itemWatchedData, 'position');
	const itemDuration: number = get(item, 'duration');

	if (!currentTime || !itemDuration) return undefined;

	let progress = (currentTime / itemDuration) * 100;

	if (progress <= 0) return undefined;

	progress = Math.min(100, progress);

	return progress;
}

const getItemWithCache = getItemWithCacheCreator();

export function getZoomItemParam(item: api.ItemDetail): Promise<any> {
	let credits = undefined;
	let genres = undefined;
	let audioLanguages = undefined;
	genres = item.genres && item.genres.map((genre, index) => genre.toLowerCase());
	credits = item.credits && item.credits.map(actor => (actor.name ? actor.name.trim().toLowerCase() : ''));
	audioLanguages = get(item, 'customFields.AudioLanguages');
	const itemParam = { credits, genres, audioLanguages, contentId: item.customId };

	switch (item.type) {
		case 'episode':
		case 'season':
			return getItemWithCache(item.showId).then(show => ({ ...itemParam, contentId: show.customId }));
		default:
			return Promise.resolve(itemParam);
	}
}

/*	
		Content ID to be used for Boost recommendation API call
		Use Kaltura ID i.e. customId
		Season and Episode items will use the Show Kaltura ID
*/
export function getContentId(item: api.ItemDetail): Promise<any> {
	let contentId = item ? item.customId : undefined;
	if (isSeason(item)) {
		contentId = get(item, 'show.customId');
	} else if (isEpisode(item)) {
		contentId = get(item, 'season.show.customId');
	}

	if (contentId) {
		return Promise.resolve(contentId);
	} else {
		return getItemWithCache(item.showId).then(show => (show && show.customId ? show.customId : ''));
	}
}

export function getContentSourceId(item: api.ItemDetail) {
	const isShowItem = isShow(item);
	const isSeasonItem = isSeason(item);
	const isEpisodeItem = isEpisode(item);
	const isChannelItem = isChannel(item);

	switch (true) {
		case isShowItem || isSeasonItem:
			return ContentSourceId.Series;
		case isEpisodeItem:
			return ContentSourceId.Episode;
		case isChannelItem:
			return ContentSourceId.EPG;
		default:
			return ContentSourceId.VOD;
	}
}

export function getRecommendationsContentSourceId(item: api.ItemDetail, contentId: string) {
	return `[${getContentSourceId(item)}]${contentId}`;
}

export function getEpisodeIdpRecommendationsContentSourceId(contentId: string) {
	return `[${ContentSourceId.Series}]${contentId}`;
}
