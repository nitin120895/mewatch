import { ShowDetail as showDetailKey, SeasonDetail as seasonDetailKey } from 'shared/page/pageKey';

export enum CustomAssetType {
	Extras = 'extras',
	Similar = 'similar'
}

const isShow = (pageKey: string) => pageKey === showDetailKey;
const isSeason = (pageKey: string) => pageKey === seasonDetailKey;

function getAssetsFromProps(props: PageEntryItemDetailProps, assetType: CustomAssetType): api.ItemSummary[] {
	const { item, pageKey } = props;
	let assets = item[assetType];
	if (isShow(pageKey)) {
		if (item[assetType] && item[assetType].length > 0) {
			assets = item[assetType];
		} else {
			assets = item.show && item.show[assetType];
		}
	}
	// If Similar row is set on Season Detail, display Season Detail Similar content
	if (isSeason(pageKey) && assetType === CustomAssetType.Similar) {
		if (item.show && item.show[assetType] && item.show[assetType].length > 0) {
			assets = item.show[assetType];
		}
	}

	if (assets && assets.length > 0) {
		assets = assets.map(asset => {
			if (asset.images && !asset.images.logo && item.images && item.images.logo) {
				asset.images.logo = item.images.logo;
			}
			return asset;
		});
	}

	return assets;
}

export function convertItemPropsToListProps(
	props: PageEntryItemDetailProps,
	assetType: CustomAssetType
): PageEntryListProps {
	const assets = getAssetsFromProps(props, assetType);
	if (!assets || !assets.length) {
		return undefined;
	}

	const item = props.item;

	const assetsList: api.ItemList = {
		key: `${item.id}-${assetType}`,
		id: `${item.id}-${assetType}`,
		path: undefined,
		size: assets.length,
		items: fillItemsEmptyPath(assets),
		paging: { page: 1, total: assets.length },
		itemTypes: ['customAsset']
	};

	return Object.assign({}, props, {
		list: assetsList,
		loadNextListPage: (list: api.ItemList) => ({}),
		loadListPage: (list: api.ItemList, pageNo: number) => ({})
	});
}

function hasItemDetailPage(item: api.ItemSummary): boolean {
	return !!item.path;
}

function fillItemsEmptyPath(items: api.ItemSummary[]): api.ItemSummary[] {
	return items.map(item => {
		if (!hasItemDetailPage(item)) item.path = item.watchPath;

		return item;
	});
}
