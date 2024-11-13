import * as React from 'react';
import EntryList from '../../component/EntryList';
import sass from 'ref/tv/util/sass';

export default class T5DoubleFeatured extends React.Component<PageEntryListProps, any> {
	render() {
		return (
			<EntryList
				{...this.props}
				imageType={'tile'}
				imageWidth={sass.tDoubleFeaturedImageWidth}
				rowType={'t5'}
				firstImageType={'tile'}
				firstImageWidth={sass.tDoubleFeaturedFirstImageWidth}
				isDouble={true}
				rowHeight={sass.t5DoubleFeaturedHeight}
			/>
		);
	}
}
