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
	itemDetailCache: { [id: string]: state.ItemDetailCache },
	seasonOrder: 'ascending' | 'descending' = 'ascending'
): EpisodeListData {
	let show, season, episode;

	if (!item.showId) {
		show = item;
	} else {
		show = itemDetailCache[item.showId] && itemDetailCache[item.showId].item;
	}

	if (show) {
		if (item.type === 'episode') {
			episode = item;
			season = itemDetailCache[episode.seasonId].item;
		} else if (item.type === 'season') {
			season = item;
		}
	} else {
		return undefined;
	}

	if (seasonOrder === 'ascending') {
		show && show.seasons && show.seasons.items.sort((a, b) => a.seasonNumber - b.seasonNumber);
		season && season.items && season.items.sort((a, b) => a.seasonNumber - b.seasonNumber);
	} else {
		show && show.seasons && show.seasons.items.sort((a, b) => b.seasonNumber - a.seasonNumber);
		season && season.items && season.items.sort((a, b) => b.seasonNumber - a.seasonNumber);
	}

	return { show: JSON.parse(JSON.stringify(show)), season, episode };
}
