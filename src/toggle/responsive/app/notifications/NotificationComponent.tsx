import * as React from 'react';
import { getNotificationTimeout } from '../../util/modalUtil';
import { isTabletSize } from 'ref/responsive/util/grid';
import Notifications from './Notifications';
import PassiveNotificationManager from 'ref/responsive/app/passiveNotifications/PassiveNotificationManager';
import { Bem } from 'shared/util/styles';
import { dismissNotification } from 'shared/notifications/notificationWorkflow';
import { connect } from 'react-redux';

import './NotificationComponent.scss';

const bem = new Bem('notification-component');

interface Props {
	offsetHeight?: number;
	headerTop?: number;
	fullscreenNotificationAllowed?: boolean;
}

interface NotificationHeaderState {
	headerTop?: number;
}

interface NotifiableProps {
	showNotifications?: boolean;
	notifications?: api.PageEntry[];
	position?: NotificationPosition;
}

interface NotifiableDispatchProps {
	dismissNotification?: (notificationId: string) => void;
}

type NotificationProp = Props & NotifiableProps & NotifiableDispatchProps;

// const DEFAULT_OFFSET_HEIGHT = 60;

class NotificationComponent extends React.Component<NotificationProp, NotificationHeaderState> {
	static defaultProps = {
		offsetHeight: 10,
		headerTop: 0,
		fullscreenNotificationAllowed: false
	};

	render() {
		const {
			notifications,
			showNotifications,
			dismissNotification,
			offsetHeight,
			headerTop,
			fullscreenNotificationAllowed,
			position
		} = this.props;
		const notificationTimeout = getNotificationTimeout();

		const offset = 10;
		const topPadding = isTabletSize() ? 10 : 20;

		let top = undefined;

		if (position === 'bottom') {
			top = `${window.innerHeight * 0.9}px`;
		} else {
			if (offsetHeight) {
				top = `${offsetHeight + offset}px`;
			}

			if (offsetHeight && Math.abs(headerTop) > offsetHeight - offset) {
				top = `${Math.abs(headerTop - topPadding)}px`;
			}
		}

		const styles = { top };

		return (
			<div className={bem.e('notifications')} style={styles}>
				<Notifications
					notifications={notifications}
					show={showNotifications}
					dismissNotification={dismissNotification}
				/>
				<PassiveNotificationManager
					notificationTimeout={notificationTimeout}
					fullscreenNotificationAllowed={fullscreenNotificationAllowed}
				/>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root): NotificationProp {
	return {
		notifications: state.notifications.entries,
		showNotifications: state.notifications.show,
		position: state.notifications.position
	};
}

function mapDispatchToProps(dispatch) {
	return {
		dismissNotification: (notificationId: string) => {
			dispatch(dismissNotification(notificationId));
		}
	};
}

export default connect<any, any, NotificationProp>(
	mapStateToProps,
	mapDispatchToProps
)(NotificationComponent);
