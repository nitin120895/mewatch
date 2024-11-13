import * as cookies from '../util/cookies';

export const DEFAULT_VOLUME = 0.5;
const VOLUME_COOKIE_FIELD = 'volume';
const Volume_COOKIE_EXPIRY = new Date(2070, 12);

/**
 * Retrieve the saved volume preference a user has previously set.
 *
 * @param {*} [req] if on the server this should be the active request object
 */
export function getVolume(req?): number {
	if (_SERVER_) {
		if (!req || !req.cookies) return;
		return Number(req.cookies[VOLUME_COOKIE_FIELD]);
	}
	if (cookies.cookiesEnabled()) {
		return Number(cookies.getCookie(VOLUME_COOKIE_FIELD));
	}
}

/**
 * Save player volume preference for future usage.
 *
 * @param {number} volume the player volume to retain
 */
export function saveVolume(volume: number) {
	if (cookies.cookiesEnabled()) {
		return cookies.setCookie(VOLUME_COOKIE_FIELD, volume.toString(), Volume_COOKIE_EXPIRY);
	}
}
