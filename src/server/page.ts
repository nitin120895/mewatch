import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as Redux from 'redux';
import settings from './settings';
import {
	shouldServeHtml,
	addHtmlHeaders,
	addSecurityHeaders,
	getContentFilters,
	getRequestLocation,
	requiresFullClientRender
} from './util';
import { cacheCheck } from './cache/cacheread';
import { addCache, updateCache } from './cache/cachewrite';
import { renderHtml } from './html';
import { shellHtml } from './resource';
import CSP_ENABLED from './security/csp';
import { addCspMiddleware } from './security/csp/policy';
import { getQueryParams } from 'shared/util/urls';

const whitelistedParams = [
	'ads',
	'audio',
	'audio_language',
	'clickToPlay',
	'date',
	'embedded',
	'entryId',
	'expired',
	'genre',
	'gotosummary',
	'max_rating',
	'mobileapp',
	'order',
	'player-fullscreen',
	'priceplan',
	'priceplans',
	'q',
	'redirect',
	'selectedPricePlanId',
	'startover'
];

let match, pageChange, serverStartup, createRoutes, SERVICE_ERROR;
if (_SSR_) {
	match = require('react-router').match;
	pageChange = require('shared/page/pageWorkflow').pageChange;
	serverStartup = require('shared/app/startup').serverStartup;
	createRoutes = require(`${_BRAND_NAME_}/Routes`).default;
	SERVICE_ERROR = require('shared/app/errors.ts').SERVICE_ERROR;
}

const router = express.Router();

if (CSP_ENABLED) {
	addCspMiddleware(router);
}

router.use(cookieParser());
router.use(confirmHtmlRequest);

if (_SSR_) {
	router.use(checkAppShell);
	router.use(cacheCheck);
	router.use(resolvePage);
} else {
	router.get('*', sendAppShellResponse);
}

export default router;

// ---------------

function confirmHtmlRequest(req, res, next) {
	// When we get to this point we're looking to see if we can render the
	// single page web app. We need to be careful though as browsers
	// can be very open in their accept headers e.g. adding '*/*' which
	// means we can mistakenly render the html page for requests for
	// assets like the favicon.
	// See 'shouldServeHtml' for more details.
	if (!shouldServeHtml(req)) {
		return res.status(404).send('Not found');
	}

	if (req.url.startsWith('/index.html')) {
		req.url = `/${req.url.substr(11)}`;
	}
	addHtmlHeaders(res);
	addSecurityHeaders(res);
	return next();
}

/**
 * Any page request with '?shell' query param will get the
 * app shell returned instead of a server render.
 */
function checkAppShell(req, res, next) {
	if (req.query.shell !== undefined) {
		return sendAppShellResponse(req, res);
	} else {
		return next();
	}
}

/**
 * Throw an exception in case of Rocket error in order to fail SSR immediately
 */
const errorMiddleware = store => next => (action: Redux.Action & { payload: any }) => {
	if (action.type === SERVICE_ERROR) {
		throw `Rocket: ${action.payload.request.url} ${JSON.stringify(action.payload.error)}`;
	}
	return next(action);
};

export function resolvePage(req, res, next) {
	const filters = getContentFilters(req);
	serverStartup(filters, req, [errorMiddleware])
		.then(store => {
			const location = getRequestLocation(req);
			// If the location is behind an authentication wall or is Watch page we render the app shell.
			// See the "Account & Profile Content" section in `doc/pwa.md` for full details.
			if (requiresFullClientRender(location, store)) {
				return sendAppShellResponse(req, res);
			}
			const pending: Promise<any> = store.dispatch(pageChange(location));
			if (pending && pending.then) {
				pending.then(() => matchUrl(req, res, store)).catch(error => sendErrorResponse(req, res, {}, undefined, error));
			} else {
				matchUrl(req, res, store);
			}
		})
		.catch(error => sendUncaughtErrorResponse(error, req, res));
}

function matchUrl(req, res, store: Redux.Store<state.Root>) {
	const routes = createRoutes(store);
	match({ routes, location: req.url }, (error, redirectLocation, renderProps) => {
		if (error) {
			sendErrorResponse(req, res, {}, 500, error); // 500
		} else if (redirectLocation) {
			res.redirect(302, redirectLocation.pathname + redirectLocation.search);
		} else if (renderProps) {
			const matchedRoutes = renderProps.routes || [];
			const noRouteFound = matchedRoutes.some(route => route.path === '*');
			if (noRouteFound) {
				req.log.info('page not found', req.url);
				sendErrorResponse(req, res, renderProps, 404); // 404
			} else {
				sendSuccessResponse(req, res, renderProps, store); // 200
			}
		} else {
			req.log.info('page not found (no renderprops)', req.url);
			sendErrorResponse(req, res, {}, 404); // 404
		}
	});
}

function sendAppShellResponse(req, res, responseCode?) {
	res.status(responseCode || 200).send(shellHtml);
}

function hasQueryParams(url) {
	return url.split('?').length > 1;
}

function sendSuccessResponse(req, res, renderProps, store) {
	renderHtml(renderProps, store, req)
		.then(html => {
			// If we've sent a response then this must be the result of
			// a stale hit so update the cache in the background
			const urlParams = getQueryParams(req.url);
			const urlParamsKeys = (urlParams && Object.keys(urlParams)) || [];
			const hasWhitelistedParams =
				urlParamsKeys.length > 0 && urlParamsKeys.every(key => whitelistedParams.includes(key));
			const isCacheableUrl = !hasQueryParams(req.url) || hasWhitelistedParams;

			if (res.finished) {
				if (isCacheableUrl) {
					req.log.info('Updating cache', req.url);
					updateCache(req, html);
				}

				if (res.cacheWarmer) res.end();
			} else {
				if (isCacheableUrl) {
					req.log.info('Adding to cache', req.url);
					addCache(req, res, html, false);
				}
				res.status(200).send(html);
			}
		})
		.catch(error => sendUncaughtErrorResponse(error, req, res));
}

/**
 * For errors we'll serve our app shell and let the client web app take care of things.
 */
function sendErrorResponse(req, res, renderProps, responseCode, error?) {
	if (error) req.log.error(error, 'failed to render page', req.url);

	if (res.finished) {
		if (res.cacheWarmer) res.end();
	} else {
		// Note we cache app shell for short period of time
		// to avoid DDoS vector where 404 page requests are running
		// our page resolving logic repeatedly
		try {
			addCache(req, res, shellHtml, true);
		} catch (e) {
			req.log.error(e, 'Failed to add shell to cache');
		}
		sendAppShellResponse(req, res, responseCode);
	}
}

function sendUncaughtErrorResponse(error: Error, req, res) {
	req.log.error(error, 'Unexpected Error');

	// if headers are already been sent, do not send response again
	// in other case we get uncaught error <Can't set headers after they are sent.>
	if (res.headersSent) return;

	try {
		if (settings.displaySsrErrors) {
			res.status(500).send(`Server Render Failed\n${error.stack || error}`);
		} else {
			sendAppShellResponse(req, res);
		}
	} catch (e) {
		req.log.error(e, 'Failed to send error to client');
	}
}
