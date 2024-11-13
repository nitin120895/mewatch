import * as React from 'react';
import EntryList from '../../component/EntryList';
import sass from 'ref/tv/util/sass';

export default class P1Standard extends React.Component<PageEntryListProps, any> {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<EntryList
				{...this.props}
				imageType={'poster'}
				imageWidth={sass.posterImageWidth}
				rowType={'p1'}
				rowHeight={sass.p1StandardHeight}
			/>
		);
	}
}
