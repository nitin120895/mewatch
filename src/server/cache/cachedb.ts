import * as Redis from 'ioredis';
import settings from '../settings';
import { getKey } from '../util';
import * as log from '../logger';

let redis;

export function connectToCache(ready?) {
	if (!settings.redis.href) return;

	redis = new Redis(settings.redis.href, {
		keyPrefix: 'sgs:',
		retryStrategy: times => Math.min(times * 2, 5000),
		reconnectOnError: err => {
			// Once failover happens, Amazon ElastiCache will switch the master we're currently connected
			// with to a slave, leading to the following writes fails with the error READONLY. Using
			// reconnectOnError, we can force the connection to reconnect on this error in order
			// to connect to the new master.
			const targetError = 'READONLY';
			if (err.message.slice(0, targetError.length) === targetError) {
				return 1;
			}
		}
	} as any);

	redis.on('connect', () => log.info(`Redis connection established ${settings.redis.href}`));
	redis.on('ready', () => {
		log.info('Redis connection ready');
		if (ready) ready();
	});
	redis.on('reconnecting', () => log.warn('Redis reconnection attempt'));
	redis.on('error', err => log.error(err, 'Redis error'));
}

export function disconnectFromCache() {
	if (redis) redis.disconnect();
}

export function cacheAvailable() {
	return !!redis && redis.status === 'ready';
}

export function getCacheEntry(req) {
	if (!cacheAvailable()) return Promise.resolve();

	const key = getKey(req);
	return redis.hgetall(key).then(
		info => {
			if (info && info.result) {
				info.expireAt = Number(info.expireAt);
				return info;
			}
		},
		error => {
			log.error(error, 'Error getting cache entry');
		}
	);
}

export function getEntryDetails(req, res, result, errored) {
	const key = getKey(req);
	const ttl = getTtl(errored);
	const maxAge = settings.cachePubMaxAge;
	const expireAt = Date.now() + maxAge * 1000;
	const cacheable = expireAt > Date.now() && ttl > 0;
	const details: any = {
		key,
		ttl,
		cacheable,
		entry: {
			expireAt,
			maxAge,
			result,
			errored: !!errored,
			warmed: !!req._warmed
		}
	};
	return details;
}

export function getCacheEntryField(req, field) {
	if (!cacheAvailable()) return Promise.resolve();

	return getCacheEntryFields(req, [field]).then(results => {
		/* tslint:disable:no-null-keyword */
		return !results || results[0] === null ? undefined : results[0];
	});
}

export function getCacheEntryFields(req, fields) {
	if (!cacheAvailable()) return Promise.resolve();
	const key = getKey(req);
	return redis.hmget(key, fields).then(
		results => results,
		error => {
			log.error(error, `Error getting cache entry field: ${fields}`);
			return [];
		}
	);
}

export function setCacheEntry(details) {
	if (!cacheAvailable()) return Promise.resolve();

	return redis
		.pipeline()
		.hmset(details.key, details.entry)
		.expire(details.key, details.ttl)
		.exec();
}

export function updateCacheEntry(req, update) {
	if (!cacheAvailable()) return Promise.resolve();

	const key = getKey(req);
	return redis.hmset(key, update);
}

export function removeCacheEntry(req) {
	if (!cacheAvailable()) return Promise.resolve();

	const key = getKey(req);
	return redis.del(key);
}

function getTtl(errored) {
	// if we error, e.g. 404, then cache for short time
	// as may just be temp issue with services.
	// Note that when we get this type of error we're caching the
	// app shell so no big worry, we'd just like to server
	// render again if things correct themselves.
	// Turning off caching on errors could expose us to
	// a DDoS vector so short caching makes sense.
	return errored ? 20 : settings.cachePubMinTtl;
}
