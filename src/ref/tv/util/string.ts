export function convertArrayToString(array: any[], separator: string) {
	let ret = '';

	if (array && array.length > 0) {
		for (let i = 0; i < array.length - 1; i++) {
			ret += array[i] + separator;
		}

		ret += array[array.length - 1];
	}

	return ret;
}

export function createQueryString(query) {
	const names = Object.keys(query || {});
	if (!names.length) return '';
	const params = names
		.map(name => ({ name, value: query[name] }))
		.reduce((acc, value) => {
			if (Array.isArray(value.value)) {
				return acc.concat(value.value);
			} else {
				acc.push(createQueryParam(value.name, value.value));
				return acc;
			}
		}, []);
	return '?' + params.sort().join('&');
}

function createQueryParam(name: string, value: string) {
	const v = formatParam(value);
	if (v && typeof v === 'string') return `${name}=${encodeURIComponent(v)}`;
	return name;
}

function formatParam(param: any): string | string[] {
	/* tslint:disable:no-null-keyword */
	if (param === undefined || param === null) return '';
	else if (param instanceof Date) return param.toJSON();
	else if (Array.isArray(param)) return param;
	else return param.toString();
}
