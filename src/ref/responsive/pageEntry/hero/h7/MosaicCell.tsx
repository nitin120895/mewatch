import * as cx from 'classnames';
import * as React from 'react';
import GradientTitle from 'ref/responsive/component/GradientTitle';
import { BREAKPOINT_RANGES } from 'ref/responsive/util/grid';
import { wrapMosaic } from 'shared/analytics/components/ItemWrapper';
import Link from 'shared/component/Link';
import Picture from 'shared/component/Picture';
import { convertResourceToSrcSet, flattenSrcSet, resolveImages } from 'shared/util/images';
import { Bem } from 'shared/util/styles';
import { isIE11 } from 'shared/util/browser';

import './MosaicCell.scss';

interface MosaicCellProps {
	index?: number;
	item: api.ItemSummary;
	onMouseOver?: (number) => void;
	onFocus?: (index: number) => void;
	isHovered?: boolean;
	isPrimary?: boolean;
}

const desktopWideBreakpoint = BREAKPOINT_RANGES['desktopWide'];

const smallBp = `(max-width: ${desktopWideBreakpoint.min - 1}px)`;
const largeBp = `(min-width: ${desktopWideBreakpoint.min}px)`;

const bem = new Bem('mosaic-cell');

class MosaicCell extends React.Component<MosaicCellProps, any> {
	private convertImage(resources: image.Resource[], mediaQuery: string): image.Source {
		const srcSets = resources.map(source => convertResourceToSrcSet(source, true));
		return { src: flattenSrcSet(srcSets), mediaQuery };
	}

	private onMouseOver = () => {
		if (this.props.onMouseOver) this.props.onMouseOver(this.props.item.id);
	};

	private onFocus = e => {
		const { onFocus, index } = this.props;
		onFocus(index);
	};

	render() {
		const { item, isHovered, isPrimary, onFocus } = this.props;

		if (item) {
			const classes = cx(!isHovered && !isIE11() ? bem.b('out-of-focus') : bem.b());
			const focusHandler = onFocus ? this.onFocus : undefined;

			const imagesSmall = resolveImages(item.images, 'wallpaper', {
				width: isPrimary ? 640 : 320
			});
			const imagesLarge = resolveImages(item.images, 'wallpaper', {
				width: isPrimary ? 900 : 450
			});

			let sources: image.Source[] = [];
			sources.push(this.convertImage(imagesSmall, smallBp));
			sources.push(this.convertImage(imagesLarge, largeBp));
			const src = isPrimary ? imagesLarge[0].src : imagesSmall[0].src;

			return (
				<Link to={item.path} className={classes} onMouseOver={this.onMouseOver} onFocus={focusHandler}>
					<span>
						<span className={bem.e('border')} />
						{this.renderImage(sources, src)}
						{this.renderTitle(item.title, item.type)}
					</span>
				</Link>
			);
		}
		return this.renderEmpty();
	}

	private renderEmpty() {
		return (
			<span className={bem.b()}>
				<span className={bem.e('border')} />
			</span>
		);
	}

	private renderTitle(title: string, type: string) {
		return title ? (
			<GradientTitle className={cx(bem.e('title'), { 'sr-only': type === 'link' })} title={title} />
		) : (
			false
		);
	}

	private renderImage(sources, src) {
		return sources.length > 1 ? <Picture src={src} sources={sources} className={bem.e('image')} /> : false;
	}
}

export default wrapMosaic(MosaicCell);
