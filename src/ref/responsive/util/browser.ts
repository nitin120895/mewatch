export function parseQueryParams(query: string): any {
	if (!query || query.length === 0 || !query.startsWith('?')) return {};

	const params = {};
	query
		.slice(1)
		.split('&')
		.forEach(paramString => {
			const param = paramString.split('=');
			params[param[0]] = param[1];
		});
	return params;
}
