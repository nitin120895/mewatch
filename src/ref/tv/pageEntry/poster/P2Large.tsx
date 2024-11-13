import * as React from 'react';
import EntryList from '../../component/EntryList';
import sass from 'ref/tv/util/sass';

export default class P2Large extends React.Component<PageEntryListProps, any> {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<EntryList
				{...this.props}
				imageType={'poster'}
				imageWidth={sass.tileImageWidth}
				rowType={'p2'}
				rowHeight={sass.p2LargeHeight}
			/>
		);
	}
}
