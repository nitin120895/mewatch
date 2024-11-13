import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Link from 'shared/component/Link';
import { Bem } from 'shared/util/styles';
import SearchIcon from '../../component/SearchIcon';
import CtaButton from '../../component/CtaButton';
import AccountButton from '../../component/AccountButton';
import MenuButton from './MenuButton';
import PrimaryNav from '../nav/PrimaryNav';
import * as cx from 'classnames';
import { promptSignIn, promptSignOut } from 'shared/account/sessionWorkflow';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { stopMove, focusedClass } from 'ref/tv/util/focusUtil';
import * as pageKey from 'shared/page/pageKey';
import { getPathByKey } from 'shared/page/sitemapLookup';
import sass from 'ref/tv/util/sass';
import './GlobalHeader.scss';

type GlobalHeaderProps = Partial<{
	entries: api.NavEntry[];
	strings: { [id: string]: string };
	onClickedMenu: (open: boolean) => void;
	currentPath: string;
	currentEntry: api.NavEntry;
	pageLoading: boolean;
	savedPageState: any;
	listCache: any;
	className: string;
	accountLabel: string;
	accountLabelColor: string;
	isFeaturedPrimaryItem: boolean;
	homePagePath: string;
	searchPagePath: string;
	accountPagePath: string;
}>;

type GlobalHeaderDispatchProps = {
	promptSignIn: () => void;
	promptSignOut: () => void;
};

enum FocusStateType {
	'menu',
	'navi',
	'search',
	'account'
}

type GlobalHeaderState = Partial<{
	entries: api.NavEntry[];
	entriesCount: number;
	displayType: string;
	focused: boolean;
	focusState: FocusStateType;
}>;

const tvTypes = ['show', 'season', 'episode'];
const bem = new Bem('globalHeader');
const maxPrimeNavCount = 5;

// Wait for some time before change to the new page
// after changing focus
const delayLoad = 1000; // milliseconds

class Header extends React.PureComponent<GlobalHeaderProps & GlobalHeaderDispatchProps, GlobalHeaderState> {
	context: {
		router: ReactRouter.InjectedRouter;
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		router: PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired
	};

	private header: HTMLElement;
	private topPrimaryNav: PrimaryNav;
	private focusableRow: Focusable;

	index: number;
	focused: true;
	height: number;

	constructor(props) {
		super(props);

		const entries = this.filterEntries(props.entries, maxPrimeNavCount);
		let focusState;

		if (props.currentPath === props.searchPagePath) {
			focusState = FocusStateType.search;
		} else if (props.currentPath === props.accountPagePath) {
			focusState = FocusStateType.account;
		} else {
			focusState = entries.length > 0 ? FocusStateType.navi : FocusStateType.menu;
		}

		this.state = {
			focused: false,
			entries,
			entriesCount: maxPrimeNavCount,
			focusState
		};

		this.focusableRow = {
			focusable: true,
			index: 0,
			height: sass.globalHeaderHeight,
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: stopMove,
			moveDown: this.moveDown,
			exec: this.exec
		};
	}

	componentDidMount() {
		this.context.focusNav.registerRow(this.focusableRow);
		this.focusableRow.ref = this.header;
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	componentWillReceiveProps(newProps: GlobalHeaderProps) {
		if (newProps.entries !== undefined && newProps.entries !== this.props.entries) {
			this.setState({ entries: this.filterEntries(newProps.entries, maxPrimeNavCount) });
		}

		if (this.props.currentPath !== newProps.currentPath && newProps.currentPath === newProps.homePagePath) {
			this.setState({
				focusState: FocusStateType.navi
			});

			this.topPrimaryNav.setCurEntryIndex(0);
		}
	}

	componentDidUpdate() {
		const { displayType } = this.state;

		if (displayType === 'display-overlay') {
			this.header.style.top = this.context.focusNav.getPageOffsetY() + 'px';
		} else {
			this.header.style.top = 0 + 'px';
		}
	}

	private restoreSavedState = (savedState: object) => {
		const state = savedState as GlobalHeaderState;

		if (state && state.displayType) {
			this.setState({
				displayType: state.displayType,
				focused: state.focused,
				focusState: state.focusState
			});
		}
	};

	private setFocus = (isFocused?: boolean): boolean => {
		this.setState({
			focused: isFocused
		});

		const { displayType } = this.state;

		if (isFocused) {
			if (displayType === 'display-hide') {
				this.setState({ displayType: 'display-show' });
				this.focusableRow.height = sass.globalHeaderHeight;
				this.header.style.position = '';
				this.context.focusNav.onGlobalHeaderDisplayChange('show');
			}
		} else {
			this.setState({ displayType: 'display-hide' });
			this.context.focusNav.onGlobalHeaderDisplayChange('hide');
			this.focusableRow.height = 0;
		}

		return true;
	};

	private moveLeft = (): boolean => {
		const { focusState, entries, entriesCount } = this.state;
		const hasEntry = entries.length > 0;
		let newState = focusState;

		switch (focusState) {
			case FocusStateType.navi:
				if (this.topPrimaryNav && this.topPrimaryNav.moveLeft && !this.topPrimaryNav.moveLeft()) {
					newState = FocusStateType.menu;
				}
				break;

			case FocusStateType.search:
				if (hasEntry) {
					newState = FocusStateType.navi;

					for (let i = entries.length - 1; i >= 0; i--) {
						if (entries[i].path && i < entriesCount) {
							if (this.topPrimaryNav && this.topPrimaryNav.setCurEntryIndex) {
								this.topPrimaryNav.setCurEntryIndex(entries.length - 1);
							}
							this.onEntryChanged(entries[i].path);
							break;
						}
					}
				} else {
					newState = FocusStateType.menu;
				}
				break;

			case FocusStateType.account:
				newState = FocusStateType.search;
				break;

			default:
				break;
		}

		if (focusState !== newState) {
			this.onFocusChanged(newState);
			this.setState({ focusState: newState });
		}

		return true;
	};

	private moveRight = (): boolean => {
		const { focusState, entries } = this.state;
		const hasEntry = entries.length > 0;
		let newState = focusState;

		switch (focusState) {
			case FocusStateType.menu:
				if (hasEntry) {
					newState = FocusStateType.navi;

					for (let i = 0; i < entries.length; i++) {
						if (entries[i].path) {
							this.topPrimaryNav.setCurEntryIndex(0);
							this.onEntryChanged(entries[i].path);
							break;
						}
					}
				} else {
					newState = FocusStateType.search;
				}

				break;

			case FocusStateType.navi:
				if (this.topPrimaryNav && this.topPrimaryNav.moveRight && !this.topPrimaryNav.moveRight()) {
					newState = FocusStateType.search;
				}
				break;

			case FocusStateType.search:
				newState = FocusStateType.account;
				break;

			default:
				break;
		}

		if (focusState !== newState) {
			this.onFocusChanged(newState);
			this.setState({ focusState: newState });
		}

		return true;
	};

	private moveDown = (): boolean => {
		// Hide global header
		this.setState({ displayType: 'display-hide' });
		return false;
	};

	private exec = (act?: string): boolean => {
		const { displayType, entries } = this.state;

		switch (act) {
			case 'showHeader':
				if (displayType === 'display-hide') {
					this.setState({ displayType: 'display-overlay' });
					this.focusableRow.height = sass.globalHeaderHeight;
					this.header.style.position = 'absolute';
					this.context.focusNav.onGlobalHeaderDisplayChange('overlay');
				}
				break;

			case 'fixHeader':
				this.setState({ displayType: '' });
				this.focusableRow.height = sass.globalHeaderHeight;
				this.header.style.position = '';
				this.context.focusNav.onGlobalHeaderDisplayChange('show');
				break;

			case 'hideHeader':
				if (displayType !== 'display-hide') {
					this.setState({ displayType: 'display-hide' });
					setTimeout(
						function() {
							this.header.style.position = '';
						}.bind(this),
						300
					);

					this.context.focusNav.onGlobalHeaderDisplayChange('hide');
					this.focusableRow.height = 0;
					return true;
				}

				return false;

			case 'click':
				if (this.state.focusState === FocusStateType.menu) {
					if (this.props.onClickedMenu) {
						this.props.onClickedMenu(true);
					}
				} else if (this.state.focusState === FocusStateType.account) {
					if (this.props.accountLabel) {
						this.context.router.push(this.props.accountPagePath);
					} else {
						this.props.promptSignIn();
					}
				} else if (this.state.focusState === FocusStateType.search) {
					const currentPath = this.props.currentPath;
					if (currentPath !== this.props.searchPagePath) {
						this.context.router.push(this.props.searchPagePath + '?featured=true');
						return true;
					} else {
						return false;
					}
				} else {
					const currentPath = this.props.currentPath;
					const tarPath = entries[this.topPrimaryNav.getCurEntryIndex()].path;
					if (currentPath !== tarPath) {
						this.context.router.push(tarPath + '?featured=true');
						return true;
					}
					return false;
				}
				break;

			case 'back':
				if (
					this.props.isFeaturedPrimaryItem ||
					this.props.currentPath === this.props.searchPagePath ||
					this.props.currentPath === this.props.accountPagePath
				) {
					if (this.state.focused) {
						const { focusState } = this.state;

						if (focusState === FocusStateType.menu) {
							// exit app
							this.context.focusNav.handleExit();
							return true;
						}

						let forceChangePage = false;
						if (focusState !== FocusStateType.navi) {
							forceChangePage = true;
						}

						this.setState({ focusState: FocusStateType.navi });
						const curEntryIndex = this.topPrimaryNav.getCurEntryIndex();
						if (curEntryIndex !== 0 || forceChangePage) {
							this.topPrimaryNav.setCurEntryIndex(0);
							this.onEntryChanged(entries[0].path);
						} else if (this.state.focusState !== FocusStateType.menu) {
							this.setState({ focusState: FocusStateType.menu });
						}
					} else {
						this.context.focusNav.moveToRow(0);
					}

					return true;
				}

				return false;

			case 'esc':
				return false;
			default:
				break;
		}

		return true;
	};

	private onFocusChanged = (newState: FocusStateType) => {
		switch (newState) {
			case FocusStateType.search:
				this.onEntryChanged(this.props.searchPagePath);
				break;
			default:
				break;
		}
	};

	private timePassed = 0;
	private delayTimer;
	private bakIndex = 0;
	private bakFocusState;
	private tarPath;

	private onEntryChanged = (path: string) => {
		this.tarPath = path;
		if (!this.delayTimer) {
			this.bakIndex = this.topPrimaryNav.getCurEntryIndex();
			this.bakFocusState = this.state.focusState;

			const { displayType } = this.state;

			this.delayTimer = setInterval(() => {
				this.timePassed += 100;

				if (this.timePassed >= delayLoad) {
					if (this.state.focused) {
						if (this.state.focusState === FocusStateType.navi || this.state.focusState === FocusStateType.search)
							this.context.router.push(this.tarPath + '?featured=true');
					} else if (displayType === 'display-show') {
						this.topPrimaryNav.setCurEntryIndex(this.bakIndex);
						this.setState({ focusState: this.bakFocusState });
					}

					this.timePassed = 0;
					clearInterval(this.delayTimer);
					this.delayTimer = 0;
				}
			}, 100);
		} else {
			this.timePassed = 0;
		}
	};

	private handleClickMenuButton = () => {
		if (this.context.focusNav.mouseActive) {
			if (this.props.onClickedMenu) {
				this.setState({ focusState: FocusStateType.menu });
				this.props.onClickedMenu(true);
			}
		}
	};

	private handleClickNavLink = index => {
		if (this.context.focusNav.mouseActive) {
			const { entries } = this.state;
			const currentPath = this.props.currentPath;
			const tarPath = entries[index].path;

			this.setState({ focusState: FocusStateType.navi });

			if (currentPath !== tarPath) {
				this.context.router.push(tarPath + '?featured=true');
			}
		}
	};

	private handleClickSearch = e => {
		e.preventDefault();

		if (this.context.focusNav.mouseActive) {
			this.setState({ focusState: FocusStateType.search });

			if (this.props.currentPath !== this.props.searchPagePath) {
				this.context.router.push(this.props.searchPagePath + '?featured=true');
			}
		}
	};

	private handleClickAccount = () => {
		if (this.context.focusNav.mouseActive) {
			this.setState({ focusState: FocusStateType.account });

			if (this.props.accountLabel) {
				this.context.router.push(this.props.accountPagePath);
			} else {
				this.props.promptSignIn();
			}
		}
	};

	private onTopPrimaryNavRef = (ref: PrimaryNav) => {
		this.topPrimaryNav = ref;
	};

	private onReference = node => {
		this.header = node;
	};

	private filterEntries(entries: api.NavEntry[], entriesCount: number) {
		const displayEntries = entries.filter(e => !!e.path && !!e.featured);
		const maxEntriesCount = Math.min(displayEntries.length, entriesCount);
		return displayEntries.slice(0, maxEntriesCount);
	}

	private updateEntries = (entriesCount: number) => {
		const entries = this.filterEntries(this.props.entries, entriesCount);
		this.setState({ entries, entriesCount });
	};

	render() {
		const { className } = this.props;
		const { displayType } = this.state;

		return (
			<header
				id="globalHeader"
				className={cx(bem.b(), className, displayType)}
				ref={this.onReference}
				role="menubar"
				aria-hidden={displayType === 'display-hide'}
			>
				<div className={cx(bem.e('bar'))}>
					{this.renderLeftItems()}
					{this.renderCenterItems()}
					{this.renderRightItems()}
				</div>
			</header>
		);
	}

	private renderLeftItems(): any {
		return <div className={bem.e('left')}>{this.renderMenuButton()}</div>;
	}

	private renderCenterItems(): any {
		return <div className={bem.e('center')}>{this.renderPrimaryNav()}</div>;
	}

	private renderRightItems(): any {
		return (
			<div className={bem.e('right')}>
				<div className={bem.e('right-center')}>
					{this.renderSearchButton()}
					<div className={bem.e('sign-in')} onClick={this.handleClickAccount}>
						{this.renderAccountButton()}
					</div>
				</div>
			</div>
		);
	}

	private renderSearchButton(): any {
		const { strings, searchPagePath } = this.props;
		const { focusState } = this.state;
		const classes = cx(
			bem.e('icon-btn', 'search', 'search-right'),
			'icon-btn',
			focusState === FocusStateType.search ? focusedClass : ''
		);

		const label = strings['nav_search_aria'];
		return (
			<Link className={classes} to={searchPagePath} title="search" aria-label={label} onClick={this.handleClickSearch}>
				<SearchIcon />
				<div className="underline" />
			</Link>
		);
	}

	private renderAccountButton(): any {
		const { accountLabel, accountLabelColor } = this.props;

		if (!accountLabel) {
			return (
				<CtaButton
					className={cx(bem.e('sign-in-button'), this.state.focusState === FocusStateType.account ? focusedClass : '')}
					label={'@{nav_signIn_label|Login}'}
				/>
			);
		} else {
			const className = bem.e('account');
			return (
				<AccountButton
					label={accountLabel}
					labelColor={accountLabelColor}
					className={cx(className, this.state.focusState === FocusStateType.account ? focusedClass : '')}
				/>
			);
		}
	}

	private renderMenuButton(): any {
		const { focusState } = this.state;
		return (
			<MenuButton
				className={cx(bem.e('icon-btn', 'menu'), focusState === FocusStateType.menu ? focusedClass : '')}
				onClick={this.handleClickMenuButton}
			/>
		);
	}

	private renderPrimaryNav(): any {
		const { listCache, strings } = this.props;
		const { focusState, entries } = this.state;
		const elementName = 'nav-top';

		return (
			<PrimaryNav
				ref={this.onTopPrimaryNavRef}
				className={cx(bem.e(elementName), focusState === FocusStateType.navi ? focusedClass : '')}
				entries={entries}
				listCache={listCache}
				strings={strings}
				entryChanged={this.onEntryChanged}
				onClickNavLink={this.handleClickNavLink}
				updateEntries={this.updateEntries}
			/>
		);
	}
}

function mapStateToProps(state: state.Root): GlobalHeaderProps {
	const { app, cache, page, profile } = state;
	const nav = app.config.navigation;
	const entries = (nav && nav.header) || [];
	const currentPath = page.history.location.pathname;
	const homePagePath = getPathByKey(pageKey.Home, app.config);
	const searchPagePath = getPathByKey(pageKey.Search, app.config);
	const accountPagePath = getPathByKey(pageKey.Account, app.config);

	let isFeaturedPrimaryItem = false;
	let curSubPath = '';

	if (currentPath) {
		const pathParts = currentPath.split('/');
		if (pathParts.length > 1) {
			curSubPath = pathParts[1];

			if (tvTypes.find(t => t === curSubPath)) {
				curSubPath = 'tv';
			}
		}
	}

	let currentEntry;
	let activeEntry = entries.find(
		e => e.path && curSubPath && e.path && e.path !== homePagePath && e.path.indexOf(curSubPath) === 1
	);

	if (!activeEntry) {
		activeEntry = entries[0];
	} else {
		currentEntry = activeEntry;
	}

	if (
		currentPath === homePagePath ||
		(activeEntry && currentPath !== homePagePath && activeEntry.path === currentPath)
	) {
		isFeaturedPrimaryItem = true;
	}

	return {
		entries: entries,
		currentPath,
		currentEntry,
		pageLoading: state.page.loading,
		strings: app.i18n.strings,
		listCache: cache.list,
		accountLabel: profile && profile.info && profile.info.name && profile.info.name.substr(0, 1),
		accountLabelColor: profile && profile.info && profile.info.color,
		isFeaturedPrimaryItem,
		homePagePath,
		searchPagePath,
		accountPagePath
	};
}

function mapDispatchToProps(dispatch: any): GlobalHeaderDispatchProps {
	return {
		promptSignIn: () => dispatch(promptSignIn()),
		promptSignOut: () => dispatch(promptSignOut())
	};
}

export default connect<GlobalHeaderProps, GlobalHeaderDispatchProps, GlobalHeaderProps>(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{ withRef: true }
)(Header);
