export function setItem(key: string, value: any) {
	if (typeof window === 'undefined') return;
	const encoded = JSON.stringify(value);
	return window.sessionStorage.setItem(key, encoded);
}

export function getItem(key: string): any {
	if (typeof window === 'undefined') return;
	const encoded = window.sessionStorage.getItem(key);
	return encoded !== undefined ? JSON.parse(encoded) : encoded;
}

export function removeItem(key: string) {
	if (typeof window === 'undefined') return;
	return window.sessionStorage.removeItem(key);
}

export class Storage<T> {
	constructor(private key: string) {}

	set(value: T): void {
		setItem(this.key, value);
	}

	get(): T | undefined {
		return getItem(this.key);
	}

	clear(): void {
		removeItem(this.key);
	}
}
