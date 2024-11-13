import * as React from 'react';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import B1Standard from 'ref/responsive/pageEntry/block/B1Standard';
import B2Large from 'ref/responsive/pageEntry/block/B2Large';
import B3Double from 'ref/responsive/pageEntry/block/B3Double';

export default class B3DoubleComponent extends React.Component<any, any> {
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
			template: 'B3',
			title: 'B3',
			id: 'b3'
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
		let value = checked ? 'overlay' : 'none';
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

	render() {
		const { mock } = this.state;
		return (
			<div>
				{this.renderForm()}
				<section className="component">
					<ListSearch onListChange={this.onListChange} />
				</section>
				<section className="component">
					<strong>
						The double row stacks <em>vertically</em> then <em>horizontally</em>. Compare the item ordering against the
						references below.
					</strong>
					<div className="page-entry">
						<B3Double {...mock} />
					</div>
					<div className="page-entry">
						<B1Standard {...mock} title={'B1 Reference'} />
					</div>
					<div className="page-entry">
						<B2Large {...mock} title={'B2 Reference'} />
					</div>
				</section>
			</div>
		);
	}
}
