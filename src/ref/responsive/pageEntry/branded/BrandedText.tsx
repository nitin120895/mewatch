import * as React from 'react';
import * as cx from 'classnames';
import { resolveImages } from 'shared/util/images';
import { Bem } from 'shared/util/styles';
import { getColumnClasses, getColumnOffsetClasses } from 'ref/responsive/util/grid';
import PackshotList from 'ref/responsive/component/PackshotList';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import { getListThemeColor } from '../util/custom';

import './BrandedText.scss';

const bemBrandedTextPackshot = new Bem('branded-text-packshot');
const bemBrandedTextCover = new Bem('branded-text-cover');

interface BrandedEntryProps extends PageEntryListProps {
	imageType: image.Type;
	doubleRow?: boolean;
	columns?: grid.BreakpointColumn[];
	offsets?: grid.BreakpointColumn[];
}

interface BrandedTextState {
	url: string;
	image: image.Resource[];
	useTransition?: boolean;
	backgroundColor?: string;
}

export default class BrandedText extends React.Component<BrandedEntryProps, BrandedTextState> {
	private background: HTMLElement;
	private brandedCover: HTMLElement;
	private brandedTitle: HTMLElement;

	constructor(props: BrandedEntryProps) {
		super(props);
		this.state = {
			url: this.getUrl(props.list, props.customFields),
			image: this.getImage(props.list)
		};
	}

	componentDidMount() {
		this.updateBackgroundColor(this.props);
	}

	componentWillReceiveProps(nextProps: BrandedEntryProps) {
		this.setState({
			url: this.getUrl(nextProps.list, nextProps.customFields),
			image: this.getImage(nextProps.list)
		});
		this.updateBackgroundColor(nextProps);
	}

	private updateBackgroundColor({ list }) {
		this.brandedTitle.style.color = getListThemeColor('Text', 'Primary', list);
		this.background.style.backgroundColor = getListThemeColor('Background', 'Primary', list);
	}

	private getImage = (list: api.ItemList) => {
		let img;
		if (!list || !list.images) return undefined;
		if (list.images.brand) img = resolveImages(list.images, 'brand', { width: 450, format: 'png' })[0].src;
		return img;
	};

	private getUrl = (list: api.ItemList, customFields) => {
		let url = list ? list.path : undefined;
		return customFields ? customFields.moreLinkUrl : url;
	};

	private onScroll = (scrollLeft, useTransition) => {
		this.setState({ useTransition });
		window.requestAnimationFrame(() => {
			this.setBrandedOpacityAndScroll(scrollLeft);
		});
	};

	private onReset = () => {
		this.setState({ useTransition: false });
		window.requestAnimationFrame(() => {
			this.setBrandedOpacityAndScroll(0);
		});
	};

	private setBrandedOpacityAndScroll(scrollLeft) {
		const minimumScroll = 0.5;
		const opacity = Math.max(0, 1 - scrollLeft / 300);
		const scroll = 100 - 100 * Math.max(minimumScroll, 1 - scrollLeft / 1000);

		this.brandedCover.style.opacity = `${opacity}`;
		this.brandedCover.style.transform = `translateX(-${scroll}%)`;
	}

	private onBackgroundReference = node => (this.background = node);
	private onBrandedCoverReference = node => (this.brandedCover = node);
	private onBrandedTitleReference = node => (this.brandedTitle = node);

	render(): any {
		const {
			list,
			customFields,
			imageType,
			doubleRow,
			columns,
			offsets,
			className,
			savedState,
			loadNextListPage
		} = this.props;
		if (!list) return false;
		const { url, image } = this.state;
		return (
			<section>
				<EntryTitle {...this.props} />
				<div className={cx(className, bemBrandedTextPackshot.b(doubleRow ? 'double-row' : undefined))}>
					{this.renderBrandImage(url, image, list.title, list.tagline, offsets)}
					<PackshotList
						list={list}
						firstPackshotClassName={cx(...getColumnOffsetClasses(offsets))}
						imageType={imageType}
						savedState={savedState}
						onScroll={this.onScroll}
						onReset={this.onReset}
						doubleRow={doubleRow}
						packshotTitlePosition={customFields ? customFields.assetTitlePosition : undefined}
						columns={columns}
						loadNextListPage={loadNextListPage}
					/>
					<div className={bemBrandedTextPackshot.e('background')} ref={this.onBackgroundReference} />
				</div>
			</section>
		);
	}

	renderBrandImage(url, image, title, tagline, offsets) {
		const className = cx(
			bemBrandedTextCover.b(),
			{ 'no-transition': this.state.useTransition },
			...getColumnClasses(offsets)
		);
		return (
			<div className={className} ref={this.onBrandedCoverReference}>
				<a href={url} className={bemBrandedTextCover.e('link')}>
					<span className={bemBrandedTextCover.e('title')} ref={this.onBrandedTitleReference}>
						{image ? (
							<img src={image} alt={title} className={bemBrandedTextCover.e('image')} />
						) : (
							<h3 className={bemBrandedTextCover.e('title-text', { long: title && title.length > 15 })}>{title}</h3>
						)}
						{tagline && <p className={bemBrandedTextCover.e('tagline')}>{tagline}</p>}
					</span>
				</a>
			</div>
		);
	}
}
