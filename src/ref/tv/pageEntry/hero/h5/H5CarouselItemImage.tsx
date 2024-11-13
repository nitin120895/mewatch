import * as React from 'react';
import { resolveImages } from 'shared/util/images';
import { fullScreenWidth } from '../../../util/itemUtils';
import Picture from 'shared/component/Picture';
import { Bem } from 'shared/util/styles';
import './H5CarouselItemImage.scss';

const bem = new Bem('h5-item-image');

interface H5CarouselItemImageProps extends React.HTMLProps<any> {
	item: api.ItemSummary;
	offsetTop?: number;
}

export default class H5CarouselItemImage extends React.Component<H5CarouselItemImageProps, any> {
	render() {
		const { item } = this.props;
		const hero16x9 = resolveImages(item.images, 'wallpaper', { width: fullScreenWidth })[0].src;
		const sources = [{ src: hero16x9, mediaQuery: '(min-width: 1920px)' }];

		return (
			<div className={bem.b()} style={{ top: `${this.props.offsetTop}px` }}>
				<Picture src={hero16x9} sources={sources} />
			</div>
		);
	}
}
