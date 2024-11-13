import { getAppConfig, GET_APP_CONFIG } from '../service/action/app';
import {
	GET_ACCOUNT,
	REQUEST_COUNTRY_CODE as REQUEST_COUNTRY_CODE_ACCOUNT,
	requestCountryCode as requestCountryCodeAccount
} from 'shared/service/action/account';
import {
	REQUEST_COUNTRY_CODE as REQUEST_COUNTRY_CODE_ANONYMOUS,
	requestCountryCode as requestCountryCodeAnonymous
} from 'shared/service/action/anonymous';
import { GET_PROFILE } from '../service/action/profile';
import { refreshPage } from '../page/pageWorkflow';
import { clearServiceCache } from '../cache/persistentCache';
import { CLEAR_SESSION_CONTENT_FILTERS } from '../account/sessionWorkflow';
import { browserHistory } from '../util/browserHistory';
import { copy, get } from '../util/objects';
import * as Locale from './localeUtil';
import { SET_ACCOUNT_SEGMENTS } from '../account/accountWorkflow';
import { setDefaultImageTypesForItemTypes } from '../util/images';

export const INIT_CLIENT_STATE = 'app/INIT_CLIENT_STATE';
export const TRIGGER_SECONDARY_RENDER = 'app/TRIGGER_SECONDARY_RENDER';
export const CHUNK_LOADING = 'app/CHUNK_LOADING';
export const UPDATE_LOCALE = 'app/UPDATE_LOCALE';
export const HARD_REFRESH = 'app/HARD_REFRESH';
export const SET_CONTENT_FILTERS = 'app/SET_CONTENT_FILTERS';
export const UPDATE_ONLINE_STATUS = 'app/UPDATE_ONLINE_STATUS';
export const SET_APP_BACKGROUND_IMAGE = 'app/SET_APP_BACKGROUND_IMAGE';
export const SET_APP_PRIMARY_DATA = 'app/SET_APP_PRIMARY_DATA';
export const SET_APP_THEME = 'app/SET_APP_THEME';
export const SET_APP_SEGMENTS = 'app/SET_APP_SEGMENTS';
export const CLEAR_ERROR = 'app/CLEAR_ERROR';
export const UPDATE_HEADER_POSITION = 'app/UPDATE_HEADER_POSITION';
export const ENABLE_HEADER_POSITION_TRACKING = 'app/ENABLE_HEADER_POSITION_TRACKING';

// we nned to have update locale loading mode including download/update locale and page refresh
// this is locale update flow start action type
export const UPDATE_LOCALE_START = 'app/UPDATE_LOCALE_START';
// this is locale update flow end action type, call after page refresh if performs
export const UPDATE_LOCALE_END = 'app/UPDATE_LOCALE_END';

const MAX_ERRORED_ACTIONS = 1;

/**
 * Initial redux state for properties that need to be calculated
 * external to redux.
 *
 * Some of these properties are relevant only to server, some only
 * to client.
 *
 * Any properties that are not relevant should remain undefined.
 */
export interface InitialClientState {
	/**
	 * Whether the remember me option was selected by the user when they last signed in.
	 */
	rememberMe?: boolean;

	/**
	 * The current language
	 */
	lang?: string;

	/**
	 * Filters to add to each content query to filter content by.
	 */
	contentFilters?: state.ContentFilters;

	/**
	 * Whether the client is connected to the internet or not.
	 */
	online?: boolean;

	/**
	 * If a profile is currently selected.
	 */
	profileSelected?: boolean;

	/**
	 * When set to true and a user is navigating between seasons or episodes
	 * of a show, we won't attempt to reset the scroll position
	 * to the top of the page each time a new page is pushed.
	 */
	retainShowDetailScroll?: boolean;

	/**
	 * Header position and height
	 */
	header?: state.Header;
}

/**
 * Initialize the client application with state calculated
 * before app launch e.g. from local storage.
 *
 * The properties defined here my be reduced via any number
 * of reducers and are meant as a single point of initial
 * state population.
 *
 * This is dispatched on the server pre-render and on
 * the client pre initial render.
 *
 * Different properties will be populated depending on whether
 * on the server or the client.
 *
 * Any 'undefined' properties should be ignored and
 * NOT reduced into state.
 */
export function initClientState(clientState: InitialClientState): any {
	return { type: INIT_CLIENT_STATE, payload: clientState };
}

/**
 * Dispatched after initial render to indicate we can now render client
 * specific components (e.g. sign in/out button).
 *
 * This is to avoid checksum errors when what is rendered on the server
 * does not fully match what is rendered on the client.
 *
 * Components which should only be rendered on the client should connect
 * to redux store and only render if the `state.app.clientSide` value is true.
 *
 * See https://github.com/facebook/react/issues/4374
 */
export function clientRendered(): any {
	return { type: TRIGGER_SECONDARY_RENDER, payload: { clientSide: true } };
}

/**
 * Define the locale to be used by the application e.g. 'en or en-AU'.
 *
 * The application's available languages are dynamic and published externally.
 * This means there is the possibility that an available language doesn't have a
 * matching strings bundle to load.
 *
 * If the selected locale doesn't have a matching strings bundle it will attempt to
 * load the best fallback. This may be the same language without a regional dialect,
 * or it may be the default language.
 *
 * When the fallback is used there may be a mismatch between the `lang` and the UI labelling.
 * This mismatch is possible when languages are published on the backend before we've provided
 * a string bundle for the client application.
 */
export function updateLocale(locale: string = Locale.defaultLocale, initializing = false): any {
	return (dispatch, getState) => {
		let stringsLocale = locale;
		const state: state.Root = getState();
		const { lang } = state.app.i18n;

		// If we're switching to an identical locale then stop any further work,
		// unless we're initializing the app's locale, in that case we need to
		// ensure `Locale.setLocale` gets called with the correct value.
		if (lang === locale && !initializing) {
			return;
		}

		dispatch({ type: UPDATE_LOCALE_START });

		function onLocaleStringsLoaded(translations) {
			dispatch({ type: UPDATE_LOCALE, payload: { lang: locale, strings: translations, stringsLocale } });
			// avoid hard refresh during initialization as we've already loaded
			// content based on the active locale
			if (!initializing) {
				// We hard refresh to ensure both the application labels and the external
				// content translations get updated.
				return dispatch(hardRefresh());
			} else {
				dispatch({ type: UPDATE_LOCALE_END });
			}
		}
		function loadDefaultLocaleStrings() {
			stringsLocale = Locale.defaultLocale;
			// When we don't have a string bundle for the user chosen locale we need to load
			// the default language as a fallback to avoid rendering a broken user interface.
			// Failure to do this would result in the optional english fallback values defined
			// per component.
			return Locale.setLocale(Locale.defaultLocale).then(onLocaleStringsLoaded);
		}

		return Locale.setLocale(locale).then(onLocaleStringsLoaded, err => {
			// If a dialect exists on the locale, we strip it off the end. e.g. `zh-cn` => `zh`.
			const code = Locale.getPrefixOfLanguage(locale);
			if (locale !== code) {
				stringsLocale = code;
				// If the intended locale contained a dialect then we attempt to load a bundle for the language
				// without it. e.g. 'en' translations may exist even if locale was set to `en-us'.
				return Locale.setLocale(code).then(
					onLocaleStringsLoaded,
					// If this second attempt fails too then the default language is used as a fallback.
					err => loadDefaultLocaleStrings()
				);
			} else {
				// Ensure we load the default locale strings as a last resort.
				return loadDefaultLocaleStrings();
			}
		});
	};
}

/**
 * When signing in our out, or switching a profile, we need to
 * refresh the sitemap and page as content may be different
 * given the active subscription or profile max classification.
 */
export function hardRefresh(redirectPath?: string): any {
	return (dispatch, getState) => {
		dispatch({ type: HARD_REFRESH });
		return clearServiceCache().then(() => {
			return dispatch(getAppConfig({ include: ['sitemap', 'navigation'] })).then(() => {
				dispatch({ type: UPDATE_LOCALE_END });
				const state: state.Root = getState();
				// if we have a redirect path and it's different to the current path
				// then it will automatically refresh the page when we update browser history
				if (redirectPath && state.page.history.location.pathname !== redirectPath) {
					browserHistory.replace(redirectPath);
				} else {
					// otherwise refresh the current page
					return dispatch(refreshPage());
				}
			});
		});
	};
}

export function getCountryCode() {
	return (dispatch, getState) => {
		const state: state.Root = getState();
		const loggedIn = state.account.active;
		const requestCountryCode = loggedIn ? requestCountryCodeAccount : requestCountryCodeAnonymous;
		return dispatch(requestCountryCode());
	};
}

export function setContentFilters(filters: state.ContentFilters): any {
	return { type: SET_CONTENT_FILTERS, payload: filters };
}

export function updateOnlineStatus(online: boolean) {
	return { type: UPDATE_ONLINE_STATUS, payload: online };
}

export function chunkLoading(loading: boolean) {
	return { type: CHUNK_LOADING, payload: loading };
}

export function updateHeaderPosition(headerPosition: state.Header) {
	return { type: UPDATE_HEADER_POSITION, payload: headerPosition };
}

export function enableHeaderPositionTracking() {
	return { type: ENABLE_HEADER_POSITION_TRACKING };
}

/**
 * Sets a custom wallpaper image behind the content area with the option for a BEM modifier.
 *
 * The optional modifier allows suitable styling for each component which leverages this.
 * e.g. Gradients that respond to the component's content adjustments per breakpoint.
 *
 * It is the responsibility of each component which uses this to clean up after itself by calling this
 * again during `componentWillUnmount` to wipe out the previous sources.
 *
 * @param sources An array of responsive image sources.
 * @param appWallpaperCssModifier This value is applied as a BEM modifier for '.app-background'.
 */
export function setAppBackgroundImage(sources: image.Source[], appWallpaperCssModifier?: string) {
	const payload: state.AppBgImageData = { sources, appWallpaperCssModifier };
	return { type: SET_APP_BACKGROUND_IMAGE, payload };
}

export function setPrimaryData(primaryData?: any) {
	const payload: state.AppPrimaryData = { primaryData };
	return { type: SET_APP_PRIMARY_DATA, payload };
}

export function setAppTheme(theme: AppTheme) {
	return { type: SET_APP_THEME, payload: theme };
}

export function clearError() {
	return { type: CLEAR_ERROR };
}

// REDUCERS

const initState: state.App = {
	config: {
		sitemap: [],
		navigation: {
			header: []
		},
		general: {
			defaultSegmentationTags: ['all'],
			downloadExpirationTimeInDays: 0
		}
	},
	i18n: {
		lang: '',
		strings: {},
		stringsLocale: undefined,
		languages: [],
		loading: false
	},
	// We don't set a default `sub` (subscription) content filter as
	// Rocket will use the `Anonymous` subscription code if none supplied
	contentFilters: {
		device: process.env.CLIENT_DEVICE_PLATFORM
	},
	online: true,
	retainShowDetailScroll: false,
	erroredActions: [],
	backgroundImage: undefined,
	theme: 'default',
	header: {
		positionTop: 0,
		height: 60,
		positionTrackingEnabled: false
	},
	primaryData: undefined,
	countryCode: ''
};

export default function reduceApp(state: state.App = initState, action: Action<any>): state.App {
	if (action.error) {
		return reduceErroredActions(state, action);
	}

	switch (action.type) {
		case INIT_CLIENT_STATE:
			return reduceInitClientState(state, action);
		case UPDATE_ONLINE_STATUS:
			return reduceOnlineStatus(state, action);
		case TRIGGER_SECONDARY_RENDER:
			return state.clientSide ? state : copy(state, action.payload);
		case CHUNK_LOADING:
			return copy(state, { chunkLoading: action.payload });
		case UPDATE_LOCALE:
			return reduceLocale(state, action);
		case UPDATE_LOCALE_START:
			return reduceLocaleStart(state, action);
		case UPDATE_LOCALE_END:
			return reduceLocaleEnd(state, action);
		case GET_APP_CONFIG:
			return reduceConfig(state, <any>action);
		case GET_ACCOUNT:
			return reduceAccountContentFilters(state, action);
		case GET_PROFILE:
			return reduceProfileContentFilters(state, action);
		case SET_CONTENT_FILTERS:
			return reduceSetContentFilters(state, action);
		case CLEAR_SESSION_CONTENT_FILTERS:
			return reduceSessionContentFiltersReset(state);
		case SET_APP_BACKGROUND_IMAGE:
			return reduceAppBackgroundImage(state, action);
		case SET_APP_PRIMARY_DATA:
			return reduceAppPrimaryData(state, action);
		case SET_APP_THEME:
			return reduceAppTheme(state, action);
		case SET_ACCOUNT_SEGMENTS:
			return reduceAccountSegments(state, action);
		case CLEAR_ERROR:
			return reduceClearError(state, action);
		case UPDATE_HEADER_POSITION:
			return copy(state, { header: { ...state.header, ...action.payload } });
		case ENABLE_HEADER_POSITION_TRACKING:
			return copy(state, { header: { ...state.header, positionTrackingEnabled: true } });
		case REQUEST_COUNTRY_CODE_ACCOUNT:
		case REQUEST_COUNTRY_CODE_ANONYMOUS:
			return reduceCountryCode(state, action);
	}
	return state;
}

function reduceInitClientState(state: state.App, action: Action<InitialClientState>): state.App {
	const { contentFilters, retainShowDetailScroll, online, lang } = action.payload;
	const i18n = lang && lang !== state.i18n.lang ? { ...state.i18n, lang } : state.i18n;
	return {
		...state,
		online,
		retainShowDetailScroll,
		contentFilters: contentFilters ? contentFilters : state.contentFilters,
		i18n
	};
}

function reduceOnlineStatus(state: state.App, action: Action<boolean>) {
	return copy(state, { online: action.payload });
}

function reduceErroredActions(state: state.App, action: Action<any>): state.App {
	const erroredActions = state.erroredActions.slice(0, MAX_ERRORED_ACTIONS - 1);
	erroredActions.unshift(action);
	return copy(state, { erroredActions });
}

function reduceLocale(state: state.App, action: Action<any>): state.App {
	return {
		...state,
		i18n: {
			...state.i18n,
			...action.payload,
			strings: action.payload.strings || state.i18n.strings,
			stringsLocale: action.payload.stringsLocale || state.i18n.stringsLocale
		}
	};
}

function reduceLocaleStart(state: state.App, action: Action<any>): state.App {
	return {
		...state,
		i18n: {
			...state.i18n,
			loading: true
		}
	};
}

function reduceLocaleEnd(state: state.App, action: Action<any>): state.App {
	return {
		...state,
		i18n: {
			...state.i18n,
			loading: false
		}
	};
}

export function reduceConfig(state: state.App, action: ServiceAction<GET_APP_CONFIG>): state.App {
	if (action.type !== GET_APP_CONFIG || action.error) return state;
	const { payload } = action;
	const config: state.Config = copy(state.config, payload);
	const customFields = get(payload, 'general.customFields');
	if (payload.sitemap) {
		config.sitemap = formatSitemap(config.sitemap);
	}
	if (payload.general && payload.general.itemImageTypes) {
		setDefaultImageTypesForItemTypes(payload.general.itemImageTypes);
	}

	/* This will move all data of different Feature flags into FeatureToggle key (MEDTOG-24086)*/
	if (customFields && customFields.FeatureToggle) {
		const updatedFeatureToggle = transformFeatureToggle(customFields);
		config.general.customFields.FeatureToggle = updatedFeatureToggle;
	}

	const languages = get(payload, 'i18n.languages') || state.i18n.languages;
	const i18n = {
		...state.i18n,
		languages,
		lang: resolveMatchingLanguage(languages, state.i18n.lang)
	};

	const contentFilters = copy(state.contentFilters);
	if (!contentFilters.segments || contentFilters.segments.length === 0) {
		contentFilters.segments = get(payload, 'general.defaultSegmentationTags') || ['all'];
	}

	return {
		...state,
		config,
		contentFilters,
		i18n
	};
}

/**
 * Our application is compiled with a default language (e.g. 'en').
 *
 * We then consume dynamically published languages from our API.
 * These may mismatch the compiled default language.
 *
 * To ensure our UI remains as accurate as possible we attempt to change the
 * language to the closest match. E.g. if we support 'en' but only 'en-US' has
 * been published, then we want to set 'en-US' as the default to ensure it's
 * displayed within the language selector.
 *
 * If no reasonable match exists in the published data, we return the app's
 * compiled default. In this situation the language selector is expected to show
 * a placeholder value to ensure it's not  mispresentive of the returned data.
 */
function resolveMatchingLanguage(languages: api.Language[], language = '') {
	const match = languages.find(lang => lang.code === language);
	if (!match) {
		// If there isn't a direct match then loop through the available languages
		// looking for a suitable alternative.
		// e.g. Matching 'en-US' is fine if `language` was either 'en' or 'en-UK'.
		const langCode = Locale.getPrefixOfLanguage(language);
		const langCodeMatch = languages.find(lang => lang.code.startsWith(`${langCode}-`));
		if (langCodeMatch) return langCodeMatch.code;
	}
	// The provided language is suitable whether a match occured or not.
	return language;
}

/**
 * Run through all entries of the loaded sitemap and update any
 * templated paths to be in the format react router expects.
 *
 * Also define a path regex pattern string for these that can be turned to a regex as needed.
 * We don't define the regex to allow the redux state to still be serializable.
 */
function formatSitemap(sitemap) {
	return sitemap.map(entry => {
		if (~entry.path.indexOf('{')) {
			const pattern = entry.path.replace(/\{.+\}/, '([^\\?&#\\/]+)');
			entry.pattern = `^${pattern}$`;
			// change path to react router path template format
			entry.path = entry.path.replace(/({(.+)})/, ':$2');
		}
		return entry;
	});
}

function reduceAccountContentFilters(state: state.App, action: Action<api.Account>) {
	const account = action.payload;
	const contentFilters = copy(state.contentFilters);
	contentFilters.sub = account.subscriptionCode;
	contentFilters.accountSegments = (account.segments || []).slice();
	contentFilters.segments = combineSegments(
		state.config.general.defaultSegmentationTags,
		account.segments,
		state.contentFilters.profileSegments
	);
	return copy(state, { contentFilters });
}

function reduceAccountSegments(state: state.App, action: Action<any>) {
	const segments = action.payload.segments;
	const contentFilters = copy(state.contentFilters);
	contentFilters.accountSegments = (segments || []).slice();
	contentFilters.segments = combineSegments(
		state.config.general.defaultSegmentationTags,
		segments,
		state.contentFilters.profileSegments
	);
	return copy(state, { contentFilters });
}

function reduceProfileContentFilters(state: state.App, action: Action<api.ProfileDetail>) {
	const profile = action.payload;
	const defaultSegments = state.config.general.defaultSegmentationTags;

	let maxRating;
	if (profile && profile.maxRatingContentFilter) {
		maxRating = profile.maxRatingContentFilter.code;
	}
	const contentFilters = copy(state.contentFilters);
	contentFilters.maxRating = maxRating;

	contentFilters.profileSegments = combineSegments(defaultSegments, profile.segments, []);

	contentFilters.segments = combineSegments(defaultSegments, state.contentFilters.accountSegments, profile.segments);
	return copy(state, { contentFilters });
}

function combineSegments(defaultSegments: string[], accountSegments: string[], profileSegments: string[]): string[] {
	const segments = [...(defaultSegments || []), ...(accountSegments || []), ...(profileSegments || [])];
	return Array.from(new Set(segments)).sort(); // remove duplicates
}

function reduceSetContentFilters(state: state.App, action: Action<state.ContentFilters>) {
	return copy(state, { contentFilters: action.payload });
}

function reduceSessionContentFiltersReset(state: state.App) {
	const contentFilters: state.ContentFilters = copy(state.contentFilters);
	contentFilters.sub = initState.contentFilters.sub;
	contentFilters.maxRating = initState.contentFilters.maxRating;
	contentFilters.segments = initState.contentFilters.segments;
	contentFilters.accountSegments = initState.contentFilters.accountSegments;
	contentFilters.profileSegments = initState.contentFilters.profileSegments;

	if (!contentFilters.segments || contentFilters.segments.length === 0) {
		contentFilters.segments = state.config.general.defaultSegmentationTags;
	}
	return copy(state, { contentFilters });
}

/**
 * Update the responsive apps root element style
 */
export function reduceAppBackgroundImage(state: state.App, action) {
	return copy(state, { backgroundImage: action.payload });
}

export function reduceAppPrimaryData(state: state.App, action) {
	return copy(state, action.payload);
}

/**
 * Set an application level theme
 */
export function reduceAppTheme(state: state.App, action) {
	return copy(state, { theme: action.payload });
}

function reduceClearError(state: state.App, action) {
	return copy(state, { erroredActions: [] });
}

function reduceCountryCode(state: state.App, action) {
	const countryCode = get(action, 'payload.code') || '';
	return copy(state, { countryCode });
}

function transformFeatureToggle(customFields) {
	// regex pattern to match that key should start with 'Feature' and skip specific key FeatureToggle (will not skip FeatureToggle2 or FeatureToggleXX)
	const filterRegex = /^Feature(?!Toggle$)/;
	const featureFlags = {};
	Object.entries(customFields)
		.filter(([key]) => filterRegex.test(key))
		.forEach(([key, value]) => {
			featureFlags[key] = value;
		});
	const transformedFeatureToggle = copy(customFields.FeatureToggle, ...Object.values(featureFlags));
	return transformedFeatureToggle;
}
