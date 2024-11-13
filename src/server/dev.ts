import * as webpack from 'webpack';
import settings from './settings';
import { getClientService } from 'shared/app/environmentUtil';
const { protocol, hostname, port } = settings;

const createDevMiddleware = require('webpack-dev-middleware');
const createHotMiddleware = require('webpack-hot-middleware');
const serviceProxy = require('express-http-proxy');
const createConfig = require('../../build/webpack/webpack.client');

// In development we proxy the CLIENT_SERVICE_URL via this server
// so we retain cookies being set. The original CLIENT_SERVICE_URL
// can be found under the `settings.service` URL object.
if (_SSR_) {
	getClientService().rocket = process.env.CLIENT_SERVICE_URL = `${protocol}://${hostname}:${port}/api`;
}

const config = createConfig({
	tv: _TV_,
	dev: true,
	ssr: _SSR_,
	components: !!process.env.COMPONENTS
});
const compiler = webpack(config);
const devMiddleware = createDevMiddleware(compiler, {
	quiet: false,
	noInfo: true,
	headers: {
		'Access-Control-Allow-Origin': '*'
	},
	publicPath: config.output.publicPath
});
const hotMiddleware = createHotMiddleware(compiler);

export function addMiddleware(app) {
	// In dev mode we need cookies set by web services to be
	// retained in localhost environment. To accomplish this
	// we mimic a production environment by keeping the website
	// and authenticated api services under the same origin.
	// This is done by proxying webservice calls via `/api/*` path.
	const { host, protocol, path } = settings.service;
	const basePath = path === '/' ? '' : path;
	app.use(
		'/api',
		(req, res, next) => {
			// See https://github.com/villadora/express-http-proxy/issues/177
			if (req.method === 'DELETE') {
				delete req.headers['accept-encoding'];
			}
			next();
		},
		serviceProxy(host, {
			https: protocol === 'https:',
			proxyReqPathResolver: req => `${basePath}${req.url}`,
			userResDecorator: (proxyRes, proxyResData, clientReq, clientRes) => {
				const cookies = proxyRes.headers['set-cookie'];
				if (cookies) {
					// Strip 'domain' and 'secure' cookie options so they
					// persist in localhost dev environment
					cookies.forEach((val, i) => {
						cookies[i] = val
							.replace(/Domain=[\w\n-\.]+\s*;?\s*/, '')
							.replace(/Secure;?\s*/, '')
							.replace(/\w+-cf=/, 'cf=');
					});
					clientRes.set('set-cookie', cookies);
				}
				return proxyResData;
			}
		})
	);

	app.use((req, res, next) => {
		const isHtml = /(text\/html)/i.test(req.headers['accept'] || '');
		if (!isHtml) {
			devMiddleware(req, res, next);
		} else if (!_SSR_) {
			// only serve html if not server side rendering
			req = rewiteUrl(req);
			devMiddleware(req, res, next);
		} else {
			next();
		}
	});
	app.use(hotMiddleware);

	return app;
}

const BASENAME = process.env.CLIENT_BASENAME || '';

function rewiteUrl(req) {
	if (process.env.COMPONENTS) {
		if (req.path === `${BASENAME}/components`) {
			req.url = req.url.replace('/components', '/components.html');
		}
		if (req.path !== `${BASENAME}/components.html` && req.path !== `${BASENAME}/components/-iframe.html`) {
			req.url = `${BASENAME}/index.html`;
		}
	} else {
		req.url = `${BASENAME}/index.html`;
	}
	return req;
}

export function close(done) {
	devMiddleware.close(done);
}
