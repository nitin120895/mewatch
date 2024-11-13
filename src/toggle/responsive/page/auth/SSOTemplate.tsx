import * as React from 'react';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import { isMobile } from 'shared/util/browser';
import { browserHistory } from 'shared/util/browserHistory';
import { debounce } from 'shared/util/performance';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';
import CtaButton from 'ref/responsive/component/CtaButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import NotificationComponent from 'toggle/responsive/app/notifications/NotificationComponent';
import CloseIcon from 'toggle/responsive/component/icons/CloseIcon';
import MeConnectComponent from 'toggle/responsive/component/MeConnect';
import { isTablet, isTabletLandscape, isTabletSize, isWidthLessThanTablet } from 'toggle/responsive/util/grid';

import './SSOTemplate.scss';

interface ComponentProps {
	children: any;
	alwaysVisibleMeConnect?: boolean;
	alwaysHiddenMeConnect?: boolean;
	scrollableContent?: boolean;
	isSignInPage?: boolean;
	config?: api.AppConfig;
	routeHistory?: state.PageHistoryEntry[];
	getRedirectPath?: Function;
}

interface StateProps {
	isFormMounted?: boolean;
}

type Props = ComponentProps & StateProps;

interface State {
	isMobileView: boolean;
	headerHeight: Number;
	isFormMounted: boolean;
}

const bem = new Bem('sso-wrapper');

class SSOTemplate extends React.Component<Props, State> {
	state = {
		isMobileView: isWidthLessThanTablet(),
		isFormMounted: false,
		headerHeight: isTabletSize() ? 46 : 60
	};

	componentDidMount() {
		window.addEventListener('resize', this.onResize);
		const domNode = findDOMNode<any>(this);
		domNode.dispatchEvent(new CustomEvent('viewed'));
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onResize);
	}

	private onResize = debounce(
		() => {
			this.setState({
				isMobileView: isWidthLessThanTablet(),
				headerHeight: isTabletSize() ? 46 : 60
			});
		},
		100,
		false
	);

	private shouldRenderMeConnect() {
		const { alwaysVisibleMeConnect, alwaysHiddenMeConnect, isFormMounted } = this.props;
		if (alwaysHiddenMeConnect) return false;
		return (
			isFormMounted && (alwaysVisibleMeConnect || ((isMobile() && isTabletLandscape()) || (!isMobile() && !isTablet())))
		);
	}

	private onClickCancel = () => {
		const { getRedirectPath } = this.props;
		let redirectedPath = getRedirectPath();

		// MEDTOG- 25105 - If we are redirected to /signin from a modal, we just redirect back to the page that sent us here
		if (redirectedPath.includes('?') && redirectedPath.includes('gotosummary')) {
			redirectedPath = redirectedPath.split('?')[0];
		}

		browserHistory.push(redirectedPath);
	};

	render() {
		const { isMobileView, headerHeight } = this.state;
		const { scrollableContent, alwaysHiddenMeConnect, isSignInPage, children } = this.props;

		return (
			<section>
				{isSignInPage && (
					<div className={bem.e('cancel-section-wrapper')}>
						<IntlFormatter
							elementType={CtaButton}
							componentProps={{
								ordinal: 'secondary',
								theme: 'dark'
							}}
							className={bem.e('cancel-btn')}
							onClick={this.onClickCancel}
						>
							{isMobileView ? <CloseIcon className={bem.e('close-icon')} /> : '@{signin_cancel_button_label| CANCEL}'}
						</IntlFormatter>
					</div>
				)}
				<div className={bem.b({ 'scrollable-content': scrollableContent })}>
					<NotificationComponent offsetHeight={headerHeight} />
					{this.shouldRenderMeConnect() && <MeConnectComponent isMobileView={isMobileView} />}
					<div className={bem.e('content', { 'hidden-me-connect': alwaysHiddenMeConnect })}>{children}</div>
				</div>
			</section>
		);
	}
}

function mapStateToProps({ account, page, app }: state.Root) {
	return {
		isFormMounted: get(account, 'ssoFormMounted'),
		routeHistory: get(page, 'history.entries'),
		config: get(app, 'config')
	};
}

export default connect<StateProps, any, Props>(
	mapStateToProps,
	undefined
)(SSOTemplate);
