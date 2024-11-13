import * as React from 'react';
import * as cx from 'classnames';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';
import { isHeroEntryTemplate } from 'shared/page/pageEntryTemplate';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Spinner from 'ref/responsive/component/Spinner';
import { unbookmarkItems, unbookmarkAllItems } from 'shared/account/profileWorkflow';
import { connect } from 'react-redux';
import configPage from 'shared/page/configPage';
import { MyList as template } from 'shared/page/pageTemplate';
import { AccountProfileBookmarks as key } from 'shared/page/pageKey';
import CtaButton from 'ref/responsive/component/CtaButton';
import Cs2ContinuousTile from 'ref/responsive/pageEntry/continuous/Cs2ContinuousTile';
import { Bookmarks } from 'shared/list/listId';

import './AccountProfileBookmarks.scss';

const bem = new Bem('profile-bookmarks');

interface OwnProps extends PageProps {
	listCache: state.Cache['list'];
}

interface StoreProps {
	allBookmarks: api.ProfileDetail['bookmarked'];
}

interface DispatchProps {
	unbookmarkItems: typeof unbookmarkItems;
	unbookmarkAllItems: typeof unbookmarkAllItems;
}

interface State {
	editMode: boolean;
	undoList: string[];
	showFilters: boolean;
}

type Props = StoreProps & DispatchProps & OwnProps;

class AccountProfileBookmarks extends React.Component<Props, State> {
	constructor(props) {
		super(props);

		const allBookmarks = Object.keys(props.allBookmarks).length;
		const currentList = get(props.listCache[Bookmarks], 'list.items') || [];

		this.state = {
			editMode: false,
			undoList: [],
			showFilters: !!allBookmarks || !!currentList.length
		};
	}

	componentDidUpdate(prevProps, prevState) {
		const listKey = this.getListState('listKey') || Bookmarks;
		const prevList = get(prevProps.listCache[listKey], 'list.items') || [];
		const currentList = get(this.props.listCache[listKey], 'list.items') || [];

		if (prevList.length !== currentList.length && this.state.editMode) {
			this.setState({
				editMode: false,
				undoList: []
			});
		}
	}

	render() {
		const { title, loading } = this.props;
		const entries = this.renderEntries(this.props);
		const empty = isPageEmpty(loading, entries);
		return (
			<div className={cx('list-pg', bem.b())}>
				{this.renderHeader()}
				{loading && this.renderLoading()}
				{!loading && entries}
				{empty && this.renderEmpty(title, entries.length)}
			</div>
		);
	}

	private renderHeader() {
		const { title, loading } = this.props;
		const { editMode } = this.state;
		const list = this.getList();
		const editable = !loading && list && list.items.length > 0;
		return (
			<div>
				<div className={cx(bem.e('title'), 'full-bleed')}>
					<div className={cx(bem.e('header'), 'grid-margin')}>
						<div className={bem.e('header-fixed-cta')}>
							<IntlFormatter elementType="div" className="ah-title titlecase">
								{title}
							</IntlFormatter>
							{(editable || editMode) && this.renderEditButton()}
							{this.renderDeleteBlock('desktop-only')}
						</div>
					</div>
				</div>
				{this.renderDeleteBlock('mobile-only')}
			</div>
		);
	}

	private renderEntries({ entries }: PageProps) {
		return (entries || []).map(entry => {
			return this.renderMyList(entry);
		});
	}

	private renderMyList(entry: api.PageEntry) {
		const { renderEntry, loading } = this.props;
		const { editMode, showFilters } = this.state;
		const entryProps = {
			queryParamsEnabled: false,
			customFields: {
				displayFilter: !editMode && showFilters,
				assetTitlePosition: 'below'
			},
			edit: editMode,
			ignoreLink: editMode,
			onClicked: this.onDeleteOneItem
		};

		const view = renderEntry(entry, 0, entryProps);
		if (!loading && !Array.isArray(view) && editMode) {
			return React.cloneElement(view as any, {
				entryProps: { ...view.props.entryProps, list: this.filteredBookmarks() }
			});
		}
		return view;
	}

	private renderLoading() {
		return (
			<div className="page-entry">
				<Spinner className="page-spinner vp-center" delayVisibility={true} />
			</div>
		);
	}

	private renderEmpty(title: string, numEntries: number) {
		const classes = cx({ 'page-entry': numEntries === 0 }, 'page-entry--empty');
		return (
			<IntlFormatter elementType="div" className={classes} values={{ title }}>
				{`@{listPage_empty_msg|Sorry, {title} is unavailable}`}
			</IntlFormatter>
		);
	}

	private renderEditButton = () => {
		const { editMode } = this.state;
		if (editMode) {
			return this.renderFinishCTA('mobile-only');
		}
		return (
			<IntlFormatter
				elementType={CtaButton}
				onClick={this.onEditMode}
				componentProps={{ ordinal: 'secondary', theme: 'light' }}
			>
				{'@{mylist_edit_cta|Edit}'}
			</IntlFormatter>
		);
	};

	private renderDeleteBlock = params => {
		const { editMode, undoList } = this.state;
		if (!editMode) return;

		const { allBookmarks } = this.props;
		const hideDeleteAll = undoList.length === Object.keys(allBookmarks).length;

		return (
			<div className={cx(bem.e('edit-block'), params)}>
				<IntlFormatter
					elementType={CtaButton}
					className={bem.b({ hide: hideDeleteAll })}
					onClick={this.onDeleteAllItem}
					componentProps={{ ordinal: 'secondary', theme: 'light' }}
				>
					{'@{mylist_delete_all_cta|Delete all}'}
				</IntlFormatter>
				<IntlFormatter
					elementType={CtaButton}
					className={bem.b('undo-btn')}
					onClick={this.onUndo}
					disabled={!undoList.length}
					componentProps={{ ordinal: 'secondary', theme: 'light' }}
				>
					{'@{mylist_undo_cta|Undo}'}
				</IntlFormatter>
				{this.renderFinishCTA('desktop-only')}
			</div>
		);
	};

	private renderFinishCTA(className: string) {
		return (
			<IntlFormatter
				elementType={CtaButton}
				onClick={this.onFinish}
				className={className}
				componentProps={{ ordinal: 'primary', theme: 'light' }}
			>
				{'@{mylist_finish_cta|Finish}'}
			</IntlFormatter>
		);
	}

	private onEditMode = () => {
		this.setState({
			editMode: true,
			undoList: []
		});
	};

	private onUndo = () => {
		this.setState({ undoList: [] });
	};

	checkFiltersVisibility() {
		const { undoList } = this.state;
		const currentList = get(this.props.listCache[Bookmarks], 'list.items') || [];

		if (currentList.length === undoList.length) {
			this.setState({
				showFilters: false
			});
		}
	}

	private onFinish = () => {
		const { unbookmarkItems, unbookmarkAllItems } = this.props;
		const { undoList } = this.state;

		this.checkFiltersVisibility();

		if (undoList.length > 0) {
			const sortOptions = this.getListState('sortOptions');
			get(this.getList(), 'items.length') === undoList.length
				? unbookmarkAllItems(undoList)
				: unbookmarkItems(undoList, sortOptions);
		} else {
			this.setState({
				editMode: false,
				undoList: []
			});
		}
	};

	private onDeleteOneItem = item => {
		const { undoList } = this.state;
		const itemId = item.id;
		this.setState({
			undoList: [...undoList, itemId]
		});
	};

	private onDeleteAllItem = () => {
		const { allBookmarks } = this.props;
		this.setState({
			undoList: Object.keys(allBookmarks)
		});
	};

	private getListState(stateKey): string {
		const { entries, savedState } = this.props;
		const entryId = get(entries, [0, 'id']);
		return get(savedState, [entryId, stateKey]);
	}

	private getList(): api.ItemList {
		const { listCache, savedState, entries } = this.props;
		const entryId = get(entries, [0, 'id']);
		const listKey = get(savedState, [entryId, 'listKey']) || Bookmarks;
		return get(listCache, [listKey, 'list']);
	}

	private filteredBookmarks() {
		const list = this.getList();
		const { undoList } = this.state;
		return this.filterBookmarks(list, undoList);
	}

	private filterBookmarks = memoizeList<api.ItemList>((list: api.ItemList, undoList: State['undoList']) => {
		const items = list.items.filter(({ id }) => !undoList.includes(id));
		const size = list.size - undoList.length;
		return { ...list, items, size };
	});
}

///

// Need reference memoization to avoid unnecessary child re-rendering
// which can cause infinite rendering loop between the parent and child components
function memoizeList<R>(fn) {
	let lastArgs = [];
	let lastResult = undefined;
	return function mem(...args): R {
		if (lastArgs.length !== args.length || !lastArgs.every((v, i) => args[i] === v)) {
			lastArgs = args;
			lastResult = fn(...args);
		}
		return lastResult;
	};
}

function isPageEmpty(loading: boolean, entries: any[]) {
	if (loading) return false;
	if (entries.length === 0) return true;
	if (entries.length === 1) {
		const props = entries[0].props;
		return isHeroEntryTemplate(props.template);
	}
	return false;
}

function mapStoreToProps({ profile }: state.Root): StoreProps {
	return {
		allBookmarks: profile.info.bookmarked
	};
}

const mapDispatchToProps = { unbookmarkItems, unbookmarkAllItems };

const Component: any = connect<StoreProps, DispatchProps, OwnProps>(
	mapStoreToProps,
	mapDispatchToProps
)(AccountProfileBookmarks);

export default configPage(Component, { template, entryRenderers: [Cs2ContinuousTile], key });
