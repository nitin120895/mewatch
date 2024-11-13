import * as React from 'react';
import { render } from 'react-dom';
import { hashHistory } from 'react-router';
import Root from 'shared/app/Root';
import routes from './ref/routes';
import { axisAnalytics } from 'shared/analytics/axisAnalytics';
import { debugLog } from 'shared/analytics/transports/debugLog';
import startup from 'shared/app/startup';

// We import the app's global styles here to ensure consistency when testing components in isolation.
import 'shared/style/main.scss';
import './index-iframe.scss';

if (module.hot) module.hot.accept();

const analytics = axisAnalytics(debugLog);

/**
 * Component Container.
 *
 * An iFrame shell for presenting component pages within the interface.
 */
const rootNode = document.getElementById('root');
startup(rootNode).then(store => {
	render(<Root store={store} history={hashHistory} routes={routes} analytics={analytics} />, rootNode);
});
