// Returns the current router path (or hash) including any surplus query parameters
export const getCurrentPath = (url = window.location.hash) => {
	return url.substr(~url.indexOf('#') ? url.indexOf('#') : 0);
};

// Returns a cleaned path by discarding any query string which may be on the end
// such as the React Router hash state.
export const cleanPath = path => {
	return ~path.indexOf('?') ? path.substr(0, path.indexOf('?')) : path;
};

// Determine whether the new path differs in a meaninful way from the old path.
export const hasPathChanged = (curPath: string, newPath: string): boolean => {
	if (curPath !== newPath) {
		const i = curPath.indexOf(newPath);
		// The path is either entirely different, or is similar but has a different subpath.
		if (i === -1 || (i === 0 && newPath.length !== curPath.length)) {
			return true;
		}
	}
	return false;
};
