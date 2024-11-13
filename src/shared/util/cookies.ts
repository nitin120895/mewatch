import * as localStorage from '../util/localStorage';

let parsedCookies = parseCookies();

export function cookiesEnabled() {
	if (typeof navigator === 'undefined') return false;
	return navigator.cookieEnabled;
}

export function setCookie(key: string, value: string, expiry?: Date) {
	if (typeof window === 'undefined') return;
	const expiryAt = expiry ? `; expires=${expiry.toUTCString()}` : '';
	document.cookie = `${key}=${encodeURIComponent(value)}; Path=/${expiryAt}`;
	parsedCookies[key] = value;
	if (_TV_) localStorage.setItem(key, value);
}

export function removeCookie(key: string) {
	if (typeof window === 'undefined') return;
	document.cookie = `${key}=''; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
	delete parsedCookies[key];
	if (_TV_) localStorage.removeItem(key);
}

export function getCookie(key: string, refresh = false) {
	if (typeof window === 'undefined') return;

	if (_TV_) {
		const value = localStorage.getItem(key);
		if (value !== undefined) return value;
	}

	if (refresh) refreshCookies();
	return parsedCookies[key];
}

export function refreshCookies() {
	parsedCookies = parseCookies();
}

function parseCookies() {
	if (typeof window === 'undefined') return {};

	return (document.cookie || '').split(/; */).reduce((data, kvp) => {
		const i = kvp.indexOf('=');
		if (i === -1) return data;
		const key = kvp.substr(0, i).trim();
		let value = kvp.substr(i + 1);
		if (value[0] === '"') value = value.slice(1, -1);
		if (data[key] === undefined) data[key] = decodeURIComponent(value);
		return data;
	}, {});
}
