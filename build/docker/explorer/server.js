const express = require('express');
const auth = require('basic-auth');

const PORT = process.env.PORT || '3030';
const app = new express();

app.disable('x-powered-by');
app.enable('trust proxy');

app.use(function basicAuthMiddleware(req, res, next) {
	const username = process.env.BASIC_AUTH_USERNAME;
	const password = process.env.BASIC_AUTH_PASSWORD;
	if (username && password) {
		const credentials = auth(req);
		if (credentials && credentials.name === username && credentials.pass === password) {
			next();
		} else {
			res.statusCode = 401;
			res.setHeader('WWW-Authenticate', 'Basic realm="web"');
			res.end('Access denied');
		}
	} else {
		next();
	}
});

app.use(
	express.static('./pub', {
		maxAge: '1 year',
		etag: true,
		index: ['components.html'],
		setHeaders: (res, path) => {
			if (express.static.mime.lookup(path) === 'text/html') {
				addHtmlHeaders(res);
			}
		}
	})
);

app.listen(PORT, '0.0.0.0', error => {
	error ? console.error('💩', error) : console.info(`🌎  Listening on port "${PORT}"`);
});

function addHtmlHeaders(res) {
	res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
	res.setHeader('Content-Type', 'text/html;charset=UTF-8');
	res.setHeader('Strict-Transport-Security', 'max-age=10886400');
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.setHeader('X-Xss-Protection', '1; mode=block');
}
