import * as React from 'react';
import EntryList from '../../component/EntryList';
import { getFirstMatch } from 'shared/util/images';
import { getImageData } from 'ref/tv/util/itemUtils';
import sass from 'ref/tv/util/sass';

export default class Tb1Cover extends React.Component<PageEntryListProps, any> {
	constructor(props) {
		super(props);
	}

	render() {
		const firstExternal = !!getFirstMatch(this.props.list.images, 'block');

		return (
			<EntryList
				{...this.props}
				imageType={'tile'}
				imageWidth={sass.tbCoverImageWidth}
				rowType={firstExternal ? 'tb1' : 't3'}
				firstImageType={firstExternal ? 'block' : undefined}
				firstImageWidth={firstExternal ? sass.tbCoverFirstImageWidth : undefined}
				isDouble={true}
				firstExternal={firstExternal}
				rowHeight={firstExternal ? sass.tb1CoverHeight : sass.t3DoubleHeight}
				entryImageDetails={firstExternal ? getImageData(this.props.list.images, 'block') : undefined}
			/>
		);
	}
}
