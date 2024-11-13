import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { signOut, unselectProfile } from 'shared/account/sessionWorkflow';
import TriggerProvider from 'shared/analytics/components/TriggerProvider';
import ProfileIcon from './ProfileIcon';
import DropMenu from './DropMenu';
import SecondaryNav from './SecondaryNav';
import NavExpandButton from './NavExpandButton';
import CtaButton from '../../component/CtaButton';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import Link from 'shared/component/Link';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { SignIn as signInPageKey, Register as registerPageKey } from 'shared/page/pageKey';
import { NavEntryDepth } from 'shared/app/navUtil';

import './AccountNav.scss';

interface AccountNavProps extends React.HTMLProps<any> {
	focusable?: boolean;
	entry?: api.NavEntry;
	profile?: api.ProfileSummary;
	profileCount?: number;
	signOut?: () => void;
	showProfileSelector?: () => void;
	clientSide?: boolean;
	insideHero?: boolean;
}

interface AccountNavState {
	focused?: boolean;
	selected?: boolean;
}

const bem = new Bem('account-nav');

class AccountNav extends React.Component<AccountNavProps, AccountNavState> {
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
		if (entry.path === '#') {
			event.preventDefault();
		}
		if (entry === AccountNav.SIGN_OUT_ENTRY) {
			this.props.signOut();
		} else if (entry === AccountNav.SWITCH_ENTRY) {
			this.props.showProfileSelector();
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

	renderBodySignedIn(): any {
		const { profile, entry } = this.props;
		const linkPath = entry ? entry.path : undefined;
		const onClick = linkPath ? undefined : this.onClickOpen;
		const ref = onClick ? this.onSelectedButtonRef : undefined;
		return [
			<ProfileIcon
				key="icon"
				ref={ref}
				className={bem.e('profile')}
				profile={profile}
				linkPath={linkPath}
				onClick={onClick}
			/>,
			this.renderExpandButton(),
			this.renderSecondaryNav()
		];
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
				<SecondaryNav
					entries={[entry]}
					displayCategoryTitle={false}
					verticalContent={true}
					onClickEntry={this.onClickEntry}
					autoFocus
				/>
			</DropMenu>
		);
	}

	renderBodySignedOut(): any {
		const { focusable, insideHero } = this.props;
		return [
			<Link to={`@${signInPageKey}`} key="sign-in" tabIndex={focusable ? 0 : -1}>
				<IntlFormatter
					elementType={CtaButton}
					componentProps={{
						ordinal: 'naked',
						small: true,
						theme: insideHero ? 'dark' : 'blue'
					}}
				>
					{'@{nav_signIn_label|Sign In}'}
				</IntlFormatter>
			</Link>,
			<TriggerProvider key="register" trigger="navigation_register">
				<Link to={`@${registerPageKey}`} tabIndex={focusable ? 0 : -1}>
					<IntlFormatter
						elementType={CtaButton}
						componentProps={{
							ordinal: 'primary',
							focusable: false,
							small: true,
							theme: insideHero ? 'dark' : 'blue'
						}}
					>
						{'@{nav_register_label|Register}'}
					</IntlFormatter>
				</Link>
			</TriggerProvider>
		];
	}
}

function mapStateToProps({ profile, app, account }: state.Root): AccountNavProps {
	const profileCount = account.info ? account.info.profiles.length : 0;
	return {
		profile: profile.info,
		entry: app.config.navigation.account,
		clientSide: app.clientSide,
		profileCount
	};
}

function mapDispatchToProps(dispatch): AccountNavProps {
	return {
		signOut: () => dispatch(signOut()),
		showProfileSelector: () => dispatch(unselectProfile())
	};
}

export default connect<any, any, AccountNavProps>(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{ withRef: true }
)(AccountNav);
