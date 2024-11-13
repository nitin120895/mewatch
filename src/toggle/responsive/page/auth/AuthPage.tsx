import * as React from 'react';
import { configPage } from 'shared/';
import { SignIn as key, Register as registerKey, ResetPassword as resetPasswordKey } from 'shared/page/pageKey';
import { STATIC as template } from 'shared/page/pageTemplate';
import { signIn, singleSignOnAnonymous } from 'shared/account/sessionWorkflow';
import { Bem } from 'shared/util/styles';
import SSOTemplate from 'toggle/responsive/page/auth/SSOTemplate';
import Spinner from 'ref/responsive/component/Spinner';
import { get } from 'shared/util/objects';
import * as PropTypes from 'prop-types';
import { GET_ACCOUNT } from 'shared/service/action/account';
import { getPathByKey } from 'shared/page/sitemapLookup';
import MeConnectComponent from 'toggle/responsive/component/MeConnect';

import './AuthPage.scss';

const bem = new Bem('pg-auth');

interface AuthPageProps extends PageProps {
	signIn: (email: string, password: string, remember: boolean, scopes: string[], redirectPath?: string) => Promise<any>;
	singleSignOnAnonymous: (options: api.SingleSignOnRequest, redirectPath: string) => Promise<any>;
	fbAppId?: string;
	routeHistory?: state.PageHistoryEntry[];
	pagesCache?: { [path: string]: api.PageSummary | api.Page };
	config?: api.AppConfig;
	erroredActions?: Action<any>[];
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
		const { routeHistory, location } = this.props;
		const redirect = get(location, 'query.redirect');
		if (redirect) return redirect;

		if (routeHistory && routeHistory.length > 0) {
			// copying array so that it would not be mutatted by reverse
			const reversedRouteHistory = [...routeHistory].reverse();
			// if we have route history, let check each route and navigate to non authentication/registration page if exists
			for (let route of reversedRouteHistory) {
				if (route && route.path && !this.isAuthPage(route.path)) {
					return route.path;
				}
			}
		}

		return defaultPath;
	};

	// check if page is one of authentication/registration page
	private isAuthPage(path: string) {
		const { pagesCache, config } = this.props;
		const url = path.split('?')[0];
		const page: api.PageSummary = pagesCache[url];

		if (page) {
			return AUTH_PAGES.some((pageKey: string) => page.key === pageKey);
		}
		// if pageCache is empty, fallback to sitemap to get page paths
		const AUTH_PAGES_PATHS = AUTH_PAGES.map(pageKey => getPathByKey(pageKey, config));
		return AUTH_PAGES_PATHS.some((pagePath: string) => path === pagePath);
	}

	private isSignIn() {
		const { location, pagesCache } = this.props;
		const page: api.PageSummary = location && pagesCache[location.pathname];
		return page && page.key === key;
	}

	private shouldShowSpinner(): boolean {
		const { location, isSessionActive, erroredActions } = this.props;
		// We should show spinner if there is a redirection from social sign in
		return (
			(location.query.token &&
				this.isSignIn() &&
				(erroredActions &&
					!erroredActions.some((action: Action<any>) => action.error && action.type === GET_ACCOUNT))) ||
			isSessionActive
		);
	}

	render() {
		return (
			<SSOTemplate
				alwaysVisibleMeConnect={this.isSignIn()}
				isSignInPage={this.isSignIn()}
				getRedirectPath={this.getRedirectPath}
			>
				{this.shouldShowSpinner() && this.renderSpinner()}
				{this.renderForm()}
			</SSOTemplate>
		);
	}

	private renderForm() {
		const { children, signIn, singleSignOnAnonymous, fbAppId } = this.props;

		return React.cloneElement(children as React.CElement<any, any>, {
			getRedirectPath: this.getRedirectPath,
			fbAppId,
			signIn,
			singleSignOnAnonymous
		});
	}

	private renderSpinner() {
		return (
			<div className={bem.e('spinner-wrapper')}>
				<Spinner className={bem.e('spinner')} />
			</div>
		);
	}
}

function mapStateToProps({ page, app, cache }: state.Root) {
	return {
		routeHistory: page.history.entries,
		pagesCache: cache.page,
		config: app.config,
		fbAppId: app.config.general.facebookAppId,
		erroredActions: app.erroredActions
	};
}

function mapDispatchToProps(dispatch) {
	return {
		signIn: (email, password, remember, scopes, redirectPath) =>
			dispatch(signIn(email, password, remember, scopes, redirectPath)),
		singleSignOnAnonymous: (options: api.SingleSignOnRequest, redirectPath: string) =>
			dispatch(singleSignOnAnonymous(options, true, redirectPath))
	};
}

export default configPage(AuthPage, {
	theme: 'auth',
	key,
	template,
	mapStateToProps,
	mapDispatchToProps,
	entryRenderers: [SSOTemplate, MeConnectComponent]
});
