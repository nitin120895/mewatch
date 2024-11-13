import * as content from 'shared/service/content';
import { getBatchNextSchedule } from '../../toggle/responsive/util/schedule';

const activeTaskTimerMap = new Map<string, number>();
const MINUTE = 60 * 1000;
const FIRST_TIME_REQUEST = -1;

type TaskResult = api.ItemScheduleList | { schedules: api.ItemSchedule[] };

interface RunnerStartParameters {
	channelId: string;
	task: () => Promise<TaskResult>;
	onTaskComplete: (schedules: TaskResult) => void;
	getNextInterval: () => number;
}
async function run({ channelId, task, onTaskComplete, getNextInterval }: RunnerStartParameters) {
	if (!activeTaskTimerMap.has(channelId)) {
		activeTaskTimerMap.set(channelId, FIRST_TIME_REQUEST);
	}

	const taskResult = await task();
	onTaskComplete(taskResult);
	window.clearTimeout(activeTaskTimerMap.get(channelId));

	const nextTask = () => run({ channelId, task, onTaskComplete, getNextInterval });
	const nextTrackTimer = window.setTimeout(nextTask, getNextInterval());
	activeTaskTimerMap.set(channelId, nextTrackTimer);
}

type OnTaskCompleteHandler = (result: api.ItemSchedule[]) => void;
type GetChannelScheduleInfo = (channelId: string) => state.ChannelScheduleInfo;
export const createSchedulePuller = (
	onTaskComplete: OnTaskCompleteHandler,
	getChannelScheduleInfo: GetChannelScheduleInfo
) => (channelId: string, limit: number, options: content.GetNextSchedulesOptions) => {
	const task = () => {
		const existingSchedules = getChannelScheduleInfo(channelId).list;
		const noFetchRequired = existingSchedules.length >= limit;

		if (noFetchRequired) {
			return Promise.resolve({
				schedules: []
			});
		}

		const newOptions = {
			...options,
			limit: getRequiredNumberOfNewItems(existingSchedules, limit)
		};

		return getBatchNextSchedule(channelId, getNewStartDate(existingSchedules), newOptions);
	};

	const getNextInterval = getNextIntervalStrategy(() => getChannelScheduleInfo(channelId));

	return run({
		channelId,
		task,
		onTaskComplete: schedule =>
			schedule && schedule.schedules && onTaskComplete(schedule.schedules.map(initDateObjects)),
		getNextInterval
	});
};

export const stopPullForChannel = channelId => {
	const nextTaskTimer = activeTaskTimerMap.get(channelId);

	if (nextTaskTimer === undefined) {
		return;
	}

	clearTimeout(nextTaskTimer);
	activeTaskTimerMap.delete(channelId);
};

function getNewStartDate(schedules: api.ItemSchedule[]): Date {
	if (schedules.length === 0) {
		return new Date();
	}

	const lastScheduleEnd = schedules[schedules.length - 1].endDate;

	return new Date(lastScheduleEnd.getTime() + MINUTE);
}

function getRequiredNumberOfNewItems(schedules: api.ItemSchedule[], limit = 1): number {
	return schedules.length
		? Math.max(limit + getBuffer(limit) - schedules.length, 1)
		: Math.min(limit + getBuffer(limit), 12);
}

const initDateObjects = item => ({
	...item,
	startDate: new Date(item.startDate),
	endDate: new Date(item.endDate)
});

const getBuffer = (limit: number) => limit % 3;

const DEFAULT_INTERVAL = 30 * MINUTE;
const getNextIntervalStrategy = (getChannelScheduleInfo: () => state.ChannelScheduleInfo) => () => {
	const currentSchedule = getChannelScheduleInfo().list[0];

	if (!currentSchedule) {
		return DEFAULT_INTERVAL;
	}

	const now = Date.now();
	const timeLeftToCurrentScheduleEnd = currentSchedule.endDate.getTime() - now;
	const intervalTillNextPoll = timeLeftToCurrentScheduleEnd + 1;

	return intervalTillNextPoll;
};
