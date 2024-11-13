'use strict';

/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 *
 * https://docs.newrelic.com/docs/agents/nodejs-agent/installation-configuration/nodejs-agent-configuration#rules_config
 */

const LICENSE_KEY = process.env.NEW_RELIC_LICENSE_KEY;
const APP_NAME = process.env.NEW_RELIC_APP_NAME || 'Slingshot Server';
const ENABLED = !!LICENSE_KEY;

exports.config = {
	/**
	 * Array of application names.
	 */
	app_name: [APP_NAME],
	/**
	 * Your New Relic license key.
	 */
	license_key: LICENSE_KEY,
	agent_enabled: ENABLED,

	/**
	 * Set to `false` as the default behaviour causes many transactions to be
	 * rolled into the /* name
	 * Can use NEW_RELIC_ENFORCE_BACKSTOP to override this
	 */
	enforce_backstop: false,
	logging: {
		/**
		 * Level at which to log. 'trace' is most useful to New Relic when diagnosing
		 * issues with the agent, 'info' and higher will impose the least overhead on
		 * production applications.
		 */
		level: ENABLED ? 'info' : 'fatal',
		filepath: 'stdout'
	},
	attributes: {
		enabled: true
	},
	browser_monitoring: {
		enable: true
	}
};
