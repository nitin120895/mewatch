import * as React from 'react';
import EntryList from '../../../component/EntryList';
import sass from 'ref/tv/util/sass';
import { D6RecommendationsPoster as template } from 'shared/page/pageEntryTemplate';

export default function D6RecommendationsPoster(props: PageEntryListProps) {
	return (
		<EntryList
			{...props}
			imageType={'poster'}
			imageWidth={sass.posterImageWidth}
			rowType={'d6'}
			refRowType={'detail'}
			rowHeight={sass.d6Height}
		/>
	);
}

D6RecommendationsPoster.template = template;
