import * as React from 'react';
import { configPage } from 'shared/';
import entryRenderers from './itemDetailEntries';
import { ItemDetailTemplates } from 'shared/page/pageTemplate';

interface ItemDetailPageProps extends PageProps {
	cache: any;
	pageKey: string;
	profile?: state.Profile;
}

type themesType = {
	colors: { name: string; value: string }[];
	type: string;
};

let defaultBackgroundColor = '';

const ItemDetail = (props: ItemDetailPageProps) => {
	if (props.hasOwnProperty('themes')) {
		const themes = props['themes'] as themesType[];

		if (themes && themes.length > 0) {
			const backgroundTheme = themes.find(t => t.type === 'Background');

			if (backgroundTheme) {
				const priColor = backgroundTheme.colors.find(c => c.name === 'Primary');

				if (priColor) {
					defaultBackgroundColor = priColor.value;
				}
			}
		}
	}

	return <div className="item-detail">{renderEntries(props)}</div>;
};

function renderEntries({ entries, renderEntry, item, cache, pageKey, profile }: ItemDetailPageProps) {
	return (entries || []).map((entry, index) => {
		const entryProps =
			entry.type === 'ItemDetailEntry'
				? {
						itemDetailCache: cache,
						item,
						pageKey: pageKey,
						defaultBackgroundColor: defaultBackgroundColor,
						profile: profile
				  }
				: undefined;
		return renderEntry(entry, index, entryProps);
	});
}

const mapStateToProps = (state: state.Root) => ({
	cache: state.cache.itemDetail,
	profile: state.profile
});

export default configPage(ItemDetail, {
	template: ItemDetailTemplates,
	entryRenderers,
	mapStateToProps
} as any);
