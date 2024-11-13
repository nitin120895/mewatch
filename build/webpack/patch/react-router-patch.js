/**
 * This patch of react router allows us to use a function to lazy
 * define a route's path. We need this as while we know the keys
 * for all of our static page routes, the paths can be dynamically
 * defined in Presentation Manager and we load these up at app launch.
 */
const PATCH = `
	if (typeof route.getPath === 'function') route.path = route.getPath(route, location)
`;
module.exports = function(source) {
	return source.replace(/((let|var) pattern = route.path \|\| '';?)/, `${PATCH}$1`);
};
