import * as React from 'react';
import EntryList from '../../../component/EntryList';
import sass from 'ref/tv/util/sass';
import { D7RecommendationsSquare as template } from 'shared/page/pageEntryTemplate';

export default function D7RecommendationsSquare(props: PageEntryListProps) {
	return (
		<EntryList
			{...props}
			imageType={'square'}
			imageWidth={sass.posterImageWidth}
			rowType={'d7'}
			refRowType={'detail'}
			rowHeight={sass.d7Height}
		/>
	);
}

D7RecommendationsSquare.template = template;
