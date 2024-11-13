import * as Redux from 'redux';
import { getCountryCode, initClientState } from './appWorkflow';
import { initPlayerState } from './playerWorkflow';
import { getAppConfig } from '../service/action/app';
import * as pagePersistence from '../page/pagePersistence';
import * as routeUtil from './routeUtil';
import { getSavedTokens, rememberMe } from '../util/tokens';
import { copy } from '../util/objects';
import * as authorizer from '../account/authorizer';
import * as serviceGateway from '../service/gateway';
import { updateLocale } from './appWorkflow';
import { initTokens, autoSignIn, clearCookies } from '../account/sessionWorkflow';
import { clearCache } from '../cache/cacheWorkflow';
import * as accountUtil from '../account/accountUtil';
import * as profileUtil from '../account/profileUtil';
import * as playerUtil from 'toggle/responsive/util/playerUtil';
import * as subscriptionUtil from 'toggle/responsive/util/subscriptionUtil';
import * as cacheInvalidator from '../cache/cacheInvalidator';
import * as requestProcessor from './requestProcessor';
import * as globalErrors from './globalErrors';
import * as guidingTips from '../guides/guidingTipsConsumer';
import * as connectivityMonitor from './connectivityMonitor';
import * as userActivityMonitor from './userActivityMonitor';
import configStore from '../configStore';
import { loadServices, getClientService } from './environmentUtil';
import * as Locale from './localeUtil';
import * as Volume from '../util/volume';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import { setDefaultImageTypesForItemTypes } from '../util/images';
import { checkIsTouchDevice } from 'shared/util/browser';
import { showNotifications } from 'shared/notifications/notificationWorkflow';
import * as stateUtil from 'shared/analytics/util/stateUtil';
import * as boost from 'shared/analytics/boost/boost';

export interface AppOptions {
	/**
	 * When set to true, scroll position will not be reset to 0 when
	 * PUSHing child pages (season + episode) of a show page onto
	 * the browser history.
	 */
	retainShowDetailScroll?: boolean;
}

const CONFIG_INCLUDES: any = [
	'classification',
	'subscription',
	'sitemap',
	'navigation',
	'general',
	'i18n',
	'playback',
	'linear',
	'advertisment',
	'personalisation'
];

if (_DEV_) {
	if (typeof window !== 'undefined') window.Perf = require('react-addons-perf');
}

let started = false;
let store: Redux.Store<state.Root>;

export default async function startup(rootNode: HTMLElement, middleware?: any[], options?: AppOptions): Promise<any> {
	if (_TV_ && _DISCOVER_) {
		loadServices();
	}

	checkIsTouchDevice();

	if (started) {
		initStoreConsumers(store);
		return store;
	}

	started = true;
	userActivityMonitor.init();
	fullscreenService.init();
	store = configStore(undefined, middleware);
	initStoreConsumers(store);
	initServiceGateway(store);

	const tokens = getSavedTokens();
	if (tokens.length) store.dispatch(initTokens(tokens));

	const state: state.Root = store.getState();
	const serverContentFilters = copy(state.app.contentFilters);

	let initalLanguage: string;
	try {
		initalLanguage = await Locale.getInitialLanguage(state);
	} catch (e) {
		initalLanguage = Locale.defaultLocale;
	}

	store.dispatch(
		initClientState({
			lang: initalLanguage,
			rememberMe: rememberMe(),
			online: connectivityMonitor.isOnline(),
			profileSelected: profileUtil.isProfileSelected(),
			retainShowDetailScroll: !!options && !!options.retainShowDetailScroll
		})
	);

	// Get Max Resolution relative to DRM capabilities of device
	let maxDRMResolution = await playerUtil.maxAllowedResolution();

	let volume = state.player.volume || Volume.getVolume();
	if (!volume && volume !== 0) volume = Volume.DEFAULT_VOLUME;
	const thumbnailVisible = false;

	store.dispatch(initPlayerState({ volume, thumbnailVisible, maxDRMResolution }));

	return store.dispatch(autoSignIn()).then(() => {
		const state: state.Root = store.getState();
		const mismatch = contentFiltersMismatch(serverContentFilters, state.app.contentFilters);

		const batch = [];
		if (mismatch) {
			// If mismatch and we don't have a session then should clear out old cookies
			if (!state.session.tokens.length) {
				batch.push(store.dispatch(clearCookies()));
			}
			batch.push(store.dispatch(clearCache()));
		}
		// Check the sitemap length, if it has a length then we've server rendered
		if (mismatch || !state.app.config.sitemap.length) {
			batch.push(store.dispatch(getAppConfig({ include: CONFIG_INCLUDES })));
		} else {
			// if we don't load config, we should update default image types from stored config after server side rendering
			if (state.app.config.general.itemImageTypes) {
				setDefaultImageTypesForItemTypes(state.app.config.general.itemImageTypes);
			}
		}

		return Promise.all(batch).then(values => {
			const state = store.getState();
			store.dispatch(updateLocale(state.app.i18n.lang, true));
			store.dispatch(getCountryCode());
			if (!_SSR_) store.dispatch(showNotifications());
			if (mismatch) clearServerRender(rootNode);
			return store;
		});
	});
}

/**
 * If our server render has not been in sync with the content filters
 * that should have been used during the render, then we clear the dom
 * and allow the client to do the full first render. Clearing the dom avoids
 * any checksum errors from React during the initial render.
 *
 * This situation can happen if the user's cookies which contain the content filters
 * are out of date, for example if they've changed their subscription since last visit
 * or their token fails to refresh.
 *
 * This situation should not happen very often and when it does the impact visually
 * is usually quite minimal.
 */
function clearServerRender(node) {
	while (node && node.lastChild) {
		node.removeChild(node.lastChild);
	}
}

export function serverStartup(contentFilters: state.ContentFilters, req: any, middleware?: any[]): Promise<any> {
	const serverHeaders = {
		'x-request-id': req.get('X-Request-Id'),
		'x-rocket.cache': 'nostale'
	};

	const lang = Locale.getSavedLanguagePreference(req);
	const store = configStore(undefined, middleware);
	initStoreConsumers(store);
	initServiceGateway(store, serverHeaders);

	store.dispatch(
		initClientState({
			contentFilters,
			online: connectivityMonitor.isOnline(),
			lang
		})
	);

	let volume = Volume.getVolume(req);
	if (!volume && volume !== 0) volume = Volume.DEFAULT_VOLUME;

	const thumbnailVisible = false;
	store.dispatch(initPlayerState({ volume, thumbnailVisible }));

	const batch = [
		store.dispatch(updateLocale(lang, true)),
		store.dispatch(getAppConfig({ include: CONFIG_INCLUDES, segments: ['all'] }))
	];
	return Promise.all(batch).then(values => store);
}

function contentFiltersMismatch(serverFilters: state.ContentFilters, clientFilters: state.ContentFilters) {
	const mismatch = !contentFiltersMatch(serverFilters, clientFilters);
	if (_DEV_ && _SSR_) {
		if (mismatch) {
			console.error('Server render content filter mismatch, forcing client redraw');
			console.warn('serverFilters', serverFilters, 'clientFilters', clientFilters);
		}
	}
	return mismatch;
}

function contentFiltersMatch(a: state.ContentFilters, b: state.ContentFilters): boolean {
	let match = a.sub === b.sub && a.maxRating === b.maxRating;
	match = match && (a.segments || []).join(',') === (b.segments || []).join(',');
	return match;
}

/**
 * On the server we can't retain a static reference to the store as we
 * need to build stores per request.
 *
 * This means our store consumers get passed a stub reference of the store.
 * This avoids them throwing when accessing the store, but means this access
 * is mostly non-functional on the server.
 *
 * It is important to remember that any store consumer should NOT have a
 * dependency on the store that needs to run successfully during a server side render.
 */
function initStoreConsumers(store: Redux.Store<state.Root>) {
	if (typeof window === 'undefined') {
		store = configStore({});
	}
	boost.init(store);
	guidingTips.init(store);
	globalErrors.init(store);
	connectivityMonitor.init(store);
	routeUtil.init(store);
	pagePersistence.init(store);
	authorizer.init(store);
	accountUtil.init(store);
	profileUtil.init(store);
	playerUtil.init(store);
	cacheInvalidator.init(store);
	stateUtil.init(store);
	subscriptionUtil.init(store);
}

function initServiceGateway(store, headers?: { [id: string]: string }) {
	const service = getClientService();
	serviceGateway.init({
		url: service.rocket,
		getAuthorization: authorizer.getAuthorization,
		processRequest: requestProcessor.processRequest.bind(requestProcessor, store),
		processResponse: requestProcessor.processResponse.bind(requestProcessor, store),
		processError: requestProcessor.processError.bind(undefined, store),
		fetchOptions: createFetchOptions(headers),
		// When basic authentication is enabled in Slingshot to restrict access to the site
		// it can interfere with authenticated Fetch requests sent to Rocket in some browsers.
		// For example certain versions of IE, Edge and Safari will replace the
		// Authorization header containing a JWT token with the basic authentication credentials.
		// To avoid this we use the header `X-Authorization` instead of `Authorization`.
		// Rocket can accept either.
		authorizationHeader: 'X-Authorization'
	});
}

let fetchOptions;

function createFetchOptions(headers?: { [id: string]: string }) {
	if (fetchOptions) return fetchOptions;
	if (_SERVER_) {
		const url = process.env.CLIENT_SERVICE_URL;
		const https = url.startsWith('https') ? require('https') : require('http');
		const agent = new https.Agent({ keepAlive: true });
		fetchOptions = { agent };
	} else {
		fetchOptions = {
			// We have to use cors and not `same-origin` as we make requests
			// to a different subdomain for CDN (public) service calls.
			mode: 'cors',
			// We only want cookies being sent to the same origin as the
			// website is served from, i.e. not being sent to CDN service calls.
			// As well as not sending cookies when not needed it's also important for security.
			credentials: 'same-origin'
		};
	}
	if (headers) fetchOptions.headers = headers;
	return fetchOptions;
}
