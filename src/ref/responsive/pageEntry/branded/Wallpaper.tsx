import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import Image from 'shared/component/Image';

import './Wallpaper.scss';

const bem = new Bem('wallpaper');
const DEFAULT_GRADIENT_COLOR = '#262626';
const MIN_FADE_OPACITY = 0.5;
const SCROLL_CUTOFF_DISTANCE = 1000;

interface WallpaperInterface {
	id: string;
	img: image.Resource;
	gradientColor?: string;
	scrollLeft?: number;
	useTransition?: boolean;
}

export default class Wallpaper extends React.Component<WallpaperInterface, any> {
	private background: HTMLElement;
	private customImg: HTMLElement;
	private wallpaper: HTMLElement;

	componentDidMount() {
		this.updateBackground(this.props.img);
	}

	componentDidUpdate(prevProps) {
		if (this.props.img !== prevProps.img) this.updateBackground(this.props.img);
		if (this.props.scrollLeft !== prevProps.scroll) this.updatePosition(this.props.scrollLeft);
	}

	private updateBackground = url => {
		if (this.background) this.background.style.backgroundImage = `url("${url}")`;
	};

	private updatePosition(scrollLeft) {
		window.requestAnimationFrame(() => {
			this.setCustomImageOpacityAndScroll(scrollLeft);
			this.setBackgroundOpacityAndScroll(scrollLeft);
		});
	}

	private setCustomImageOpacityAndScroll(scrollLeft) {
		if (!this.customImg) return;
		const minimumScroll = 0;
		const opacity = Math.max(MIN_FADE_OPACITY, 1 - scrollLeft / SCROLL_CUTOFF_DISTANCE);
		// const scroll = 100 - 100 * Math.max(minimumScroll, 1 - scrollLeft / SCROLL_CUTOFF_DISTANCE);

		const scroll = Math.min(Math.max(minimumScroll, scrollLeft * 100), SCROLL_CUTOFF_DISTANCE);

		this.customImg.style.opacity = `${opacity}`;
		this.customImg.style.transform = `translateX(-${scroll}%)`;
	}

	private setBackgroundOpacityAndScroll(scrollLeft) {
		if (!this.wallpaper) return;
		const minimumScroll = 0.75;
		const opacity = Math.max(MIN_FADE_OPACITY, 1 - scrollLeft / (SCROLL_CUTOFF_DISTANCE / 2));
		const scroll = Math.min(Math.max(minimumScroll, scrollLeft * 50), SCROLL_CUTOFF_DISTANCE / 2);

		this.wallpaper.style.transform = `translateX(-${scroll}%)`;
		this.wallpaper.style.opacity = `${opacity}`;
	}

	private renderGradient(orientation) {
		const { id, gradientColor } = this.props;
		const isVerticalGradient = orientation === 'vertical';
		const y1 = isVerticalGradient ? 0 : 0.5;
		const x2 = isVerticalGradient ? 0 : 1;
		const y2 = isVerticalGradient ? 1 : 0.5;

		return (
			<svg className={cx(bem.e('gradient', orientation))}>
				<defs>
					<linearGradient id={`${id}-${orientation}`} gradientUnits="objectBoundingBox" x1="0" y1={y1} x2={x2} y2={y2}>
						<stop offset="0%" stopColor={gradientColor || DEFAULT_GRADIENT_COLOR} stopOpacity="0" />
						<stop offset="100%" stopColor={gradientColor || DEFAULT_GRADIENT_COLOR} stopOpacity="1" />
					</linearGradient>
				</defs>
				<rect x="0" y="0" width="100%" height="100%" fill={`url(#${id}-${orientation})`} />
			</svg>
		);
	}

	private onWallpaperReference = node => (this.wallpaper = node);
	private onCustomImgReference = node => (this.customImg = node);

	render() {
		const { img, children, useTransition } = this.props;
		const hasWallpaper = img && img.resolved;
		if (!hasWallpaper && !children) return false;

		return (
			<div className={cx(bem.b(), { 'no-transition': useTransition })}>
				{children && (
					<div className={cx(bem.e('custom'))} ref={this.onCustomImgReference}>
						{children}
					</div>
				)}
				{hasWallpaper && (
					<div className={cx(bem.e('gradient-bounds'))} ref={this.onWallpaperReference}>
						<Image src={img.src} className={bem.e('image')} />
						{this.renderGradient('horizontal')}
					</div>
				)}
				{this.renderGradient('vertical')}
			</div>
		);
	}
}
