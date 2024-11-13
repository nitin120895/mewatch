import * as React from 'react';
import EntryList from '../../component/EntryList';
import sass from 'ref/tv/util/sass';
import { Tl1Standard as template } from 'shared/page/pageEntryTemplate';

export default function Tl1Standard(props: PageEntryListProps) {
	return (
		<EntryList
			{...props}
			imageType={'tall'}
			imageWidth={sass.posterImageWidth}
			rowType={'tl1'}
			rowHeight={sass.tl1StandardHeight}
		/>
	);
}

Tl1Standard.template = template;
