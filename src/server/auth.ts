import * as auth from 'basic-auth';

export function basicAuthMiddleware(req, res, next) {
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
}
