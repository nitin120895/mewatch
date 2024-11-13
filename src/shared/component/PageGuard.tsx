import * as React from 'react';
import * as PropTypes from 'prop-types';
import { InjectedRouter } from 'react-router';
import { connect } from 'react-redux';
import { isSameLocation } from '../util/locations';
import { SignIn } from 'shared/page/pageKey';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { withRouter } from 'react-router';
import { isAnonymousUser } from '../account/sessionWorkflow';
import { sessionExpiredModalIsInProgress } from 'toggle/responsive/util/modalUtil';

interface PageGuardProps extends React.Props<any> {
	isSignedIn?: boolean;
	router?: ReactRouter.InjectedRouter;
	location?: HistoryLocation;
	pageSummary?: api.PageSummary;
	isRestricted: (pageSummary: api.PageSummary, location: HistoryLocation) => boolean;
	redirectPath?: string;
	config?: state.Config;
	profile?: api.ProfileSummary;
	account?: api.Account;
	uiModals?: any;
}

interface PageGuardState {
	guarded: boolean;
}

class PageGuard extends React.PureComponent<PageGuardProps, PageGuardState> {
	static contextTypes: any = {
		router: PropTypes.object.isRequired
	};

	context: {
		router: InjectedRouter;
	};

	state: PageGuardState = { guarded: false };

	componentWillMount() {
		this.checkGuard(this.props);
	}

	componentWillReceiveProps(newProps: PageGuardProps) {
		if (this.signedOutOnRestrictedPage(newProps)) {
			this.setState({ guarded: true });
			this.redirect(newProps.redirectPath, 'push');
		} else if (this.shouldCheckGuard(newProps)) {
			this.checkGuard(newProps);
		} else if (this.hasCancelledSignIn(newProps)) {
			this.redirect(newProps.redirectPath);
		} else if (newProps.isSignedIn && this.state.guarded) {
			this.setState({ guarded: false });
		}
	}

	shouldComponentUpdate(nextProps: PageGuardProps, nextState: PageGuardState, nextContext: any) {
		// prevent rendering when store location doesn't (yet) match react-router location
		return (
			nextProps.location &&
			nextProps.location.pathname &&
			(nextState.guarded || this.context.router.isActive(nextProps.location.pathname))
		);
	}

	private signedOutOnRestrictedPage(props: PageGuardProps) {
		const { isRestricted, pageSummary, location, isSignedIn } = props;
		return this.props.isSignedIn && !isSignedIn && isRestricted(pageSummary, location);
	}

	private shouldCheckGuard(newProps: PageGuardProps) {
		return !isSameLocation(newProps.location, this.props.location) || (!newProps.isSignedIn && !this.state.guarded);
	}

	private checkGuard({ isRestricted, pageSummary, location, isSignedIn, router, profile }: PageGuardProps) {
		if (!this.state.guarded && isRestricted(pageSummary, location) && !isSignedIn) {
			const path = getPathByKey(SignIn, this.props.config);
			this.props.router.push(path);
			this.setState({ guarded: true });
		} else {
			this.setState({ guarded: false });
		}
	}

	private hasCancelledSignIn({ isSignedIn }: PageGuardProps) {
		return !isSignedIn && this.state.guarded;
	}

	private redirect(path = '/', action: 'push' | 'replace' = 'replace') {
		if (sessionExpiredModalIsInProgress(this.props.uiModals)) return;

		const { router } = this.props;
		if (action === 'replace') router.replace(path);
		else router.push(path);
	}

	render() {
		if (!this.state.guarded) {
			return React.Children.only(this.props.children);
		} else {
			return <div />;
		}
	}
}

function mapStateToProps(state: state.Root) {
	const { session, page, app, profile, account, uiLayer } = state;
	return {
		isSignedIn: !!session.tokens.length && !isAnonymousUser(state),
		location: page.history.location,
		pageSummary: page.history.pageSummary,
		config: app.config,
		profile: profile.info,
		account: account.info,
		uiModals: uiLayer.modals
	};
}

export default connect<any, any, PageGuardProps>(mapStateToProps)(withRouter(PageGuard));
