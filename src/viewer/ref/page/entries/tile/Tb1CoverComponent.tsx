import * as React from 'react';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import Tb1Cover from 'ref/responsive/pageEntry/tile/Tb1Cover';
import T3Double from 'ref/responsive/pageEntry/tile/T3Double';

const mock: PageEntryListProps = {
	list: undefined,
	loadNextListPage: (list: api.ItemList) => {
		return {};
	},
	loadListPage: (list: api.ItemList, pageNo: number, options?: any) => {
		return {};
	},
	savedState: '',
	template: 'TB1',
	title: 'TB1',
	id: 'tb1'
};

export default class Tb1CoverComponent extends React.Component<PageEntryListProps, any> {
	constructor(props) {
		super(props);
		this.state = {
			list: {
				items: []
			}
		};
	}

	private onListChange = list => {
		this.setState({ list });
	};

	render() {
		const props = Object.assign(mock, { list: this.state.list });
		return (
			<main className="component">
				<ListSearch onListChange={this.onListChange} />
				<section>
					<div className="page-entry">
						<Tb1Cover {...props} />
					</div>
					<div className="page-entry">
						<T3Double {...props} title="T3 Reference" template="T3" />
					</div>
				</section>
			</main>
		);
	}
}
