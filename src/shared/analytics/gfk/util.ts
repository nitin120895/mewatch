import { NA } from '../consumers/analyticsConsumersUtil';
import { ItemContext } from '../types/v3/context/entry';
import { isChannel } from 'ref/responsive/pageEntry/linear/common/utils';
import { isEpisode, isClip, isExtra, isMovie, getItemId, getItemWatchPath, getItemTitle } from 'shared/util/itemUtils';
import { get } from 'shared/util/objects';
import { PageDataTag } from 'shared/analytics/consumers/analyticsConsumersUtil';
import { IVideoCanPlayActionDetail } from 'shared/analytics/types/v3/event/videoEvents';

const NULL = null; // tslint:disable-line:no-null-keyword

export interface GfkMetaData {
	[key: string]: string | number;
}

export const GfkCategoryDefault = 'Toggle Video';
export const GfkCategoryMap = {
	'catchup tv/ch5': 'Channel 5',
	'watch it first/ch5': 'Channel 5',
	'catchup tv/ch8': 'Channel 8',
	'watch it first/ch8': 'Channel 8',
	'catchup tv/chU': 'Channel U',
	'watch it first/chU': 'Channel U',
	'catchup tv/chO': 'okto',
	'watch it first/chO': 'okto',
	'catchup tv/chS': 'Suria',
	'watch it first/chS': 'Suria',
	'catchup tv/chV': 'Vasantham',
	'watch it first/chV': 'Vasantham',
	'catchup tv/cna': 'CNA',
	'watch it first/cna': 'CNA',
	'provider/tap': 'TAP',
	'provider/toggle': 'Toggle',
	stylexstyle: 'styleXstyle',
	'provider/splash': 'Splash',
	'987tv': '987TV',
	class95tv: 'Class95TV',
	'933TV': '933TV',
	styleman: 'Style: Men',
	style: 'Style:',
	elle: 'Elle'
};

export enum TvmMediaType {
	Content = 1,
	Ad = 2
}

export enum BillingId {
	Paid = 12345,
	Free = 99990
}

export function getGfkCategories(item: ItemContext): string {
	const gfkCategories = PageDataTag.getCategories(item.categories, GfkCategoryMap);

	return gfkCategories !== NA ? gfkCategories : GfkCategoryDefault;
}

export function getGfkVideoType(item: ItemContext, detail: IVideoCanPlayActionDetail): TvmMediaType {
	if (detail.isAdPlaying) return TvmMediaType.Ad;

	return TvmMediaType.Content;
}

export function getGfkAudioLanguages(item: ItemContext, detail: IVideoCanPlayActionDetail): string {
	const languages = detail.audioLanguages;

	if (!languages || isChannel(item)) return NA;

	return languages.join(';');
}

export function getGfkEpisodeId(item: ItemContext) {
	if (isEpisode(item)) return `${getEpisodeNumber(item)} ${getEpisodeName(item)}`;

	return NA;
}

export function getEpisodeNumber(item: ItemContext): number | string {
	return isEpisode(item) ? item.episodeNumber : NA;
}

export function getEpisodeName(item: ItemContext): string {
	return isEpisode(item) ? item.episodeName : NA;
}

export function getItemDuration(item: ItemContext): number | string {
	return isChannel(item) ? NA : item.duration;
}

export function getEpisodeDuration(item: ItemContext): number | string {
	return isEpisode(item) ? item.duration : NA;
}

export function getTxDate(item: ItemContext): string {
	return get(item, 'customFields.TxDate') || NA;
}

export function getEpisodeWebStatus(item: ItemContext): 1 | 0 {
	if (isMovie(item) || isClip(item) || isExtra(item)) return 1;

	return 0;
}

export function getShowTitle(item: ItemContext): string {
	return get(item, 'show.title') || get(item, 'season.show.title') || NA;
}

export function isItemPaid(item: ItemContext): 1 | 0 {
	const billingId = get(item, 'customFields.BillingId');
	return billingId === BillingId.Paid ? 1 : 0;
}

export function getItemFullWatchPath(item: ItemContext): string {
	const watchPath = getItemWatchPath(item);
	return window.location.origin + watchPath;
}

export function getProviderExternalID(item: ItemContext): string {
	return get(item, 'customFields.ProviderExternalID') || '';
}

export function getHashtag(item: ItemContext): string {
	const hashtag = get(item, 'customFields.Hashtag');
	if (!hashtag || isChannel(item) || isClip(item) || isExtra(item)) return NA;
	return hashtag;
}

export function getMasterRefId(item: ItemContext): string {
	return get(item, 'customFields.MasterRefId') || NA;
}

export function getGfkMetaData(item: ItemContext, detail: IVideoCanPlayActionDetail): GfkMetaData {
	return {
		cp1: getGfkVideoType(item, detail),
		cp2: getItemId(item),
		cp3: getItemTitle(item),
		cp4: getItemDuration(item),
		cp5: NULL,
		cp6: getGfkEpisodeId(item),
		cp7: getEpisodeName(item),
		cp8: getEpisodeDuration(item),
		cp9: getTxDate(item),
		cp10: getEpisodeWebStatus(item),
		cp11: isItemPaid(item),
		cp12: getItemFullWatchPath(item),
		cp13: getGfkAudioLanguages(item, detail),
		cp14: getShowTitle(item),
		cp15: getGfkCategories(item),
		cp16: getProviderExternalID(item),
		cp17: getHashtag(item),
		cp18: getMasterRefId(item)
	};
}
