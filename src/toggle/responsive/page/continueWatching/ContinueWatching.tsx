import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as cx from 'classnames';

import { attemptDeleteContinueWatching } from 'shared/account/profileWorkflow';
import { setContinueWatchingEditList, setContinueWatchingEditMode } from 'shared/account/profileWorkflow';
import { analyticsEvent } from 'shared/analytics/analyticsWorkflow';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import { CTATypes } from 'shared/analytics/types/types';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import configPage from 'shared/page/configPage';
import {
	ContinueWatching as continueWatchingListId,
	ContinueWatchingAnonymous as continueWatchingAnonListId
} from 'shared/list/listId';
import { AccountProfileCW as key } from 'shared/page/pageKey';
import { ContinueWatch as template } from 'shared/page/pageTemplate';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';

import Checkbox from 'ref/responsive/component/input/Checkbox';
import Cs2ContinuousTile from 'toggle/responsive/pageEntry/continuous/Cs2ContinuousTile';
import CtaButton from 'toggle/responsive/component/CtaButton';
import DeleteIcon from 'toggle/responsive/component/icons/DeleteIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './ContinueWatching.scss';

const bem = new Bem('continue-watching-list');

interface OwnProps extends PageProps {
	listCache: state.Cache['list'];
}

interface StoreProps {
	editMode?: boolean;
	editList?: api.ItemSummary[];
	deleteList?: api.ItemSummary[];
	selectedAll: boolean;
}

interface DispatchProps {
	attemptDeleteContinueWatching: (editList: api.ItemSummary[]) => void;
	setEditList: (editList: api.ItemSummary[]) => void;
	setEditMode: (editMode: boolean) => void;
	analyticsEvent: (type, payload?: any) => any;
}

type ContinueWatchingProps = StoreProps & DispatchProps & OwnProps;

interface ContinueWatchingState {}

class ContinueWatching extends React.Component<ContinueWatchingProps, ContinueWatchingState> {
	render() {
		const { editMode, loading } = this.props;
		const entries = this.renderEntries(this.props);
		return (
			<div className={cx('list-pg', bem.b({ edit: editMode }))}>
				{this.renderHeader()}
				{this.renderEditControls()}
				{!loading && entries}
			</div>
		);
	}

	private renderHeader() {
		const { title, editMode } = this.props;
		const listItems = getListItems(this.props);
		const hasItems = Array.isArray(listItems) && listItems.length > 0;

		return (
			<div className={bem.e('header')}>
				<h2 className={bem.e('title')}>{title}</h2>
				{hasItems && (
					<IntlFormatter
						elementType={CtaButton}
						className={bem.e('ghost-btn')}
						onClick={this.toggleEditMode}
						componentProps={{ ordinal: 'secondary', theme: 'light' }}
					>
						{editMode ? '@{mylist_cancel_cta|Cancel}' : '@{mylist_edit_cta|Edit}'}
					</IntlFormatter>
				)}
			</div>
		);
	}

	private renderEditControls() {
		const { editList, editMode } = this.props;
		if (!editMode) return;

		const showInstructions = editList.length === 0;

		return (
			<div className={bem.e('edit-controls')}>
				{this.renderSelectAll()}
				<div className={bem.e('remove-controls')}>
					{showInstructions ? (
						<div className={bem.e('instructions')}>
							<IntlFormatter elementType="span">{'@{continue_watching_instructions}'}</IntlFormatter>
							<DeleteIcon className={bem.e('cta-icon')} />
						</div>
					) : (
						<CTAWrapper
							type={CTATypes.RemoveSelected}
							data={{ cardTotal: getCardTotal(this.props), selectedTotal: editList.length }}
						>
							<CtaButton
								className={bem.e('cta-remove-selected')}
								ordinal="naked"
								theme="dark"
								onClick={this.handleDelete}
							>
								<IntlFormatter className="show-mobile" values={{ number: editList.length }} elementType="span">
									{'@{continue_watching_selected}'}
								</IntlFormatter>
								<IntlFormatter className="show-tablet" values={{ number: editList.length }} elementType="span">
									{'@{continue_watching_remove_selected}'}
								</IntlFormatter>
								<DeleteIcon className={bem.e('cta-icon')} />
							</CtaButton>
						</CTAWrapper>
					)}
				</div>
			</div>
		);
	}

	private handleDelete = () => {
		const { editList, attemptDeleteContinueWatching } = this.props;
		attemptDeleteContinueWatching(editList);
	};

	private renderSelectAll() {
		const { selectedAll } = this.props;
		const checkboxLabel = selectedAll ? '@{continue_watching_deselect_all}' : '@{continue_watching_select_all}';
		return (
			<div className={bem.e('toggle-select-all')}>
				<IntlFormatter
					elementType={CtaButton}
					className={cx('show-mobile', bem.e('ghost-btn'))}
					componentProps={{ ordinal: 'secondary', theme: 'light' }}
					onClick={this.onSelectAll}
				>
					{checkboxLabel}
				</IntlFormatter>
				<Checkbox
					className="show-tablet"
					checked={selectedAll}
					label={checkboxLabel}
					round
					onChange={this.onSelectAll}
				/>
			</div>
		);
	}

	private renderEntries({ entries, renderEntry }) {
		return (entries || []).map((entry, index) => {
			/** entry template and type is mocked as CS2
			 * once api return this type will remove this code. */
			entry.template = 'CS2';
			entry.type = 'ListEntry';
			return renderEntry(entry, index);
		});
	}

	private onSelectAll = e => {
		const { selectedAll, setEditList, analyticsEvent } = this.props;
		const cwList = getListItems(this.props);
		const cardTotal = getCardTotal(this.props);
		if (selectedAll) {
			setEditList([]);
			analyticsEvent(AnalyticsEventType.CW_PAGE_DESELECT_ALL, { cardTotal });
		} else {
			setEditList(cwList);
			analyticsEvent(AnalyticsEventType.CW_PAGE_SELECT_ALL, { cardTotal });
		}
	};

	private toggleEditMode = () => {
		const { editMode, setEditMode, setEditList, analyticsEvent } = this.props;
		const cardTotal = getCardTotal(this.props);
		if (editMode) {
			setEditMode(false);
			setEditList([]);
		} else {
			setEditMode(true);
			analyticsEvent(AnalyticsEventType.CW_PAGE_EDIT, { cardTotal });
		}
	};
}

function getCardTotal(props: ContinueWatchingProps) {
	const { deleteList, pageKey, listCache } = props;
	const listId = pageKey === key ? continueWatchingListId : continueWatchingAnonListId;
	const cardTotal = get(listCache[listId], 'list.size') - deleteList.length;
	return cardTotal;
}

function getListItems(props: ContinueWatchingProps) {
	const { listCache, pageKey, deleteList } = props;
	const listId = pageKey === key ? continueWatchingListId : continueWatchingAnonListId;
	const cacheList = get(listCache[listId], 'list.items');
	const filteredList =
		Array.isArray(deleteList) && Array.isArray(cacheList)
			? cacheList.filter(item => !deleteList.includes(item))
			: cacheList;
	return filteredList;
}

function mapStateToProps({ profile }: state.Root, ownProps: ContinueWatchingProps): StoreProps {
	const deleteList = get(profile, 'continueWatching.deleteList') || [];
	const editList = get(profile, 'continueWatching.editList') || [];
	const editMode = get(profile, 'continueWatching.editMode') || false;
	const listItems = getListItems(ownProps);
	const filterList = Array.isArray(listItems) && listItems.filter(item => !deleteList.includes(item));

	return {
		deleteList,
		editMode,
		editList,
		selectedAll: Array.isArray(filterList) && filterList.length === editList.length
	};
}

function mapDispatchToProps(dispatch: Dispatch<any>): DispatchProps {
	return {
		attemptDeleteContinueWatching: (editList: api.ItemSummary[]) => dispatch(attemptDeleteContinueWatching(editList)),
		setEditMode: (editMode: boolean) => dispatch(setContinueWatchingEditMode(editMode)),
		setEditList: (editList: api.ItemSummary[]) => dispatch(setContinueWatchingEditList(editList)),
		analyticsEvent: (type, payload) => dispatch(analyticsEvent(type, payload))
	};
}

const Component: any = connect<StoreProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(ContinueWatching);

export default configPage(Component, { template, entryRenderers: [Cs2ContinuousTile], key });
