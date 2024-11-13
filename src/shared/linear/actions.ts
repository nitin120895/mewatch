import { createSchedulePuller, stopPullForChannel } from './schedulePuller';
import { selectScheduleInfo } from './selectors';
import { CREATE_DEFAULT_SCHEDULE_STRUCTURE, UPDATE_SCHEDULE, TOGGLE_LOADING, UPDATE_CONTEXT_LIMIT } from './reducer';

export function pullSchedule(channelId: string, assetLimit: number, timeLimit: number): any {
	return (dispatch, getState) => {
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
			dispatch(createDefaultScheduleStructure(channelId, assetLimit, timeLimit));
		}

		const channelScheduleInfo = getChannelScheduleInfo(channelId) as any;
		if (assetLimit > channelScheduleInfo.assetLimit || timeLimit > channelScheduleInfo.timeLimit) {
			const nextAssetLimit = Math.max(assetLimit, channelScheduleInfo.assetLimit);
			const nextTimeLimit = Math.max(timeLimit, channelScheduleInfo.timeLimit);
			dispatch(updateContextLimit(channelId, nextAssetLimit, nextTimeLimit));
		}

		dispatch(updateChannelSchedule(channelId));

		poll(channelId);
	};
}

export function releaseSchedule(channelId: string): any {
	return dispatch => {
		stopPullForChannel(channelId);
		dispatch(updateContextLimit(channelId, 0, 0));
	};
}

export function createDefaultScheduleStructure(channelId: string, assetLimit: number, timeLimit: number) {
	return {
		type: CREATE_DEFAULT_SCHEDULE_STRUCTURE,
		payload: {
			channelId,
			assetLimit,
			timeLimit
		}
	};
}

function updateChannelSchedule(channelId: string, nextChunk = []) {
	return {
		type: UPDATE_SCHEDULE,
		payload: {
			channelId,
			nextChunk
		}
	};
}

function toggleLoading(channelId: string, newState: boolean) {
	return {
		type: TOGGLE_LOADING,
		payload: {
			newState,
			channelId
		}
	};
}

export function updateContextLimit(channelId: string, assetLimit: number, timeLimit: number) {
	return {
		type: UPDATE_CONTEXT_LIMIT,
		payload: {
			channelId,
			assetLimit,
			timeLimit
		}
	};
}
