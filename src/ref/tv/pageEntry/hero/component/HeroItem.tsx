import * as React from 'react';
import * as cx from 'classnames';
import Picture from 'shared/component/Picture';
import Image from 'shared/component/Image';
import { Bem } from 'shared/util/styles';
import { resolveImages, convertResourceToSrcSet } from 'shared/util/images';
import BrandImage from 'ref/tv/component/BrandImage';
import { fullScreenWidth, resolveCustomFields } from 'ref/tv/util/itemUtils';
import './HeroItem.scss';

const bem = new Bem('hero-item');
const bemTitle = new Bem('text-panel');

interface HeroItemProps extends React.HTMLProps<any> {
	item: api.ItemSummary;
	imageType: image.Type;
	itemWidth: number;
	rowHeight: number;
	customFields?: any;
}

export default class HeroItem extends React.Component<HeroItemProps, any> {
	render() {
		const { item, imageType, itemWidth, customFields } = this.props;
		if (!item) return <div />;
		const isBrandTitle = Array(item.images).filter(x => x && x.brand).length;
		let customStyle;
		let customClass;

		if (customFields) {
			const custom = resolveCustomFields(customFields);
			customStyle = custom['cusStyle'];
			customClass = custom['classNames'];
		}

		const images = resolveImages(item.images, imageType, { width: itemWidth });
		const sources = images.map(source => convertResourceToSrcSet(source, true));
		const defaultImage = images[0];
		const displayWidth = defaultImage.displayWidth ? defaultImage.displayWidth : defaultImage.width;
		const displayHeight = defaultImage.displayHeight ? defaultImage.displayHeight : defaultImage.height;

		return (
			<div className={bem.b()}>
				<Image className={bem.e('image')} srcSet={sources} width={displayWidth} height={displayHeight} />
				<div className={cx(bem.e('text'), bemTitle.b())}>
					<div className={cx(bemTitle.e('pos'), customClass)} style={customStyle}>
						{item.badge && (
							<div className={bemTitle.e('badge')}>
								<div>{item.badge}</div>
							</div>
						)}
						{item.badge && <br />}
						{this.renderBrandTitle(isBrandTitle)}
						{item.type !== 'link' && this.renderTitle(item.title, isBrandTitle)}
						{this.renderTagLine(item.tagline)}
					</div>
				</div>
				{this.renderBadgeImage(item.images, customClass)}
				<div className={bem.e('box')} />
			</div>
		);
	}

	private renderTagLine(tagline) {
		if (!tagline) return undefined;
		return <div className={bemTitle.e('tagline')}>{tagline}</div>;
	}

	private renderTitle(title, isBrandTitle) {
		if (isBrandTitle) return undefined;
		return <div className={bemTitle.e('title')}>{title}</div>;
	}

	private renderBrandTitle(isBrandTitle) {
		if (!isBrandTitle) return undefined;
		const { item, itemWidth, rowHeight } = this.props;
		return (
			<BrandImage className={bemTitle.e('brand')} item={item} contentWidth={itemWidth} contentHeight={rowHeight} />
		);
	}

	private renderBadgeImage(images, customClass) {
		if (!images || !images.badge) return;
		const src = resolveImages(images, 'badge', { width: fullScreenWidth, format: 'png' })[0].src;
		const sources = [{ src }];

		return (
			<div className={cx(bemTitle.e('badge-image'), customClass)}>
				<Picture src={src} sources={sources} />
			</div>
		);
	}
}
