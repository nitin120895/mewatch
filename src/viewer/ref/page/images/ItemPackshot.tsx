import * as React from 'react';
import Packshot from 'ref/responsive/component/Packshot';
import ItemSearch from '../../component/itemSearch/ItemSearch';
import { Bem } from 'shared/util/styles';

import './ItemPackshot.scss';

const bem = new Bem('packshot-form');

interface ItemPackshotState {
	titlePosition?: AssetTitlePosition;
	item?: api.ItemSummary;
	hideImages?: boolean;
}

export default class ItemPackshot extends React.Component<PageProps, ItemPackshotState> {
	constructor(props) {
		super(props);
		this.state = {
			item: undefined,
			titlePosition: 'none',
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
		const { item, titlePosition, hideImages } = this.state;
		return (
			<div>
				<ItemSearch resetParent={item => this.resetItem(item)} />
				{this.renderForm(titlePosition, hideImages)}
				{item ? this.renderComponents(item, titlePosition, hideImages) : <h3>Loading...</h3>}
			</div>
		);
	}

	private renderForm = (titlePosition: AssetTitlePosition, hideImages: boolean) => {
		return (
			<section>
				<p>
					The <strong>Packshot</strong> component can optionally display its Item's title. If you choose to show the
					title you can pick between <span className="pre">below</span> and <span className="pre">overlay</span>, or
					hide it entirely with <span className="pre">none</span>.
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

	private renderComponents(item, titlePosition, hideImages) {
		if (!item.images) return <h3>This item has no images</h3>;

		const imageTypes = [
			'poster',
			'tile',
			'block',
			'square',
			'wallpaper',
			'hero7x1',
			'hero3x1',
			'hero4x3',
			'tall',
			'custom'
		];
		let imagesArray = [];
		for (let i = 0; i < imageTypes.length; i++) {
			if (item.images.hasOwnProperty(imageTypes[i])) {
				imagesArray.push(imageTypes[i]);
			}
		}
		if (hideImages) {
			item = Object.assign({}, item, { images: [] });
		}
		return (
			<div>
				{imagesArray.map((imageType, index) => (
					<div key={index} className="example">
						<h3 className="capitalize">{`${imageType} ${getAspectRatioLabel(imageType)}`}</h3>
						<Packshot
							item={item}
							imageType={imageType}
							imageOptions={{ width: 250 }}
							titlePosition={titlePosition}
							className="col"
						/>
					</div>
				))}
			</div>
		);
	}
}

function getAspectRatioLabel(type: image.Type): string {
	let ratio;
	switch (type) {
		case 'poster':
			ratio = '2:3';
			break;
		case 'tile':
		case 'wallpaper':
			ratio = '16:9';
			break;
		case 'square':
			ratio = '1:1';
			break;
		case 'block':
		case 'hero4x3':
			ratio = '4:3';
			break;
		case 'hero3x1':
			ratio = '3:1';
			break;
		case 'hero7x1':
			ratio = '7:1';
			break;
		case 'tall':
			ratio = '1:2';
			break;
		case 'brand':
		case 'badge':
		case 'logo':
		case 'icon':
		case 'custom':
		default:
			ratio = '';
	}
	return ratio;
}
