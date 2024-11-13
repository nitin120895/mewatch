import * as cx from 'classnames';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { wrapPackshot } from 'shared/analytics/components/ItemWrapper';
import { convertResourceToSrcSet, resolveFirstImageType, resolveImages } from 'shared/util/images';
import { Bem, isPartiallyVisible } from 'shared/util/styles';
import { getItemProgress, getItemTitle, ItemWatchOptions, getItemWatchOptions } from '../util/item';
import Image from 'shared/component/Image';
import Link from 'shared/component/Link';
import PackshotTitle from './PackshotTitle';
import ProgressBar from './ProgressBar';
import PackshotHover from './PackshotHover';
import PlayIcon from 'ref/responsive/component/icons/PlayIcon';
import PackshotOverlay from './PackshotOverlay';
import { browserHistory } from 'shared/util/browserHistory';

import './Packshot.scss';

export interface PackshotProps extends React.HTMLProps<HTMLElement> {
	item: api.ItemSummary;
	// The image type impacts the layout within the CSS as well as the chosen image from Rocket.
	// If you pass in an array ensure the types are of the same aspect ratio to ensure you don't
	// mismatch the CSS from the resolved image.
	imageType: image.Type | image.Type[];
	imageOptions: image.Options;
	selected?: boolean;
	path?: string;
	titlePosition?: AssetTitlePosition;
	tabEnabled?: boolean;
	index?: number;
	onClicked?: (item: api.ItemSummary, index: number) => void;
	onHoverClick?: (e: React.SyntheticEvent<any>) => void;
	onOverlayClick?: (e: React.SyntheticEvent<any>) => void;
	onPlayIconClick?: (e: React.SyntheticEvent<any>) => void;
	ignoreLink?: boolean;
	allowProgressBar?: boolean;
	allowWatch?: boolean;
	hasHover?: boolean;
	hasOverlay?: boolean;
	hasPlayIcon?: boolean;
	hasImageShadow?: boolean;
	hasPlayIconAlwaysShown?: boolean;
	isEpisodeItem?: boolean;
	isPlayIconShown?: boolean;
	children?: any;
}

interface PackshotState {
	packshotOver: boolean;
	isPartiallyVisible: boolean;
	images: image.Resource[];
}

const bem = new Bem('packshot');

export class Packshot extends React.Component<PackshotProps, PackshotState> {
	static defaultProps = {
		index: 0,
		titlePosition: 'none' as AssetTitlePosition,
		tabEnabled: true,
		hasOverlay: false,
		hasPlayIcon: true,
		hasImageShadow: false,
		allowWatch: false,
		hasHover: false,
		isEpisodeItem: false,
		hasPlayIconAlwaysShown: false
	};

	private watchOptions: ItemWatchOptions;
	private path: string;
	private playIconSize: number;
	// On touch devices we don't want to trigger the hover state on mouse move
	// When a touch event starts we set this
	// value to true and then prevent entering the hover state on mouse move
	private isTouchDevice = false;

	constructor(props) {
		super(props);

		const { item, imageType, imageOptions, allowWatch, path } = this.props;
		this.watchOptions = getItemWatchOptions(item);
		this.path = allowWatch ? this.watchOptions.path : path || item.path;

		this.state = {
			packshotOver: false,
			images: resolveImages(item.images, imageType, imageOptions),
			isPartiallyVisible: false
		};
	}

	private isWatchable(): boolean {
		return this.watchOptions && this.watchOptions.watchable;
	}

	private getItemProgress(): number {
		const { item, allowProgressBar } = this.props;
		if (!allowProgressBar) return 0;
		return getItemProgress(item);
	}

	private onClick = e => {
		const { item, index, onClicked } = this.props;
		onClicked(item, index);
	};

	private onOverlayClick = e => {
		const { isEpisodeItem, item, onOverlayClick } = this.props;

		if (onOverlayClick) {
			onOverlayClick(e);
			return;
		}

		e.preventDefault();
		browserHistory.push(isEpisodeItem ? item.watchPath : item.path);
	};

	private onPlayIconClick = e => {
		const { onPlayIconClick } = this.props;

		if (onPlayIconClick) {
			onPlayIconClick(e);
			return;
		}

		e.preventDefault();
		browserHistory.push(this.watchOptions.path);
	};

	private onTouchStart = e => {
		this.isTouchDevice = true;
	};

	private onMouseMove = e => {
		if (this.isTouchDevice) return;

		const { hasHover, hasOverlay } = this.props;
		if (hasHover || hasOverlay) {
			e.stopPropagation();
			if (!this.state.packshotOver) {
				const isVisible = isPartiallyVisible(
					ReactDOM.findDOMNode(this) as HTMLElement,
					document.querySelector('.page'),
					2 / 3
				);
				this.setState({ packshotOver: true, isPartiallyVisible: isVisible });
			}
		}
	};

	private onMouseLeave = e => {
		if (this.isTouchDevice) return;

		const { hasHover, hasOverlay } = this.props;
		if (hasHover || hasOverlay) {
			this.setState({ packshotOver: false });
		}
	};

	render() {
		const { item, imageType, titlePosition, selected, className, ignoreLink, hasHover } = this.props;
		const { title: itemTitle } = item;
		const showsTitle = titlePosition && titlePosition !== 'none';
		const imageTypeModifier = resolveFirstImageType(imageType);
		const classes = cx(bem.b(imageTypeModifier, { selected }), className);

		if (this.path && this.path.length > 0 && !ignoreLink) {
			const { tabEnabled, onClicked } = this.props;
			return (
				<Link
					to={this.path}
					className={classes}
					title={showsTitle || hasHover ? '' : itemTitle}
					tabIndex={tabEnabled ? 0 : -1}
					onClick={onClicked ? this.onClick : undefined}
					aria-label={itemTitle}
				>
					{this.renderContent(true, showsTitle, imageTypeModifier)}
				</Link>
			);
		}

		return <div className={classes}>{this.renderContent(false, showsTitle, imageTypeModifier)}</div>;
	}

	private renderContent(hasPath: boolean, showsTitle: boolean, imageTypeModifier: image.Type) {
		const { item, titlePosition, hasImageShadow, children } = this.props;
		const title = getItemTitle(item);
		const imageClasses = cx(bem.e('image', imageTypeModifier));
		const progress = this.getItemProgress();

		return [
			<div
				className={imageClasses}
				key="img"
				onTouchStart={this.onTouchStart}
				onMouseMove={this.onMouseMove}
				onMouseLeave={this.onMouseLeave}
			>
				{this.renderImage(item, hasPath, showsTitle)}
				{this.renderImageShadow(title, titlePosition, hasImageShadow, progress)}
				{this.renderOverlay()}
				{this.renderProgressBar(progress)}
				{this.renderPlayIcon()}
				{this.renderHover()}
				{children}
			</div>,
			<PackshotTitle title={title} position={titlePosition} key="title" />
		];
	}

	private renderImage(item: api.ItemSummary, hasPath: boolean, showsTitle: boolean) {
		const { images } = this.state;
		if (images && images.length && images[0].resolved) {
			const sources = images.map(source => convertResourceToSrcSet(source, true));
			// Get the display dimensions. This is necessary when supporting HiDPI screens.
			const defaultImage = images[0];
			const displayWidth = defaultImage.displayWidth || defaultImage.width;
			const displayHeight = defaultImage.displayHeight || defaultImage.height;

			return (
				<Image
					srcSet={sources}
					description={showsTitle || hasPath ? '' : item.title}
					width={displayWidth}
					height={displayHeight}
					className="img-r"
					ariaHidden={showsTitle}
				/>
			);
		}

		return this.renderImageTitle(item.title, showsTitle);
	}

	private renderImageTitle(title: string, showsTitle: boolean) {
		const text = showsTitle ? '' : title;
		const classNames = cx('packshot-fb-title', 'truncate');

		return (
			<span className={classNames} aria-hidden="true">
				{text}
			</span>
		);
	}

	private renderImageShadow(
		title: string,
		titlePosition: AssetTitlePosition,
		hasImageShadow: boolean,
		progress: number
	) {
		if ((title && titlePosition === 'overlay') || hasImageShadow || progress) {
			return <div className={cx(bem.e('image-shadow'))} />;
		}

		return false;
	}

	private renderProgressBar(progress: number) {
		return progress > 0 && <ProgressBar progress={progress} className={bem.e('progress')} />;
	}

	private renderHover() {
		const { item, hasHover, onHoverClick } = this.props;
		return (
			hasHover &&
			this.state.isPartiallyVisible && (
				<PackshotHover item={item} active={this.state.packshotOver} onHoverClick={onHoverClick} />
			)
		);
	}

	private renderOverlay() {
		return (
			this.state.packshotOver &&
			this.props.hasOverlay && (
				<PackshotOverlay key="overlay" isDark={this.isWatchable()} onClick={this.onOverlayClick} />
			)
		);
	}

	private renderPlayIcon() {
		const { hasPlayIcon, hasHover, hasPlayIconAlwaysShown } = this.props;
		const { packshotOver } = this.state;
		const isShown = hasPlayIconAlwaysShown || (packshotOver && hasPlayIcon && this.isWatchable());
		const isCentered = packshotOver && hasHover;
		const classNames = bem.e('play-icon', {
			center: isCentered,
			top: !isCentered,
			shown: hasPlayIconAlwaysShown
		});

		return (
			isShown && (
				<PlayIcon
					className={classNames}
					key="playIcon"
					onClick={this.onPlayIconClick}
					width={this.playIconSize}
					height={this.playIconSize}
				/>
			)
		);
	}
}

export default wrapPackshot(Packshot);
