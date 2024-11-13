import * as React from 'react';
import * as cx from 'classnames';
import { getColumnOffsetClasses } from 'ref/responsive/util/grid';
import { resolveImages } from 'shared/util/images';
import { Bem } from 'shared/util/styles';
import Image from 'shared/component/Image';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import PackshotList from 'ref/responsive/component/PackshotList';
import Wallpaper from 'ref/responsive/pageEntry/branded/Wallpaper';
import { getListThemeColor } from 'ref/responsive/pageEntry/util/custom';

import 'ref/responsive/pageEntry/branded/BrandedImage.scss';

const bem = new Bem('branded-image');

interface BrandedEntryProps extends PageEntryListProps {
	imageType: image.Type;
	doubleRow?: boolean;
	columns?: grid.BreakpointColumn[];
	offsets?: grid.BreakpointColumn[];
}

interface BrandedImageState {
	wallpaper: image.Resource;
	brandedImage: image.Resource;
	scrollLeft?: number;
	useTransition?: boolean;
	backgroundColor?: string;
}

export default class BrandedImage extends React.Component<BrandedEntryProps, BrandedImageState> {
	private hero: HTMLElement;

	constructor(props) {
		super(props);
		this.state = this.getState(props ? props.list : undefined);
	}

	componentDidMount() {
		this.updateBackgroundColor(this.props);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.list !== this.props.list) {
			const state = this.getState(nextProps.list);
			this.setState(state);
			this.updateBackgroundColor(nextProps);
		}
	}

	private getState(list: api.ItemList) {
		if (!list || !list.images) {
			return {
				wallpaper: undefined,
				brandedImage: undefined
			};
		}
		return {
			wallpaper: list.images.wallpaper ? resolveImages(list.images, 'wallpaper', { height: 320 })[0] : undefined,
			brandedImage: list.images.custom
				? resolveImages(list.images, 'custom', { height: 320, format: 'png' })[0]
				: undefined
		};
	}

	private updateBackgroundColor({ list }) {
		const backgroundColor = getListThemeColor('Background', 'Primary', list);
		this.setState({ backgroundColor });
		this.hero.style.backgroundColor = backgroundColor;
	}

	private onScroll = (scrollLeft, useTransition) => {
		this.setState({ scrollLeft, useTransition });
	};

	private onReset = () => {
		this.setState({ scrollLeft: 0, useTransition: false });
	};

	private onHeroReference = node => (this.hero = node);

	render() {
		const {
			list,
			savedState,
			customFields,
			className,
			imageType,
			doubleRow,
			columns,
			offsets,
			template,
			loadNextListPage
		} = this.props;
		const { wallpaper, brandedImage, scrollLeft, useTransition, backgroundColor } = this.state;
		const peek = {
			top: customFields.breakoutTop ? `top-${customFields.breakoutTop}` : '',
			bottom: customFields.breakoutBottom ? `bottom-${customFields.breakoutBottom}` : '',
			left: customFields.breakoutLeft ? `left-${customFields.breakoutLeft}` : ''
		};
		const gradientColor = backgroundColor;

		return (
			<section className={cx(className, bem.b())}>
				<EntryTitle {...this.props} />
				<div
					className={cx(bem.e('background'), { 'no-wallpaper': !wallpaper && !brandedImage }, 'full-bleed')}
					ref={this.onHeroReference}
				>
					<Wallpaper
						id={`wallpaper-gradient-${list.id}-${template}`}
						img={wallpaper}
						scrollLeft={scrollLeft}
						useTransition={useTransition}
						gradientColor={gradientColor}
					>
						{this.renderImage(brandedImage, peek)}
					</Wallpaper>
					<div className={cx('col-mobile-24', bem.e('packshot-wrapper'))}>
						<PackshotList
							list={list}
							packshotTitlePosition={customFields ? customFields.assetTitlePosition : undefined}
							firstPackshotClassName={brandedImage || wallpaper ? cx(...getColumnOffsetClasses(offsets)) : ''}
							imageType={imageType}
							doubleRow={doubleRow}
							columns={columns}
							savedState={savedState}
							onScroll={this.onScroll}
							onReset={this.onReset}
							template={template}
							loadNextListPage={loadNextListPage}
						/>
					</div>
				</div>
			</section>
		);
	}

	renderImage(brandedImage, peek) {
		if (!brandedImage || !brandedImage.resolved) return false;
		const { title } = this.props;

		return (
			<div className={bem.e('custom-img')}>
				<div>
					<div className={cx(bem.e('breakout', peek.top, peek.bottom, peek.left))}>
						<Image src={brandedImage.src} className={bem.e('breakout-img')} description={title || ''} />
					</div>
				</div>
			</div>
		);
	}
}
