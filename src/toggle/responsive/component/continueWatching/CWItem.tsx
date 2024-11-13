import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as cx from 'classnames';

import { setContinueWatchingEditList } from 'shared/account/profileWorkflow';
import { analyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { isMobile } from 'shared/util/browser';
import { browserHistory } from 'shared/util/browserHistory';
import { get } from 'shared/util/objects';
import { Bem, isPartiallyVisible } from 'shared/util/styles';
import { isChannel } from 'toggle/responsive/util/epg';
import { isMobileLandscape, isMobileSize, isTabletLandscape } from 'toggle/responsive/util/grid';
import { convertResourceToSrcSet, resolveFirstImageType, resolveImages } from 'shared/util/images';
import { getItemWatchOptions, getItemProgress, isEpisodicSeries, isEpisode } from 'toggle/responsive/util/item';
import { CONTINUE_WATCHING_MENU_MODAL_ID } from 'toggle/responsive/util/modalUtil';

import { MixpanelEntryPoint } from 'shared/analytics/mixpanel/util';
import Image from 'shared/component/Image';
import { getVideoEntryPoint } from 'shared/list/listUtil';
import { UPDATE_SUBSCRIPTION_ENTRY_POINT } from 'shared/page/pageWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import { CTATypes, VideoEntryPoint } from 'shared/analytics/types/types';
import { addQueryParameterToURL } from 'shared/util/urls';
import { FULLSCREEN_QUERY_PARAM } from 'toggle/responsive/util/playerUtil';

import Badge from 'toggle/responsive/component/Badge';
import Checkbox from 'toggle/responsive/component/input/Checkbox';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import CWBottomPanel, { CWBottomPanelProps } from 'toggle/responsive/component/continueWatching/CWBottomPanel';
import Link from 'shared/component/Link';
import CWPopUp from 'toggle/responsive/component/continueWatching/CWPopUp';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import PackshotOverlay from 'ref/responsive/component/PackshotOverlay';
import PackshotTitle from 'toggle/responsive/component/PackshotTitle';
import PartnerLogo from 'toggle/responsive/component/PartnerLogo';
import ProgressBar from 'ref/responsive/component/ProgressBar';

import withClickToPlay, { ClickToPlayProps } from 'toggle/responsive/component/withClickToPlay';

import './CWItem.scss';

const placeholderImage = require('../../../../../resource/toggle/image/icon/toggle.svg');

interface DispatchProps {
	setEditList: (editList: api.ItemSummary[]) => void;
	showModal?: (modal: ModalConfig) => void;
	closeModal?: (id: string) => void;
	updateSubscriptionEntryPoint?: (entryPoint) => void;
	analyticsEvent: (type, payload?: any) => any;
}

interface StoreProps {
	deleteList?: api.ItemSummary[];
	editList?: api.ItemSummary[];
	edit?: boolean;
	selected?: boolean;
}

interface OwnProps extends React.HTMLProps<HTMLElement> {
	item: api.ItemSummary;
	imageType: image.Type | image.Type[];
	imageOptions: image.Options;
	titlePosition?: AssetTitlePosition;
	tabEnabled?: boolean;
	hasHover?: boolean;
	hasOverlay?: boolean;
	showPartnerLogo?: boolean;
	index?: number;
	vertical?: boolean;
	onRemoveItemClick: (e: any) => void;
	entryTitleProps?: any;
}
interface CWItemState {
	images: image.Resource[];
	isShowMenu: boolean;
	selectedItem: any;
	isMenuActive: boolean;
	itemOver: boolean;
	isPartiallyVisible: boolean;
	showBottomPanel: boolean;
}

interface ListProps {
	list: api.ItemList;
	entryPoint?: VideoEntryPoint;
}

export type CWItemProps = OwnProps & ClickToPlayProps & DispatchProps & StoreProps & ListProps;

const bem = new Bem('cw-item');

class CWItem extends React.Component<CWItemProps, CWItemState> {
	static defaultProps = {
		edit: false,
		titlePosition: 'none' as AssetTitlePosition,
		tabEnabled: true,
		hasImageShadow: false,
		hasHover: false,
		hasOverlay: false
	};

	private container: HTMLElement;
	private isTouchDevice = false;

	constructor(props) {
		super(props);

		this.state = {
			images: this.setInitialThumbnailImage(),
			itemOver: false,
			isPartiallyVisible: false,
			isShowMenu: false,
			selectedItem: [],
			isMenuActive: false,
			showBottomPanel: false
		};
		this.handleClickOutside = this.handleClickOutside.bind(this);
	}

	componentDidMount() {
		this.isTouchDevice = isMobile();
		document.body.addEventListener('click', this.handleClickOutside);
	}

	componentWillUnmount() {
		document.body.removeEventListener('click', this.handleClickOutside);
	}

	private onContainerRef = (ref: HTMLElement) => {
		this.container = ref;
	};

	private getWatchPath = (item: api.ItemSummary) => {
		const watchOptions = getItemWatchOptions(item);
		return watchOptions.path;
	};

	private onMetadataClick = event => {
		const { item } = this.props;
		const path = this.getWatchPath(item);
		const season = item && get(item, 'customFields.season');
		browserHistory.push(season ? season.path : item.path || path);
	};

	handleClickOutside = e => {
		if (this.container && !this.container.contains(e.target)) {
			this.setState({
				isShowMenu: false,
				showBottomPanel: false,
				isMenuActive: false
			});
		}
	};

	private setInitialThumbnailImage() {
		const { item, list, imageType, imageOptions } = this.props;
		const assetItem =
			list.listData &&
			list.listData.ContinueWatching &&
			list.listData.ContinueWatching.itemInclusions &&
			list.listData.ContinueWatching.itemInclusions[item.id];
		const seriesImage = assetItem && assetItem.season && assetItem.season.images;
		const images = isEpisode(item) && seriesImage ? seriesImage : item.images;
		return resolveImages(images, imageType, imageOptions);
	}

	private displayContinueWatchingMenuList = () => {
		const { isShowMenu, isMenuActive } = this.state;
		this.setState({
			isShowMenu: !isShowMenu,
			isMenuActive: !isMenuActive
		});
	};

	private handleClickInside = e => {
		e.preventDefault();
		e.stopPropagation();
		if (this.container && !this.container.contains(e.target)) {
			this.setState({
				isShowMenu: true,
				isMenuActive: true
			});
			if ((isMobileSize() && isMobile() && !isTabletLandscape()) || isMobileLandscape()) {
				this.setState({
					isShowMenu: false,
					isMenuActive: true
				});
			}
		}
	};

	showBottomPanel = event => {
		event.preventDefault();
		event.stopPropagation();
		if ((isMobileSize() && isMobile() && !isTabletLandscape()) || isMobileLandscape()) {
			this.showBottomPanelOverlay();
		} else {
			this.displayContinueWatchingMenuList();
		}
	};

	showBottomPanelOverlay = () => {
		const { showModal, closeModal, item, index, entryTitleProps } = this.props;
		const customFields = get(this, 'props.item.customFields');
		const showTitle = get(customFields, 'show.title');
		const title = showTitle || item.title;
		const showSecondaryLanguageTitle = get(customFields, 'show.secondaryLanguageTitle');
		const secondaryLanguageTitle = showSecondaryLanguageTitle || item.secondaryLanguageTitle;
		const railPosition = entryTitleProps && entryTitleProps.index;

		const props: CWBottomPanelProps = {
			id: CONTINUE_WATCHING_MENU_MODAL_ID,
			title: title,
			onClose: closeModal,
			secondaryLanguageTitle: secondaryLanguageTitle,
			onInfoClick: this.onMetadataClick,
			onRemoveItemClick: () => {
				this.removeItem(item);
			},
			handleClickInside: this.handleClickInside,
			item,
			index,
			railPosition
		};

		showModal({
			id: CONTINUE_WATCHING_MENU_MODAL_ID,
			type: ModalTypes.CUSTOM,
			target: 'app',
			element: <CWBottomPanel {...props} />,
			enableScroll: false,
			transparentOverlay: true
		});
	};

	private continueWatchingInfo = () => {
		const { item } = this.props;
		const customFields = get(this, 'props.item.customFields');
		const seasonNumber = get(customFields, 'season.seasonNumber');

		if (!item.episodeName || !seasonNumber) return false;

		return isEpisodicSeries(item) ? (
			<IntlFormatter
				className={cx(bem.e('series'), 'truncate')}
				elementType="p"
				values={{ season: seasonNumber, episodeNumber: item.episodeNumber }}
			>
				{`@{continue_watching_metadata_series|Resume S{season} Ep {episodeNumber}`}
			</IntlFormatter>
		) : (
			<IntlFormatter
				className={cx(bem.e('series'), 'truncate')}
				elementType="p"
				values={{ episodeName: item.episodeName }}
			>
				{`@{continue_watching_metadata_non_series|Resume {episodeName}`}
			</IntlFormatter>
		);
	};

	private onMouseMove = e => {
		const { hasHover, hasOverlay } = this.props;
		if (hasHover || hasOverlay) {
			e.stopPropagation();
			if (!this.state.itemOver) {
				const isVisible = isPartiallyVisible(
					ReactDOM.findDOMNode(this) as HTMLElement,
					document.querySelector('.page'),
					2 / 3
				);
				this.setState({ itemOver: true, isPartiallyVisible: isVisible });
			}
		}
	};

	private onMouseLeave = e => {
		const { hasHover, hasOverlay } = this.props;
		if (hasHover || hasOverlay) {
			this.setState({ itemOver: false });
		}
	};

	private toggleItemSelection = e => {
		const { editList, item, setEditList, selected, analyticsEvent, index, list, deleteList } = this.props;
		if (!item) return;

		if (selected) {
			setEditList(editList.filter(editItem => editItem.id !== item.id));
		} else {
			const cardTotal = get(list, 'size') - deleteList.length;
			analyticsEvent(AnalyticsEventType.CW_PAGE_SELECT_SINGLE_REMOVE, { item, position: index, cardTotal });
			setEditList(editList.concat(item));
		}
	};

	private onClick = (event, redirectPath) => {
		event.preventDefault();
		const { updateSubscriptionEntryPoint } = this.props;
		updateSubscriptionEntryPoint(MixpanelEntryPoint.RailCard);
		browserHistory.push(redirectPath);
	};

	private wrapWatchCTA(children) {
		const { edit, item, titlePosition, hasHover, list, entryPoint, index } = this.props;
		const path = this.getWatchPath(item);
		const redirectPath = addQueryParameterToURL(path, {
			[FULLSCREEN_QUERY_PARAM]: true
		});
		const { title: itemTitle } = item;
		const showsTitle = titlePosition && titlePosition !== 'none';
		const videoEntryPoint = entryPoint || getVideoEntryPoint(list);
		const size = list['size'];
		const { tabEnabled } = this.props;

		return edit ? (
			children
		) : (
			<CTAWrapper type={CTATypes.Watch} data={{ item, index, size, list, entryPoint: videoEntryPoint }}>
				<Link
					to={redirectPath}
					title={showsTitle || hasHover ? '' : itemTitle}
					tabIndex={tabEnabled ? 0 : -1}
					aria-label={itemTitle}
					className={bem.e('link')}
					onClick={e => this.onClick(e, redirectPath)}
				>
					{children}
				</Link>
			</CTAWrapper>
		);
	}

	render() {
		const { edit, item, imageType, titlePosition, selected, className, vertical } = this.props;
		const showsTitle = titlePosition && titlePosition !== 'none';
		const imageTypeModifier = resolveFirstImageType(imageType);
		const classes = cx(bem.b(imageTypeModifier, { selected }, { edit }, { vertical }), className, {
			[`${item.type}-item`]: true
		});
		let title = get(item, 'title');
		const imageClasses = cx(bem.e('image', imageTypeModifier));
		const customFields = get(this, 'props.item.customFields');
		const showSecondaryLanguageTitle = get(customFields, 'show.secondaryLanguageTitle');
		const secondaryLanguageTitle = showSecondaryLanguageTitle || item.secondaryLanguageTitle;
		const showTitle = get(customFields, 'show.title');
		title = showTitle || title;

		let onMouseMoveFn = undefined;
		let onMouseLeaveFn = undefined;

		if (!this.isTouchDevice) {
			onMouseMoveFn = this.onMouseMove;
			onMouseLeaveFn = this.onMouseLeave;
		}
		return (
			<div className={classes} onMouseMove={onMouseMoveFn} onMouseLeave={onMouseLeaveFn}>
				<div className={imageClasses}>
					{this.wrapWatchCTA([this.renderImage(item, false, showsTitle), this.renderOverlay()])}
				</div>
				<div className={bem.e('details')}>
					{this.wrapWatchCTA(
						<div className={bem.e('metadata', 'with-info-icon')}>
							<PackshotTitle title={title} position={titlePosition} secondaryLanguageTitle={secondaryLanguageTitle} />
							<div>{this.continueWatchingInfo()}</div>
						</div>
					)}
					{!edit && this.renderMenuButton()}
				</div>
				{edit && this.renderEditScreen()}
			</div>
		);
	}

	private removeItem(item) {
		const { onRemoveItemClick } = this.props;
		this.setState({ isShowMenu: false });
		onRemoveItemClick(item);
	}

	private renderMenuButton() {
		const { item, index, entryTitleProps } = this.props;
		const { isShowMenu, isMenuActive } = this.state;
		const railPosition = entryTitleProps && entryTitleProps.index;
		return (
			<div className={bem.e('menu')} ref={this.onContainerRef}>
				<CWPopUp
					onClick={this.showBottomPanel}
					onInfoClick={this.onMetadataClick}
					onRemoveItemClick={() => this.removeItem(item)}
					isShowMenu={isShowMenu}
					isMenuActive={isMenuActive}
					handleClickInside={this.handleClickInside}
					item={item}
					index={index}
					railPosition={railPosition}
				/>
			</div>
		);
	}

	private renderEditScreen() {
		const { selected } = this.props;
		return (
			<div className={bem.e('edit-screen')} onClick={this.toggleItemSelection}>
				<Checkbox checked={selected} className={bem.e('checkbox')} disabled round />
			</div>
		);
	}

	private renderImage(item: api.ItemSummary, hasPath: boolean, showsTitle: boolean) {
		const { item: cardItem, showPartnerLogo } = this.props;
		const images = this.setInitialThumbnailImage();
		if (images && images.length && images[0].resolved) {
			const sources = images.map(source => convertResourceToSrcSet(source, true));
			const defaultImage = images[0];
			const displayWidth = defaultImage.displayWidth || defaultImage.width;
			const displayHeight = defaultImage.displayHeight || defaultImage.height;
			const displayLogo = !isChannel(cardItem) && showPartnerLogo;
			const progress = getItemProgress(item);

			return (
				<div className={bem.e('image-wrapper')} key="image-wrapper">
					<Image
						srcSet={sources}
						description={showsTitle || hasPath ? '' : item.title}
						width={displayWidth}
						height={displayHeight}
						className="img-r"
						ariaHidden={showsTitle}
					/>
					{displayLogo && (
						<PartnerLogo
							item={item}
							imageWidth={{ mobile: 50, tablet: 62, desktopWide: 77 }}
							className={bem.e('partner-logo')}
						/>
					)}
					{this.renderProgressBar(progress)}
					{this.renderBadge()}
				</div>
			);
		}

		const backgroundImage = showsTitle ? `url(${placeholderImage})` : 'none';

		return (
			<span
				style={{ backgroundImage }}
				className={cx('fb-title', 'truncate', { noimage: !showsTitle })}
				aria-hidden="true"
			>
				<span className="item-fb-title__text">{showsTitle ? '' : item.title}</span>
			</span>
		);
	}

	private renderProgressBar(progress: number) {
		return progress > 0 && <ProgressBar progress={progress} className={bem.e('progress')} />;
	}

	private renderOverlay() {
		if (this.isTouchDevice) return;
		const { itemOver } = this.state;
		const { hasOverlay, selected } = this.props;
		return ((itemOver && hasOverlay) || selected) && <PackshotOverlay isDark={true} key="image-overlay" />;
	}

	private renderBadge() {
		const { item } = this.props;
		return item.badge && <Badge item={item} className={bem.e('badge')} mod="packshot" />;
	}
}

function mapStateToProps({ profile }: state.Root, ownProps: CWItemProps): StoreProps {
	const editList = get(profile, 'continueWatching.editList') || [];
	const editMode = get(profile, 'continueWatching.editMode') || false;
	const { item } = ownProps;

	return {
		editList,
		edit: editMode,
		deleteList: get(profile, 'continueWatching.deleteList') || [],
		selected: editList.findIndex(editItem => editItem.id === item.id) > -1
	};
}

function mapDispatchToProps(dispatch) {
	return {
		analyticsEvent: (type, payload) => dispatch(analyticsEvent(type, payload)),
		setEditList: (editList: api.ItemSummary[]) => dispatch(setContinueWatchingEditList(editList)),
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		updateSubscriptionEntryPoint: payload => dispatch({ type: UPDATE_SUBSCRIPTION_ENTRY_POINT, payload: payload })
	};
}

const Component: any = connect<StoreProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(withClickToPlay<CWItemProps>()(CWItem));

export default withRouter(Component);
