import * as React from 'react';
import { configPage } from 'shared/';
import { SignIn as key, Register as registerKey, ResetPassword as resetPasswordKey } from 'shared/page/pageKey';
import { STATIC as template } from 'shared/page/pageTemplate';
import { signIn, singleSignOn } from 'shared/account/sessionWorkflow';
import { Bem } from 'shared/util/styles';
import AxisLogo from '../../component/AxisLogo';
import Link from 'shared/component/Link';
import Spinner from '../../component/Spinner';
import * as PropTypes from 'prop-types';
import * as cx from 'classnames';

const bem = new Bem('pg-auth');

import './AuthPage.scss';

interface AuthPageProps extends PageProps {
	signIn: (email: string, password: string, remember: boolean, scopes: string[], redirectPath?: string) => Promise<any>;
	singleSignOn: (options: api.SingleSignOnRequest, redirectPath: string) => Promise<any>;
	fbAppId?: string;
	routeHistory?: state.PageHistoryEntry[];
	pagesCache?: { [path: string]: api.PageSummary | api.Page };
}

const AUTH_PAGES = [key, registerKey, resetPasswordKey];

class AuthPage extends React.Component<AuthPageProps, any> {
	static contextTypes: any = {
		router: PropTypes.object.isRequired
	};

	context: {
		router: ReactRouter.InjectedRouter;
	};

	componentWillMount() {
		const { isSessionActive } = this.props;
		if (isSessionActive) this.redirect();
	}

	private redirect() {
		this.context.router.replace(this.getRedirectPath());
	}

	private getRedirectPath = (defaultPath = '/') => {
		const { routeHistory } = this.props;
		if (routeHistory && routeHistory.length > 0) {
			// if we have route history, let check each route and navigate to non authentication/registration page if exists
			for (let route of routeHistory.reverse()) {
				if (route && route.path && !this.isAuthPage(route.path)) {
					return route.path;
				}
			}
		}

		return defaultPath;
	};

	// check if page is one of authentication/registration page
	private isAuthPage(path: string) {
		const { pagesCache } = this.props;
		const url = path.split('?')[0];
		const page: api.PageSummary = pagesCache[url];
		return page && AUTH_PAGES.some((pageKey: string) => page.key === pageKey);
	}

	render() {
		return (
			<section className={cx(bem.b(), 'form-blue')}>
				<div className={bem.e('logo-wrapper')}>
					<Link to="@home" className={bem.e('logo-link')}>
						<AxisLogo id="axis-logo-signin" />
					</Link>
				</div>
				<div className={bem.e('form')}>{this.renderForm()}</div>
			</section>
		);
	}

	private renderForm() {
		const { isSessionActive, children, signIn, singleSignOn, fbAppId } = this.props;
		const form = React.cloneElement(children as React.CElement<any, any>, {
			getRedirectPath: this.getRedirectPath,
			fbAppId,
			signIn,
			singleSignOn
		});
		if (isSessionActive) {
			return <Spinner className={bem.e('spinner')} />;
		}
		return form;
	}
}

function mapStateToProps({ page, app, cache }: state.Root) {
	return {
		routeHistory: page.history.entries,
		pagesCache: cache.page,
		fbAppId: app.config.general.facebookAppId
	};
}

function mapDispatchToProps(dispatch) {
	return {
		signIn: (email, password, remember, scopes, redirectPath) =>
			dispatch(signIn(email, password, remember, scopes, redirectPath)),
		singleSignOn: (options: api.SingleSignOnRequest, redirectPath: string) =>
			dispatch(singleSignOn(options, true, redirectPath))
	};
}

export default configPage(AuthPage, {
	theme: 'auth',
	key,
	template,
	mapStateToProps,
	mapDispatchToProps
});
