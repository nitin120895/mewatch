import * as cx from 'classnames';
import * as React from 'react';
import { wrapCarousel } from 'shared/analytics/components/ItemWrapper';
import Link from 'shared/component/Link';
import Picture from 'shared/component/Picture';
import { fallbackURI } from 'shared/util/images';
import { Bem } from 'shared/util/styles';
import { browserHistory } from 'shared/util/browserHistory';

const BemCarouselItem = new Bem('carousel-item');
const BemCarouselText = new Bem('carousel-text');

interface ItemProps extends React.HTMLProps<any> {
	item: api.ItemSummary;
	index: number;
	imageType: image.Type;
	sources: image.Source[];
	brandImage: string;
	badgeImage: string;
	selected?: boolean;
	onItemClick?: (transform: number) => void;
	onLoad?: () => void;
	onError?: (e?) => void;
	style?: {
		top: string;
	};
	isInView: boolean;
	isLink: boolean;
	itemTransitionsDisabled: boolean;
	imageOffsetTop?: string;
	translate: number;
}

class CarouselItem extends React.Component<ItemProps, any> {
	onClick = () => {
		const { onItemClick, translate, isInView, item } = this.props;
		if (isInView) {
			browserHistory.push(item.path);
		} else {
			if (onItemClick) onItemClick(translate);
		}
	};

	render() {
		const {
			item,
			onLoad,
			onError,
			sources,
			brandImage,
			badgeImage,
			isInView,
			style,
			isLink,
			itemTransitionsDisabled,
			imageOffsetTop
		} = this.props;
		const isBrand = brandImage !== fallbackURI;
		const hasBadge = badgeImage !== fallbackURI;
		const hasTagline = !!item.tagline;

		let carouselTextClasses = cx(BemCarouselText.b({ 'large-title': item.title.length > 16 }), {
			'carousel-text--badge-image': hasBadge
		});
		let carouselTextTitleClasses = cx(
			BemCarouselText.e('title'),
			{
				[BemCarouselText.e('title', ['hidden'])]: isBrand
			},
			'heading-shadow'
		);
		if (imageOffsetTop) style.top = `${imageOffsetTop}px`;
		return (
			<Link
				key={'link-' + item.path}
				to={undefined}
				className={BemCarouselItem.b({
					'transitions-enabled': !itemTransitionsDisabled,
					'in-view': isInView,
					link: isLink
				})}
				style={style}
				tabIndex={isInView ? 0 : -1}
				onClick={this.onClick}
			>
				<Picture
					src={sources[0].src}
					sources={sources}
					description="description"
					onLoad={onLoad ? onLoad : undefined}
					onError={onError ? onError : undefined}
					className={BemCarouselItem.e('banner')}
					imageClassName={BemCarouselItem.e('image')}
				/>
				{hasBadge && <img src={badgeImage} className={BemCarouselText.e('badge-image')} aria-hidden="true" />}
				<div className={carouselTextClasses}>
					{hasTagline && <p className={BemCarouselText.e('tagline')}>{item.tagline}</p>}
					{isBrand && <img src={brandImage} className={BemCarouselText.e('picture')} alt={item.title} />}
					{!isLink && <h2 className={carouselTextTitleClasses}>{item.title}</h2>}
					{item.badge && (
						<div>
							<p className={BemCarouselText.e('badge')}>{item.badge}</p>
						</div>
					)}
				</div>
			</Link>
		);
	}
}

export default wrapCarousel(CarouselItem);
