export interface EpisodeListData {
	show: api.ItemDetail;
	season: api.ItemDetail;
	episode?: api.ItemSummary;
}

/**
 * Finds target information for different item types within the item detail cache
 */
export function getShowSeasonAndEpisode(
	item: api.ItemDetail,
	itemDetailCache: { [id: string]: state.ItemDetailCache }
): EpisodeListData {
	let season, episode;
	const show = itemDetailCache[item.showId] && itemDetailCache[item.showId].item;
	if (item.type === 'episode') {
		episode = item;
		season = itemDetailCache[episode.seasonId] && itemDetailCache[episode.seasonId].item;
	} else {
		season = item;
	}

	return { show, season, episode };
}
