import * as React from 'react';
import * as cx from 'classnames';
import { Ed5Button as TemplateKey } from 'shared/page/pageEntryTemplate';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import Ed5Button from 'ref/responsive/pageEntry/editorial/Ed5Button';
import P1Standard from 'ref/responsive/pageEntry/poster/P1Standard';

import './Ed5ButtonComponent.scss';

const mock: any = {
	list: undefined,
	savedState: {},
	template: TemplateKey,
	title: '',
	customFields: {
		title: 'Label',
		moreLinkUrl: 'http://massive.co/',
		textColor: {
			color: '',
			opacity: 100
		},
		backgroundColor: {
			color: '',
			opacity: 100
		},
		textHorizontalAlignment: 'center'
	},
	id: 'ed5',
	loadNextListPage: (list: api.ItemList) => {
		return {};
	},
	loadListPage: (list: api.ItemList, pageNo: number, options?: any) => {
		return {};
	}
};

export default class Ed5ButtonComponent extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			mock: this.createMock(props.list || { items: [] }),
			title: 'Label',
			moreLinkUrl: 'http://massive.co/',
			textColor: '',
			backgroundColor: '',
			textHorizontalAlignment: 'center',
			showRowsAboveAndBelow: false
		};
	}

	private createMock(list) {
		return Object.assign({}, mock, {
			list
		});
	}

	private onChange = e => {
		let { name, value } = e.target;
		this.setState({ [name]: value });
	};

	private onChkChange = e => {
		let { name, checked } = e.target;
		this.setState({ [name]: checked });
	};

	private onListChange = list => {
		const mock = { ...this.state.mock, list };
		this.setState({ mock });
	};

	private renderForm() {
		const {
			title,
			moreLinkUrl,
			textColor,
			backgroundColor,
			showRowsAboveAndBelow,
			textHorizontalAlignment
		} = this.state;
		return (
			<form>
				<fieldset className="fs">
					<legend>Custom Fields</legend>
					<div className="ed5-demo__settings-col">
						<div>
							<label htmlFor="btnLabel">Label</label>
							<input
								id="btnLabel"
								className="default-input"
								type="text"
								name="title"
								value={title}
								onChange={this.onChange}
							/>
						</div>
						<br />
						<div>
							<label htmlFor="btnLinkUrl">Link URL</label>
							<input
								id="btnLinkUrl"
								className="default-input"
								type="text"
								name="moreLinkUrl"
								value={moreLinkUrl}
								onChange={this.onChange}
							/>
						</div>
						<br />
					</div>
					<div className="ed5-demo__settings-col">
						<label htmlFor="btnTextColor">Text Colour</label>
						<div>
							<input
								id="btnTextColor"
								className={cx('default-input', 'ed5-demo__color-hex', { 'is-default-color': !textColor })}
								type="text"
								name="textColor"
								value={textColor}
								onChange={this.onChange}
							/>
							<input
								id="btnTextColorPicker"
								type="color"
								className={cx('ed5-demo__color-picker', { 'is-default-color': !textColor })}
								name="textColor"
								value={textColor}
								onChange={this.onChange}
							/>
						</div>
						<br />
						<label htmlFor="btnBackgroundColor">Background Colour</label>
						<div>
							<input
								id="btnBackgroundColor"
								className={cx('default-input', 'ed5-demo__color-hex', { 'is-default-color': !backgroundColor })}
								type="text"
								name="backgroundColor"
								value={backgroundColor}
								onChange={this.onChange}
							/>
							<input
								id="btnBackgroundColorPicker"
								type="color"
								className={cx('ed5-demo__color-picker', { 'is-default-color': !backgroundColor })}
								name="backgroundColor"
								value={backgroundColor}
								onChange={this.onChange}
							/>
						</div>
						<br />
					</div>
					<div className="col col-24">
						<p>If no custom colour is specified, the default colourscheme for the button is applied.</p>
					</div>
				</fieldset>
				<fieldset className="fs">
					<legend>Button Alignment</legend>
					<input
						type="radio"
						id="textPositionLeft"
						name="textHorizontalAlignment"
						checked={textHorizontalAlignment === 'left'}
						value="left"
						onChange={this.onChange}
					/>
					<label htmlFor="textPositionLeft" className="label-inline">
						Left
					</label>
					<input
						type="radio"
						id="textPositionCenter"
						name="textHorizontalAlignment"
						checked={textHorizontalAlignment === 'center'}
						value="center"
						onChange={this.onChange}
					/>
					<label htmlFor="textPositionCenter" className="label-inline">
						Center
					</label>
					<input
						type="radio"
						id="textPositionRight"
						name="textHorizontalAlignment"
						checked={textHorizontalAlignment === 'right'}
						value="right"
						onChange={this.onChange}
					/>
					<label htmlFor="textPositionRight" className="label-inline">
						Right
					</label>
				</fieldset>
				<fieldset className="fs ed5-demo__debug">
					<legend>Debug</legend>
					<div>
						<input
							type="checkbox"
							id="showRowsAboveAndBelow"
							name="showRowsAboveAndBelow"
							checked={showRowsAboveAndBelow}
							onChange={this.onChkChange}
						/>
						<label htmlFor="showRowsAboveAndBelow" className="label-inline">
							Add surrounding rows
						</label>
					</div>
					{showRowsAboveAndBelow && <ListSearch onListChange={this.onListChange} />}
				</fieldset>
			</form>
		);
	}

	private renderEd5() {
		const { title, moreLinkUrl, textColor, backgroundColor, textHorizontalAlignment } = this.state;
		const props = Object.assign({}, mock, {
			list: this.state.list,
			customFields: {
				title,
				moreLinkUrl,
				textColor: {
					color: textColor,
					opacity: 100
				},
				backgroundColor: {
					color: backgroundColor,
					opacity: 100
				},
				textHorizontalAlignment
			}
		});
		return (
			<div className="page-entry">
				<Ed5Button {...props} />
			</div>
		);
	}

	private renderSurroundingRow() {
		if (!this.state.showRowsAboveAndBelow) return false;
		return (
			<div className="page-entry">
				<P1Standard {...this.state.mock} title="P1 Reference" template="p1" />
			</div>
		);
	}

	render() {
		return (
			<div>
				{this.renderForm()}
				{this.renderSurroundingRow()}
				{this.renderEd5()}
				{this.renderSurroundingRow()}
			</div>
		);
	}
}
