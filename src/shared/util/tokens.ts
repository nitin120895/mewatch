import * as Redux from 'redux';
import { formatDate } from './dates';
import { base64Decode } from './crypto';
import * as cookies from './cookies';
import * as localStorage from './localStorage';
import * as sessionStorage from './sessionStorage';

const TOKENS_STORAGE_ID = 'session.tokens';
const SESSION_MARKER = 'ss';

/**
 * Remove any expired or old duplicated tokens.
 */
export function pruneTokens(tokens: api.AccessToken[]): api.AccessToken[] {
	tokens = removeExpiredToken(tokens);
	return removeDuplicateTokens(tokens);
}

export function removeExpiredToken(tokens: api.AccessToken[]): api.AccessToken[] {
	const now = Date.now();
	// Note that refreshable tokens are still refreshable after they expire
	// so we don't prune them here. This is actually not very desirable in a
	// web context where tokens are not held securely, but is the approach
	// supported currently.
	return tokens.filter(token => token.refreshable || token.expirationDate.getTime() > now);
}

export function removeDuplicateTokens(tokens: api.AccessToken[]): api.AccessToken[] {
	return Object.values(
		tokens.reduce((keepers, token) => {
			const key = `${token.type}${token.scope}`;
			if (!keepers[key] || keepers[key].expirationDate < token.expirationDate) {
				keepers[key] = token;
			}
			return keepers;
		}, {})
	);
}

export function hasToken(tokens: api.AccessToken[], type: TokenType, scope: TokenScope): boolean {
	return tokens.some(token => token.type === type && token.scope === scope);
}

export function findToken(
	tokens: api.AccessToken[],
	type: TokenType,
	scope: TokenScope | PlaybackTokenScope
): api.AccessToken {
	return tokens.find(token => token.type === type && token.scope === scope);
}

export function findTokenWithValue(tokens: api.AccessToken[], value: string): api.AccessToken {
	return tokens.find(token => token.value === value);
}

export function shouldRefreshToken(token: api.AccessToken): boolean {
	return token.refreshable && token.expirationDate.getTime() <= Date.now();
}

// Invalid token is not refreshable and has expired time
export function isInvalidToken(token: api.AccessToken): boolean {
	return !token.refreshable && token.expirationDate.getTime() <= Date.now();
}

export function updateSavedTokens(store: Redux.Store<state.Root>) {
	const session: state.Session = store.getState().session;
	saveTokens(session.tokens, session.remember);
}

export function updateSavedAuthTokens(store: Redux.Store<state.Root>) {
	const session: state.Session = store.getState().session;
	const tokens = session.tokens.filter(token => (token.scope as PlaybackTokenScope) !== 'Playback');
	saveTokens(tokens, session.remember);
}

export function saveTokens(tokens: api.AccessToken[], remember: boolean) {
	if (!tokens.length) {
		clearSavedTokens();
	} else {
		if (remember) {
			removeSessionMarker();
			removeOldSessionTokens();
		} else {
			addSessionMarker();
		}
		localStorage.setItem(TOKENS_STORAGE_ID, tokens);
	}
}

function removeSessionMarker() {
	localStorage.removeItem(SESSION_MARKER);
	if (cookies.cookiesEnabled()) {
		cookies.removeCookie(SESSION_MARKER);
	} else {
		sessionStorage.removeItem(SESSION_MARKER);
	}
}

function addSessionMarker() {
	localStorage.setItem(SESSION_MARKER, '1');
	if (cookies.cookiesEnabled()) {
		cookies.setCookie(SESSION_MARKER, '1');
	} else {
		sessionStorage.setItem(SESSION_MARKER, '1');
	}
}

function hasSessionMarker() {
	if (_TV_) {
		const marker = localStorage.getItem(SESSION_MARKER);
		if (marker) return true;
	}

	if (cookies.cookiesEnabled()) {
		return !!cookies.getCookie(SESSION_MARKER);
	} else {
		return !!sessionStorage.getItem(SESSION_MARKER);
	}
}

export function rememberMe() {
	return !!localStorage.getItem(TOKENS_STORAGE_ID) && !localStorage.getItem(SESSION_MARKER);
}

export function isSession() {
	return !!localStorage.getItem(SESSION_MARKER);
}

export function clearSavedTokens() {
	localStorage.removeItem(TOKENS_STORAGE_ID);
	localStorage.removeItem(SESSION_MARKER);
	removeSessionMarker();
}

export function getSavedTokens() {
	removeOldSessionTokens();
	const tokens = localStorage.getItem(TOKENS_STORAGE_ID);
	if (!tokens) return [];

	tokens.forEach(token => formatDate(token, 'expirationDate'));

	const prunedTokens = pruneTokens(tokens);
	if (tokens.length !== prunedTokens.length) {
		saveTokens(prunedTokens, rememberMe());
	}
	return prunedTokens;
}

/**
 * Format a token so its date is in Date format and we've resolved its scope.
 */
export function formatTokens(tokens: api.AccessToken[]): api.AccessToken[] {
	return tokens.map(formatToken);
}

function removeOldSessionTokens() {
	if (isSession() && !hasSessionMarker()) {
		clearSavedTokens();
		return [];
	}
}

function formatToken(token: api.AccessToken): api.AccessToken {
	formatDate(token, 'expirationDate');
	const body = decodeJwt(token);
	token.scope = <TokenScope>body.sub;
	token.profileId = body.userProfileId;
	return token;
}

export function decodeJwt(token: api.AccessToken): JwtAccountBody | JwtProfileBody {
	const encoded = token.value.split('.')[1];
	const decoded = base64Decode(encoded);
	return JSON.parse(decoded);
}

interface JwtAccountBody {
	aud: string;
	sub: string;
	exp: number;
	userAccountId: string;
	userProfileId: string;
	email: string;
	device: string;
	subscription: string;
	planId: string;
	kalturaSession: string;
	houseHoldId: number;
	ssoToken: string;
}

interface JwtProfileBody extends JwtAccountBody {
	defaultUserProfileId: string;
	firstLoginDate: number;
	lastLoginDate: number;
	sessionDate: number;
	sessionCount: number;
}
