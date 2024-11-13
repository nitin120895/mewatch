import * as React from 'react';
import CtaButton from 'ref/tv/component/CtaButton';
import ScrollableTextModal from 'ref/tv/component/modal/ScrollableTextModal';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { resolveImages, convertResourceToSrcSet } from 'shared/util/images';
import { Focusable } from 'ref/tv/focusableInterface';
import { stopMove, skipMove } from 'ref/tv/util/focusUtil';
import Image from 'shared/component/Image';
import { Bem } from 'shared/util/styles';
import { getImageData } from 'ref/tv/util/itemUtils';
import sass from 'ref/tv/util/sass';
import BrandImage from 'ref/tv/component/BrandImage';
import './ListHero.scss';

const bem = new Bem('list-hero');

interface ListHeroProps extends PageEntryListProps {
	rowType: 'lh1' | 'lh2' | 'lh3';
}

interface ListHeroState {
	isFocused: boolean;
	isLongTitle: boolean;
}

interface ListHeroContext {
	focusNav: DirectionalNavigation;
}

export default class ListHero extends React.Component<ListHeroProps, ListHeroState> {
	context: ListHeroContext;

	static contextTypes: any = {
		focusNav: React.PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private ref: HTMLElement;
	private refContent: HTMLElement;
	private titleRef: HTMLElement;

	constructor(props: ListHeroProps, context: ListHeroContext) {
		super(props);

		this.state = {
			isFocused: false,
			isLongTitle: false
		};

		this.focusableRow = {
			focusable: true,
			index: (props.index + 1) * 10,
			height: sass.listHeroHeight,
			forceScrollTop: true,
			template: props.template,
			entryProps: props,
			entryImageDetails: getImageData(props.list.images, 'wallpaper'),
			restoreSavedState: this.setState,
			setFocus: this.setFocus,
			moveLeft: stopMove,
			moveRight: this.moveRight,
			moveUp: skipMove,
			moveDown: skipMove,
			exec: this.exec
		};
	}

	componentDidMount() {
		this.focusableRow.ref = this.props.list.images ? this.refContent : this.ref;
		this.context.focusNav.registerRow(this.focusableRow);
		this.setTitleStyle();

		if (!this.props.list.description) {
			this.focusableRow.focusable = false;
		}
	}

	componentWillReceiveProps(nextProps: ListHeroProps) {
		if (!nextProps.list.description) {
			this.focusableRow.focusable = false;
		} else {
			this.focusableRow.focusable = true;
		}

		if (nextProps.list.title !== this.props.list.title) {
			this.setState({ isLongTitle: false });
		}

		this.focusableRow.entryProps = nextProps;
		this.focusableRow.entryImageDetails = getImageData(nextProps.list.images, 'wallpaper');
	}

	componentDidUpdate() {
		this.setTitleStyle();
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	private setTitleStyle = () => {
		if (!this.titleRef) return;

		const isLongTitle = this.titleRef.clientHeight > sass.listHeroTitleLineHeight;

		if (isLongTitle && isLongTitle !== this.state.isLongTitle) {
			this.setState({ isLongTitle });
		}
	};

	private setFocus = (isFocus?: boolean): boolean => {
		if (this.ref) this.setState({ isFocused: isFocus });
		return true;
	};

	private moveRight = () => {
		const nextRow = this.context.focusNav.getNextFocusableRow(this.focusableRow.index);

		if (nextRow && nextRow.setFocusState) {
			if (nextRow.setFocusState('filter')) {
				this.context.focusNav.focusNextRow(this.focusableRow.index);
			}
		}

		return true;
	};

	private exec = (act?: string): boolean => {
		const { isFocused } = this.state;
		const { list } = this.props;

		switch (act) {
			case 'click':
				isFocused &&
					this.context.focusNav.showDialog(<ScrollableTextModal text={list.description} title={list.title} textWrap />);
				return true;
			default:
				break;
		}

		return false;
	};

	private handleMouseClick = () => {
		this.exec('click');
	};

	private handleMouseEnter = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
	};

	private handleMouseLeave = () => {
		this.setFocus(false);
	};

	private renderImage() {
		const { list } = this.props;
		const images = list.images && resolveImages(list.images, 'wallpaper', { width: sass.listHeroWallpaperImageWidth });
		const sources = images && images.map(source => convertResourceToSrcSet(source, true));

		return (
			<div className={bem.e('img-container')}>
				<Image srcSet={sources} />
				<div className={bem.e('img-container-cover')} />
			</div>
		);
	}

	private renderTitle(title, rowType) {
		const { isLongTitle } = this.state;
		return (
			<div className={bem.e('title', rowType, { isLongTitle })} ref={this.onTitleRef}>
				{title}
			</div>
		);
	}

	private renderBrandImage() {
		return <BrandImage className={bem.e('brand')} item={this.props.list} contentHeight={sass.listHeroHeight} />;
	}

	private renderTagline(tagline: string) {
		return tagline && <div className={bem.e('tagline')}>{tagline}</div>;
	}

	private renderBadgeOrLogoImage(images) {
		if (!images) return undefined;

		let imageList: image.Resource[];
		let sources: image.SrcSet[];
		let imageType: image.Type;

		if (images.logo) {
			imageList = resolveImages(images, 'logo', { width: sass.lhStandardComponentBadgeImageWidth, format: 'png' });
			sources = imageList.map(source => convertResourceToSrcSet(source, true));
			imageType = 'logo';
		} else {
			imageList = resolveImages(images, 'badge', { width: sass.lhStandardComponentBadgeImageWidth, format: 'png' });
			sources = imageList.map(source => convertResourceToSrcSet(source, true));
			imageType = 'badge';
		}

		return (
			<div className={bem.e('overlays')}>
				<Image className={bem.e(imageType)} srcSet={sources} />
			</div>
		);
	}

	private renderDescription() {
		return (
			<div className={bem.e('description')}>
				<CtaButton
					className={bem.e('description-btn', { focused: this.state.isFocused })}
					label={'@{listPage_description_btn_label|View Description}'}
					onClick={this.handleMouseClick}
					onMouseEnter={this.handleMouseEnter}
					onMouseLeave={this.handleMouseLeave}
				/>
			</div>
		);
	}

	private onRef = ref => {
		this.ref = ref;
	};

	private onRefContent = ref => {
		this.refContent = ref;
	};

	private onTitleRef = ref => {
		this.titleRef = ref;
	};

	render() {
		const { list, rowType } = this.props;

		if (!list.images) {
			return (
				<div className={bem.b(rowType)} ref={this.onRef}>
					<div className={bem.e('heading')}>
						{this.renderTitle(list.title, rowType)}
						{this.renderTagline(list.tagline)}
					</div>
					{list.description && this.renderDescription()}
				</div>
			);
		}

		return (
			<div ref={this.onRefContent}>
				{this.renderImage()}
				<div
					className={bem.b(rowType, {
						background: list.images.wallpaper && list.images.wallpaper.length > 0
					})}
					ref={this.onRef}
				>
					<div className={bem.e('heading')}>
						{!list.images.brand && this.renderTitle(list.title, rowType)}
						{list.images.brand && this.renderBrandImage()}
						{this.renderTagline(list.tagline)}
					</div>
					{this.renderBadgeOrLogoImage(list.images)}
					{list.description && this.renderDescription()}
				</div>
			</div>
		);
	}
}
