import * as URL from 'url';
import * as fs from 'fs';
import * as path from 'path';

const env = process.env;
const defaultLocale = env.CLIENT_DEFAULT_LOCALE || 'en';
const viewport = _TV_ ? (_FHD_ ? 'width=1920, height=1080' : 'width=1280, height=720') : undefined;
const locales = (env.CLIENT_LOCALES || defaultLocale).split(',');

const settings = {
	protocol: _DEV_ ? (env.SSL ? 'https' : 'http') : 'https',
	host: env.HOST || '0.0.0.0',
	hostname: env.HOST || 'localhost',
	port: env.PORT || '3000',
	version: undefined,
	redis: URL.parse(env.REDIS_URL || ''),
	service: URL.parse(env.CLIENT_SERVICE_URL || ''),
	cachePubMinTtl: parseNum(env.CACHE_MIN_TTL, 600),
	cachePubMaxAge: parseNum(env.CACHE_MAX_AGE, 60),
	rocket: URL.parse(env.CLIENT_SERVICE_URL),
	rocketCdn: URL.parse(env.CLIENT_SERVICE_CDN_URL),
	clientAssetUrl: env.CLIENT_ASSET_URL || '',
	maxInlineSize: 1024 * 16, // 16kb
	pubDir: path.resolve(`${__dirname}/../pub`),
	stringDir: path.resolve(`${__dirname}/string`),
	defaultLocale,
	viewport,
	locales,
	defaultLanguage: defaultLocale.split('-').shift(),
	languages: locales.map(loc => loc.split('-').shift()),
	themeColor: '', // extracted from app manifest during init
	manifestFilename: '', // extracted during init
	appShellPath: '/?shell=1',
	displaySsrErrors: _DEV_ || env.DISPLAY_SSR_ERRORS === 'true',
	featureServiceWorker: env.FF_SERVICE_WORKER === 'true',
	clientId: env.CLIENT_MC_SSO_CLIENT_ID,
	secretKey: env.CLIENT_MC_SSO_SECRET_KEY,
	mcSSOBaseApi: env.CLIENT_MC_SSO_API,
	mcRegisterSMApi: env.CLIENT_MC_REGISTER_SM_API,
	tokenExpiry: env.CLIENT_MC_SSO_TOKEN_EXPIRY,
	encKey: env.CLIENT_WEBVIEW_SSO_TOKEN_ENC_KEY,
	encIV: env.CLIENT_WEBVIEW_SSO_TOKEN_ENC_IV
};

try {
	settings.version = fs.readFileSync(path.resolve(`${__dirname}/version`), 'utf8');
} catch (_) {}

export default settings;

function parseNum(str, defaultValue) {
	const value = str === '' ? -1 : Number(str);
	return isNaN(value) || value < 0 ? defaultValue : value;
}
