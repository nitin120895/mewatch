import * as React from 'react';
import EntryList from '../../../component/EntryList';
import { createTrailersListEntry } from '../util/itemProps';
import sass from 'ref/tv/util/sass';

export default class D4Trailers extends React.Component<PageEntryItemDetailProps, any> {
	constructor(props) {
		super(props);

		this.state = {
			listProps: createTrailersListEntry(props)
		};
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.item !== this.props.item) {
			this.setState({ listProps: createTrailersListEntry(nextProps) });
		}
	}

	render() {
		return (
			<EntryList
				{...this.state.listProps}
				imageType={'tile'}
				imageWidth={sass.trailersItemWidth}
				rowType={'d4'}
				refRowType={'detail'}
				rowHeight={sass.d4Height}
			/>
		);
	}
}
