import * as React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'shared/util/browserHistory';
import { OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import {
	checkRemindersEquality,
	getNextReminderTime,
	sortRemindersByStartDate
} from 'toggle/responsive/util/reminderUtil';
import { get } from 'shared/util/objects';
import ReminderModal from './ReminderModal';
import { isAnonymousProfileId } from 'shared/account/profileUtil';

const MODAL_REMINDER_ID = 'reminder-overlay';

interface DispatchProps {
	openModal: (modal: ModalConfig) => void;
	closeModal: (id: string) => void;
}

interface StateProps {
	profile: api.ProfileSummary;
	profileReminders: api.Reminder[];
	reminderOffsetMinutes: number;
}

interface State {
	reminders?: api.Reminder[];
	activeReminder?: api.Reminder;
	time: number;
}

type Props = DispatchProps & StateProps;

class ReminderManager extends React.PureComponent<Props, State> {
	private timer: number;

	getInitialState(): State {
		const { profileReminders, reminderOffsetMinutes } = this.props;
		if (profileReminders.length) {
			const primaryReminder = profileReminders[0];
			return {
				activeReminder: primaryReminder,
				time: getNextReminderTime(primaryReminder, reminderOffsetMinutes),
				reminders: [...profileReminders]
			};
		}
		return {
			activeReminder: undefined,
			time: undefined,
			reminders: undefined
		};
	}

	state: State = this.getInitialState();

	componentDidMount() {
		const { profileReminders } = this.props;
		if (profileReminders.length) {
			this.setReminderTimer();
		}
	}

	componentWillReceiveProps(nextProps) {
		const { profile, profileReminders, reminderOffsetMinutes } = this.props;
		const newReminders = get(nextProps, 'profileReminders');
		const profileId = get(profile, 'id');
		const newProfileId = get(nextProps, 'profile.id');

		if (profileId !== newProfileId || isAnonymousProfileId(newProfileId)) {
			clearTimeout(this.timer);

			this.setState({
				activeReminder: undefined,
				time: undefined,
				reminders: undefined
			});
		}

		if (
			profile &&
			nextProps.profile &&
			newReminders.length &&
			!checkRemindersEquality(profileReminders, newReminders)
		) {
			this.setState(
				{
					reminders: sortRemindersByStartDate(newReminders, reminderOffsetMinutes)
				},
				this.addNewTimer
			);
		}
	}

	setReminderTimer() {
		const { time, reminders } = this.state;
		clearTimeout(this.timer);
		this.timer = window.setTimeout(() => {
			this.setState({
				reminders: reminders.slice(1)
			});
			this.showReminder();
		}, time);
	}

	private showReminder = () => {
		const activeReminder = this.state.activeReminder;
		const reminderProps = {
			onClose: this.closeModal,
			activeReminder,
			onWatchClick: () => this.onWatchClick(activeReminder)
		};
		this.props.openModal({
			id: MODAL_REMINDER_ID,
			type: ModalTypes.CUSTOM,
			element: <ReminderModal {...reminderProps} />
		});
		this.addNewTimer();
	};

	addNewTimer() {
		const { reminderOffsetMinutes } = this.props;
		const { reminders } = this.state;
		if (!reminders.length) return;
		const primaryReminder = reminders[0];
		this.setState(
			{
				activeReminder: primaryReminder,
				time: getNextReminderTime(primaryReminder, reminderOffsetMinutes)
			},
			this.setReminderTimer
		);
	}

	private onWatchClick = (activeReminder: api.Reminder) => {
		const { channel } = activeReminder;
		this.closeModal();
		browserHistory.push(channel.path);
	};

	private closeModal = () => {
		const { closeModal } = this.props;
		closeModal(MODAL_REMINDER_ID);
	};

	render() {
		return <div />;
	}
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		openModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id))
	};
}

function mapStateToProps({ profile, app }: state.Root): StateProps {
	const activeProfile = profile && profile.info;
	return {
		profile: activeProfile,
		profileReminders: profile.reminders,
		reminderOffsetMinutes: get(app, 'config.linear.epgReminderNotificationOffsetMinutes')
	};
}

export default connect<StateProps, DispatchProps, {}>(
	mapStateToProps,
	mapDispatchToProps
)(ReminderManager);
