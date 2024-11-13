/**
 * You opt in to supported video services by using the matching
 * key value(s) within the `CSP_VIDEO_EMBEDS` environment variable.
 *
 * e.g. `CSP_VIDEO_EMBEDS=youtube,vimeo`
 *
 * To add your own simply declare a CspDirectivesModifier function
 * and map it to a key for use within your env variables.
 */
const VIDEO_SERVICES: CspDirectivesModifierLookup = {
	kaltura: allowKalturaPlayer,
	youtube: allowYoutubeEmbeds,
	vimeo: allowVimeoEmbeds,
	blaze: allowBlazeEmbeds
};

export default VIDEO_SERVICES;

/**
 * Whitelist domains associated with embedding videos.
 *
 * If a service requires a common sub domain which may be shared
 * by several microservices then ensure you check for its existance
 * before injecting it into the array.
 */

function allowKalturaPlayer(directives: CspDirectives) {
	const connectSrc = directives.connectSrc || [];
	directives.connectSrc = connectSrc.concat([
		'*.akamaized.net',
		'*.cloudfront.net',
		'*.gnsnpaw.com',
		'*.kaltura.com',
		'*.youbora.com',
		'*.youborafds01.com',
		'*.youboranqs01.com',
		'cc-toggle.s3.ap-southeast-1.amazonaws.com'
	]);

	const imgSrc = directives.imgSrc || [];
	directives.imgSrc = imgSrc.concat(['*.kaltura.com']);

	const mediaSrc = directives.mediaSrc || [];
	directives.mediaSrc = mediaSrc.concat(['*.kaltura.com', 'k.toggle.sg']);
}

// Youtube embeds
function allowYoutubeEmbeds(directives: CspDirectives) {
	const frameSrc = directives.frameSrc || [];
	if (frameSrc.length && frameSrc[0] !== '*') {
		directives.frameSrc = frameSrc.concat(['www.youtube.com/embed/']);
	}
}

// Vimeo embeds
function allowVimeoEmbeds(directives: CspDirectives) {
	const frameSrc = directives.frameSrc || [];
	if (frameSrc.length && frameSrc[0] !== '*') {
		directives.frameSrc = frameSrc.concat(['player.vimeo.com']);
	}
}

// Blaze SDK embeds
function allowBlazeEmbeds(directives: CspDirectives) {
	const connectSrc = directives.connectSrc || [];
	directives.connectSrc = connectSrc.concat(['blaze-audit.clipro.tv', 'blazesdk-prod-cdn.clipro.tv']);

	const styleSrc = directives.styleSrc || [];
	directives.styleSrc = styleSrc.concat(['sdk.mvp.fan']);
}
