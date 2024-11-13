import * as React from 'react';
import EntryList from '../../component/EntryList';
import { getImageData } from 'ref/tv/util/itemUtils';
import sass from 'ref/tv/util/sass';

export default class Pb3Background extends React.Component<PageEntryListProps, any> {
	render() {
		return (
			<EntryList
				{...this.props}
				imageType={'poster'}
				imageWidth={sass.posterImageWidth}
				rowType={'pb3'}
				firstImageWidth={sass.tbFirstImageWidth}
				listHeight={sass.pbImageListHeight}
				isImage={true}
				listBGImageType={'tile'}
				hasPaddingLeft={true}
				rowHeight={sass.pb4ImageHeight}
				verticalMargin={sass.pb4ImageMarginTop}
				entryImageDetails={getImageData(this.props.list.images, 'tile')}
			/>
		);
	}
}
