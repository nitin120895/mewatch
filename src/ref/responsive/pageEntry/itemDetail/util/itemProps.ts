import { getShowSeasonAndEpisode } from '../../util/episodeList';
import { isEpisode, isSeason } from 'ref/responsive/util/item';

// Returns the parent show when provided with an episode or season.
export function resolveItemOrAncestor(props: PageEntryItemDetailProps) {
	const { item, itemDetailCache } = props;
	if (!item) return undefined;
	if (item.showId && itemDetailCache[item.showId]) {
		return itemDetailCache[item.showId].item || undefined;
	}
	return item;
}

export function getTrailersFromProps(props: PageEntryItemDetailProps): api.ItemSummary[] {
	const { item, itemDetailCache } = props;
	let trailers: api.ItemSummary[];

	if (item.type === 'season' || item.type === 'episode') {
		const data = getShowSeasonAndEpisode(item, itemDetailCache);
		if (data) {
			const { season, show } = data;
			if (season && season.trailers && season.trailers.length) {
				trailers = season.trailers;
			} else if (show && show.trailers && show.trailers.length) {
				trailers = show.trailers;
			}
		}
	} else {
		trailers = item.trailers;
	}

	return trailers;
}

export function convertItemPropsToListProps(props: PageEntryItemDetailProps): PageEntryListProps {
	const trailers = getTrailersFromProps(props);
	if (!trailers || !trailers.length) {
		return undefined;
	}

	const item = props.item;

	// we need to update trailer path with watchPath value
	// Packshot uses path item property for navigation
	trailers.forEach(item => (item.path = item.watchPath));

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

export function getDefaultEpisode(props: PageEntryItemDetailProps) {
	const { item } = props;

	if (!item) {
		return undefined;
	} else if (isSeason(item)) {
		const { episodes } = props.item;
		return episodes && episodes.items && episodes.items.length && episodes.items[0];
	} else if (isEpisode(item)) {
		return item;
	}
}
