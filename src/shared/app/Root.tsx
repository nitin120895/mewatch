import * as PropTypes from 'prop-types';
import * as React from 'react';
import { IntlProvider } from 'react-intl';
import { connect, Provider } from 'react-redux';
import { Router, RouterContext } from 'react-router';
import { AnalyticsProvider } from 'shared/analytics/components/AnalyticsProvider';
import { AxisAnalytics } from 'shared/analytics/types/types';
import offlineStatus, { OfflineStatus } from '../app/offlineStatus';
import { monitorHistory } from '../page/historyMonitor';
import { setInputModeCheck } from '../util/a11y';
import { clientRendered } from './appWorkflow';

function mapStateToProps(state: state.Root) {
	const { strings, stringsLocale } = state.app.i18n;
	// Returns the locale matching the loaded strings bundle (used for UI labelling).
	// This can mismatch the `state.app.i18n.lang` set for the application (used by
	// external content data). IntlProvider needs to receive a `locale` value which
	// matches the `messages` to ensure rule based strings work as intended
	// (e.g. for pluralisation, currency, date/time, etc).
	return { locale: stringsLocale, messages: strings };
}

const ConnectedIntlProvider = connect(mapStateToProps)(IntlProvider as any);

export default class Root extends React.Component<any, any> {
	static childContextTypes = {
		offlineStatus: PropTypes.object
	};

	getChildContext() {
		return { offlineStatus };
	}

	constructor(props) {
		super(props);
		// We keep in local state the original store & render props
		// to ensure we only ever pass the same instances to Provider & Router.
		// Failing to do so can cause hot reload to throw
		// warnings about not supporting change in store or routes.
		this.state = {
			store: props.store,
			analytics: props.analytics,
			renderProps: props.renderProps,
			// These are only provided when building the component viewer.
			// The main app we uses react-router `match` instead.
			routes: props.routes,
			history: props.history
		};
		monitorHistory(this.state.store);
	}

	componentWillMount() {
		setInputModeCheck(true);
	}

	componentDidMount() {
		this.state.store.dispatch(clientRendered());
	}

	scrollToTop() {
		// Prevents scroll position of previous route persisting
		if (typeof window === 'undefined') return;
		window.scrollTo(0, 0);
		if (typeof history === 'object' && 'scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}
	}

	render() {
		const { store, renderProps, routes, history, analytics } = this.state;
		const { emitDomEvent, emitVideoEvent } = analytics as AxisAnalytics;
		return (
			<Provider store={store}>
				<AnalyticsProvider emitDomEvent={emitDomEvent} emitVideoEvent={emitVideoEvent}>
					<ConnectedIntlProvider>
						<Router history={history} routes={routes} {...renderProps} onUpdate={this.scrollToTop} />
					</ConnectedIntlProvider>
				</AnalyticsProvider>
			</Provider>
		);
	}
}
/**
 * Similar to Root but used as the root component for server rendering.
 *
 * See 'src/server/html.ts'
 */
export class ServerRoot extends React.Component<any, any> {
	static childContextTypes = {
		offlineStatus: PropTypes.object
	};

	private offlineStatus = new OfflineStatus();

	getChildContext() {
		return { offlineStatus: this.offlineStatus };
	}

	render() {
		const { store, renderProps, locale, messages } = this.props;
		return (
			<Provider store={store}>
				<IntlProvider locale={locale} messages={messages}>
					<RouterContext {...renderProps} />
				</IntlProvider>
			</Provider>
		);
	}
}
