import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { search, searchSave, searchClear } from 'shared/search/searchWorkflow';
import { getErroredQueries } from 'shared/selectors/search';
import { populateNavLists } from 'shared/list/listWorkflow';
import { selectActivePage, selectPageState, NULL_PAGE } from 'shared/page/pageUtil';
import { isHeroEntryTemplate } from 'shared/page/pageEntryTemplate';
import { isRestrictedPage } from 'shared/page/pageRestrictions';
import Link from 'shared/component/Link';
import { Bem } from 'shared/util/styles';
import SearchIcon from '../../component/SearchIcon';
import HeaderSearch from './HeaderSearch';
import MenuButton from './MenuButton';
import BrandLogo from '../../component/AxisLogo';
import PrimaryNav from '../nav/PrimaryNav';
import AccountNav from '../nav/AccountNav';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';
import { memoize } from 'shared/util/performance';
import { noop } from 'shared/util/function';

import './Header.scss';

interface HeaderProps extends React.Props<any> {
	profile?: api.ProfileSummary;
	entries?: api.NavEntry[];
	activeEntry?: api.NavEntry;
	isSearchPage?: boolean;
	onClickedMenu?: (open: boolean) => void;
	menuOpen?: boolean;
	menuId?: string;
	focusable?: boolean;
	autoFocus?: boolean;
	currentPath?: string;
	clientSide?: boolean;
	pageLoading?: boolean;
	savedPageState?: any;
	activePage?: api.Page;
	recentSearches?: string[];
	recentResults?: api.SearchResults[];
	erroredQueries?: string[];
	searchPagePath?: string;
	onSearch?: (query: string) => Promise<any>;
	onSearchSave?: (query: string) => void;
	onSearchClear?: () => void;
	populateNavLists?: () => void;
	className?: string;
	// Hero mode is triggered via runtime checks which depend on conditions provided by the main application.
	// These checks aren't suitable within the component viewer so for demonstration purposes we allow explicitly
	// enabling it via this property.
	forceHeroMode?: boolean;
	isSignedIn?: boolean;
	firstElementRef?: (ref: any) => void;
	noPendingUpdates?: boolean;
	updateHeaderPosition?: (headerPosition: state.Header) => void;
	positionTrackingEnabled?: boolean;
}

interface HeaderState {
	headerTop?: number;
	fixed?: boolean;
	insideHero?: boolean;
}

const OFFSCREEN_SCROLL_MARGIN = 80;
const bem = new Bem('header');

const searchFormatProps = {
	title: '@{search_button_label|Search}',
	'aria-label': '@{nav_search_aria|Catalogue Search}'
};
const searchProps = { to: '@search' };

const logoComponentProps = { to: '@home' };
const logoFormattedProps = { title: '@{app_home_label|Home}' };

class Header extends React.PureComponent<HeaderProps, HeaderState> {
	static defaultProps = {
		autoFocus: true,
		firstElementRef: noop
	};

	private scrollYPrev = 0;
	private lastFixedY = 0;
	private repositionTimeoutId: number;

	private header: HTMLElement;
	private main: HTMLElement;
	private menuButton: HTMLElement;
	private topPrimaryNav: PrimaryNav;
	private search: HeaderSearch;
	private logoButton: HTMLElement;
	private accountNav: any;

	private activePageId: string;
	private hasHero = true;
	private hero: HTMLElement;
	private cancelFirstPageRowSearch?: () => void;

	constructor(props) {
		super(props);
		this.state = {
			headerTop: 0,
			insideHero: true,
			fixed: false
		};
	}

	componentDidMount() {
		window.addEventListener('scroll', this.onScroll, false);
		this.main = document.getElementById('main');
		this.checkPageForHero(this.props.activePage);
		this.checkNavLists();
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.onScroll);
		if (this.cancelFirstPageRowSearch) this.cancelFirstPageRowSearch();
		clearTimeout(this.repositionTimeoutId);
		this.hero = undefined;
		this.main = undefined;
	}

	componentDidUpdate(prevProps: HeaderProps, prevState: any) {
		const {
			menuOpen,
			autoFocus,
			currentPath,
			savedPageState,
			activePage,
			pageLoading,
			noPendingUpdates,
			isSearchPage
		} = this.props;
		if (!menuOpen && autoFocus && prevProps.menuOpen && this.menuButton) {
			this.menuButton.focus();
		}
		if (currentPath !== prevProps.currentPath) {
			if (this.topPrimaryNav) this.topPrimaryNav.clearSelection();
			if (this.accountNav) this.accountNav.clearSelection();
			// reset values ready for the new page data to be provided
			this.hasHero = !isSearchPage;
			this.setState({ headerTop: 0, insideHero: true });
		}
		if (savedPageState !== prevProps.savedPageState) {
			this.scrollYPrev = savedPageState.scrollY || 0;
		}
		if (this.search && prevState.fixed !== this.state.fixed) {
			this.search.blurInput();
		}
		if (this.props.entries !== prevProps.entries || prevProps.noPendingUpdates !== noPendingUpdates) {
			this.checkNavLists();
		}
		if (!pageLoading && activePage.refId && activePage.refId !== this.activePageId) {
			this.checkPageForHero(activePage);
		}
	}

	private checkNavLists() {
		const { noPendingUpdates, populateNavLists } = this.props;
		// we should be sure we have no pending updates for loading profile's list
		if (noPendingUpdates) populateNavLists();
	}

	private checkPageForHero(page) {
		if (!page || page === NULL_PAGE || !page.refId || this.activePageId === page.refId) return;

		const entry = (page.entries || [])[0] || { template: '' };

		// The reference app design wants the hero mode header for sub account pages, however these pages are
		// static meaning there aren't any page entries to validate against. To accomodate this requirement we
		// enable hero mode for all static account pages.
		const isAccountSubPage = isRestrictedPage(page) && page.isStatic;

		this.hasHero =
			isHeroEntryTemplate(entry.template) || isAccountSubPage || this.props.pageLoading || this.props.forceHeroMode;
		this.activePageId = page.refId;
		this.hero = undefined;
		this.checkScrollPosition();
	}

	private onHeaderSearchRef = (ref: HeaderSearch) => {
		this.search = ref;
	};

	private onMenuButtonRef = ref => {
		this.menuButton = ref ? findDOMNode<HTMLElement>(ref) : undefined;
	};

	private onTopPrimaryNavRef = (ref: PrimaryNav) => {
		this.topPrimaryNav = ref;
	};

	private onAccountNavRef = (ref: any) => {
		this.accountNav = ref ? ref.getWrappedInstance() : undefined;
	};

	private onReference = node => {
		this.header = node;
	};

	private onScroll = e => {
		window.requestAnimationFrame(this.checkScrollPosition);
	};

	private onLogoRef = ref => {
		const node = findDOMNode<HTMLElement>(ref);
		this.logoButton = node;
		this.props.firstElementRef(node);
	};

	/**
	 * `focusFirstElement` is public as it may be invoked by the parent
	 * Required for FocusCaptureGroup to focus the correct element
	 */
	focusFirstElement() {
		if (this.logoButton) {
			this.logoButton.focus();
		}
	}

	private checkScrollPosition = () => {
		clearTimeout(this.repositionTimeoutId);
		if (!this.header || !this.main) return;

		this.hero = this.hasHero ? document.getElementById('row0') : undefined;

		const { fixed } = this.state;
		const scrollY = window.pageYOffset;
		const changeY = scrollY - this.scrollYPrev;
		const distY = window.pageYOffset - this.lastFixedY;
		const headerHeight = this.header.offsetHeight - this.main.offsetTop;
		const heroHeight = this.hero ? Math.max(0, this.hero.clientHeight - headerHeight) : 0;
		const overHero = this.hasHero && scrollY < heroHeight;

		// if the Page data contains a hero row entry, but we don't yet have a
		// DOM reference to it, then assume it's not attached yet and display
		// the hero-styled header anyway. If we don't then we'll see a flash
		// of the non-hero header before moving back to the hero version
		// once the row entry element's attached.
		const insideHero = this.hasHero && !this.hero ? true : this.hasHero && scrollY <= heroHeight + headerHeight;

		if (distY <= 0 || scrollY <= 0) {
			if (!fixed) {
				this.setState({ fixed: true, headerTop: 0 });
			} else {
				this.lastFixedY = scrollY;
			}
		} else if (fixed && !overHero) {
			this.setState({ fixed: false, headerTop: scrollY });
			this.lastFixedY = scrollY;
		}

		if (changeY < 0 && distY > headerHeight + OFFSCREEN_SCROLL_MARGIN) {
			this.repositionHeader();
		} else {
			this.repositionTimeoutId = window.setTimeout(this.repositionHeader, 600);
		}

		// Opening the menu can trigger a scroll event as we shift
		// the page to a 'fixed' position. In this case we avoid updating
		// the hero as it can think we're at the top of the page which
		// would set a transparent background.
		if (!this.props.menuOpen) {
			this.setState({ insideHero });
		}
		this.scrollYPrev = scrollY;
	};

	private repositionHeader = () => {
		if (!this.header) {
			// Some pages don't display a header. `checkScrollPosition` uses a
			// setTimeout call (see `repositionTimeoutId`) under some scenarios
			// which means we can't guarantee this isn't called after this
			// component has already unmounted. In this situation we simply abort.
			return;
		}
		this.hero = this.hasHero ? document.getElementById('row0') : undefined;

		const heroHeight = this.hero ? this.hero.clientHeight : 0;
		const h = this.header.offsetHeight + OFFSCREEN_SCROLL_MARGIN;
		const distY = window.pageYOffset - this.lastFixedY;
		const overHero = this.hasHero && window.pageYOffset < heroHeight;
		if (distY < h || overHero) return;

		const headerTop = window.pageYOffset - h;
		this.lastFixedY = headerTop;
		this.setState({ headerTop });
	};

	render() {
		const { isSearchPage, focusable, className, pageLoading } = this.props;
		const { insideHero, headerTop, fixed } = this.state;
		const bottomNav = this.renderPrimaryNav(true);
		const classes = bem.b({
			hero: insideHero && !pageLoading && !isSearchPage,
			'hero-mode': this.hasHero,
			'no-shadow': isSearchPage,
			'no-nav': !bottomNav,
			fixed: fixed
		});
		const style = headerTop ? { top: `${headerTop}px` } : undefined;
		return (
			<header
				className={cx(classes, className)}
				style={style}
				ref={this.onReference}
				role="menubar"
				aria-hidden={!focusable}
			>
				<div className={cx(bem.e('bar'), 'grid-margin')}>
					{this.renderSearchButton('search-left')}
					{this.renderLogo()}
					{this.renderPrimaryNav()}
					{this.renderSearchForm()}
					{this.renderAccountNav()}
					{this.renderSearchButton('search-right')}
					{this.renderMenuButton()}
				</div>
				{bottomNav}
			</header>
		);
	}

	private renderSearchButton(classModifier: string): any {
		const { isSearchPage } = this.props;
		const classes = cx(bem.e('icon-btn', 'search', classModifier), 'icon-btn');
		if (isSearchPage) {
			return <div className={classes} />;
		}
		return (
			<IntlFormatter
				elementType={Link}
				className={classes}
				componentProps={searchProps}
				formattedProps={searchFormatProps}
			>
				<SearchIcon />
			</IntlFormatter>
		);
	}

	private renderMenuButton(): any {
		const { menuId, onClickedMenu, menuOpen } = this.props;
		return (
			<MenuButton
				ref={this.onMenuButtonRef}
				className={cx(bem.e('icon-btn', 'menu'))}
				menuId={menuId}
				toggleMenuVisibility={onClickedMenu}
				menuVisible={menuOpen}
			/>
		);
	}

	private renderLogo(): any {
		return (
			<IntlFormatter
				elementType={Link}
				ref={this.onLogoRef}
				className={bem.e('logo')}
				componentProps={logoComponentProps}
				formattedProps={logoFormattedProps}
			>
				<BrandLogo role="presentation" className={bem.e('logo-transparent-background')} svgIndex="transparent" />
				<BrandLogo role="presentation" className={bem.e('logo-colorful-background')} svgIndex="colorful" />
			</IntlFormatter>
		);
	}

	private renderSearchForm(): any {
		if (this.props.isSearchPage) return;
		return (
			<HeaderSearch
				ref={this.onHeaderSearchRef}
				insideHero={this.state.insideHero}
				isSignedIn={this.props.isSignedIn}
				recentSearches={this.props.recentSearches}
				recentResults={this.props.recentResults}
				erroredQueries={this.props.erroredQueries}
				searchPagePath={this.props.searchPagePath}
				onSearch={this.props.onSearch}
				onSearchSave={this.props.onSearchSave}
				onSearchClear={this.props.onSearchClear}
			/>
		);
	}

	private renderAccountNav(): any {
		return (
			<AccountNav
				ref={this.onAccountNavRef}
				className={bem.e('nav-account')}
				focusable={this.props.focusable}
				insideHero={this.state.insideHero}
			/>
		);
	}

	private renderPrimaryNav(bottom?: boolean): any {
		const { entries, activeEntry, clientSide } = this.props;
		const elementName = `nav-${bottom ? 'bottom' : 'top'}`;
		const minEntries = bottom ? 2 : 0;
		const featuredEntries = getFeaturedEntries(entries);

		if (bottom) {
			// Insufficient featured entries
			if (entries.length < minEntries || !activeEntry) return false;
			// If you're not on a featured page or the homepage
			const activeIsHome = activeEntry.path === '/';
			const activeIsFeatured = featuredEntries.some(e => e === activeEntry);
			if (!activeIsHome && !activeIsFeatured) return false;
		}

		const displayedEntries = bottom ? featuredEntries : entries;
		return (
			<PrimaryNav
				ref={bottom ? undefined : this.onTopPrimaryNavRef}
				className={cx(bem.e(elementName), 'scrollbar-padding')}
				entries={displayedEntries}
				activeEntry={activeEntry}
				fixed={!clientSide}
			/>
		);
	}
}

// Retrieve all featured entries and limit them to 3
const getFeaturedEntries = memoize((entries: api.NavEntry[]) => {
	return entries.filter(entry => entry.featured).slice(0, 3);
});

const entriesDefault = [];
function mapStateToProps(state: state.Root): HeaderProps {
	const { app, cache, page, search, account, profile } = state;
	const nav = app.config.navigation;
	const entries = (nav && nav.header) || entriesDefault;
	const currentPath = page.history.location.pathname;
	const activeEntry = entries.find(e => e.path && e.path === currentPath);

	const pendingUpdates = profile && profile.info && profile.info.pendingUpdates;
	const noPendingUpdates = !pendingUpdates || pendingUpdates.length === 0;

	return {
		entries,
		activeEntry,
		currentPath,
		savedPageState: selectPageState(state),
		activePage: selectActivePage(state) as api.Page,
		pageLoading: app.chunkLoading || page.loading,
		clientSide: app.clientSide,
		isSearchPage: currentPath === cache.search.pagePath,
		recentSearches: search.recentSearches,
		recentResults: cache.search.recentResultsUngrouped,
		searchPagePath: cache.search.pagePath,
		erroredQueries: getErroredQueries(app.erroredActions),
		isSignedIn: !!account,
		noPendingUpdates
	};
}

function mapDispatchToProps(dispatch): HeaderProps {
	return {
		onSearch: query => dispatch(search(query, false)),
		onSearchSave: query => dispatch(searchSave(query)),
		onSearchClear: () => dispatch(searchClear()),
		populateNavLists: () => dispatch(populateNavLists())
	};
}

export default connect<any, any, HeaderProps>(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{ withRef: true }
)(Header);
