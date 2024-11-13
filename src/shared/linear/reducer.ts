import { uniqBy } from 'shared/util/arrays';

export const UPDATE_SCHEDULE = '@schedule/UPDATE_SCHEDULE';
export const CREATE_DEFAULT_SCHEDULE_STRUCTURE = '@schedule/CREATE_DEFAULT_SCHEDULE_STRUCTURE';
export const UPDATE_CONTEXT_LIMIT = '@schedule/UPDATE_CONTEXT_LIMIT';
export const TOGGLE_LOADING = '@schedule/TOGGLE_LOADING';

const initialState: state.Schedule = {};

export default function reducer(state: state.Schedule = initialState, action: Action<any>): state.Schedule {
	if (action.error) {
		return state;
	}

	switch (action.type) {
		case CREATE_DEFAULT_SCHEDULE_STRUCTURE:
			return reduceCreateDefaultScheduleStructure(state, action);
		case UPDATE_SCHEDULE:
			return reduceUpdateSchedule(state, action);
		case TOGGLE_LOADING:
			return reduceToggleLoading(state, action);
		case UPDATE_CONTEXT_LIMIT:
			return reduceUpdateContextLimit(state, action);
		default:
			return state;
	}
}

function reduceCreateDefaultScheduleStructure(state: state.Schedule, action: Action<any>) {
	const { channelId, assetLimit, timeLimit } = action.payload;

	return {
		...state,
		[channelId]: {
			list: [],
			assetLimit,
			timeLimit,
			loading: true
		}
	};
}

function reduceUpdateSchedule(state: state.Schedule, action: Action<any>) {
	const { channelId, nextChunk } = action.payload;

	return {
		...state,
		[channelId]: {
			...state[channelId],
			list: uniqBy([...selectSchedulesFromNow(channelId, state), ...nextChunk], 'id')
		}
	};
}

function reduceToggleLoading(state: state.Schedule, action: Action<any>) {
	const { newState, channelId } = action.payload;

	return {
		...state,
		[channelId]: {
			...state[channelId],
			loading: newState
		}
	};
}

function reduceUpdateContextLimit(state: state.Schedule, action: Action<any>) {
	const { channelId, assetLimit, timeLimit } = action.payload;

	return {
		...state,
		[channelId]: {
			...state[channelId],
			assetLimit,
			timeLimit
		}
	};
}

function selectSchedulesFromNow(channelId: string, scheduleState: state.Schedule) {
	const allSchedules = scheduleState[channelId].list;
	const now = Date.now();
	return allSchedules.filter(item => item.endDate.getTime() > now);
}
