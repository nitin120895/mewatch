import * as React from 'react';
import { Bem } from 'shared/util/styles';
import NavEntryLink from './NavEntryLink';
import * as cx from 'classnames';

import './VerticalNavGroup.scss';

interface VerticalNavGroupProps extends React.Props<any> {
	entry: api.NavEntry;
	label: string;
	focusable?: boolean;
	extraGroups?: api.NavEntry[];
	onClickEntry?: (entry: api.NavEntry, event: any) => void;
}

const bem = new Bem('vertical-nav-group');

export default class VerticalNavGroup extends React.PureComponent<VerticalNavGroupProps, any> {
	private nav: HTMLElement;

	private setFocus(toStart: boolean) {
		if (!this.props.focusable || !this.nav) return;

		const focusTargets: any = this.nav.querySelectorAll('a,button');
		if (!focusTargets || !focusTargets.length) return;

		const index = toStart ? 0 : focusTargets.length - 1;
		focusTargets[index].focus();
	}

	/**
	 * `focusFirstElement` and `focusLastElement` are public as they may be invoked by the parent
	 */
	focusFirstElement() {
		this.setFocus(true);
	}
	focusLastElement() {
		this.setFocus(false);
	}

	private onNavRef = (ref: HTMLElement) => {
		this.nav = ref;
	};

	render() {
		const { entry, label } = this.props;
		return (
			<nav className={bem.b()} role="navigation" aria-label={label} ref={this.onNavRef}>
				{this.renderLink(entry)}
				{this.renderGroups(entry)}
			</nav>
		);
	}

	private renderGroups(entry: api.NavEntry): any {
		const groups = entry.children || [];
		const allGroups = groups.concat(this.props.extraGroups || []);
		if (!allGroups.length) return;
		return (
			<ul className={bem.e('groups')} role="presentation">
				{allGroups.map(this.renderGroup)}
			</ul>
		);
	}

	private renderGroup = (group: api.NavEntry, index: number): any => {
		const { label, children } = group;
		if (!label && (!children || !children.length)) return;
		return (
			<li key={`group-${index}`} className={bem.e('group')}>
				{this.renderLink(group)}
				{this.renderItems(group)}
			</li>
		);
	};

	private renderItems(group: api.NavEntry): any {
		const items = group.children;
		if (!items || !items.length) return;
		const role = group.label ? undefined : 'presentation';
		return (
			<ul className={bem.e('items')} role={role} aria-label={group.label}>
				{items.map(this.renderItem)}
			</ul>
		);
	}

	private renderItem = (item: api.NavEntry, index: number, items: api.NavEntry[]): any => {
		const classModifier = items.length > 3 ? 'dual' : 'single';
		const classes = cx(bem.e('item', classModifier), 'truncate');
		return (
			<li key={`item-${index}`} className={classes}>
				{this.renderLink(item)}
			</li>
		);
	};

	private renderLink(entry: api.NavEntry): any {
		if (!entry.label) return;
		const customEntryClassName =
			entry.customFields && entry.customFields['className'] ? entry.customFields['className'] : undefined;
		return (
			<NavEntryLink
				className={cx(bem.e('link', customEntryClassName))}
				entry={entry}
				focusable={this.props.focusable}
				onClick={this.props.onClickEntry}
			/>
		);
	}
}
