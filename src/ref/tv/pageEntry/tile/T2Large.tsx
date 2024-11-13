import * as React from 'react';
import EntryList from '../../component/EntryList';
import sass from 'ref/tv/util/sass';

export default class T2Large extends React.Component<PageEntryListProps, any> {
	render() {
		return (
			<EntryList
				{...this.props}
				imageType={'tile'}
				imageWidth={sass.tLargeImageTileWidth}
				rowType={'t2'}
				rowHeight={sass.t2LargeHeight}
			/>
		);
	}
}
