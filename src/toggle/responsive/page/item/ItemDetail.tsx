import * as React from 'react';
import { configPage } from 'shared/';
import { ItemDetailTemplates } from '../../../../shared/page/pageTemplate';
import entryRenderers from 'ref/responsive/page/item/itemDetailEntries';
import PageNotFound from 'toggle/responsive/page/PageNotFound';

interface ItemDetailPageProps extends PageProps {
	cache: any;
	pageKey: string;
	pageNotFound: boolean;
}

const ItemDetail = (props: ItemDetailPageProps) => <div className="item-detail">{renderEntries(props)}</div>;

function renderEntries(props: ItemDetailPageProps) {
	const { entries, renderEntry, item, cache, pageKey, pageNotFound } = props;
	if (pageNotFound) return <PageNotFound {...props} />;

	return (entries || []).map((entry, index) => {
		const entryProps =
			entry.type === 'ItemDetailEntry' || entry.type === 'CustomEntry'
				? { pageKey, itemDetailCache: cache, item }
				: undefined;
		return renderEntry(entry, index, entryProps);
	});
}

const mapStateToProps = ({ cache, page }) => ({
	cache: cache.itemDetail,
	pageNotFound: !page.loading && page.showPageNotFound
});

export default configPage(ItemDetail, {
	template: ItemDetailTemplates,
	entryRenderers,
	mapStateToProps
} as any);
