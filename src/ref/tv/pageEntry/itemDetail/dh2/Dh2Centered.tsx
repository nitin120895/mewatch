import * as React from 'react';
import Dh1Standard from 'ref/tv/pageEntry/itemDetail/dh1/Dh1Standard';

export default class Dh2Centered extends React.Component<PageEntryItemDetailProps, any> {
	constructor(props) {
		super(props);
	}

	render() {
		return <Dh1Standard {...this.props} align={'center'} />;
	}
}
