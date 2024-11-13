import * as React from 'react';
import EntryList from '../../component/EntryList';
import sass from 'ref/tv/util/sass';

export default class T3Double extends React.Component<PageEntryListProps, any> {
	render() {
		return (
			<EntryList
				{...this.props}
				imageType={'tile'}
				imageWidth={sass.tileImageWidth}
				rowType={'t3'}
				isDouble={true}
				rowHeight={sass.t3DoubleHeight}
			/>
		);
	}
}
