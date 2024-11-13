import { addLocaleData } from 'react-intl';
import * as cookies from '../util/cookies';
import deviceModel from '../util/platforms/deviceModel';

export const defaultLocale: string = process.env.CLIENT_DEFAULT_LOCALE || 'en';
let availableLocales: string[] = (process.env.CLIENT_LOCALES || process.env.CLIENT_DEFAULT_LOCALE).split(',');

const LANGUAGE_COOKIE_FIELD = 'lang';
const LANGUAGE_COOKIE_EXPIRY = new Date(2070, 12);

export function setAvailableLocales(locales: string[]) {
	availableLocales = locales;
}

/**
 * Set the locale for the application.
 *
 * This will load in the string bundle for the locale and register the correct
 * locale data bundle for use with it, returned via a Promise.
 */
export function setLocale(locale: string = defaultLocale): Promise<{ [key: string]: string }> {
	return getLocaleStrings(locale).then(strings => {
		if (!_SERVER_) {
			// If a dialect exists on the locale, we need to strip it prior to loading the data. e.g. `zh-CN` => `zh`.
			const dataKey = getPrefixOfLanguage(locale);
			// We get Webpack to auto bundle locale data for each locale defined via `env.CLIENT_LOCALES`.
			// See `build/webpack/vendor/locale-bundles.js`
			if (ReactIntlLocaleData[dataKey]) {
				addLocaleData(ReactIntlLocaleData[dataKey]);
			}
		}
		return strings;
	});
}

/**
 * Load the strings bundle for a given locale.
 *
 * If a locale is not specified then uses the `defaultLocale`.
 */
export function getLocaleStrings(locale: string = defaultLocale): Promise<{ [key: string]: string }> {
	// Ensure validity of the locale
	const lang = getSupportedLanguage(locale) || defaultLocale;
	// Because we have no control over the casing of published languages within our system
	// we ensure we always lowercase the filenames to ensure they can be resolved regardless
	// of whether a language is published in lowercase or mixed case (e.g. 'zh-cn' or 'zh-CN').
	return import(`resource/toggle/string/strings-${lang.toLowerCase()}`);
}

/**
 * Retrieve the saved language preference a user has previously set.
 *
 * @param {*} [req] if on the server this should be the active request object
 */
export function getSavedLanguagePreference(req?): string {
	if (_SERVER_) {
		if (!req || !req.cookies) return;
		return req.cookies[LANGUAGE_COOKIE_FIELD];
	}
	if (_TV_ || cookies.cookiesEnabled()) {
		return cookies.getCookie(LANGUAGE_COOKIE_FIELD);
	}
}

/**
 * Save the user's language preference for future visits.
 *
 * @param {string} lang the language code to retain
 */
export function saveLanguagePreference(lang: string) {
	if (_TV_ || cookies.cookiesEnabled()) {
		return cookies.setCookie(LANGUAGE_COOKIE_FIELD, lang, LANGUAGE_COOKIE_EXPIRY);
	}
}

/**
 * Get the prefix of the language code, if it contains `-` character.
 *
 * @param language the language code, e.g. en-US` or `zh-CN`
 */
export function getPrefixOfLanguage(language: string): string {
	return language.split('-').shift();
}

/**
 * Judge whether the target language is supported by App.
 *
 * @param targetLang verified support language
 */
export function getSupportedLanguage(targetLang: string): string {
	// We need to 1st attempt matching the exact language code (e.g. en-US) then fall back to matching the prefix (e.g. en).
	return (
		availableLocales.find(f => f === targetLang) ||
		availableLocales.find(f => targetLang && f.startsWith(getPrefixOfLanguage(targetLang || '')))
	);
}

/**
 * Get the initial language.
 * either get a lang stored in cookie (validated as supported),
 * use deviceModel to obtain the sytem language (validated as supported),
 * use default language,
 * use 1st supported language.
 *
 * @param state Redux state
 */
export async function getInitialLanguage(state: state.Root): Promise<string> {
	const { lang } = state.app.i18n;

	let language = getSupportedLanguage(lang);
	if (language) return language;

	let savedLanguagePreference;
	try {
		savedLanguagePreference = getSavedLanguagePreference();
	} catch (e) {
		console.warn('Get saved language preference failed!');
	}

	// Got a saved languages, either selected by default during first run, or set by the user.
	// In this case, it means that app is not running for the first time.
	language = getSupportedLanguage(savedLanguagePreference);
	if (language) return language;

	// Running the app for the first time on tv needs to follow the device language.
	// If there is an error in acquiring the device language or it is not supported, use `defaultLocale` as the default value.
	try {
		const deviceLanguage = await deviceModel.deviceInfo().getLanguage();
		language = getSupportedLanguage(deviceLanguage);
		if (language) return language;
	} catch (e) {
		console.warn('Get device language failed!');
	}

	return defaultLocale;
}

export const LANGUAGES_OPTION_ALL_CODE = 'all';
export const LANGUAGES_OPTION_ALL = {
	code: LANGUAGES_OPTION_ALL_CODE,
	label: `@{language_label_${LANGUAGES_OPTION_ALL_CODE}}`,
	title: `@{language_label_${LANGUAGES_OPTION_ALL_CODE}}`
};

export const OPTION_LABEL_OFF = 'off';
export const OPTION_OFF = {
	code: OPTION_LABEL_OFF,
	label: `@{language_label_${OPTION_LABEL_OFF}}`,
	title: `@{language_label_${OPTION_LABEL_OFF}}`
};

export const HD = 'HD';
export const SD = 'SD';

export const OPTION_LABEL_NORMAL = 'Normal';
export const DEFAULT_PLAYBACK_SPEED = 1;
