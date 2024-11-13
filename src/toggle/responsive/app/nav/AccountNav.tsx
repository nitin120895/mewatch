import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import DropMenu from 'ref/responsive/app/nav/DropMenu';
import SecondaryNav from 'ref/responsive/app/nav/SecondaryNav';
import NavExpandButton from 'ref/responsive/app/nav/NavExpandButton';
import CtaButton from 'ref/responsive/component/CtaButton';
import { signOut, unselectProfile } from 'shared/account/sessionWorkflow';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { Bem } from 'shared/util/styles';
import Link from 'shared/component/Link';
import {
	Home,
	SignIn as signInPageKey,
	AccountProfileResetPin as AccountProfileResetPinPageKey
} from 'shared/page/pageKey';
import { DomTriggerPoints } from 'shared/analytics/types/types';
import TriggerProvider from 'shared/analytics/components/TriggerProvider';
import { NavEntryDepth } from 'shared/app/navUtil';
import ProfileIcon from './ProfileIcon';
import { MixpanelEntryPoint } from 'shared/analytics/mixpanel/util';
import { selectActivePage } from 'shared/page/pageUtil';
import { UPDATE_SUBSCRIPTION_ENTRY_POINT } from 'shared/page/pageWorkflow';
import { browserHistory } from 'shared/util/browserHistory';
import { getPageUrlBeforePinReset, removePageUrlBeforePinReset } from 'toggle/responsive/util/pinUtil';
import { getRegisteredProfileInfo, isPrimaryProfile } from 'shared/account/profileUtil';
import InfoIcon from 'toggle/responsive/component/icons/InfoIcon';
import Tooltip from 'toggle/responsive/component/Tooltip';
import { redirectToMeConnectSettings } from 'shared/account/accountUtil';

import './AccountNav.scss';

interface OwnProps {
	className?: string;
	focusable?: boolean;
	insideHero?: boolean;
}

interface StateProps {
	profile?: api.ProfileSummary;
	entry?: api.NavEntry;
	clientSide?: boolean;
	profileCount?: number;
	isPrimaryProfile: boolean;
	homePath: string;
	signInPath: string;
	resetPinPath: string;
	activePage?: api.Page;
	accountEmail?: string;
}

interface DispatchProps {
	signOut?: (path: string) => void;
	showProfileSelector?: () => void;
	updateSubscriptionEntryPoint: (entryPoint) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

interface AccountNavState {
	focused?: boolean;
	selected?: boolean;
}

const bem = new Bem('account-nav');

class AccountNav extends React.Component<Props, AccountNavState> {
	static SWITCH_ENTRY: api.NavEntry = {
		label: '@{nav_secondary_switchProfile_label|Switch profile}',
		path: '#',
		depth: 2
	};

	static SIGN_OUT_ENTRY: api.NavEntry = {
		label: '@{nav_secondary_signOut_label|Sign out}',
		path: '#',
		depth: 2
	};

	private selectedButton: HTMLElement;
	private hideDelay: number;

	constructor(props) {
		super(props);
		this.state = {
			focused: false,
			selected: false
		};
	}

	/**
	 * Public method to allow closing popup menu externally
	 */
	clearSelection() {
		this.setSelected(false);
	}

	private setSelected(selected = true) {
		if (this.state.selected === selected) return;
		this.setState({ selected });
		if (!selected && this.selectedButton) {
			this.selectedButton.focus();
		}
	}

	private onSelectedButtonRef = (ref: React.Component<any, any>) => {
		if (ref) this.selectedButton = findDOMNode<HTMLElement>(ref);
	};

	private onDismissDropMenu = () => {
		this.setSelected(false);
	};

	private onMouseEnter = e => {
		if (!this.state.selected) this.setSelected();
		if (this.hideDelay) window.clearTimeout(this.hideDelay);
	};

	private onMouseLeave = e => {
		if (this.hideDelay) window.clearTimeout(this.hideDelay);
		this.hideDelay = window.setTimeout(() => {
			this.setSelected(false);
		}, 200);
	};

	private onFocus = e => {
		this.setState({ focused: true });
	};

	private onBlur = e => {
		this.setState({ focused: false });
	};

	private onClickOpen = e => {
		this.setSelected(!this.state.selected);
	};

	private onClickEntry = (entry: api.NavEntry, event: any): void => {
		const { showProfileSelector, signOut, homePath, activePage, updateSubscriptionEntryPoint } = this.props;
		updateSubscriptionEntryPoint(MixpanelEntryPoint.NavAccount);

		if (entry.path === '#') {
			event.preventDefault();
		}
		if (entry === AccountNav.SIGN_OUT_ENTRY) {
			if (activePage.path && activePage.path.indexOf('sa2022') > -1) {
				signOut(activePage.path);
			} else {
				signOut(homePath);
			}
		} else if (entry === AccountNav.SWITCH_ENTRY) {
			if (window && window.location.pathname === this.props.resetPinPath) {
				browserHistory.push(getPageUrlBeforePinReset());
				removePageUrlBeforePinReset();
			}
			showProfileSelector();
		}
		this.setSelected(false);
	};

	render() {
		const { className, profile, clientSide } = this.props;
		let body;
		if (clientSide) {
			body = profile ? this.renderBodySignedIn() : this.renderBodySignedOut();
		}
		return (
			<div
				className={cx(bem.b({ empty: !clientSide, 'signed-in': clientSide && !!profile }), className)}
				onFocus={this.onFocus}
				onBlur={this.onBlur}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
			>
				{body}
			</div>
		);
	}

	renderBodySignedIn() {
		return [this.renderProfileIcon(), this.renderExpandButton(), this.renderSecondaryNav()];
	}

	private renderProfileIcon() {
		const { profile, entry, isPrimaryProfile } = this.props;
		const linkPath = entry ? entry.path : undefined;
		const onClick = linkPath ? undefined : this.onClickOpen;
		const ref = onClick ? this.onSelectedButtonRef : undefined;
		return (
			<ProfileIcon
				key="icon"
				ref={ref}
				className={bem.e('profile')}
				profile={profile}
				linkPath={linkPath}
				onClick={onClick}
				isPrimaryProfile={isPrimaryProfile}
				includeName
			/>
		);
	}

	private renderExpandButton(): any {
		const { focusable, entry } = this.props;
		if (!entry || !entry.path || !focusable) return;
		const { selected, focused } = this.state;
		return (
			<NavExpandButton
				key="expand"
				ref={selected ? this.onSelectedButtonRef : undefined}
				hidden={!focused || selected}
				entry={entry}
				expanded={selected}
				onClick={this.onClickOpen}
			/>
		);
	}

	private renderSecondaryNav(): any {
		if (!this.state.selected) return;
		const entry = Object.assign({ children: [] }, this.props.entry);
		entry.children = entry.children.slice();
		const group = { children: [AccountNav.SIGN_OUT_ENTRY], depth: NavEntryDepth.Group };
		if (this.props.profileCount > 1) {
			group.children.unshift(AccountNav.SWITCH_ENTRY);
		}
		entry.children.splice(3, 0, group);

		return (
			<DropMenu key="nav" onDismiss={this.onDismissDropMenu}>
				<TriggerProvider trigger={DomTriggerPoints.NavAccount}>
					<SecondaryNav
						entries={[entry]}
						displayCategoryTitle={false}
						verticalContent={true}
						onClickEntry={this.onClickEntry}
						autoFocus
					/>
				</TriggerProvider>

				{this.renderMeCONNECT()}
			</DropMenu>
		);
	}

	private renderMeCONNECT() {
		return (
			<div className={bem.e('me-connect')}>
				<div className={bem.e('me-connect-email')}>{this.props.accountEmail}</div>
				<div className={bem.e('me-connect-operation')}>
					<IntlFormatter
						elementType="button"
						className={bem.e('me-connect-manage')}
						onClick={redirectToMeConnectSettings}
					>
						{'@{meconnect_manage_account|Manage meconnect Account}'}
					</IntlFormatter>
					<Tooltip
						className={bem.e('tooltip')}
						text={'@{meconnect_manage_tooltip|Update profile, change password, delete account and more}'}
					>
						<InfoIcon />
					</Tooltip>
				</div>
			</div>
		);
	}

	renderBodySignedOut(): any {
		const { focusable, insideHero } = this.props;
		return (
			<Link to={`@${signInPageKey}`} key="sign-in" tabIndex={focusable ? 0 : -1}>
				<IntlFormatter
					elementType={CtaButton}
					componentProps={{
						ordinal: 'primary',
						small: true,
						className: 'sign-in',
						theme: insideHero ? 'dark' : 'inverse'
					}}
				>
					{'@{nav_signIn_label|Sign In}'}
				</IntlFormatter>
			</Link>
		);
	}
}

function mapStateToProps(state: state.Root): StateProps {
	const { account, profile, app } = state;
	const profileCount = account.info ? account.info.profiles.length : 0;
	const accountEmail = account.info ? account.info.email : undefined;

	return {
		profile: getRegisteredProfileInfo(profile),
		entry: app.config.navigation.account,
		clientSide: app.clientSide,
		profileCount,
		isPrimaryProfile: isPrimaryProfile(profile, account),
		homePath: getPathByKey(Home, app.config),
		signInPath: getPathByKey(signInPageKey, app.config),
		activePage: selectActivePage(state) as api.Page,
		resetPinPath: getPathByKey(AccountProfileResetPinPageKey, app.config),
		accountEmail
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		signOut: path => dispatch(signOut(path)),
		showProfileSelector: () => dispatch(unselectProfile()),
		updateSubscriptionEntryPoint: payload => dispatch({ type: UPDATE_SUBSCRIPTION_ENTRY_POINT, payload: payload })
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{ withRef: true }
)(AccountNav);
