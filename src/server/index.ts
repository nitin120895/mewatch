import * as express from 'express';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
import * as log from './logger';
import * as newrelic from 'newrelic';
import * as mcSSO from './mcSSO';
import settings from './settings';
import { connectToCache } from './cache/cachedb';
import { warmCache } from './cache/cachewarm';
import { initResources } from './resource';
import {
	addHtmlHeaders,
	addSecurityHeaders,
	getRobotsBody,
	getExternalResource,
	createQueryString,
	getRedirectURL,
	getRedirectResource,
	getRedirectPaths,
	clearResourceTimer,
	addCORSHeaders
} from './util';
import { CSP_DEFAULT_REPORT_PATH } from './security/csp/policy';
import pageRouter from './page';
import { initDeepLink } from 'server/deepLink';
import { get } from 'shared/util/objects';
import { getAppConfig } from 'shared/service/app';
import { PricePlan as PricePlanPageKey, Payment as PaymentPageKey } from 'shared/page/pageKey';
import { stringify } from 'querystring';
import { legacyPaths } from './redirectPaths';

const bunyanMiddleware = require('bunyan-middleware');
const uuid = require('uuid/v1');
const app = express();
const bodyParser = require('body-parser');
const PUB = path.resolve(`${__dirname}/../pub`);
const VERSION = fs.readFileSync(path.resolve(`${__dirname}/version`), 'utf8');
const wwwRedirectEnabled = !!process.env.WWW_REDIRECT;
const { protocol, host, hostname, port } = settings;
const serverInfo = {
	name: 'slingshot',
	version: VERSION
};

initResources();
connectToCache(() => {
	if (_SSR_) warmCache();
});

app.disable('x-powered-by');
app.disable('etag');
app.enable('trust proxy');

app.use(
	bodyParser.json({
		type: ['json', 'application/csp-report']
	})
);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(function checkWwwRedirect(req, res, next) {
	// Newrelic prefixes transaction name with '/' so we avoid doubling up
	const name = (req.url || '/').slice(1);
	const method = ` (${req.method})`;
	newrelic.setTransactionName(`${name}${method}`);

	res.setHeader('Server', 'Slingshot');
	if (wwwRedirectEnabled && !req.headers['host'].startsWith('www.')) {
		const newHost = `www.${req.headers['host']}`;
		return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl);
	}

	// If we're behind an AWS load balancer then use the trace id
	// it added as a request id.
	// Putting this here to reduce the amount of middleware steps.
	req.headers['x-request-id'] = req.get('x-amzn-trace-id') ? req.get('x-amzn-trace-id') : uuid();

	next();
});

mcSSO.init(app);

// Health check endpoint
app.get('/ping', (req, res) => {
	res.setHeader('Cache-Control', 'private, no-cache');
	res.status(204).end();
});

if (process.env.FORCE_HTTPS && !process.env.LOCAL_ENV) {
	log.info('HTTP -> HTTPS upgrade enabled');
	app.use(function httpsUpgrade(req, res, next) {
		const protocol = req.get('X-Forwarded-Proto');
		if (!req.secure && protocol && protocol !== 'https') {
			res.redirect(301, `https://${req.headers.host}${req.url}`);
		} else {
			next();
		}
	});
}

// obscureHeaders - Set to an array with header names to hide header values from log output.
// The output will still show header names, with value set to null.
app.use(
	bunyanMiddleware({
		logger: log.logger,
		headerName: 'X-Request-Id',
		obscureHeaders: ['Authorization']
	})
);

// Deep linking
initDeepLink(app);

// Basic server info
app.get('/__info', (req, res) => {
	res.setHeader('Cache-Control', 'private, no-cache');
	res.json(serverInfo).end();
});

app.get('manifest.json', (req, res) => {
	res.setHeader('Cache-Control', 'private, no-cache');
	addSecurityHeaders(res);
	res.json(require(path.join(PUB, 'manifest.json'))).end();
});

app.post(CSP_DEFAULT_REPORT_PATH, (req, res) => {
	log.warn(req.body['csp-report'], 'csp violation');
	res.status(204).end();
});

interface SubscriptionQueryString {
	payment: string;
	status: string;
	packageId?: string;
	paymentType?: string;
}

const subscriptionCallback = async (req, res) => {
	const { status, merchantReturnData } = req.query;
	const merchantData = JSON.parse(merchantReturnData || '{}');
	const { packageId, paymentType } = merchantData;

	const queryParamParts: SubscriptionQueryString = {
		payment: 'true',
		status: status
	};

	if (packageId) queryParamParts.packageId = packageId;
	if (paymentType) queryParamParts.paymentType = paymentType;

	const queryParams = stringify(queryParamParts);

	let path: string;
	if (typeof merchantData.path === 'string' && merchantData.path.length > 0) {
		path = merchantData.path;
	} else {
		const config = await getAppConfig({ include: ['sitemap'] });
		path = getPlanPagePath(config as api.AppConfig);
	}

	res.redirect(`${path}?${queryParams}`);
};

app.get('/subscription-payment-callback', subscriptionCallback);
app.post('/subscription-payment-callback', subscriptionCallback);

const adyenCallback = async (req, res) => {
	const queryParams = stringify(req.query);
	const config = await getAppConfig({ include: ['sitemap'] });
	const sitemap = get(config, 'data.sitemap');
	const paymentPage = sitemap && sitemap.find(pageEntry => pageEntry.key === PaymentPageKey);
	const path = (paymentPage && paymentPage.path) || '/adyenpayment';

	res.redirect(`${path}?${queryParams}`);
};
app.get('/adyen-payment-callback', adyenCallback);
app.post('/adyen-payment-callback', adyenCallback);

app.get('/ex-setting', (req, res) => getExternalResource(process.env.CLIENT_EXTERNAL_SETTINGS, req, res));

function getPlanPagePath(config: api.AppConfig): string {
	const sitemap = get(config, 'data.sitemap');

	if (!sitemap) {
		return '/subscriptions';
	}

	const planPage = sitemap.find(pageEntry => pageEntry.key === PricePlanPageKey);

	if (planPage) {
		return planPage.path;
	}

	return '/subscriptions';
}

app.get('/robots.txt', (req, res) => {
	addHtmlHeaders(res);
	const host = get(req, 'headers.host');
	const responseBody = getRobotsBody(host);
	res.setHeader('Content-Type', 'text/plain');
	res.status(200).send(responseBody);
});

app.get('/ads.txt', (req, res) => getExternalResource(process.env.CLIENT_ADS_TXT_EXTERNAL, req, res));
app.get('/app-ads.txt', (req, res) => getExternalResource(process.env.CLIENT_APP_ADS_TXT_EXTERNAL, req, res));
app.get('/analytics.txt', (req, res) => getExternalResource(process.env.CLIENT_APP_ANALYTICS_TXT_EXTERNAL, req, res));
app.get('/mixpanel-json', (req, res) => getExternalResource(process.env.CLIENT_MIXPANEL_JSON, req, res));

app.get('/*.xml', (req, res) => {
	try {
		const validSitemapTypes = ['sitemap', 'video-sitemap', 'sitemap_index'];
		// Extract the sitemap type from the path
		const pathSegments = req.path.split('/');
		const fileName = pathSegments[1]; // Get the last segment, e.g., "sitemap.xml"
		const sitemapType = fileName.split('.')[0]; // Get the sitemap type, e.g., "sitemap"
		if (validSitemapTypes.includes(sitemapType)) {
			return getExternalResource(process.env.CLIENT_SITEMAP_EXTERNAL + req.path, req, res);
		} else {
			res.redirect(302, '/404');
		}
	} catch (error) {
		log.error(error, 'Error in fetching xml');
	}
});

if (process.env.BASIC_AUTH_USERNAME) {
	app.use(require('./auth').basicAuthMiddleware);
}

app.use(
	express.static(PUB, {
		maxAge: _DEV_ ? 0 : '1 year',
		etag: true,
		index: false,
		setHeaders: (res, path) => {
			addSecurityHeaders(res);
			addCORSHeaders(res);

			if (path.endsWith('/sw.js')) {
				res.setHeader('Cache-Control', 'public, no-cache, must-revalidate');
				res.setHeader('Expires', '0');
			} else if (path.endsWith('/manifest.json')) {
				res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 mins
			} else if (express.static.mime.lookup(path) === 'text/html') {
				addHtmlHeaders(res);
			}
		}
	} as any)
);

if (_DEV_) {
	if (!process.env.NO_JS) {
		require('./dev').addMiddleware(app);
	}
}

if (_SSR_) {
	getRedirectResource();
	app.use(function(req, res, next) {
		const { vanityPaths } = getRedirectPaths();

		// Exact path match for vanity urls
		if (typeof vanityPaths[req.path] !== 'undefined') {
			let redirectURL = getRedirectURL(req, vanityPaths[req.path]);
			return res.redirect(301, redirectURL);
		}

		if (process.env.CLIENT_REDIRECT_DOMAIN && process.env.CLIENT_REDIRECT_DOMAIN.indexOf(req.headers.host) > -1) {
			const websiteURL = process.env.WEBSITE_URL || 'https://www.mewatch.sg';
			return res.redirect(301, `${websiteURL}${req.path}${createQueryString(req)}`);
		}

		// Regex matching for legacy paths
		const regResult = Object.keys(legacyPaths).find(entry => new RegExp(entry, 'gi').test(req.path));
		if (regResult) {
			let redirectURL = getRedirectURL(req, legacyPaths[regResult]);
			return res.redirect(301, redirectURL);
		}

		next();
	});

	app.get('*', pageRouter);
}

let server;
if (process.env.SSL) {
	const sslDir = path.resolve(`${__dirname}/ssl`);
	server = https
		.createServer(
			{
				key: fs.readFileSync(`${sslDir}/server.key`),
				cert: fs.readFileSync(`${sslDir}/server.cert`),
				ca: fs.readFileSync(`${sslDir}/ca.pem`)
			},
			app
		)
		.listen(port, host, listener);
} else {
	server = app.listen(port, host, listener);
}

function listener(error) {
	if (error) {
		log.error(error, '💩');
	} else {
		if (_DEV_) {
			console.log(`🌎  Listening for changes at ${protocol}://${hostname}:${port}`);
		} else {
			log.info(`🌎  Listening at ${protocol}://${hostname}:${port}`);
		}
	}
}

process.on('unhandledRejection', (error, promise) => {
	log.fatal(error, 'Unhandled promise rejection, shutting down');
	process.nextTick(() => process.exit(101));
});

process.on('uncaughtException', (error, origin) => {
	log.fatal(error, `Uncaught exception from ${origin}, shutting down`);

	// Set longer timeout so that log can proceed
	setTimeout(() => {
		process.exit(101);
	}, 2000);
});

process.on('exit', code => {
	log.info(`About to exit with code: ${code}`);
});

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

function cleanup() {
	if (_DEV_ && !_SSR_) require('./dev').close();
	log.info('Cleaning up after shutting down');

	server.close(() => {
		clearResourceTimer();
		process.exit();
	});
	// Force shutdown if taking too long
	setTimeout(() => process.exit(1), 30000);
}

if (process.platform === 'win32') {
	require('readline')
		.createInterface({
			input: process.stdin,
			output: process.stdout
		})
		.on('SIGINT', () => process.emit('SIGINT'));
}
