import * as React from 'react';
import { render } from 'react-dom';
import { match } from 'react-router';
import { browserHistory as history } from 'shared/util/browserHistory';
import Root from 'shared/app/Root';
import startup from 'shared/app/startup';
import { axisAnalytics } from 'shared/analytics/axisAnalytics';
import { httpEndpoint } from 'shared/analytics/transports/httpEndpoint';
import warning from 'shared/util/warning';
import createRoutes from './Routes';
import { hot } from 'react-hot-ts';

import 'shared/style/main.scss';
import './shared-components.scss';

/**
 * we can track analytics on any environment depending on CLIENT_DEBUG_ANALYTICS env. variable
 * the default external consumer is `httpEndpoint`
 * add `shared/analytics/transports/debugLog` for console logging during development"
 */
const analyticsConsumers = process.env.CLIENT_DEBUG_ANALYTICS ? [httpEndpoint] : [];
const analytics = axisAnalytics(...analyticsConsumers);

const rootNode = document.getElementById('root');

const middlewares = _SERVER_ ? [] : [analytics.middleware];
const options = { retainShowDetailScroll: true };

startup(rootNode, middlewares, options).then(store => {
	analytics.run(store);

	const routes = createRoutes(store);
	match({ history, routes }, (error, redirectLocation, renderProps) => {
		try {
			hot(module)(render(<Root store={store} renderProps={renderProps} analytics={analytics} />, rootNode));
		} catch (e) {
			warning(e);
		}
	});
});
