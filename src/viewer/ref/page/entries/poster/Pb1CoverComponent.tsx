import * as React from 'react';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import Pb1Cover from 'ref/responsive/pageEntry/poster/Pb1Cover';
import P1Standard from 'ref/responsive/pageEntry/poster/P1Standard';

const mock: PageEntryListProps = {
	list: undefined,
	loadNextListPage: (list: api.ItemList) => {
		return {};
	},
	loadListPage: (list: api.ItemList, pageNo: number, options?: any) => {
		return {};
	},
	savedState: {},
	template: 'PB1',
	title: 'PB1',
	id: 'pb1'
};

export default class Pb1CoverComponent extends React.Component<PageEntryListProps, any> {
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
						<Pb1Cover {...props} />
					</div>
					<div className="page-entry">
						<P1Standard {...props} title="P1 Reference" template="P1" />
					</div>
				</section>
			</main>
		);
	}
}
