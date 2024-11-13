import * as React from 'react';

import { browserHistory } from 'shared/util/browserHistory';
import * as PropTypes from 'prop-types';
import * as ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import VerticalNav from 'ref/responsive/app/nav/VerticalNav';
import Header from 'ref/responsive/app/header/Header';
import Footer from 'ref/responsive/app/footer/Footer';
import SidePanelOverlay from 'shared/component/SidePanelOverlay';
import PageGuard from 'shared/component/PageGuard';
import AppBackground from 'ref/responsive/AppBackground';
import { isRestrictedPage } from 'shared/page/pageRestrictions';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { ConfirmationDialogProps } from './component/dialog/ConfirmationDialog';
import { EMAIL_VERIFICATION_CONFIRM_MODAL_ID } from 'toggle/responsive/util/modalUtil';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { OUT_OF_PAGE } from 'toggle/responsive/pageEntry/advertising/adsUtils';
import AdBanner from './component/AdBanner';
import { isTabletSize } from './util/grid';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { Home } from 'shared/page/pageKey';
import Spinner from 'ref/responsive/component/Spinner';
import { checkBrowserSupport, isHideMeWatchMenus } from 'shared/page/pageUtil';

import './App.scss';

const bemApp = new Bem('app');
const bemFullscreenOverlay = new Bem('fullscreen-overlay');

interface AppStateProps {
	theme: AppTheme;
	homePath: string;
	showContent: boolean;
	config?: state.Config;
}

interface AppOwnProps {
	location: HistoryLocation;
}

interface AppDispatchProps {
	showModal: (modal: ModalConfig) => void;
}

export type AppProps = AppOwnProps & AppStateProps & AppDispatchProps;

interface AppState {
	sideNavVisible?: boolean;
}

const SIDE_NAV_ID = 'side-nav';

class App extends React.Component<AppProps, AppState> {
	static contextTypes: any = {
		router: PropTypes.object.isRequired
	};

	private removeRouterListener: Function;
	private header: HTMLElement;

	constructor(props) {
		super(props);
		this.state = {
			sideNavVisible: false
		};
	}

	componentDidMount() {
		// Listen for route changes. If the user navigates to a new page from within a modal navigation layer we close the layer
		this.removeRouterListener = this.context.router.listen(this.onRouteChange);

		const { location } = this.props;

		checkBrowserSupport();

		if (location.query.emailVerified === 'true') {
			const props: ConfirmationDialogProps = {
				title: '@{email_verification_modal_title|Email verification}',
				children: this.renderContent(),
				confirmLabel: '@{app.ok|OK}',
				hideCloseIcon: true,
				onConfirm: () => {},
				id: EMAIL_VERIFICATION_CONFIRM_MODAL_ID
			};

			this.props.showModal({
				id: EMAIL_VERIFICATION_CONFIRM_MODAL_ID,
				type: ModalTypes.CONFIRMATION_DIALOG,
				componentProps: props,
				disableAutoClose: true
			});
			browserHistory.push(location.pathname);
		}
	}

	componentWillUnmount() {
		this.removeRouterListener();
	}

	renderContent = () => {
		const { location } = this.props;
		return location.query.verify === 'true'
			? '@{email_verification_modal_message_success|Email successfully verified}'
			: '@{email_verification_modal_message_fail|Email was not verified. Proceed to account page to resend the verification link.}';
	};

	private onHeaderRef = ref => {
		this.header = ReactDOM.findDOMNode(ref);
	};

	private onRouteChange = () => {
		this.onToggleSideNav(false);
	};

	private onToggleSideNav = (sideNavVisible: boolean) => {
		this.setState({ sideNavVisible }, () =>
			document.dispatchEvent(new CustomEvent('sideNavVisible', { detail: sideNavVisible }))
		);
	};

	private onDismissSideNav = () => {
		this.onToggleSideNav(false);
	};

	private onBackToTop = e => {
		e.preventDefault();
		const start = window.pageYOffset;
		const startTime = Date.now();
		const ms = 600;
		const scroll = () => {
			const t = Math.min(1, (Date.now() - startTime) / ms);
			const y = Math.ceil(t * t * t * t * (0 - start) + start);
			window.scroll(0, y);
			if (y >= 1) requestAnimationFrame(scroll);
			else if (this.header) {
				this.header.focus();
			}
		};
		scroll();
	};

	render() {
		const { children, theme, homePath, location } = this.props;
		const { sideNavVisible } = this.state;

		const showWelcomeAddBanner = !process.env.CLIENT_DISABLE_ADS && location.pathname === homePath && !isTabletSize();
		const hideMeWatchMenus = isHideMeWatchMenus(location);

		return (
			<div className={cx(bemApp.b(theme), { 'app-hide-menu': hideMeWatchMenus })}>
				<Header
					onClickedMenu={this.onToggleSideNav}
					menuOpen={sideNavVisible}
					menuId={SIDE_NAV_ID}
					focusable={!sideNavVisible}
					firstElementRef={this.onHeaderRef}
				/>
				<AppBackground />
				<SidePanelOverlay
					id={SIDE_NAV_ID}
					edge="right"
					visible={sideNavVisible}
					onDismiss={this.onDismissSideNav}
					closeAriaLabel="@{sidePanel_close_aria|Close}"
				>
					<VerticalNav focusable={sideNavVisible} onDismiss={this.onDismissSideNav} />
				</SidePanelOverlay>
				<div className="content grid-margin" aria-hidden={sideNavVisible}>
					<PageGuard redirectPath="/" isRestricted={isRestrictedPage}>
						<main className="main" id="main" role="main">
							{children}
						</main>
					</PageGuard>
					<Footer focusable={!sideNavVisible} onBackToTop={this.onBackToTop} />
					{this.renderFullscreenOverlay()}
				</div>
				{showWelcomeAddBanner && this.showWelcomeAdBanner()}
			</div>
		);
	}

	renderFullscreenOverlay() {
		return (
			<div className={bemFullscreenOverlay.b('', { hidden: this.props.showContent })}>
				<Spinner className={bemApp.e('spinner')} />
			</div>
		);
	}

	showWelcomeAdBanner = () => {
		return <AdBanner location={this.props.location} textAdFormat={OUT_OF_PAGE} />;
	};
}

function mapStateToProps({ app, uiLayer }: state.Root): AppStateProps {
	return {
		theme: app.theme,
		homePath: getPathByKey(Home, app.config),
		showContent: uiLayer.showContent,
		config: app.config
	};
}

function mapDispatchToProps(dispatch) {
	return {
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal))
	};
}

export default connect<AppStateProps, AppDispatchProps, AppOwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(App);
