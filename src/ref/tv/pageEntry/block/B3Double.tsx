import * as React from 'react';
import EntryList from '../../component/EntryList';
import sass from 'ref/tv/util/sass';

export default class B3Double extends React.Component<PageEntryListProps, any> {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<EntryList
				{...this.props}
				imageType={'block'}
				imageWidth={sass.tileImageWidth}
				rowType={'b3'}
				isDouble={true}
				rowHeight={sass.b3DoubleHeight}
			/>
		);
	}
}
