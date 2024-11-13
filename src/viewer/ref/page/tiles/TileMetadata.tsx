import * as React from 'react';
import Packshot from 'ref/responsive/component/Packshot';
import { columns as columnsT1 } from 'ref/responsive/pageEntry/tile/T1Standard';
import { columns as columnsT2 } from 'ref/responsive/pageEntry/tile/T2Large';
import { columns as columnsP1 } from 'ref/responsive/pageEntry/poster/P1Standard';
import { columns as columnsP2 } from 'ref/responsive/pageEntry/poster/P2Large';
import { getColumnClasses } from 'ref/responsive/util/grid';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';

import './TileMetadata.scss';

const bem = new Bem('tile-form');

interface TileMetadataState {
	titlePosition?: AssetTitlePosition;
	item?: api.ItemSummary;
	hideImages?: boolean;
}

export default class TileMetadata extends React.Component<PageProps, TileMetadataState> {
	constructor(props) {
		super(props);
		this.state = {
			item: undefined,
			titlePosition: 'below',
			hideImages: false
		};
	}

	resetItem(item) {
		this.setState({ item });
	}

	private onTitleChange = e => {
		const titlePosition = e.target.value;
		this.setState({ titlePosition });
	};

	private onFallbackChange = e => {
		this.setState({ hideImages: e.target.checked });
	};

	render() {
		const { titlePosition, hideImages } = this.state;
		return (
			<div>
				{this.renderForm(titlePosition, hideImages)}
				{this.renderTiles(titlePosition, hideImages)}
			</div>
		);
	}

	private renderForm = (titlePosition: AssetTitlePosition, hideImages: boolean) => {
		return (
			<section>
				<p>
					Tiles can optionally display a title. If you choose to show the title you can pick between{' '}
					<span className="pre">below</span> and <span className="pre">overlay</span>, or hide it entirely with{' '}
					<span className="pre">none</span>.
				</p>
				<form className={bem.b()}>
					<fieldset className="fs">
						<legend>Item Image:</legend>
						<input id="chk1" type="checkbox" name="hideImages" checked={hideImages} onChange={this.onFallbackChange} />
						<label htmlFor="chk1" className="label-inline">
							Hide images (<em>shows fallback text if item title position is set to 'none'</em>)
						</label>
					</fieldset>
					<fieldset className="fs">
						<legend>Item Title:</legend>
						<input
							id="radio1"
							type="radio"
							name="titlePos"
							value="below"
							checked={titlePosition === 'below'}
							onChange={this.onTitleChange}
						/>
						<label htmlFor="radio1" className="label-inline">
							Under
						</label>
						<input
							id="radio2"
							type="radio"
							name="titlePos"
							value="overlay"
							checked={titlePosition === 'overlay'}
							onChange={this.onTitleChange}
						/>
						<label htmlFor="radio2" className="label-inline">
							Over
						</label>
						<input
							id="radio3"
							type="radio"
							name="titlePos"
							value="none"
							checked={titlePosition === 'none'}
							onChange={this.onTitleChange}
						/>
						<label htmlFor="radio3" className="label-inline">
							None
						</label>
					</fieldset>
				</form>
			</section>
		);
	};

	private renderTiles(titlePosition: AssetTitlePosition, hideImages: boolean) {
		return (
			<div>
				<h3 className="tileExample-sectionHeading">TV show</h3>
				<div className={cx('tileExample', getColumnClasses(columnsT1))}>
					<h4>T1 Standard tile</h4>
					<Packshot
						item={returnItemData('tvShowtile', hideImages)}
						imageType="tile"
						imageOptions={{ width: 250 }}
						titlePosition={titlePosition}
						className="col"
					/>
				</div>
				<div className={cx('tileExample', getColumnClasses(columnsT2))}>
					<h4>T2 Large tile</h4>
					<Packshot
						item={returnItemData('tvShowtile', hideImages)}
						imageType="tile"
						imageOptions={{ width: 250 }}
						titlePosition={titlePosition}
						className="col"
					/>
				</div>
				<div className={cx('tileExample', getColumnClasses(columnsP1))}>
					<h4>P1 Standard tile</h4>
					<Packshot
						item={returnItemData('tvShowPoster', hideImages)}
						imageType="poster"
						imageOptions={{ width: 250 }}
						titlePosition={titlePosition}
						className="col"
					/>
				</div>
				<div className={cx('tileExample', getColumnClasses(columnsP2))}>
					<h4>P2 Large tile</h4>
					<Packshot
						item={returnItemData('tvShowPoster', hideImages)}
						imageType="poster"
						imageOptions={{ width: 250 }}
						titlePosition={titlePosition}
						className="col"
					/>
				</div>

				<h3 className="tileExample-sectionHeading">TV episode</h3>
				<div className={cx('tileExample', getColumnClasses(columnsT1))}>
					<h4>T1 Standard tile</h4>
					<Packshot
						item={returnItemData('tvEpisodeTile', hideImages)}
						imageType="tile"
						imageOptions={{ width: 250 }}
						titlePosition={titlePosition}
						className="col"
					/>
				</div>
				<div className={cx('tileExample', getColumnClasses(columnsT2))}>
					<h4>T2 Large tile</h4>
					<Packshot
						item={returnItemData('tvEpisodeTile', hideImages)}
						imageType="tile"
						imageOptions={{ width: 250 }}
						titlePosition={titlePosition}
						className="col"
					/>
				</div>
				<div className={cx('tileExample', getColumnClasses(columnsP1))}>
					<h4>P1 Standard tile</h4>
					<Packshot
						item={returnItemData('tvEpisodePoster', hideImages)}
						imageType="poster"
						imageOptions={{ width: 250 }}
						titlePosition={titlePosition}
						className="col"
					/>
				</div>
				<div className={cx('tileExample', getColumnClasses(columnsP2))}>
					<h4>P2 Large tile</h4>
					<Packshot
						item={returnItemData('tvEpisodePoster', hideImages)}
						imageType="poster"
						imageOptions={{ width: 250 }}
						titlePosition={titlePosition}
						className="col"
					/>
				</div>

				<h3 className="tileExample-sectionHeading">Movie</h3>
				<div className={cx('tileExample', getColumnClasses(columnsT1))}>
					<h4>T1 Standard tile</h4>
					<Packshot
						item={returnItemData('movieTile', hideImages)}
						imageType="tile"
						imageOptions={{ width: 250 }}
						titlePosition={titlePosition}
						className="col"
					/>
				</div>
				<div className={cx('tileExample', getColumnClasses(columnsT2))}>
					<h4>T2 Large tile</h4>
					<Packshot
						item={returnItemData('movieTile', hideImages)}
						imageType="tile"
						imageOptions={{ width: 250 }}
						titlePosition={titlePosition}
						className="col"
					/>
				</div>
				<div className={cx('tileExample', getColumnClasses(columnsP1))}>
					<h4>P1 Standard tile</h4>
					<Packshot
						item={returnItemData('moviePoster', hideImages)}
						imageType="poster"
						imageOptions={{ width: 250 }}
						titlePosition={titlePosition}
						className="col"
					/>
				</div>
				<div className={cx('tileExample', getColumnClasses(columnsP2))}>
					<h4>P2 Large tile</h4>
					<Packshot
						item={returnItemData('moviePoster', hideImages)}
						imageType="poster"
						imageOptions={{ width: 250 }}
						titlePosition={titlePosition}
						className="col"
					/>
				</div>
			</div>
		);
	}
}

function returnItemData(itemKey, hideImages) {
	let item: api.ItemSummary;

	switch (itemKey) {
		case 'tvShowtile':
			{
				item = {
					id: '9999',
					type: 'show',
					title: 'The Blacklist',
					path: '',
					images: {
						tile:
							"https://stag.axisstatic.com/isl/api/v1/dataservice/ResizeImage/$value?Format='jpg'&Quality=85&ImageId='137480'&EntityType='Item'&EntityId='2722'&Width=3840&Height=2160&device=web_browser&subscriptions=Visitor"
					}
				};
			}
			break;

		case 'tvShowPoster':
			{
				item = {
					id: '9999',
					type: 'show',
					title: 'The Blacklist',
					path: '',
					images: {
						poster:
							"https://stag.axisstatic.com/isl/api/v1/dataservice/ResizeImage/$value?Format='jpg'&Quality=85&ImageId='137483'&EntityType='Item'&EntityId='2722'&Width=1400&Height=2100&device=web_browser&subscriptions=Visitor"
					}
				};
			}
			break;

		case 'tvEpisodeTile':
			{
				item = {
					id: '9999',
					type: 'show',
					title: 'The Blacklist: S10 E12',
					path: '',
					images: {
						tile:
							"https://stag.axisstatic.com/isl/api/v1/dataservice/ResizeImage/$value?Format='jpg'&Quality=85&ImageId='137480'&EntityType='Item'&EntityId='2722'&Width=3840&Height=2160&device=web_browser&subscriptions=Visitor"
					}
				};
			}
			break;

		case 'tvEpisodePoster':
			{
				item = {
					id: '9999',
					type: 'show',
					title: 'The Blacklist: S10 E12',
					path: '',
					images: {
						poster:
							"https://stag.axisstatic.com/isl/api/v1/dataservice/ResizeImage/$value?Format='jpg'&Quality=85&ImageId='137483'&EntityType='Item'&EntityId='2722'&Width=1400&Height=2100&device=web_browser&subscriptions=Visitor"
					}
				};
			}
			break;

		case 'movieTile':
			{
				item = {
					id: '9999',
					type: 'show',
					title: 'Star Wars: The Force Awakens',
					path: '',
					images: {
						tile:
							"https://stag.axisstatic.com/isl/api/v1/dataservice/ResizeImage/$value?Format='jpg'&Quality=85&ImageId='129591'&EntityType='Item'&EntityId='1170'&Width=1920&Height=1080&device=web_browser&subscriptions=Visitor"
					}
				};
			}
			break;

		case 'moviePoster':
			{
				item = {
					id: '9999',
					type: 'show',
					title: 'Star Wars: The Force Awakens',
					path: '',
					images: {
						poster:
							"https://stag.axisstatic.com/isl/api/v1/dataservice/ResizeImage/$value?Format='jpg'&Quality=85&ImageId='129605'&EntityType='Item'&EntityId='1170'&Width=1000&Height=1500&device=web_browser&subscriptions=Visitor"
					}
				};
			}
			break;
	}

	if (hideImages) {
		item = Object.assign({}, item, { images: [] });
	}
	return item;
}
