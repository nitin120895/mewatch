export interface LocationObject {
	protocol?: string;
	host?: string;
	pathname?: string;
	search?: string;
}

export function isExternalUrl(to: LocationObject | string): boolean {
	if (typeof to === 'string') return !!to && (to.startsWith('http') || to.startsWith('www.'));
	return !!to && !!to.host && (to.host.startsWith('http') || to.host.startsWith('www.'));
}

export function getExternalUrl(to: LocationObject): string {
	const { protocol, host, pathname, search } = to;
	return `${protocol}://${host}${pathname || ''}${search || ''}`;
}

export function queryStringToObject(queryString) {
	const pairs = queryString.substring(1).split('&');

	let array = pairs.map(el => {
		const parts = el.split('=');
		return parts;
	});

	return (<any>Object).fromEntries(array);
}
