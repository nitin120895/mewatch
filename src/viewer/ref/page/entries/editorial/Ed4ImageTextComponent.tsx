import * as React from 'react';
import * as cx from 'classnames';
import { Ed4ImageText as TemplateKey } from 'shared/page/pageEntryTemplate';
import Ed4ImageText from 'ref/responsive/pageEntry/editorial/Ed4ImageText';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import P1Standard from 'ref/responsive/pageEntry/poster/P1Standard';

import './Ed4ImageTextComponent.scss';

const randomImage = 'http://lorempixel.com/1920/1080/cats';

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
			textColor: '',
			title: 'Heading',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
			textHorizontalAlignment: 'left',
			imageHorizontalAlignment: 'left',
			showReferenceRow: false
		};
	}

	private onChange = e => {
		const { name, value } = e.target;
		this.setState({ [name]: value });
	};

	private onChkChange = e => {
		const { name, checked } = e.target;
		this.setState({ [name]: checked });
	};

	private onListChange = list => {
		this.setState({ list });
	};

	private renderForm() {
		const {
			imageHorizontalAlignment,
			textHorizontalAlignment,
			textColor,
			title,
			description,
			showReferenceRow
		} = this.state;
		return (
			<form>
				<fieldset className="fs ed5-demo__debug">
					<legend>Debug</legend>
					<div>
						<input
							type="checkbox"
							id="showReferenceRow"
							name="showReferenceRow"
							checked={showReferenceRow}
							onChange={this.onChkChange}
						/>
						<label htmlFor="showReferenceRow" className="label-inline">
							Show reference row
						</label>
					</div>
					{showReferenceRow && <ListSearch onListChange={this.onListChange} />}
				</fieldset>
				<fieldset className="fs">
					<div className="col col-phone-24 col-tablet-12">
						<fieldset className="fs">
							<legend>Content</legend>
							<div>
								<label htmlFor="heading">Heading</label>
								<input
									type="text"
									id="heading"
									name="title"
									value={title}
									className="default-input"
									onChange={this.onChange}
								/>
								<br />
								<label htmlFor="description">Description</label>
								<textarea
									id="description"
									name="description"
									value={description}
									className="default-input ed4-viewer__textarea"
									onChange={this.onChange}
								/>
								<br />
								<label htmlFor="textColor">Text Colour</label>
								<div>
									<input
										id="textColor"
										className={cx('default-input', 'ed4-viewer__color-hex', { 'is-default-color': !textColor })}
										type="text"
										name="textColor"
										value={textColor}
										onChange={this.onChange}
									/>
									<input
										id="textColorPicker"
										type="color"
										className={cx('ed4-viewer__color-picker', { 'is-default-color': !textColor })}
										name="textColor"
										value={textColor}
										onChange={this.onChange}
									/>
								</div>
							</div>
							<br />
						</fieldset>
					</div>
					<div className="col col-phone-24 col-tablet-12">
						<fieldset className="fs">
							<legend>Image position</legend>
							<input
								type="radio"
								id="imagePositionLeft"
								name="imageHorizontalAlignment"
								checked={imageHorizontalAlignment === 'left'}
								value="left"
								onChange={this.onChange}
							/>
							<label htmlFor="imagePositionLeft" className="label-inline">
								Left
							</label>
							<input
								type="radio"
								id="imagePositionRight"
								name="imageHorizontalAlignment"
								checked={imageHorizontalAlignment === 'right'}
								value="right"
								onChange={this.onChange}
							/>
							<label htmlFor="imagePositionRight" className="label-inline">
								Right
							</label>
						</fieldset>
						<fieldset className="fs">
							<legend>Text align</legend>
							<input
								type="radio"
								id="textAlignLeft"
								name="textHorizontalAlignment"
								checked={textHorizontalAlignment === 'left'}
								value="left"
								onChange={this.onChange}
							/>
							<label htmlFor="textAlignLeft" className="label-inline">
								Left
							</label>
							<input
								type="radio"
								id="textAlignRight"
								name="textHorizontalAlignment"
								checked={textHorizontalAlignment === 'right'}
								value="right"
								onChange={this.onChange}
							/>
							<label htmlFor="textAlignRight" className="label-inline">
								Right
							</label>
						</fieldset>
					</div>
				</fieldset>
			</form>
		);
	}

	private renderEd4(propsBase) {
		const { textHorizontalAlignment, imageHorizontalAlignment, title, description, textColor } = this.state;
		const props = {
			...propsBase,
			images: {
				wallpaper: randomImage
			},
			customFields: {
				title,
				description,
				imageHorizontalAlignment,
				textHorizontalAlignment,
				textColor: {
					color: textColor,
					opacity: 100
				}
			}
		};

		return (
			<div className="page-entry">
				<Ed4ImageText {...props} />
			</div>
		);
	}

	private renderReferenceRow(props) {
		if (!this.state.showReferenceRow) return false;

		return (
			<div className="page-entry">
				<P1Standard
					{...props}
					template="P1"
					title="P1 Reference"
					className={this.state.hasTitle ? 'title-hidden' : ''}
				/>
			</div>
		);
	}

	render() {
		const props = Object.assign({}, mock, {
			list: this.state.list
		});
		return (
			<div>
				{this.renderForm()}
				{this.renderEd4(props)}
				{this.renderReferenceRow(props)}
			</div>
		);
	}
}
