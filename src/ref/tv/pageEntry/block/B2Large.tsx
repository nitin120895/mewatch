import * as React from 'react';
import EntryList from '../../component/EntryList';
import sass from 'ref/tv/util/sass';

export default class B2Large extends React.Component<PageEntryListProps, any> {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<EntryList
				{...this.props}
				imageType={'block'}
				imageWidth={sass.blockLargeImageWidth}
				rowType={'b2'}
				rowHeight={sass.b2LargeHeight}
			/>
		);
	}
}
