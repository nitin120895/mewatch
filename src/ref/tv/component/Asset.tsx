import * as React from 'react';
import * as cx from 'classnames';
import { resolveImages, convertResourceToSrcSet, getAspectRatio } from 'shared/util/images';
import Image from 'shared/component/Image';
import { Bem } from 'shared/util/styles';
import EllipsisLabel from './EllipsisLabel';
import './Asset.scss';

interface AssetProps extends React.HTMLProps<any> {
	item: api.ItemSummary;
	imageType: image.Type | image.Type[];
	imageOptions: image.Options;
	itemMargin: number;
	focused: boolean;
	displayPlayIcon?: boolean;
	titlePosition?: string;
	isViewAll?: boolean;
	hideItemBadge?: boolean;
	assetMouseEnter?: (number) => void;
	onClick?: (number) => void;
	index?: number;
	isLastItem?: boolean;
	position?: number;
}

const UPDATE_PROPS = ['focused', 'item', 'assetMouseEnter', 'onClick', 'index', 'position'];

const bem = new Bem('asset');

export default class Asset extends React.Component<AssetProps, {}> {
	shouldComponentUpdate(nextProps: Readonly<AssetProps>) {
		const oldProps = this.props;
		return UPDATE_PROPS.some(prop => oldProps[prop] !== nextProps[prop]);
	}

	private handleMouseEnter = () => {
		const { assetMouseEnter, index } = this.props;
		if (assetMouseEnter) assetMouseEnter(index);
	};

	private handleClick = () => {
		const { onClick, index } = this.props;
		if (onClick) onClick(index);
	};

	render(): any {
		const {
			item,
			imageType,
			imageOptions,
			itemMargin,
			focused,
			className,
			displayPlayIcon,
			isViewAll,
			hideItemBadge,
			isLastItem
		} = this.props;
		const images = resolveImages(item.images, imageType, imageOptions);
		const sources = images.map(source => convertResourceToSrcSet(source, true));
		const defaultImage = images[0];
		const displayWidth = defaultImage.displayWidth ? defaultImage.displayWidth : defaultImage.width;
		let displayHeight = defaultImage.displayHeight ? defaultImage.displayHeight : defaultImage.height;

		if (!defaultImage.resolved) {
			displayHeight = displayWidth / getAspectRatio(defaultImage.type);
		}

		const position = item.customFields && item.customFields.position;

		const itemObj = {
			item,
			isViewAll,
			focused,
			displayWidth,
			displayHeight,
			sources,
			position,
			hideItemBadge,
			imageOptions,
			displayPlayIcon
		};

		return (
			<div
				className={cx(bem.b({ focused }), className, { isLastItem })}
				style={{
					margin: `${itemMargin / 2}px ${isLastItem ? 0 : itemMargin}px 0 0`,
					width: `${displayWidth}px`,
					height: `${displayHeight}px`
				}}
				tabIndex={0}
				aria-label={item.title}
				onMouseEnter={this.handleMouseEnter}
				onClick={this.handleClick}
			>
				{this.rendersubItems(itemObj)}
			</div>
		);
	}

	private rendersubItems(itemObj) {
		if (this.props.isViewAll) {
			return this.renderViewAll(itemObj);
		} else {
			return [this.renderItem(itemObj), this.renderTitle('below')];
		}
	}

	private renderViewAll(itemObj) {
		const { item, isViewAll, focused, displayWidth, displayHeight } = itemObj;

		return (
			<div
				className={bem.b({ isViewAll, focused })}
				style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
			>
				<span>{item.title}</span>
			</div>
		);
	}

	private renderItem(itemObj) {
		const {
			item,
			focused,
			displayWidth,
			displayHeight,
			sources,
			position,
			imageOptions,
			hideItemBadge,
			displayPlayIcon
		} = itemObj;

		return [
			<Image key="image" srcSet={sources} width={displayWidth} height={displayHeight} />,
			this.renderTitle('overlay'),
			position !== undefined && this.renderProgressBar(position, item.duration, imageOptions.width),
			item.badge && !hideItemBadge && (
				<div key="badge" className={bem.e('badge')}>
					{item.badge}
				</div>
			),
			this.renderPlayIcon(focused, displayPlayIcon)
		];
	}

	private renderTitle(position: 'overlay' | 'below') {
		const { item, titlePosition } = this.props;

		if (titlePosition !== position || item.type === 'link') return undefined;

		return <EllipsisLabel className={bem.e('title', position)} key="title" text={item.title} />;
	}

	private renderProgressBar(position, duration, width) {
		const progressWidth = Math.round((width * position) / duration);

		return (
			<div className={bem.e('progress-bar')}>
				<div className={bem.e('progress')} style={{ width: `${progressWidth}px` }} />
			</div>
		);
	}

	private renderPlayIcon(focused, display = false) {
		if (display && focused) {
			return <div className={bem.e('playIcon', { focused })} key="playIcon" />;
		}
	}
}
