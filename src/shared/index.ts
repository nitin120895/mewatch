import Route from './app/Route';
import { loadRoute } from './app/routeUtil';
import configPage from './page/configPage';
import * as pageTemplate from './page/pageTemplate';
import * as pageKey from './page/pageKey';
import * as entryTemplate from './page/pageEntryTemplate';
import { resolvePath } from './page/sitemapLookup';

// Surface common top level operations of the shared module
export { Route, loadRoute, configPage, pageKey, pageTemplate, entryTemplate, resolvePath };
