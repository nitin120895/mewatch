/**
 * Converts a url query string into object parameters
 *
 * @param modifiers Optionally pass in modifiers should you need to manipulate the raw string values.
 *
 * @return An object containing the query parameter values or undefined if no query exists, or it's an empty query.
 */
export function getQueryParams(
	url?: string,
	modifiers: ((value: string) => string | number | boolean)[] = [convertNumericValues, convertBooleanValues]
): any {
	if (!url && typeof window !== 'undefined') url = window.location.search;
	if (!url) return undefined;
	const i = url.indexOf('?');
	if (i === -1) return undefined;
	const hashes: any[] = url.slice(i + 1).split('&');
	const params = {};
	hashes.map(hash => {
		const [key, val] = splitInHalf(hash, '=');
		if (val === undefined || val === '') {
			params[key] = true;
		} else {
			const v = decodeURIComponent(val);
			let mv: any = v;
			if (modifiers && modifiers.length > 0) {
				for (let modifier of modifiers) {
					mv = modifier(mv);
					if (typeof mv !== 'string') break;
				}
			}
			params[key] = mv;
		}
	});
	return Object.keys(params).length > 0 ? params : undefined;
}

export function getQueryParam(param: string) {
	const queryString = getQueryParams(window.location.search);
	return queryString && param in queryString ? queryString[param] : undefined;
}

/**
 * Split string in 2 pieces
 * i.e. splitInHalf('a=b=c', '=') => ['a', 'b=c']
 * @param str
 * @param separator
 */
function splitInHalf(str: string, separator: string): [string, string?] {
	const i = str.indexOf(separator);
	if (i < 0) {
		return [str];
	}
	const key = str.substring(0, i);
	const val = str.substring(i + 1);
	return [key, val];
}

export type QueryParams = { [name: string]: string | number | boolean };

/**
 * Converts object { a: 'b', c: 'd' } to string 'a=b&c=d'
 */
export function queryParamsToString(params: QueryParams): string {
	return Object.keys(params)
		.map(key => {
			const value = params[key];
			if (value === null || value === undefined) return key;

			return `${key}=${encodeURIComponent(value.toString())}`;
		})
		.join('&');
}

/**
 * Adds query parameters to URL
 * addQueryParameterToURL('/host', { a: 'b', c: 'd' }) => '/host?a=b&c=d'
 * addQueryParameterToURL('/host?e=f', { a: 'b', c: 'd' }) => '/host?e=f&a=b&c=d'
 */
export function addQueryParameterToURL(url: string, params: QueryParams): string {
	if (Object.keys(params).length > 0) {
		const queryDelimiter = url.includes('?') ? '&' : '?';
		url += queryDelimiter + queryParamsToString(params);
	}
	return url;
}

// MODIFIERS

// Converts boolean strings into actual booleans
// e.g. `?name=Jon%20Snow&knowsNothing=true` => {name: "Jon Snow", knowsNothing: true}
export const convertBooleanValues = (value: string): string | boolean => {
	const lv = value.toLowerCase();
	if (lv === 'true') return true;
	else if (lv === 'false') return false;
	return value;
};

// Converts numeric strings into actual numbers
// e.g. `?name=John%20Snow&knowledge=0` => {name: "Jon Snow", knowledge: 0}
export const convertNumericValues = (value: string): string | number => {
	const number = +value;
	return Number.isNaN(number) ? value : number;
};

// Converts strings wrapped in single or double quotes to a quoteless string
// e.g. `?fname='Jon'&lname="snow"` => {fname: "Jon", lname: "Snow"}
export const convertQuotedValues = (value: string): string => {
	const singleQuote = "'",
		doubleQuote = '"';
	const fc = value.charAt(0),
		lc = value.charAt(value.length - 1);
	if ((fc === singleQuote && lc === singleQuote) || (fc === doubleQuote && lc === doubleQuote))
		return value.substr(1, value.length - 2);
	return value;
};

export const VALID_URL_PART_REGEXP = /^(([\w\-\._~:\/\?#[\]@!\$&'\(\)\*\+,;=.])|([^<>]))+$/i;
export const VALID_URL_REGEXP = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+(([\w\-\._~:\/\?#[\]@!\$&'\(\)\*\+,;=.])|([^<>]))+$/i;

// URL validation
// regular expression is from https://www.regextester.com/94502
export const isValidURL = (value: string): boolean => {
	return VALID_URL_REGEXP.test(decodeURIComponent(value));
};

export const validateURL = (value: string): string => {
	return isValidURL(value) ? value : '';
};

// validate a part of URL
export const isValidURLPart = (value: string): boolean => {
	try {
		return VALID_URL_PART_REGEXP.test(decodeURIComponent(value));
	} catch (error) {
		return false;
	}
};

export const validateURLPart = (value: string): string => {
	return isValidURLPart(value) ? value : '';
};

export const validateLocation = (location: HistoryLocation): HistoryLocation => {
	if (!location) return undefined;

	const { pathname, search, query } = location;
	const searchBase = location['$searchBase'];

	const newLocation = {
		...location,
		pathname: validateURLPart(pathname),
		search: validateURLPart(search),
		query: validateQuery(query),
		...(searchBase
			? {
					$searchBase: {
						search: validateURLPart(searchBase.search),
						searchBase: validateURLPart(searchBase.searchBase)
					}
			  }
			: {})
	};

	return newLocation;
};

export const validateQuery = (query: { [key: string]: string }): { [key: string]: string } => {
	if (!query) return undefined;

	const newQuery = {};
	if (query) {
		Object.keys(query).forEach(key => {
			const newKey = validateURLPart(key);
			if (newKey && newKey.length) newQuery[newKey] = validateURLPart(query[key]);
		});
	}
	return newQuery;
};
