import * as React from 'react';
import * as cx from 'classnames';
import { getListThemeColor } from 'ref/responsive/pageEntry/util/custom';
import createMockPageEntry from 'viewer/ref/page/util/mockData';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import Pb2Text from 'ref/responsive/pageEntry/poster/Pb2Text';
import Sb2Text from 'ref/responsive/pageEntry/square/Sb2Text';
import Tb2Text from 'ref/responsive/pageEntry/tile/Tb2Text';
import P1Standard from 'ref/responsive/pageEntry/poster/P1Standard';
import S3Double from 'ref/responsive/pageEntry/square/S3Double';
import T3Double from 'ref/responsive/pageEntry/tile/T3Double';

export default class BrandedTextComponent extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = this.createMock(props.list || { items: [] });
	}

	private createMock(list) {
		const { template, title } = this.props;
		const customFields = {
			assetTitlePosition: 'none',
			autoCycle: 0,
			textHorizontalAlignment: 'left',
			textVerticalAlignment: 'bottom'
		};
		const brandedTextMockEntry = createMockPageEntry(template, title, template, customFields);
		const mockExtras = {
			loadNextListPage: (list: api.ItemList) => {
				return {};
			},
			loadListPage: (list: api.ItemList, pageNo: number, options?: any) => {
				return {};
			},
			list
		};
		const mock: any = Object.assign({}, brandedTextMockEntry, mockExtras);

		return {
			debug: {
				displayReferences: false,
				useCustomColors: false,
				textColor: '',
				backgroundColor: ''
			},
			mock
		};
	}

	private onSettingChange = e => {
		let { name, value } = e.target;
		let mock = { ...this.state.mock };
		mock.customFields[name] = value;

		this.setState({ mock });
	};

	private onListChange = list => {
		const mock = { ...this.state.mock, list };

		this.setState({ mock });
	};

	private onDebugChange = e => {
		let { name, value, type, checked } = e.target;
		let debug = { ...this.state.debug };
		let key = type === 'color' ? name.replace('Picker', '') : name;
		debug[key] = type === 'checkbox' ? checked : value;

		this.setState({ debug });
	};

	private updateIfUsingCustomColors(mock) {
		const { useCustomColors, textColor, backgroundColor } = this.state.debug;
		if (!useCustomColors) return mock;
		const originalTextColor = getListThemeColor('Text', 'Primary', mock.list);
		const originalBackgroundColor = getListThemeColor('Background', 'Primary', mock.list);
		const themes = [];
		if (textColor || originalTextColor) {
			themes.push({
				type: 'Text',
				colors: [
					{
						name: 'Primary',
						value: textColor || originalTextColor
					}
				]
			});
		}
		if (backgroundColor || originalBackgroundColor) {
			themes.push({
				type: 'Background',
				colors: [
					{
						name: 'Primary',
						value: backgroundColor || originalBackgroundColor
					}
				]
			});
		}
		const list = { ...mock.list, themes };
		return { ...mock, list };
	}

	private renderForm() {
		const { assetTitlePosition } = this.state.mock.customFields;
		const { displayReferences, useCustomColors, textColor, backgroundColor } = this.state.debug;

		return (
			<form>
				<fieldset className="fs">
					<legend>Custom Colours</legend>
					<div>
						<input
							id="useCustomColors"
							type="checkbox"
							name="useCustomColors"
							value="useCustomColors"
							checked={useCustomColors}
							onChange={this.onDebugChange}
						/>
						<label htmlFor="useCustomColors" className="label-inline">
							Use custom colours
						</label>
					</div>
					{useCustomColors && (
						<div>
							<label htmlFor="textColor">Text Colour</label>
							<div className="color-picker">
								<input
									id="textColor"
									className={cx('default-input', 'color-picker__hex', { 'is-default-color': !textColor })}
									type="text"
									name="textColor"
									value={textColor}
									onChange={this.onDebugChange}
								/>
								<input
									id="textColorPicker"
									type="color"
									className={cx('color-picker__swatch', { 'is-default-color': !textColor })}
									name="textColorPicker"
									value={textColor}
									onChange={this.onDebugChange}
								/>
							</div>
							<label htmlFor="backgroundColor">Background Colour</label>
							<div className="color-picker">
								<input
									id="backgroundColor"
									className={cx('default-input', 'color-picker__hex', { 'is-default-color': !backgroundColor })}
									type="text"
									name="backgroundColor"
									value={backgroundColor}
									onChange={this.onDebugChange}
								/>
								<input
									id="backgroundColorPicker"
									type="color"
									className={cx('color-picker__swatch', { 'is-default-color': !backgroundColor })}
									name="backgroundColorPicker"
									value={backgroundColor}
									onChange={this.onDebugChange}
								/>
							</div>
						</div>
					)}
				</fieldset>
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
					</div>
				</fieldset>
				<fieldset className="fs">
					<legend>Debug</legend>
					<div>
						<input
							id="displayReferences"
							type="checkbox"
							name="displayReferences"
							value="displayReferences"
							checked={displayReferences}
							onChange={this.onDebugChange}
						/>
						<label htmlFor="displayReferences" className="label-inline">
							Show row references
						</label>
					</div>
				</fieldset>
			</form>
		);
	}

	render() {
		const { mock, debug } = this.state;
		const updatedMock = this.updateIfUsingCustomColors(mock);

		return (
			<div>
				{this.renderForm()}
				<section className="component">
					<ListSearch onListChange={this.onListChange} />
				</section>
				<section className="page-entry">
					<Pb2Text {...updatedMock} title="Poster" />
				</section>
				{debug.displayReferences && (
					<section className="page-entry">
						<P1Standard {...updatedMock} title="Poster P1 Reference" template="p1" />
					</section>
				)}
				<section className="page-entry">
					<Sb2Text {...updatedMock} title="Square" />
				</section>
				{debug.displayReferences && (
					<section className="page-entry">
						<S3Double {...updatedMock} title="Square Double Reference" template="s3" />
					</section>
				)}
				<section className="page-entry">
					<Tb2Text {...updatedMock} title="Tile" />
				</section>
				{debug.displayReferences && (
					<section className="page-entry">
						<T3Double {...updatedMock} title="Tile Double Reference" template="t3" />
					</section>
				)}
			</div>
		);
	}
}
