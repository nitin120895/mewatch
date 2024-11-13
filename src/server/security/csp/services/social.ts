/**
 * You opt in to supported social network services by using the matching
 * key value(s) within the `CSP_SOCIAL_INTEGRATIONS` environment variable.
 *
 * e.g. `CSP_SOCIAL_INTEGRATIONS=facebook,twitter`
 *
 * To add your own simply declare a CspDirectivesModifier function
 * and map it to a key for use within your env variables.
 */
const SOCIAL_SERVICES: CspDirectivesModifierLookup = {
	facebook: allowFacebookButtons,
	twitter: allowTwitterButtons,
	google: allowGooglePlusButtons
};

export default SOCIAL_SERVICES;

/**
 * Whitelist domains associated with social media buttons.
 *
 * If a service requires a common sub domain which may be shared
 * by several microservices then ensure you check for its existance
 * before injecting it into the array.
 */

// Facebook connect and like button
function allowFacebookButtons(directives: CspDirectives) {
	const whitelist = ['*.facebook.com', '*.facebook.net'];
	const scriptSrc = directives.scriptSrc || [];
	directives.scriptSrc = scriptSrc.concat(whitelist);

	const connectSrc = directives.connectSrc || [];
	directives.connectSrc = connectSrc.concat(whitelist);

	const frameSrc = directives.frameSrc || [];
	if (frameSrc.length && frameSrc[0] !== '*') {
		directives.frameSrc = frameSrc.concat(whitelist);
	}
	const styleSrc = directives.styleSrc || [];
	directives.styleSrc = styleSrc.concat(whitelist);
	const imgSrc = directives.imgSrc || [];
	directives.imgSrc = imgSrc.concat(whitelist);
}

// Twitter tweet button
function allowTwitterButtons(directives: CspDirectives) {
	const whitelist = ['platform.twitter.com'];
	const scriptSrc = directives.scriptSrc || [];
	directives.scriptSrc = scriptSrc.concat(whitelist);

	const frameSrc = directives.frameSrc || [];
	if (frameSrc.length && frameSrc[0] !== '*') {
		directives.frameSrc = frameSrc.concat(whitelist);
	}
}

// Google +1 button
function allowGooglePlusButtons(directives: CspDirectives) {
	const scriptSrc = directives.scriptSrc || [];
	if (!~scriptSrc.indexOf('apis.google.com')) {
		directives.scriptSrc = scriptSrc.concat(['apis.google.com']);
	}
	const frameSrc = directives.frameSrc || [];
	if (frameSrc.length && frameSrc[0] !== '*') {
		directives.frameSrc = frameSrc.concat(['plusone.google.com']);
	}
}
