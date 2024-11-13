export interface ChannelScheduleEntityProps {
	schedules: api.ItemSchedule[];
	currentProgram?: api.ItemSchedule;
	loading: boolean;
	noScheduledItem: boolean;
}
