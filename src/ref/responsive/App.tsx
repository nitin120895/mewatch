import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import VerticalNav from './app/nav/VerticalNav';
import Header from './app/header/Header';
import Footer from './app/footer/Footer';
import SidePanelOverlay from 'shared/component/SidePanelOverlay';
import PageGuard from 'shared/component/PageGuard';
import AppBackground from './AppBackground';
import { isRestrictedPage } from 'shared/page/pageRestrictions';
import { Bem } from 'shared/util/styles';

import './App.scss';

const bemApp = new Bem('app');

export interface AppProps {
	theme: AppTheme;
}

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
	}

	componentWillUnmount() {
		this.removeRouterListener();
	}

	private onHeaderRef = ref => {
		this.header = ReactDOM.findDOMNode(ref);
	};

	private onRouteChange = () => {
		this.onToggleSideNav(false);
	};

	private onToggleSideNav = (sideNavVisible: boolean) => {
		this.setState({ sideNavVisible });
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
		const { children, theme } = this.props;
		const { sideNavVisible } = this.state;
		return (
			<div className={bemApp.b(theme)}>
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
				</div>
			</div>
		);
	}
}

function mapStateToProps({ app }: state.Root): AppProps {
	return {
		theme: app.theme
	};
}

export default connect<any, any, AppProps>(mapStateToProps)(App);
