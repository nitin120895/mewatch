import settings from '../settings';
import * as log from '../logger';
import { getCacheEntryFields, updateCacheEntry, removeCacheEntry } from './cachedb';
import { resolvePage } from '../page';

/**
 * Rules around cache warming.
 *
 * ## Determine whether to warm entry
 *
 * Given a path and filters:
 * - Call redis and check if entry exists.
 * - If it does then check how long until it expires
 * - If its marked as currently refreshing do nothing
 * - If it expires soon (next minutes) then refresh it
 * - When refreshing, mark it as refreshing
 * - When refresh is complete update it and remove refresh marker
 *
 * ## Determine next refresh time
 *
 * For each entry:
 *
 * - Grab its expiry from redis
 * - If it doesn't exist then load it and set its expiry ttl and return time remaining as ttl - WINDOW
 * - If it exists and has less than WINDOW until ttl, refresh it and return time remaining as ttl - WINDOW
 * - If it exists but has more then (WINDOW) until ttl then return its time remaining - WINDOW
 * - To determine the next check time, run through time remaining and get lowest.
 * - Gen random number between min: low value and max: low value + WINDOW - 30 seconds.
 * - Use this as refresh check delay.
 */

let pathsToWarm;
try {
	pathsToWarm = JSON.parse(process.env.CACHE_WARM || '[]');
} catch (e) {
	pathsToWarm = [];
}

const WINDOW_MSEC = 60000; // 1 min
const WINDOW_MIN_MSEC = WINDOW_MSEC - 30000; // give 30 sec head room to avoid dropping cache during a warming
const TTL_MSEC = settings.cachePubMinTtl * 1000;
const TTL_MINUS_MAX_AGE_MSEC = TTL_MSEC - settings.cachePubMaxAge * 1000;
const MIN_CHECK_MSEC = TTL_MSEC - WINDOW_MSEC;

export function warmCache() {
	// cache warm churn will be pretty high if TTL is less than at least 2 mins so abort
	if (!pathsToWarm.length || settings.cachePubMinTtl < 120) return;

	log.info(pathsToWarm, 'cache warming endabled');
	checkCacheWarm();
}

async function checkCacheWarm() {
	try {
		const expiryTimes = await checkCache();
		expiryTimes.sort();
		const minCheckTime = Number(expiryTimes[0]);
		const maxCheckTime = minCheckTime + WINDOW_MIN_MSEC;
		const delay = getNextCheckTime(minCheckTime, maxCheckTime);
		// keeping commented out so easy for others to debug later if need be
		// console.log(expiryTimes, minCheckTime, maxCheckTime, delay);
		setTimeout(() => checkCacheWarm(), delay);
	} catch (e) {
		log.error(e, 'Cache warming failed, disabling');
	}
}

function checkCache() {
	return Promise.all(
		pathsToWarm.map(async p => {
			const req = fakeReq(p);
			const props = await getCacheEntryFields(req, ['expireAt', 'updating', 'errored']);
			const updating = props[1] === 'true';
			const errored = props[2] === 'true';

			if (updating || errored) return Promise.resolve(MIN_CHECK_MSEC);

			const expireAt = Number(props[0]);
			const dropAt = expireAt + TTL_MINUS_MAX_AGE_MSEC;
			const now = Date.now();
			const inCache = dropAt > now;
			const msecRemaining = dropAt - now;
			const expiringSoon = msecRemaining <= WINDOW_MSEC;

			if (!inCache || expiringSoon) {
				// keeping commented out so easy for others to debug later if need be
				// console.log('in cache', inCache, 'expiringSoon', expiringSoon, 'msecRemaining', msecRemaining, 'expireAt', expireAt, 'now', now);
				await updateCacheEntry(req, { updating: true });
				return new Promise((resolve, reject) => {
					const res = fakeRes(inCache, () => {
						updateCacheEntry(req, { updating: false })
							.then(() => resolve(MIN_CHECK_MSEC))
							.catch(error => {
								return removeCacheEntry(req).then(
									() => {
										reject(error);
									},
									error => {
										reject(error);
									}
								);
							});
					});
					resolvePage(req, res, () => {});
				});
			} else {
				// in cache so check back when it's about to expire
				return Promise.resolve(Math.max(0, msecRemaining - WINDOW_MSEC));
			}
		})
	);
}

function fakeReq(p) {
	const req = {
		method: 'GET',
		path: p.path,
		url: p.path,
		acceptsLanguages: () => {},
		get: () => {},
		headers: {
			host: 'www.domain.com'
		},
		cookies: fakeContentFilterCookie(p),
		_warmed: true,
		log: log
	};
	return req;
}

function fakeContentFilterCookie(p) {
	if (!p.sub || p.sub === 'Anonymous') return {};

	const contentFilters = `s:${p.sub}`;
	return { cf: contentFilters };
}

function fakeRes(stale, done) {
	return {
		setHeader: () => {},
		finished: stale,
		cacheWarmer: true,
		status: () => ({ send: done }),
		send: done,
		end: done,
		redirect: () => done()
	};
}

function getNextCheckTime(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
