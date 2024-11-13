import * as React from 'react';
import { connect } from 'react-redux';
import { initSchedule, destroySchedule } from 'shared/app/scheduleWorkflow';
import { selectCurrentProgram, selectLoading, selectSchedules } from 'shared/app/store/scheduleSelectors';
import { DEFAULT_ASSET_LIMIT, DEFAULT_TIME_LIMIT } from 'shared/linear/schedulePuller';

export interface ChannelScheduleProps {
	className?: string;
	item: api.ItemSummary;
	index?: number;
}

export interface ChannelScheduleEntityProps {
	schedules: api.ItemSchedule[];
	currentProgram?: api.ItemSchedule;
	loading: boolean;
}

interface ScheduleFetchLifeCycle {
	init: () => void;
	dispose: () => void;
}

function withSchedule<OwnProps>(Component) {
	return class extends React.PureComponent<OwnProps & ScheduleFetchLifeCycle> {
		// we should not request (and cache) EPGs on the server side
		componentDidMount() {
			this.props.init();
		}

		componentWillUnmount() {
			this.props.dispose();
		}

		render() {
			return <Component {...this.props} />;
		}
	};
}

const getChannelId = props => props.item.id;

export function withChannelSchedule<OwnProps>(assetLimit = DEFAULT_ASSET_LIMIT, timeLimit = DEFAULT_TIME_LIMIT) {
	return Component =>
		connect<ChannelScheduleEntityProps, any, OwnProps & ChannelScheduleProps>(
			(state, ownProps) => {
				const channelId = getChannelId(ownProps);
				const schedules = selectSchedules(state, channelId);

				return {
					schedules,
					loading: selectLoading(state, channelId),
					currentProgram: selectCurrentProgram(state, channelId)
				};
			},
			(dispatch, ownProps) => ({
				init: () => dispatch(initSchedule(getChannelId(ownProps), assetLimit, timeLimit)),
				dispose: () => dispatch(destroySchedule(getChannelId(ownProps)))
			})
		)(withSchedule(Component));
}
