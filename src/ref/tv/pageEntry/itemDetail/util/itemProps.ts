import { getShowSeasonAndEpisode } from '../util/episodeList';

// Returns the parent show when provided with an episode or season.
export function resolveItemOrAncestor(props: PageEntryItemDetailProps) {
	const { item, itemDetailCache } = props;
	if (!item) return undefined;
	if (item.showId && itemDetailCache[item.showId]) {
		return itemDetailCache[item.showId].item || undefined;
	}
	return item;
}

export function getTrailersFromItem(
	item: api.ItemDetail,
	itemDetailCache: { [id: string]: state.ItemDetailCache }
): api.ItemSummary[] {
	if (item.type === 'season' || item.type === 'episode') {
		const data = getShowSeasonAndEpisode(item, itemDetailCache);
		if (data) {
			const { season, show } = data;
			if (season && season.trailers && season.trailers.length) {
				return season.trailers;
			} else if (show && show.trailers && show.trailers.length) {
				return show.trailers;
			}
		}
	} else {
		return item.trailers;
	}
}

export function createTrailersListEntry(props: PageEntryItemDetailProps): PageEntryListProps {
	const { item, itemDetailCache } = props;
	const trailers = getTrailersFromItem(item, itemDetailCache) || [];

	// we need to update trailer path with watchPath value
	// AssetList uses path item property for navigation
	trailers.forEach(trailer => (trailer.path = trailer.watchPath));

	const trailersList: api.ItemList = {
		key: `${item.id}-trailers`,
		id: `${item.id}-trailers`,
		path: item.path,
		size: trailers.length,
		items: trailers,
		paging: { page: 1, total: trailers.length },
		itemTypes: ['trailer']
	};

	return Object.assign({}, props, {
		list: trailersList,
		loadNextListPage: (list: api.ItemList) => ({}),
		loadListPage: (list: api.ItemList, pageNo: number) => ({})
	});
}

// check if the page is of season or episode, as if it is, we should collapse DH1,
// and focus on the season or episode.
// (Or else it would be the same when you move to detail page from a Show and a season)
export function checkShouldCollapse(pageKey: string): boolean {
	switch (pageKey) {
		case 'SeasonDetail':
		case 'EpisodeDetail':
			return true;

		default:
			return false;
	}
}
