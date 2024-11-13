import * as React from 'react';
import { resolveImages } from 'shared/util/images';
import { resolveCustomFields, fullScreenWidth } from '../../../util/itemUtils';
import Picture from 'shared/component/Picture';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import BrandImage from 'ref/tv/component/BrandImage';
import './H5CarouselItem.scss';

const bem = new Bem('h5-item');
const bemTitle = new Bem('h5-text');

interface H5CarouselItemProps extends React.HTMLProps<any> {
	item: api.ItemSummary;
	imageType: image.Type;
	imageOptions: image.Options;
	selected?: boolean;
	customFields?: any;
}

export default class H5CarouselItem extends React.Component<H5CarouselItemProps, any> {
	render() {
		const { item, customFields } = this.props;
		const badge = resolveImages(item.images, 'badge', { width: fullScreenWidth, format: 'png' })[0].src;

		let customStyle;
		let customClass;

		if (customFields) {
			const custom = resolveCustomFields(customFields);
			customStyle = custom['cusStyle'];
			customClass = custom['classNames'];
		}

		const sourceBadge = [{ src: badge }];

		return (
			<div className={bem.b()}>
				{this.renderHeading(item, customClass, customStyle)}

				<div className={cx(bem.e('badge'), customClass)}>
					<Picture src={badge} sources={sourceBadge} />
				</div>
			</div>
		);
	}

	private renderHeading(item, customClass, customStyle) {
		const isBrandTitle = Array(item.images || []).filter(x => x && x.brand).length;

		return (
			<div className={bem.e('info')}>
				<div className={cx(bem.e('text'), bemTitle.b(), customClass)} style={customStyle}>
					<div className={cx(bem.e('info-details'), customClass)}>
						<div className={bemTitle.e('badge')}>
							<div>{item.badge}</div>
						</div>
						{this.renderBrandTitle(isBrandTitle)}
						{this.renderTitle(item.type, item.title, isBrandTitle)}
						{this.renderTagLine(item.tagline)}
					</div>
				</div>
			</div>
		);
	}

	private renderBrandTitle(isBrandTitle) {
		if (!isBrandTitle) return undefined;
		return <BrandImage className={bemTitle.e('brand')} item={this.props.item} />;
	}

	private renderTagLine(tagline) {
		if (!tagline) return;
		return <div className={bemTitle.e('tagline')}>{tagline}</div>;
	}

	private renderTitle(itemType, title, isBrandTitle) {
		if (itemType === 'link' || isBrandTitle) return;
		return <div className={bemTitle.e('title')}>{title}</div>;
	}
}
