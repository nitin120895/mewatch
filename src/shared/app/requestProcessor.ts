import * as Redux from 'redux';
import { refreshToken } from '../service/action/authorization';
import { findTokenWithValue } from '../util/tokens';
import { SERVICE_ERROR } from './errors';
import { getClientService } from './environmentUtil';
import { formatDate } from '../service/gateway';
import { handleUnauthorizedError } from '../account/sessionWorkflow';
import {
	INVALID_ACCESS_TOKEN,
	INVALID_PASSWORD,
	INVALID_PIN,
	UNAUTHORIZED_ERROR,
	WRONG_USERNAME_PASSWORD
} from '../util/errorCodes';
import { get } from '../util/objects';
import { getFilterWithDefaultSegment } from '../list/listWorkflow';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { ESearch } from 'shared/page/pageKey';
import { isEnhancedSearchEnabled } from 'toggle/responsive/util/enhancedSearchUtil';

const SERVICE_FEATURE_FLAGS = 'idp,ldp,rpt,cd';
const ENHANCED_SEARCH_FEATURE_FLAGS = 'es,idp,ldp,rpt,cd';

const PATH_WITH_UPDATE_QUERY_PARAMS = [
	'/account/items/{id}/videos',
	'/account/items/{id}/videos-guarded',
	'/account/items/{id}/start-over',
	'/items/{id}/videos',
	'/items/{itemId}/next',
	'/account/profile/items/{itemId}/next'
];
const PATH_TO_INCLUDE_USER_SEGMENT = ['/page', '/config'];
/**
 * Add device, subscription code and max classification when requesting feeds.
 *
 * Also update baseUrl to target CDN if a public GET.
 */
export function processRequest(
	store: Redux.Store<state.Root>,
	op: api.OperationInfo,
	reqInfo: api.RequestInfo
): api.RequestInfo {
	const params = reqInfo.parameters;
	if (params && params.query) {
		const state = store.getState();
		params.query.lang = state.app.i18n.lang || process.env.CLIENT_DEFAULT_LOCALE;

		const requireUserSegment = PATH_TO_INCLUDE_USER_SEGMENT.includes(op.path);
		if (PATH_WITH_UPDATE_QUERY_PARAMS.includes(op.path) || (op.method === 'get' && !op.security)) {
			const filters = requireUserSegment ? state.app.contentFilters : getFilterWithDefaultSegment(state);
			params.query = updateQueryParams(params.query, filters);
		}

		const currentPath = get(state, 'page.history.location.pathname');
		const eSearchPath = getPathByKey(ESearch, state.app.config);
		const isPageApi = op.path.includes('page');
		const isESearchPage = isPageApi && currentPath === eSearchPath;

		const isESearchEnabled = isEnhancedSearchEnabled(state);
		const isRecommendedESearch = isESearchEnabled && op.path.includes('search');

		if (isESearchPage || isRecommendedESearch) {
			params.query.ff = ENHANCED_SEARCH_FEATURE_FLAGS;
		} else if (!op.path.includes('reminders')) {
			params.query.ff = SERVICE_FEATURE_FLAGS;
		}
	}

	if ((op.method === 'post' && op.path === '/register') || (op.method === 'patch' && op.path === '/account')) {
		const body = reqInfo.parameters.body.body;
		if (body && body.dateOfBirth) {
			body.dateOfBirth = formatDate(new Date(body.dateOfBirth), 'date');
		}
	}

	reqInfo.baseUrl = getServiceBaseUrl(op.method, !!op.security);

	return reqInfo;
}

export function updateQueryParams(query, filters: state.ContentFilters, serialize = true) {
	if (filters.device && !query.device) query.device = filters.device;
	if (filters.sub) query.sub = filters.sub;
	if (filters.maxRating) query['max_rating'] = filters.maxRating;
	if (filters.segments && filters.segments.length) {
		query.segments = serialize ? filters.segments.join(',') : filters.segments;
	}
	return query;
}

export function getServiceBaseUrl(httpMethod: string, secure: boolean) {
	// We only put non-auth GET calls made from the browser through the CDN.
	const currentService = getClientService();
	if (!_SERVER_ && httpMethod === 'get' && !secure) {
		return currentService.rocketCDN || currentService.rocket;
	} else {
		return currentService.rocket;
	}
}

export function processResponse(
	store: Redux.Store<state.Root>,
	req: api.ServiceRequest,
	res: api.Response<any>,
	attempt: number
): Promise<api.ResponseOutcome> {
	if (!res.error) return Promise.resolve({ res });

	// MEDTOG-7099: if we dispatch SERVICE_ERROR action in Slingshot, app will be killed
	// and there will be 502 error on the client
	if (!_SERVER_)
		store.dispatch({
			type: SERVICE_ERROR,
			payload: {
				request: req,
				error: res.data,
				response: res
			}
		});

	// Refresh token then retry original call
	if (attempt === 1 && isTokenExpiredError(req, res)) {
		const tokenValue = getRequestTokenValue(req);
		const session: state.Session = store.getState().session;
		const token = findTokenWithValue(session.tokens, tokenValue);
		if (token && token.refreshable) {
			const cookieType: api.CookieType = session.remember ? 'Persistent' : 'Session';
			if (session.refreshInProgress) {
				return new Promise((resolve, reject) => {
					const unsubscribe = store.subscribe(() => {
						const state = store.getState();
						if (!state.session.refreshInProgress) {
							unsubscribe();
							resolve({ retry: true, res });
						}
					});
				});
			}
			return store.dispatch(refreshToken({ token: tokenValue, cookieType })).then(action => {
				// If refresh token failed log the user out.
				return !action.error
					? { retry: true, res }
					: store.dispatch(handleUnauthorizedError({ ...res.data }, action.payload)).then(() => ({ res }));
			});
		}
	}

	if (isUnauthorizedError(req, res)) {
		const { session } = store.getState();
		const token = findTokenWithValue(session.tokens, getRequestTokenValue(req));
		if (token && (token.type === 'UserAccount' || token.type === 'UserProfile')) {
			// In case if auth tokens are not valid we need to acquire new ones through signin page
			return store.dispatch(handleUnauthorizedError({ ...res.data })).then(() => ({ res }));
		}
	}

	return Promise.resolve({ res });
}

function getRequestTokenValue(req: api.ServiceRequest): string {
	const authorizationHeader = getAuthorizationHeader(req);
	return authorizationHeader && authorizationHeader.split('Bearer ').pop();
}

function getAuthorizationHeader(req: api.ServiceRequest): string {
	return req.headers['X-Authorization'] || req.headers['Authorization'];
}

function isTokenExpiredError(req: api.ServiceRequest, res: api.Response<any>) {
	return !_SERVER_ && res.raw.status === UNAUTHORIZED_ERROR && !!res.data && res.data.code === INVALID_ACCESS_TOKEN;
}

function isUnauthorizedError(req: api.ServiceRequest, res: api.Response<any>) {
	const code = get(res, 'data.code');
	const ignoredErrorCodes = [INVALID_PASSWORD, WRONG_USERNAME_PASSWORD, INVALID_PIN];
	return (
		!_SERVER_ &&
		res.raw.status === UNAUTHORIZED_ERROR &&
		!!getAuthorizationHeader(req) &&
		!ignoredErrorCodes.includes(code)
	);
}

// Only called when request promise fails - which means network failure or other error
// So there is no useful response object
export function processError(
	store: Redux.Store<state.Root>,
	request: api.ServiceRequest,
	response: { res: api.Response<Error> }
): Promise<api.ResponseOutcome> {
	store.dispatch({ type: SERVICE_ERROR, payload: { request, error: response.res.data } });
	return Promise.resolve({ res: response.res, retry: false });
}
