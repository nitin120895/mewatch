import * as React from 'react';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import B1Standard from 'ref/responsive/pageEntry/block/B1Standard';

export default class B1StandardComponent extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = this.createMock(props.list || { items: [] });
	}

	private createMock(list) {
		const mock: PageEntryListProps = {
			list: list,
			customFields: {
				assetTitlePosition: 'none'
			},
			loadNextListPage: (list: api.ItemList) => {
				return {};
			},
			loadListPage: (list: api.ItemList, pageNo: number, options?: any) => {
				return {};
			},
			savedState: {},
			template: 'B1',
			title: 'B1 - Standard',
			id: 'b1'
		};

		return { mock };
	}

	private onListChange = list => {
		const mock = this.createMock(list);
		this.setState(mock);
	};

	private onSettingChange = e => {
		let { name, checked } = e.target;
		let mock = this.state.mock;
		let value = checked ? 'below' : 'none';
		mock.customFields[name] = value;

		this.setState({ mock });
	};

	private renderForm() {
		const { assetTitlePosition } = this.state.mock.customFields;

		return (
			<form>
				<fieldset className="fs">
					<legend>Settings:</legend>
					<div>
						<input
							id="titleposition1"
							type="checkbox"
							name="assetTitlePosition"
							value={'assetTitlePosition'}
							checked={assetTitlePosition === 'below'}
							onChange={this.onSettingChange}
						/>
						<label htmlFor="titleposition1" className="label-inline">
							Display asset title
						</label>
					</div>
				</fieldset>
			</form>
		);
	}

	render() {
		const { mock } = this.state;
		return (
			<div>
				{this.renderForm()}
				<section className="component">
					<ListSearch onListChange={this.onListChange} />
				</section>
				<section className="component">
					<div className="page-entry">
						<B1Standard {...mock} />
					</div>
				</section>
			</div>
		);
	}
}
