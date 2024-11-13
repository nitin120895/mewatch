import * as React from 'react';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import Sb1Cover from 'ref/responsive/pageEntry/square/Sb1Cover';
import S3Double from 'ref/responsive/pageEntry/square/S3Double';

const mock: PageEntryListProps = {
	list: undefined,
	loadNextListPage: (list: api.ItemList) => {
		return {};
	},
	loadListPage: (list: api.ItemList, pageNo: number, options?: any) => {
		return {};
	},
	savedState: '',
	template: 'SB1',
	title: 'SB1',
	id: 'sb1'
};

export default class Sb1CoverComponent extends React.Component<PageEntryListProps, any> {
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
						<Sb1Cover {...props} />
					</div>
					<div className="page-entry">
						<S3Double {...mock} title="S3 Double Reference" template="S3" />
					</div>
				</section>
			</main>
		);
	}
}
