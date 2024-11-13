import * as connectivity from './connectivityMonitor';
import { getCachedPagePaths as getCachedPaths } from '../cache/persistentCache';

export type OfflineSubscriber = (offlineStatus: OfflineStatus) => void;

export class OfflineStatus {
	private subscribers = new Set<OfflineSubscriber>();
	private cachedPagePaths: Set<string>;

	constructor() {
		connectivity.subscribe(this.onConnectivityChange);
		this.refreshCachedPagePaths();
	}

	isOffline(): boolean {
		return !connectivity.isOnline();
	}

	getCachedPagePaths(): Set<string> {
		return this.cachedPagePaths;
	}

	refreshCachedPagePaths(): Promise<Set<string>> {
		return getCachedPaths().then(paths => (this.cachedPagePaths = paths));
	}

	/**
	 * Listen to changes in connectivity.
	 */
	subscribe(listener: OfflineSubscriber) {
		if (typeof window === 'undefined') return;
		this.subscribers.add(listener);
	}

	/**
	 * Stop listening to connectivity changes.
	 */
	unsubscribe(listener: OfflineSubscriber) {
		this.subscribers.delete(listener);
	}

	private onConnectivityChange = online => {
		this.refreshCachedPagePaths().then(paths => {
			this.subscribers.forEach(sub => sub(this));
		});
	};
}

const offlineStatus = new OfflineStatus();

export default offlineStatus;
