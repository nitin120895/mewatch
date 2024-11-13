import { getCacheEntry, updateCacheEntry } from './cachedb';
import * as log from '../logger';
import * as newrelic from 'newrelic';

/**
 * Cache check middleware.
 */
export function cacheCheck(req, res, next) {
	getCacheEntry(req)
		.then(entry => {
			if (!entry) cacheMiss(res, next);
			else if (Date.now() < entry.expireAt) cacheHit(entry, req, res);
			else cacheStaleHit(entry, req, res, next);
		})
		.catch(e => {
			log.error(e, 'Error checking cache');
			cacheMiss(res, next);
		});
}

function cacheMiss(res, next) {
	newrelic.addCustomAttribute('cache', 'miss');

	res.setHeader('X-Slingshot.cache', 'MISS');
	next();
}

function cacheHit(entry, req, res) {
	newrelic.addCustomAttribute('cache', 'hit');
	newrelic.addCustomAttribute('cacheWarmed', entry.warmed);

	res.setHeader('X-Slingshot.cache', 'HIT');
	res.status(200).send(entry.result);
}

function cacheStaleHit(entry, req, res, next) {
	newrelic.addCustomAttribute('cache', 'stale hit');
	newrelic.addCustomAttribute('cacheWarmed', entry.warmed);

	entry.maxAge = 0;
	res.setHeader('X-Slingshot.cache', 'STALE HIT');
	res.status(200).send(entry.result);
	if (entry.updating !== 'true') {
		updateCacheEntry(req, { updating: true });
		next();
	}
}
