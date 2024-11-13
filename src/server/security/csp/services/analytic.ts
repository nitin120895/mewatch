/**
 * You opt in to supported analytical services by using the matching
 * key value(s) within the `CSP_ANALYTICS` environment variable.
 *
 * e.g. `CSP_ANALYTICS=googleXhr`
 *
 * To add your own simply declare a CspDirectivesModifier function
 * and map it to a key for use within your env variables.
 */
const ANALYTIC_SERVICES: CspDirectivesModifierLookup = {
	adobeLaunch: allowAdobeLaunch,
	google: allowGoogle,
	googleImg: allowGoogleAnalyticsImageTransport,
	googleXhr: allowGoogleAnalyticsXhrTransport,
	mixpanel: allowMixpanel,
	newRelic: allowNewRelic
};

export default ANALYTIC_SERVICES;

/**
 * Whitelist domains associated with analytics
 *
 * If a service requires a common sub domain which may be shared
 * by several microservices then ensure you check for its existance
 * before injecting it into the array.
 */

function allowAdobeLaunch(directives: CspDirectives) {
	const imgSrc = directives.imgSrc || [];
	directives.imgSrc = imgSrc.concat([
		'*.demdex.net',
		'*.doubleclick.net',
		'*.moatads.com',
		'*.scorecardresearch.com',
		'analytics.pangle-ads.com',
		'bat.bing.com',
		'cm.everesttech.net',
		'mediacorp.sc.omtrdc.net',
		'secure-sg.imrworldwide.com'
	]);

	const connectSrc = directives.connectSrc || [];
	directives.connectSrc = connectSrc.concat([
		'*.adnxs.com',
		'*.clarity.ms',
		'*.crwdcntrl.net',
		'*.demdex.net',
		'*.doubleclick.net',
		'*.enzymic.co',
		'*.geoedge.be',
		'*.moatads.com',
		'*.outbrain.com',
		'*.pubmatic.com',
		'*.sensic.net',
		'*.teads.tv',
		'analytics.pangle-ads.com',
		'analytics.tiktok.com',
		'bam.nr-data.net',
		'bat.bing.com',
		'c.ltmsphrcl.net',
		'cm.everesttech.net',
		'mediacorp.hb.omtrdc.net',
		'mediacorp.sc.omtrdc.net',
		'sb.scorecardresearch.com',
		's.yimg.com'
	]);
}

function allowGoogle(directives: CspDirectives) {
	const whitelist = [
		'*.adtrafficquality.google',
		'*.google.com',
		'*.google.com.sg',
		'*.google-analytics.com',
		'*.googleapis.com',
		'*.googlesyndication.com',
		'*.gstatic.com',
		'www.googletagmanager.com'
	];

	const imgSrc = directives.imgSrc || [];
	directives.imgSrc = imgSrc.concat(whitelist);

	const connectSrc = directives.connectSrc || [];
	directives.connectSrc = connectSrc.concat([
		...whitelist,
		'*.google.co.id',
		'*.google.co.in',
		'*.google.co.jp',
		'*.google.co.nz',
		'*.google.co.uk',
		'*.google.com.au',
		'*.google.com.bn',
		'*.google.com.my',
		'*.google.com.ph',
		'*.google.com.vn',
		'*.google.fr'
	]);
}

const gaWhitelist = ['www.google-analytics.com'];

// Google Analytics
function allowGoogleAnalytics(directives: CspDirectives) {
	// For maximum security it's recommended to use the 'xhr' transport mode instead of 'auto' or 'image'.
	// https://developers.google.com/analytics/devguides/collection/analyticsjs/sending-hits#specifying_different_transport_mechanisms
	const scriptSrc = directives.scriptSrc || [];
	directives.scriptSrc = scriptSrc.concat(gaWhitelist);
}

// Google Analytics - Image Transport
function allowGoogleAnalyticsImageTransport(directives: CspDirectives) {
	allowGoogleAnalytics(directives);
	const imgSrc = directives.imgSrc || [];
	directives.imgSrc = imgSrc.concat(gaWhitelist);
}

// Google Analytics - XHR Transport
function allowGoogleAnalyticsXhrTransport(directives: CspDirectives) {
	allowGoogleAnalytics(directives);
	const connectSrc = directives.connectSrc || [];
	directives.connectSrc = connectSrc.concat(gaWhitelist);
}

function allowMixpanel(directives: CspDirectives) {
	const connectSrc = directives.connectSrc || [];
	directives.connectSrc = connectSrc.concat(['*.mixpanel.com']);
}

function allowNewRelic(directives: CspDirectives) {
	const connectSrc = directives.connectSrc || [];
	directives.connectSrc = connectSrc.concat(['bam.nr-data.net']);
}
