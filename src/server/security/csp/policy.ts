import * as url from 'url';
import * as Hashids from 'hashids';
import * as helmet from 'helmet';
import allowedThirdPartyServices from './thirdparty';
import * as log from 'server/logger';
import { isRequestComingFromAOlderSafariBrowser } from 'server/util';
const env = process.env;

/**
 * Content Security Policy
 *
 * Setting a secure CSP can be an effective MITIGATION against Cross Site Scripting (XSS) attacks.
 * This is achieved by whitelisting allowed domains and elements.
 *
 * Scripts and/or styles may have their execution blocked unless:
 * - inline code uses a nonce value which matches the nonce set within the header.
 * - external files are loaded from a domain included within the header whitelist.
 */

// Disallow, regardless of whether other sources are defined for the same rule.
export const NONE = `'none'`;
// Allow the current protocol, domain, and port.
export const SELF = `'self'`;
// Allow base 64 encoded resources.
export const DATA = 'data:';
// Allow blob data resources.
export const BLOB = 'blob:';
// Allow https resources.
export const HTTPS = 'https:';
// Allow execution of inline code (e.g. scripts or styles). Ideally don't use this in production!
export const UNSAFE_INLINE = `'unsafe-inline'`;
// Allow execution of string based script via eval(). Don't use this in production!
export const UNSAFE_EVAL = `'unsafe-eval'`;

export const STRICT_DYNAMIC = `'strict-dynamic'`;
/**
 * Nonce generation
 *
 * Nonces are base64 and should be at least 128 bits long (before encoding), and generated via a
 * cryptographically secure random number generator. The output length should be a factor of 4.
 */
const NONCE_LENGTH = 24;
const NONCE_SALT = env.CSP_NONCE_SALT || 'SydneyLondonPrague';
const hashids = new Hashids(NONCE_SALT, NONCE_LENGTH);

function randInt() {
	return Math.floor(Math.random() * 100000);
}

/**
 * CSP Level 2 allows execution of selective inline scripts and styles
 * through the use of nonces.
 *
 * Because server-side rendering inlines various scripts and styles we can
 * leverage nonces to allow executing our code and ensure any potentially
 * injected code is blocked from executing.
 *
 * - When false `unsafe-inline` is set to support server-side rendering.
 * - When true nonces will be leveraged within the CSP and our server rendered markup.
 */
const BLOCK_UNSAFE_EXECUTION: boolean = _SSR_ && !_DEV_;

/**
 * When true the CSP will warn via the console but will not block requests
 * which fall outside of the directives.
 */
const REPORT_ONLY: boolean = _DEV_ || _QA_ || (env.CSP_REPORT_ONLY && env.CSP_REPORT_ONLY === 'true');

/**
 * The default location to report CSP violations to Slingshot.
 */
export const CSP_DEFAULT_REPORT_PATH = '/log/csp';

/**
 * Policy violations will be logged at the below url.
 */
const REPORT_URI: string = env.CSP_REPORTING_URI || CSP_DEFAULT_REPORT_PATH;

/**
 * When true all requests are sent via HTTPS regardless of whether they've explicitly
 * been requested from an HTTP sources e.g.
 *
 * `<img src="http://domain.com/image.jpg") />` will actually load from 'https://domain.com/image.jpg'.
 */
const UPGRADE_INSECURE_REQUESTS: boolean = !_QA_ && !_DEV_;

/**
 * If the app supports the X2 iFrame row then when enabled a wildcard is used instead
 * of the explicit whitelist domains.
 */
const IFRAME_WILDCARD_SUPPORTED: boolean = env.CSP_IFRAME_WILDCARD;

// Returns the host domain without a sub-domain.
function getHostDomain(uri) {
	if (!uri) return undefined;
	const host = url.parse(uri).hostname;
	return host.indexOf('.') === -1 ? host : host.substr(host.indexOf('.') + 1);
}

// App specific URLs
const WEBSITE_URL: string = env.WEBSITE_URL;
const WEBSITE_DOMAIN = getHostDomain(WEBSITE_URL);

// Service specific URLs
const SERVICE_URL: string = env.CLIENT_SERVICE_URL;
const SERVICE_CDN_URL: string = env.CLIENT_SERVICE_CDN_URL;

// We extract the service domain to allow us to infer a wildcard subdomain from our service url to reduce the size of our header.
const SERVICE_DOMAIN = getHostDomain(SERVICE_URL);

// Prevent injecting duplicate domains by checking whether they match our wildcard.
function domainMatches(url) {
	return url.indexOf(SERVICE_DOMAIN) > 0;
}

// Strip the protocol to reduce the weight of the header.
function stripProtocol(url) {
	if (!~url.indexOf('://')) return url;
	url = url.substr(url.indexOf('://') + 3);
	return url;
}

// Ensure directories end with a slash to maintain sub-resource matching.
function enforceTrailingSlash(url) {
	const i = url.lastIndexOf('/');
	if (~i && i > url.lastIndexOf('.') && url.charAt(url.length - 1) !== '/') url = `${url}/`;
	return url;
}

/**
 * Common whitelist domains used across several rules.
 */
const COMMON_WHITELIST: any[] = (function constructCommonWhitelist() {
	const whitelist: any[] = [SELF, `*.${SERVICE_DOMAIN}`, '*.mediacorp.sg'];
	// Add service urls if they differ from the wildcard
	if (!domainMatches(SERVICE_URL)) {
		whitelist.push(enforceTrailingSlash(stripProtocol(SERVICE_URL)));
	}
	if (!domainMatches(SERVICE_CDN_URL)) {
		whitelist.push(enforceTrailingSlash(stripProtocol(SERVICE_CDN_URL)));
	}
	// Augment with optional domains
	return whitelist.concat(env.CSP_WHITELIST_DOMAINS ? JSON.parse(env.CSP_WHITELIST_DOMAINS) : []);
})();

/**
 * Common whitelist domains used for asset rules.
 */
const ASSET_WHITELIST: any[] = (function constructAssetWhitelist() {
	let whitelist = COMMON_WHITELIST.slice();
	return whitelist;
})();

/**
 * Whitelist domains allowed to embed the main application as an iFrame.
 */
const MEDIACORP_DOMAINS = [
	'*.8world.com',
	'*.channelnewsasia.com',
	'*.mediacorp.sg',
	'*.melisten.sg',
	'*.teams.microsoft.com',
	'*.todayonline.com',
	'home.mediacorp.grp',
	'mediacorpteams.sharepoint.com',
	'teams.microsoft.com'
];
const FRAME_ANCESTOR_WHITELIST = WEBSITE_DOMAIN ? [`*.${WEBSITE_DOMAIN}`, ...MEDIACORP_DOMAINS] : MEDIACORP_DOMAINS;

/**
 * Add Middleware to Express app.
 */
export function addCspMiddleware(app) {
	if (BLOCK_UNSAFE_EXECUTION) app.use(generateNonce);

	app.use(function(req, res, next) {
		// Required to allow embed page to be iframed on external sites
		const includeFrameAncestors = !req.path.includes('/embed');

		let shouldDisableNonceHeader = false;
		try {
			shouldDisableNonceHeader = isRequestComingFromAOlderSafariBrowser(req.headers['user-agent'] || '');
		} catch (e) {
			log.error(e, 'Exception - shouldDisableNonceHeader');
		}

		const contentSecurityPolicy = createCsp(allowedThirdPartyServices, includeFrameAncestors, shouldDisableNonceHeader);

		contentSecurityPolicy(req, res, () => {
			const send = res.send;
			res.send = function(body) {
				send.call(this, updateCspHtml(body, res));
			};
			next();
		});
	});
}

/**
 * Create and Assign the CSP.
 *
 * Enabling third party services can be achieved via environment flags
 * with directives modifier functions. For more advanced modification
 * you'll need to edit this definition.
 */
function createCsp(
	directivesModifiers: CspDirectivesModifier[],
	includeFrameAncestors: boolean,
	shouldDisableNonceHeader: boolean
) {
	// A nonce is recommended over allowing unsafe-inline to improve security.
	// Nonces require support for CSP 2 or higher. To prevent CSP 1 browsers from being crippled by the presence
	// of a script-src or style-src rule we provide unsafe-inline as a fallback. CSP 2 compliant browsers will
	// ignore the unsafe-inline rule when a nonce value is set since it superseeds rather than undermines. This
	// allows for superior security when supported.

	// Declare whitelist rules

	const scriptSrcList = shouldDisableNonceHeader
		? ['*', BLOB, UNSAFE_INLINE, UNSAFE_EVAL]
		: ASSET_WHITELIST.concat([BLOB, applyNonceHeader, STRICT_DYNAMIC, UNSAFE_INLINE, UNSAFE_EVAL]);

	// Using the shouldDisableNonceHeader to disable workerSrc and manifestSrc on older Safari browsers.
	const directives: CspDirectives = Object.assign(
		{
			// By default we restrict everything and then selectively allow just what we need.
			defaultSrc: ASSET_WHITELIST,
			// Valid sources for script elements and inline javascript:
			scriptSrc: scriptSrcList,
			// Valid sources for CSS via a link element, style element, and inline style attribute:
			styleSrc: ASSET_WHITELIST.concat([BLOB, UNSAFE_INLINE]),
			// Valid sources for fonts via @font-face:
			fontSrc: ASSET_WHITELIST.concat([DATA]),
			// Valid sources for images:
			imgSrc: ASSET_WHITELIST.concat([DATA, '*.togglestatic.com']),
			// Valid sources for fetch, ajax and web sockets:
			connectSrc: COMMON_WHITELIST,
			// Valid sources for video and audio elements:
			mediaSrc: ASSET_WHITELIST.concat([BLOB, DATA, HTTPS]),
			// Valid sources for iframes:
			frameSrc: IFRAME_WILDCARD_SUPPORTED ? ['*'] : COMMON_WHITELIST,
			// Valid parents that may embed this app within an iframe:
			frameAncestors: includeFrameAncestors ? FRAME_ANCESTOR_WHITELIST : ['*'],
			// Valid sources for form submission:
			formAction: COMMON_WHITELIST,
			// Valid sources for object, embed, and applet:
			objectSrc: [NONE],
			// Valid sources for a base element:
			baseUri: [SELF]
		},
		shouldDisableNonceHeader
			? {}
			: {
					workerSrc: [SELF, BLOB], // Valid sources for web workers:
					manifestSrc: [SELF] // Valid sources for manifest files:
			  }
	);

	// When set violations will be logged
	if (REPORT_URI) directives.reportUri = REPORT_URI;

	if (directivesModifiers) {
		// Whitelist Third Party Services
		for (let modifier of directivesModifiers) {
			modifier(directives);
		}
	}

	// Whitelist all images because of pixels: https://stackoverflow.com/questions/34361383/google-adwords-csp-content-security-policy-img-src/34831655#34831655
	// Remove this line if we need to finetune this
	directives.imgSrc = ['*', DATA, 'android-webview-video-poster', BLOB];

	// MEDTOG-23435 Add only frame ancestors directive for quicker rollout
	// To revert to original full policy when ready
	const frameAncestorsOnlyDirectives = {
		frameAncestors: directives.frameAncestors
	};
	const frameAncestorsOnly = process.env.CSP_FRAME_ANCESTORS_ONLY === 'true';
	// Declare Policy
	const csp: any = {
		directives: frameAncestorsOnly ? frameAncestorsOnlyDirectives : directives,
		// While true warns but doesn't block.
		reportOnly: REPORT_ONLY,
		// While true forces all resource requests to use HTTPS.
		upgradeInsecureRequests: UPGRADE_INSECURE_REQUESTS,
		// Set to false if you want to completely disable any user-agent sniffing.
		// This may make the headers less compatible but it will be much faster.
		browserSniff: false
	};

	// Apply Policy
	return helmet.contentSecurityPolicy(csp);
}

/**
 * Use of a nonce value allows inline scripts & styles to be evaluated safely within a CSP.
 * Nonces are necessary unless you enable 'unsafe-inline' for script-src.
 */

function generateNonce(req, res, next) {
	res.locals.nonce = hashids.encode(randInt(), Date.now(), randInt());
	next();
}

function applyNonceHeader(req, res) {
	return `'nonce-${res.locals.nonce}'`;
}

const NONCE_PLACEHOLDER_VALUE = '_';

const NONCE_ATTR_REGEX = new RegExp(`(<script|<style)((?:(?!src=).)*?)>`, 'g');
const DANGLING_MARKUP_INJECTION_PROTECTION = `<!-- '"´ -->`;

/**
 * Replaces all inline script and style elements with a CSP compliant version.
 *
 * When `BLOCK_UNSAFE_EXECUTION` is true we inject a placeholder nonce atrribute,
 * and prefix an html comment containing escape characters to prevent dangling markup
 * injection attacks.
 *
 * This version of the html is suitable for caching. The nonce placeholder value
 * should be replaced before returning the markup to the user.
 */
export function formatCspHtml(html) {
	if (!BLOCK_UNSAFE_EXECUTION) return html;
	return html.replace(
		NONCE_ATTR_REGEX,
		`${DANGLING_MARKUP_INJECTION_PROTECTION}$1$2 nonce="${NONCE_PLACEHOLDER_VALUE}">`
	);
}

/**
 * If you have a CSP set without `unsafe-inline` and you're server-side rendering the
 * generated html needs to have its placeholder nonce values replaced with a unique random
 * number to ensure inline scripts and styles work as intended.
 */
function updateCspHtml(html, res) {
	if (!BLOCK_UNSAFE_EXECUTION) return html;
	const nonce = res.locals.nonce;
	return nonce ? applyNonce(html, nonce) : html;
}

// Replace the placeholder with a proper nonce value
function applyNonce(html, nonce) {
	if (!~html.indexOf('nonce=')) return html;
	const regex = new RegExp(`nonce="${NONCE_PLACEHOLDER_VALUE}"`, 'g');
	return html.replace(regex, `nonce="${nonce}"`);
}
