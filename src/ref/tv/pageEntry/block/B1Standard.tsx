import * as React from 'react';
import EntryList from '../../component/EntryList';
import sass from 'ref/tv/util/sass';

export default class B1Standard extends React.Component<PageEntryListProps, any> {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<EntryList
				{...this.props}
				imageType={'block'}
				imageWidth={sass.blockImageWidth}
				rowType={'b1'}
				rowHeight={sass.b1StandardHeight}
			/>
		);
	}
}
