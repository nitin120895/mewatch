import * as React from 'react';
import EntryList from '../../component/EntryList';
import { getImageData } from 'ref/tv/util/itemUtils';
import sass from 'ref/tv/util/sass';
import { Sb3Background as template } from 'shared/page/pageEntryTemplate';

export default function Sb3Background(props: PageEntryListProps) {
	return (
		<EntryList
			{...props}
			imageType={'square'}
			imageWidth={sass.tileImageWidth}
			rowType={'sb3'}
			firstImageWidth={sass.sbImageFirstImageWidth}
			listHeight={sass.sbImageListHeight}
			isImage={true}
			listBGImageType={'tile'}
			hasPaddingLeft={true}
			rowHeight={sass.sb4ImageHeight}
			verticalMargin={sass.tb4ImageMarginTop}
			entryImageDetails={getImageData(props.list.images, 'tile')}
		/>
	);
}

Sb3Background.template = template;
