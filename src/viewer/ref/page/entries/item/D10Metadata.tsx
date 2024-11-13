import * as React from 'react';
import D10Info from 'ref/responsive/pageEntry/itemDetail/d10/D10Info';
import ItemSearch from '../../../component/itemSearch/ItemSearch';

const mock: PageEntryItemDetailProps = {
	title: 'Additional Information',
	template: 'D10',
	savedState: {},
	item: undefined,
	itemDetailCache: {},
	id: 'd10'
};

export default class D10Metadata extends React.Component<PageProps, any> {
	constructor(props) {
		super(props);
		this.state = { item: undefined };
	}

	resetItem(item) {
		this.setState({ item });
	}

	render() {
		const { item } = this.state;
		return (
			<section>
				<ItemSearch resetParent={item => this.resetItem(item)} includeDetail={true} />
				{item ? <D10Info {...mock} item={item} /> : <h3>Loading...</h3>}
			</section>
		);
	}
}
