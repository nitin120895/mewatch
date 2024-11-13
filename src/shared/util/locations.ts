/**
 * Check if one url location is comparable to the other.
 */
export function isSameLocation(locA: HistoryLocation, locB: HistoryLocation): boolean {
	if (!locA || !locB) return false;
	return !['pathname', 'search', 'hash'].some(prop => locA[prop] !== locB[prop]);
}

export function isQueryChange(locA: HistoryLocation, locB: HistoryLocation): boolean {
	if (!locA || !locB) return false;
	return locA.pathname === locB.pathname && locA.search !== locB.search;
}
