import { get } from 'shared/util/objects';

const MS_IN_MINUTE = 60000;
const DEFAULT_OFFSET_MINUTES = 5;

const checkReminderExpiration = (reminderOffsetMinutes: number) => (reminder: api.Reminder) => {
	const currentDate = new Date().getTime();
	const startDate = new Date(reminder.schedule.startDate).getTime();
	return currentDate + reminderOffsetMinutes * MS_IN_MINUTE < startDate;
};

export function sortRemindersByStartDate(reminders: api.Reminder[], reminderOffsetMinutes = DEFAULT_OFFSET_MINUTES) {
	if (reminders && !reminders.length) return [];
	return reminders.filter(checkReminderExpiration(reminderOffsetMinutes)).sort((r1, r2) => {
		return new Date(r1.schedule.startDate).getTime() - new Date(r2.schedule.startDate).getTime();
	});
}

export function checkRemindersEquality(r1: api.Reminder[], r2: api.Reminder[]) {
	if (!(r1 && r2 && r1.length && r2.length) || r1.length !== r2.length) return false;
	for (let i = 0; i < r1.length; i++) {
		if (r1[i].id !== r2[i].id) return false;
	}
	return true;
}

export function getNextReminderTime(reminder: api.Reminder, reminderOffsetMinutes = DEFAULT_OFFSET_MINUTES) {
	const nextReminderTime = new Date(reminder.schedule.startDate).getTime();
	const currentTime = new Date().getTime();
	return nextReminderTime - currentTime - reminderOffsetMinutes * MS_IN_MINUTE;
}

export const retrieveReminderOffset = (store: state.Root) =>
	get(store, 'app.config.linear.epgReminderNotificationOffsetMinutes');
