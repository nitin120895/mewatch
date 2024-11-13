import * as React from 'react';
import Header from 'ref/responsive/app/header/Header';
import H9Image from 'ref/responsive/pageEntry/hero/h9/H9Image';
import { H9Image as TemplateKey } from 'shared/page/pageEntryTemplate';

import './H9.scss';

// Image urls
const hero3x1 = 'http://lorempixel.com/1200/400/cats/';
const hero7x1 = 'http://lorempixel.com/1024/146/cats/';
const custom = 'http://lorempixel.com/{w}/{h}/cats/';

const mock: PageEntryImageProps = {
	images: {},
	savedState: '',
	template: TemplateKey,
	title: 'H9 Image Hero',
	customFields: {},
	id: 'h9'
};

interface H9ImageState {
	imgType?: image.Type;
	imgPos?: customFields.ImageLayoutPosition;
	imgUrl?: string;
	imgUrlWidth?: number;
	imgUrlHeight?: number;
	imgWidthPercentage?: number;
	imgAlignment?: position.AlignX;
	vAlign?: position.AlignY;
	hAlign?: position.AlignX;
	title?: string;
	titleColor?: string;
}

export default class H9ImageComponent extends React.Component<any, H9ImageState> {
	constructor(props) {
		super(props);
		this.state = {
			imgType: 'hero3x1',
			imgPos: 'fullWidth',
			imgUrl: hero3x1,
			imgUrlWidth: 640,
			imgUrlHeight: 360,
			imgWidthPercentage: 70,
			imgAlignment: 'center',
			vAlign: 'top',
			hAlign: 'center',
			title: 'Example Title Text',
			titleColor: '#FFF'
		};
	}

	private onImgTypeChange = e => {
		let url = undefined;
		const target = e.target;
		const type = target.name === 'imgType' ? target.value : this.state.imgType;
		const width = target.name === 'imgWidth' ? target.value : this.state.imgUrlWidth;
		const height = target.name === 'imgHeight' ? target.value : this.state.imgUrlHeight;
		switch (type) {
			case 'hero3x1':
				url = hero3x1;
				break;
			case 'hero7x1':
				url = hero7x1;
				break;
			case 'custom':
			default:
				url = custom.replace('{w}', width).replace('{h}', height);
				break;
		}
		this.setState({
			imgType: type,
			imgUrl: url,
			imgUrlWidth: width,
			imgUrlHeight: height
		});
	};

	private onChange = e => {
		let { name, value } = e.target;
		if (name === 'imgWidthPercentage') value = Number(value);
		this.setState({ [name]: value });
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
		const {
			imgType,
			imgPos,
			imgUrlWidth,
			imgUrlHeight,
			imgWidthPercentage,
			imgAlignment,
			vAlign,
			hAlign,
			title,
			titleColor
		} = this.state;
		return (
			<form>
				<fieldset className="fs">
					<legend>Image:</legend>
					<strong>Aspect Ratio:</strong>
					<div>
						<input
							id="imgType1"
							type="radio"
							name="imgType"
							value="hero3x1"
							checked={imgType === 'hero3x1'}
							onChange={this.onImgTypeChange}
						/>
						<label htmlFor="imgType1" className="label-inline">
							3:1
						</label>
						<input
							id="imgType2"
							type="radio"
							name="imgType"
							value="hero7x1"
							checked={imgType === 'hero7x1'}
							onChange={this.onImgTypeChange}
						/>
						<label htmlFor="imgType2" className="label-inline">
							7:1
						</label>
						<input
							id="imgType3"
							type="radio"
							name="imgType"
							value="custom"
							checked={imgType === 'custom'}
							onChange={this.onImgTypeChange}
						/>
						<label htmlFor="imgType3" className="label-inline">
							Custom
						</label>
					</div>
					{imgType === 'custom' ? (
						<span>
							<br />
							<strong>Width:</strong>
							<div>
								<input
									name="imgWidth"
									type="text"
									className="default-input"
									pattern="[0-9]"
									value={imgUrlWidth}
									placeholder="Width"
									onChange={this.onImgTypeChange}
								/>
							</div>
							<strong>Height:</strong>
							<div>
								<input
									name="imgHeight"
									type="text"
									className="default-input"
									pattern="[0-9]"
									value={imgUrlHeight}
									placeholder="Height"
									onChange={this.onImgTypeChange}
								/>
							</div>
						</span>
					) : (
						false
					)}
					<br />
					<strong>Width:</strong>
					<div>
						<input
							id="imgPos1"
							type="radio"
							name="imgPos"
							value="fullWidth"
							checked={imgPos === 'fullWidth'}
							onChange={this.onChange}
						/>
						<label htmlFor="imgPos1" className="label-inline">
							Fill Viewport
						</label>
						<input
							id="imgPos2"
							type="radio"
							name="imgPos"
							value="contentWidth"
							checked={imgPos === 'contentWidth'}
							onChange={this.onChange}
						/>
						<label htmlFor="imgPos2" className="label-inline">
							Fill Content Grid
						</label>
						<input
							id="imgPos3"
							type="radio"
							name="imgPos"
							value="widthPercentage"
							checked={imgPos === 'widthPercentage'}
							onChange={this.onChange}
						/>
						<label htmlFor="imgPos3" className="label-inline">
							Percentage
						</label>
					</div>
					{imgPos === 'widthPercentage' ? (
						<span>
							<br />
							<strong>Percentage:</strong>
							<input
								name="imgWidthPercentage"
								type="text"
								className="default-input"
								pattern="[0-9]"
								value={imgWidthPercentage}
								placeholder="%"
								onChange={this.onChange}
							/>
							<br />
							<strong>Horizontal Alignment:</strong>
							<div>
								<input
									id="ihAlign1"
									type="radio"
									name="imgAlignment"
									value="left"
									checked={imgAlignment === 'left'}
									onChange={this.onChange}
								/>
								<label htmlFor="ihAlign1" className="label-inline">
									Left
								</label>
								<input
									id="ihAlign2"
									type="radio"
									name="imgAlignment"
									value="center"
									checked={imgAlignment === 'center'}
									onChange={this.onChange}
								/>
								<label htmlFor="ihAlign2" className="label-inline">
									Center
								</label>
								<input
									id="ihAlign3"
									type="radio"
									name="imgAlignment"
									value="right"
									checked={imgAlignment === 'right'}
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
				</fieldset>
				<fieldset className="fs">
					<legend>Title Text (optional):</legend>
					<input
						name="title"
						type="text"
						value={title}
						placeholder="Enter Title Text"
						className="default-input"
						onChange={this.onChange}
					/>
					<br />
					<label>
						<strong>Colour:</strong>
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
					<strong>Vertical Alignment:</strong>
					<div>
						<input
							id="vAlign1"
							type="radio"
							name="vAlign"
							value="top"
							checked={vAlign === 'top'}
							onChange={this.onChange}
						/>
						<label htmlFor="vAlign1" className="label-inline">
							Top
						</label>
						<input
							id="vAlign2"
							type="radio"
							name="vAlign"
							value="middle"
							checked={vAlign === 'middle'}
							onChange={this.onChange}
						/>
						<label htmlFor="vAlign2" className="label-inline">
							Middle
						</label>
						<input
							id="vAlign3"
							type="radio"
							name="vAlign"
							value="bottom"
							checked={vAlign === 'bottom'}
							onChange={this.onChange}
						/>
						<label htmlFor="vAlign3" className="label-inline">
							Bottom
						</label>
					</div>
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
		);
	}

	private renderHero() {
		const { title, titleColor, hAlign, vAlign, imgType, imgUrl, imgWidthPercentage, imgAlignment, imgPos } = this.state;
		const props = Object.assign({}, mock, {
			images: {
				[imgType]: imgUrl
			},
			customFields: {
				imageText: title,
				imageWidth: imgPos,
				imageHorizontalAlignment: imgAlignment,
				textColor: {
					color: titleColor,
					opacity: 100
				},
				textHorizontalAlignment: hAlign,
				textVerticalAlignment: vAlign,
				widthPercentage: imgWidthPercentage
			}
		});
		return (
			<section className="hero-demo">
				<Header className="header-full-bleed" forceHeroMode />
				<div className="content">
					<H9Image {...props} />
				</div>
			</section>
		);
	}
}
