export const secondsToMs = (n: number) => n * 1000;
export const minutesToMs = (n: number) => secondsToMs(60) * n;
export const secondsToMinutes = (n: number) => Math.floor(n / 60);

export function getEPGScheduleProgress(startDate, endDate): number {
	const startTime = new Date(startDate).getTime();
	const endTime = new Date(endDate).getTime();
	const currentTime = new Date().getTime();

	return Math.round(((currentTime - startTime) / (endTime - startTime)) * 100);
}

export function convertTimeToSeconds(time: string) {
	const timeFormat = /^(\d{2}:)?\d{2}:\d{2}$/;

	if (!time.match(timeFormat)) return undefined;

	const [seconds, minutes, hours] = time
		.split(':')
		.reverse()
		.map(val => parseInt(val, 10));

	return seconds + minutes * 60 + (hours | 0) * 60 * 60;
}

export function videoTimeStamp(currentProgramStartTime: Date) {
	if (!currentProgramStartTime) return;

	const currentTime = new Date();

	// Calculated the watched duration in seconds
	const videoDuration = (currentTime.getTime() - currentProgramStartTime.getTime()) / 1000;

	// Formating the watched duration as HH:MM:SS
	const videoDurationHours = Math.floor(videoDuration / 3600);
	const videoDurationMinutes = Math.floor((videoDuration % 3600) / 60);
	const videoDurationSeconds = Math.floor(videoDuration % 60);
	const videoTimeStampFormatted = `${videoDurationHours
		.toString()
		.padStart(2, '0')}:${videoDurationMinutes.toString().padStart(2, '0')}:${videoDurationSeconds
		.toString()
		.padStart(2, '0')}`;

	return videoTimeStampFormatted;
}

// formate seconds to HH:MM:SS
export function formatSecondstoHhMmSs(sec = 0) {
	return new Date(sec * 1000).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];
}

export function getElapsedTime(startTime) {
	if (!startTime) return 0;
	const currentTime = new Date();
	const timestamp = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000 + 1);
	return timestamp;
}
