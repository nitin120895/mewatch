import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as cx from 'classnames';
import warning from '../util/warning';
import { OfflineStatus } from '../app/offlineStatus';
import { getPathByKey } from '../page/sitemapLookup';
import { isExternalUrl, getExternalUrl, LocationObject } from 'toggle/responsive/util/urlUtil';
import { Link as ReactRouterLink, LinkProps as ReactRouterLinkProps } from 'react-router';

interface LinkProps extends ReactRouterLinkProps {
	/**
	 * When linking to pages statically you may target a page key via an `@` prefix.
	 *
	 * For example to link to the homepage with key 'Home'.
	 *
	 *     `<Link to="@home">Homepage</Link>`.
	 *
	 * Note the key is case insensitive when a page path is looked up.
	 *
	 * This approach is recommended over hard coding paths as paths are
	 * configurable in the presentation manager so open to change.
	 *
	 * Targeting a page via a key which has a path parameter (e.g. '/movie/{id}')
	 * is not supported. These are by definition dynamic so static linking
	 * to them should be avoided. Let Rocket resolve them for you.
	 */
	to: LocationObject | string;
	ref?: React.Ref<any>;
}

export default class Link extends React.PureComponent<LinkProps, any> {
	static contextTypes: any = {
		store: PropTypes.object.isRequired,
		offlineStatus: PropTypes.object.isRequired
	};

	private linkElement: HTMLElement;

	context: { store: Redux.Store<state.Root>; offlineStatus: OfflineStatus };

	state = { path: undefined, offline: false };

	componentWillMount() {
		this.updatePath(this.props);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.to !== nextProps.to) {
			this.updatePath(nextProps);
		}
	}

	componentDidMount() {
		const { offlineStatus } = this.context;
		offlineStatus.subscribe(this.onConnectivityChange);
		this.updateOfflineState(offlineStatus);
	}

	componentWillUnmount() {
		this.context.offlineStatus.unsubscribe(this.onConnectivityChange);
	}

	private onConnectivityChange = (offlineStatus: OfflineStatus) => {
		this.updateOfflineState(offlineStatus);
	};

	private updatePath({ to }) {
		let path = to || undefined;
		const isString = typeof to === 'string';
		if (isExternalUrl(to)) {
			path = isString ? to : getExternalUrl(to as LocationObject);
			// If a protocol wasn't provided we assume it's http as we can't know if the host has
			// an SSL certificate. If https is necessary we assume they will automatically redirect.
			if (isString && path.startsWith('www.')) path = `http://${path}`;
		} else if (isString && to.startsWith('@')) {
			const state = this.context.store.getState();
			path = getPagePathByKey(state.app.config, to);
		}
		this.setState({ path });
	}

	private updateOfflineState(offlineStatus: OfflineStatus) {
		const offline = offlineStatus.isOffline();
		const to = this.props.to;
		if (!offline && this.state.offline) {
			this.setState({ offline: false });
		} else if (offline) {
			const path = typeof to === 'string' ? to : to.pathname;
			const pathCache = offlineStatus.getCachedPagePaths();
			const available = isExternalUrl(to) || pathCache.has(path) || path.startsWith('#');
			if (this.state.offline === available) {
				this.setState({ offline: !available });
			}
		}
	}

	setLinkElement = ref => {
		this.linkElement = ref;
	};

	onBlur = () => {
		this.linkElement.blur();
	};

	render() {
		// tslint:disable:no-unused-variable
		const { to, children, className, style, ...other } = this.props;
		// tslint:enable
		// Separate the optional react router props from the rest of the generic HTML attributes
		const { activeStyle, activeClassName, onlyActiveOnIndex, tabIndex, ...rest } = other;
		const { path, offline } = this.state;
		const attrs = rest as React.HTMLAttributes<any>;
		const classes = cx(className, { offline });
		const ariaLabel = this.props.title || to;

		if (tabIndex === -1 || tabIndex > 0) attrs.tabIndex = tabIndex;

		if (isExternalUrl(path)) {
			return (
				<a
					href={path}
					target="_blank"
					rel="noopener"
					className={classes}
					style={style}
					aria-label={ariaLabel}
					ref={this.setLinkElement}
					onClick={this.onBlur}
					{...attrs}
				>
					{children}
				</a>
			);
		}

		/* tslint:disable:no-null-keyword */
		return (
			<ReactRouterLink
				to={path}
				className={classes}
				activeClassName={activeClassName}
				activeStyle={activeStyle}
				onlyActiveOnIndex={onlyActiveOnIndex || false}
				style={style || null}
				aria-label={ariaLabel}
				{...attrs}
			>
				{children}
			</ReactRouterLink>
		);
	}
}

export function getPagePathByKey(config: state.Config, to: string): string {
	let pageKey = to.slice(1);
	let params = '';
	// if page key contains params then parse them off temporarily
	// while we look up the page path.
	// e.g. @search?q=the
	for (const symbol of ['?', '#']) {
		const i = pageKey.indexOf(symbol);
		if (~i) {
			params = pageKey.slice(i);
			pageKey = pageKey.slice(0, i);
			break;
		}
	}
	const path = getPathByKey(pageKey, config) || '';
	if (!path) {
		if (_DEV_) warning(`Unable to find page path from page key '${pageKey}'`);
	}
	return path + params;
}
