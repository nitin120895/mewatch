import * as React from 'react';
import Header from 'ref/responsive/app/header/Header';
import Ah1Poster from 'ref/responsive/pageEntry/account/ah/Ah1Poster';
import Ah2Tile from 'ref/responsive/pageEntry/account/ah/Ah2Tile';
import Ah3Text from 'ref/responsive/pageEntry/account/ah/Ah3Text';
import {
	Ah3Text as Ah3TextTemplate,
	Ah2Tile as Ah2TileTemplate,
	Ah1Poster as Ah1PosterTemplate
} from 'shared/page/pageEntryTemplate';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import A4Profiles from 'ref/responsive/pageEntry/account/a4/A4Profiles';
import createMockPageEntry from 'viewer/ref/page/util/mockData';

export default class AhComponent extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			template: Ah3TextTemplate,
			tagline: '',
			list: this.createMockList(props.list || { items: [] })
		};
	}

	private createMockList(list) {
		const props: PageEntryListProps = {
			id: '3311ac8',
			title: 'Continue Watching',
			template: 'AH',
			list: list,
			loadNextListPage: (list: api.ItemList) => {
				return {};
			},
			loadListPage: (list: api.ItemList, pageNo: number, options?: any) => {
				return {};
			},
			savedState: {}
		};
		return props;
	}

	private onChange = e => {
		let { name, value } = e.target;
		this.setState({ [name]: value });
	};

	private onListChange = list => {
		const mock = this.createMockList(list);
		this.setState({ list: mock.list });
	};

	render() {
		return (
			<div>
				{this.renderForm()}
				{this.renderAccountHero()}
			</div>
		);
	}

	private renderForm() {
		const { template, tagline } = this.state;
		return (
			<div>
				<ListSearch onListChange={this.onListChange} className="list-search" />
				<form>
					<fieldset className="fs">
						<legend>Account Hero:</legend>
						<div>
							<input
								id="template3"
								type="radio"
								name="template"
								value={Ah1PosterTemplate}
								checked={template === Ah1PosterTemplate}
								onChange={this.onChange}
							/>
							<label htmlFor="template3" className="label-inline">
								AH1 Poster (2:3)
							</label>
							<input
								id="template2"
								type="radio"
								name="template"
								value={Ah2TileTemplate}
								checked={template === Ah2TileTemplate}
								onChange={this.onChange}
							/>
							<label htmlFor="template2" className="label-inline">
								AH2 Tile (16:9)
							</label>
							<input
								id="template1"
								type="radio"
								name="template"
								value={Ah3TextTemplate}
								checked={template === Ah3TextTemplate}
								onChange={this.onChange}
							/>
							<label htmlFor="template1" className="label-inline">
								AH3 Text
							</label>
						</div>
						<br />
						<strong>Optional Tagline</strong>
						<input
							name="tagline"
							type="text"
							className="default-input"
							value={tagline}
							placeholder="Enter Tagline"
							onChange={this.onChange}
							disabled={template === Ah3TextTemplate}
						/>
						<br />
					</fieldset>
				</form>
			</div>
		);
	}

	private renderAccountHero() {
		return (
			<div className="full-bleed">
				<div className="app app--account">
					<Header forceHeroMode />
					<div className="content grid-margin">
						<div className="main">
							<div className="page">
								<section className="page-entry page-entry--hero">{this.renderTemplate()}</section>
								<section className="page-entry">{this.renderPlaceholder()}</section>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	private renderTemplate() {
		const { template, tagline } = this.state;
		const mockProfile = {
			profile: {
				info: {
					bookmarked: {},
					watched: {},
					rated: {},
					purchaseEnabled: true,
					name: 'Zahra Dargahi',
					pinEnabled: false,
					id: '2501173e-4518-4d94-85c4-4af0f14c9d2c',
					isActive: true,
					segments: [],
					marketingEnabled: true,
					pendingUpdates: []
				}
			}
		};
		const mockData: any = Object.assign({}, mockProfile, this.createMockList(this.state.list));
		const props = Object.assign({}, mockData, {
			customFields: {
				customTagline: tagline
			}
		});
		let jsx;
		switch (template) {
			case 'AH3':
				jsx = <Ah3Text {...mockData} />;
				break;
			case 'AH2':
				jsx = <Ah2Tile {...props} />;
				break;
			case 'AH1':
				jsx = <Ah1Poster {...props} />;
				break;
		}
		return jsx;
	}

	// A placeholder example of how an adjacent row looks relative to the account hero row.
	private renderPlaceholder() {
		const a4MockEmpty: any = Object.assign({}, createMockPageEntry('A4', 'Edit', 'A4'), {
			account: { info: { profiles: [] } }
		});
		return <A4Profiles {...a4MockEmpty} />;
	}
}
