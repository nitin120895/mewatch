import * as React from 'react';
import EntryList from '../../component/EntryList';
import { getFirstMatch } from 'shared/util/images';
import { getImageData } from 'ref/tv/util/itemUtils';
import sass from 'ref/tv/util/sass';

export default class Pb1Cover extends React.Component<PageEntryListProps, any> {
	constructor(props) {
		super(props);
	}

	render() {
		const firstExternal = !!getFirstMatch(this.props.list.images, ['block', 'hero4x3']);

		return (
			<EntryList
				{...this.props}
				imageType={'poster'}
				imageWidth={sass.posterImageWidth}
				rowType={firstExternal ? 'pb1' : 'p1'}
				firstImageType={firstExternal ? ['block', 'hero4x3'] : undefined}
				firstImageWidth={firstExternal ? sass.pbCoverFirstImageWidth : undefined}
				firstExternal={firstExternal}
				rowHeight={firstExternal ? sass.pb1CoverHeight : sass.p1StandardHeight}
				entryImageDetails={firstExternal ? getImageData(this.props.list.images, ['block', 'hero4x3']) : undefined}
			/>
		);
	}
}
