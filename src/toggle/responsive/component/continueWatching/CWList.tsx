import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import * as PropTypes from 'prop-types';

import { attemptDeleteContinueWatching } from 'shared/account/profileWorkflow';
import { isAnonymousUser } from 'shared/account/sessionWorkflow';
import { VideoEntryPoint } from 'shared/analytics/types/types';
import { checkListData, getPackshotMetadataFormatting } from 'shared/list/listUtil';
import { updateContinueWatchingList } from 'shared/list/listWorkflow';
import { Home, Account } from 'shared/page/pageKey';
import { ItemDetailTemplates } from 'shared/page/pageTemplate';
import { isCWPage, selectPageState } from 'shared/page/pageUtil';
import { setListScrollPosition } from 'shared/page/pageWorkflow';
import { resolveFirstImageType } from 'shared/util/images';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';
import { debounce, throttle } from 'shared/util/performance';
import { calculateMedianWidth, getColumnClasses } from 'toggle/responsive/util/grid';
import { hasHoverByItem } from 'toggle/responsive/util/item';

import CWItem, { CWItemProps } from 'toggle/responsive/component/continueWatching/CWItem';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import Scrollable from 'toggle/responsive/component/Scrollable';

import './CWList.scss';

type CWPropsMap = { [P in keyof CWItemProps]?: CWItemProps[P] };

export interface OwnProps extends React.Props<any> {
	list: api.ItemList;
	imageType: image.Type | image.Type[];
	packshotClassName?: string;
	firstPackshotClassName?: string;
	className?: string;
	wrap?: boolean;
	vertical?: boolean;
	columns?: grid.BreakpointColumn[];
	onScroll?: (scrollX: number, useTransition?: boolean) => void;
	onReset?: () => void;
	loadNextListPage?: (list: api.ItemList) => {};
	packshotProps?: CWPropsMap;
	component?: React.ComponentType<any>;
	entryPoint?: VideoEntryPoint;
	entryTitleProps?: any;
}
interface StateProps {
	isHomePage?: boolean;
	isAccountPage?: boolean;
	isContinueWatchingPage?: boolean;
	subscriptionCode?: string;
	segments?: string[];
	accountActive?: boolean;
	hasWatchedPlayback?: boolean;
	showPartnerLogo: boolean;
	isAnonymous: boolean;
	savedScrollState: { scrollX?: number };
	deleteList: api.ItemSummary[];
}

interface DispatchProps {
	attemptDeleteContinueWatching: (items: api.ItemSummary[], railPosition?: number) => void;
	getContinueWatchingList: () => void;
	setListScrollPosition: typeof setListScrollPosition;
}
export interface CWListState extends React.Props<any> {
	placeholderItems?: api.ItemSummary[];
	medianColumnWidth: number;
	onClose?: (id: string) => void;
}
type CWListProps = StateProps & DispatchProps & OwnProps;

const bem = new Bem('cw-list');
class CWList extends React.Component<CWListProps, CWListState> {
	static contextTypes: any = {
		entry: PropTypes.object.isRequired
	};

	context: { entry: PageEntryPropsBase };

	static defaultProps = {
		wrap: false,
		vertical: false,
		columns: [{ phone: 12 }, { phablet: 8 }, { tablet: 6 }, { laptop: 4 }, { desktop: 3 }]
	};

	static fallbackWidth = 200;

	private onLoadNextItemsThrottled: (e?: UIEvent) => void;
	private scroller: Scrollable;
	private onScrollerRef = ref => (this.scroller = ref);

	constructor(props, context) {
		super(props);

		this.onLoadNextItemsThrottled = throttle(this.onLoadNextItems, 250, true);

		const definesColumns = props && props.columns && props.columns.length;
		this.state = {
			placeholderItems: [],
			medianColumnWidth: definesColumns ? calculateMedianWidth(props.columns) : 0
		};

		this.checkListAttributes(props.list, context);
	}

	componentDidMount() {
		this.updateContinueWatchingList();
		this.restoreScrollPosition();
	}

	componentDidUpdate(prevProps) {
		const { list } = this.props;
		const page = get(list, 'paging.page');
		const prevPage = get(prevProps, 'paging.page');

		if (prevProps.list !== list) {
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
			this.checkListAttributes(nextProps.list, nextContext);
			this.setState({ placeholderItems: [] });
		}
	}

	private updateContinueWatchingList() {
		const {
			isContinueWatchingPage,
			isHomePage,
			getContinueWatchingList,
			accountActive,
			isAccountPage,
			hasWatchedPlayback
		} = this.props;

		const shouldCheckCWListUpdate =
			hasWatchedPlayback && (isHomePage || isContinueWatchingPage || (isAccountPage && accountActive));
		if (!shouldCheckCWListUpdate) {
			return;
		}

		getContinueWatchingList();
	}

	onRemoveItemClick = item => {
		const { attemptDeleteContinueWatching } = this.props;
		const railPosition = get(this.props, 'entryTitleProps.index');
		attemptDeleteContinueWatching([item], railPosition); // railPosition is used to send in mixpanel anlytics event of cw_menu_undo_remove
	};

	private restoreScrollPosition() {
		const { savedScrollState, list } = this.props;
		if (this.scroller && list && list.size > 0) {
			this.scroller.restoreScrollPosition(savedScrollState.scrollX);
		}
	}

	private clearSavedScrollPosition() {
		const { setListScrollPosition, list } = this.props;
		setListScrollPosition(list.id, 0);
	}

	private checkListAttributes(list, context) {
		if (list && context.entry) {
			checkListData(list);
		}
	}

	private getItemsList() {
		return this.props.list.items.concat(this.state.placeholderItems);
	}

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
		setListScrollPosition(list.id, scrollX);
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
			deleteList,
			imageType,
			wrap,
			onReset,
			children,
			columns,
			savedScrollState,
			entryTitleProps
		} = this.props;

		const deleteIds = deleteList ? deleteList.map(item => item.id) : [];

		const itemsLength = get(list, 'items.length');
		if (!itemsLength) return false;
		const hasSecondaryTitle = list.items.some(item => !!item.secondaryLanguageTitle);

		const classes = cx(
			bem.b(resolveFirstImageType(imageType)),
			className,
			{ row: wrap },
			{ 'row-peek': !wrap },
			{ 'title-below': 'below' },
			{ 'has-secondary': hasSecondaryTitle }
		);
		const itemsList = this.getItemsList();
		const filteredList = itemsList.filter(item => deleteIds.indexOf(item.id) === -1);

		if (wrap) {
			return <div className={classes}>{this.renderList(filteredList)}</div>;
		}

		return (
			<div>
				{filteredList.length > 0 && entryTitleProps && <EntryTitle {...entryTitleProps} />}
				<Scrollable
					className={classes}
					length={filteredList.length}
					onScroll={this.onScroll}
					onLoadNext={this.onLoadNext}
					onReset={onReset}
					ref={this.onScrollerRef}
					columns={columns}
					scrollX={savedScrollState.scrollX}
				>
					{children}
					{this.renderList(filteredList)}
				</Scrollable>
			</div>
		);
	}

	private renderList(list) {
		const { packshotClassName, firstPackshotClassName, columns } = this.props;
		const packshotClasses = cx(bem.e('item'), packshotClassName, ...getColumnClasses(columns));

		return list.map((item, i) =>
			this.renderCWItem(
				i,
				item,
				cx(packshotClasses, {
					[firstPackshotClassName]: firstPackshotClassName && i === 0
				})
			)
		);
	}

	private renderCWItem(index, item, className = undefined) {
		const {
			entryPoint,
			imageType,
			packshotProps,
			component,
			list,
			showPartnerLogo,
			vertical,
			entryTitleProps
		} = this.props;
		const { medianColumnWidth } = this.state;
		const imageOptions: image.Options = {
			width: medianColumnWidth || CWList.fallbackWidth
		};

		const hasHover = hasHoverByItem(item);

		const CWComponent = component || CWItem;
		const CWChild = (
			<CWComponent
				key={index}
				className={cx(bem.e('cw-item'), className)}
				index={index}
				item={item}
				imageType={imageType}
				imageOptions={imageOptions}
				titlePosition={'below'}
				hasHover={hasHover}
				hasOverlay
				metadataFormatting={getPackshotMetadataFormatting(list)}
				showPartnerLogo={showPartnerLogo}
				list={list}
				entryTitleProps={entryTitleProps}
				entryPoint={entryPoint}
				vertical={vertical}
				onRemoveItemClick={this.onRemoveItemClick}
				{...packshotProps}
			/>
		);

		return CWChild;
	}
}

function mapStateToProps(store: state.Root, ownProps: CWListProps): StateProps {
	const { page, account, profile, player, app } = store;
	const isAnonymous = isAnonymousUser(store);
	const isHomePage = get(page, 'history.pageSummary.key') === Home;
	const isAccountPage = get(page, 'history.pageSummary.key') === Account;
	const isContinueWatchingPage = isCWPage(get(page, 'history.pageSummary.key'));
	const pageTemplate = get(page, 'history.pageSummary.template');
	const isItemDetailsPage = pageTemplate && ItemDetailTemplates.includes(pageTemplate);
	const showPartnerLogo = isItemDetailsPage ? get(app, 'config.general.customFields.ShowPartnerLogo') : 1;
	const hasWatchedPlayback = !!Object.entries(player.realVideoPosition).length;
	const savedScrollState = get(selectPageState(store), ownProps.list.id) || {};
	const deleteList = get(profile, 'continueWatching.deleteList') || [];

	return {
		isHomePage,
		isAccountPage,
		isAnonymous,
		isContinueWatchingPage,
		deleteList,
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
		attemptDeleteContinueWatching: (items: api.ItemSummary[], railPosition?: number) =>
			dispatch(attemptDeleteContinueWatching(items, railPosition)),
		getContinueWatchingList: () => dispatch(updateContinueWatchingList()),
		setListScrollPosition: (listId, scrollX) => dispatch(setListScrollPosition(listId, scrollX))
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(CWList);
