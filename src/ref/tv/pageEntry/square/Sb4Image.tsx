import * as React from 'react';
import EntryList from '../../component/EntryList';
import { getImageData } from 'ref/tv/util/itemUtils';
import sass from 'ref/tv/util/sass';
import { Sb4Image as template } from 'shared/page/pageEntryTemplate';

export default function Sb4Image(props: PageEntryListProps) {
	return (
		<EntryList
			{...props}
			imageType={'square'}
			imageWidth={sass.tileImageWidth}
			rowType={'sb4'}
			firstImageWidth={sass.sbImageFirstImageWidth}
			listHeight={sass.sbImageListHeight}
			isImage={true}
			listBrandImageType={'custom'}
			listBGImageType={'wallpaper'}
			hasPaddingLeft={true}
			rowHeight={sass.sb4ImageHeight}
			verticalMargin={sass.tb4ImageMarginTop}
			entryImageDetails={getImageData(props.list.images, 'custom')}
		/>
	);
}

Sb4Image.template = template;
