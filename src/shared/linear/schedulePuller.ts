import { getBatchNextSchedule } from '../util/schedule';
import { addHours, convertMStoHours } from 'shared/util/dates';

const taskMap = new Map<string, { timerId: number; assetLimit: number; timeLimit: number }>();
const MINUTE = 60 * 1000;
const FIRST_TIME_REQUEST = -1;
const DEFAULT_INTERVAL = 30 * MINUTE;

export const DEFAULT_ASSET_LIMIT = 50;
export const DEFAULT_TIME_LIMIT = 24;

type TaskResult = api.ItemScheduleList | { schedules: api.ItemSchedule[] };
type OnTaskCompleteHandler = (result: api.ItemSchedule[]) => void;
type GetChannelScheduleInfo = (channelId: string) => state.ChannelScheduleInfo;

interface RunnerStartParameters {
	channelId: string;
	task: () => Promise<TaskResult>;
	onTaskComplete: (schedules: TaskResult) => void;
	getNextInterval: () => number;
}

async function run({ channelId, task, onTaskComplete, getNextInterval }: RunnerStartParameters) {
	const taskResult = await task();
	onTaskComplete(taskResult);
	const nextTask = () => run({ channelId, task, onTaskComplete, getNextInterval });
	const nextTrackTimer = window.setTimeout(nextTask, getNextInterval());
	updatePullForChannel(channelId, nextTrackTimer);
}

function delayedRun({ channelId, task, onTaskComplete, getNextInterval }: RunnerStartParameters) {
	const delayedTask = () => run({ channelId, task, onTaskComplete, getNextInterval });
	const nextTrackTimer = window.setTimeout(delayedTask, getNextInterval());
	updatePullForChannel(channelId, nextTrackTimer);
}

function createTask(channelId: string, getChannelScheduleInfo: GetChannelScheduleInfo) {
	let { list, assetLimit, timeLimit } = getChannelScheduleInfo(channelId) as any;

	assetLimit = assetLimit || DEFAULT_ASSET_LIMIT;
	timeLimit = timeLimit || DEFAULT_TIME_LIMIT;

	const nextStartDate = getNextStartDate(list);
	const nextDuration = getNextDuration(list, nextStartDate, timeLimit);
	const noFetchRequired = list.length >= assetLimit || !nextDuration;

	if (noFetchRequired) {
		return Promise.resolve({
			schedules: []
		});
	}

	return getBatchNextSchedule(channelId, nextStartDate, nextDuration);
}

export const createSchedulePuller = (
	onTaskComplete: OnTaskCompleteHandler,
	getChannelScheduleInfo: GetChannelScheduleInfo
) => (channelId: string) => {
	let { list, assetLimit, timeLimit } = getChannelScheduleInfo(channelId) as any;

	assetLimit = assetLimit || DEFAULT_ASSET_LIMIT;
	timeLimit = timeLimit || DEFAULT_TIME_LIMIT;

	const task = () => createTask(channelId, getChannelScheduleInfo);
	const getNextInterval = getNextIntervalStrategy(() => getChannelScheduleInfo(channelId));
	const onComplete = schedule => onTaskComplete(schedule.schedules.map(initDateObjects));

	if (taskMap.has(channelId)) {
		const existingTask = taskMap.get(channelId);

		if (existingTask.assetLimit < assetLimit || existingTask.timeLimit < timeLimit) {
			stopPullForChannel(channelId);
			createPullForChannel(channelId, assetLimit, timeLimit);
		} else {
			return;
		}
	} else {
		createPullForChannel(channelId, assetLimit, timeLimit);
	}

	if (list.length) {
		delayedRun({ channelId, task, onTaskComplete: onComplete, getNextInterval });
	} else {
		run({ channelId, task, onTaskComplete: onComplete, getNextInterval });
	}
};

function createPullForChannel(channelId: string, assetLimit: number, timeLimit: number) {
	taskMap.set(channelId, { timerId: FIRST_TIME_REQUEST, assetLimit, timeLimit });
}

function updatePullForChannel(channelId: string, timerId: number) {
	taskMap.set(channelId, { ...taskMap.get(channelId), timerId });
}

export function stopPullForChannel(channelId) {
	const nextTask = taskMap.get(channelId);

	if (nextTask === undefined) return;

	clearTimeout(nextTask.timerId);
	taskMap.delete(channelId);
}

function getNextStartDate(schedules: api.ItemSchedule[]): Date {
	if (schedules.length === 0) {
		return new Date();
	}

	const lastScheduleEnd = schedules[schedules.length - 1].endDate;

	return new Date(lastScheduleEnd.getTime() + MINUTE);
}

function getNextDuration(schedules: api.ItemSchedule[], startDate: Date, timeLimit: number): number {
	if (schedules.length) {
		const timeLimitDate = addHours(new Date(), timeLimit);
		const newDuration = timeLimitDate.getTime() - startDate.getTime();

		return newDuration > 0 ? convertMStoHours(newDuration) : 0;
	}
	return timeLimit;
}

function initDateObjects(item) {
	return {
		...item,
		startDate: new Date(item.startDate),
		endDate: new Date(item.endDate)
	};
}

function getNextIntervalStrategy(getChannelScheduleInfo: () => state.ChannelScheduleInfo) {
	return () => {
		const currentSchedule = getChannelScheduleInfo().list[0];

		if (!currentSchedule) {
			return DEFAULT_INTERVAL;
		}

		const now = Date.now();
		const timeLeftToCurrentScheduleEnd = currentSchedule.endDate.getTime() - now;
		const intervalTillNextPoll = timeLeftToCurrentScheduleEnd + 1;

		return intervalTillNextPoll;
	};
}
