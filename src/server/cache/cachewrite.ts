import * as log from '../logger';
import { getEntryDetails, setCacheEntry, getCacheEntryField, removeCacheEntry } from './cachedb';

export function addCache(req, res, result, errored) {
	if (!cacheable(req, result)) return Promise.resolve();

	return addCacheEntry(req, res, result, errored).catch(error => {
		log.error(error, 'Error adding cache entry');
	});
}

function addCacheEntry(req, res, result, errored) {
	const details = getEntryDetails(req, res, result, errored);
	if (details.cacheable) {
		return setCacheEntry(details);
	}
	return Promise.resolve();
}

export function updateCache(req, result) {
	if (!cacheable(req, result)) return Promise.resolve();

	return updateCacheEntry(req, result).catch(error => {
		log.error(error, 'Error updating cache entry');
	});
}

export function updateCacheEntry(req, result) {
	return getCacheEntryField(req, 'expireAt').then(expireAt => {
		if (!expireAt) return;

		const details = getEntryDetails(req, undefined, result, false);
		if (details.cacheable) {
			const entry = details.entry;
			entry.updating = false;
			return setCacheEntry(details);
		} else {
			removeCacheEntry(req);
		}
	});
}

function cacheable(req, result) {
	return !!result && req.method === 'GET';
}
