import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { MixpanelEntryPoint } from 'shared/analytics/mixpanel/util';
import { PackshotMetadataFormats } from 'shared/list/listUtil';
import { isRailCard } from 'shared/page/pageEntryTemplate';
import { UPDATE_SUBSCRIPTION_ENTRY_POINT } from 'shared/page/pageWorkflow';
import { isMobile, isIOS } from 'shared/util/browser';
import { browserHistory } from 'shared/util/browserHistory';
import { convertResourceToSrcSet, resolveFirstImageType, resolveImages } from 'shared/util/images';
import { isClickable } from 'shared/util/itemUtils';
import { getItem } from 'shared/util/localStorage';
import { get } from 'shared/util/objects';
import { Bem, isPartiallyVisible } from 'shared/util/styles';
import { searchSave } from 'shared/search/searchWorkflow';
import { getUpdatedItem } from 'toggle/responsive/page/item/itemUtil';
import { SEARCH_QUERY } from 'toggle/responsive/page/search/SearchInput';
import { isChannel } from 'toggle/responsive/util/epg';
import { isTrailer, isTeam } from 'toggle/responsive/util/item';
import { getItemWatchOptions, ItemWatchOptions, getItemProgress, isShow } from 'toggle/responsive/util/item';
import { isExternalUrl } from 'toggle/responsive/util/urlUtil';

import Badge from 'toggle/responsive/component/Badge';
import Image from 'shared/component/Image';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { wrapPackshot } from 'shared/analytics/components/ItemWrapper';
import Link from 'shared/component/Link';
import PackshotHover from 'ref/responsive/component/PackshotHover';
import PackshotOverlay from 'ref/responsive/component/PackshotOverlay';
import ProgressBar from 'ref/responsive/component/ProgressBar';
import RemoveIcon from 'toggle/responsive/component/icons/RemoveIcon';

import PartnerLogo from './PartnerLogo';
import PackshotTitle from './PackshotTitle';
import withClickToPlay, { ClickToPlayProps } from './withClickToPlay';

import './Packshot.scss';

const placeholderImage = require('../../../../resource/toggle/image/icon/toggle.svg');

interface DispatchProps {
	onSearchSave?: (query: string) => void;
	updateSubscriptionEntryPoint?: (entryPoint) => void;
}
interface StateProps {
	isFollowedTeam?: boolean;
}
interface OwnProps extends React.HTMLProps<HTMLElement> {
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
	ignoreLink?: boolean;
	allowProgressBar?: boolean;
	edit?: boolean;
	metadataFormatting?: PackshotMetadataFormats;
	unwatchedEpisodes?: number;
	allowWatch?: boolean;
	hasHover?: boolean;
	hasOverlay?: boolean;
	hasPlayIcon?: boolean;
	hasImageShadow?: boolean;
	isEpisodeItem?: boolean;
	searchList?: api.ItemSummary[];
	isRestricted?: boolean;
	showPartnerLogo?: boolean;
	pageTemplate?: string;
	requiresUpdatedItem?: boolean;
	listData?: api.ListData;
}
interface PackshotState {
	packshotOver: boolean;
	isPartiallyVisible: boolean;
	images: image.Resource[];
	path: string;
}

const bem = new Bem('packshot');
export type PackshotProps = OwnProps & ClickToPlayProps & DispatchProps & StateProps;

class Packshot extends React.Component<PackshotProps, PackshotState> {
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
		requiresUpdatedItem: false
	};

	private watchOptions: ItemWatchOptions;
	// On touch devices we don't want to trigger the hover state on mouse move
	// When a touch event starts we set this
	// value to true and then prevent entering the hover state on mouse move
	private isTouchDevice = false;

	constructor(props) {
		super(props);

		const { item, imageType, imageOptions } = this.props;

		this.state = {
			packshotOver: false,
			images: this.resolvePackshotImages(item.images, imageType, imageOptions),
			isPartiallyVisible: false,
			path: ''
		};
	}

	componentWillReceiveProps(nextProps: PackshotProps) {
		const { item, isFollowedTeam } = this.props;
		const { item: nextItem, imageType, imageOptions } = nextProps;

		if (isTeam(item)) {
			const teamImage = isFollowedTeam ? 'custom' : imageType;
			this.setState({
				images: this.resolvePackshotImages(nextItem.images, teamImage, imageOptions)
			});
		}

		if (nextItem.id !== item.id) {
			this.setState({
				images: this.resolvePackshotImages(nextItem.images, imageType, imageOptions)
			});
		}
	}

	componentDidMount() {
		this.isTouchDevice = isMobile();
		const { item } = this.props;
		this.setPath(item);
	}

	private resolvePackshotImages = (
		images: { [key: string]: string },
		imageType: image.Type | image.Type[],
		options: image.Options
	) => {
		if (Array.isArray(imageType)) {
			// Check that array is more than single item and contains 'tile'
			// Ensures that, for packshot component, if item has more than 1 active
			// image type set in PM, then tile receives preference
			if (imageType.length >= 2 && imageType.includes('tile')) {
				imageType = 'tile';
			}
		}
		return resolveImages(images, imageType, options);
	};

	private setPath = (item: api.ItemSummary) => {
		const { allowWatch, path, searchList } = this.props;
		this.watchOptions = getItemWatchOptions(item);
		if ((searchList && isTrailer(item)) || allowWatch) {
			this.setState({ path: this.watchOptions.path });
		} else {
			this.setState({ path: path || item.path });
		}
	};

	private isWatchable(): boolean {
		return this.watchOptions && this.watchOptions.watchable;
	}

	private getItemProgress(): number {
		const { item, allowProgressBar } = this.props;
		if (!allowProgressBar) return 0;
		return getItemProgress(item);
	}

	private redirectToItemDetailPage(item: api.ItemSummary) {
		const { searchList, onSearchSave } = this.props;
		const { path } = this.state;
		if (searchList) {
			const query = getItem(SEARCH_QUERY);
			onSearchSave(query);
		}

		browserHistory.push(path);
	}

	private handleOnClick = (e, item) => {
		const {
			onClicked,
			index,
			ignoreLink,
			isRestricted,
			clickToPlay,
			updateSubscriptionEntryPoint,
			template
		} = this.props;
		const { path } = this.state;

		if (isRailCard(template)) {
			updateSubscriptionEntryPoint(MixpanelEntryPoint.RailCard);
		}

		if (onClicked) {
			onClicked(item, index);
			return;
		}

		if (!isClickable(ignoreLink, isRestricted)) {
			return;
		}

		clickToPlay(item, {
			path,
			defaultBehaviour: () => this.redirectToItemDetailPage(item)
		});
	};

	private onClick = e => {
		const { item, index, edit, requiresUpdatedItem, onClicked } = this.props;

		// External links should be treated as regular <a> elements.
		if (isExternalUrl(this.state.path)) {
			this.setState({ packshotOver: false });
			return;
		}

		// From here on we're using built in logic to determine what should be
		// done after the user interacts with the element.
		e.preventDefault();

		// onClicked for editable lists (e.g. Bookmarks) are handled here as we
		// don't need to be concerned with anything else. This is done before
		// the `!isClickable` block below as ignoreLink is true in the
		// AccountProfileBookmarks link
		if (edit && onClicked) {
			onClicked(item, index);
		}

		// When the item is not a show we retrieve the updatedItem to ensure
		// that we have all the important information before continuing
		if (!isShow(item) && requiresUpdatedItem) {
			getUpdatedItem(item.id).then(updatedItem => this.handleOnClick(e, updatedItem));
			return;
		}

		this.handleOnClick(e, item);
	};

	private onMouseEnter = e => {
		// There is an issue with iOS13 which results in the system intepreting
		// certain properties of an element and determining that second click is
		// required to trigger the click event.
		//
		// This results in issues with the way that our Packshot component works
		// when determining what should happen when the user attempts to
		// interact with the element.
		//
		// onMouseEnter was chosen over onMouseMove or onMouseLeave as this most
		// closely follows the interaction of onClick.
		//
		// If you have to work with this in the future... Sorry.
		if (!isIOS()) return;

		this.onClick(e);
	};

	private onMouseMove = e => {
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
		const { hasHover, hasOverlay } = this.props;
		if (hasHover || hasOverlay) {
			this.setState({ packshotOver: false });
		}
	};

	isBookmarks(): boolean {
		return this.props.metadataFormatting === PackshotMetadataFormats.Bookmarks;
	}

	render() {
		const { item, imageType, titlePosition, selected, className, ignoreLink, hasHover, isRestricted } = this.props;
		const { path } = this.state;
		let redirectPath = path;
		const { title: itemTitle } = item;
		const showsTitle = titlePosition && titlePosition !== 'none';
		const imageTypeModifier = resolveFirstImageType(imageType);
		const classes = cx(bem.b(imageTypeModifier, { selected }), className, { [`${item.type}-item`]: true });

		if (isClickable(ignoreLink, isRestricted)) {
			const { tabEnabled } = this.props;

			return (
				<Link
					to={redirectPath}
					className={classes}
					title={showsTitle || hasHover ? '' : itemTitle}
					tabIndex={tabEnabled ? 0 : -1}
					onClick={this.onClick}
					aria-label={itemTitle}
				>
					{this.renderContent(true, showsTitle, imageTypeModifier)}
				</Link>
			);
		}

		return (
			<div className={classes} onClick={this.onClick}>
				{this.renderContent(false, showsTitle, imageTypeModifier)}
			</div>
		);
	}

	private renderContent(hasPath: boolean, showsTitle: boolean, imageTypeModifier: image.Type) {
		const { item, edit, titlePosition, hasImageShadow, showPartnerLogo } = this.props;
		let title = get(item, 'title');
		const imageClasses = cx(bem.e('image', imageTypeModifier));
		const progress = this.getItemProgress();
		const secondaryLanguageTitle = item.secondaryLanguageTitle;
		const displayLogo = !isChannel(item) && showPartnerLogo;
		const isBookmarks = this.isBookmarks();

		let onMouseMoveFn = undefined;
		let onMouseLeaveFn = undefined;

		if (!this.isTouchDevice) {
			onMouseMoveFn = this.onMouseMove;
			onMouseLeaveFn = this.onMouseLeave;
		}

		return [
			<div
				className={imageClasses}
				key="img"
				onMouseEnter={this.onMouseEnter}
				onMouseMove={onMouseMoveFn}
				onMouseLeave={onMouseLeaveFn}
			>
				{this.renderImage(item, hasPath, showsTitle)}
				{this.renderImageShadow(title, titlePosition, hasImageShadow)}
				{this.renderOverlay()}
				{this.renderProgressBar(progress)}
				{this.renderHover()}
				{this.renderBadge()}
				{edit && (
					<div className={bem.e('remove-icon')}>
						<div className={bem.e('remove-icon__block')}>
							<RemoveIcon />
						</div>
					</div>
				)}
				{displayLogo && <PartnerLogo item={item} imageWidth={{ mobile: 50, tablet: 62, desktopWide: 77 }} />}
			</div>,
			<div className={bem.e('metadata')} key="metadata">
				<PackshotTitle
					title={title}
					position={titlePosition}
					secondaryLanguageTitle={secondaryLanguageTitle}
					key="title"
				/>
				{isBookmarks && <div key="bookmarksInfo"> {this.bookmarksInfo()}</div>}
			</div>
		];
	}

	private bookmarksInfo = () => {
		const { unwatchedEpisodes } = this.props;
		if (!unwatchedEpisodes) {
			return false;
		}

		return (
			<IntlFormatter className={bem.e('series')} elementType="p" values={{ unwatchedEpisodes }}>
				{`@{packshot_metadata_series_unwatched|{unwatchedEpisodes}`}
			</IntlFormatter>
		);
	};

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

		const backgroundImage = showsTitle ? `url(${placeholderImage})` : 'none';

		return (
			<span
				// Inline style background image instead of in scss
				// as a temporary workaround for MEDTOG-15540
				style={{ backgroundImage }}
				className={cx('packshot-fb-title', 'truncate', { noimage: !showsTitle })}
				aria-hidden="true"
			>
				<span className="packshot-fb-title__text">{showsTitle ? '' : item.title}</span>
			</span>
		);
	}

	private renderImageShadow(title: string, titlePosition: AssetTitlePosition, hasImageShadow: boolean) {
		const hasTitleOverlay = title && titlePosition === 'overlay';
		if (hasTitleOverlay || hasImageShadow) {
			return <div className={cx(bem.e('image-shadow'), { large: hasTitleOverlay })} />;
		}

		return false;
	}

	private renderProgressBar(progress: number) {
		return progress > 0 && <ProgressBar progress={progress} className={bem.e('progress')} />;
	}

	private renderHover() {
		const { item, hasHover } = this.props;
		return hasHover && this.state.isPartiallyVisible && <PackshotHover item={item} active={this.state.packshotOver} />;
	}

	private renderOverlay() {
		if (this.isTouchDevice) return;

		return (
			this.state.packshotOver && this.props.hasOverlay && <PackshotOverlay key="overlay" isDark={this.isWatchable()} />
		);
	}

	private renderBadge() {
		const { item } = this.props;
		return item.badge && <Badge item={item} className={bem.e('badge')} mod="packshot" />;
	}
}

function mapStateToProps(state: state.Root, ownProps): StateProps {
	const followedList = state.profile.info ? state.profile.info.followed : {};
	const { item } = ownProps;
	return {
		isFollowedTeam: followedList && followedList.hasOwnProperty(item.id)
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onSearchSave: query => dispatch(searchSave(query)),
		updateSubscriptionEntryPoint: payload => dispatch({ type: UPDATE_SUBSCRIPTION_ENTRY_POINT, payload: payload })
	};
}
const Component: any = connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(wrapPackshot(withClickToPlay<PackshotProps>()(Packshot)));

export default withRouter(Component);
