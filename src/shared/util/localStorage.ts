export function setItem(key: string, value: any) {
	if (typeof window === 'undefined' || window.localStorage === null) return;
	const encoded = JSON.stringify(value);
	return window.localStorage.setItem(key, encoded);
}

export function getItem(key: string): any {
	if (typeof window === 'undefined' || window.localStorage === null) return;
	const encoded = window.localStorage.getItem(key);
	try {
		return JSON.parse(encoded);
	} catch (e) {
		return undefined;
	}
}

export function removeItem(key: string) {
	if (typeof window === 'undefined' || window.localStorage === null) return;
	return window.localStorage.removeItem(key);
}
