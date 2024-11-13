import { Dispatch } from 'redux';
import { PAGE_CHANGE } from 'shared/page/pageWorkflow';
import { getPage } from 'shared/service/app';
import { getPathByPageKey } from 'shared/app/routeUtil';
import { getItem as getLocalStorageItem, setItem as setLocalStorageItem } from 'shared/util/localStorage';
import * as PageKey from 'shared/page/pageKey';
import { shouldShowNotification } from 'toggle/responsive/util/modalUtil';
import { SHOW_PASSIVE_NOTIFICATION } from '../uiLayer/uiLayerWorkflow';

export const SHOW_NOTIFICATIONS = 'notifications/GET_NOTIFICATIONS';
export const DISMISS_NOTIFICATION = 'notifications/DISMISS_NOTIFICATION';

const DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY = 'dismissed_notifications';

const initState: state.Notifications = {
	show: false,
	entries: [],
	position: 'top'
};

type DismissNotificationActionPayload = string;
type ShowNotificationsActionPayload = { page: api.Page; position?: NotificationPosition };
type ShowPassiveNotificationsActionPayload = { config: PassiveNotificationConfig };

type NotificationActions =
	| Action<ShowNotificationsActionPayload>
	| Action<ShowPassiveNotificationsActionPayload>
	| Action<DismissNotificationActionPayload>
	| Action<HistoryLocation>;

let notificationsPath: string = undefined;

const getNotificationsPath = (): string | false => {
	if (notificationsPath === undefined) {
		const path = getPathByPageKey(PageKey.Notification);
		if (!path) return false;
		notificationsPath = path;
	}

	return notificationsPath;
};

export function showNotifications(): Dispatch<void> {
	return dispatch => {
		const path = getNotificationsPath();

		// The path was not found and as such we won't be able to display any notifications
		if (path === false) return;

		getPage(path, { textEntryFormat: 'html' }).then(response => {
			if (response.error) return;

			dispatch({
				type: SHOW_NOTIFICATIONS,
				payload: {
					page: response.data,
					position: 'top'
				}
			});
		});
	};
}

export function dismissNotification(id: string): Dispatch<Action<DismissNotificationActionPayload>> {
	return dispatch => {
		dispatch({
			type: DISMISS_NOTIFICATION,
			payload: id
		});
	};
}

export default function reduceNotifications(
	state: state.Notifications = initState,
	action: NotificationActions
): state.Notifications {
	switch (action.type) {
		case SHOW_NOTIFICATIONS:
			return reduceShowNotifications(state, <Action<ShowNotificationsActionPayload>>action);
		case SHOW_PASSIVE_NOTIFICATION:
			return reducePassiveNotifications(state, <Action<ShowPassiveNotificationsActionPayload>>action);
		case DISMISS_NOTIFICATION:
			return reduceDismissNotification(state, <Action<DismissNotificationActionPayload>>action);
		case PAGE_CHANGE:
			return reducePageChange(state, <Action<HistoryLocation>>action);
		default:
			return state;
	}
}

function reduceShowNotifications(
	state: state.Notifications,
	action: Action<ShowNotificationsActionPayload>
): state.Notifications {
	const dismissedNotifications = getDismissedNotifications();

	const page = action.payload.page;
	const entries = page.entries.filter(entry => {
		const uniqueId = getNotificationUniqueId(entry);
		return dismissedNotifications.indexOf(uniqueId) === -1;
	});

	return {
		entries,
		show: state.show,
		position: action.payload.position
	};
}

function reducePassiveNotifications(
	state: state.Notifications,
	action: Action<ShowPassiveNotificationsActionPayload>
): state.Notifications {
	return {
		...state,
		position: action.payload.config.position
	};
}

function reducePageChange(state: state.Notifications, action: Action<HistoryLocation>) {
	// Based on the action.key determine if the page should be shown or not.
	const newState = Object.assign({}, state);
	newState.show = shouldShowNotification(action.meta.key);
	return newState;
}

function reduceDismissNotification(
	state: state.Notifications,
	action: Action<DismissNotificationActionPayload>
): state.Notifications {
	const newState = Object.assign({}, state);
	const dismissedNotifications: string[] = getDismissedNotifications();

	if (dismissedNotifications.indexOf(action.payload) === -1) {
		dismissedNotifications.push(action.payload);
		setLocalStorageItem(DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY, dismissedNotifications);
	}

	const entries = state.entries.filter((entry: api.PageEntry) => {
		const uniqueId = getNotificationUniqueId(entry);
		return dismissedNotifications.indexOf(uniqueId) === -1;
	});

	newState.entries = entries;

	return newState;
}

function getDismissedNotifications(): string[] {
	return getLocalStorageItem(DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY) || [];
}

export function getNotificationUniqueId(entry: api.PageEntry) {
	return entry.customFields.uniqueId;
}
