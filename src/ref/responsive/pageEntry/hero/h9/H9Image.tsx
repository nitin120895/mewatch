import * as React from 'react';
import Picture from 'shared/component/Picture';
import Link from 'shared/component/Link';
import { resolveImages } from 'shared/util/images';
import { BREAKPOINT_RANGES } from 'ref/responsive/util/grid';
import { resolveAlignment, resolveColor } from '../../util/custom';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { transparencyHack } from '../../util/ibc';

import './H9Image.scss';

const tabletBreakpoint = BREAKPOINT_RANGES['phablet'];
const desktopBreakpoint = BREAKPOINT_RANGES['desktop'];
const desktopWideBreakpoint = BREAKPOINT_RANGES['desktopWide'];

const mobileBp = `(max-width: ${tabletBreakpoint.min - 1}px)`;
const tabletBp = `(min-width: ${tabletBreakpoint.min}px) and (max-width: ${desktopBreakpoint.min - 1}px)`;
const desktopBp = `(min-width: ${desktopBreakpoint.max}px) and (max-width: ${desktopWideBreakpoint.min - 1}px)`;

const bem = new Bem('h9');

interface CustomFields {
	altText?: string;
	imageText?: string;
	imageWidth?: customFields.ImageLayoutPosition;
	imageHorizontalAlignment?: position.AlignX;
	textHorizontalAlignment?: position.AlignX;
	textVerticalAlignment?: position.AlignY;
	textColor: customFields.Color;
	widthPercentage?: number;
	link?: string;
}

type H9PageEntryProps = TPageEntryImageProps<CustomFields>;

export default class H9Image extends React.Component<H9PageEntryProps, any> {
	private title: HTMLElement;
	private container: HTMLElement;
	private imageLoaded = false;

	constructor(props) {
		super(props);
		this.state = this.getDefaultState(props);
	}

	componentDidMount() {
		this.updateStyles();
	}

	componentWillUpdate(nextProps: H9PageEntryProps, nextState: any) {
		if (this.props.images !== nextProps.images) {
			this.imageLoaded = false;
			this.setState(this.getDefaultState(nextProps));
		}
	}

	componentDidUpdate(prevProps: H9PageEntryProps, prevState: any) {
		if (this.props.customFields !== prevProps.customFields) {
			this.updateStyles();
		}
	}

	private getDefaultState(props: H9PageEntryProps) {
		const images = props.images;
		const types = Object.keys(images || {});
		let imageType: image.Type = undefined;
		const breakpoints = {
			mobile: undefined,
			tablet: undefined,
			desktopWide: undefined
		};

		if (types.length > 0) {
			imageType = types[0] as image.Type;
			const options = transparencyHack(imageType);
			breakpoints.mobile = resolveImages(images, imageType, {
				width: 480,
				...options
			})[0].src;
			breakpoints.tablet = resolveImages(images, imageType, {
				width: 1440,
				...options
			})[0].src;
			breakpoints.desktopWide = resolveImages(images, imageType, {
				width: 1920,
				...options
			})[0].src;
		}

		return { images: breakpoints, imageType };
	}

	private updateStyles() {
		const custom = this.props.customFields;
		const hasTitle = !!(this.title && custom.imageText);
		if (this.container) {
			const { imageWidth, widthPercentage, imageHorizontalAlignment } = custom;
			/* tslint:disable:no-null-keyword */
			if (imageWidth === 'widthPercentage') {
				this.container.style.width = `${widthPercentage}%`;
				let offset = 0;
				switch (imageHorizontalAlignment) {
					case 'left':
						offset = 0;
						break;
					case 'center':
						offset = (100 - widthPercentage) / 2;
						break;
					case 'right':
						offset = offset = 100 - widthPercentage;
						break;
				}
				this.container.style.right = offset ? `-${offset}%` : null;
			} else {
				this.container.style.width = null;
				this.container.style.right = null;
			}
			/* tslint:enable */
		}
		if (hasTitle) {
			this.title.style.color = resolveColor(custom.textColor, '#fff', true);
		}
	}

	private onImageLoaded = () => {
		this.imageLoaded = true;
		this.forceUpdate();
	};

	private onContainerRef = (ref: HTMLElement) => {
		this.container = ref;
	};

	private onTitleRef = (ref: HTMLElement) => {
		this.title = ref;
	};

	render() {
		const { imageWidth, link } = this.props.customFields;
		const { imageType } = this.state;
		const classes = cx(
			bem.b(
				imageType,
				{ 'custom-loading': imageType === 'custom' && !this.imageLoaded },
				imageWidth !== 'fullWidth' ? 'percent' : undefined
			),
			{
				'full-bleed': imageWidth === 'fullWidth'
			}
		);

		return (
			<div className={classes} ref={this.onContainerRef}>
				{!!link ? (
					<Link to={link}>
						{this.renderImage()}
						{this.renderTitle()}
					</Link>
				) : (
					[this.renderImage(), this.renderTitle()]
				)}
			</div>
		);
	}

	private renderImage() {
		const { imageHorizontalAlignment, altText } = this.props.customFields;
		const { images } = this.state;
		const sources = [
			{ src: images.mobile, mediaQuery: mobileBp },
			{ src: images.tablet, mediaQuery: tabletBp },
			{ src: images.desktopWide, mediaQuery: desktopBp }
		];
		const alignment = resolveAlignment(imageHorizontalAlignment);
		return (
			<div key="image" className={bem.e('ap', { left: alignment === 'left' })}>
				<Picture
					className={bem.e('picture')}
					src={sources[1].src}
					sources={sources}
					onLoad={this.onImageLoaded}
					description={altText}
				/>
			</div>
		);
	}

	private renderTitle() {
		const {
			imageText,
			imageWidth,
			textHorizontalAlignment: hAlign,
			textVerticalAlignment: vAlign
		} = this.props.customFields;
		const { imageType } = this.state;
		// For 7:1 we always anchor to the top because that aspect ratio doesn't allow enough room for alternate
		// vertical alignment choices. Additionally, if the title is too long the start (considered more important)
		// will stay visible while the end will be cropped.
		const isTopAligned = vAlign === 'top' || imageType === 'hero7x1';
		const classes = cx(
			bem.e('text', hAlign || 'left', imageType === 'hero7x1' ? 'top' : vAlign || 'middle'),
			`txt-${resolveAlignment(hAlign)}`,
			'heading-shadow',
			{ 'grid-margin': imageWidth === 'fullWidth' },
			{ 'header-offset': isTopAligned }
		);
		return (
			imageText && (
				<h1 key="title" className={classes} ref={this.onTitleRef}>
					{imageText}
				</h1>
			)
		);
	}
}
