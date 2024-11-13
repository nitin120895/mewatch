import * as React from 'react';
import * as cx from 'classnames';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import VerticalNavGroup from './VerticalNavGroup';
import { signOut, unselectProfile } from 'shared/account/sessionWorkflow';
import CtaButton from 'ref/responsive/component/CtaButton';
import ProfileIcon from './ProfileIcon';
import { Bem } from 'shared/util/styles';
import { SignIn as signInPageKey, Register as registerPageKey } from 'shared/page/pageKey';
import { getNavContentCachedList } from 'shared/app/navUtil';
import Link from 'shared/component/Link';
import { canShowProgressForList } from 'shared/list/listUtil';
import { checkListData } from 'shared/list/listUtil';
import TriggerProvider from 'shared/analytics/components/TriggerProvider';
import NavScrollableList from './NavScrollableList';
import { loadNextListPage } from 'shared/list/listWorkflow';

import './VerticalNav.scss';

interface VerticalNavProps extends React.Props<any> {
	navigation?: api.Navigation;
	focusable?: boolean;
	onDismiss?: () => void;
	signOut?: () => {};
	profile?: api.ProfileSummary;
	profileCount?: number;
	showProfileSelector?: () => void;
	clientSide?: boolean;
	listCache?: any;
	loadNextListPage?: (list: api.ItemList) => {};
}

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

export class VerticalNav extends React.Component<VerticalNavProps, any> {
	/**
	 * `firstElement` and `lastElement` will either be native HTMLElements or React
	 * Components which expose public methods `focusFirstElement` and `focusLastElement`
	 * to be called whenever focus exits from the end or start respectively
	 */
	private firstElement: any;
	private lastElement: any;
	private allowProgressBar: boolean;

	componentDidUpdate(prevProps: VerticalNavProps) {
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

	private onFirstElementRef = ref => {
		this.firstElement = findDOMNode(ref);
	};

	private onLastElementRef = ref => {
		this.lastElement = ref;
	};

	private onClickSwitchProfile = () => {
		this.props.showProfileSelector();
		if (this.props.onDismiss) this.props.onDismiss();
	};

	private onClickEntry = (entry: api.NavEntry, event: any): void => {
		if (entry.path === '#') {
			event.preventDefault();
		}
		if (entry === SIGN_OUT_ENTRY) {
			this.focusFirstElement();
			this.props.signOut();
		}
		if (this.props.onDismiss) this.props.onDismiss();
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
				{this.renderContentList()}
				{entries.map(this.renderEntry)}
			</div>
		);
	}

	private renderProfiles() {
		if (!this.props.clientSide) return;
		const { profile, profileCount, focusable } = this.props;
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
						{'@{nav_switchProfile_label|SWITCH}'}
					</IntlFormatter>
				)}
			</section>
		);
	}

	private renderSignInActions(): any {
		if (!this.props.clientSide) return;
		const focusable = this.props.focusable;
		return (
			<section className={bem.e('account-section', 'signed-out')}>
				<TriggerProvider trigger="navigation_register">
					<Link
						to={`@${registerPageKey}`}
						tabIndex={focusable ? 0 : -1}
						ref={this.onFirstElementRef}
						className={bem.e('sign-in-action')}
					>
						<IntlFormatter
							className={bem.e('action-button')}
							elementType={CtaButton}
							componentProps={{
								ordinal: 'primary',
								focusable: false
							}}
						>
							{'@{nav_register_label|Register}'}
						</IntlFormatter>
					</Link>
				</TriggerProvider>
				<TriggerProvider trigger="navigation_signin">
					<Link to={`@${signInPageKey}`} tabIndex={focusable ? 0 : -1} className={bem.e('sign-in-action')}>
						<IntlFormatter
							className={bem.e('action-button')}
							elementType={CtaButton}
							componentProps={{
								ordinal: 'secondary',
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

	private renderContentList() {
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
			/>
		);
	}

	private renderEntry = (entry: api.NavEntry, index = 0, entries: api.NavEntry[]): any => {
		const ref = index === entries.length - 1 ? this.onLastElementRef : undefined;
		// If the user is signed in we always show the account entry as the last entry
		const isAccountEntry = this.props.profile && index === entries.length - 1;
		const label = entry.label || (isAccountEntry ? 'Account' : undefined);
		const extraGroups = isAccountEntry ? ACCOUNT_EXTRA_GROUPS : undefined;

		if (isAccountEntry && !this.props.clientSide) return;

		return (
			<VerticalNavGroup
				ref={ref}
				key={`entry-${index}`}
				entry={entry}
				label={label}
				focusable={this.props.focusable}
				extraGroups={extraGroups}
				onClickEntry={this.onClickEntry}
			/>
		);
	};
}

function mapStateToProps({ account, profile, app, cache }: state.Root): VerticalNavProps {
	const profileCount = account.info ? account.info.profiles.length : 0;
	return {
		navigation: app.config.navigation,
		profile: profile.info,
		clientSide: app.clientSide,
		listCache: cache.list,
		profileCount
	};
}

function mapDispatchToProps(dispatch) {
	return {
		signOut: () => dispatch(signOut()),
		showProfileSelector: () => dispatch(unselectProfile()),
		loadNextListPage: list => dispatch(loadNextListPage(list))
	};
}

export default connect<any, any, VerticalNavProps>(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{ withRef: true }
)(VerticalNav);
