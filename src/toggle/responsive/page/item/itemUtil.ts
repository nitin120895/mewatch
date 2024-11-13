import DeviceModel from 'shared/util/platforms/deviceModel';
import { GetWatchedListOptions } from 'shared/service/profile';
import { WATCHED_LIST_PAGE_SIZE } from 'shared/page/pageUtil';
import { getItemWithCacheCreator } from 'shared/util/itemUtils';
import { get } from 'shared/util/objects';
import { getItemWatchOptions } from 'toggle/responsive/util/item';
import { isChannel } from 'toggle/responsive/util/epg';
import { browserHistory } from 'shared/util/browserHistory';
import { addQueryParameterToURL, QueryParams } from 'shared/util/urls';
import { FULLSCREEN_QUERY_PARAM } from 'toggle/responsive/util/playerUtil';

export const getWatchedOption = {
	device: DeviceModel.deviceInfo().type,
	page: 1,
	pageSize: WATCHED_LIST_PAGE_SIZE,
	orderBy: 'date-added'
} as GetWatchedListOptions;

const getItemWithCache = getItemWithCacheCreator();

export function getContinueWatchingItem(list: api.ItemSummary[], item: api.ItemSummary): api.ItemSummary {
	return list && list.find(listItem => listItem.id === item.id);
}

export async function getUpdatedItem(itemId: string) {
	return await getItemWithCache(itemId);
}

export function redirectToWatchPage(item: api.ItemSummary, fullscreen = false, goToWatchPath = false) {
	let path = getWatchPath(item);
	if (goToWatchPath) path = item.watchPath;
	const queryParams: QueryParams = { redirect: true };
	if (fullscreen) queryParams[FULLSCREEN_QUERY_PARAM] = true;

	return browserHistory.push(addQueryParameterToURL(path, queryParams));
}

export function getWatchPath(item: api.ItemSummary): string {
	return isChannel(item) ? item.path : getItemWatchOptions(item).path;
}

export function isPortraitVideo(item: api.ItemSummary): boolean {
	const aspectRatio = get(item, 'customFields.AspectRatio');
	return aspectRatio === '9:16';
}

export const getClickToPlayWatchPath = (item, encodeURI = false) =>
	addQueryParameterToURL(item.watchPath, { redirect: true, [FULLSCREEN_QUERY_PARAM]: true });

export function getWatchPathId(url: string) {
	const watchPathArray = url.split('/') || [];
	return watchPathArray[watchPathArray.length - 1];
}
