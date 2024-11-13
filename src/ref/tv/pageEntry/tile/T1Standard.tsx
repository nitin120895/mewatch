import * as React from 'react';
import EntryList from '../../component/EntryList';
import sass from 'ref/tv/util/sass';

export default class T1Standard extends React.Component<PageEntryListProps, any> {
	render() {
		return (
			<EntryList
				{...this.props}
				imageType={'tile'}
				imageWidth={sass.tileImageWidth}
				rowType={'t1'}
				rowHeight={sass.t1StandardHeight}
			/>
		);
	}
}
