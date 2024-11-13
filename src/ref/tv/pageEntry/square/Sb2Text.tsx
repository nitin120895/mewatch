import * as React from 'react';
import EntryList from '../../component/EntryList';
import { getImageData } from 'ref/tv/util/itemUtils';
import sass from 'ref/tv/util/sass';
import { Sb2Text as template } from 'shared/page/pageEntryTemplate';

export default function Sb2Text(props: PageEntryListProps) {
	return (
		<EntryList
			{...props}
			imageType={'square'}
			imageWidth={sass.tileImageWidth}
			rowType={'sb2'}
			firstImageWidth={sass.sbImageFirstImageWidth}
			listHeight={sass.sbImageListHeight}
			isImage={true}
			listBrandImageType={'brand'}
			hasPaddingLeft={true}
			rowHeight={sass.sb4ImageHeight}
			verticalMargin={sass.tb4ImageMarginTop}
			entryImageDetails={getImageData(props.list.images, 'brand')}
		/>
	);
}

Sb2Text.template = template;
