import * as React from 'react';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import NavEntryLink from 'ref/responsive/app/nav/NavEntryLink';
import NavContent from 'ref/responsive/app/nav/NavContent';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import {
	getNavContentCachedList,
	getEntryDepthModifier,
	NavEntryDepth,
	isMeRewardsEntry,
	getMeRewardsMenuEntries
} from 'shared/app/navUtil';
import MenuWrapper from 'shared/analytics/components/MenuWrapper';
import { MenuTypes } from 'shared/analytics/types/types';
import { loadNextListPage } from 'shared/list/listWorkflow';
import { get } from 'shared/util/objects';

import './SecondaryNav.scss';

interface SecondaryNavProps extends React.HTMLProps<any> {
	entries: api.NavEntry[];
	listCache?: any;
	displayCategoryTitle?: boolean;
	ariaLabel?: string;
	verticalContent?: boolean;
	autoSize?: boolean;
	includeContent?: boolean;
	onClickEntry?: (entry: api.NavEntry, event: any) => void;
	loadNextListPage?: (list: api.ItemList) => {};
	accountRewards?: api.RewardsInfo;
	shouldHideMeRewardsTitle?: boolean;
	menuType?: MenuTypes;
	headerNav?: boolean;
}

const bem = new Bem('secondary-nav');
const MAX_COLUMNS_NO_CONTENT = 6;
const MAX_COLUMNS_VERTICAL = 4;
const MAX_COLUMNS_HORIZONTAL = 3;

class SecondaryNav extends React.Component<SecondaryNavProps, any> {
	static defaultProps = {
		autoFocus: true,
		includeContent: true
	};

	private menu: HTMLElement;

	componentDidMount() {
		if (this.props.autoFocus) {
			this.setFocus();
		}
		window.addEventListener('resize', this.onResize, false);
		this.onResize();
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onResize);
	}

	private getContentList(entry: api.NavEntry): api.ItemList {
		const { entries, includeContent, listCache } = this.props;
		if (!includeContent || entries.length > 1) return undefined;
		return getNavContentCachedList(entry, listCache);
	}

	private resizeMenu = () => {
		if (!this.menu) return;
		if (!this.props.autoSize) {
			this.menu.style.width = '';
			return;
		}
		const maxWidth = window.innerWidth;
		this.menu.style.width = maxWidth + 'px';
		const children = this.menu.children as HTMLCollectionOf<HTMLElement>;
		let maxChildWidth = 0;
		for (let i = 0; i < children.length; i++) {
			maxChildWidth = Math.max(maxChildWidth, children[i].clientWidth);
		}
		this.menu.style.width = Math.min(maxWidth, maxChildWidth + 8) + 'px';
	};

	private setFocus(toStart = true) {
		if (!this.menu) return;

		const focusTargets: any = this.menu.querySelectorAll('a,button');
		if (!focusTargets || !focusTargets.length) return;

		const index = toStart ? 0 : focusTargets.length - 1;
		focusTargets[index].focus();
	}

	/**
	 * `focusFirstElement` and `focusLastElement` are public as they may be invoked by the parent
	 */
	focusFirstElement() {
		this.setFocus();
	}
	focusLastElement() {
		this.setFocus(false);
	}

	private onResize = (e?) => {
		window.requestAnimationFrame(this.resizeMenu);
	};

	private onMenuRef = ref => {
		this.menu = findDOMNode<HTMLElement>(ref);
	};

	render() {
		const { className, entries, ariaLabel } = this.props;
		return (
			<IntlFormatter
				elementType="ul"
				ref={this.onMenuRef}
				className={cx(bem.b(), className)}
				role="menu"
				formattedProps={{ 'aria-label': ariaLabel || entries[0].label }}
			>
				{entries.map(this.renderCategory)}
			</IntlFormatter>
		);
	}

	private renderCategory = (entry: api.NavEntry, index: number): any => {
		const { entries, verticalContent } = this.props;
		const singleEntry = entries.length <= 1;
		const role = singleEntry ? 'presentation' : undefined;
		const ariaLabel = singleEntry ? undefined : entry.label;
		const list = this.getContentList(entry);
		const contentLayout = list ? (verticalContent ? 'vertical' : 'horizontal') : undefined;
		return (
			<li
				key={`category-${entry.label}`}
				className={bem.e('category', contentLayout)}
				aria-label={ariaLabel}
				role={role}
			>
				{verticalContent && this.renderContent(entry, list)}
				{this.renderLinks(entry, !!list)}
				{!verticalContent && this.renderContent(entry, list)}
			</li>
		);
	};

	private renderContent(entry: api.NavEntry, list: api.ItemList) {
		if (!list) return;
		const { verticalContent, loadNextListPage } = this.props;
		return (
			<NavContent
				className={bem.e('content')}
				title={entry.content.title}
				parentMenuTitle={entry.label}
				list={list}
				imageType={entry.content.imageType as image.Type}
				vertical={verticalContent}
				loadNextListPage={loadNextListPage}
			/>
		);
	}

	private renderLinks(entry: api.NavEntry, hasContent: boolean): any {
		const title = this.renderCategoryTitle(entry);
		const rows = this.renderRows(entry, hasContent);
		if (!title && !rows) return;
		return (
			<div className={bem.e('links')}>
				{title}
				{rows}
			</div>
		);
	}

	private renderCategoryTitle(entry: api.NavEntry) {
		if (!this.props.displayCategoryTitle) return;
		return this.renderLink(entry);
	}

	getSecondaryNavRows(group: api.NavEntry): api.NavEntry[] {
		const { accountRewards, shouldHideMeRewardsTitle } = this.props;

		const shouldShowMeRewardRows = isMeRewardsEntry(group) && group.children && accountRewards;
		if (shouldShowMeRewardRows) {
			if (shouldHideMeRewardsTitle) return getMeRewardsMenuEntries(group.children, accountRewards) || [];
			return [group].concat(getMeRewardsMenuEntries(group.children, accountRewards) || []);
		}

		return [group].concat(group.children || []);
	}

	private renderRows(entry: api.NavEntry, hasContent: boolean): any {
		const children = entry.children;
		if (!children || !children.length) return;

		const columnEntries: api.NavEntry[][] = [];
		for (let group of children) {
			const entries = this.getSecondaryNavRows(group);
			columnEntries.push(entries);
		}
		const vertical = this.props.verticalContent;
		const maxColumns = hasContent ? (vertical ? MAX_COLUMNS_VERTICAL : MAX_COLUMNS_HORIZONTAL) : MAX_COLUMNS_NO_CONTENT;
		const jsx = [];
		while (columnEntries.length) {
			const entries = columnEntries.splice(0, maxColumns);
			jsx.push(
				<div key={'row-' + jsx.length} className={cx(bem.e('row'), { 'multi-columns': entries.length > 1 })}>
					{entries.map(this.renderColumn)}
				</div>
			);
		}
		return jsx;
	}

	private renderColumn = (entries: api.NavEntry[], index: number): any => {
		const { accountRewards, entries: menuEntries, headerNav } = this.props;
		const firstEntry = entries[0];
		const firstEntryIsGroup = firstEntry.depth === NavEntryDepth.Group;
		const group = firstEntryIsGroup && entries.shift();
		const key = firstEntry.label || `column-${index}`;

		const firstLevelMenuOption = get(menuEntries[0], 'label');
		const menuOptions = [firstLevelMenuOption];

		if (firstEntry.label) {
			menuOptions.push(firstEntry.label);
		}

		const navEntries =
			isMeRewardsEntry(this.props.entries[0]) && group && group.children && accountRewards
				? getMeRewardsMenuEntries(group.children, accountRewards)
				: entries;

		/* this code is used in multiple places with different flex directions and conditions 
		 so we seperated the header nav code from rest of the code 
		 and added the headerNav condition to check if the headerNav is true then render the headerNav code` */

		if (headerNav) {
			return (
				<div key={key} className={bem.e('column')}>
					{group && this.renderLink(group, menuOptions)}
					<div className={bem.e('entries-wrapper')}>
						{navEntries.map((entry, index) => {
							return this.renderLink(entry, [...menuOptions, entry.label], index);
						})}
					</div>
				</div>
			);
		}

		return (
			<div key={key} className={bem.e('column')}>
				{group && this.renderLink(group, menuOptions)}
				{navEntries.map((entry, index) => {
					return this.renderLink(entry, [...menuOptions, entry.label], index);
				})}
			</div>
		);
	};

	private renderLink = (entry: api.NavEntry, menuOptions?: string[], index?: number): any => {
		if (!entry.label) return;
		const { menuType } = this.props;
		const options = menuOptions || [entry.label];
		return (
			<MenuWrapper key={`link-${index || entry.label}`} type={menuType} menuItemsOrder={options}>
				<NavEntryLink
					className={bem.e('link', getEntryDepthModifier(entry.depth))}
					entry={entry}
					onClick={this.props.onClickEntry}
				/>
			</MenuWrapper>
		);
	};
}

function mapStateToProps({ cache, app, account }: state.Root) {
	return {
		listCache: cache.list,
		accountRewards: get(account, 'info.rewards')
	};
}

const mapDispatchToProps = dispatch => {
	return {
		loadNextListPage: (list: api.ItemList) => dispatch(loadNextListPage(list))
	};
};

export default connect<any, any, SecondaryNavProps>(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{ withRef: true }
)(SecondaryNav);
