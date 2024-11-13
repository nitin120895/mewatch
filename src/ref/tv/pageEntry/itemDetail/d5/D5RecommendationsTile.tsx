import * as React from 'react';
import EntryList from '../../../component/EntryList';
import sass from 'ref/tv/util/sass';
import { D5RecommendationsTile as template } from 'shared/page/pageEntryTemplate';

export default function D5RecommendationsTile(props: PageEntryListProps) {
	return (
		<EntryList
			{...props}
			imageType={'tile'}
			imageWidth={sass.tileImageWidth}
			rowType={'d5'}
			refRowType={'detail'}
			rowHeight={sass.d5Height}
		/>
	);
}

D5RecommendationsTile.template = template;
