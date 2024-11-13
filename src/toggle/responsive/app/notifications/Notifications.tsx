import * as React from 'react';
import Notification from 'toggle/responsive/app/notifications/Notification';
import { getNotificationUniqueId } from 'shared/notifications/notificationWorkflow';

interface Props {
	notifications: api.PageEntry[];
	show: boolean;
	dismissNotification: (notificationId: string) => void;
}

export default (props: Props) => {
	const { show } = props;

	const renderNotifications = () => {
		const { dismissNotification } = props;
		let { notifications } = props;

		if (notifications.length > 1) {
			notifications = notifications.slice(0, 1);
		}

		return notifications.map(entry => (
			<Notification
				onClick={() => dismissNotification(getNotificationUniqueId(entry))}
				text={entry.text}
				key={entry.id}
			/>
		));
	};

	/* tslint:disable-next-line:no-null-keyword */
	if (!show || props.notifications.length === 0) return null;

	return <div className="toast-notifications">{renderNotifications()}</div>;
};
