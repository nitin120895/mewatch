import { getWatchedInfo } from 'shared/account/profileUtil';
import { canPlay } from '../pageEntry/util/offer';
import { WatchedState } from 'shared/account/profileUtil';

export type ItemWatchOptions = {
	path: string;
	watchable: boolean;
};

export function getItemWatchOptions(item: api.ItemSummary): ItemWatchOptions {
	let itemPath = item.path;
	let watchable = false;
	if (isShow(item)) {
		// if rendered item has show type, `customFields` might include current season and episode.
		// we check it before list rendering; items collection, continue watching for example, has additional field `listData`
		// we parse `listData` and fill show item's `customFields` with episode and season, if exist.
		// for more information, see `checkListData` in PackshotList
		const episode = item.customFields && item.customFields['episode'];
		if (episode && canPlay(episode)) {
			itemPath = episode.watchPath;
			watchable = true;
		}
	} else {
		if (canPlay(item)) {
			itemPath = item.watchPath;
			watchable = true;
		}
	}

	return { path: itemPath, watchable };
}

export function getItemProgress(item: api.ItemSummary) {
	const progressedItem = isShow(item) ? item.customFields && item.customFields['episode'] : item;
	if (!progressedItem || !progressedItem.duration) return 0;

	const watched = getWatchedInfo(progressedItem.id);
	const progress =
		watched.value && watched.value.isFullyWatched
			? 100
			: (watched.state === WatchedState.Watched &&
					Math.ceil((watched.value.position / progressedItem.duration) * 100)) ||
			  0;

	return progress;
}

export function getItemTitle(item: api.ItemSummary) {
	// We skip titles on Link items because they're expected to have a text description baked into the image.
	if (isLink(item)) return undefined;

	let title = item.title;
	if (isShow(item)) {
		const episode = item.customFields && item.customFields['episode'];
		if (!!episode) title = episode.title;
	}
	return title;
}

export function hasHoverByItem(item: api.ItemSummary) {
	return false;
}

export function isShow(item: api.ItemSummary) {
	return item.type === 'show';
}

export function isSeason(item: api.ItemSummary) {
	return item.type === 'season';
}

export function isLink(item: api.ItemSummary) {
	return item.type === 'link';
}

export function isTrailer(item: api.ItemSummary) {
	return item.type === 'trailer';
}

export function isEpisode(item: api.ItemSummary) {
	return item.type === 'episode';
}

export function getMetadataTitle(item: api.ItemDetail) {
	return isEpisode(item) ? item.season && item.season.show && item.season.show.title : item.title;
}

export function getSecondaryTitle(item: api.ItemDetail) {
	return item.secondaryLanguageTitle;
}
