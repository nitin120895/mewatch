import * as React from 'react';
import EntryList from '../../component/EntryList';
import sass from 'ref/tv/util/sass';

export default class T4DoubleLarge extends React.Component<PageEntryListProps, any> {
	render() {
		return (
			<EntryList
				{...this.props}
				imageType={'tile'}
				imageWidth={sass.tLargeImageTileWidth}
				rowType={'t4'}
				isDouble={true}
				rowHeight={sass.t4DoubleLargeHeight}
			/>
		);
	}
}
