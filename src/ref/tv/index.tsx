import * as React from 'react';
import { render } from 'react-dom';
import { match } from 'react-router';
import { browserHistory as history } from 'shared/util/browserHistory';
import Root from 'shared/app/Root';
import startup from 'shared/app/startup';
import { axisAnalytics } from 'shared/analytics/axisAnalytics';
import { debugLog } from 'shared/analytics/transports/debugLog';
import { httpEndpoint } from 'shared/analytics/transports/httpEndpoint';
import warning from 'shared/util/warning';
import createRoutes from './Routes';
import { hot } from 'react-hot-ts';
import { middleware as deviceMiddleware } from 'shared/account/deviceWorkflow';
import serviceRequestMiddleware from 'shared/app/serviceRequestMiddleware';
import DeviceModel from 'shared/util/platforms/deviceModel';
import { handleDeepLink } from './util/deepLinkUtil';
import './style/main.scss';
import './shared-components.scss';

// static hosting includes html page in URL
if (location.href.indexOf('index.html') > 0) {
	history.replace('/');
}

/**
 * we can track analytics on any environment depending on CLIENT_DEBUG_ANALYTICS env. variable
 * the default external consumer is `httpEndpoint`
 * add `shared/analytics/transports/debugLog` for console logging during development"
 */
const analyticsConsumers = process.env.CLIENT_DEBUG_ANALYTICS ? [debugLog, httpEndpoint] : [];
const analytics = axisAnalytics(...analyticsConsumers);

const rootNode = document.getElementById('root');

const middlewares = _SERVER_
	? [deviceMiddleware, serviceRequestMiddleware]
	: [deviceMiddleware, serviceRequestMiddleware, analytics.middleware];
const options = { retainShowDetailScroll: true };

if (typeof _PERF_ !== 'undefined') middlewares.push(_PERF_);

startup(rootNode, middlewares, options).then(async store => {
	analytics.run(store);

	const routes = createRoutes(store);

	try {
		await DeviceModel.initDeepLink(path => handleDeepLink(path, store));
	} catch (e) {
		console.error('initDeepLink error!');
	}

	match({ history, routes }, (error, redirectLocation, renderProps) => {
		try {
			hot(module)(render(<Root store={store} renderProps={renderProps} analytics={analytics} />, rootNode));
		} catch (e) {
			warning(e);
		}
	});
});
