import * as React from 'react';
import Image from './Image';
import { flattenSrcSet, flattenSrcSetSizes } from '../util/images';
import warning from '../util/warning';

/**
 * Polyfill required for backwards compatibility in legacy browsers: http://scottjehl.github.io/picturefill/
 *
 * If you intend to use this component then ensure you've added `require('picturefill/dist/picturefill.min');`
 * inside `build/webpack/vendor/shims-dom.js`.
 */

interface PictureProps extends React.Props<any> {
	src: string;
	sources: image.Source[];
	description?: string;
	width?: number | string;
	height?: number | string;
	className?: string;
	imageClassName?: string;
	ariaHidden?: boolean;
	onLoad?: () => void;
	onError?: () => void;
}

/**
 * The Picture element can be used to provide responsive images and/or alternate file formats.
 */
export default class Picture extends React.Component<PictureProps, any> {
	render() {
		const {
			src,
			sources,
			description,
			width,
			height,
			className,
			ariaHidden,
			onLoad,
			onError,
			imageClassName
		} = this.props;
		if (_DEV_ && (!src || !sources)) {
			const ERROR_NO_SRC = 'Picture must receive at least a `src` value.';
			const ERROR_NO_SOURCES = 'Failing to provide a `sources` value negates the need for this component.';
			let error = src ? '' : ERROR_NO_SRC;
			if (!sources) error += `${error ? '\n\t' : ''}${ERROR_NO_SOURCES}`;
			warning(error);
			if (!src) return false;
		}

		const optionalAttributes: { [key: string]: any } = {};
		if (ariaHidden || !description) optionalAttributes['aria-hidden'] = true;

		return (
			<picture className={className} {...optionalAttributes}>
				{sources &&
					sources.map((source, i) => {
						let { src: sourceSrc, srcSet, mimeType, mediaQuery, sizes } = source;
						if (_DEV_ && !sourceSrc && (!srcSet || srcSet.length === 0)) {
							console.error(new Error('Picture sources must include a `src` or a `srcSet` value'));
						}
						let url = sourceSrc || flattenSrcSet(srcSet);
						let sourceSizes = flattenSrcSetSizes(srcSet, sizes, width);
						return <source key={`source-${i}`} srcSet={url} type={mimeType} media={mediaQuery} sizes={sourceSizes} />;
					})}
				<Image
					src={src}
					description={description}
					width={width}
					height={height}
					className={imageClassName || className}
					onLoad={onLoad}
					onError={onError}
				/>
			</picture>
		);
	}
}
