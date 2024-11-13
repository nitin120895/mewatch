import * as React from 'react';
import H7Mosaic from 'ref/tv/pageEntry/hero/h7/H7Mosaic';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';

export default class H7MosaicComponent extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			list: {
				items: []
			}
		};
	}

	private onListChange = list => {
		this.setState({ list: list });
	};

	render() {
		const mock: PageEntryListProps = {
			list: this.state.list,
			loadNextListPage: (list: api.ItemList) => {
				return {};
			},
			loadListPage: (list: api.ItemList, pageNo: number, options?: any) => {
				return {};
			},
			savedState: '',
			template: 'h7',
			title: '',
			id: 'h7'
		};
		return (
			<main className="component">
				<ListSearch onListChange={this.onListChange} />
				<h3>H7 Mosaic</h3>
				<section>
					<H7Mosaic {...mock} />
				</section>
			</main>
		);
	}
}
