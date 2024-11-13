import * as React from 'react';
import * as cx from 'classnames';
import { getListThemeColor } from 'ref/responsive/pageEntry/util/custom';
import createMockPageEntry from 'viewer/ref/page/util/mockData';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import Pb3Background from 'ref/responsive/pageEntry/poster/Pb3Background';
import Sb3Background from 'ref/responsive/pageEntry/square/Sb3Background';
import Tb3Background from 'ref/responsive/pageEntry/tile/Tb3Background';
import P1Standard from 'ref/responsive/pageEntry/poster/P1Standard';
import S3Double from 'ref/responsive/pageEntry/square/S3Double';
import T3Double from 'ref/responsive/pageEntry/tile/T3Double';

import './BrandedBackgroundComponent.scss';

const fallbackImage = 'http://lorempixel.com/720/405/nature/3/';

export default class BrandedBackgroundComponent extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = this.createMock(props.list || { items: [] });
	}

	private createMock(list) {
		const { template, title } = this.props;
		const customFields = {
			assetTitlePosition: 'none'
		};
		const brandedBackgroundMockEntry = createMockPageEntry(template, title, template, customFields);
		const mockExtras = {
			loadNextListPage: (list: api.ItemList) => {
				return {};
			},
			loadListPage: (list: api.ItemList, pageNo: number, options?: any) => {
				return {};
			},
			list
		};
		const mock: any = Object.assign({}, brandedBackgroundMockEntry, mockExtras);

		return {
			debug: {
				displayReferences: false,
				useFallback: true,
				useCustomColors: false,
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

	private onDebugChange = e => {
		let { name, value, type, checked } = e.target;
		let debug = { ...this.state.debug };
		let key = type === 'color' ? name.replace('Picker', '') : name;
		debug[key] = type === 'checkbox' ? checked : value;

		this.setState({ debug });
	};

	private onListChange = newList => {
		const list = this.applyFallback(newList);
		const mock = { ...this.state.mock, list };

		this.setState({ mock });
	};

	private updateIfUsingCustomColors(mock) {
		const { useCustomColors, backgroundColor } = this.state.debug;
		if (!useCustomColors) return mock;
		const originalBackgroundColor = getListThemeColor('Background', 'Primary', mock.list);
		const themes = [];
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

	private applyFallback(list) {
		if (!list.images) list.images = {};
		// no image, so we fall back to the cat image
		if (this.state.debug.useFallback && !list.images.tile) {
			list.images.tile = fallbackImage;
		}
		// no image, but don't use the fallback (let the component figure it out)
		if (!this.state.debug.useFallback && list.images.tile === fallbackImage) {
			list.images.tile = undefined;
		}
		return list;
	}

	private renderForm() {
		const { assetTitlePosition } = this.state.mock.customFields;
		const { displayReferences, useFallback, useCustomColors, backgroundColor } = this.state.debug;

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
					<div>
						<input
							id="useFallback"
							type="checkbox"
							name="useFallback"
							value="useFallback"
							checked={useFallback}
							onChange={this.onDebugChange}
						/>
						<label htmlFor="useFallback" className="label-inline">
							Use a fallback background image
							<span className="branded-background-viewer__help-text">(will only take effect on next list change)</span>
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
					<Pb3Background {...updatedMock} title="Poster" template="pb3" />
				</section>
				{debug.displayReferences && (
					<section className="page-entry">
						<P1Standard {...updatedMock} title="Poster P1 Reference" template="p1" />
					</section>
				)}
				<section className="page-entry">
					<Sb3Background {...updatedMock} title="Square" template="sb3" />
				</section>
				{debug.displayReferences && (
					<section className="page-entry">
						<S3Double {...updatedMock} title="Square Double Reference" template="s3" />
					</section>
				)}
				<section className="page-entry">
					<Tb3Background {...updatedMock} title="Tile" template="tb3" />
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
