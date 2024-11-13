import * as Redux from 'redux';
import { updateOnlineStatus } from './appWorkflow';
import DeviceModel from 'shared/util/platforms/deviceModel';

export type ConnectivitySubscriber = (online: boolean) => void;

const subscribers = new Set<ConnectivitySubscriber>();

let store: Redux.Store<state.Root>;

export function init(appStore: Redux.Store<state.Root>) {
	store = appStore;
	DeviceModel.monitorConnectivity(onConnectivityChange);
}

/**
 * True if the client has an active internet connection, false if not.
 */
export function isOnline() {
	return DeviceModel.isOnline();
}

/**
 * Listen to changes in connectivity.
 */
export function subscribe(listener: ConnectivitySubscriber) {
	if (typeof window === 'undefined') return;
	subscribers.add(listener);
}
/**
 * Stop listening to connectivity changes.
 */
export function unsubscribe(listener: ConnectivitySubscriber) {
	subscribers.delete(listener);
}

function onConnectivityChange() {
	const online = isOnline();
	store.dispatch(updateOnlineStatus(online));
	subscribers.forEach(sub => sub(online));
}
