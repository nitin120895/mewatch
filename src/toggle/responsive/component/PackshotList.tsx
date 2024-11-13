import * as cx from 'classnames';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { connect } from 'react-redux';
import { isAnonymousUser } from 'shared/account/sessionWorkflow';
import { CTATypes, VideoEntryPoint } from 'shared/analytics/types/types';
import { ROW_TEMPLATES_WITH_PROGRESS_BAR } from 'shared/page/pageEntryTemplate';
import { Home, Account, Search, ESearch } from 'shared/page/pageKey';
import { selectPageState } from 'shared/page/pageUtil';
import { ItemDetailTemplates } from 'shared/page/pageTemplate';
import { setListScrollPosition } from 'shared/page/pageWorkflow';
import {
	canWatchItemFromList,
	checkListData,
	getPackshotTitlePositon,
	getPackshotMetadataFormatting,
	getItemUnwatchedEpisodes,
	isSearchList,
	isBookmarksList,
	isListChainPlayable,
	getVideoEntryPoint
} from 'shared/list/listUtil';
import { resolveFirstImageType } from 'shared/util/images';
import { isXRowSubscriptionContent } from 'shared/util/itemUtils';
import { get } from 'shared/util/objects';
import { debounce, throttle } from 'shared/util/performance';
import { Bem } from 'shared/util/styles';
import { SearchResults } from 'shared/list/listId';
import { calculateMedianWidth, getColumnClasses } from 'toggle/responsive/util/grid';
import { isClickToWatch, isEpisode } from 'toggle/responsive/util/item';
import { hasHoverByItem } from 'toggle/responsive/util/item';
import Packshot, { PackshotProps } from './Packshot';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import Scrollable from 'toggle/responsive/component/Scrollable';
import 'toggle/responsive/component/PackshotList.scss';

type PackshotPropsMap = { [P in keyof PackshotProps]?: PackshotProps[P] };

export interface PackshotListProps extends React.Props<any> {
	id?: string;
	list: api.ItemList;
	imageType: image.Type | image.Type[];
	packshotClassName?: string;
	firstPackshotClassName?: string;
	packshotTitlePosition?: AssetTitlePosition;
	savedState?: any;
	className?: string;
	wrap?: boolean;
	doubleRow?: boolean;
	columns?: grid.BreakpointColumn[];
	onScroll?: (scrollX: number, useTransition?: boolean) => void;
	onReset?: () => void;
	onPackshotClicked?: (item: api.ItemSummary, index: number) => void;
	loadNextListPage?: (list: api.ItemList) => {};
	packshotProps?: PackshotPropsMap;
	component?: React.ComponentType<any>;
	edit?: boolean;
	ignoreLink?: boolean;
	template?: string;
	entryPoint?: VideoEntryPoint;
}
interface StateProps {
	isHomePage?: boolean;
	isAccountPage?: boolean;
	isSearchPage?: boolean;
	subscriptionCode?: string;
	segments?: string[];
	accountActive?: boolean;
	hasWatchedPlayback?: boolean;
	showPartnerLogo: boolean;
	isAnonymous: boolean;
	savedScrollState: { scrollX?: number };
}

interface DispatchProps {
	setListScrollPosition: typeof setListScrollPosition;
}
export interface PackshotListState extends React.Props<any> {
	placeholderItems?: api.ItemSummary[];
	medianColumnWidth: number;
}
type Props = StateProps & PackshotListProps & DispatchProps;

export const bem = new Bem('packshot-list');

/**
 * Packshot List
 *
 * Displays a list of item packshot images (with optional titles) with support for horizontally scrolling a
 * single row, or vertical wrapping multiple rows.
 *
 * The image dimensions are calculated from the columns array to allow for responsive reflow within the grid.
 */
class PackshotList extends React.Component<Props, PackshotListState> {
	static contextTypes: any = {
		entry: PropTypes.object.isRequired
	};

	context: { entry: PageEntryPropsBase };

	static defaultProps = {
		id: undefined,
		wrap: false,
		columns: [{ phone: 12 }, { phablet: 8 }, { tablet: 6 }, { laptop: 4 }, { desktop: 3 }]
	};

	// Width used when state.medianColumnWidth is unavailable
	static fallbackWidth = 200;

	private onLoadNextItemsThrottled: (e?: UIEvent) => void;
	private scroller: Scrollable;
	private allowWatch: boolean;
	private allowProgressBar: boolean;
	private onScrollerRef = ref => (this.scroller = ref);

	constructor(props, context) {
		super(props);

		this.onLoadNextItemsThrottled = throttle(this.onLoadNextItems, 250, true);

		const definesColumns = props && props.columns && props.columns.length;
		this.state = {
			placeholderItems: [],
			medianColumnWidth: definesColumns ? calculateMedianWidth(props.columns) : 0
		};
		this.checkListAttributes(props.list, context, props.id);
	}

	componentDidMount() {
		this.restoreScrollPosition();
	}

	componentDidUpdate(prevProps) {
		const { list, isSearchPage } = this.props;
		const page = get(list, 'paging.page');
		const prevPage = get(prevProps, 'paging.page');
		if (prevProps.list !== list && isSearchPage) {
			// Scroll list to the beginning if search query changed
			this.clearSavedScrollPosition();
		}
		if (prevProps.list !== list && page === prevPage) {
			this.restoreScrollPosition();
		}
	}

	componentWillReceiveProps(nextProps, nextContext) {
		if (!this.state.medianColumnWidth && nextProps.columns && nextProps.columns.length) {
			this.setState({
				medianColumnWidth: calculateMedianWidth(nextProps.columns)
			});
		}

		if (this.props.list !== nextProps.list) {
			this.checkListAttributes(nextProps.list, nextContext, nextProps.id);
			this.setState({ placeholderItems: [] });
		}
	}

	private restoreScrollPosition() {
		const { savedScrollState, list } = this.props;
		if (this.scroller && list && list.size > 0) {
			this.scroller.restoreScrollPosition(savedScrollState.scrollX);
		}
	}

	private clearSavedScrollPosition() {
		const { setListScrollPosition, list, id } = this.props;
		setListScrollPosition(id ? id : list.id, 0);
	}

	private checkListAttributes(list, context, id) {
		if (list && context.entry) {
			this.allowWatch = canWatchItemFromList(id ? id : list.id);
			this.allowProgressBar = ROW_TEMPLATES_WITH_PROGRESS_BAR.indexOf(context.entry.template) >= 0;
			checkListData(list);
		}
	}

	private getItemsList() {
		return this.props.list.items.concat(this.state.placeholderItems);
	}

	// The decision of Design team is to show empty placeholders while loading next items page
	// and change them to real Packshots after
	private getPlaceholderItems() {
		const { list } = this.props;
		const remainingItemsSize = list.size - list.items.length;
		const itemsCount = Math.min(remainingItemsSize, list.paging.size);
		const items = [];
		for (let i = 0; i < itemsCount; ++i) {
			items.push({ id: i, path: '', type: 'movie' });
		}

		return items;
	}

	private onScroll = debounce((scrollX: number, useTransition: boolean) => {
		const { onScroll, setListScrollPosition, list } = this.props;
		if (list.id === SearchResults) {
			setListScrollPosition(list.key, scrollX);
		} else {
			setListScrollPosition(list.id, scrollX);
		}
		if (onScroll) onScroll(scrollX, useTransition);
	}, 100);

	private onLoadNext = () => {
		this.onLoadNextItemsThrottled();
	};

	private onLoadNextItems = () => {
		const { list, loadNextListPage } = this.props;
		if (loadNextListPage && list.items.length < list.size) {
			this.setState({ placeholderItems: this.getPlaceholderItems() });
			loadNextListPage(list);
		}
	};

	render() {
		const {
			list,
			className,
			imageType,
			doubleRow,
			wrap,
			onReset,
			children,
			columns,
			savedScrollState,
			packshotTitlePosition
		} = this.props;
		const itemsLength = get(list, 'items.length');

		if (!itemsLength) return false;

		const titleBelow = (getPackshotTitlePositon(list) || packshotTitlePosition) === 'below';
		const hasSecondaryTitle = list.items.some(item => !!item.secondaryLanguageTitle);
		const bookmarks = isBookmarksList(list);

		const classes = cx(
			bem.b(resolveFirstImageType(imageType), { 'double-row': doubleRow && !wrap }),
			className,
			{ row: wrap },
			{ 'row-peek': !wrap },
			{ 'title-below': titleBelow },
			{ 'has-secondary': hasSecondaryTitle },
			{ bookmarks: bookmarks }
		);

		const itemsList = this.getItemsList();

		if (wrap) {
			// Vertically scrolling list without any additional children.
			return <div className={classes}>{this.renderList(itemsList)}</div>;
		}

		// Horizontally scrolling list with optional prefixed children
		return (
			<Scrollable
				className={classes}
				length={itemsList.length}
				onScroll={this.onScroll}
				onLoadNext={this.onLoadNext}
				onReset={onReset}
				ref={this.onScrollerRef}
				columns={columns}
				scrollX={savedScrollState.scrollX}
			>
				{children}
				{!doubleRow ? this.renderList(itemsList) : this.renderDoubleRowList(itemsList)}
			</Scrollable>
		);
	}

	private renderList(list) {
		const { packshotClassName, firstPackshotClassName, columns } = this.props;
		const packshotClasses = cx(bem.e('packshot'), packshotClassName, ...getColumnClasses(columns));

		return list.map((item, i) =>
			this.renderPackshot(
				i,
				item,
				cx(packshotClasses, {
					[firstPackshotClassName]: firstPackshotClassName && i === 0
				})
			)
		);
	}

	private renderDoubleRowList(list) {
		const { packshotClassName, firstPackshotClassName, columns } = this.props;
		const packshotClasses = cx('packshot', bem.e('packshot'), packshotClassName, ...getColumnClasses(columns));

		return list.map((item, i) => {
			if (i % 2 !== 0) return false;

			const nextPackshot = list[i + 1];
			return (
				<div
					key={`${item.id}-double-${i}`}
					className={cx(packshotClasses, {
						[firstPackshotClassName]: firstPackshotClassName && i === 0
					})}
				>
					{this.renderPackshot(i, item)}
					{nextPackshot && this.renderPackshot(i + 1, nextPackshot)}
				</div>
			);
		});
	}

	private renderPackshot(index, item, className = undefined) {
		const {
			entryPoint,
			imageType,
			packshotTitlePosition,
			packshotProps,
			component,
			ignoreLink,
			edit,
			list,
			showPartnerLogo,
			template,
			onPackshotClicked
		} = this.props;

		const imageOptions: image.Options = {
			width: this.state.medianColumnWidth || PackshotList.fallbackWidth
		};

		const isWatchable = isClickToWatch(item, template) && item && !edit;

		const videoEntryPoint = entryPoint || getVideoEntryPoint(list);

		const hasHover = hasHoverByItem(item);

		const titlePosition = getPackshotTitlePositon(list) || packshotTitlePosition;

		const unwatchedEpisodes = getItemUnwatchedEpisodes(list, item);
		const searchList = isSearchList(list);

		const onClickedFn = onPackshotClicked ? onPackshotClicked : undefined;

		const PackshotComponent = component || Packshot;
		const PackshotChild = (
			<PackshotComponent
				key={`${item.id}-${index}`}
				className={cx(bem.e('packshot'), className)}
				index={index}
				item={item}
				imageType={imageType}
				imageOptions={imageOptions}
				titlePosition={titlePosition}
				onClicked={onClickedFn}
				allowProgressBar={this.allowProgressBar}
				hasHover={hasHover}
				hasOverlay
				allowWatch={this.allowWatch}
				metadataFormatting={getPackshotMetadataFormatting(list)}
				edit={edit}
				ignoreLink={ignoreLink}
				unwatchedEpisodes={unwatchedEpisodes}
				searchList={searchList}
				showPartnerLogo={showPartnerLogo}
				template={template}
				isEpisodeItem={isEpisode(item)}
				requiresUpdatedItem={isXRowSubscriptionContent(item, template)}
				listData={list.listData || {}}
				getListKey={() => list.key}
				chainPlay={isListChainPlayable(list)}
				{...packshotProps}
			/>
		);

		return isWatchable ? (
			<CTAWrapper type={CTATypes.Watch} data={{ item, entryPoint: videoEntryPoint }} key={item.id}>
				{PackshotChild}
			</CTAWrapper>
		) : (
			PackshotChild
		);
	}
}

function mapStateToProps(store: state.Root, ownProps: PackshotListProps): StateProps {
	const { page, account, profile, player, app } = store;
	const isAnonymous = isAnonymousUser(store);
	const pageKey = get(page, 'history.pageSummary.key');
	const isHomePage = get(page, 'history.pageSummary.key') === Home;
	const isAccountPage = get(page, 'history.pageSummary.key') === Account;
	const isSearchPage = pageKey === Search || pageKey === ESearch;
	const pageTemplate = get(page, 'history.pageSummary.template');
	const isItemDetailsPage = pageTemplate && ItemDetailTemplates.includes(pageTemplate);
	const showPartnerLogo = isItemDetailsPage ? get(app, 'config.general.customFields.ShowPartnerLogo') : 1;
	const hasWatchedPlayback = !!Object.entries(player.realVideoPosition).length;
	const savedScrollState = get(selectPageState(store), ownProps.id ? ownProps.id : ownProps.list.id) || {};

	return {
		isHomePage,
		isAccountPage,
		isSearchPage,
		isAnonymous,
		subscriptionCode: get(account, 'info.subscriptionCode'),
		segments: isAnonymous ? ['all'] : get(profile, 'info.segments'),
		accountActive: account.active,
		showPartnerLogo: !!showPartnerLogo,
		hasWatchedPlayback,
		savedScrollState
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		setListScrollPosition: (listId, scrollX) => dispatch(setListScrollPosition(listId, scrollX))
	};
}

export default connect<StateProps, any, PackshotListProps>(
	mapStateToProps,
	mapDispatchToProps
)(PackshotList);
