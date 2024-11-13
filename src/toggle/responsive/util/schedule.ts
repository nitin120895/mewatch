import * as content from 'shared/service/content';
import { getNextSchedules } from 'shared/service/content';
import { timeout } from 'shared/util/promises';

interface ChannelPromise {
	promise: Promise<api.ItemScheduleList>;
	resolve: (d: api.ItemScheduleList) => void;
}

const BATCH_TIMEOUT = 200; // ms

const taskManagers = new Map<string, TaskListManager>();

/*
 * This function try to optimise the schedule request in based on the
 * channel id, start time and limit parameters.
 * It create a batch request from multiple channel ids if they have the
 * same start time and limit requirements.
 * The batching has a time limit, if it is expire the request will sent to the server
 * and the next channel id will be added to the next batch
 */
export function getBatchNextSchedule(
	channelId,
	startDate: Date,
	options: content.GetNextSchedulesOptions
): Promise<api.ItemScheduleList> {
	// cleanup
	Array.from(taskManagers.keys()).forEach(key => {
		if (taskManagers.get(key).isDisposable) {
			taskManagers.delete(key);
		}
	});

	const key = createTaskManagerKey(startDate);
	if (!taskManagers.has(key)) {
		taskManagers.set(key, new TaskListManager());
	}

	return taskManagers.get(key).addNewRequest(channelId, startDate, options);
}

function createTaskManagerKey(d: Date) {
	return `${d.toDateString()}-${d.getUTCHours()}-${d.getUTCMinutes()}`;
}

///

class TaskListManager {
	private tasks = new Map<number, Task>();
	private channelPromises = new Map<string, ChannelPromise>();

	public addNewRequest(
		channelId,
		startDate: Date,
		options: content.GetNextSchedulesOptions
	): Promise<api.ItemScheduleList> {
		this.prepareTasks(channelId, startDate, options);

		if (!this.channelPromises.has(channelId)) {
			let resolve = undefined;
			const promise = new Promise<api.ItemScheduleList>(res => (resolve = res));
			this.channelPromises.set(channelId, { promise, resolve });
		}

		return this.channelPromises.get(channelId).promise;
	}

	public get isDisposable() {
		return this.tasks.size === 0;
	}

	private prepareTasks(channelId, startDate: Date, options: content.GetNextSchedulesOptions) {
		const limit = options.limit;
		let addChannelToTask = true;

		// the channel must be appear only on active task
		this.tasks.forEach(task => {
			if (task.channelIds.has(channelId)) {
				if (task.limit < limit) {
					task.channelIds.delete(channelId);
				}
				if (task.limit > limit) {
					addChannelToTask = false;
				}
			}
		});

		if (!this.tasks.has(limit)) {
			const task = new Task(startDate, options);
			this.tasks.set(limit, task);
			timeout(BATCH_TIMEOUT).then(() => this.runTask(limit));
		}

		if (addChannelToTask) {
			this.tasks.get(limit).channelIds.add(channelId);
		}
	}

	private runTask(key: number) {
		const task = this.tasks.get(key);
		this.tasks.delete(key);
		if (task.channelIds.size > 0) {
			// execute task and resolve the channel promises
			task.run().then(({ data }) => {
				data.forEach(ch => {
					this.channelPromises.get(ch.channelId).resolve(ch);
					this.channelPromises.delete(ch.channelId);
				});
			});
		}
	}
}

class Task {
	public channelIds = new Set<string>();

	constructor(private startDate: Date, private options: content.GetNextSchedulesOptions) {}

	public run(): Promise<api.Response<api.ItemScheduleList[]>> {
		return getNextSchedules(
			Array.from(this.channelIds),
			this.startDate,
			this.startDate.getUTCHours(),
			this.startDate.getUTCMinutes(),
			this.options
		);
	}

	public get limit() {
		return this.options.limit;
	}
}
