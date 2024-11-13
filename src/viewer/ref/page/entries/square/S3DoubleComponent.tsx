import * as React from 'react';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import S1Standard from 'ref/responsive/pageEntry/square/S1Standard';
import S2Large from 'ref/responsive/pageEntry/square/S2Large';
import S3Double from 'ref/responsive/pageEntry/square/S3Double';

export default class S3DoubleComponent extends React.Component<any, any> {
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
			template: '',
			title: 'S3',
			id: 's3'
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
						<S3Double {...mock} />
					</div>
					<div className="page-entry">
						<S1Standard {...mock} title={'S1 Reference'} />
					</div>
					<div className="page-entry">
						<S2Large {...mock} title={'S2 Reference'} />
					</div>
				</section>
			</div>
		);
	}
}
