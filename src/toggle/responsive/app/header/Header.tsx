import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import { Bem } from 'shared/util/styles';
import { EPG } from 'shared/page/pageTemplate';
import { ESearch, Search as SearchPageKey } from 'shared/page/pageKey';
import { get } from 'shared/util/objects';
import { getErroredQueries } from 'shared/selectors/search';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { isEnhancedSearchEnabled } from 'toggle/responsive/util/enhancedSearchUtil';
import { isHeroEntryTemplate } from 'shared/page/pageEntryTemplate';
import { isRestrictedPage } from 'shared/page/pageRestrictions';
import { memoize } from 'shared/util/performance';
import { noop } from 'shared/util/function';
import { populateNavLists } from 'shared/list/listWorkflow';
import { search, searchSave, searchClear } from 'shared/search/searchWorkflow';
import { selectActivePage, selectPageState, NULL_PAGE } from 'shared/page/pageUtil';
import { updateHeaderPosition } from 'shared/app/appWorkflow';
import { UPDATE_SUBSCRIPTION_ENTRY_POINT } from 'shared/page/pageWorkflow';
import AccountNav from 'toggle/responsive/app/nav/AccountNav';
import BrandLogo from 'ref/responsive/component/AxisLogo';
import HeaderSearch from './HeaderSearch';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Link from 'shared/component/Link';
import MenuButton from 'ref/responsive/app/header/MenuButton';
import NotificationComponent from 'toggle/responsive/app/notifications/NotificationComponent';
import PrimaryNav from 'ref/responsive/app/nav/PrimaryNav';
import SearchIcon from 'ref/responsive/component/SearchIcon';
import './Header.scss';

interface OwnProps extends React.Props<any> {
	profile?: api.ProfileSummary;
	entries?: api.NavEntry[];
	activeEntry?: api.NavEntry;
	isEnhancedSearch?: boolean;
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
	isEPGPage?: boolean;
	showLogoOnly?: boolean;
}

interface DispatchProps {
	updateSubscriptionEntryPoint?: (entryPoint) => void;
}

interface HeaderState {
	headerTop?: number;
	fixed?: boolean;
	insideHero?: boolean;
}

interface StateProps {
	isBannerVisible?: boolean;
}

const OFFSCREEN_SCROLL_MARGIN = 80;
const bem = new Bem('header');

const searchFormatProps = {
	title: '@{search_button_label|Search}',
	'aria-label': '@{nav_search_aria|Catalogue Search}'
};

const logoComponentProps = { to: '@home' };
const logoFormattedProps = { title: '@{app_home_label|Home}' };

type HeaderProps = OwnProps & DispatchProps & StateProps;
class Header extends React.PureComponent<HeaderProps, HeaderState> {
	static defaultProps = {
		autoFocus: true,
		firstElementRef: noop
	};

	private scrollYPrev = 0;
	private lastFixedY = 0;
	private repositionTimeoutId: number;
	private webView = false;

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
			positionTrackingEnabled,
			isSearchPage
		} = this.props;
		if (!menuOpen && autoFocus && prevProps.menuOpen && this.menuButton) {
			this.menuButton.focus();
		}
		if (positionTrackingEnabled && prevProps.positionTrackingEnabled !== positionTrackingEnabled)
			this.updateHeaderPosition();
		if (currentPath !== prevProps.currentPath) {
			if (this.topPrimaryNav) this.topPrimaryNav.clearSelection();
			if (this.accountNav) this.accountNav.clearSelection();
			// reset values ready for the new page data to be provided
			this.hasHero = !isSearchPage;
			this.setState({ headerTop: 0, insideHero: true }, this.updateHeaderPosition);
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
		if (!page || page === NULL_PAGE || !page.refId || this.activePageId === page.refId) {
			this.hasHero = false;
			return;
		}

		const entry = (page.entries || [])[0] || { template: '' };

		// The reference app design wants the hero mode header for sub account pages, however these pages are
		// static meaning there aren't any page entries to validate against. To accomodate this requirement we
		// enable hero mode for all static account pages.
		const isAccountSubPage = isRestrictedPage(page) && page.isStatic;
		this.webView = entry.template === 'X3';

		this.hasHero =
			isHeroEntryTemplate(entry.template) ||
			isAccountSubPage ||
			this.props.pageLoading ||
			this.props.forceHeroMode ||
			this.webView ||
			entry.template === 'EPG2';
		this.activePageId = page.refId;
		this.hero = undefined;
		this.checkScrollPosition();
	}

	updateHeaderPosition = () => {
		if (this.props.positionTrackingEnabled)
			this.props.updateHeaderPosition({ positionTop: this.state.headerTop, height: this.header.clientHeight });
	};

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
		if (!this.header) this.props.updateHeaderPosition({ height: node.clientHeight });

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

		this.hero = undefined;
		if (this.hasHero) {
			const mainElement = document.getElementById('main');
			const pageClass = mainElement.getElementsByClassName('page');
			const firstPage = pageClass && pageClass[0];
			const pageEntry = firstPage && firstPage.querySelectorAll('.page-entry:not(.page-entry--unsupported)');
			this.hero = pageEntry && (pageEntry[0] as HTMLElement);
		}

		const { fixed } = this.state;
		const scrollY = window.pageYOffset;
		const changeY = scrollY - this.scrollYPrev;
		const distY = window.pageYOffset - this.lastFixedY;
		const headerHeight = this.header.offsetHeight - this.main.offsetTop;
		const heroHeight = this.hero ? Math.max(0, this.hero.clientHeight - headerHeight) : 0;
		const overHero = this.hasHero && scrollY < heroHeight && !this.webView;

		// if the Page data contains a hero row entry, but we don't yet have a
		// DOM reference to it, then assume it's not attached yet and display
		// the hero-styled header anyway. If we don't then we'll see a flash
		// of the non-hero header before moving back to the hero version
		// once the row entry element's attached.
		const insideHero = this.hasHero && !this.hero ? true : this.hasHero && scrollY <= heroHeight + headerHeight;

		const headerWithMargin = this.header.offsetHeight + OFFSCREEN_SCROLL_MARGIN;
		if (distY <= 0 || scrollY <= 0) {
			if (!fixed) {
				this.setState({ fixed: true, headerTop: 0 }, this.updateHeaderPosition);
			} else {
				const headerTop = this.state.headerTop - distY < 0 ? this.state.headerTop - distY : 0;
				if (scrollY <= 0) this.setState({ headerTop: 0 }, this.updateHeaderPosition);
				else if (headerTop !== this.state.headerTop) this.setState({ headerTop }, this.updateHeaderPosition);

				this.lastFixedY = scrollY;
			}
		} else if (fixed && !overHero) {
			if (distY < headerWithMargin) {
				const headerTop =
					Math.abs(this.state.headerTop - distY) < headerWithMargin ? this.state.headerTop - distY : -headerWithMargin;
				if (headerTop !== this.state.headerTop) this.setState({ headerTop }, this.updateHeaderPosition);
			}
			this.lastFixedY = scrollY;
		} else if (!overHero) {
			this.setState({ fixed: false, headerTop: scrollY }, this.updateHeaderPosition);
		}

		if (changeY < 0 && distY > headerWithMargin) {
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
		const heroElement = document
			.getElementById('main')
			.getElementsByClassName('page')[0]
			.querySelectorAll('.page-entry:not(.page-entry--unsupported)')[0] as HTMLElement;
		this.hero = this.hasHero ? heroElement : undefined;

		const heroHeight = this.hero ? this.hero.clientHeight : 0;
		const overHero = this.hasHero && window.pageYOffset < heroHeight;
		const headerWithMargin = this.header.offsetHeight + OFFSCREEN_SCROLL_MARGIN;
		const distY = window.pageYOffset - this.lastFixedY;
		if (distY < headerWithMargin || overHero) return;

		const headerTop = window.pageYOffset - headerWithMargin;
		this.lastFixedY = headerTop;
		this.setState({ headerTop }, this.updateHeaderPosition);
	};

	render() {
		const {
			isSearchPage,
			focusable,
			className,
			pageLoading,
			entries,
			isEPGPage,
			isSignedIn,
			showLogoOnly,
			isBannerVisible
		} = this.props;
		const { insideHero, headerTop } = this.state;
		const featuredEntries = getFeaturedEntries(entries);
		const bottomNav = this.renderPrimaryNav(true);
		const classes = bem.b({
			hero: insideHero && !pageLoading && !this.webView && !showLogoOnly,
			'hero-mode': this.hasHero && !showLogoOnly,
			'no-shadow': isSearchPage || isEPGPage || showLogoOnly,
			'no-nav': !bottomNav,
			'no-featured': !featuredEntries.length,
			'solid-background': isEPGPage,
			'signed-in': isSignedIn,
			'with-banner': isBannerVisible
		});
		const offsetHeight = this.header ? this.header.offsetHeight : 0;

		return (
			<header className={cx(classes, className)} ref={this.onReference} role="menubar" aria-hidden={!focusable}>
				<div className={cx(bem.e('bar'), 'grid-margin')}>
					{showLogoOnly
						? this.renderLogo()
						: [
								this.renderSearchButton('search-left'),
								this.renderLogo(),
								this.renderPrimaryNav(),
								this.renderSearchForm(),
								this.renderAccountNav(),
								this.renderSearchButton('search-right'),
								this.renderMenuButton(),
								<NotificationComponent key="notification" offsetHeight={offsetHeight} headerTop={headerTop} />
						  ]}
				</div>
				{!!featuredEntries.length && !showLogoOnly && bottomNav}
			</header>
		);
	}

	private renderSearchButton(classModifier: string): any {
		const { isEnhancedSearch, isSearchPage } = this.props;
		const classes = cx(bem.e('icon-btn', 'search', classModifier), 'icon-btn');
		const searchProps = { to: isEnhancedSearch ? '@esearch' : '@search' }; // to direct to esearch page for small screen device
		if (isSearchPage) {
			return <div key={classModifier} className={classes} />;
		}
		return (
			<IntlFormatter
				key={classModifier}
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
				key="menu-btn"
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
				key="logo"
				elementType={Link}
				ref={this.onLogoRef}
				className={bem.e('logo')}
				componentProps={logoComponentProps}
				formattedProps={logoFormattedProps}
			>
				<BrandLogo role="presentation" className={bem.e('logo')} svgIndex="transparent" />
			</IntlFormatter>
		);
	}

	private renderSearchForm(): any {
		if (this.props.isSearchPage) return;
		return (
			<HeaderSearch
				key="search-form"
				ref={this.onHeaderSearchRef}
				insideHero={this.state.insideHero}
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
				key="account-nav"
				ref={this.onAccountNavRef}
				className={bem.e('nav-account')}
				focusable={this.props.focusable}
				insideHero={this.state.insideHero}
			/>
		);
	}

	private renderPrimaryNav(bottom?: boolean): any {
		const { entries, activeEntry, clientSide, updateSubscriptionEntryPoint, isSearchPage } = this.props;
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
				key="primary-nav"
				ref={bottom ? undefined : this.onTopPrimaryNavRef}
				className={cx(bem.e(elementName), 'scrollbar-padding')}
				entries={displayedEntries}
				activeEntry={activeEntry}
				fixed={!clientSide}
				updateSubscriptionEntryPoint={updateSubscriptionEntryPoint}
				isSearchPage={isSearchPage || false}
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
	const currentPageTemplate = page.history.pageSummary.template;
	const activeEntry = entries.find(e => e.path && e.path === currentPath);

	const pendingUpdates = get(profile, 'info.pendingUpdates');
	const noPendingUpdates = !pendingUpdates || pendingUpdates.length === 0;

	// In the 'rare' event that a new user signs into
	// a device that has a cached search history but
	// no defined searchPagePath within the Redux store
	const isEnhancedSearch = isEnhancedSearchEnabled(state);
	const enhancedSearchPath = getPathByKey(ESearch, app.config);
	const safeSearchPagePath = isEnhancedSearch
		? enhancedSearchPath
		: get(cache, 'search.pagePath') || getPathByKey(SearchPageKey, app.config);

	return {
		entries,
		activeEntry,
		currentPath,
		savedPageState: selectPageState(state),
		activePage: selectActivePage(state) as api.Page,
		pageLoading: app.chunkLoading || page.loading,
		clientSide: app.clientSide,
		isEnhancedSearch,
		isSearchPage: currentPath === cache.search.pagePath || currentPath === enhancedSearchPath,
		isEPGPage: currentPageTemplate === EPG,
		recentSearches: search.recentSearches,
		recentResults: cache.search.recentResultsUngrouped,
		searchPagePath: safeSearchPagePath,
		erroredQueries: getErroredQueries(app.erroredActions),
		isSignedIn: !!account && account.active,
		noPendingUpdates,
		positionTrackingEnabled: state.app.header.positionTrackingEnabled,
		isBannerVisible: state.uiLayer.isBannerVisible
	};
}

function mapDispatchToProps(dispatch): HeaderProps {
	return {
		onSearch: query => dispatch(search(query, false)),
		onSearchSave: query => dispatch(searchSave(query)),
		onSearchClear: () => dispatch(searchClear()),
		populateNavLists: () => dispatch(populateNavLists()),
		updateHeaderPosition: (headerPosition: state.Header) => dispatch(updateHeaderPosition(headerPosition)),
		updateSubscriptionEntryPoint: payload => dispatch({ type: UPDATE_SUBSCRIPTION_ENTRY_POINT, payload: payload })
	};
}

export default connect<any, DispatchProps, HeaderProps>(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{ withRef: true }
)(Header);
