import { DOWNLOAD_ICS_PAGE_PATH } from 'toggle/responsive/component/AddToCalendarButton/DownloadICS';

export interface CalendarEvent {
	title: string;
	description: string;
	startDate: Date;
	endDate?: Date;
	channelLink?: string;
	alarmReminderDescription?: string;
	alarmTriggerHourTime?: number;
	alarmTriggerMinuteTime?: number;
	alarmRepeat?: number;
	alarmAttachments?: string;
}

export function formatDateForCalendarUrl(date: Date | string) {
	const dateObj = typeof date === 'string' ? new Date(parseInt(date)) : date;
	return dateObj.toISOString().replace(/-|:|\.\d+/g, '');
}

// Redirect to google calendar for adding the events
export function generateGoogleCalendarUrl(calendarEvent: CalendarEvent) {
	const startDate = formatDateForCalendarUrl(calendarEvent.startDate);

	const endDate = formatDateForCalendarUrl(calendarEvent.endDate);

	const encodedUrl = encodeURI(
		[
			'https://www.google.com/calendar/render',
			'?action=TEMPLATE',
			`&text=${decodeURIComponent(calendarEvent.title) || ''}`,
			`&dates=${startDate || ''}`,
			`/${endDate || ''}`,
			`&details=${`${decodeURIComponent(calendarEvent.description)}\n` || ''}`,
			`&location=${decodeURIComponent(calendarEvent.channelLink) || ''}`,
			'&sprop=&sprop=name:'
		].join('')
	);

	return encodedUrl;
}
let alarms = [];

// Generates ICS for Apple and iCal Files calendars
export function generateIcsCalendarFile(calendarEvent: CalendarEvent) {
	const startDate = formatDateForCalendarUrl(calendarEvent.startDate);
	const endDate = formatDateForCalendarUrl(calendarEvent.endDate);
	alarms.push({
		action: 'audio',
		description: calendarEvent.alarmReminderDescription ? calendarEvent.alarmReminderDescription : 'Reminder',
		trigger: { hours: 2, minutes: 30, before: true },
		repeat: 2,
		attachType: 'VALUE=URI',
		attach: 'Glass'
	});

	const encodedUrl = encodeURI(
		`data:text/calendar;charset=utf8,${[
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			'BEGIN:VEVENT',
			`URL:${decodeURIComponent(calendarEvent.channelLink) || ''}`, // TODO: insert video app url here
			`DTSTART:${startDate || ''}`,
			`DTEND:${endDate || ''}`,
			`SUMMARY:${decodeURIComponent(calendarEvent.title) || ''}`,
			`DESCRIPTION:${decodeURIComponent(calendarEvent.description) || ''}`,
			`LOCATION:${decodeURIComponent(calendarEvent.channelLink) || ''}`,
			'BEGIN:VALARM',
			'ACTION:AUDIO',
			'REPEAT:2',
			'DESCRIPTION:Reminder',
			'ATTACH;VALUE=URI:Glass',
			'TRIGGER:-PT5M',
			'END:VALARM',
			'END:VEVENT',
			'END:VCALENDAR'
		].join('\n')}`
	);
	return encodedUrl;
}

// Redirect to outlook calendar for adding the events
export function formatDateForOutlookUrl(date) {
	const monthStr = String(date.getMonth() + 1).padStart(2, '0');
	const dayStr = String(date.getDate()).padStart(2, '0');
	const dateStr = `${date.getFullYear()}-${monthStr}-${dayStr}`;

	return `${dateStr}T${date.toLocaleTimeString('en-SG', {
		hourCycle: 'h23'
	})}`;
}

export function generateOutlookCalendarUrl(calendarEvent: CalendarEvent) {
	if (!calendarEvent) return '#';

	const { title, description, channelLink } = calendarEvent;

	const startDate = formatDateForOutlookUrl(calendarEvent.startDate);
	const endDate = formatDateForOutlookUrl(calendarEvent.endDate);

	const encodedUrl = encodeURI(
		[
			'https://outlook.live.com/calendar/0/deeplink/compose',
			`?body=${description}`,
			`&subject=${title || ''}`,
			`&startdt=${startDate || ''}`,
			`&enddt=${endDate || ''}`,
			`&location=${channelLink || ''}`,
			'&path=/calendar/action/compose',
			'&rru=addevent'
		].join('')
	);

	return encodedUrl;
}

export function formatCalendarAppLinkHash(calendarEvent, isGoogleCal = false) {
	const { title, description, startDate, endDate, channelLink } = calendarEvent;

	let appLinkHash = `#title=${encodeURIComponent(title)}&description=${encodeURIComponent(
		description
	)}&channelLink=${encodeURIComponent(channelLink)}&startDate=${startDate.getTime()}&endDate=${endDate.getTime()}`;

	if (isGoogleCal) {
		appLinkHash = `${appLinkHash}&google=true`;
	}

	return `${window.location.protocol}//${
		window.location.host
	}/${DOWNLOAD_ICS_PAGE_PATH}${appLinkHash}?mcapplink=1&mcapptobrowser=1`;
}
