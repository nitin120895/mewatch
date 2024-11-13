export interface FormattedTime {
	hour: number;
	minute: number;
}

export function padTime(time) {
	return time >= 10 ? time : '0' + time;
}

/**
 * Lazy creation of dates loaded via JSON
 */
export function formatDate(subject: any, propName: string): Date {
	const value = subject[propName];
	if (typeof value === 'string') {
		return (subject[propName] = new Date(value));
	} else {
		return value;
	}
}

export function formatMinute(minutes: string | number): FormattedTime {
	const minuteInt = typeof minutes === 'string' ? Number(minutes) : minutes;
	return { hour: Math.floor(minuteInt / 60), minute: minuteInt % 60 };
}

export function formatSecond(seconds: string | number): FormattedTime {
	const secondInt = typeof seconds === 'string' ? Number(seconds) : seconds;
	return formatMinute(Math.floor(secondInt / 60));
}

/**
 * Transform time in seconds into a formatted string (ex. hours:minutes:seconds).
 * The format is HH:MM:SS until hours run out, once the item only has minutes remaining, only show MM:SS.
 * For the video less than a minute we show 00:SS.
 * @param time {number} - In seconds
 */
export function getFormattedPlayerTime(time = 0): string {
	if (!time || time <= 0) return '00:00';

	const ONE_HOUR = 60 * 60;
	const seconds = Math.floor(time % 60);
	const minutes = Math.floor((time / 60) % 60);
	const hours = Math.floor((time / (60 * 60)) % 24);

	if (time < ONE_HOUR) {
		return `${minutes ? `${padTime(minutes)}` : '00'}:${padTime(seconds)}`;
	} else {
		return `${hours ? `${padTime(hours)}` : '00'}:${minutes ? `${padTime(minutes)}` : '00'}:${padTime(seconds)}`;
	}
}

export function getEPGHour() {
	const hoursOffset = Math.round(new Date().getTimezoneOffset() / 60);
	return (24 + hoursOffset) % 24;
}

export function getEPGDates(from: number, to: number): Date[] {
	const startDay = new Date();
	startDay.setDate(startDay.getDate() - from);

	const totalDaysCount = from + to + 1;
	const dates = [];

	for (let i = 0; i < totalDaysCount; i++) {
		const day = new Date(startDay);
		day.setDate(day.getDate() + i);
		dates[i] = day;
	}

	return dates;
}

export function getEPGDateIndex(from: number, to: number, selectedDate: Date): number {
	const startDay = new Date();
	startDay.setDate(startDay.getDate() - from);

	const totalDaysCount = from + to + 1;

	for (let i = 0; i < totalDaysCount; i++) {
		const day = new Date(startDay);
		day.setDate(day.getDate() + i);
		if (compareDate(day, selectedDate) === 0) {
			return i;
		}
	}

	return from;
}

export function formatDateEPG(date: Date): string {
	const formattedDate = new Date(date).toDateString().split(' ');
	const today = new Date();
	const weekday = compareDate(date, today) === 0 ? '@{epg_datepicker_label_today}' : formattedDate[0];

	return `${weekday}, ${formattedDate[2]} ${formattedDate[1]} ${formattedDate[3]}`;
}

export function formatDateGamesEPG(date: Date): string {
	const formattedDate = new Date(date).toDateString().split(' ');
	const today = new Date();
	const weekday = compareDate(date, today) === 0 ? '@{epg_datepicker_label_today}' : formattedDate[0];

	return `${weekday}, ${formattedDate[2]} ${formattedDate[1]}`;
}

export function compareDate(date1: Date, date2: Date): -1 | 0 | 1 {
	const d1 = date1.setHours(0, 0, 0, 0);
	const d2 = date2.setHours(0, 0, 0, 0);

	if (d1 < d2) return 1;
	else if (d1 === d2) return 0;
	else return -1;
}

/***
 * Return with the time in HH:mm format
 *
 * @param date
 */
export function formatScheduleTime(date: Date): string {
	return `${padTime(date.getHours())}:${padTime(date.getMinutes())}`;
}

/***
 * Return time with UTC offset in HH:mm format
 *
 * @param date
 * @param utcOffsetMinutes
 */
export function formatTimeWithUtcOffset(date: Date, utcOffsetMinutes: number) {
	const timeInMinutes = date.getUTCHours() * 60 + utcOffsetMinutes + date.getUTCMinutes();
	const hours = Math.floor(timeInMinutes / 60) % 24;
	const minutes = Math.floor(timeInMinutes % 60);

	return `${padTime(hours)}:${padTime(minutes)}`;
}

/**
 * Compare two dates (only date, ignore time)
 */
export function isDateEqual(d1: Date, d2: Date): boolean {
	if (!d1 || !d2) return false;
	return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

export function isDateTimeEqual(d1: Date, d2: Date): boolean {
	if (!d1 || !d2) return false;
	return d1.getTime() === d2.getTime();
}

/**
 * It returns the duration in minutes from two dates input (strings)
 */
export function getScheduleLength(schedule: api.ItemSchedule): number {
	const { endDate, startDate } = schedule;
	return (new Date(endDate).getTime() - new Date(startDate).getTime()) / 1000;
}

/**
 * Convert a time into minutes
 * @param d
 * @param useLocalTime
 */
export function convertTimeInMinutes(d: Date, useLocalTime = false) {
	return useLocalTime ? d.getHours() * 60 + d.getMinutes() : d.getUTCHours() * 60 + d.getUTCMinutes();
}

/**
 * Return TRUE if the date is between two others
 */
export function isBetween(date: Date, from: Date, to: Date): boolean {
	if (!date || !from || !to) return false;
	const dateTime = date.getTime();
	return dateTime >= from.getTime() && dateTime <= to.getTime();
}

/**
 * Add the specified number of hours to the given date
 */
export function addHours(date: Date, hours: number) {
	return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Convert milliseconds to hours
 */
export function convertMStoHours(milliseconds: number) {
	const seconds = Math.floor(milliseconds / 1000);
	const minute = Math.floor(seconds / 60);
	return Math.floor(minute / 60);
}

/**
 * Format date for Games Schedule API request
 * YYYYMMDD
 */
export function formatDateForRequest(date: Date) {
	return `${date.getFullYear()}${padTime(date.getMonth() + 1)}${padTime(date.getDate())}`;
}

export function getGameEPGDates(from: Date, to: Date): Date[] {
	let currDate = new Date(from.getTime());
	const dates = [from];
	while (compareDate(currDate, to) !== 0) {
		currDate.setDate(currDate.getDate() + 1);
		dates.push(new Date(currDate.getTime()));
	}

	return dates;
}

export function getGameEPGDateIndex(from: Date, to: Date, selectedDate: Date): number {
	const today = new Date();
	let currDate = new Date(from.getTime());
	let i = 0;

	while (compareDate(currDate, to) !== 0) {
		if (compareDate(currDate, selectedDate) === 0) {
			return i;
		}
		currDate.setDate(currDate.getDate() + 1);
		i++;
	}
	// If today is the last day, return the latest index
	if (compareDate(today, to) === 0) return i;

	return 0;
}

// Convert date string of YYYYMMDD to Date object
export function getDateFromQueryParam(dateStr: string) {
	const year = dateStr.substring(0, 4);
	const month = dateStr.substring(4, 6);
	const day = dateStr.substring(6);
	const date = new Date(`${year}-${month}-${day}T00:00:00`);

	if (isNaN(date.getTime())) return new Date();
	return date;
}

export function toISO8601(date: string | Date): string {
	if (!date) return;
	return typeof date === 'string'
		? date.replace('Z', '+08:00')
		: `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}T${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}+08:00`;
}

export function durationISO8601(duration: number): string {
	if (!duration) return 'PT00H00M0S';
	let hours = 0;
	let minutes = 0;
	let seconds = duration;
	if (duration > 60) {
		minutes = Math.floor(duration / 60);
		seconds = duration % 60;
		if (minutes > 60) {
			hours = Math.floor(minutes / 60);
			minutes = minutes % 60;
		}
	}
	return `PT${hours}H${minutes}M${seconds}S`;
}
