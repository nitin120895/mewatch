import * as React from 'react';
import D3EpisodeRow, { D3EpisodeRowProps } from 'ref/responsive/pageEntry/itemDetail/d3/D3EpisodeRow';
import ItemSearch from 'viewer/ref/component/itemSearch/ItemSearch';
import { normalizeItemDetail } from 'shared/cache/itemDetailNormalizer';
import { getItem } from 'shared/service/content';

const mockEntry: D3EpisodeRowProps = {
	id: 'test',
	item: undefined,
	title: '',
	template: 'D3',
	savedState: {},
	itemDetailCache: {},
	customFields: {}
};

export default class D3EpisodeRowContainer extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			item: undefined,
			episodeDescription: false,
			seasonDescription: false,
			seasonOrder: 'ascending'
		};
	}

	private onItemSelection = item => {
		if (item.type === 'show') {
			this.getSeason(item.id);
		} else {
			console.warn(
				`Sorry, ${item.title} is a '${
					item.type
				}'. This page only supports 'show' items.\nPlease make another selection.`
			);
		}
	};

	private getSeason(showId) {
		getItem(showId, { expand: 'all', selectSeason: 'first' }).then(response => {
			this.setState({ item: response.data });
		});
	}

	private onChangeEpisodeDescription = e => {
		const episodeDescription = e.target.checked;
		this.setState({
			episodeDescription
		});
	};

	private onChangeSeasonDescription = e => {
		const seasonDescription = e.target.checked;
		this.setState({
			seasonDescription
		});
	};

	private onChangeOrder = e => {
		const seasonOrder = e.target.value;
		this.setState({
			seasonOrder
		});
	};

	render() {
		const { item } = this.state;
		return (
			<main>
				{this.renderForm()}
				<h4>Please choose TV shows. Programs are not supported.</h4>
				<p>
					<strong>Note:</strong>{' '}
					<em>only the first season is resolved. Selecting an alternate season won't load its data.</em>
				</p>
				<ItemSearch resetParent={this.onItemSelection} includeDetail={true} itemTypes={['tv']} />
				{this.renderRow(item)}
				<br />
				<br />
			</main>
		);
	}

	private renderRow(item: api.ItemDetail) {
		if (!item) return false;

		const { episodeDescription, seasonDescription, seasonOrder } = this.state;
		const itemDetailCache = normalizeItemDetail({}, { entries: [], item: item.show } as api.Page);
		const props: D3EpisodeRowProps = Object.assign(
			{},
			mockEntry,
			{ item, itemDetailCache },
			{
				customFields: {
					seasonOrder: seasonOrder,
					episodeDescription,
					seasonDescription
				}
			}
		);
		return <D3EpisodeRow {...props} />;
	}

	private renderForm() {
		const { episodeDescription, seasonDescription, seasonOrder } = this.state;
		return (
			<form className="input-toggler">
				<fieldset className="fs">
					<legend>Custom Fields:</legend>
					<div>
						<label className="label-inline">
							<input
								type="checkbox"
								name="description"
								checked={episodeDescription}
								onChange={this.onChangeEpisodeDescription}
							/>
							<span>Display Episode Descriptions</span>
						</label>
						<label className="label-inline">
							<input
								type="checkbox"
								name="description"
								checked={seasonDescription}
								onChange={this.onChangeSeasonDescription}
							/>
							<span>Display Season Description</span>
						</label>
					</div>
					<br />
					<div>
						<strong>Season Sort Order:</strong>
						<br />
						<input
							id="so1"
							type="radio"
							name="seasonOrder"
							value={'ascending'}
							checked={seasonOrder === 'ascending'}
							onChange={this.onChangeOrder}
						/>
						<label htmlFor="so1" className="label-inline">
							Oldest to Newest
						</label>
						<input
							id="so2"
							type="radio"
							name="seasonOrder"
							value={'descending'}
							checked={seasonOrder === 'descending'}
							onChange={this.onChangeOrder}
						/>
						<label htmlFor="so2" className="label-inline">
							Newest to Oldest
						</label>
					</div>
				</fieldset>
			</form>
		);
	}
}
