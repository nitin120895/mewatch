/**
 * You opt in to supported plugins by using the matching key value(s)
 * within the `CSP_PLUGINS` environment variable.
 *
 * e.g. `CSP_PLUGINS=flash`
 *
 * To add your own simply declare a CspDirectivesModifier function
 * and map it to a key for use within your env variables.
 */
const PLUGIN_TYPES: CspDirectivesModifierLookup = {
	flash: allowFlashPlayer
};

export default PLUGIN_TYPES;

/**
 * Whitelist mime types for supported plugins
 */

// Allow Flash Player
function allowFlashPlayer(directives: CspDirectives) {
	const pluginTypes = directives.pluginTypes || [];
	directives.pluginTypes = pluginTypes.concat(['application/x-shockwave-flash']);
}
