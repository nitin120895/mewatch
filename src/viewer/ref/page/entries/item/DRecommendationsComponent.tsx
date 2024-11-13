import * as React from 'react';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import D5RecommendationsTile from 'ref/responsive/pageEntry/itemDetail/d5/D5RecommendationsTile';
import D6RecommendationsPoster from 'ref/responsive/pageEntry/itemDetail/d6/D6RecommendationsPoster';
import D7RecommendationsSquare from 'ref/responsive/pageEntry/itemDetail/d7/D7RecommendationsSquare';

export default class DRecommendationsComponent extends React.Component<any, any> {
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
			title: 'D - Recommendations',
			template: 'D5',
			id: 'd5'
		};

		return { mock };
	}

	private onListChange = list => {
		const mock = this.createMock(list);
		this.setState(mock);
	};

	private onSettingChange = e => {
		let { name, value } = e.target;
		let mock = { ...this.state.mock };
		mock.customFields[name] = value;

		this.setState({ mock });
	};

	private renderForm() {
		const { assetTitlePosition } = this.state.mock.customFields;

		return (
			<form>
				<fieldset className="fs">
					<legend>Asset Title Position</legend>
					<div>
						<input
							id="assetTitlePositionNone"
							type="radio"
							name="assetTitlePosition"
							value="none"
							checked={assetTitlePosition === 'none'}
							onChange={this.onSettingChange}
						/>
						<label htmlFor="assetTitlePositionNone" className="label-inline">
							None
						</label>
						<input
							id="assetTitlePositionOverlay"
							type="radio"
							name="assetTitlePosition"
							value="overlay"
							checked={assetTitlePosition === 'overlay'}
							onChange={this.onSettingChange}
						/>
						<label htmlFor="assetTitlePositionOverlay" className="label-inline">
							Overlay
						</label>
						<input
							id="assetTitlePositionBelow"
							type="radio"
							name="assetTitlePosition"
							value="below"
							checked={assetTitlePosition === 'below'}
							onChange={this.onSettingChange}
						/>
						<label htmlFor="assetTitlePositionBelow" className="label-inline">
							Below
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
						<D5RecommendationsTile {...mock} title="D5 - Recommendations Tile" template="D5" />
					</div>
				</section>
				<section className="component">
					<div className="page-entry">
						<D6RecommendationsPoster {...mock} title="D6 - Recommendations Poster" template="D6" />
					</div>
				</section>
				<section className="component">
					<div className="page-entry">
						<D7RecommendationsSquare {...mock} title="D7 - Recommendations Square" template="D7" />
					</div>
				</section>
			</div>
		);
	}
}
