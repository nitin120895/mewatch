/**
 * Given the set of cached pages, determine their paths.
 *
 * This indicates the pages we can route to when offline.
 */
export function getCachedPagePaths() {
	const set = new Set();
	if (typeof window === 'undefined' || !window['caches']) {
		return Promise.resolve(set);
	}
	const url = document.createElement('a'); // used to parse urls
	return window['caches']
		.open('services')
		.then(cache => {
			return cache.keys().then(keys => {
				keys.forEach(req => {
					url.href = req.url;
					if (url.pathname.endsWith('/page')) {
						const param = (url.search || '').split('&').find(seg => seg.startsWith('path='));
						if (param) {
							const value = param.slice(param.indexOf('=') + 1);
							const path = decodeURIComponent(value);
							set.add(path);
						}
					}
				});
				return set;
			});
		})
		.catch(() => set);
}

/**
 * Remove all cached service responses from Rocket.
 */
export function clearServiceCache() {
	if (typeof window === 'undefined' || !window['caches']) {
		return Promise.resolve();
	}
	return window['caches']
		.open('services')
		.then(cache => cache.keys().then(keys => keys.forEach(req => cache.delete(req))))
		.catch(() => {});
}
