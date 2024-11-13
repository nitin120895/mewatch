import { isArray } from '../../util/objects';

export const getUserAgent = () => navigator.userAgent;
export const getEnvironment = () => getHostName(process.env.CLIENT_SERVICE_URL);
export const getReferrer = () => document.referrer;
export const windowLocation = () => window.location.href;

export const getLocale = () => navigator.language;

export function getHostName(url: string) {
	const match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
	if (isArray(match)) {
		if (match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
			return match[2];
		}
	}
	return 'unknown';
}
