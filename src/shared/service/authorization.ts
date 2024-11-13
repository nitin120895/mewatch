/// <reference path="types.ts"/>
/** @module authorization */
// Auto-generated, edits will be overwritten
import * as gateway from './gateway';

/**
 * Request one or more `Account` level authorization tokens each with a chosen scope.
 *
 * Tokens are used to access restricted service endpoints. These restricted endpoints
 * will require a specific token type (e.g Account) with a specific scope (e.g. Catalog)
 * before access is granted.
 *
 * For convenience, where a Profile level token with the same scope exists it will also be returned.
 * This removes the need to prompt a user for a password on login followed directly with a
 * pin prompt for a profile token of the same scope.
 *
 * Where an Account level pin is supported, some tokens may be returned from this endpoint
 * by providing this pin instead of a password. For example the `Playback` scoped Account
 * token is one such type.
 *
 * Any token which is returnable with an Account pin will also be returnable with the
 * Account password. On the inverse, not all scoped tokens that are returnable via password
 * will be returnable via the pin. For example when you log in you receive an Account Catalog
 * token. This is not obtainable from an Account pin, only password.
 *
 * If both a pin and password are supplied only the password will be used.
 *
 * If neither a pin or password are supplied an http 400 error will be returned.
 *
 * @param {module:types.AccountTokenRequest} body The account credentials with requested token scope.
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
export function getAccountToken(
	body: api.AccountTokenRequest,
	options?: GetAccountTokenOptions
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
	return gateway.request(getAccountTokenOperation, parameters);
}

/**
 * When a user signs out of an application we need to clear some
 * basic cookies we assigned them during token authorization.
 *
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
 * @return {Promise<object>} OK
 */
export function signOut(options?: SignOutOptions): Promise<api.Response<any>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(signOutOperation, parameters);
}

/**
 * Request `Anonymous` authorization token.
 *
 * Token is used to access anonymous service endpoints
 *
 * @param {module:types.AnonymousTokenRequest} body The device id.
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
export function getAnonymousToken(
	body: api.AnonymousTokenRequest,
	options?: GetAnonymousTokenOptions
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
	return gateway.request(getAnonymousTokenOperation, parameters);
}

/**
 * Gets automatic sign-in url for native devices.
 *
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
 * @return {Promise<module:types.AutomaticSignIn>} Url for automatic signin
 */
export function getAutoSigninUrl(options?: GetAutoSigninUrlOptions): Promise<api.Response<api.AutomaticSignIn>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			ff: gateway.formatArrayParam(options.ff, 'csv', 'ff'),
			lang: options.lang
		}
	};
	return gateway.request(getAutoSigninUrlOperation, parameters);
}

/**
 * Get Catalog tokens for an account using a device authorization code.
 * Where a Profile level token of Catalog scope exists it will also be returned.
 *
 * This is the final step in the process of authorizing a device by pin code.
 *
 * Firstly the device must request a generated authorization code via the
 * `/authorization/device/code` endpoint.
 *
 * The code is subsequently used to authorize the device to sign in to a given
 * account via the `/account/devices/authorization` endpoint. Typically this
 * will be from a page presented in the web app under the account section.
 *
 * Once authorized, this endpoint will allow the device to sign in without
 * needing to provide the credentials of the user.
 *
 * @param {module:types.AccountTokenByCodeRequest} body The device id e.g. serial number and authorization code.
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
export function getAccountTokenByCode(
	body: api.AccountTokenByCodeRequest,
	options?: GetAccountTokenByCodeOptions
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
	return gateway.request(getAccountTokenByCodeOperation, parameters);
}

/**
 * Get a generated device authorization code.
 *
 * This is the first step in the process of authorizing a device by pin code.
 * The device will make a request to this endpoint providing a unique identifier
 * for the device such as a serial number. This endpoint will then return a
 * generated code which is tied to the given device.
 *
 * The code may subsequently be used to authorize the device to sign in to an
 * account via the `/account/devices/authorization` endpoint. Typically this
 * will be from a page presented in the web app under the account section.
 *
 * Once authorized, the device will then be able to sign in to that account
 * via the `/authorization/device` endpoint, without needing to provide the
 * credentials of the user.
 *
 * @param {module:types.DeviceAuthorizationCodeRequest} body Details of the device being authorized.
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
 * @return {Promise<module:types.DeviceAuthorizationCode>} OK
 */
export function generateDeviceAuthorizationCode(
	body: api.DeviceAuthorizationCodeRequest,
	options?: GenerateDeviceAuthorizationCodeOptions
): Promise<api.Response<api.DeviceAuthorizationCode>> {
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
	return gateway.request(generateDeviceAuthorizationCodeOperation, parameters);
}

/**
 * Register a playback device under an account.
 *
 * If a device with the same id already exists a `409` conflict will be returned.
 *
 * @param {module:types.PlaybackTokenRequest} body The account pin used to request a playback token to play restricted content from a restricted profile
 * @param {object} options Optional options
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
export function createPlaybackToken(
	body: api.PlaybackTokenRequest,
	options?: CreatePlaybackTokenOptions
): Promise<api.Response<api.AccessToken[]>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		body: {
			body
		},
		query: {
			lang: options.lang
		}
	};
	return gateway.request(createPlaybackTokenOperation, parameters);
}

/**
 * Request one or more `Profile` level authorization tokens each with a chosen scope.
 *
 * Tokens are used to access restricted service endpoints. These restriced endpoints
 * will require a specific token type (e.g Profile) with a specific scope (e.g. Catalog)
 * before access is granted.
 *
 * @param {module:types.ProfileTokenRequest} body The profile id and required token scope.
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
export function getProfileToken(
	body: api.ProfileTokenRequest,
	options?: GetProfileTokenOptions
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
	return gateway.request(getProfileTokenOperation, parameters);
}

/**
 * Refresh an account or profile level authorization token which is marked as refreshable.
 *
 * @param {module:types.TokenRefreshRequest} body The token to refresh.
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
export function refreshToken(
	body: api.TokenRefreshRequest,
	options?: RefreshTokenOptions
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
	return gateway.request(refreshTokenOperation, parameters);
}

/**
 * Login using Mediacorp one time password.
 *
 * @param {module:types.SettingsTokenRequest} body
 * @param {object} options Optional options
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
export function createSettingsToken(
	body: api.SettingsTokenRequest,
	options?: CreateSettingsTokenOptions
): Promise<api.Response<api.AccessToken[]>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		body: {
			body
		},
		query: {
			lang: options.lang
		}
	};
	return gateway.request(createSettingsTokenOperation, parameters);
}

/**
 * Exchange a third party single-sign-on token for our own authorization tokens.
 *
 * @param {module:types.SingleSignOnRequest} body A single-sign-on request.
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
export function singleSignOn(
	body: api.SingleSignOnRequest,
	options?: SingleSignOnOptions
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
	return gateway.request(singleSignOnOperation, parameters);
}

/**
 * Exchange a third party single-sign-on token for our own authorization tokens and migrate anonymous watched data.
 *
 * @param {module:types.SingleSignOnRequest} body A single-sign-on request.
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
export function singleSignOnAnonymous(
	body: api.SingleSignOnRequest,
	options?: SingleSignOnAnonymousOptions
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
	return gateway.request(singleSignOnAnonymousOperation, parameters);
}

export interface GetAccountTokenOptions {
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

export interface SignOutOptions {
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

export interface GetAnonymousTokenOptions {
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

export interface GetAutoSigninUrlOptions {
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

export interface GetAccountTokenByCodeOptions {
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

export interface GenerateDeviceAuthorizationCodeOptions {
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

export interface CreatePlaybackTokenOptions {
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

export interface GetProfileTokenOptions {
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

export interface RefreshTokenOptions {
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

export interface CreateSettingsTokenOptions {
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

export interface SingleSignOnOptions {
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

export interface SingleSignOnAnonymousOptions {
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

const getAccountTokenOperation: api.OperationInfo = {
	path: '/authorization',
	contentTypes: ['application/json'],
	method: 'post'
};

const signOutOperation: api.OperationInfo = {
	path: '/authorization',
	method: 'delete'
};

const getAnonymousTokenOperation: api.OperationInfo = {
	path: '/authorization/anonymous',
	contentTypes: ['application/json'],
	method: 'post'
};

const getAutoSigninUrlOperation: api.OperationInfo = {
	path: '/authorization/autosignin',
	method: 'get',
	security: [
		{
			id: 'accountAuth',
			scopes: ['Catalog']
		}
	]
};

const getAccountTokenByCodeOperation: api.OperationInfo = {
	path: '/authorization/device',
	contentTypes: ['application/json'],
	method: 'post'
};

const generateDeviceAuthorizationCodeOperation: api.OperationInfo = {
	path: '/authorization/device/code',
	contentTypes: ['application/json'],
	method: 'post'
};

const createPlaybackTokenOperation: api.OperationInfo = {
	path: '/authorization/playback',
	contentTypes: ['application/json'],
	method: 'post',
	security: [
		{
			id: 'profileAuth',
			scopes: ['Catalog']
		}
	]
};

const getProfileTokenOperation: api.OperationInfo = {
	path: '/authorization/profile',
	contentTypes: ['application/json'],
	method: 'post',
	security: [
		{
			id: 'accountAuth',
			scopes: ['Catalog']
		}
	]
};

const refreshTokenOperation: api.OperationInfo = {
	path: '/authorization/refresh',
	contentTypes: ['application/json'],
	method: 'post'
};

const createSettingsTokenOperation: api.OperationInfo = {
	path: '/authorization/settings',
	contentTypes: ['application/json'],
	method: 'post',
	security: [
		{
			id: 'accountAuth',
			scopes: ['Catalog']
		}
	]
};

const singleSignOnOperation: api.OperationInfo = {
	path: '/authorization/sso',
	contentTypes: ['application/json'],
	method: 'post'
};

const singleSignOnAnonymousOperation: api.OperationInfo = {
	path: '/authorization/sso/anonymous',
	contentTypes: ['application/json'],
	method: 'post',
	security: [
		{
			id: 'anonymousAuth',
			scopes: ['Catalog']
		}
	]
};
