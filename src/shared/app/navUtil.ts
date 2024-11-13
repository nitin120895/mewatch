import {
	getEmptyListKeys,
	getEmptySecureLists,
	getPackshotTitlePositon,
	getPackshotMetadataFormatting,
	getItemUnwatchedEpisodes
} from '../list/listUtil';
import { POSTER_WIDTH, TILE_WIDTH, HERO3x1_WIDTH } from '../../ref/responsive/app/packshotWidths';
import * as NavSelectors from 'shared/selectors/nav';
import { Watched as watchedListId, Bookmarks as bookmarksListId } from '../list/listId';
import { PackshotProps } from 'toggle/responsive/component/Packshot';

export enum NavEntryDepth {
	Primary,
	Group,
	Item
}

/**
 * Returns the css class name modifier which applies to the given depth
 */
export function getEntryDepthModifier(depth: NavEntryDepth): string {
	switch (depth) {
		case NavEntryDepth.Primary:
			return 'primary';
		case NavEntryDepth.Group:
			return 'group';
		case NavEntryDepth.Item:
			return 'item';
		default:
			return undefined;
	}
}

/**
 * Returns an array of list keys targeting lists to load within the navigation.
 */
export function getEmptyNavListKeys(state: state.Root): string[] {
	const lists = NavSelectors.getNavContentLists(state.app.config.navigation);
	return getEmptyListKeys(state, lists);
}

export function getEmptySecureNavLists(state: state.Root): api.ItemList[] {
	const lists = NavSelectors.getNavContentLists(state.app.config.navigation);
	return getEmptySecureLists(state, lists);
}

/**
 *  * @depreciated use the version in selectors
 * Returns an array of lists from within the navigation.
 */
export const getNavContentLists = NavSelectors.getNavContentLists;

/**
 * Returns a nav content list from the list cache for a given nav entry
 */
export function getNavContentCachedList(entry: api.NavEntry, listCache: any): api.ItemList {
	if (!entry || !entry.content || !listCache) return undefined;
	const cachedList = listCache[entry.content.list.key];
	if (!cachedList || !cachedList.list.items.length) return undefined;
	return cachedList.list;
}

const PACKSHOT_WIDTH = {
	poster: POSTER_WIDTH,
	tile: TILE_WIDTH,
	hero3x1: HERO3x1_WIDTH
};

/**
 * Returns common props to be applied to packshots within nav content lists (header and side panel)
 */
export function getNavContentPackshotProps(
	list: api.ItemList,
	item: api.ItemSummary,
	imageType: image.Type
): PackshotProps {
	// When user lists are scheduled to maintain legibility of the items we force the text title because
	// we can't guarantee that the appropriate imagery will exist for the mixed content list.
	const isUserList = list.id === watchedListId || list.id === bookmarksListId;

	const unwatchedEpisodes = getItemUnwatchedEpisodes(list, item);

	let titlePosition = getPackshotTitlePositon(list);
	if (isUserList || item.type === 'episode') {
		titlePosition = 'overlay';
	}

	const metadataFormatting = getPackshotMetadataFormatting(list);

	let imageTypes;
	if (imageType === 'tile' && isUserList) {
		// Mixed content user lists look better when we allow a fallback image type
		imageTypes = ['tile', 'wallpaper'];
	}
	return {
		item,
		imageType: imageTypes || imageType,
		titlePosition,
		imageOptions: {
			width: PACKSHOT_WIDTH[imageType] || POSTER_WIDTH
		},
		metadataFormatting,
		unwatchedEpisodes
	};
}

export function isMeRewardsEntry(entry: api.NavEntry): boolean {
	return entry.type === 'RewardSection';
}

export function getMeRewardsEntry(
	navigationRewards: api.NavEntry,
	accountRewards: api.RewardsInfo
): api.RewardsInfoItem {
	return accountRewards[Object.keys(accountRewards).find(reward => reward === navigationRewards.type)] || {};
}

export function getMeRewardsMenuEntries(
	navigationRewards: api.NavEntry[],
	accountRewards: api.RewardsInfo
): api.NavEntry[] {
	let entries = [];
	navigationRewards.map(reward => {
		const { value, url } = getMeRewardsEntry(reward, accountRewards);
		let valueContainer = '';
		if (typeof value === 'number') {
			if (reward.type === 'RewardCashback') {
				if (value % 1 === 0) {
					valueContainer = `(S$${value}.00)`;
				} else {
					valueContainer = `(S$${value})`;
				}
			} else {
				valueContainer = `(${value})`;
			}
		}

		const label = `${reward.label} ${valueContainer}`;
		entries.push({ label, url, path: reward.path || url });
	});

	return entries;
}

// Used for Mixpanel tracking of menu_click
export function getFormattedMenuOption(options: string[], delimiter = '|') {
	return options.join(delimiter);
}
