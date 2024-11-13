import * as React from 'react';
import { findDOMNode } from 'react-dom';
import Link from 'shared/component/Link';
import { Bem, addElementClass, removeElementClass } from 'shared/util/styles';
import DropMenu from './DropMenu';
import SecondaryNav from './SecondaryNav';
import NavExpandButton from './NavExpandButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';

import './PrimaryNav.scss';

interface PrimaryNavProps extends React.HTMLProps<any> {
	entries: api.NavEntry[];
	activeEntry: api.NavEntry;
	fixed?: boolean;
}

interface PrimaryNavState {
	moreEntry?: api.NavEntry;
	focusedIndex?: number;
	selectedIndex?: number;
}

const bem = new Bem('primary-nav');

const SHOW_MENU_TIMEOUT = 250;

export default class PrimaryNav extends React.PureComponent<PrimaryNavProps, PrimaryNavState> {
	private nav: HTMLElement;
	private selectedButton: HTMLElement;
	private lastNavWidth = 0;
	private hasResizeListener = false;
	private showMenuTimeout: number;
	// use hovered index for keeping active button for better drop down menu opening
	private hoveredIndex = -1;

	constructor(props) {
		super(props);
		this.state = {
			moreEntry: { label: '...', children: [], depth: 0 },
			focusedIndex: -1,
			selectedIndex: -1
		};
	}

	componentDidMount() {
		if (!this.props.fixed) {
			this.addResizeListener();
			this.onResize();
		}
	}

	componentDidUpdate(prevProps: PrimaryNavProps) {
		if (prevProps.fixed && !this.props.fixed) {
			this.addResizeListener();
		} else if (!prevProps.fixed && this.props.fixed) {
			this.removeResizeListener();
		}
		this.onResize();
	}

	componentWillUnmount() {
		this.removeResizeListener();
	}

	private addResizeListener() {
		if (this.hasResizeListener) return;
		this.hasResizeListener = true;
		window.addEventListener('resize', this.onResize, false);
	}

	private removeResizeListener() {
		if (!this.hasResizeListener) return;
		this.hasResizeListener = false;
		window.removeEventListener('resize', this.onResize);
	}

	private hideEntries = () => {
		if (!this.nav) return;

		const navRect = this.nav.getBoundingClientRect();
		if (!navRect || !navRect.width || navRect.width === this.lastNavWidth) return;

		// Temporarily allow item wrapping to aid in calculating how many nav items fit within the available space.
		const clippedClass = bem
			.b('clipped')
			.split(' ')
			.pop();
		removeElementClass(this.nav, clippedClass);

		this.lastNavWidth = navRect.width;

		const entries = this.props.entries;
		const totalEntries = entries.length;
		const { moreEntry, selectedIndex } = this.state;
		const children = this.nav.children as HTMLCollectionOf<HTMLElement>;

		// First reveal any hidden entries
		for (let i = 0; i < children.length; i++) {
			removeElementClass(children.item(i), 'hidden');
		}

		// Determine whether we are at the desktop breakpoint based on the height of the more button.
		// On mobile/tablet the height will be 0 as the more button display is hidden
		const moreButton = children.item(children.length - 1);
		const desktopLayout = moreButton.clientHeight > 0;
		// Force more button hidden until some entries are collapsed
		addElementClass(moreButton, 'hidden');

		// Hide children from right to left until until we reach a child that isn't wrapped
		// On desktop we will also continue to hide entries as long as the more button is wrapped
		let numCollapsed = 0;
		for (let i = totalEntries - 1; i >= 0; --i) {
			const element = desktopLayout && numCollapsed > 0 ? moreButton : children.item(i);
			if (element.getBoundingClientRect().top === navRect.top) break;
			if (desktopLayout && numCollapsed === 0) removeElementClass(moreButton, 'hidden');
			++numCollapsed;
			addElementClass(children.item(i), 'hidden');
		}

		// Now that we know how many items fit within the available space we disable item wrapping.
		addElementClass(this.nav, clippedClass);

		if (numCollapsed !== moreEntry.children.length) {
			const collapsedIndex = totalEntries - numCollapsed;
			moreEntry.children = entries.slice(collapsedIndex);
			this.setState({
				selectedIndex: selectedIndex >= collapsedIndex ? totalEntries : selectedIndex
			});
		}
	};

	/**
	 * Public method to allow closing popup menu externally
	 */
	clearSelection() {
		if (this.state.selectedIndex < 0) return;
		this.setState({ selectedIndex: -1 });
		if (this.selectedButton) {
			this.selectedButton.focus();
		}
	}

	private hasMenu(entry: api.NavEntry): boolean {
		if (this.props.fixed) return false;
		const { children, content } = entry;
		return !!((children && children.length) || (content && content.list));
	}

	private onNavRef = ref => {
		this.nav = findDOMNode<HTMLElement>(ref);
	};

	private onSelectedButtonRef = ref => {
		if (ref) this.selectedButton = findDOMNode<HTMLElement>(ref);
	};

	private onExpandButtonRef = (ref: React.Component<any, any>) => {
		if (ref) this.selectedButton = findDOMNode<HTMLElement>(ref);
	};

	private onResize = (e?) => {
		if (!this.nav) return;

		window.requestAnimationFrame(this.hideEntries);
	};

	private onMouseLeave = e => {
		this.clearSelection();
		this.hoveredIndex = -1;
	};

	private onDismissDropMenu = () => {
		this.clearSelection();
	};

	private onClickEntry = (entry: api.NavEntry) => {
		const entries = this.props.entries;
		const isMoreEntry = entry === this.state.moreEntry;
		const selectedIndex = isMoreEntry ? entries.length : entries.indexOf(entry);
		if (this.hasMenu(entry) && selectedIndex !== this.state.selectedIndex) {
			this.setState({ selectedIndex });
		} else {
			this.clearSelection();
		}
	};

	private onEntryMouseEnter = (entry: api.NavEntry, selectedIndex: number) => {
		if (this.hasMenu(entry)) {
			if (this.hoveredIndex < 0) {
				this.showMenuTimeout = window.setTimeout(() => this.setState({ selectedIndex }), SHOW_MENU_TIMEOUT);
			} else {
				this.setState({ selectedIndex });
			}
		} else {
			this.clearSelection();
		}
		this.hoveredIndex = selectedIndex;
	};

	private onEntryMouseLeave = () => {
		if (this.showMenuTimeout) {
			window.clearTimeout(this.showMenuTimeout);
			this.showMenuTimeout = undefined;
		}
	};

	private onFocusEntry = (focusedIndex: number) => {
		this.setState({ focusedIndex });
	};

	private onBlurEntry = e => {
		this.setState({ focusedIndex: -1 });
	};

	render() {
		const { entries, className, fixed } = this.props;
		const classes = cx(bem.b({ fixed }), className);
		const allEntries = fixed ? entries : entries.concat([this.state.moreEntry]);
		return (
			<IntlFormatter
				elementType="nav"
				ref={this.onNavRef}
				className={classes}
				onMouseLeave={this.onMouseLeave}
				role="navigation"
				formattedProps={{ 'aria-label': '@{nav_primary_aria|Primary}' }}
			>
				{allEntries.map(this.renderEntry)}
			</IntlFormatter>
		);
	}

	renderEntry = (entry: api.NavEntry, index: number): any => {
		const { activeEntry } = this.props;
		const { focusedIndex, selectedIndex, moreEntry } = this.state;
		const hasMenu = this.hasMenu(entry);
		const focused = focusedIndex === index;
		const expanded = selectedIndex === index;
		const more = entry === moreEntry;
		const classes = bem.e('entry', {
			active: entry === activeEntry,
			more,
			expanded,
			inert: !entry.path,
			empty: !hasMenu && !entry.path && !more
		});
		return (
			<div key={index} className={classes} onFocus={() => this.onFocusEntry(index)} onBlur={this.onBlurEntry}>
				{this.renderEntryLink(entry, index)}
				{hasMenu && entry.path && !more && (
					<NavExpandButton
						ref={expanded ? this.onExpandButtonRef : undefined}
						hidden={!focused || expanded}
						entry={entry}
						expanded={expanded}
						onClick={this.onClickEntry}
					/>
				)}
				{this.renderSecondaryNav(entry, index)}
			</div>
		);
	};

	private renderEntryLink(entry: api.NavEntry, index: number): any {
		const { label, path } = entry;
		const hasMenu = this.hasMenu(entry);
		const expanded = this.state.selectedIndex === index;
		const classes = bem.e('entry-link', { disabled: !path });
		const onMouseEnter = expanded ? undefined : () => this.onEntryMouseEnter(entry, index);
		const onMouseLeave = expanded ? undefined : () => this.onEntryMouseLeave();
		if (!path) {
			const ref = expanded ? this.onSelectedButtonRef : undefined;
			const isMoreEntry = entry === this.state.moreEntry;
			const onClick = () => this.onClickEntry(entry);
			const buttonProps = path ? { type: 'button', role: 'button' } : {};
			return (
				<IntlFormatter
					elementType={path ? 'button' : 'span'}
					ref={ref}
					className={cx(classes, bem.e('entry-label'))}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					onClick={onClick}
					{...buttonProps}
					aria-expanded={expanded || undefined}
					aria-haspopup={hasMenu || undefined}
					formattedProps={isMoreEntry ? { 'aria-label': '@{nav_primary_more_aria|More}' } : undefined}
				>
					<span className={bem.e('btn-label')}>{label}</span>
				</IntlFormatter>
			);
		}
		return (
			<Link className={classes} to={path} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
				{label}
			</Link>
		);
	}

	private renderSecondaryNav(entry: api.NavEntry, index: number): any {
		const { selectedIndex, moreEntry } = this.state;
		if (index !== selectedIndex) return;
		const isMoreEntry = entry === moreEntry;
		const entries = isMoreEntry ? entry.children : [entry];
		const ariaLabel = isMoreEntry ? '@{nav_primary_more_aria|More}' : undefined;
		return (
			<DropMenu onDismiss={this.onDismissDropMenu} autoFocus={false}>
				<SecondaryNav
					entries={entries}
					displayCategoryTitle={isMoreEntry}
					ariaLabel={ariaLabel}
					verticalContent={false}
					autoFocus={false}
				/>
			</DropMenu>
		);
	}
}
