/// <reference path="conviva-core-sdk.d.ts" />

export class ConvivaHtml5Storage implements Conviva.StorageInterface {
	saveData(storageSpace: string, storageKey: string, data: string, callback: Conviva.StorageSaveDataCallback): void {
		const localStorageKey = storageSpace + '.' + storageKey;
		try {
			window.localStorage.setItem(localStorageKey, data);
			callback(true, data);
		} catch (e) {
			callback(false, e.toString());
		}
	}

	loadData(storageSpace: string, storageKey: string, callback: Conviva.StorageLoadDataCallback): void {
		const localStorageKey = storageSpace + '.' + storageKey;
		try {
			const data = window.localStorage.getItem(localStorageKey);
			callback(true, data);
		} catch (e) {
			callback(false, e.toString());
		}
	}

	release(): void {}
}
