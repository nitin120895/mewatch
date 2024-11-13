import * as React from 'react';
import EntryList from '../../component/EntryList';
import { getImageData } from 'ref/tv/util/itemUtils';
import sass from 'ref/tv/util/sass';

export default class Tb4Image extends React.Component<PageEntryListProps, any> {
	render() {
		return (
			<EntryList
				{...this.props}
				imageType={'tile'}
				imageWidth={sass.tbImageWidth}
				rowType={'tb4'}
				firstImageWidth={sass.tbFirstImageWidth}
				listHeight={sass.tbImageListHeight}
				isImage={true}
				listBrandImageType={'custom'}
				listBGImageType={'wallpaper'}
				hasPaddingLeft={true}
				rowHeight={sass.tb4ImageHeight}
				verticalMargin={sass.tb4ImageMarginTop}
				entryImageDetails={getImageData(this.props.list.images, 'custom')}
			/>
		);
	}
}
