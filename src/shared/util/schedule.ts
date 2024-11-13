import { getSchedules } from 'shared/service/content';
import { get } from 'shared/util/objects';
import { DEFAULT_TIME_LIMIT } from 'shared/linear/schedulePuller';

const BATCH_TIMEOUT = 200; // ms

const tasks: { [key: string]: any } = {};

export function getBatchNextSchedule(channelId, startDate: Date, duration: number): Promise<api.ItemScheduleList> {
	const key = createTaskKey(startDate, duration);

	if (!tasks[key]) {
		tasks[key] = {
			channelIds: new Set(),
			promise: new Promise((resolve, reject) => {
				setTimeout(() => {
					getSchedules(
						Array.from(tasks[key].channelIds),
						startDate,
						startDate.getUTCHours(),
						duration > DEFAULT_TIME_LIMIT ? DEFAULT_TIME_LIMIT : duration,
						{
							intersect: true
						}
					)
						.then(nextScheduleListToChannelMap)
						.then(resolve, reject);
					delete tasks[key];
				}, BATCH_TIMEOUT);
			})
		};
	}

	tasks[key].channelIds.add(channelId);
	return tasks[key].promise.then(channelMap => channelMap[channelId]);
}

function nextScheduleListToChannelMap({ data = [] }: api.Response<api.ItemScheduleList[]>) {
	return data.reduce((map, ch) => {
		map[ch.channelId] = ch;
		return map;
	}, {});
}

function createTaskKey(d: Date, duration: number) {
	return `${d.toDateString()}-${d.getUTCHours()}-${d.getUTCMinutes()}-${duration}`;
}

export function isVodAvailable(scheduleItem: api.ItemSchedule): boolean {
	return !!getIdpPath(scheduleItem);
}

export function getIdpPath(scheduleItem: api.ItemSchedule): string {
	return get(scheduleItem, 'item.path');
}
