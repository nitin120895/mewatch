import * as React from 'react';
import { connect } from 'react-redux';
import { ChannelScheduleEntityProps } from './types';
import { pullSchedule, releaseSchedule } from 'shared/linear/actions';
import { selectCurrentProgram, selectSchedules, selectLoading } from 'shared/linear/selectors';
import { isNoScheduledItem } from './utils';

const getChannelId = props => props.item.id;

export interface ChannelScheduleProps {
	className?: string;
	item: api.ItemSummary;
}

interface ScheduleFetchLifeCycle {
	pullSchedule: () => void;
	releaseSchedule: () => void;
}

/**
 * Use it for subscribing on a channel schedule.
 *
 * Once the HOC is mounted it subscribes on a channel schedule.
 * The subscription is released on unmount event.
 * The wrapped Component receives such props:
 * @param {api.ItemSchedule[]} schedules - The list of schedules.
 * @param {boolean} loading - The loading status.
 * @param {api.ItemSchedule?} currentProgram - The airing schedule.
 * @param {boolean} noScheduledItem - Indicates whether the list of schedules is empty or not.
 *
 * Configuration of the HOC:
 * @param {number} assetLimit - The limit for loading assets.
 * @param {number} timeLimit - The time range of loading assets from now.
 *
 * @returns {Function} - Returns the function to be called with passed Component to be extended.
 */
export default function withChannelSchedule<OwnProps>(assetLimit = 2, timeLimit = 8) {
	return Component => {
		function mapStateToProps(state: state.Root, ownProps: OwnProps): any {
			const channelId = getChannelId(ownProps);
			const schedules = selectSchedules(channelId, state);

			return {
				schedules,
				loading: selectLoading(channelId, state),
				currentProgram: selectCurrentProgram(channelId, state),
				noScheduledItem: isNoScheduledItem(schedules)
			};
		}

		function mapDispatchToProps(dispatch: Redux.Dispatch<any>, ownProps: OwnProps) {
			return {
				pullSchedule: () => dispatch(pullSchedule(getChannelId(ownProps), assetLimit, timeLimit)),
				releaseSchedule: () => dispatch(releaseSchedule(getChannelId(ownProps)))
			};
		}

		class ChannelSchedule extends React.PureComponent<OwnProps & ScheduleFetchLifeCycle> {
			componentDidMount() {
				this.props.pullSchedule();
			}

			componentWillUnmount() {
				this.props.releaseSchedule();
			}

			render() {
				return <Component {...this.props} />;
			}
		}

		return connect<ChannelScheduleEntityProps, any, any>(
			mapStateToProps,
			mapDispatchToProps
		)(ChannelSchedule);
	};
}
