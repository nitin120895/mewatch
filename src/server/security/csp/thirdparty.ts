import * as log from '../../logger';
import CSP_ENABLED from './';
import ANALYTIC_SERVICES from './services/analytic';
import FONT_SERVICES from './services/font';
import PAYMENT_SERVICES from './services/payment';
import PLUGIN_TYPES from './services/plugin';
import SOCIAL_SERVICES from './services/social';
import VIDEO_SERVICES from './services/video';

const env = process.env;

const allowedThirdPartyServices: CspDirectivesModifier[] = [];

function enableAllowedServices(group: string, whitelist: string, services: CspDirectivesModifierLookup) {
	if (!whitelist) return;
	const whitelistServices = whitelist.split(',');
	for (let service of whitelistServices) {
		if (typeof services[service] !== 'undefined') {
			allowedThirdPartyServices.push(services[service]);
			log.info(`  ✅  Whitelisted '${service}' under ${group} within the CSP.`);
		} else {
			log.warn(`  🚫  Unable to whitelist '${service}' under ${group} within the CSP. No match found.`);
		}
	}
}

if (CSP_ENABLED) {
	// Third party services are enabled via environment variable flags.
	// Enable by providing the key associated within each service per grouping.
	enableAllowedServices('CSP_ANALYTICS', env.CSP_ANALYTICS || '', ANALYTIC_SERVICES);
	enableAllowedServices('CSP_FONTS', env.CSP_FONTS || '', FONT_SERVICES);
	enableAllowedServices('CSP_PAYMENT_GATEWAYS', env.CSP_PAYMENT_GATEWAYS || '', PAYMENT_SERVICES);
	enableAllowedServices('CSP_PLUGINS', env.CSP_PLUGINS || '', PLUGIN_TYPES);
	enableAllowedServices('CSP_SOCIAL_INTEGRATIONS', env.CSP_SOCIAL_INTEGRATIONS || '', SOCIAL_SERVICES);
	enableAllowedServices('CSP_VIDEO_PLAYERS', env.CSP_VIDEO_PLAYERS || '', VIDEO_SERVICES);
}

/**
 * CSP modifiers for whitelisted third party services.
 *
 * If a service isn't included here then it will be blocked at runtime.
 * Add/remove as needed via environment variables (see above);
 */
export default allowedThirdPartyServices;
