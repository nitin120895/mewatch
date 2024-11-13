import { isIOS } from 'shared/util/browser';
import { getWatchedInfo } from 'shared/account/profileUtil';
import { canPlay } from '../pageEntry/util/offer';
import { WatchedState } from 'shared/account/profileUtil';
import { isClickToPlayPageEntry } from 'shared/page/pageEntryTemplate';
import { isChannel } from 'toggle/responsive/util/epg';
import { isMovie } from 'shared/util/itemUtils';
import { get } from 'shared/util/objects';

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
		itemPath = item.watchPath;
		watchable = canPlay(item);
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

export function isClickToWatch(item: api.ItemSummary, template: string) {
	const excludeFromClickToWatch = isSeason(item) || isShow(item) || isMovie(item);
	return isChannel(item) || (isClickToPlayPageEntry(template) && !excludeFromClickToWatch);
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

export function isTeam(item: api.ItemSummary) {
	return item.type === 'team';
}

export function isEpisodicSeries(item: api.ItemSummary) {
	const hasGenreSportsOrNews = item.genres.some(genre => ['sports', 'news'].includes(genre));
	return !hasGenreSportsOrNews;
}

export function isSeriesEpisode(item: api.ItemSummary) {
	return isEpisode(item) && isEpisodicSeries(item);
}

export function getMetadataTitle(item: api.ItemDetail) {
	return isEpisode(item) ? item.season && item.season.show && item.season.show.title : item.title;
}

export function getSecondaryTitle(item: api.ItemDetail) {
	return get(item, 'season.show.secondaryLanguageTitle') || item.secondaryLanguageTitle;
}

export function getDeepLink(item?: api.ItemDetail) {
	const { id } = item;
	const DEEPLINK_PREFIX = 'toggle:';
	const WATCH_PATH = '/watch/';

	if (window.location.pathname.includes(WATCH_PATH)) {
		return `${DEEPLINK_PREFIX}/${WATCH_PATH}${id}`;
	}
	return `${DEEPLINK_PREFIX}/${window.location.pathname}`;
}

export const DEEPLINK_TIMEOUT = 3000;

export function openDeepLink(item: api.ItemDetail) {
	window.location.href = getDeepLink(item);

	// If link is not opened in app after timeout, redirect to app install link
	setTimeout(() => {
		window.location.href = isIOS() ? process.env.CLIENT_APP_STORE_LINK : process.env.CLIENT_GOOGLE_PLAY_LINK;
	}, DEEPLINK_TIMEOUT);
}

export function isLastEpisodeOfLastSeason(item: api.ItemSummary) {
	if (isEpisode(item)) {
		const isLastSeason = get(item, 'show.availableSeasonCount') === item.seasonNumber;
		const isLastEpisode = get(item, 'season.availableEpisodeCount') === item.episodeNumber;
		return isLastSeason && isLastEpisode;
	}
	return false;
}

export function isEmbeddable(item: api.ItemSummary) {
	return get(item, 'customFields.Embedding') === 'True';
}
