import * as React from 'react';
import { configPage } from 'shared/';
import { ItemDetailTemplates } from '../../../../shared/page/pageTemplate';
import entryRenderers from './itemDetailEntries';

interface ItemDetailPageProps extends PageProps {
	cache: any;
}

const ItemDetail = (props: ItemDetailPageProps) => <div className="item-detail">{renderEntries(props)}</div>;

function renderEntries({ entries, renderEntry, item, cache }: ItemDetailPageProps) {
	return (entries || []).map((entry, index) => {
		const entryProps = entry.type === 'ItemDetailEntry' ? { itemDetailCache: cache, item } : undefined;
		return renderEntry(entry, index, entryProps);
	});
}

const mapStateToProps = (state: state.Root) => ({
	cache: state.cache.itemDetail
});

export default configPage(ItemDetail, {
	template: ItemDetailTemplates,
	entryRenderers,
	mapStateToProps
} as any);
