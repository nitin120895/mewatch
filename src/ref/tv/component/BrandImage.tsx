import * as React from 'react';
import Image from 'shared/component/Image';
import { resolveImages, convertResourceToSrcSet } from 'shared/util/images';
import sass from 'ref/tv/util/sass';
import './BrandImage.scss';

type BrandImageProps = {
	className: string;
	item: { images?: { [key: string]: string } };
	contentWidth?: number;
	contentHeight?: number;
	ratio?: number;
};

export default ({ className, item, contentWidth, contentHeight, ratio }: BrandImageProps) => {
	if (!item || !item.images) return undefined;

	// We need to first resolve the FHD image to know the real size of the image,
	// to avoid having a visually bigger image in HD if the image is smaller than FHD's `maxWidth`.
	let displayStyle = 'width';
	let maxWidth = (contentWidth || sass.viewportWidth) * (ratio || 0.4);
	let maxHeight = (contentHeight || sass.viewportHeight) * (ratio || 0.4);
	let images = resolveImages(item.images, 'brand', { width: maxWidth, format: 'png' });
	let defaultImage = images[0];
	const { width, height } = defaultImage;

	if (width / height < maxWidth / maxHeight) {
		displayStyle = 'height';
		images = resolveImages(item.images, 'brand', { height: maxHeight, format: 'png' });
		defaultImage = images[0];
	}

	const sources = images.map(source => convertResourceToSrcSet(source, true));
	const displayWidth = defaultImage.displayWidth ? defaultImage.displayWidth : defaultImage.width;
	const displayHeight = defaultImage.displayHeight ? defaultImage.displayHeight : defaultImage.height;

	return (
		<div className={className} style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}>
			<Image
				className={displayStyle === 'width' ? 'full-width' : 'full-height'}
				srcSet={sources}
				width={displayWidth}
				height={displayHeight}
			/>
		</div>
	);
};
