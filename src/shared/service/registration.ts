/// <reference path="types.ts"/>
/** @module registration */
// Auto-generated, edits will be overwritten
import * as gateway from './gateway';

/**
 * Register a new user, creating them an account.
 *
 * Registration, when successful, will return an array of access tokens so the user is
 * immediately signed in.
 *
 * It returns Catalog and Commerce scoped tokens for both Account and Profile.
 * The Commerce ones are intended to allow the purchase of a subscription plan
 * in the step after registration, without the user being prompted to enter
 * their username and password again.
 *
 * An email will also be sent with a link they need to click to confirm their
 * email address. This confirmation is done via the /verify-email endpoint.
 *
 * @param {module:types.RegistrationRequest} body Registration details.
 * @param {object} options Optional options
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.AccessToken[]>} OK
 */
export function register(
	body: api.RegistrationRequest,
	options?: RegisterOptions
): Promise<api.Response<api.AccessToken[]>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		body: {
			body
		},
		query: {
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(registerOperation, parameters);
}

/**
 * Register a new user, creating them an account.
 *
 * Registration, when successful, will return an array of access tokens so the user is
 * immediately signed in.
 *
 * It returns Catalog and Commerce scoped tokens for both Account and Profile.
 * The Commerce ones are intended to allow the purchase of a subscription plan
 * in the step after registration, without the user being prompted to enter
 * their username and password again.
 *
 * An email will also be sent with a link they need to click to confirm their
 * email address. This confirmation is done via the /verify-email endpoint.
 *
 * All content watched as anonymous user will be moved to the newly registered user.
 *
 * @param {module:types.RegistrationRequest} body Registration details.
 * @param {object} options Optional options
 * @param {string[]} [options.ff] The set of opt in feature flags which cause breaking changes to responses.
 *
 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
 * 	may need to evolve over this time.
 *
 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
 * 	clients as these formats evolve under the current major version.
 *
 * 	### Flags
 *
 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
 * 	- `idp` - Dynamic item detail pages with schedulable rows.
 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
 * 	- `ldpo` - Do not set default latest release order to list detail pages.
 * 	- `hb` - New version of image URL format.
 * 	- `rpt` - Updated resume point threshold logic.
 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
 * 	- `cd` - Custom Destination support.
 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
 * 	- `dpl` - Profile specific lists in page entries
 * 	- `es` - Client supports _Enhanced Search_ pages
 *
 * 	See the `feature-flags.md` for available flag details.
 * @param {string} [options.lang] Language code for the preferred language to be returned in the response.
 *
 * 	Parameter value is case-insensitive and should be
 * 	  - a valid 2 letter language code without region such as en, de
 * 	  - or with region such as en-US, en-AU
 *
 * 	If undefined then defaults to 'en', unless the server has been configured
 * 	with a custom default.
 *
 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @return {Promise<module:types.AccessToken[]>} OK
 */
export function registerAnonymous(
	body: api.RegistrationRequest,
	options?: RegisterAnonymousOptions
): Promise<api.Response<api.AccessToken[]>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		body: {
			body
		},
		query: {
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(registerAnonymousOperation, parameters);
}

export interface RegisterOptions {
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

export interface RegisterAnonymousOptions {
	/**
	 * The set of opt in feature flags which cause breaking changes to responses.
	 *
	 * 	While Rocket APIs look to avoid breaking changes under the active major version, the formats of responses
	 * 	may need to evolve over this time.
	 *
	 * 	These feature flags allow clients to select which response formats they expect and avoid breaking
	 * 	clients as these formats evolve under the current major version.
	 *
	 * 	### Flags
	 *
	 * 	- `all` - Enable all flags. Useful for testing. _Don't use in production_.
	 * 	- `idp` - Dynamic item detail pages with schedulable rows.
	 * 	- `ldp` - Dynamic list detail pages with schedulable rows.
	 * 	- `ldpo` - Do not set default latest release order to list detail pages.
	 * 	- `hb` - New version of image URL format.
	 * 	- `rpt` - Updated resume point threshold logic.
	 * 	- `cas` - "Custom Asset Search", inlcude `customAssets` in search results.
	 * 	- `lrl` - Do not pre-populate related list if more than `max_list_prefetch` down the page.
	 * 	- `cd` - Custom Destination support.
	 * 	- `sv2` - "Search Version 2", include sport asset types (event, competitions, team, confederations) and persons (personas and credits) in search results
	 * 	- `dpl` - Profile specific lists in page entries
	 * 	- `es` - Client supports _Enhanced Search_ pages
	 *
	 * 	See the `feature-flags.md` for available flag details.
	 */
	ff?: ('all' | 'idp' | 'ldp' | 'ldpo' | 'hb' | 'rpt' | 'cas' | 'lrl' | 'cd' | 'sv2' | 'dpl' | 'es')[];
	/**
	 * Language code for the preferred language to be returned in the response.
	 *
	 * 	Parameter value is case-insensitive and should be
	 * 	  - a valid 2 letter language code without region such as en, de
	 * 	  - or with region such as en-US, en-AU
	 *
	 * 	If undefined then defaults to 'en', unless the server has been configured
	 * 	with a custom default.
	 *
	 * 	See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	 */
	lang?: string;
}

const registerOperation: api.OperationInfo = {
	path: '/register',
	contentTypes: ['application/json'],
	method: 'post'
};

const registerAnonymousOperation: api.OperationInfo = {
	path: '/register/anonymous',
	contentTypes: ['application/json'],
	method: 'post',
	security: [
		{
			id: 'anonymousAuth',
			scopes: ['Catalog']
		}
	]
};
