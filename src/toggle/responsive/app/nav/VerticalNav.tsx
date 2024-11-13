import * as React from 'react';
import * as cx from 'classnames';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import VerticalNavGroup from 'ref/responsive/app/nav/VerticalNavGroup';
import CtaButton from 'ref/responsive/component/CtaButton';
import NavScrollableList from 'ref/responsive/app/nav/NavScrollableList';
import NavEntryLink from 'ref/responsive/app/nav/NavEntryLink';
import { signOut, unselectProfile } from 'shared/account/sessionWorkflow';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { Bem } from 'shared/util/styles';
import Link from 'shared/component/Link';
import {
	SignIn as signInPageKey,
	Home,
	AccountProfileResetPin as AccountProfileResetPinPageKey
} from 'shared/page/pageKey';
import { getNavContentCachedList } from 'shared/app/navUtil';
import { canShowProgressForList, isBookmarksList } from 'shared/list/listUtil';
import { checkListData } from 'shared/list/listUtil';
import { DomTriggerPoints } from 'shared/analytics/types/types';
import TriggerProvider from 'shared/analytics/components/TriggerProvider';
import { loadNextListPage } from 'shared/list/listWorkflow';
import ProfileIcon from './ProfileIcon';
import { isRestrictedPage } from 'shared/page/pageRestrictions';
import { selectActivePage } from 'shared/page/pageUtil';
import { browserHistory } from 'shared/util/browserHistory';
import { getPageUrlBeforePinReset, removePageUrlBeforePinReset } from 'toggle/responsive/util/pinUtil';
import { get } from 'shared/util/objects';
import { getRegisteredProfileInfo, isPrimaryProfile } from 'shared/account/profileUtil';

import './VerticalNav.scss';

interface OwnProps extends React.Props<any> {
	focusable?: boolean;
	onDismiss?: () => void;
}

interface StateProps {
	navigation?: api.Navigation;
	profile?: api.ProfileSummary;
	clientSide?: boolean;
	listCache?: any;
	profileCount?: number;
	isPrimaryProfile: boolean;
	homePath: string;
	signInPath: string;
	resetPinPath: string;
	activePage?: api.Page;
	accountRewards?: api.RewardsInfo;
}

interface DispatchProps {
	loadNextListPage?: (list: api.ItemList) => {};
	signOut?: (path: string) => {};
	showProfileSelector?: () => void;
}

type Props = OwnProps & StateProps & DispatchProps;

const bem = new Bem('vertical-nav');

const SIGN_OUT_ENTRY: api.NavEntry = {
	label: '@{nav_signOut_label|SIGN OUT}',
	path: '#',
	depth: 1,
	customFields: { className: 'customColor' }
};

const ACCOUNT_EXTRA_GROUPS: api.NavEntry[] = [
	{
		children: [SIGN_OUT_ENTRY],
		depth: 0
	}
];

export class VerticalNav extends React.Component<Props, any> {
	/**
	 * `firstElement` and `lastElement` will either be native HTMLElements or React
	 * Components which expose public methods `focusFirstElement` and `focusLastElement`
	 * to be called whenever focus exits from the end or start respectively
	 */
	private firstElement: any;
	private lastElement: any;
	private allowProgressBar: boolean;

	componentDidUpdate(prevProps: Props) {
		if (this.props.profile !== prevProps.profile) {
			// Move focus back to the first element in navigation after sign in/out
			this.focusFirstElement();
		}
	}

	private setFocus(toStart: boolean) {
		const focusTarget = toStart ? this.firstElement : this.lastElement;
		if (!this.props.focusable || !focusTarget) return;

		if (toStart && focusTarget.focusFirstElement) {
			focusTarget.focusFirstElement();
		} else if (!toStart && focusTarget.focusLastElement) {
			focusTarget.focusLastElement();
		} else if (focusTarget.focus) {
			focusTarget.focus();
		}
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

	onFirstElementRef = ref => {
		this.firstElement = findDOMNode(ref);
	};

	onLastElementRef = ref => {
		this.lastElement = ref;
	};

	onClickSwitchProfile = () => {
		if (window && window.location.pathname === this.props.resetPinPath) {
			browserHistory.push(getPageUrlBeforePinReset());
			removePageUrlBeforePinReset();
		}
		this.props.showProfileSelector();
		if (this.props.onDismiss) this.props.onDismiss();
	};

	onClickEntry = (entry: api.NavEntry, event: any): void => {
		const { activePage, onDismiss, signOut, homePath, signInPath } = this.props;
		if (entry.path === '#') {
			event.preventDefault();
		}
		if (entry === SIGN_OUT_ENTRY) {
			this.focusFirstElement();

			let redirectPath = homePath;
			if (isRestrictedPage(activePage)) {
				redirectPath = signInPath;
			} else if (activePage.path.indexOf('sa2022') > -1) {
				redirectPath = activePage.path;
			}
			signOut(redirectPath);
		}
		if (onDismiss) onDismiss();
	};

	render() {
		const { header, account } = this.props.navigation;
		const { profile } = this.props;
		const entries = header ? header.slice() : [];
		if (this.props.profile) {
			entries.push(account || { children: [], depth: 0 });
		}
		return (
			<div className={bem.b()}>
				{profile && this.renderProfiles()}
				{!profile && this.renderSignInActions()}
				{this.renderMyListTitle()}
				{this.renderContentList()}
				{entries.map(this.renderEntry)}
			</div>
		);
	}

	renderMyListTitle() {
		const { navigation, listCache } = this.props;
		const list = getNavContentCachedList(navigation.account, listCache);
		if (!list) return;

		const label = isBookmarksList(list) ? '@{nav_my_list_label| My list}' : list.title;
		const entry: api.NavEntry = {
			label,
			path: list.path,
			depth: 1
		};
		return <NavEntryLink className={bem.e('title')} entry={entry} />;
	}

	renderProfiles() {
		if (!this.props.clientSide) return;
		const { profile, profileCount, focusable, isPrimaryProfile } = this.props;
		const accountNav = this.props.navigation.account;
		const linkPath = accountNav && focusable ? accountNav.path : undefined;

		return (
			<section className={bem.e('account-section', 'signed-in')}>
				<ProfileIcon
					key="icon"
					ref={linkPath ? this.onFirstElementRef : undefined}
					className={bem.e('profile')}
					profile={profile}
					linkPath={linkPath}
					isPrimaryProfile={isPrimaryProfile}
				/>
				<span className={cx('truncate', bem.e('profile-name'))}>{profile.name}</span>
				{profileCount > 1 && (
					<IntlFormatter
						elementType="button"
						key="switch"
						ref={linkPath ? undefined : this.onFirstElementRef}
						className={bem.e('switch-button')}
						onClick={this.onClickSwitchProfile}
						tabIndex={focusable ? 0 : -1}
						formattedProps={{ 'aria-label': '@{nav_switchProfile_aria|Switch profile}' }}
					>
						{'@{nav_switchProfile_label|Switch}'}
					</IntlFormatter>
				)}
			</section>
		);
	}

	renderSignInActions() {
		if (!this.props.clientSide) return;
		const focusable = this.props.focusable;
		return (
			<section className={bem.e('account-section', 'signed-out')}>
				<TriggerProvider trigger={DomTriggerPoints.NavSignIn}>
					<Link to={`@${signInPageKey}`} tabIndex={focusable ? 0 : -1} className={bem.e('sign-in-action')}>
						<IntlFormatter
							className={bem.e('action-button')}
							elementType={CtaButton}
							componentProps={{
								ordinal: 'primary',
								focusable: false
							}}
						>
							{'@{nav_signIn_label|Sign In}'}
						</IntlFormatter>
					</Link>
				</TriggerProvider>
			</section>
		);
	}

	renderContentList() {
		const { navigation, listCache, loadNextListPage } = this.props;
		const list = getNavContentCachedList(navigation.account, listCache);
		if (!list) return;

		// show progress bar for bookmarks, watched and continue watching lists
		this.allowProgressBar = canShowProgressForList(list.id);
		// check show item for continue watching list
		checkListData(list);

		const classes = bem.e('list');
		const imageType = (this.props.navigation.account.content.imageType as image.Type) || 'poster';
		const packshotClasses = bem.e('packshot', imageType);

		return (
			<NavScrollableList
				className={classes}
				packshotClassName={packshotClasses}
				imageType={imageType}
				list={list}
				allowProgressBar={this.allowProgressBar}
				loadNextListPage={loadNextListPage}
				stopEventPropagation={true}
			/>
		);
	}

	renderEntry = (entry: api.NavEntry, index = 0, entries: api.NavEntry[]) => {
		const { profile, clientSide, accountRewards, focusable } = this.props;

		const ref = index === entries.length - 1 ? this.onLastElementRef : undefined;
		// If the user is signed in we always show the account entry as the last entry
		const isAccountEntry = profile && index === entries.length - 1;
		const label = entry.label || (isAccountEntry ? 'Account' : undefined);
		const extraGroups = isAccountEntry ? ACCOUNT_EXTRA_GROUPS : undefined;

		if (isAccountEntry && !clientSide) return;

		const renderNavGroup = () => {
			return (
				<VerticalNavGroup
					ref={ref}
					key={`entry-${index}`}
					entry={entry}
					label={label}
					focusable={focusable}
					extraGroups={extraGroups}
					onClickEntry={this.onClickEntry}
					accountRewards={accountRewards}
				/>
			);
		};
		if (isAccountEntry) {
			return (
				<TriggerProvider trigger={DomTriggerPoints.NavAccount} key={`entry-${index}`}>
					{renderNavGroup()}
				</TriggerProvider>
			);
		}
		return renderNavGroup();
	};
}

function mapStateToProps(state: state.Root): StateProps {
	const { account, profile, app, cache } = state;
	const profileCount = account.info ? account.info.profiles.length : 0;
	return {
		navigation: app.config.navigation,
		profile: getRegisteredProfileInfo(profile),
		clientSide: app.clientSide,
		listCache: cache.list,
		profileCount,
		isPrimaryProfile: isPrimaryProfile(profile, account),
		homePath: getPathByKey(Home, app.config),
		signInPath: getPathByKey(signInPageKey, app.config),
		activePage: selectActivePage(state) as api.Page,
		resetPinPath: getPathByKey(AccountProfileResetPinPageKey, app.config),
		accountRewards: get(account, 'info.rewards')
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		signOut: path => dispatch(signOut(path)),
		showProfileSelector: () => dispatch(unselectProfile()),
		loadNextListPage: list => dispatch(loadNextListPage(list))
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{ withRef: true }
)(VerticalNav);
