import * as React from 'react';
import EntryList from '../../component/EntryList';
import sass from 'ref/tv/util/sass';
import { S1Standard as template } from 'shared/page/pageEntryTemplate';

export default function S1Standard(props: PageEntryListProps) {
	return (
		<EntryList
			{...props}
			imageType={'square'}
			imageWidth={sass.posterImageWidth}
			rowType={'s1'}
			rowHeight={sass.s1StandardHeight}
		/>
	);
}

S1Standard.template = template;
