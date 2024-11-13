import settings from './settings';
import * as fetch from 'isomorphic-fetch';
import * as log from './logger';
import { addQueryParameterToURL } from 'shared/util/urls';
import * as crypto from 'crypto';
import * as support from 'shared/service/support';

const {
	hostname,
	port,
	protocol,
	clientId,
	secretKey,
	mcSSOBaseApi,
	mcRegisterSMApi,
	tokenExpiry,
	encKey,
	encIV
} = settings;

function isSuccess(response) {
	return response.status >= 200 && response.status < 300;
}

const XFF_HEADER_NAME = 'x-forwarded-for';
const AUTHORIZATION_HEADER_NAME = 'authorization';
const X_AUTHORIZATION_HEADER_NAME = 'x-authorization';
const DEVICE_IDENTIFIER_HEADER_NAME = 'device-identifier';
const UNKNOWN = 'Unknown';

export function signIn(req, res) {
	const url = mcSSOBaseApi + 'device-signin';

	const invalidRequest = () => res.status(400).send({ error: 'Invalid request' });

	try {
		const bodyString = Buffer.from(req.body.body, 'base64').toString();
		const { username, password, id, os, browser } = JSON.parse(bodyString);
		const authorization = req.headers[X_AUTHORIZATION_HEADER_NAME];

		if (username && password && id && authorization) {
			const rcToken = authorization.split('Bearer ').pop();

			support
				.verifyRecaptcha({
					response: rcToken,
					type: 2
				})
				.then((response: any) => {
					if (response.data && response.data.success) {
						const fetchOptions = getFetchOptions(
							{
								username,
								password,
								token_expiry: tokenExpiry,
								type: 'web',
								os,
								browser
							},
							req.headers
						);
						fetchOptions.headers[DEVICE_IDENTIFIER_HEADER_NAME] = id;
						fetch(url, fetchOptions)
							.then(res => res.json())
							.then(response => {
								if (isSuccess(response)) {
									const token = response.token;
									res.status(200).send({ token });
								} else {
									res.status(response.status || 500).send(response);
								}
							})
							.catch(error => log.error(error, 'Mc SSO error on media corp sign in'));
					} else {
						log.error(response.data, 'Invalid Recaptcha from verifyRecaptcha');
						res.status(401).send({ error: 'Invalid Recaptcha' });
					}
				})
				.catch(error => {
					log.error(error, 'Error in sign in flow');
					res.status(500).send({ error: 'Error in sign in flow' });
				});
		} else {
			invalidRequest();
		}
	} catch (e) {
		log.error('Error in sign in flow - JSON parsing');
		invalidRequest();
	}
}

function getFetchOptions(requestBody, reqHeaders) {
	const body = { ...requestBody, client_id: clientId, secret_key: secretKey };
	const xForwardHeader = reqHeaders[XFF_HEADER_NAME];
	const headers = xForwardHeader
		? { ...defaultFetchOptions.headers, 'x-forwarded-for': xForwardHeader }
		: { ...defaultFetchOptions.headers };
	return { ...defaultFetchOptions, headers, ...{ body: JSON.stringify(body) } };
}

function registerDeviceSSO(req, res, params: any) {
	const { token, id, os = UNKNOWN, browser = UNKNOWN } = params;
	const fetchOptions = getFetchOptions({ type: 'web', os, browser }, req.headers);
	fetchOptions.headers[AUTHORIZATION_HEADER_NAME] = `Bearer ${token}`;
	fetchOptions.headers[DEVICE_IDENTIFIER_HEADER_NAME] = id;
	const deviceURL = mcSSOBaseApi + 'device/register';

	return fetch(deviceURL, fetchOptions)
		.then(res => res.json())
		.catch(error => {
			log.error('Error in registerDeviceSSO:', error);
		});
}

export function sharedSessionSignin(req, res) {
	const url = mcSSOBaseApi + 'ssosignin';
	const { username, password } = req.body;
	fetch(url, getFetchOptions({ username, password, token_expiry: tokenExpiry }, req.headers))
		.then(res => res.json())
		.then(response => {
			if (isSuccess(response)) {
				res.status(200).send({
					token: response.token,
					profile: response.profile
				});
			} else {
				res.status(response.status || 500).send(response);
			}
		})
		.catch(error => log.error(error, 'Mc SSO error on media corp shared sign in'));
}

export function encryptSSOToken(req, res) {
	const { token: plainToken } = req.body;
	if (plainToken) {
		try {
			const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encKey), Buffer.from(encIV));
			let encrypted = cipher.update(plainToken, 'utf8', 'base64');
			encrypted += cipher.final('base64');
			res
				.status(200)
				.send({ token: encrypted /*tokenhex : encrypted.toString('hex')*/ /*, decrypt : decrypt(token)*/ });
		} catch (ex) {
			res.status(500).send({ error: JSON.stringify(ex) });
		}
	} else {
		res.status(400).send({ error: 'Invalid request', body: req.body });
	}
}

export function signInProvider(req, res) {
	try {
		const provider = req.params.provider;
		const returnUrl = encodeURIComponent(
			`${protocol}://${req.headers.host}/mc-sso-signin-callback?redirectpath=${req.query.redirectpath}`
		);
		const queryStringParameters = `?client_id=${clientId}&secret_key=${secretKey}&return_url=${returnUrl}`;

		const path = `${mcRegisterSMApi}${provider}/signin${queryStringParameters}`;

		res.redirect(path);
	} catch (error) {
		log.error(error, 'Unexpected error in signInProvider');
		res.status(400).send({ error: 'Invalid request' });
	}
}

export function signInCallback(req, res) {
	try {
		const result = JSON.parse(req.body.result);
		const queryString = req.query.redirectpath;
		const queryDelimiter = typeof queryString === 'string' && queryString.includes('?') ? '&' : '?';
		if (isSuccess(result)) {
			res.redirect(`${queryString}${queryDelimiter}token=${result.token}`);
		} else {
			res.redirect(`${queryString}${queryDelimiter}error=${result.error}`);
		}
	} catch (error) {
		log.error(error, 'Unexpected error in signInCallback');
		res.status(400).send({ error: 'Invalid request' });
	}
}

export function registerProvider(req, res) {
	try {
		const provider = req.params.provider;
		const id = req.params.id;
		const returnUrl = encodeURIComponent(
			`${protocol}://${req.headers.host}/mc-sso-register-callback/${id}?redirectpath=${req.query.redirectpath}&os=${
				req.query.os
			}&browser=${req.query.browser}`
		);
		const queryStringParameters = `?client_id=${clientId}&secret_key=${secretKey}&return_url=${returnUrl}`;
		const path = `${mcRegisterSMApi}${provider}/signup${queryStringParameters}`;

		res.redirect(302, path);
	} catch (error) {
		log.error(error, 'Unexpected error in registerProvider');
		res.status(400).send({ error: 'Invalid request' });
	}
}

export function registerCallback(req, res) {
	try {
		const result = JSON.parse(req.body.result);
		const id = req.params.id;

		if (!id || !isSuccess(result)) {
			return res.redirect(302, `/signin?error-status-code=${result.status || '401'}&error=${result.error || 'Failed'}`);
		}

		const { token } = result;
		const { redirectpath, os = UNKNOWN, browser = UNKNOWN, ...params } = req.query;
		params.token = token;

		return registerDeviceSSO(req, res, { token, id, os, browser })
			.then(() => {
				res.redirect(addQueryParameterToURL(redirectpath, params));
			})
			.catch(error => {
				log.error(error, 'Error in registerDeviceSSO from registerCallback');
				res.redirect(302, '/signin?error-status-code=401&error=Failed');
			});
	} catch (error) {
		log.error(error, 'Unexpected error in registerCallback');
		res.redirect(302, '/signin?error-status-code=401&error=Failed');
	}
}

export function resetPassword(req, res) {
	const url = mcSSOBaseApi + 'profile/reset_password ';
	const body = { ...req.body, ...{ client_id: clientId, secret_key: secretKey } };
	const fetchOptions = { ...defaultFetchOptions, ...{ body: JSON.stringify(body) } };

	fetch(url, fetchOptions)
		.then(res => res.json())
		.then(response => {
			if (isSuccess(response)) {
				res.redirect(req.query.redirectpath);
			} else {
				res.redirect(`reset-password?error-status-code=${response.status}`);
			}
		})
		.catch(error => {
			log.error(error, 'Mc SSO error on password reset');
			res.status(400).send({ error: 'Invalid request' });
		});
}

export function forgotPassword(req, res) {
	const url = mcSSOBaseApi + 'profile/forgot_password';
	const returnUrl = encodeURIComponent(`${protocol}://${hostname}:${port}/signin`);
	const body = { ...req.body, ...{ client_id: clientId, secret_key: secretKey, return_url: returnUrl } };
	const fetchOptions = { ...defaultFetchOptions, ...{ body: JSON.stringify(body) } };

	fetch(url, fetchOptions)
		.then(res => res.json())
		.then(response => {
			if (isSuccess(response)) {
				res.redirect(302, response.body.verificationEmail);
			} else {
				res.redirect(302, `reset-password?error-status-code=${response.status}`);
			}
		})
		.catch(error => {
			log.error(error, 'Mc SSO error on forgot password');
			res.status(400).send({ error: 'Invalid request' });
		});
}

export function changePassword(req, res) {
	const url = mcSSOBaseApi + 'profile/change_password';
	const fetchOptions = { ...defaultFetchOptions, ...{ body: JSON.stringify(req.body) } };

	fetch(url, fetchOptions)
		.then(res => res.json())
		.then(response => {
			if (isSuccess(response)) {
				res.redirect(req.query.redirectpath);
			} else {
				res.redirect(req.query.redirectpath + `?status=${req.body.status}`);
			}
		})
		.catch(error => {
			log.error(error, 'Mc SSO error on change password');
			res.status(400).send({ error: 'Invalid request' });
		});
}

export function init(app) {
	app.post('/mc-sso-change-password', (req, res) => changePassword(req, res));
	app.post('/mc-sso-reset-password', (req, res) => resetPassword(req, res));
	app.post('/mc-sso-forgot-password', (req, res) => forgotPassword(req, res));
	app.post('/mc-sso-register-callback/:id', (req, res) => registerCallback(req, res));
	app.post('/mc-sso-signin-callback', (req, res) => signInCallback(req, res));
	app.get('/mc-sso-signin/:provider', (req, res) => signInProvider(req, res));
	app.get('/mc-sso-register/:provider/:id', (req, res) => registerProvider(req, res));
	app.post('/mcs-signin', (req, res) => signIn(req, res));
	app.post('/mc-sso-token', (req, res) => encryptSSOToken(req, res));
	app.post('/mc-sso-shared-signin', (req, res) => sharedSessionSignin(req, res));
}

const defaultFetchOptions: any = {
	contentTypes: ['application/json'],
	method: 'post',
	compress: true,
	mode: 'cors',
	credentials: 'include',
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json'
	}
};
