import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as cx from 'classnames';
import { Store } from 'redux';
import ScrollLoader from 'ref/responsive/component/ScrollLoader';
import PackshotList from 'ref/responsive/component/PackshotList';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { getListKey, SORT_OPTIONS_LOOKUP } from 'shared/list/listUtil';
import { DropSelectOption, DropSelect, PLACEHOLDER_KEY } from '../../component/DropSelect';
import { OfflineStatus } from 'shared/app/offlineStatus';
import { Bem } from 'shared/util/styles';

import './ContinuousScrollPackshotList.scss';

export interface ContinuousScrollPackshotListProps extends PageEntryListProps {
	queryParamsEnabled?: boolean;
	columns: grid.BreakpointColumn[];
	imageType: image.Type;
}

interface ContinuousScrollPackshotListState {
	classificationOptions?: DropSelectOption[];
	selectedClassification?: string;
	selectedSort?: string;
	listPageLoading?: boolean;
	listLoaded?: boolean;
	offline?: boolean;
}

const DEFAULT_CLASSIFICATION_OPTION = {
	label: 'Any',
	key: PLACEHOLDER_KEY
};

const DEFAULT_SORT_OPTION = {
	label: 'listPage_sort_default',
	key: PLACEHOLDER_KEY
};

// Don't edit these sort option keys.
//
// The keys represent short form order query parameters
// and get passed through to Rocket which understands
// how to expand them in to sort full options.
const SORT_OPTIONS = [
	{ label: 'listPage_sort_aToz', key: 'a-z' },
	{ label: 'listPage_sort_zToa', key: 'z-a' },
	{ label: 'listPage_sort_latestRelease', key: 'latest-release' },
	{ label: 'listPage_sort_oldestRelease', key: 'oldest-release' },
	{ label: 'listPage_sort_latestAdded', key: 'latest-added' },
	{ label: 'listPage_sort_oldestAdded', key: 'oldest-added' }
];

const bem = new Bem('cs-packshot-list');

/**
 * Continuous Scroll Packshot List
 *
 * The base component used for CS rows (CS1-5) on list pages
 */
export default class ContinuousScrollPackshotList extends React.Component<
	ContinuousScrollPackshotListProps,
	ContinuousScrollPackshotListState
> {
	static contextTypes = {
		router: PropTypes.object.isRequired,
		store: PropTypes.object.isRequired,
		offlineStatus: PropTypes.object.isRequired
	};

	context: {
		store: Store<state.Root>;
		router: ReactRouter.InjectedRouter;
		offlineStatus: OfflineStatus;
	};

	constructor(props) {
		super(props);
		this.state = {
			listPageLoading: false,
			listLoaded: false,
			offline: false
		};
	}

	componentWillMount() {
		const classificationMap = this.context.store.getState().app.config.classification;
		this.setState({
			classificationOptions: getClassificationOptions(classificationMap)
		});
	}

	componentDidMount() {
		this.context.offlineStatus.subscribe(this.onConnectivityChange);
		this.onConnectivityChange(this.context.offlineStatus);
		this.syncLocation(this.props.location);
		this.checkLoadedState(this.props.list);
	}

	componentWillUnmount() {
		this.context.offlineStatus.unsubscribe(this.onConnectivityChange);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.location !== this.props.location) {
			this.syncLocation(nextProps.location);
		}
		if (nextProps.list && nextProps.list !== this.props.list) {
			this.checkLoadedState(nextProps.list);
		}
	}

	private checkLoadedState(list) {
		if (!list) return;
		this.setState({
			listPageLoading: list.size === -1,
			listLoaded: list.size === list.items.length
		});
	}

	private syncLocation(location: HistoryLocation) {
		let selectedSort, selectedClassification;
		if (location && location.query) {
			selectedSort = location.query['order'];
			selectedClassification = location.query['max_rating'];
		}
		if (!selectedSort) selectedSort = DEFAULT_SORT_OPTION.key;
		if (!selectedClassification) selectedClassification = DEFAULT_CLASSIFICATION_OPTION.key;

		this.setState({
			selectedSort,
			selectedClassification
		});
	}

	private onConnectivityChange = (offlineStatus: OfflineStatus) => {
		this.setState({ offline: offlineStatus.isOffline() });
	};

	private onSelectSort = (selectedSort: string) => {
		if (selectedSort === this.state.selectedSort) return;

		this.setState({ selectedSort, listPageLoading: true, listLoaded: false });
		this.onSortFilter(selectedSort, this.state.selectedClassification);
	};

	private onSelectClassification = (selectedClassification: string) => {
		if (selectedClassification === this.state.selectedClassification) return;

		this.setState({
			selectedClassification,
			listPageLoading: true,
			listLoaded: false
		});
		this.onSortFilter(this.state.selectedSort, selectedClassification);
	};

	private resetFilters = e => {
		this.setState({
			selectedSort: DEFAULT_SORT_OPTION.key,
			selectedClassification: DEFAULT_CLASSIFICATION_OPTION.key
		});
		this.onSortFilter(DEFAULT_SORT_OPTION.key, DEFAULT_CLASSIFICATION_OPTION.key);
	};

	private onScrollBottom = () => {
		const { list, loadNextListPage } = this.props;
		this.setState({ listPageLoading: true });
		loadNextListPage(list);
	};

	private onSortFilter = (sortKey: string, maxRating: string) => {
		if (sortKey === DEFAULT_SORT_OPTION.key) sortKey = undefined;
		if (maxRating === DEFAULT_CLASSIFICATION_OPTION.key) maxRating = undefined;

		if (this.props.queryParamsEnabled) {
			this.updateQueryParams(sortKey, maxRating);
		} else {
			this.loadListDirectly(sortKey, maxRating);
		}
	};

	/**
	 * If persisting sort/filter state in query parameters then delegate
	 * list loading via page changes by updating query parameters.
	 */
	private updateQueryParams(sort: string, maxRating: string) {
		const params = [];
		if (sort) params.push(`order=${encodeURIComponent(sort)}`);
		if (maxRating) params.push(`max_rating=${encodeURIComponent(maxRating)}`);
		const query = params.length ? `?${params.join('&')}` : '';
		const path = `${this.props.location.pathname}${query}`;
		this.context.router.push(path);
	}

	/**
	 * If not managing sort/filter state in query parameters then store
	 * in local persisted state and trigger the list page load directly.
	 */
	private loadListDirectly(sortKey: string, maxRating: string) {
		const { list, loadListPage, savedState } = this.props;
		let options = SORT_OPTIONS_LOOKUP[sortKey] || {};
		if (maxRating) {
			options = Object.assign({ maxRating }, options);
		}
		const listKey = getListKey(list, options);
		savedState.listKey = listKey;
		loadListPage(list, 1, options);
	}

	render() {
		const { list } = this.props;
		const hasItems = list.size > 0 || list.size === -1;
		const filters = this.renderFilterSortDropDowns();
		return (
			<div className={bem.b({ flush: !!filters })}>
				{filters}
				{hasItems ? this.renderPackshotList() : this.renderFilterMismatch()}
			</div>
		);
	}

	private renderFilterSortDropDowns() {
		const { customFields, queryParamsEnabled } = this.props;
		// We don't yet fully support sort/filter when embedding a continuous scroll list
		// inside a non-list detail page as we need to maintain the sort/filter state
		// in storage and not query parameters. For now we don't present the sort/filter
		// options unless 'queryParamsEnabled' is true along with 'displayFilter'
		if (!customFields || !customFields.displayFilter || !queryParamsEnabled) return false;
		const { classificationOptions, selectedClassification, selectedSort, offline } = this.state;
		const classes = cx('filter-sort-drop-down-container', 'filter-sort-drop-downs', { offline });
		return (
			<div className={classes}>
				<DropSelect
					label="listPage_sort"
					selectedKey={selectedSort}
					defaultOption={DEFAULT_SORT_OPTION}
					options={SORT_OPTIONS}
					useTranslations={true}
					onSelect={this.onSelectSort}
				/>
				<DropSelect
					label="listPage_filter_rating"
					selectedKey={selectedClassification}
					defaultOption={DEFAULT_CLASSIFICATION_OPTION}
					options={classificationOptions}
					onSelect={this.onSelectClassification}
				/>
			</div>
		);
	}

	private renderPackshotList() {
		const { list, imageType, customFields, columns, savedState } = this.props;
		const { listPageLoading, listLoaded } = this.state;

		return (
			<ScrollLoader key="loader" enabled={!listLoaded} loading={listPageLoading} onLoad={this.onScrollBottom}>
				<PackshotList
					list={list}
					wrap={true}
					savedState={savedState}
					imageType={imageType}
					packshotTitlePosition={customFields ? customFields.assetTitlePosition : undefined}
					columns={columns}
				/>
			</ScrollLoader>
		);
	}

	private renderFilterMismatch() {
		return (
			<div>
				<IntlFormatter elementType="div" className="page-entry page-entry--empty">
					{`@{listPage_filter_mismatch_msg|Sorry, no items match your filter options}`}
				</IntlFormatter>
				<IntlFormatter elementType="button" className="clear-list-filters-btn" onClick={this.resetFilters}>
					{`@{listPage_filter_reset_label|Reset filters}`}
				</IntlFormatter>
			</div>
		);
	}
}

function getClassificationOptions(classifications): DropSelectOption[] {
	return Object.keys(classifications || {}).map(code => {
		const classification = classifications[code];
		return {
			label: classification.name,
			key: classification.code
		};
	});
}
