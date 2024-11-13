import * as React from 'react';
import EntryList from '../../component/EntryList';
import { getImageData } from 'ref/tv/util/itemUtils';
import sass from 'ref/tv/util/sass';

export default class Pb2Text extends React.Component<PageEntryListProps, any> {
	render() {
		return (
			<EntryList
				{...this.props}
				imageType={'poster'}
				imageWidth={sass.posterImageWidth}
				rowType={'pb2'}
				firstImageWidth={sass.tbFirstImageWidth}
				listHeight={sass.pbImageListHeight}
				isImage={true}
				listBrandImageType={'brand'}
				hasPaddingLeft={true}
				rowHeight={sass.pb4ImageHeight}
				verticalMargin={sass.pb4ImageMarginTop}
				entryImageDetails={getImageData(this.props.list.images, 'brand')}
			/>
		);
	}
}
