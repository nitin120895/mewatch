import * as React from 'react';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import * as cx from 'classnames';

import { OfflineStatus } from 'shared/app/offlineStatus';
import { isAnonymousProfile } from 'shared/account/profileUtil';
import {
	getListKey,
	isBookmarksList,
	SORT_OPTIONS_LOOKUP,
	getClassificationOptions,
	getGenresOptions,
	getAudioLanguageOptions,
	ClassificationValues,
	DEFAULT_CLASSIFICATION_OPTION,
	DEFAULT_GENRES_OPTION,
	DEFAULT_LANGUAGE_OPTION
} from 'shared/list/listUtil';
import { isContinueWatching } from 'shared/list/listUtil';
import { AnonymousCW, Home } from 'shared/page/pageKey';
import { UPDATE_PAGE_FILTERS_SIZE } from 'shared/page/pageWorkflow';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';

import CtaButton from 'ref/responsive/component/CtaButton';
import CWList from 'toggle/responsive/component/continueWatching/CWList';
import CWEmptyListIcon from 'toggle/responsive/component/icons/CWEmptyListIcon';
import DropSelect, {
	DropSelectOption,
	DropSelectAlignment,
	PLACEHOLDER_KEY
} from 'ref/responsive/component/DropSelect';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import ScrollLoader from 'ref/responsive/component/ScrollLoader';
import Link from 'shared/component/Link';
import PackshotList from 'toggle/responsive/component/PackshotList';

import './ContinuousScrollPackshotList.scss';

interface OwnProps extends PageEntryListProps {
	queryParamsEnabled?: boolean;
	columns: grid.BreakpointColumn[];
	imageType: image.Type;
	edit?: boolean;
	onClicked?: (item: api.ItemSummary) => void;
}

interface StoreProps {
	classification: api.AppConfig['classification'];
	deleteList?: api.ItemSummary[];
	isAnonymous: boolean;
	pageKey: string;
}

interface DispatchProps {
	updatePageFiltersSize: (filterSize: number) => void;
}

export type ContinuousScrollPackshotListProps = OwnProps & StoreProps & DispatchProps;

interface ContinuousScrollPackshotListState {
	classificationOptions?: DropSelectOption[];
	genresOptions?: DropSelectOption[];
	audioLanguageOptions?: DropSelectOption[];
	selectedClassification?: string;
	selectedSort?: string;
	selectedGenres?: string;
	selectedAudioLanguages?: string;
	listPageLoading?: boolean;
	listLoaded?: boolean;
	offline?: boolean;
}

export enum DropdownSelectName {
	AUDIO = 'audio',
	GENRES = 'genres',
	RATING = 'rating',
	SORTING = 'sorting'
}

export enum SortOptions {
	A_Z,
	Z_A,
	LatestRelease,
	LatestAdded,
	EarliestRelease,
	LatestReleaseBookmark,
	EarliestReleaseBookmark
}

export const SortOptionValues = {
	[SortOptions.A_Z]: { label: 'listPage_sort_aToz', key: 'a-z' },
	[SortOptions.Z_A]: { label: 'listPage_sort_zToa', key: 'z-a' },
	[SortOptions.LatestRelease]: { label: 'listPage_sort_latestRelease', key: 'latest-release' },
	[SortOptions.EarliestRelease]: { label: 'listPage_sort_earliestRelease', key: 'earliest-release' },
	[SortOptions.LatestAdded]: { label: 'listPage_sort_recentlyAdded', key: 'latest-added' },
	[SortOptions.LatestReleaseBookmark]: { label: 'listPage_sort_latestRelease_bookmark', key: 'latest-release' },
	[SortOptions.EarliestReleaseBookmark]: { label: 'listPage_sort_earliestRelease_bookmark', key: 'earliest-release' }
};

const DEFAULT_SORT_OPTION = SortOptionValues[SortOptions.LatestRelease];

// Don't edit these sort option keys.
//
// The keys represent short form order query parameters
// and get passed through to Rocket which understands
// how to expand them in to sort full options.
const LIST_SORT_OPTIONS = [SortOptionValues[SortOptions.A_Z], SortOptionValues[SortOptions.EarliestRelease]];

const DEFAULT_BOOKRMARK_SORT_OPTION = SortOptionValues[SortOptions.LatestAdded];

const BOOKMARK_SORT_OPTIONS = [
	SortOptionValues[SortOptions.LatestReleaseBookmark],
	SortOptionValues[SortOptions.EarliestReleaseBookmark],
	SortOptionValues[SortOptions.A_Z]
];

const bem = new Bem('cs-packshot-list');
const filtersBem = new Bem('filters-container');
const cwEmptyBem = new Bem('cw-empty-list');

/**
 * Continuous Scroll Packshot List
 *
 * The base component used for CS rows (CS1-5) on list pages
 */
class ContinuousScrollPackshotList extends React.Component<
	ContinuousScrollPackshotListProps,
	ContinuousScrollPackshotListState
> {
	static contextTypes = {
		router: PropTypes.object.isRequired,
		offlineStatus: PropTypes.object.isRequired,
		intl: PropTypes.object.isRequired
	};

	context: {
		router: ReactRouter.InjectedRouter;
		offlineStatus: OfflineStatus;
		intl: any;
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
		const { classification, list } = this.props;

		this.setState(
			{
				classificationOptions: getClassificationOptions(classification),
				genresOptions: getGenresOptions(list),
				audioLanguageOptions: getAudioLanguageOptions(list)
			},
			this.setFiltersSize
		);
	}

	componentDidMount() {
		const { list, location } = this.props;
		this.context.offlineStatus.subscribe(this.onConnectivityChange);
		this.onConnectivityChange(this.context.offlineStatus);
		this.syncLocation(location);
		this.checkLoadedState(list);
	}

	componentWillUnmount() {
		this.context.offlineStatus.unsubscribe(this.onConnectivityChange);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.location !== this.props.location) {
			this.syncLocation(nextProps.location);
		}

		const nextList = get(nextProps.list, 'items.length');
		const currentList = get(this.props.list, 'items.length');

		if (nextProps.list && nextList !== currentList) {
			this.checkLoadedState(nextProps.list);
		}
	}

	componentDidUpdate(_: ContinuousScrollPackshotListProps, oldState: ContinuousScrollPackshotListState) {
		let { selectedSort, selectedGenres, selectedAudioLanguages, selectedClassification } = this.state;

		if (
			typeof oldState.selectedSort === 'undefined' &&
			typeof oldState.selectedGenres === 'undefined' &&
			typeof oldState.selectedAudioLanguages === 'undefined' &&
			typeof oldState.selectedClassification === 'undefined'
		)
			return;

		if (
			selectedSort === oldState.selectedSort &&
			selectedGenres === oldState.selectedGenres &&
			selectedAudioLanguages === oldState.selectedAudioLanguages &&
			selectedClassification === oldState.selectedClassification
		)
			return;

		selectedClassification = this.getClassificationLabel(selectedClassification);

		if (selectedGenres === PLACEHOLDER_KEY)
			selectedGenres = this.context.intl.formatMessage({ id: DEFAULT_GENRES_OPTION.label });

		if (selectedAudioLanguages === PLACEHOLDER_KEY)
			selectedAudioLanguages = this.context.intl.formatMessage({ id: DEFAULT_LANGUAGE_OPTION.label });
	}

	setFiltersSize = () => {
		const { list, updatePageFiltersSize } = this.props;
		const { genresOptions, audioLanguageOptions } = this.state;
		const showGenresFilter = !!genresOptions.length;
		const showRatingFilter = !isBookmarksList(list);
		const showAudioLanguagesFilter = !!audioLanguageOptions.length;

		const filterSize = [showGenresFilter, showRatingFilter, showAudioLanguagesFilter].reduce(
			(counter, showFilter) => counter + (showFilter ? 1 : 0),
			1
		);

		updatePageFiltersSize(filterSize);
	};

	getClassificationLabel = classificationKey => {
		if (classificationKey === PLACEHOLDER_KEY) {
			return this.context.intl.formatMessage({ id: DEFAULT_CLASSIFICATION_OPTION.label });
		}

		const id = ClassificationValues[classificationKey].label;
		return this.context.intl.formatMessage({ id });
	};

	private checkLoadedState(list) {
		if (!list) return;
		this.setState({
			listPageLoading: list.size === -1,
			listLoaded: list.paging.page === list.paging.total
		});
	}

	private syncLocation(location: HistoryLocation) {
		let selectedSort, selectedClassification, selectedGenres, selectedAudioLanguages;
		if (location && location.query) {
			selectedSort = location.query['order'];
			selectedClassification = location.query['max_rating'];
			selectedGenres = location.query['genre'];
			selectedAudioLanguages = location.query['audio_language'];
		}
		if (!selectedSort) selectedSort = this.getDefaultSortOption().key;
		if (!selectedClassification) selectedClassification = DEFAULT_CLASSIFICATION_OPTION.key;
		if (!selectedGenres) selectedGenres = DEFAULT_GENRES_OPTION.key;
		if (!selectedAudioLanguages) selectedAudioLanguages = DEFAULT_LANGUAGE_OPTION.key;

		this.setState({
			selectedSort,
			selectedClassification,
			selectedGenres,
			selectedAudioLanguages
		});
	}

	private onConnectivityChange = (offlineStatus: OfflineStatus) => {
		this.setState({ offline: offlineStatus.isOffline() });
	};

	private onSelectSort = (selectedSort: string) => {
		if (selectedSort === this.state.selectedSort) return;

		this.setState({ selectedSort, listPageLoading: true, listLoaded: false }, this.onFilterChange);
	};

	private onSelectClassification = (selectedClassification: string) => {
		if (selectedClassification === this.state.selectedClassification) return;

		this.setState({ selectedClassification, listPageLoading: true, listLoaded: false }, this.onFilterChange);
	};

	private onSelectGenre = (selectedGenres: string) => {
		if (selectedGenres === this.state.selectedGenres) return;

		this.setState({ selectedGenres, listPageLoading: true, listLoaded: false }, this.onFilterChange);
	};

	private onSelectLanguage = (selectedAudioLanguages: string) => {
		if (selectedAudioLanguages === this.state.selectedAudioLanguages) return;

		this.setState({ selectedAudioLanguages, listPageLoading: true, listLoaded: false }, this.onFilterChange);
	};

	private resetFilters = e => {
		this.setState(
			{
				selectedSort: this.getDefaultSortOption().key,
				selectedClassification: DEFAULT_CLASSIFICATION_OPTION.key,
				selectedGenres: DEFAULT_GENRES_OPTION.key,
				selectedAudioLanguages: DEFAULT_LANGUAGE_OPTION.key
			},
			this.onFilterChange
		);
	};

	private onScrollBottom = () => {
		const { list, loadNextListPage } = this.props;
		this.setState({ listPageLoading: true });
		loadNextListPage(list);
	};

	private onFilterChange = () => {
		let { selectedSort, selectedClassification, selectedGenres, selectedAudioLanguages } = this.state;
		if (selectedClassification === DEFAULT_CLASSIFICATION_OPTION.key) selectedClassification = undefined;
		if (selectedGenres === DEFAULT_GENRES_OPTION.key) selectedGenres = undefined;
		if (selectedAudioLanguages === DEFAULT_LANGUAGE_OPTION.key) selectedAudioLanguages = undefined;

		if (this.props.queryParamsEnabled) {
			this.updateQueryParams(selectedSort, selectedClassification, selectedGenres, selectedAudioLanguages);
		} else {
			this.loadListDirectly(selectedSort, selectedClassification, selectedGenres, selectedAudioLanguages);
		}
	};

	/**
	 * If persisting sort/filter state in query parameters then delegate
	 * list loading via page changes by updating query parameters.
	 */
	private updateQueryParams(sort: string, maxRating: string, genres: string, audioLanguage: string) {
		const params = [];
		if (sort) params.push(`order=${encodeURIComponent(sort)}`);
		if (maxRating) params.push(`max_rating=${encodeURIComponent(maxRating)}`);
		if (genres) params.push(`genre=${encodeURIComponent(genres)}`);
		if (audioLanguage) params.push(`audio_language=${encodeURIComponent(audioLanguage)}`);
		const query = params.length ? `?${params.join('&')}` : '';
		const path = `${this.props.location.pathname}${query}`;
		this.context.router.push(path);
		this.setState({ listLoaded: true });
	}

	/**
	 * If not managing sort/filter state in query parameters then store
	 * in local persisted state and trigger the list page load directly.
	 */
	private loadListDirectly(sortKey: string, maxRating: string, genres: string, audioLanguage: string) {
		const { list, loadListPage, savedState } = this.props;
		let options = SORT_OPTIONS_LOOKUP[sortKey] || {};
		if (maxRating) {
			options = Object.assign({ maxRating }, options);
		}
		if (genres) {
			options = Object.assign({ genres }, options);
		}
		if (audioLanguage) {
			options = Object.assign({ audioLanguage }, options);
		}
		const listKey = getListKey(list, options);
		savedState.listKey = listKey;
		savedState.sortOptions = options;
		loadListPage(list, 1, options);
		this.checkLoadedState(list);
	}

	render() {
		const { deleteList, isAnonymous, list, pageKey } = this.props;
		const cwFilterList = list.items && list.items.filter(item => !deleteList.includes(item));
		let hasItems = list.size > 0 || list.size === -1;

		if (isContinueWatching(list)) {
			hasItems = list.size === -1 || cwFilterList.length > 0;
		}

		const filters = this.renderFilterSortDropDowns();
		const loggedInUserVisitsAnonymousPage = !isAnonymous && pageKey === AnonymousCW;
		// tslint:disable-next-line: no-null-keyword
		if (loggedInUserVisitsAnonymousPage) return null;

		return (
			<div className={bem.b({ flush: !!filters })}>
				{filters}
				{hasItems ? this.renderPackshotList() : this.renderFilterMismatch()}
			</div>
		);
	}

	private renderFilterSortDropDowns() {
		const { customFields, list } = this.props;
		// We don't yet fully support sort/filter when embedding a continuous scroll list
		// inside a non-list detail page as we need to maintain the sort/filter state
		// in storage and not query parameters. For now we don't present the sort/filter
		// options unless 'queryParamsEnabled' is true along with 'displayFilter'
		if (!customFields || !customFields.displayFilter) return false;

		const {
			selectedSort,
			offline,
			classificationOptions,
			selectedClassification,
			selectedGenres,
			selectedAudioLanguages,
			genresOptions,
			audioLanguageOptions
		} = this.state;
		const showGenresFilter = !!genresOptions.length;
		const showRatingFilter = !isBookmarksList(list);
		const showAudioLanguagesFilter = !!audioLanguageOptions.length;

		let filterIndex = 0;
		function getDropSelectAlignment(): DropSelectAlignment {
			filterIndex++;
			const isEven = filterIndex % 2 === 0;
			return isEven ? DropSelectAlignment.Right : DropSelectAlignment.Left;
		}

		return (
			<div className={filtersBem.b({ offline })}>
				{showAudioLanguagesFilter && (
					<div className={filtersBem.e('column')}>
						<DropSelect
							alignment={getDropSelectAlignment()}
							label={DEFAULT_LANGUAGE_OPTION.label}
							selectedKey={selectedAudioLanguages}
							defaultOption={DEFAULT_LANGUAGE_OPTION}
							options={audioLanguageOptions}
							onSelect={this.onSelectLanguage}
							name={DropdownSelectName.AUDIO}
						/>
					</div>
				)}
				{showRatingFilter && (
					<div className={filtersBem.e('column')}>
						<DropSelect
							alignment={getDropSelectAlignment()}
							label="listPage_filter_rating"
							selectedKey={selectedClassification}
							defaultOption={DEFAULT_CLASSIFICATION_OPTION}
							options={classificationOptions}
							useTranslations={true}
							onSelect={this.onSelectClassification}
							name={DropdownSelectName.RATING}
						/>
					</div>
				)}
				<div className={filtersBem.e('column')}>
					<DropSelect
						alignment={getDropSelectAlignment()}
						label={this.getDefaultSortOption().label}
						selectedKey={selectedSort}
						defaultOption={this.getDefaultSortOption()}
						options={this.getSortOptions()}
						useTranslations={true}
						onSelect={this.onSelectSort}
						name={DropdownSelectName.SORTING}
					/>
				</div>
				{showGenresFilter && (
					<div className={filtersBem.e('column')}>
						<DropSelect
							alignment={getDropSelectAlignment()}
							label={DEFAULT_GENRES_OPTION.label}
							selectedKey={selectedGenres}
							defaultOption={DEFAULT_GENRES_OPTION}
							options={genresOptions}
							onSelect={this.onSelectGenre}
							name={DropdownSelectName.GENRES}
						/>
					</div>
				)}
			</div>
		);
	}

	private renderPackshotList() {
		const {
			list,
			imageType,
			customFields,
			columns,
			savedState,
			edit,
			onClicked,
			template,
			loadNextListPage,
			children
		} = this.props;
		const { listPageLoading, listLoaded } = this.state;
		const isCWList = isContinueWatching(list);
		return (
			<ScrollLoader key="loader" enabled={!listLoaded} loading={listPageLoading} onLoad={this.onScrollBottom}>
				{isCWList ? (
					<CWList list={list} imageType={'tile'} columns={columns} loadNextListPage={loadNextListPage} wrap vertical>
						{children}
					</CWList>
				) : (
					<PackshotList
						list={list}
						wrap={true}
						savedState={savedState}
						imageType={imageType}
						packshotTitlePosition={customFields ? customFields.assetTitlePosition : undefined}
						columns={columns}
						edit={edit}
						onPackshotClicked={edit && onClicked}
						ignoreLink={edit}
						template={template}
					/>
				)}
			</ScrollLoader>
		);
	}

	private renderFilterMismatch() {
		const { list } = this.props;
		const pageEntryClass = 'page-entry page-entry--empty';

		if (isBookmarksList(list)) {
			return (
				<div className={pageEntryClass}>
					<IntlFormatter elementType="div">{`@{listPage_no_item_in_my_list| No video in My List}`}</IntlFormatter>
					<IntlFormatter elementType="div">
						{`@{listPage_no_item_in_my_list_msg| Add your favorite show or movies to My List so that you can easily find them later.}`}
					</IntlFormatter>
				</div>
			);
		}

		if (isContinueWatching(list)) {
			return (
				<div className={cx(cwEmptyBem.b(), pageEntryClass)}>
					<IntlFormatter elementType="div">
						<CWEmptyListIcon className={cwEmptyBem.e('icon')} />
					</IntlFormatter>
					<IntlFormatter
						elementType="h3"
						className={cwEmptyBem.e('title')}
					>{`@{listPage_no_item_in_continue_watching| No video in Continue Watching}`}</IntlFormatter>
					<IntlFormatter elementType="div" className={cwEmptyBem.e('description')}>
						<IntlFormatter elementType="p">
							{`@{listPage_no_item_in_continue_watching_msg| Add your favorite show or movies to Continue Watching so that you can easily find them later.}`}
						</IntlFormatter>
						<IntlFormatter elementType="p">
							{`@{continue_watching_empty_list_second_description|To bookmark all programmes across multiple devices, please sign in to enjoy this feature for free.}`}
						</IntlFormatter>
					</IntlFormatter>
					<Link to={`@${Home}`} key="home">
						<IntlFormatter elementType={CtaButton} componentProps={{ ordinal: 'secondary', theme: 'light' }}>
							{`@{continue_watching_browse_now|Browse Now}`}
						</IntlFormatter>
					</Link>
				</div>
			);
		}
		return (
			<div className={bem.e('no-results-wrapper')}>
				<IntlFormatter elementType="div" className={pageEntryClass}>
					{`@{listPage_filter_mismatch_msg|Sorry, no items match your selected filter.}`}
				</IntlFormatter>
				<IntlFormatter elementType="button" className="clear-list-filters-btn" onClick={this.resetFilters}>
					{`@{listPage_filter_reset_label|Clear filters}`}
				</IntlFormatter>
			</div>
		);
	}

	private getDefaultSortOption() {
		return isBookmarksList(this.props.list) ? DEFAULT_BOOKRMARK_SORT_OPTION : DEFAULT_SORT_OPTION;
	}

	private getSortOptions() {
		return isBookmarksList(this.props.list) ? BOOKMARK_SORT_OPTIONS : LIST_SORT_OPTIONS;
	}
}

function mapStateToProps({ app, page, profile }: state.Root, ownProps: OwnProps): StoreProps {
	const deleteList = get(profile, 'continueWatching.deleteList') || [];
	const pageKey = get(page, 'history.pageSummary.key');
	const isAnonymous = isAnonymousProfile(profile);
	return {
		classification: app.config.classification,
		deleteList,
		isAnonymous,
		pageKey
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		updatePageFiltersSize: (filterSize: number) => dispatch({ type: UPDATE_PAGE_FILTERS_SIZE, payload: filterSize })
	};
}

export default connect<StoreProps, any, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(ContinuousScrollPackshotList);
