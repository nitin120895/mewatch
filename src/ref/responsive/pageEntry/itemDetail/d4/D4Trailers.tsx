import * as React from 'react';
import T1Standard from '../../tile/T1Standard';
import { convertItemPropsToListProps } from '../util/itemProps';

export default class D4Trailers extends React.Component<PageEntryItemDetailProps, any> {
	constructor(props) {
		super(props);
		this.state = {
			listProps: convertItemPropsToListProps(props)
		};
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.item !== this.props.item) {
			this.setState({ listProps: convertItemPropsToListProps(nextProps) });
		}
	}

	render() {
		const { listProps } = this.state;
		if (!listProps) return false;
		return <T1Standard {...listProps} className="d4" />;
	}
}
