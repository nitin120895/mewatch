import PassiveNotificationManager from 'ref/responsive/app/passiveNotifications/PassiveNotificationManager';
import ModalManager from 'ref/responsive/app/modal/ModalManager';
import * as React from 'react';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import * as UILayerActions from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';

import './PassiveNotificationComponents.scss';

interface PassiveNotificationComponentsProps {
	onShowNotification: (notification: PassiveNotificationConfig) => void;
	onHideNotification: () => void;
	showModal: (config: any) => void;
}

interface PassiveNotificationComponentsState {
	userMessage?: string;
}

const bem = new Bem('passive-notification-components');

const shortMessage = 'Something went wrong, oh no! \\o/';
const longMessage = `I'm now going to recite The Hobbit. In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with ends of worms and a oozy smell, nor yet a dry, bare sandy hole with nothing in it to sit down on or eat : it was a hobbit-hole, and that means comfort.`;

const modalConfig = {
	id: 'standard',
	type: ModalTypes.STANDARD_DIALOG,
	componentProps: {
		children: 'While a modal is up, the passive notification will both stay open and reset its timeout.'
	}
};

class PassiveNotificationComponents extends React.Component<
	PassiveNotificationComponentsProps,
	PassiveNotificationComponentsState
> {
	state: PassiveNotificationComponentsState = {};

	private showNotification(
		message: string | React.ReactElement<any> = "Message was actually empty, so I'm showing this instead"
	) {
		this.props.onShowNotification({ content: message });
	}

	render() {
		const { userMessage } = this.state;

		return (
			<div className={bem.b()}>
				<PassiveNotificationManager />
				<ModalManager />
				<h3>Helpers</h3>
				<div className={bem.e('group')}>
					<div>
						<p>Hide the currently displayed message</p>
						<button className="btn" onClick={() => this.props.onHideNotification()}>
							Hide Message
						</button>
					</div>
					<div>
						<p>
							Show a modal. This highlights the rule that if a modal is shown while a passive notification is visibile,
							the notification will not disappear and instead will restart it's timeout (usually 5 seconds) when the
							modal is closed
						</p>
						<button className="btn" onClick={() => this.props.showModal(modalConfig)}>
							Show a Modal
						</button>
					</div>
				</div>
				<hr />
				<div className={bem.e('group')}>
					<h3>Pre built Passive Notifications</h3>
					<p>
						Use these buttons below to display <b>passive notifications</b>
					</p>
					<button className="btn" onClick={() => this.showNotification(shortMessage)}>
						Short Message
					</button>
					<button className="btn" onClick={() => this.showNotification(longMessage)}>
						Long Message
					</button>
					<button className="btn" onClick={() => this.showNotification(this.buildMessageElement())}>
						Element Message
					</button>
					<h4>Choose your own adventure</h4>
					<textarea
						value={userMessage}
						placeholder="Place your message here"
						onChange={e => this.setState({ userMessage: e.target.value })}
					/>
					<button className="btn" onClick={() => this.showNotification(userMessage)}>
						Show Message
					</button>
				</div>
			</div>
		);
	}

	buildMessageElement() {
		return (
			<div className={bem.e('message-element')}>
				<b>Message</b> <i>element</i> <u>content</u>
			</div>
		);
	}
}

const actions = {
	onShowNotification: UILayerActions.ShowPassiveNotification,
	onHideNotification: UILayerActions.ClosePassiveNotification,
	showModal: UILayerActions.OpenModal
};

export default connect<any, any, PassiveNotificationComponentsProps>(
	undefined,
	actions
)(PassiveNotificationComponents);
