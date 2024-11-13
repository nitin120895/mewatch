import * as React from 'react';
import { connect } from 'react-redux';
import IntlFormatter from 'ref/tv/component/IntlFormatter';
import { Lh1Standard as LH1, Lh2Centered as LH2 } from 'shared/page/pageEntryTemplate';
import { getListKey, SORT_OPTIONS_LOOKUP } from 'shared/list/listUtil';
import { DropButton, DropButtonOption, PLACEHOLDER_KEY } from 'ref/tv/component/DropButton';
import { Bem } from 'shared/util/styles';
import { Focusable } from 'ref/tv/focusableInterface';
import { focusedClass } from 'ref/tv/util/focusUtil';
import { DirectionalNavigation, GlobalEvent } from 'ref/tv/DirectionalNavigation';
import { refreshPage } from 'shared/page/pageWorkflow';
import TitledListModal from 'ref/tv/component/modal/TitledListModal';
import { DetailHelper } from 'ref/tv/util/detailHelper';
import sass from 'ref/tv/util/sass';
import { Watched as watchedListId } from 'shared/list/listId';
import { addWatchPosition } from 'ref/tv/util/itemUtils';
import { canPlay } from 'ref/responsive/pageEntry/util/offer';
import ContinuousScrollListRow from './ContinuousScrollListRow';
import './ContinuousScrollList.scss';

export interface ContinuousScrollListProps extends PageEntryListProps {
	profile: state.Profile;
	queryParamsEnabled?: boolean;
	imageType: image.Type | image.Type[];
	imageWidth: number;
	itemsPerRow: number;
	isUserList?: boolean;
	loadNextPage?: (pageNum: number) => void;
}

type ContinuousScrollListDispatchProps = Partial<{
	selectedClassification: string;
	selectedSort: string;
	refreshPage: () => void;
}>;

interface ContinuousScrollListState {
	list: api.ItemList;
	selectedClassification?: string;
	selectedSort?: string;
	listPageLoading?: boolean;
	listLoaded?: boolean;
	selectedIndex: number;
	selectedItemId: string;
	isFocused?: boolean;
	focusState?: 'sort' | 'filter' | 'list' | 'clear';
}

const DEFAULT_CLASSIFICATION_OPTION = {
	label: 'classification_default',
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
// tbc : we'll do International Support in Sprint 6
const SORT_OPTIONS = [
	DEFAULT_SORT_OPTION,
	{ label: 'listPage_sort_aToz', key: 'a-z' },
	{ label: 'listPage_sort_zToa', key: 'z-a' },
	{ label: 'listPage_sort_latestAdded', key: 'latest-added' },
	{ label: 'listPage_sort_oldestAdded', key: 'oldest-added' },
	{ label: 'listPage_sort_latestRelease', key: 'latest-release' },
	{ label: 'listPage_sort_oldestRelease', key: 'oldest-release' }
];

const bem = new Bem('cs-list');
const ITEM_MARGIN = sass.itemMargin;

type CSLProps = ContinuousScrollListProps & ContinuousScrollListDispatchProps;

/**
 * Continuous Scroll  List
 *
 * The base component used for CS rows (CS1-5) on list pages
 */
class ContinuousScrollList extends React.Component<CSLProps, ContinuousScrollListState> {
	private ref: HTMLElement;
	private focusableRow: Focusable;
	private classificationOptions: DropButtonOption[] = [];
	private displayFilter: boolean;
	private itemHeight: number;
	private rows: api.ItemDetail[][];

	static contextTypes: any = {
		router: React.PropTypes.object.isRequired,
		focusNav: React.PropTypes.object.isRequired,
		detailHelper: React.PropTypes.object.isRequired
	};

	context: {
		router: ReactRouter.InjectedRouter;
		focusNav: DirectionalNavigation;
		detailHelper: DetailHelper;
	};

	constructor(props: CSLProps) {
		super(props);

		this.state = {
			list: props.list,
			listPageLoading: false,
			listLoaded: false,
			selectedIndex: 0,
			selectedItemId: '',
			isFocused: false,
			focusState: 'list'
		};

		this.focusableRow = {
			internalNavi: true,
			focusable: true,
			index: (props.index + 1) * 10,
			height: 0,
			maxHeight: 0,
			innerTop: 0,
			template: props.template,
			entryProps: props,
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: this.exec,
			getLeftToViewport: this.getLeftToViewport,
			setFocusState: this.setFocusState
		};

		this.calcFilter(props);
		this.calcRowHeight(props);
		this.mapRows(props.list, props.itemsPerRow, props.profile);
	}

	componentDidMount() {
		const { list } = this.state;
		this.focusableRow.ref = this.ref;
		this.context.focusNav.registerRow(this.focusableRow);
		this.context.focusNav.blockScrollOnce = true;
		this.context.focusNav.moveToRow(this.focusableRow.index);
		this.classificationOptions = this.getClassificationOptions(this.context.detailHelper.classification);

		if (list.size <= 0 && list.size !== -1) {
			this.setState({ focusState: 'clear' });
		}

		this.context.focusNav.addEventHandler(GlobalEvent.BACK_TO_TOP, 'row' + this.props.index, () => {
			const selectedItem = list.items && list.items.length > 0 && list.items[0];
			this.setState({ selectedIndex: 0, selectedItemId: selectedItem ? selectedItem.id : '', focusState: 'list' });
		});
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
		this.context.focusNav.removeEventHandler(GlobalEvent.BACK_TO_TOP, 'row' + this.props.index);
	}

	componentWillReceiveProps(nextProps: CSLProps) {
		if (nextProps.list && nextProps.list !== this.state.list) {
			this.checkLoadedState(nextProps.list);

			if (nextProps.list.id !== this.state.list.id) {
				this.setState({
					selectedSort: DEFAULT_SORT_OPTION.key,
					selectedClassification: DEFAULT_CLASSIFICATION_OPTION.key
				});
				this.context.focusNav.blockScrollOnce = true;
			} else if (nextProps.location && nextProps.location.query && Object.keys(nextProps.location.query).length === 0) {
				this.resetFilters(undefined);
			}

			this.calcFilter(nextProps);
			this.calcRowHeight(nextProps);
			this.mapRows(nextProps.list, nextProps.itemsPerRow, nextProps.profile);
			this.context.focusNav.moveToRow(this.focusableRow.index);
		}

		this.focusableRow.entryProps = nextProps;
	}

	componentDidUpdate() {
		const { list, selectedIndex, selectedItemId } = this.state;
		const selectedItem = list.items && list.items.length > 0 && list.items[selectedIndex];
		this.focusableRow.savedState = Object.assign({}, this.state);

		// For normal list, just restore the saved state when user go back.
		// For user list, verify the selected item is still valid or has a new index when the list is updated.
		// If the selected item is invalid, the first item gets focus.
		if (
			this.props.isUserList &&
			list.items.length > 0 &&
			selectedItemId &&
			selectedItem &&
			selectedItem.id !== selectedItemId
		) {
			const shouldFocusIndex = list.items.findIndex(item => item.id === selectedItemId);

			if (shouldFocusIndex === -1) {
				this.setState({ selectedIndex: 0, selectedItemId: list.items[0].id });
			} else {
				this.setState({ selectedIndex: shouldFocusIndex });
			}
		}

		if (this.state.isFocused) {
			this.calcRowHeight(this.props);
			this.context.focusNav.scrollY();
		}
	}

	private mapRows(list: api.ItemList, itemsPerRow: number, profile: state.Profile) {
		this.rows = [];
		if (!list.items || list.items.length === 0) return;
		if (isNaN(itemsPerRow) || itemsPerRow < 1) itemsPerRow = 1;
		const count = Math.ceil(list.items.length / itemsPerRow);

		if (list.id === watchedListId && profile) {
			addWatchPosition(profile, list.items);
		}

		for (let i = 0; i < count; i++) {
			const items = list.items.slice(i * itemsPerRow, (i + 1) * itemsPerRow);
			this.rows.push(items);
		}
	}

	private calcRowHeight(props: CSLProps) {
		const { customFields, imageType, itemsPerRow } = props;
		const { isFocused, focusState, selectedIndex, list } = this.state;

		let itemHeight;
		let maxHeight;

		switch (imageType) {
			case 'poster':
				itemHeight = sass.assetPostHeight;
				break;
			case 'tile':
			case 'wallpaper':
				itemHeight = sass.assetTileHeight;
				break;
			case 'block':
				itemHeight = sass.assetBlockHeight;
				break;
			case 'square':
			case 'logo':
				itemHeight = sass.assetSquareHeight;
				break;
			case 'tall':
				itemHeight = sass.assetTallHeight;
				break;
			default:
				itemHeight = sass.assetPostHeight;
				break;
		}

		if (customFields && customFields.assetTitlePosition === 'below') {
			itemHeight += sass.assetBelowTitleTotalHeight;
		}

		const filterBtnHeight = this.displayFilter ? sass.listFilterDropBtnHeight : 0;

		if (list.size > 0) {
			const totalRowsHeight = Math.ceil(list.size / itemsPerRow) * itemHeight;
			maxHeight = filterBtnHeight + totalRowsHeight;
		} else {
			maxHeight = filterBtnHeight + sass.listClearFilterBtnHeight;
		}

		this.itemHeight = itemHeight;
		this.focusableRow.maxHeight = maxHeight;

		if (isFocused) {
			switch (focusState) {
				case 'list':
					const rowTop = Math.floor(selectedIndex / itemsPerRow) * itemHeight;
					this.focusableRow.height = itemHeight;
					this.focusableRow.innerTop = filterBtnHeight + rowTop;
					break;

				case 'filter':
				case 'sort':
					this.focusableRow.height = sass.listFilterDropBtnHeight;
					this.focusableRow.innerTop = 0;
					break;

				case 'clear':
					this.focusableRow.height = sass.listClearFilterBtnHeight;
					this.focusableRow.innerTop = filterBtnHeight;
					break;

				default:
					break;
			}
		} else {
			this.focusableRow.innerTop = 0;
			this.focusableRow.height = maxHeight;
		}
	}

	private restoreSavedState = (savedState: any) => {
		if (!savedState) return;

		const { itemsPerRow, profile, isUserList } = this.props;
		const {
			list,
			selectedClassification,
			selectedSort,
			selectedIndex,
			selectedItemId,
			isFocused,
			focusState
		} = savedState;
		const selectedItem = list.items && list.items.length > 0 && list.items[selectedIndex];

		if (isUserList) {
			this.setState(
				{ selectedClassification, selectedSort, selectedIndex: 0, selectedItemId, isFocused, focusState },
				this.trackedItemFocused
			);
			return;
		}

		this.calcRowHeight(this.props);
		this.mapRows(list, itemsPerRow, profile);

		this.setState(
			{
				list,
				selectedClassification,
				selectedSort,
				selectedIndex,
				selectedItemId: selectedItem ? selectedItem.id : '',
				isFocused,
				focusState
			},
			this.trackedItemFocused
		);
	};

	private getLeftToViewport = () => {
		const { imageWidth, itemsPerRow } = this.props;
		const { selectedIndex } = this.state;
		const colNum = selectedIndex % itemsPerRow;
		const leftToViewport = colNum * (imageWidth + sass.itemMargin);
		return leftToViewport;
	};

	private calcFocusableIndex = (sourceLeftToViewport: number, directional?: 'up' | 'down'): number => {
		const { imageWidth, itemsPerRow } = this.props;
		const lens = this.state.list.items.length;
		let chooseIndex = -1;
		let minDistance = 99999;

		if (directional === 'up') {
			for (let i = lens - 1; i >= 0; --i) {
				const colNum = i % itemsPerRow;
				const leftToViewport = colNum * imageWidth;
				const distance = Math.abs(leftToViewport - sourceLeftToViewport);

				if (distance <= minDistance) {
					minDistance = distance;
					chooseIndex = i;
				} else {
					break;
				}
			}
		} else {
			for (let i = 0; i < itemsPerRow; ++i) {
				const colNum = i % itemsPerRow;
				const leftToViewport = colNum * imageWidth;
				const distance = Math.abs(leftToViewport - sourceLeftToViewport);

				if (distance <= minDistance) {
					minDistance = distance;
					chooseIndex = i;
				} else {
					break;
				}
			}
		}

		return chooseIndex;
	};

	private setFocus = (isFocused?: boolean, sourceLeftToViewport?: number, directional?: 'up' | 'down'): boolean => {
		let { focusState, selectedIndex, list } = this.state;
		let selectedIndexChanged, selectedItem, selectedItemId;

		if (directional && directional === 'down') {
			this.context.focusNav.blockScrollOnce = true;
			if (list && (list.size > 0 || list.size === -1)) {
				focusState = 'list';
			} else {
				focusState = 'clear';
			}
		}

		if (isFocused) {
			const shouldFocusIndex = this.calcFocusableIndex(sourceLeftToViewport || 0, directional);

			if (shouldFocusIndex > -1) {
				selectedIndex = shouldFocusIndex;
				selectedIndexChanged = true;
			}
		} else {
			this.trackedItemFocused(true);
		}

		selectedItem = list.items && list.items.length > 0 && list.items[selectedIndex];
		selectedItemId = selectedItem ? selectedItem.id : '';

		if (selectedIndexChanged) {
			this.setState({ isFocused, focusState, selectedIndex, selectedItemId }, this.trackedItemFocused);
		} else {
			this.setState({ isFocused, focusState, selectedIndex, selectedItemId });
		}

		return true;
	};

	private setFocusState = (focusState: 'sort' | 'filter' | 'list' | 'clear') => {
		if (focusState === 'filter' && !this.displayFilter) {
			return false;
		}

		this.setState({ focusState });
		return true;
	};

	private trackedItemFocused = (isMouseLeave?: boolean) => {
		const { list, selectedIndex, focusState } = this.state;
		const item = list.items && list.items.length > 0 && list.items[selectedIndex];
		focusState === 'list' &&
			this.context.focusNav.analytics.triggerItemEvents(
				isMouseLeave ? 'MOUSELEAVE' : 'MOUSEENTER',
				item,
				this.props as any,
				selectedIndex,
				this.props.imageType
			);
	};

	private moveLeft = (): boolean => {
		const { focusState, list } = this.state;

		switch (focusState) {
			case 'list':
				const { itemsPerRow } = this.props;
				let selectedIndex = this.state.selectedIndex;
				if (selectedIndex % itemsPerRow > 0) {
					selectedIndex--;
					const selectedItem = list.items && list.items.length > 0 && list.items[selectedIndex];
					this.setState(
						{ selectedIndex, selectedItemId: selectedItem ? selectedItem.id : '' },
						this.trackedItemFocused
					);
				}
				return true;

			case 'sort':
				this.setState({ focusState: 'filter' });
				return true;

			case 'filter':
				this.context.focusNav.focusPrevRow(this.focusableRow.index);
				return false;
			default:
				break;
		}

		return true;
	};

	private moveRight = (): boolean => {
		const { focusState, list } = this.state;

		switch (focusState) {
			case 'list':
				const { itemsPerRow } = this.props;
				let selectedIndex = this.state.selectedIndex;
				if (selectedIndex % itemsPerRow < itemsPerRow - 1) {
					selectedIndex++;
					if (selectedIndex >= list.items.length) return true;
					const selectedItem = list.items && list.items.length > 0 && list.items[selectedIndex];
					this.setState(
						{ selectedIndex, selectedItemId: selectedItem ? selectedItem.id : '' },
						this.trackedItemFocused
					);
				}
				return true;

			case 'sort':
				return false;

			case 'filter':
				this.setState({ focusState: 'sort' });
				return true;

			default:
				break;
		}

		return true;
	};

	private moveUp = (): boolean => {
		const { focusState, list } = this.state;
		const { focusNav } = this.context;
		const prevRow = focusNav.getPrevFocusableRow(this.focusableRow.index, true);
		const isListHero = prevRow && (prevRow.template === LH1 || prevRow.template === LH2);

		switch (focusState) {
			case 'list':
				const { itemsPerRow } = this.props;
				let selectedIndex = this.state.selectedIndex;
				selectedIndex -= itemsPerRow;

				if (selectedIndex < 0) {
					selectedIndex = this.state.selectedIndex;
				}

				if (selectedIndex !== this.state.selectedIndex) {
					const selectedItem = list.items && list.items.length > 0 && list.items[selectedIndex];
					this.setState(
						{ selectedIndex, selectedItemId: selectedItem ? selectedItem.id : '' },
						this.trackedItemFocused
					);
					focusNav.scrollY('up');
				} else {
					this.trackedItemFocused(true);

					if (!this.displayFilter) {
						return false;
					}

					if (selectedIndex === 0 && prevRow && prevRow.index !== 0 && isListHero) {
						return false;
					} else {
						this.setState({ focusState: 'filter' });
						focusNav.scrollY('up');
					}
				}

				return true;

			case 'sort':
			case 'filter':
				if (isListHero) {
					focusNav.moveToRow(0);
				} else {
					return false;
				}

				return true;

			case 'clear':
				if (!this.displayFilter) {
					return false;
				}

				this.setState({ focusState: 'filter' });
				focusNav.scrollY('up');

				return true;

			default:
				break;
		}

		return false;
	};

	private moveDown = (): boolean => {
		const { focusState, list } = this.state;

		switch (focusState) {
			case 'list':
				const { loadNextPage, itemsPerRow } = this.props;
				let selectedIndex = this.state.selectedIndex;
				const maxLineCount = Math.ceil(list.items.length / itemsPerRow);
				const curLineCount = Math.ceil((selectedIndex + 1) / itemsPerRow);
				let isTheLastLine = false;
				selectedIndex += itemsPerRow;

				if (selectedIndex > list.items.length - 1) {
					if (maxLineCount === curLineCount) {
						selectedIndex = this.state.selectedIndex;
						isTheLastLine = true;
					} else {
						selectedIndex = list.items.length - 1;
					}
				}

				if (selectedIndex !== this.state.selectedIndex) {
					const selectedItem = list.items && list.items.length > 0 && list.items[selectedIndex];
					this.setState(
						{ selectedIndex, selectedItemId: selectedItem ? selectedItem.id : '' },
						this.trackedItemFocused
					);
					this.context.focusNav.scrollY('down');
				}

				if (list.items.length < list.size) {
					if (loadNextPage) {
						const pageNum = list.paging.page + 1;
						pageNum <= list.paging.total && loadNextPage(pageNum);
					} else {
						this.onScrollBottom();
					}

					return true;
				} else {
					isTheLastLine && this.trackedItemFocused(true);

					// if is the last line, return false
					return !isTheLastLine;
				}

			case 'sort':
			case 'filter':
				if (list.size > 0 || list.size === -1) {
					this.setState({ focusState: 'list' }, this.trackedItemFocused);
				} else {
					this.setState({ focusState: 'clear' });
				}

				this.context.focusNav.scrollY('down');

				return true;

			case 'clear':
				return false;

			default:
				break;
		}

		return false;
	};

	private exec = (act?: string, focusState?: string): boolean => {
		switch (act) {
			case 'click':
				if (!focusState) {
					focusState = this.state.focusState;
				}

				switch (focusState) {
					case 'list':
						this.invokeItem();
						return true;
					case 'sort':
						this.context.focusNav.showDialog(
							<TitledListModal
								title={'@{continuous_scroll_sort|SORT}'}
								entries={SORT_OPTIONS}
								selectedKey={this.state.selectedSort}
								ref={this.context.focusNav.requestFocus}
								onItemClicked={this.onItemClickedSort}
								needLocalization={true}
							/>
						);
						return true;
					case 'filter':
						this.context.focusNav.showDialog(
							<TitledListModal
								title={'@{continuous_scroll_rating|RATING}'}
								entries={this.classificationOptions}
								selectedKey={this.state.selectedClassification}
								ref={this.context.focusNav.requestFocus}
								onItemClicked={this.onItemClickedFilter}
								needLocalization={true}
							/>
						);
						return true;

					case 'clear':
						this.resetFilters(undefined);
						return true;

					default:
						break;
				}

				break;

			default:
				break;
		}

		return false;
	};

	private onItemClickedSort = (index: number) => {
		this.context.focusNav.hideDialog();
		const sortStr = SORT_OPTIONS[index].key;
		this.onSelectSort(sortStr);
	};

	private onItemClickedFilter = (index: number) => {
		this.context.focusNav.hideDialog();
		const rateStr = this.classificationOptions[index].key;
		this.onSelectClassification(rateStr);
	};

	private invokeItem = () => {
		const { list, selectedIndex } = this.state;
		const item = list.items && list.items.length > 0 && list.items[selectedIndex];
		if (!item) return;

		this.context.focusNav.analytics.triggerItemEvents(
			'CLICK',
			item,
			this.props as any,
			selectedIndex,
			this.props.imageType
		);

		if (list.id === watchedListId) {
			const isEntitled = canPlay(item);

			if (isEntitled) {
				this.context.detailHelper.isInChainingPlay = false;
				this.context.focusNav.analytics.triggerItemWatched(true, item);
				this.context.router.push(item.watchPath);
			} else {
				this.context.router.push(item.path);
			}
		} else {
			this.context.router.push(item.path);
		}
	};

	private checkLoadedState(list) {
		if (list.size <= 0 && list.size !== -1) {
			this.setState({ list, focusState: 'clear' });
			return;
		}

		this.setState({
			list,
			focusState: 'list',
			listPageLoading: list.size === -1,
			listLoaded: list.size === list.items.length
		});
	}

	private onSelectSort = (selectedSort: string) => {
		if (selectedSort === this.state.selectedSort) return;

		this.setState({ selectedSort, listPageLoading: true, listLoaded: false });
		this.onSortFilter(selectedSort, this.state.selectedClassification);
	};

	private onSelectClassification = (selectedClassification: string) => {
		if (selectedClassification === this.state.selectedClassification) return;

		this.setState({ selectedClassification, listPageLoading: true, listLoaded: false });
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
		const { loadNextListPage } = this.props;
		const { list } = this.state;
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
		this.context.router.replace(path);
		this.props.refreshPage();
	}

	/**
	 * If not managing sort/filter state in query parameters then store
	 * in local persisted state and trigger the list page load directly.
	 */
	private loadListDirectly(sortKey: string, maxRating: string) {
		const { loadListPage, savedState } = this.props;
		const { list } = this.state;
		let options = SORT_OPTIONS_LOOKUP[sortKey] || {};
		if (maxRating) {
			options = Object.assign({ maxRating }, options);
		}
		const listKey = getListKey(list, options);
		savedState.listKey = listKey;
		loadListPage(list, 1, options);
	}

	private getClassificationOptions(classifications): DropButtonOption[] {
		let ret = [];

		if (classifications) {
			ret.push(DEFAULT_CLASSIFICATION_OPTION);

			for (let key in classifications) {
				if (classifications.hasOwnProperty(key)) {
					const classification = classifications[key];
					ret.push({
						label: classification.name,
						key: classification.code
					});
				}
			}
		}

		return ret;
	}

	private handleMouseEnter = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
	};

	private mouseEnterDropBtn = focusState => {
		this.setState({ focusState });
	};

	private mouseEnterClearBtn = () => {
		this.setState({ focusState: 'clear' });
	};

	private mouseEnterAsset = index => {
		const { list } = this.state;
		const selectedItem = list.items && list.items.length > 0 && list.items[index];
		this.setState(
			{ selectedIndex: index, selectedItemId: selectedItem ? selectedItem.id : '', focusState: 'list' },
			this.trackedItemFocused
		);
	};

	private handleClick = focusState => {
		if (this.state.focusState !== focusState) {
			this.setState({ focusState });
		}

		this.exec('click', focusState);
	};

	render() {
		const { list } = this.state;
		const hasItems = list.size > 0 || list.size === -1;
		const filters = this.renderFilterSortDropDowns();
		const prevRow = this.context.focusNav.getPrevFocusableRow(this.focusableRow.index);
		const hasHeader = prevRow && prevRow.template && prevRow.template.startsWith('LH');
		const style = {
			minHeight: this.focusableRow.maxHeight + 'px',
			marginTop: !filters && hasHeader && list.description ? sass.csListMarginTop + 'px' : undefined
		};

		return (
			<div className={bem.b()} ref={ref => (this.ref = ref)} onMouseEnter={this.handleMouseEnter} style={style}>
				{list.size !== -1 && filters}
				{hasItems ? this.renderList() : this.renderFilterMismatch()}
			</div>
		);
	}

	private calcFilter(props: CSLProps) {
		const { customFields, queryParamsEnabled } = props;
		this.displayFilter = customFields && customFields.displayFilter && queryParamsEnabled;
	}

	private renderFilterSortDropDowns() {
		// We don't yet fully support sort/filter when embedding a continuous scroll list
		// inside a non-list detail page as we need to maintain the sort/filter state
		// in storage and not query parameters. For now we don't present the sort/filter
		// options unless 'queryParamsEnabled' is true along with 'displayFilter'
		if (!this.displayFilter) return false;

		const classificationOptions = this.classificationOptions;
		const { selectedClassification, selectedSort, isFocused, focusState } = this.state;
		const filterBtnClass =
			isFocused && focusState === 'filter' ? `${focusedClass} ${bem.e('drop-down-btn')}` : `${bem.e('drop-down-btn')}`;
		const sortBtnClass =
			isFocused && focusState === 'sort' ? `${focusedClass} ${bem.e('drop-down-btn')}` : `${bem.e('drop-down-btn')}`;

		return (
			<div className={bem.e('drop-down-container')}>
				<DropButton
					className={filterBtnClass}
					label={'listPage_filter_rating'}
					selectedKey={selectedClassification}
					defaultOption={DEFAULT_CLASSIFICATION_OPTION}
					options={classificationOptions}
					dropBtnState={'filter'}
					onMouseEnter={this.mouseEnterDropBtn}
					onClick={this.handleClick}
				/>
				<DropButton
					className={sortBtnClass}
					label={'listPage_sort'}
					selectedKey={selectedSort}
					defaultOption={DEFAULT_SORT_OPTION}
					options={SORT_OPTIONS}
					dropBtnState={'sort'}
					onMouseEnter={this.mouseEnterDropBtn}
					onClick={this.handleClick}
				/>
			</div>
		);
	}

	private renderList() {
		const { customFields, imageType, imageWidth, itemsPerRow, profile } = this.props;
		const { isFocused, focusState, selectedIndex } = this.state;

		if (this.state.focusState === 'clear') {
			setImmediate(() => {
				this.setState({ focusState: 'list' });
			});
		}

		const itemsFocused = isFocused && focusState === 'list';
		const itemProps = {
			imageType: imageType,
			imageOptions: { width: imageWidth },
			itemMargin: ITEM_MARGIN,
			titlePosition: customFields && customFields.assetTitlePosition,
			className: bem.e('grid-item'),
			onClick: this.invokeItem,
			assetMouseEnter: this.mouseEnterAsset,
			displayPlayIcon: customFields && customFields.displayPlayIcon
		};

		return (
			<div className={bem.e('grid')}>
				{this.rows.map((items, index) => (
					<ContinuousScrollListRow
						key={'row-' + index}
						height={this.itemHeight}
						isFocused={itemsFocused}
						selectedIndex={selectedIndex}
						offset={index * itemsPerRow}
						items={items}
						itemProps={itemProps}
						watchedList={profile && profile.info && profile.info.watched}
					/>
				))}
			</div>
		);
	}

	private renderFilterMismatch() {
		const { isFocused, focusState } = this.state;
		const btnClassName =
			isFocused && focusState === 'clear' ? 'clear-list-filters-btn focused' : 'clear-list-filters-btn';

		return (
			<div>
				<IntlFormatter tagName="div" className="page-entry page-entry--empty">
					{`@{listPage_filter_mismatch_msg|Sorry, no items match your filter options}`}
				</IntlFormatter>
				<IntlFormatter
					tagName="button"
					className={btnClassName}
					onClick={this.resetFilters}
					onMouseEnter={this.mouseEnterClearBtn}
				>
					{`@{listPage_filter_reset_label|Reset filters}`}
				</IntlFormatter>
			</div>
		);
	}
}

function mapDispatchToProps(dispatch: any): ContinuousScrollListDispatchProps {
	if (!dispatch.page || !dispatch.page.history) return { refreshPage: () => dispatch(refreshPage()) };

	const location = dispatch.page.history.location;

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

	return {
		selectedSort,
		selectedClassification,
		refreshPage: () => dispatch(refreshPage())
	};
}

export default connect<ContinuousScrollListProps, ContinuousScrollListDispatchProps, ContinuousScrollListProps>(
	undefined,
	mapDispatchToProps
)(ContinuousScrollList);
