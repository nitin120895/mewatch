import * as cx from 'classnames';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { canWatchItemFromList, checkListData } from 'shared/list/listUtil';
import { ROW_TEMPLATES_WITH_PROGRESS_BAR } from 'shared/page/pageEntryTemplate';
import { resolveFirstImageType } from 'shared/util/images';
import { Bem } from 'shared/util/styles';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import { CTATypes } from 'shared/analytics/types/types';
import { calculateMedianWidth, getColumnClasses } from '../util/grid';
import { getItemWatchOptions } from '../util/item';
import Packshot from './Packshot';
import Scrollable from './Scrollable';
import { throttle } from 'shared/util/performance';
import { hasHoverByItem } from '../util/item';
import { PackshotProps } from './Packshot';

import './PackshotList.scss';

type PackshotPropsMap = { [P in keyof PackshotProps]?: PackshotProps[P] };

export interface PackshotListProps extends React.Props<any> {
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
}

export interface PackshotListState extends React.Props<any> {
	placeholderItems?: api.ItemSummary[];
	medianColumnWidth: number;
}

const bem = new Bem('packshot-list');

/**
 * Packshot List
 *
 * Displays a list of item packshot images (with optional titles) with support for horizontally scrolling a
 * single row, or vertical wrapping multiple rows.
 *
 * The image dimensions are calculated from the columns array to allow for responsive reflow within the grid.
 */
export default class PackshotList extends React.Component<PackshotListProps, PackshotListState> {
	static contextTypes: any = {
		entry: PropTypes.object.isRequired
	};

	context: { entry: PageEntryPropsBase };

	static defaultProps = {
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
		this.checkListAttributes(props.list, context);
	}

	componentDidMount() {
		this.restoreScrollPosition();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.list !== this.props.list) {
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

	private restoreScrollPosition() {
		const { savedState, list } = this.props;
		if (this.scroller && savedState && list && list.size > 0) {
			this.scroller.restoreScrollPosition(savedState.scrollX || 0);
		}
	}

	private checkListAttributes(list, context) {
		if (list && context.entry) {
			this.allowWatch = canWatchItemFromList(list.id);
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

	private onScroll = (scrollX: number, useTransition: boolean) => {
		const { savedState, onScroll } = this.props;
		if (savedState) savedState.scrollX = scrollX;
		if (onScroll) onScroll(scrollX, useTransition);
	};

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
		const { list, className, imageType, doubleRow, wrap, onReset, children, columns, savedState } = this.props;

		if (!list || !list.items || !list.items.length) return false;

		const classes = cx(
			bem.b(resolveFirstImageType(imageType), { 'double-row': doubleRow && !wrap }),
			className,
			{ row: wrap },
			{ 'row-peek': !wrap }
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
				scrollX={(savedState && savedState.scrollX) || 0}
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
		const { imageType, packshotTitlePosition, onPackshotClicked, packshotProps, component } = this.props;
		const imageOptions: image.Options = {
			width: this.state.medianColumnWidth || PackshotList.fallbackWidth
		};

		const watchOptions = getItemWatchOptions(item);
		const isWatchable = watchOptions.watchable && item;
		const hasHover = hasHoverByItem(item);

		const PackshotComponent = component || Packshot;
		const PackshotChild = (
			<PackshotComponent
				key={`${item.id}-${index}`}
				className={cx(bem.e('packshot'), className)}
				index={index}
				item={item}
				imageType={imageType}
				imageOptions={imageOptions}
				titlePosition={packshotTitlePosition}
				onClicked={onPackshotClicked}
				allowProgressBar={this.allowProgressBar}
				hasHover={hasHover}
				hasOverlay
				allowWatch={this.allowWatch}
				{...packshotProps}
			/>
		);

		return isWatchable ? (
			<CTAWrapper type={CTATypes.Watch} data={{ item }} key={item.id}>
				{PackshotChild}
			</CTAWrapper>
		) : (
			PackshotChild
		);
	}
}
