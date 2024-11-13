import {
	createDefaultScheduleStructure as createDefaultLinearScheduleStructure,
	updateContextLimit as updateLinearContextLimit
} from '../linear/actions';
import { createSchedulePuller, stopPullForChannel } from '../linear/schedulePuller';
import { selectScheduleInfo } from '../linear/selectors';
import { DEFAULT_ASSET_LIMIT, DEFAULT_TIME_LIMIT } from 'shared/linear/schedulePuller';

const initialState: state.Schedule = {};
const UPDATE_SCHEDULE = '@schedule/UPDATE_SCHEDULE';
const CREATE_DEFAULT_SCHEDULE_STRUCTURE = '@schedule/CREATE_DEFAULT_SCHEDULE_STRUCTURE';
const UPDATE_CONTEXT_LIMIT = '@schedule/UPDATE_CONTEXT_LIMIT';
const TOGGLE_LOADING = '@schedule/TOGGLE_LOADING';

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

export const createDefaultScheduleStructure = (channelId, limit: number) => {
	return {
		type: CREATE_DEFAULT_SCHEDULE_STRUCTURE,
		payload: {
			channelId,
			contextLimit: limit
		}
	};
};

export const destroySchedule = channelId => dispatch => {
	stopPullForChannel(channelId);
	dispatch(updateLinearContextLimit(channelId, DEFAULT_ASSET_LIMIT, DEFAULT_TIME_LIMIT));
};

export const initScheduleCreator = createSchedulePuller => (
	channelId: string,
	assetLimit: number = DEFAULT_ASSET_LIMIT,
	timeLimit: number = DEFAULT_TIME_LIMIT
) => (dispatch, getState: () => state.Root) => {
	// we should not request (and cache) EPGs on the server side
	if (_SERVER_) return;

	/* Show loader on initial loading but avoid in on refetches */
	let isFirstTime = !getState().schedule.hasOwnProperty(channelId);

	const onTaskComplete = nextChunk => {
		dispatch(updateChannelSchedule(channelId, nextChunk));
		const isLoading = selectScheduleInfo(channelId, getState()).loading;
		if (isLoading) {
			dispatch(toggleLoading(channelId, false));
		}
	};

	const getChannelScheduleInfo = channelId => selectScheduleInfo(channelId, getState());

	const poll = createSchedulePuller(onTaskComplete, getChannelScheduleInfo);

	if (isFirstTime) {
		dispatch(createDefaultLinearScheduleStructure(channelId, assetLimit, timeLimit));
	}

	const currentLimitForChannel = selectScheduleInfo(channelId, getState()).contextLimit;
	if (assetLimit > currentLimitForChannel) {
		dispatch(updateLinearContextLimit(channelId, assetLimit, timeLimit));
	}

	dispatch(updateChannelSchedule(channelId));

	poll(channelId, assetLimit);
};

export const initSchedule = initScheduleCreator(createSchedulePuller);

export function updateChannelSchedule(channelId, nextChunk = []) {
	return {
		type: UPDATE_SCHEDULE,
		payload: {
			channelId,
			nextChunk
		}
	};
}

export function toggleLoading(channelId, newState: boolean) {
	return {
		type: TOGGLE_LOADING,
		payload: {
			newState,
			channelId
		}
	};
}

export function updateContextLimit(channelId: string, newContextLimit: number) {
	return {
		type: UPDATE_CONTEXT_LIMIT,
		payload: {
			channelId,
			contextLimit: newContextLimit
		}
	};
}

function reduceCreateDefaultScheduleStructure(state: state.Schedule, action: Action<any>) {
	const { channelId, contextLimit } = action.payload;

	return {
		...state,
		[channelId]: {
			list: [],
			contextLimit,
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
			list: [...selectSchedulesFromNow(state, channelId), ...nextChunk]
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
	const { contextLimit, channelId } = action.payload;

	return {
		...state,
		[channelId]: {
			...state[channelId],
			contextLimit
		}
	};
}

function selectSchedulesFromNow(scheduleState: state.Schedule, channelId: string) {
	const allSchedules = scheduleState[channelId].list;
	const now = Date.now();
	return allSchedules.filter(item => item.endDate.getTime() > now);
}
