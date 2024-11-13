import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { connect } from 'react-redux';
import { setAppBackgroundImage } from 'shared/app/appWorkflow';
import { BREAKPOINT_RANGES } from 'ref/responsive/util/grid';
import { resolveImages, fallbackURI } from 'shared/util/images';
import Picture from 'shared/component/Picture';
import { toMedian } from 'shared/util/math';

import './ListHeader.scss';

const bem = new Bem('lh');

const tabletBreakpoint = BREAKPOINT_RANGES['tablet'];
const mediaQueryMobile = `(max-width: ${tabletBreakpoint.min - 1}px)`;
const mediaQueryDesktop = `(min-width: ${tabletBreakpoint.min}px)`;

const mobileImageWidth: number = toMedian([
	BREAKPOINT_RANGES['phone'].min,
	BREAKPOINT_RANGES['tablet'].min,
	BREAKPOINT_RANGES['laptop'].min
]);

const desktopImageWidth: number = toMedian([
	BREAKPOINT_RANGES['desktop'].min,
	BREAKPOINT_RANGES['desktopWide'].min,
	BREAKPOINT_RANGES['uhd'].min
]);

interface LhProps extends PageEntryListProps {
	updateAppBackgroundImage: (sources: image.Source[], appWallpaperCssModifier?: string) => void;
}

interface LhState {
	mobileGradient?: boolean;
	brandImageSource?: image.Source[];
	logoImage?: string;
	hasAppImage?: boolean;
}

class ListHeader extends React.Component<LhProps, LhState> {
	private description: HTMLElement;
	private gradientVisible = false;

	constructor(props) {
		super(props);

		this.state = {
			mobileGradient: false,
			brandImageSource: undefined,
			logoImage: undefined,
			hasAppImage: undefined
		};
	}

	componentWillMount() {
		this.init(this.props);
	}

	componentWillReceiveProps(nextProps: LhProps) {
		const list = nextProps.list;
		if (list !== this.props.list) this.init(nextProps);
	}

	componentDidMount() {
		window.addEventListener('resize', this.onResize, false);
		this.onResize();
	}

	componentWillUnmount() {
		this.disableResize();
		this.props.updateAppBackgroundImage(undefined);
	}

	private disableResize = () => {
		window.removeEventListener('resize', this.onResize);
	};

	private onResize = () => {
		if (this.description) window.requestAnimationFrame(this.toggleGradient);
	};

	private toggleGradient = () => {
		const textHeightCheck = this.description && this.description.offsetHeight > 95;
		if (!this.gradientVisible && textHeightCheck) {
			this.gradientVisible = true;
			this.setState({ mobileGradient: this.gradientVisible });
		} else if (this.gradientVisible && !textHeightCheck) {
			this.gradientVisible = false;
			this.setState({ mobileGradient: this.gradientVisible });
		}
	};

	private init = (props: LhProps) => {
		const { updateAppBackgroundImage, list } = props;
		if (!list) return;

		const { images } = list;

		let mobileWallpaper = resolveImages(images, 'wallpaper', {
			width: mobileImageWidth
		})[0].src;
		let desktopWallpaper = resolveImages(images, 'wallpaper', {
			width: desktopImageWidth
		})[0].src;
		let hasAppImage = false;

		if (mobileWallpaper !== fallbackURI || desktopWallpaper !== fallbackURI) {
			hasAppImage = true;
			updateAppBackgroundImage(
				[
					{
						src: mobileWallpaper,
						mediaQuery: mediaQueryMobile
					},
					{
						src: desktopWallpaper,
						mediaQuery: mediaQueryDesktop
					}
				],
				'lh'
			);
		} else {
			updateAppBackgroundImage(undefined);
		}

		this.setState({
			brandImageSource: [
				{
					src: resolveImages(images, 'brand', { width: 360, format: 'png' })[0].src,
					mediaQuery: mediaQueryMobile
				},
				{
					src: resolveImages(images, 'brand', { width: 720, format: 'png' })[0].src,
					mediaQuery: mediaQueryDesktop
				}
			],
			logoImage: resolveImages(images, 'logo', {
				width: 100,
				format: 'png'
			})[0].src,
			hasAppImage
		});
	};

	private onReference = ele => (this.description = ele);

	private onClick = e => {
		this.setState({ mobileGradient: false });
		this.disableResize();
	};

	render() {
		const { list, template } = this.props;
		if (!list) return false;

		const { mobileGradient, brandImageSource, hasAppImage, logoImage } = this.state;

		const { description, tagline, title } = list;
		const isLogoImage = logoImage !== fallbackURI;
		const isBrandedImage = brandImageSource && brandImageSource[0].src !== fallbackURI;

		return (
			<section className={cx(template.toLowerCase(), bem.b({ bg: !!hasAppImage }))}>
				<div className={bem.e('badge')}>{isLogoImage && <img src={logoImage} className={bem.e('badge-img')} />}</div>
				<div className={cx(bem.e('push'))} />
				<div className={bem.e('title-wrap')}>
					<h1
						className={cx(
							'heading-shadow',
							{ 'sr-only': isBrandedImage },
							bem.e('title', {
								'long-title': title && title.length > 20,
								'full-width': !isLogoImage
							})
						)}
					>
						{title || ''}
					</h1>
					{isBrandedImage && (
						<Picture
							src={brandImageSource[0].src}
							sources={brandImageSource}
							className={bem.e('brand-pic')}
							imageClassName={bem.e('brand-img')}
						/>
					)}
				</div>
				{tagline && <p className={bem.e('tagline')}>{tagline}</p>}
				{description && (
					<p className={bem.e('desc', { grad: mobileGradient })} ref={this.onReference} onClick={this.onClick}>
						{description || ''}
					</p>
				)}
			</section>
		);
	}
}

function mapDispatchToProps(dispatch) {
	return {
		updateAppBackgroundImage: (sources, appWallpaperCssModifier) => {
			dispatch(setAppBackgroundImage(sources, appWallpaperCssModifier));
		}
	};
}

const Component: any = connect<any, any, PageEntryListProps>(
	undefined,
	mapDispatchToProps
)(ListHeader);

export default Component;
