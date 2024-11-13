import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { connect } from 'react-redux';
import { ClosePassiveNotification } from 'shared/uiLayer/uiLayerWorkflow';
import PassiveNotification from './PassiveNotification';
import { debounce } from 'shared/util/performance';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';

import './PassiveNotificationManager.scss';

interface PassiveNotificationManagerProps extends React.Props<any> {
	notification?: PassiveNotificationConfig;
	closeNotification?: () => void;
	// timeout before notification timeout disappears
	notificationTimeout?: number;
	modalVisible?: boolean;
	fullscreenNotificationAllowed?: boolean;
}

interface PassiveNotificationManagerState {
	notificationOnShow?: PassiveNotificationConfig;
	isClosing?: boolean;
}

const bem = new Bem('passive-notification-manager');

class PassiveNotificationManager extends React.PureComponent<
	PassiveNotificationManagerProps,
	PassiveNotificationManagerState
> {
	static defaultProps = {
		notificationTimeout: 5000,
		fullscreenNotificationAllowed: false
	};

	state: PassiveNotificationManagerState = {
		notificationOnShow: this.props.notification
	};

	private notification: HTMLElement;
	private timeout: number;
	private isPaused: boolean;

	componentDidMount() {
		fullscreenService.setCallback(this.fullscreenCallback);
	}

	componentWillUnmount() {
		fullscreenService.removeCallback(this.fullscreenCallback);
	}

	componentWillReceiveProps(nextProps: PassiveNotificationManagerProps) {
		if (!this.props.modalVisible && nextProps.modalVisible) {
			// a wild modal appeared! We pause all showing of notificaitons until it's done
			if (!this.state.isClosing) this.clearTimeout();
		}
		if (this.props.modalVisible && !nextProps.modalVisible) {
			// modal disappeared, restart the timeout if we had something visibile
			if (this.state.notificationOnShow) {
				this.startTimeout();
			}
		}
		if (!this.state.notificationOnShow && nextProps.notification) {
			// had no message, now have one
			this.clearTimeout();
			this.setState({ notificationOnShow: nextProps.notification });
		} else if (nextProps.notification !== this.state.notificationOnShow && !this.isPaused) {
			this.clearTimeout();
			// had a message and it's different - close and re-open
			this.setState({ isClosing: true });
		}
	}

	componentDidUpdate(prevProps, prevState: PassiveNotificationManagerState) {
		const { modalVisible, notification } = this.props;
		const { notificationOnShow } = this.state;
		if (!prevState.notificationOnShow && notificationOnShow && !modalVisible) {
			this.startTimeout();
		}

		// Dismiss notification immediately:
		// 1) When close passive notification action is dispatched
		// 2) When notification contents has changed and current notification is not the same as the one showing up
		if (prevProps.notification !== notification) {
			const notificationDismissed = prevProps.notification && !notification;
			const notificationChanged = notification && notification !== notificationOnShow;

			if (notificationDismissed || notificationChanged) {
				this.onNotificationClose();
			}
		}
	}

	private startTimeout() {
		this.clearTimeout();
		this.timeout = window.setTimeout(() => {
			this.setState({ isClosing: true });
		}, this.props.notificationTimeout);
	}

	private clearTimeout() {
		window.clearTimeout(this.timeout);
	}

	private onModalTransitionEnd = debounce(() => {
		const oldNotification = this.state.notificationOnShow;
		this.setState({ isClosing: false, notificationOnShow: undefined }, () => {
			if (this.props.notification === oldNotification) {
				this.props.closeNotification();
			} else {
				this.setState({ notificationOnShow: this.props.notification });
			}
		});
	}, 10);

	private onTransitionEnd = e => {
		const { isClosing } = this.state;
		if (isClosing && e.target === this.notification) {
			this.onModalTransitionEnd();
		}
	};

	private onNotificationMouseEnter = () => {
		this.isPaused = true;
		this.clearTimeout();
	};

	private onNotificationMouseLeave = () => {
		this.isPaused = false;
		if (this.state.notificationOnShow) this.startTimeout();
	};

	private onNotificationClose = () => {
		this.clearTimeout();
		this.onModalTransitionEnd();
	};

	private notificationRef = node => {
		this.notification = node;
	};

	render() {
		const { modalVisible, fullscreenNotificationAllowed } = this.props;
		const { notificationOnShow, isClosing } = this.state;
		const fullscreen = fullscreenService.isFullScreen();
		// container hides once the notification is gone
		const isContainerHidden =
			!isClosing && !notificationOnShow && !modalVisible && !(fullscreen && fullscreenNotificationAllowed);
		// notification hides when it's closing or there's nothing
		const isNotificationHidden = isClosing || !notificationOnShow;
		return (
			<div className={bem.b(isContainerHidden ? 'hidden' : undefined)} onTransitionEnd={this.onTransitionEnd}>
				<PassiveNotification
					config={notificationOnShow}
					hidden={isNotificationHidden}
					onRef={this.notificationRef}
					onMouseEnter={this.onNotificationMouseEnter}
					onMouseLeave={this.onNotificationMouseLeave}
					onClose={this.onNotificationClose}
				/>
			</div>
		);
	}

	private fullscreenCallback = (): void => {
		this.forceUpdate();
	};
}

function mapStateToProps(state: state.Root) {
	return {
		notification: state.uiLayer.passiveNotification,
		modalVisible: state.uiLayer.modals.app.length > 0
	};
}

const actions = {
	closeNotification: ClosePassiveNotification
};

export default connect<any, any, PassiveNotificationManagerProps>(
	mapStateToProps,
	actions
)(PassiveNotificationManager);
