import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import PageGuard from 'shared/component/PageGuard';
import { AppProps } from 'ref/responsive/App';
import { isRestrictedPage } from 'shared/page/pageRestrictions';
import { Bem } from 'shared/util/styles';
import BodyTheme from 'ref/responsive/util/BodyTheme';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import Header from 'ref/responsive/app/header/Header';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { SignIn, Register, ResetPassword } from 'shared/page/pageKey';

import './AppChromeless.scss';

const bem = new Bem('chromeless');
const bodyTheme = new BodyTheme();

interface AppChromelessProps {
	theme: AppTheme;
	showHeader: boolean;
}
interface AppChromelessState {
	fullscreen: boolean;
}

class AppChromeless extends React.Component<AppChromelessProps, AppChromelessState> {
	private appContainer: HTMLElement;

	state = { fullscreen: fullscreenService.isFullScreen() };
	componentWillReceiveProps(nextProps: AppChromelessProps) {
		const { theme } = this.props;
		if (nextProps.theme !== theme) bodyTheme.set(nextProps.theme);
	}

	componentDidMount() {
		fullscreenService.setFullScreenElement(this.appContainer);
		fullscreenService.setCallback(this.fullscreenCallback);
	}

	componentWillUnmount() {
		bodyTheme.set('default');
		fullscreenService.removeCallback(this.fullscreenCallback);
	}

	private fullscreenCallback = () => {
		this.appContainer && this.setState({ fullscreen: fullscreenService.isFullScreen() });
	};

	render() {
		const { children, theme, showHeader } = this.props;
		return (
			<div ref={el => (this.appContainer = el)} className={bem.b({ fullscreen: this.state.fullscreen }, theme)}>
				{showHeader && <Header showLogoOnly />}
				<div className={cx('content', { showHeader })}>
					<PageGuard redirectPath="/" isRestricted={isRestrictedPage}>
						<main className={cx('main', { showHeader })}>{children}</main>
					</PageGuard>
				</div>
			</div>
		);
	}
}

function mapStateToProps({ app, page }: state.Root): AppChromelessProps {
	const { config, theme } = app;
	const currentPath = page.history.location.pathname;
	const signInPath = getPathByKey(SignIn, config);
	const registerPath = getPathByKey(Register, config);
	const resetPwdPath = getPathByKey(ResetPassword, config);

	return {
		theme,
		showHeader: [signInPath, registerPath, resetPwdPath].includes(currentPath)
	};
}

export default connect<any, any, AppProps>(mapStateToProps)(AppChromeless);
