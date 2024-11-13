import * as React from 'react';
import Header from 'ref/responsive/app/header/Header';
import H10Text from 'ref/responsive/pageEntry/hero/h10/H10Text';
import H11PageTitle from 'ref/responsive/pageEntry/hero/h11/H11PageTitle';
import { H10Text as H10Template, H11PageTitle as H11Template } from 'shared/page/pageEntryTemplate';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import Cs5ContinuousAutomatic from 'ref/responsive/pageEntry/continuous/Cs5ContinuousAutomatic';
import { ContinuousScrollPackshotListProps } from 'ref/responsive/pageEntry/continuous/ContinuousScrollPackshotList';

import './H9.scss';

const mockH10: PageEntryTextProps = {
	text: '',
	savedState: '',
	template: H10Template,
	title: 'H10 Title Hero',
	customFields: {},
	id: 'h10'
};

const mockH11: PageEntryTextProps = {
	text: '',
	savedState: '',
	template: H11Template,
	title: 'Title of the Page',
	customFields: {},
	id: 'h11'
};

interface H10TitleState {
	template?: 'H10' | 'H11';
	hAlign?: position.AlignX;
	title?: string;
	subtitle?: string;
	titleColor?: string;
	bgColor?: string;
	bgOpacity?: number;
	list?: api.ItemList;
	showCsRow?: boolean;
	showCsFilters?: boolean;
}

export default class H10TitleComponent extends React.Component<any, H10TitleState> {
	constructor(props) {
		super(props);
		this.state = {
			template: H10Template,
			hAlign: 'left',
			title: 'Example Title Text',
			subtitle: 'Example Subheading Text',
			titleColor: '#034d76',
			bgColor: '#a7dcf9',
			bgOpacity: 100,
			showCsRow: false,
			showCsFilters: true
		};
	}

	private onChange = e => {
		let { name, value } = e.target;
		if (~name.indexOf('Opacity')) value = Number(value);
		else if (~name.indexOf('showCs')) value = !this.state[name];
		this.setState({ [name]: value });
	};

	private onListChange = list => {
		this.setState({ list });
	};

	render() {
		return (
			<div>
				{this.renderForm()}
				{this.renderHero()}
			</div>
		);
	}

	private renderForm() {
		const { template, hAlign, title, subtitle, titleColor, bgColor, bgOpacity, showCsRow, showCsFilters } = this.state;
		return (
			<div>
				<form>
					<fieldset className="fs">
						<legend>Hero:</legend>
						<div>
							<input
								id="template1"
								type="radio"
								name="template"
								value={H10Template}
								checked={template === H10Template}
								onChange={this.onChange}
							/>
							<label htmlFor="template1" className="label-inline">
								H10 Text
							</label>
							<input
								id="template2"
								type="radio"
								name="template"
								value={H11Template}
								checked={template === H11Template}
								onChange={this.onChange}
							/>
							<label htmlFor="template2" className="label-inline">
								H11 Automatic Page Title
							</label>
						</div>
						<br />
						<strong>Title Text (H10 Only):</strong>
						<input
							name="title"
							type="text"
							className="default-input"
							value={title}
							placeholder="Example Title"
							onChange={this.onChange}
							disabled={template === H11Template}
						/>
						<br />
						<strong>Optional Subheading Text (H10 Only):</strong>
						<input
							name="subtitle"
							type="text"
							className="default-input"
							value={subtitle}
							placeholder="Example Subheading"
							onChange={this.onChange}
							disabled={template === H11Template}
						/>
						<br />
						<div className="color-alpha">
							<label>
								<strong>Background Colour:</strong>
								<input
									name="bgColor"
									type="text"
									className="default-input"
									value={bgColor}
									placeholder="Hexadecimal Color (#000)"
									onChange={this.onChange}
								/>
							</label>
							<label>
								<strong>Background Opacity:</strong>
								<input
									name="bgOpacity"
									type="text"
									className="default-input"
									value={bgOpacity}
									placeholder="Color Opacity (0-100)"
									onChange={this.onChange}
								/>
							</label>
						</div>
						<br />
						<label>
							<strong>Text Colour:</strong>
							<input
								name="titleColor"
								type="text"
								className="default-input"
								value={titleColor}
								placeholder="Hexadecimal Color (#FFF)"
								onChange={this.onChange}
							/>
						</label>
						<br />
						<strong>Horizontal Alignment:</strong>
						<div>
							<input
								id="hAlign1"
								type="radio"
								name="hAlign"
								value="left"
								checked={hAlign === 'left'}
								onChange={this.onChange}
							/>
							<label htmlFor="hAlign1" className="label-inline">
								Left
							</label>
							<input
								id="hAlign2"
								type="radio"
								name="hAlign"
								value="center"
								checked={hAlign === 'center'}
								onChange={this.onChange}
							/>
							<label htmlFor="hAlign2" className="label-inline">
								Center
							</label>
							<input
								id="hAlign3"
								type="radio"
								name="hAlign"
								value="right"
								checked={hAlign === 'right'}
								onChange={this.onChange}
							/>
							<label htmlFor="hAlign3" className="label-inline">
								Right
							</label>
						</div>
					</fieldset>
				</form>
				<ListSearch
					label="Adjacent Content"
					collapsed={false}
					onListChange={this.onListChange}
					childrenPosition="above"
					className="list-search"
				>
					<div>
						<input id="showCsRow" type="checkbox" name="showCsRow" checked={showCsRow} onChange={this.onChange} />
						<label htmlFor="showCsRow" className="label-inline">
							Show Content Grid (CS5)
						</label>
						<input
							id="showCsFilters"
							type="checkbox"
							name="showCsFilters"
							checked={showCsFilters}
							disabled={!showCsRow}
							onChange={this.onChange}
						/>
						<label htmlFor="showCsFilters" className="label-inline">
							Include Sort/Filter
						</label>
						<br />
						<br />
					</div>
				</ListSearch>
			</div>
		);
	}

	private renderHero() {
		const { template, title, subtitle, titleColor, hAlign, bgColor, bgOpacity } = this.state;
		const isH10 = template === 'H10';
		const props = Object.assign({}, isH10 ? mockH10 : mockH11, {
			text: isH10 ? title : undefined,
			customFields: {
				subheading: isH10 ? subtitle : undefined,
				textColor: {
					color: titleColor,
					opacity: 100
				},
				textHorizontalAlignment: hAlign,
				backgroundColor: {
					color: bgColor,
					opacity: bgOpacity
				}
			}
		});
		return (
			<section className="hero-demo">
				<Header className="header-full-bleed" forceHeroMode />
				<div className="content">
					<div className="page-entry page-entry--hero">
						{isH10 ? <H10Text {...props} /> : <H11PageTitle {...props} />}
					</div>
					{this.renderContent()}
				</div>
			</section>
		);
	}

	private renderContent() {
		const { showCsRow, showCsFilters } = this.state;

		if (showCsRow) {
			const props: ContinuousScrollPackshotListProps = {
				id: 'list',
				title: '',
				template: 'CS5',
				list: this.state.list,
				loadNextListPage: (list: api.ItemList) => {
					return {};
				},
				loadListPage: (list: api.ItemList, pageNo: number, options?: any) => {
					return {};
				},
				savedState: {},
				customFields: { displayFilter: showCsFilters },
				queryParamsEnabled: true,
				columns: [],
				imageType: 'poster'
			};

			return <Cs5ContinuousAutomatic {...props} />;
		}

		return (
			<div className="page-entry">
				<span>This is example content indicative of where the next content row sits.</span>
				<br />
				<br />
				<ul>
					<li>
						<strong>H10</strong> supports an optional sub-heading
					</li>
					<li>
						Both <strong>H10</strong> and <strong>H11</strong> support optional colours for both the background and
						text.
					</li>
					<li>
						<strong>H11</strong> is actually just an instance of <strong>H10</strong> however it receives it's title
						from the page rather than an operator.
					</li>
				</ul>
			</div>
		);
	}
}
