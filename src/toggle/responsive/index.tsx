import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import * as React from 'react';
import { render } from 'react-dom';
import { match } from 'react-router';
import { browserHistory as history } from 'shared/util/browserHistory';
import Root from 'shared/app/Root';
import createRoutes from './Routes';
import startup from 'shared/app/startup';
import { axisAnalytics } from 'shared/analytics/axisAnalytics';
import { httpEndpoint } from 'shared/analytics/transports/httpEndpoint';
import { hot } from 'react-hot-ts';
import warning from 'shared/util/warning';
import { guidingTipsConsumer } from 'shared/guides/guidingTipsConsumer';
import { BoostConsumer, isBoostReady } from 'shared/analytics/consumers/BoostConsumer';
import { BlazeConsumer, isBlazeConsumerEnabled } from 'shared/analytics/consumers/BlazeConsumer';
import { ConvivaConsumer, isConvivaEnabled } from 'shared/analytics/consumers/ConvivaConsumer';
import { DTMAnalyticsConsumer } from 'shared/analytics/consumers/dtmAnalyticsConsumer';
import { MixpanelConsumer, isMixpanelEnabled } from 'shared/analytics/consumers/MixpanelConsumer';
import { MOATConsumer, isMOATEnabled } from 'shared/analytics/consumers/MOATConsumer';

import '../../toggle/style/modules/_branding.scss';
import 'shared/style/main.scss';
import 'ref/responsive/shared-components.scss';

/**
 * we can track analytics on any environment depending on CLIENT_DEBUG_ANALYTICS env. variable
 * the default external consumer is `httpEndpoint`
 * add `shared/analytics/transports/debugLog` for console logging during development"
 */

const analyticsConsumers = [guidingTipsConsumer, DTMAnalyticsConsumer];

if (isBlazeConsumerEnabled()) analyticsConsumers.push(BlazeConsumer);
if (isConvivaEnabled()) analyticsConsumers.push(ConvivaConsumer);
if (isMOATEnabled()) analyticsConsumers.push(MOATConsumer);
if (isBoostReady()) analyticsConsumers.push(BoostConsumer);
if (isMixpanelEnabled()) analyticsConsumers.push(MixpanelConsumer);

if (process.env.CLIENT_DEBUG_ANALYTICS) analyticsConsumers.push(httpEndpoint);

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
