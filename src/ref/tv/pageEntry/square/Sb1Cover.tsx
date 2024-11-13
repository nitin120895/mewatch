import * as React from 'react';
import EntryList from '../../component/EntryList';
import { getFirstMatch } from 'shared/util/images';
import { getImageData } from 'ref/tv/util/itemUtils';
import sass from 'ref/tv/util/sass';
import { Sb1Cover as template } from 'shared/page/pageEntryTemplate';

export default function Sb1Cover(props: PageEntryListProps) {
	const firstExternal = !!getFirstMatch(props.list.images, 'block');

	return (
		<EntryList
			{...props}
			imageType={'square'}
			imageWidth={sass.tileImageWidth}
			rowType={firstExternal ? 'sb1' : 's2'}
			firstImageType={firstExternal ? 'block' : undefined}
			firstImageWidth={firstExternal ? sass.sbCoverFirstImageWidth : undefined}
			firstExternal={firstExternal}
			rowHeight={firstExternal ? sass.sb1CoverHeight : sass.s2LargeHeight}
			entryImageDetails={firstExternal ? getImageData(props.list.images, 'block') : undefined}
		/>
	);
}

Sb1Cover.template = template;
