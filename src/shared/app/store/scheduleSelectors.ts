export const selectSchedules = (state: state.Root, channelId: string) => {
	const scheduleInfo = selectScheduleInfo(state, channelId);

	return (scheduleInfo && scheduleInfo.list) || [];
};

export const selectCurrentProgram = (state: state.Root, channelId: string) => {
	return selectSchedules(state, channelId)[0];
};

export const selectScheduleInfo = (state: state.Root, channelId: string) => {
	return state.schedule[channelId];
};

export const selectLoading = (state: state.Root, channelId: string) => {
	const scheduleInfo = selectScheduleInfo(state, channelId);

	return scheduleInfo ? scheduleInfo.loading : true;
};
