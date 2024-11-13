import { getCurrentProgram } from 'ref/responsive/pageEntry/linear/common/utils';

export const selectSchedules = (channelId: string, state: state.Root) => {
	const scheduleInfo = selectScheduleInfo(channelId, state);
	return scheduleInfo ? scheduleInfo.list : [];
};

export const selectCurrentProgram = (channelId: string, state: state.Root) => {
	const schedules = selectSchedules(channelId, state);
	return getCurrentProgram(schedules);
};

export const selectLoading = (channelId: string, state: state.Root) => {
	const scheduleInfo = selectScheduleInfo(channelId, state);
	return scheduleInfo ? scheduleInfo.loading : true;
};

export const selectScheduleInfo = (channelId: string, state: state.Root) => {
	return state.schedule[channelId];
};
