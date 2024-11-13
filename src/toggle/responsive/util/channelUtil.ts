export enum ChannelSelectors {
	ON_NOW = 'on-now',
	UPCOMING_SCHEDULE = 'upcoming-schedule'
}

export const UPCOMING_SCHEDULE_SELECTOR_ID = 'upcoming-schedule-selector';
export const CHANNELS_SELECTOR_ID = 'on-now-channels-selector';
export const MAX_NUMBER_OF_TILES = 12;

export function isOnNow(startDate: Date | string, endDate: Date | string) {
	if (typeof startDate === 'string') startDate = new Date(startDate);
	if (typeof endDate === 'string') endDate = new Date(endDate);

	const getDateUtcMilliseconds = (date: Date) =>
		Date.UTC(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
			date.getHours(),
			date.getMinutes(),
			date.getSeconds()
		);

	const now = getDateUtcMilliseconds(new Date());
	const start = getDateUtcMilliseconds(startDate);
	const end = getDateUtcMilliseconds(endDate);

	return start <= now && now <= end;
}
