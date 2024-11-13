import * as React from 'react';
import Picture from 'shared/component/Picture';
import { resolveImages, convertResourceToSrcSet, flattenSrcSet } from 'shared/util/images';
import GradientTitle from 'ref/tv/component/GradientTitle';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { Link } from 'react-router';

import './MosaicCell.scss';

interface MosaicCellProps {
	index?: number;
	item: api.ItemSummary;
	isPrimary?: boolean;
	className?: string;
	customFields?: any;
	onMouseEnter?: (index) => void;
	onClick?: () => void;
}

const bem = new Bem('mosaic-cell');

export default class MosaicCell extends React.Component<MosaicCellProps, any> {
	private convertImage(resources: image.Resource[], mediaQuery: string): image.Source {
		const srcSets = resources.map(source => convertResourceToSrcSet(source, true));
		return { src: flattenSrcSet(srcSets), mediaQuery };
	}

	private handleMouseEnter = () => {
		const { onMouseEnter, index } = this.props;
		onMouseEnter && onMouseEnter(index);
	};

	private handleMouseClick = () => {
		this.props.onClick && this.props.onClick();
	};

	render() {
		const { item, isPrimary, className } = this.props;

		if (item) {
			const classes = cx(bem.b(), className);

			const imagesSmall = resolveImages(item.images, 'wallpaper', { width: isPrimary ? 640 : 320 });
			const imagesLarge = resolveImages(item.images, 'wallpaper', { width: isPrimary ? 900 : 450 });

			let sources: image.Source[] = [];
			sources.push(this.convertImage(imagesSmall, '(max-width: 1680px)'));
			sources.push(this.convertImage(imagesLarge, '(min-width: 1681px)'));
			const src = isPrimary ? imagesLarge[0].src : imagesSmall[0].src;

			return (
				<Link to={item.path} className={classes} onMouseEnter={this.handleMouseEnter} onClick={this.handleMouseClick}>
					{this.renderImage(sources, src)}
					{this.renderTitle(item.title, item.type)}
				</Link>
			);
		} else {
			const classes = cx(bem.b('empty'), className);
			return <div className={classes} />;
		}
	}

	private renderTitle(title: string, type: string) {
		// H7 - Always display asset titles (MASTVR-393)
		const { customFields } = this.props;
		// if (customFields && customFields.assetTitle) {
		return title ? (
			<GradientTitle
				className={cx(bem.e('title'), { 'sr-only': type === 'link' })}
				customFields={customFields}
				noGradient={false}
				title={title}
			/>
		) : (
			<div />
		);
		// }

		// return <div />;
	}

	private renderImage(sources, src) {
		return sources.length > 1 ? <Picture src={src} sources={sources} className={bem.e('image')} /> : false;
	}
}
