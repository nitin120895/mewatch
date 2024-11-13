import * as React from 'react';
import { flattenSrcSet, flattenSrcSetSizes, fallbackURI } from '../util/images';
import warning from '../util/warning';

interface ImageProps extends React.Props<any> {
	src?: string;
	srcSet?: image.SrcSet[];
	sizes?: image.SrcSetSize[];
	description?: string;
	width?: number | string;
	height?: number | string;
	className?: string;
	ariaHidden?: boolean;
	onLoad?: () => void;
	onError?: () => void;
	onMouseOver?: () => void;
	onMouseOut?: () => void;
}

/**
 * A single Image element with support for single or multiple sources (for progressive enhancement).
 */
export default function Image({
	src,
	srcSet,
	description,
	width,
	height,
	sizes,
	className,
	ariaHidden,
	onLoad,
	onError,
	onMouseOver,
	onMouseOut
}: ImageProps) {
	if (_DEV_ && !src && (!srcSet || srcSet.length === 0)) {
		warning('Image must receive a `src` and/or a `srcSet` value');
	}
	let sources, sourceSizes;
	// srcSet supports images using either device pixel ratio or viewport width.
	if (srcSet) {
		if (!src && srcSet.length === 1 && srcSet[0].pixelRatio === 1) {
			// If provided with a pixel ratio, and if there aren't any HiDPI sources there's no point using srcSet.
			src = srcSet[0].url;
		} else {
			// If provided with viewport width(s) or HiDPI sources we use srcSet.
			sources = flattenSrcSet(srcSet);
			if (sources) sourceSizes = flattenSrcSetSizes(srcSet, sizes, width);
			if (!src) src = srcSet[0].url;
		}
	}
	const optionalAttributes: { [key: string]: any } = {};
	if (ariaHidden || !description) optionalAttributes['aria-hidden'] = true;
	return (
		<img
			src={src || fallbackURI}
			alt={description}
			width={width}
			height={height}
			className={className}
			srcSet={sources}
			sizes={sourceSizes}
			{...optionalAttributes}
			onLoad={onLoad}
			onError={onError}
			onMouseOver={onMouseOver}
			onMouseOut={onMouseOut}
		/>
	);
}
