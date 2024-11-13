import * as React from 'react';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import T1Standard from 'ref/responsive/pageEntry/tile/T1Standard';
import T2Large from 'ref/responsive/pageEntry/tile/T2Large';
import T3Double from 'ref/responsive/pageEntry/tile/T3Double';

export default class T3DoubleComponent extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			mock: this.createMock(props.list || { items: [] })
		};
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
			template: 'T3',
			title: 'T3',
			id: 't3'
		};

		return mock;
	}

	private onListChange = list => {
		const mock = this.createMock(list);
		this.setState({ mock });
	};

	private onSettingChange = e => {
		let { name, checked } = e.target;
		let mock = this.state.mock;
		let value = checked ? 'overlay' : 'none';
		mock.customFields[name] = value;

		this.setState({ mock });
	};

	render() {
		const { mock } = this.state;
		return (
			<div>
				{this.renderForm()}
				<section className="component">
					<ListSearch onListChange={this.onListChange} />
				</section>
				{this.renderRows(mock)}
			</div>
		);
	}

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
							checked={assetTitlePosition === 'overlay'}
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

	private renderRows(mock) {
		if (mock.list.items.length > 0) {
			return (
				<section className="component">
					<strong>
						The double row stacks <em>vertically</em> then <em>horizontally</em>. Compare the item ordering against the
						reference below.
					</strong>
					<div className="page-entry">
						<T3Double {...mock} />
					</div>
					<div className="page-entry">
						<T1Standard {...mock} title="T1 Reference" template="T1" />
					</div>
					<div className="page-entry">
						<T2Large {...mock} title="T2 Reference" template="T2" />
					</div>
				</section>
			);
		}
		return false;
	}
}
