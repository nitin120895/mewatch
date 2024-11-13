/// <reference path="types.ts"/>
/** @module newsletters */
// Auto-generated, edits will be overwritten
import * as gateway from './gateway';

/**
 * Gets all the available newsletters
 *
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
 * @return {Promise<module:types.Newsletter[]>} OK
 */
export function getNewsletters(options?: GetNewslettersOptions): Promise<api.Response<api.Newsletter[]>> {
	if (!options) options = {};
	const parameters: api.OperationParamGroups = {
		query: {
			lang: options.lang
		}
	};
	return gateway.request(getNewslettersOperation, parameters);
}

export interface GetNewslettersOptions {
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

const getNewslettersOperation: api.OperationInfo = {
	path: '/newsletters',
	method: 'get'
};
