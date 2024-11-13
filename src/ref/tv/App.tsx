import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Hamburger from './app/nav/Hamburger';
import GlobalHeader from './app/header/GlobalHeader';
import Footer from './app/footer/Footer';
import SidePanelOverlay from 'shared/component/SidePanelOverlay';
import PageGuard from 'shared/component/PageGuard';
import { isRestrictedPage } from 'shared/page/pageRestrictions';
import CommonDialogComponent from './component/CommonDialog';
import PageNavigationArrowComponent from './component/PageNavigationArrow';
import { DirectionalNavigation, GlobalEvent } from './DirectionalNavigation';
import AuthPrompt from './app/auth/AuthPrompt';
import { refreshPage } from 'shared/page/pageWorkflow';
import { initClientState, InitialClientState } from 'shared/app/appWorkflow';
import { promptSignIn } from 'shared/account/sessionWorkflow';
import CommonMsgModal from 'ref/tv/component/modal/CommonMsgModal';
import { addEventHandler, requestEvent } from 'shared/app/serviceRequestMiddleware';
import Loading from 'ref/tv/component/Loading';
import { DetailHelper } from 'ref/tv/util/detailHelper';
import AppManager from 'shared/util/platforms/appManager';
import DeviceModel from 'shared/util/platforms/deviceModel';
import { LogInfo } from 'shared/component/LogInfo';
import KeysModel from 'shared/util/platforms/keysModel';
import { Watch as watchPageTemplate } from 'shared/page/pageTemplate';
import { getSupportedEntries } from 'ref/tv/page/PageTemplateEntries';
import './App.scss';

interface AppProps {
	strings: { [id: string]: string };
	loading: boolean;
	mandatorySignIn: boolean;
	hasSignIn: boolean;
	online: boolean;
	prompt: Prompt<string[]>;
	account: state.Account;
	profile: state.Profile;
	config: state.Config;
	classification: { [key: string]: api.Classification };
	pageTemplate: string;
	pageEntries: api.PageEntry[];
}

interface AppDispatcherProps {
	initClientState: (clientState: InitialClientState) => any;
	refreshPage: () => any;
	promptSignIn: () => any;
}

interface AppState {
	sideNavVisible?: boolean;
}

const SIDE_NAV_ID = 'side-nav';
const id = 'app';
const mouseMoveAreaHeight = 165;
const mouseHoverTime = 1000;
const minWheelInterval = 300;

class App extends React.Component<AppProps & AppDispatcherProps, AppState> {
	static contextTypes: any = {
		router: PropTypes.object.isRequired,
		intl: PropTypes.object.isRequired,
		emitDomEvent: PropTypes.func
	};

	static childContextTypes: any = {
		focusNav: PropTypes.object.isRequired,
		detailHelper: PropTypes.object.isRequired
	};

	private removeRouterListener: Function;
	private timeCount;
	private wheelTime = 1;

	constructor(props) {
		super(props);

		this.state = {
			sideNavVisible: false
		};

		this.detailHelper.focusNav = this.directionalNavigation;
		this.updateDetailHelper(props);
	}

	private directionalNavigation: DirectionalNavigation = new DirectionalNavigation();
	private detailHelper: DetailHelper = new DetailHelper();

	getChildContext() {
		return {
			focusNav: this.directionalNavigation,
			detailHelper: this.detailHelper
		};
	}

	componentDidMount() {
		// Listen for route changes.
		// If the user navigates to a new page from within a modal navigation layer we close the layer
		this.removeRouterListener = this.context.router.listen(this.onRouteChange);
		this.directionalNavigation.setRouter(this.context.router);
		this.directionalNavigation.setEmitDomEvent(this.context.emitDomEvent);
		this.directionalNavigation.start();
		this.directionalNavigation.addEventHandler(GlobalEvent.EXIT, id, this.onExit);
		this.directionalNavigation.pageEntries = this.props.pageEntries;
		this.directionalNavigation.curPageTemplate = this.props.pageTemplate;

		addEventHandler(requestEvent.timeout, this.onTimeout, id);

		this.detailHelper.setRouter(this.context.router);
	}

	componentWillUnmount() {
		this.removeRouterListener();
		this.directionalNavigation.removeEventHandler(GlobalEvent.EXIT, id);
		this.directionalNavigation.stop();
		this.detailHelper.dispose();
	}

	componentWillReceiveProps(nextProps: AppProps & AppDispatcherProps) {
		if (nextProps.online !== this.props.online) {
			if (!nextProps.online) this.onOffline();
		}

		if (nextProps.pageEntries !== this.props.pageEntries) {
			this.directionalNavigation.pageEntries = nextProps.pageEntries;
		}

		if (nextProps.pageTemplate !== this.props.pageTemplate) {
			this.directionalNavigation.curPageTemplate = nextProps.pageTemplate;
		}

		this.updateDetailHelper(nextProps);
	}

	componentWillUpdate() {
		if (this.props.mandatorySignIn && !this.props.hasSignIn) {
			if (!this.props.prompt) {
				setTimeout(() => {
					if (!this.props.prompt) {
						this.props.promptSignIn();
					}
				}, 500);
			}
		}

		this.directionalNavigation.shouldWaiting = true;
	}

	componentDidUpdate(prevProps: AppProps & AppDispatcherProps, prevState: any) {
		this.directionalNavigation.shouldWaiting = false;
	}

	private onRouteChange = () => {
		this.onToggleSideNav(false);
	};

	private onToggleSideNav = (sideNavVisible: boolean) => {
		this.setState({ sideNavVisible });
	};

	private onDismissSideNav = () => {
		this.onToggleSideNav(false);
	};

	private onOffline = () => {
		const focusNav = this.directionalNavigation;

		focusNav.hideDialog();

		setImmediate(() => {
			if (!this.props.online)
				focusNav.showDialog(
					<CommonMsgModal
						captureFocus={true}
						blackBackground={true}
						transparent={true}
						title={'@{service_unavailable|Service Unavailable}'}
						text={
							'@{service_unavailable_msg|Sorry, we are unable to contact the service right now. Please try again later.}'
						}
						buttons={['@{ok|OK}']}
						onClick={() => {
							if (this.props.pageTemplate === watchPageTemplate && !this.props.online) {
								this.directionalNavigation.goBack();
							}

							setTimeout(() => {
								this.onOffline();
							}, 5000);
						}}
					/>
				);
		});
	};

	private onTimeout = () => {
		const focusNav = this.directionalNavigation;

		focusNav.hideDialog();

		setImmediate(() => {
			focusNav.showDialog(
				<CommonMsgModal
					captureFocus={true}
					blackBackground={true}
					transparent={true}
					title={'@{service_unavailable|Service Unavailable}'}
					text={
						'@{service_unavailable_msg|Sorry, we are unable to contact the service right now. Please try again later.}'
					}
					buttons={['@{ok|OK}']}
					onClick={() => {
						this.props.refreshPage && this.props.refreshPage();
					}}
					onClose={() => {
						this.directionalNavigation.goBack();
					}}
				/>
			);
		});
	};

	private onExit = () => {
		if (DirectionalNavigation.exitWithoutConfirm) {
			DeviceModel.closeApplication();
		} else {
			this.directionalNavigation.showDialog(
				<CommonMsgModal
					captureFocus={true}
					title={'@{exit_app|Exit App}'}
					text={'@{exit_app_confirm|Are you sure you want to exit the app?}'}
					buttons={['@{exit_app_button|Exit}', '@{cancel|Cancel}']}
					onClick={this.onClickExit}
				/>
			);
		}
	};

	private onClickExit = i => {
		if (i === 0) DeviceModel.closeApplication();
	};

	private handleWheel = e => {
		e.preventDefault();
		const now = Date.now();

		// at least 300 milliseconds between two operations
		if (now - this.wheelTime > minWheelInterval) {
			this.wheelTime = now;

			if (this.directionalNavigation.mouseActive) {
				let direction = 0;

				if (e.deltaY > 0) {
					direction = KeysModel.Down;
				} else {
					direction = KeysModel.Up;
				}

				this.directionalNavigation.move(direction);
			}
		}
	};

	private handleMouseMove = e => {
		clearTimeout(this.timeCount);

		if (this.props.pageTemplate === watchPageTemplate) return;

		if (e.clientY < mouseMoveAreaHeight && e.currentTarget.id === 'pageContent') {
			this.timeCount = setTimeout(() => {
				const currentRowIndex =
					this.directionalNavigation.curFocusedRow && this.directionalNavigation.curFocusedRow.index;

				if (this.directionalNavigation.getPageOffsetY() === 0 && !this.props.loading && currentRowIndex !== -1) {
					this.directionalNavigation.showGlobalHeader(true);
				}
			}, mouseHoverTime);
		}
	};

	private handleMouseOut = e => {
		clearTimeout(this.timeCount);
	};

	private updateDetailHelper(props: AppProps & AppDispatcherProps) {
		const { account, profile, config, classification, pageTemplate, promptSignIn } = props;

		if (account !== this.detailHelper.account) this.detailHelper.account = account;
		if (profile !== this.detailHelper.profile) this.detailHelper.profile = profile;
		if (config !== this.detailHelper.config) this.detailHelper.config = config;
		if (classification !== this.detailHelper.classification) this.detailHelper.classification = classification;
		if (pageTemplate !== this.detailHelper.pageTemplate) this.detailHelper.pageTemplate = pageTemplate;
		if (promptSignIn !== this.detailHelper.promptSignIn) this.detailHelper.promptSignIn = promptSignIn;
	}

	render() {
		const { children, strings } = this.props;
		const { sideNavVisible } = this.state;
		return (
			<div className="app" onWheel={this.handleWheel}>
				<div id="commonLayer">
					<GlobalHeader onClickedMenu={this.onToggleSideNav} />
					<div
						id="pageContent"
						className="content grid-margin"
						aria-hidden={sideNavVisible}
						onMouseMove={this.handleMouseMove}
						onMouseOut={this.handleMouseOut}
					>
						<PageGuard redirectPath="/" isRestricted={isRestrictedPage}>
							<main className="main" id="main">
								{children}
							</main>
						</PageGuard>
					</div>
					<Footer />
				</div>
				<PageNavigationArrowComponent />
				<SidePanelOverlay
					id={SIDE_NAV_ID}
					edge="left"
					visible={sideNavVisible}
					onDismiss={this.onDismissSideNav}
					closeAriaLabel={strings['sidePanel_close_aria']}
				>
					<Hamburger focusable={sideNavVisible} onMenuItemClick={() => this.onToggleSideNav(false)} />
				</SidePanelOverlay>
				<CommonDialogComponent />
				<Loading show={this.props.loading} />
				<AuthPrompt />
				<AppManager />
				<LogInfo />
			</div>
		);
	}
}

function mapStateToProps({ app, page, account, session, profile, cache }: state.Root): AppProps {
	const loading = app.chunkLoading || page.loading || session.showLoading;
	const pageTemplate = page.history.pageSummary.template;
	const currentPagePath = page.history.location.pathname;
	const currentPageDetail = cache.page[currentPagePath] as api.Page;
	const entries = currentPageDetail && currentPageDetail.entries;
	const pageEntries = getSupportedEntries(pageTemplate, entries || []);

	return {
		strings: app.i18n.strings,
		loading,
		mandatorySignIn: app.config.general.mandatorySignIn,
		hasSignIn: account && !!account.info,
		online: app.online,
		prompt: session.authPrompts.length > 0 && session.authPrompts[0],
		account: account,
		profile: profile,
		config: app.config,
		classification: app.config['classification'],
		pageTemplate,
		pageEntries
	};
}

function mapDispatchToProps(dispatch: any): AppDispatcherProps {
	return {
		initClientState: (clientState: InitialClientState) => dispatch(initClientState(clientState)),
		refreshPage: (redirectPath?: string) => dispatch(refreshPage()),
		promptSignIn: () => dispatch(promptSignIn())
	};
}

export default connect<AppProps, AppDispatcherProps, AppProps>(
	mapStateToProps,
	mapDispatchToProps
)(App);
