import { getAppConfig } from 'shared/service/app';
import { parseArray, addSecurityHeaders } from 'server/util';

export function initDeepLink(app) {
	setupDeepLinkEndpoint(app, '/.well-known/assetlinks.json', androidDeepLink);
	setupDeepLinkEndpoint(app, '/.well-known/apple-app-site-association', iosDeepLink);
}

function setupDeepLinkEndpoint(app, url: string, handler: (cfg: api.AppConfig) => Object) {
	app.get(url, async (req, res, next) => {
		try {
			const config = await getAppConfig({ include: ['deeplinking'] });
			if (config.error) {
				next(config.error);
			}

			res.setHeader('Cache-Control', 'max-age=3600');
			addSecurityHeaders(res);
			res.json(handler(config.data)).end();
		} catch (error) {
			return next(error);
		}
	});
}

export function androidDeepLink(config: api.AppConfig) {
	return [
		{
			relation: ['delegate_permission/common.handle_all_urls'],
			target: {
				namespace: 'android_app',
				package_name: config.deeplinking.androidAppPackageName || '',
				sha256_cert_fingerprints: parseArray(config.deeplinking.androidAppFingerprint, '')
			}
		}
	];
}

export function iosDeepLink(config: api.AppConfig) {
	return {
		applinks: {
			apps: [],
			details: [
				{
					appID: config.deeplinking.universalLinkAppID || '',
					paths: parseArray(config.deeplinking.universalLinkPaths, '')
				}
			]
		}
	};
}
