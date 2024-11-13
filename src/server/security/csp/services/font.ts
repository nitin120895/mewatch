import { UNSAFE_INLINE } from '../policy';

/**
 * You opt in to supported web font services by using the matching
 * key value(s) within the `CSP_FONTS` environment variable.
 *
 * e.g. `CSP_FONTS=google`
 *
 * To add your own simply declare a CspDirectivesModifier function
 * and map it to a key for use within your env variables.
 */
const FONT_SERVICES: CspDirectivesModifierLookup = {
	google: allowGoogleFonts,
	typekit: allowTypekitFonts
};

export default FONT_SERVICES;

/**
 * Whitelist domains associated with web fonts
 *
 * If a service requires a common sub domain which may be shared
 * by several microservices then ensure you check for its existance
 * before injecting it into the array.
 */

// Google Web Fonts
function allowGoogleFonts(directives: CspDirectives) {
	const styleSrc = directives.styleSrc || [];
	directives.styleSrc = styleSrc.concat(['fonts.googleapis.com']);
	const fontSrc = directives.fontSrc || [];
	directives.fontSrc = fontSrc.concat(['fonts.gstatic.com']);
}

// Adobe Typekit Fonts
function allowTypekitFonts(directives: CspDirectives) {
	const scriptSrc = directives.scriptSrc || [];
	directives.scriptSrc = scriptSrc.concat(['use.typekit.net']);
	let styleSrc = directives.styleSrc || [];
	if (!~styleSrc.indexOf(UNSAFE_INLINE)) {
		styleSrc = [UNSAFE_INLINE].concat(styleSrc);
	}
	directives.styleSrc = styleSrc.concat(['use.typekit.net']);
	const fontSrc = directives.fontSrc || [];
	directives.fontSrc = fontSrc.concat(['use.typekit.net', 'fonts.typekit.net']);
	const imgSrc = directives.imgSrc || [];
	directives.imgSrc = imgSrc.concat(['p.typekit.net']);
	const connectSrc = directives.connectSrc || [];
	directives.connectSrc = connectSrc.concat(['performance.typekit.net']);
}
