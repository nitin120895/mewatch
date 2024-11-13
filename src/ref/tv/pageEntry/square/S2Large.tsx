import * as React from 'react';
import EntryList from '../../component/EntryList';
import sass from 'ref/tv/util/sass';
import { S2Large as template } from 'shared/page/pageEntryTemplate';

export default function S2Large(props: PageEntryListProps) {
	return (
		<EntryList
			{...props}
			imageType={'square'}
			imageWidth={sass.tileImageWidth}
			rowType={'s2'}
			rowHeight={sass.s2LargeHeight}
		/>
	);
}

S2Large.template = template;
