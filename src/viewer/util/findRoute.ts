/**
 * Finds a matching route given an absolute path
 */
export default function findRoute(absolutePath: string, route: any, parentPath = ''): any {
	if (absolutePath.charAt(0) !== '/') absolutePath = '/' + absolutePath;
	const path = parentPath + route.path;
	// Match found
	if (absolutePath === path || absolutePath === '/') return route;
	// Recursively look for a match in the children tree
	let match;
	const partialMatch = ~absolutePath.indexOf(path);
	if (partialMatch && route.childRoutes && route.childRoutes.length > 0) {
		for (let childRoute of route.childRoutes) {
			match = findRoute(absolutePath, childRoute, parentPath + route.path + (route.path !== '/' ? '/' : ''));
			if (match) return match;
		}
	}
	// No match
	return undefined;
}
