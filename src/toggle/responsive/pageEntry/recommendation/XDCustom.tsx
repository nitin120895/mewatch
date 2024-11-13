import * as React from 'react';
import { convertItemPropsToListProps, CustomAssetType } from 'toggle/responsive/pageEntry/itemDetail/util/itemProps';
import T1Standard from 'ref/responsive/pageEntry/tile/T1Standard';

interface OwnProps {
	assetType: CustomAssetType;
}

export default class XDCustom extends React.Component<PageEntryItemDetailProps & OwnProps, any> {
	constructor(props) {
		super(props);
		this.state = {
			listProps: convertItemPropsToListProps(props, props.assetType)
		};
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.item !== this.props.item) {
			this.setState({ listProps: convertItemPropsToListProps(nextProps, nextProps.assetType) });
		}
	}

	render() {
		const { listProps } = this.state;

		if (!listProps) return false;
		return <T1Standard {...listProps} />;
	}
}
