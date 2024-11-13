import * as React from 'react';
import Ed1Image from 'ref/responsive/pageEntry/editorial/Ed1Image';
import { Ed1Image as TemplateKey } from 'shared/page/pageEntryTemplate';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import CollapsibleFieldSet from 'viewer/ui/CollapsibleFieldSet';
import P1Standard from 'ref/responsive/pageEntry/poster/P1Standard';
import * as cx from 'classnames';

import './Ed1ImageComponent.scss';

const hero3x1 = 'https://qa2-admin.massiveaxis.com/core/media.ashx?mediaID=128578';

const mock: any = {
	images: {},
	list: undefined,
	savedState: {},
	template: TemplateKey,
	title: '',
	customFields: {},
	id: '',
	loadNextListPage: (list: api.ItemList) => {
		return {};
	},
	loadListPage: (list: api.ItemList, pageNo: number, options?: any) => {
		return {};
	}
};

export default class Ed1ImageComponent extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			showReferenceRows: false,
			imgType: 'hero3x1',
			imageWidth: 'fullWidth',
			imgUrl: hero3x1,
			altText: 'I am alt text',
			caption: 'Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor',
			widthPercentage: 70,
			imageHorizontalAlignment: 'center',
			customTagline: 'fullWidth',
			imageVerticalSpacing: 'default',
			link: 'http://google.com',
			title: 'ED1 IMAGE',
			hasTitle: false
		};
	}

	private onChange = e => {
		let { name, value } = e.target;
		if (name === 'widthPercentage') value = Number(value);
		const state: any = { [name]: value };
		if (name === 'imageVerticalSpacing') {
			// `imageVerticalSpacing` requires adjacent content to demonstrate how it works
			state.showReferenceRows = value !== 'default';
		}
		this.setState(state);
	};

	private onChkChange = e => {
		let { name, checked } = e.target;
		this.setState({ [name]: checked });
	};

	private onListChange = list => {
		this.setState({ list });
	};

	render() {
		const { list, hasTitle, showReferenceRows } = this.state;
		const refProps = showReferenceRows
			? Object.assign({}, mock, {
					list,
					template: 'P1',
					title: 'P1 Reference',
					className: hasTitle ? 'row-title-hidden' : ''
			  })
			: undefined;
		return (
			<div>
				<ListSearch label="Adjacent Content Data" onListChange={this.onListChange} />
				{this.renderForm()}
				{this.renderReferenceRow(refProps)}
				{this.renderEd1()}
				{this.renderReferenceRow(refProps)}
			</div>
		);
	}

	private renderReferenceRow(props: any) {
		if (!props) return false;
		return (
			<div className="page-entry">
				<P1Standard {...props} />
			</div>
		);
	}

	private renderForm() {
		return (
			<form>
				{this.renderMetadataFormGroup()}
				{this.renderLayoutFormGroup()}
			</form>
		);
	}

	private renderMetadataFormGroup() {
		const { title, customTagline, caption, link } = this.state;
		return (
			<CollapsibleFieldSet label="Metadata" collapsed={true}>
				<strong>Row Title:</strong>
				<div>
					<input
						name="title"
						type="text"
						value={title}
						placeholder="Enter Title"
						className="default-input"
						onChange={this.onChange}
					/>
				</div>
				<br />
				<strong>Tagline:</strong>
				<div>
					<input
						name="customTagline"
						type="text"
						value={customTagline}
						placeholder="Enter Tagline"
						className="default-input"
						onChange={this.onChange}
					/>
				</div>
				<br />
				<strong>Caption:</strong>
				<div>
					<input
						name="caption"
						type="text"
						value={caption}
						placeholder="Enter Caption"
						className="default-input"
						onChange={this.onChange}
					/>
				</div>
				<br />
				<strong>Destination URL:</strong>
				<div>
					<input
						name="link"
						type="text"
						value={link}
						placeholder="Destination URL"
						className="default-input"
						onChange={this.onChange}
					/>
				</div>
			</CollapsibleFieldSet>
		);
	}

	private renderLayoutFormGroup() {
		const {
			imageWidth,
			widthPercentage,
			imageHorizontalAlignment,
			imageVerticalSpacing,
			showReferenceRows,
			hasTitle
		} = this.state;
		return (
			<CollapsibleFieldSet label="Layout">
				<strong>Width:</strong>
				<div>
					<input
						id="imgPos1"
						type="radio"
						name="imageWidth"
						value="fullWidth"
						checked={imageWidth === 'fullWidth'}
						onChange={this.onChange}
					/>
					<label htmlFor="imgPos1" className="label-inline">
						Fill Viewport
					</label>
					<input
						id="imgPos2"
						type="radio"
						name="imageWidth"
						value="contentWidth"
						checked={imageWidth === 'contentWidth'}
						onChange={this.onChange}
					/>
					<label htmlFor="imgPos2" className="label-inline">
						Fill Content Grid
					</label>
					<input
						id="imgPos3"
						type="radio"
						name="imageWidth"
						value="widthPercentage"
						checked={imageWidth === 'widthPercentage'}
						onChange={this.onChange}
					/>
					<label htmlFor="imgPos3" className="label-inline">
						Percentage
					</label>
				</div>
				{imageWidth === 'widthPercentage' ? (
					<span>
						<br />
						<strong>Percentage:</strong>
						<input
							name="widthPercentage"
							type="text"
							className="default-input"
							pattern="[0-9]"
							value={widthPercentage}
							placeholder="%"
							onChange={this.onChange}
						/>
						<br />
						<strong>Horizontal Alignment:</strong>
						<div>
							<input
								id="ihAlign1"
								type="radio"
								name="imageHorizontalAlignment"
								value="left"
								checked={imageHorizontalAlignment === 'left'}
								onChange={this.onChange}
							/>
							<label htmlFor="ihAlign1" className="label-inline">
								Left
							</label>
							<input
								id="ihAlign2"
								type="radio"
								name="imageHorizontalAlignment"
								value="center"
								checked={imageHorizontalAlignment === 'center'}
								onChange={this.onChange}
							/>
							<label htmlFor="ihAlign2" className="label-inline">
								Center
							</label>
							<input
								id="ihAlign3"
								type="radio"
								name="imageHorizontalAlignment"
								value="right"
								checked={imageHorizontalAlignment === 'right'}
								onChange={this.onChange}
							/>
							<label htmlFor="ihAlign3" className="label-inline">
								Right
							</label>
						</div>
					</span>
				) : (
					false
				)}
				<br />
				<strong>Adjacent Content:</strong>
				<br />
				<label className="form-group">
					<input
						type="checkbox"
						name="showReferenceRows"
						value={showReferenceRows}
						checked={showReferenceRows}
						disabled={imageVerticalSpacing !== 'default'}
						onChange={this.onChkChange}
					/>
					Show Reference Rows
				</label>
				<br />
				<label className="form-group">
					<input type="checkbox" name="hasTitle" value={hasTitle} checked={hasTitle} onChange={this.onChkChange} />
					Hide Row Titles
				</label>
				<br />
				<br />
				<strong>Vertical Spacing:</strong>
				<select name="imageVerticalSpacing" value={imageVerticalSpacing} onChange={this.onChange}>
					<option value="default">Default</option>
					<option value="ignoreTop">Ignore Top</option>
					<option value="ignoreBottom">Ignore Bottom</option>
					<option value="ignoreBoth">Ignore Both</option>
				</select>
			</CollapsibleFieldSet>
		);
	}

	private renderEd1() {
		const {
			hasTitle,
			imageWidth,
			imageHorizontalAlignment,
			widthPercentage,
			imgType,
			imgUrl,
			altText,
			caption,
			customTagline,
			imageVerticalSpacing,
			link,
			title
		} = this.state;
		const props = Object.assign({}, mock, {
			images: {
				[imgType]: imgUrl
			},
			customFields: {
				altText,
				caption,
				customTagline,
				imageWidth,
				imageHorizontalAlignment,
				imageVerticalSpacing,
				link,
				widthPercentage,
				title
			}
		});
		return (
			<div className={cx(hasTitle ? 'row-title-hidden' : '', 'page-entry')}>
				<Ed1Image {...props} title={title} />
			</div>
		);
	}
}
