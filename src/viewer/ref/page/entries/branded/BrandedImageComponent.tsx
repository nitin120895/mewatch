import * as React from 'react';
import * as cx from 'classnames';
import { getListThemeColor } from 'ref/responsive/pageEntry/util/custom';
import createMockPageEntry from 'viewer/ref/page/util/mockData';
import ListSearch from 'viewer/ref/component/listSearch/ListSearch';
import Pb4Image from 'ref/responsive/pageEntry/poster/Pb4Image';
import Sb4Image from 'ref/responsive/pageEntry/square/Sb4Image';
import Tb4Image from 'ref/responsive/pageEntry/tile/Tb4Image';
import P1Standard from 'ref/responsive/pageEntry/poster/P1Standard';
import S3Double from 'ref/responsive/pageEntry/square/S3Double';
import T3Double from 'ref/responsive/pageEntry/tile/T3Double';

import './BrandedImageComponent.scss';

const fallbackImage = {
	wallpaper: 'http://lorempixel.com/720/405/nature/3/',
	custom: require('./fallbackImage.png')
};

export default class BrandedImageComponent extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = this.createMock(props.list || { items: [] });
	}

	private createMock(list) {
		const { template, title } = this.props;
		const customFields = {
			assetTitlePosition: 'none',
			breakoutTop: 'inset',
			breakoutBottom: 'inset',
			breakoutLeft: 'inset'
		};
		const brandedImageMockEntry = createMockPageEntry(template, title, template, customFields);
		const mockExtras = {
			loadNextListPage: (list: api.ItemList) => {
				return {};
			},
			loadListPage: (list: api.ItemList, pageNo: number, options?: any) => {
				return {};
			},
			list
		};
		const mock: any = Object.assign({}, brandedImageMockEntry, mockExtras);

		return {
			// debug function for component viewer only
			debug: {
				displayGrid: false,
				displayReferences: false,
				displayTagline: true,
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
		if (this.state.debug.useFallback && !list.images.wallpaper) {
			list.images.wallpaper = fallbackImage.wallpaper;
		}
		if (this.state.debug.useFallback && !list.images.custom) {
			list.images.custom = fallbackImage.custom;
		}
		// no image, but don't use the fallback (let the component figure it out)
		if (!this.state.debug.useFallback && list.images.wallpaper === fallbackImage.wallpaper) {
			list.images.wallpaper = undefined;
		}
		if (!this.state.debug.useFallback && list.images.custom === fallbackImage.custom) {
			list.images.custom = undefined;
		}
		return list;
	}

	private renderForm() {
		const { assetTitlePosition, breakoutTop, breakoutBottom, breakoutLeft } = this.state.mock.customFields;
		const {
			displayGrid,
			displayReferences,
			displayTagline,
			useFallback,
			useCustomColors,
			backgroundColor
		} = this.state.debug;

		return (
			<form className="clearfix">
				<div className="col col-phone-24 col-tablet-12">
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
					{this.renderBreakoutSelector('Top', breakoutTop)}
					{this.renderBreakoutSelector('Bottom', breakoutBottom)}
					{this.renderBreakoutSelector('Left', breakoutLeft)}
				</div>
				<div className="col col-phone-24 col-tablet-12">
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
								id="displayGrid"
								type="checkbox"
								name="displayGrid"
								value="displayGrid"
								checked={displayGrid}
								onChange={this.onDebugChange}
								disabled={!this.state.mock.list.images || !this.state.mock.list.images.custom}
							/>
							<label htmlFor="displayGrid" className="label-inline">
								Show breakout grid
							</label>
						</div>
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
								id="displayTagline"
								type="checkbox"
								name="displayTagline"
								value="displayTagline"
								checked={displayTagline}
								onChange={this.onDebugChange}
							/>
							<label htmlFor="displayTagline" className="label-inline">
								Show tagline
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
								Use fallback images
								<span className="branded-image-viewer__help-text">(will only take effect on next list change)</span>
							</label>
						</div>
					</fieldset>
				</div>
			</form>
		);
	}

	private renderBreakoutSelector(breakoutLabel, breakoutType) {
		return (
			<fieldset className="fs" disabled={!this.state.mock.list.images || !this.state.mock.list.images.custom}>
				<legend>Breakout {breakoutLabel}</legend>
				<div>
					<input
						id={`breakout${breakoutLabel}Inset`}
						type="radio"
						name={`breakout${breakoutLabel}`}
						value="inset"
						checked={breakoutType === 'inset'}
						onChange={this.onSettingChange}
					/>
					<label htmlFor={`breakout${breakoutLabel}Inset`} className="label-inline">
						Inset
					</label>
					<input
						id={`breakout${breakoutLabel}Edge`}
						type="radio"
						name={`breakout${breakoutLabel}`}
						value="edge"
						checked={breakoutType === 'edge'}
						onChange={this.onSettingChange}
					/>
					<label htmlFor={`breakout${breakoutLabel}Edge`} className="label-inline">
						Edge
					</label>
					<input
						id={`breakout${breakoutLabel}Outset`}
						type="radio"
						name={`breakout${breakoutLabel}`}
						value="outset"
						checked={breakoutType === 'outset'}
						onChange={this.onSettingChange}
					/>
					<label htmlFor={`breakout${breakoutLabel}Outset`} className="label-inline">
						Outset
					</label>
				</div>
			</fieldset>
		);
	}

	render() {
		const { mock, debug } = this.state;
		const displayGrid = debug.displayGrid && this.state.mock.list.images && this.state.mock.list.images.custom;
		mock.customFields.customTagline = debug.displayTagline
			? `Breakout: top ${mock.customFields.breakoutTop}, bottom ${mock.customFields.breakoutBottom}, left ${
					mock.customFields.breakoutLeft
			  }`
			: '';
		const updatedMock = this.updateIfUsingCustomColors(mock);
		return (
			<div className={cx('branded-image-viewer', { 'display-grid': displayGrid })}>
				{this.renderForm()}
				<section className="component">
					<ListSearch onListChange={this.onListChange} />
				</section>
				<section className="page-entry">
					<Pb4Image {...updatedMock} title="Poster" template="pb4" />
				</section>
				{debug.displayReferences && (
					<section className="page-entry">
						<P1Standard {...updatedMock} title="Poster P1 Reference" template="p1" />
					</section>
				)}
				<section className="page-entry">
					<Sb4Image {...updatedMock} title="Square" template="sb4" />
				</section>
				{debug.displayReferences && (
					<section className="page-entry">
						<S3Double {...updatedMock} title="Square Double Reference" template="s3" />
					</section>
				)}
				<section className="page-entry">
					<Tb4Image {...updatedMock} title="Tile" template="tb4" />
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
