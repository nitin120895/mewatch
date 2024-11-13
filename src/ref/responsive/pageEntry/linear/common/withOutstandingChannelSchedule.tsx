import * as React from 'react';
import { compose } from 'redux';
import { ChannelScheduleEntityProps } from './types';
import { getOutstandingSchedules, getCurrentProgram, isNoScheduledItem } from './utils';
import withChannelSchedule from './withChannelSchedule';

/**
 * Use it for subscribing on channel schedule with assets that are airing or next ones.
 * Once an airing asset ends, it is going to be excluded from the `schedules` list.
 *
 * The wrapped Component receives such props:
 * @param {api.ItemSchedule[]} schedules - The list of outstanding schedules.
 * @param {api.ItemSchedule?} currentProgram - The airing schedule.
 * @param {boolean} noScheduledItem - Indicates whether the list of schedules is empty or not.
 *
 * Since the HOC is wrapped by `withChannelSchedule` it expects to get configuration for its wrapper:
 * @param {number} assetLimit - The limit for loading assets.
 * @param {number} timeLimit - The time range of loading assets from now.
 *
 * @returns {Function} - Returns the function to be called with passed Component to be extended.
 */
function withOutstandingSchedule<OwnProps>(Component) {
	return class extends React.PureComponent<OwnProps & ChannelScheduleEntityProps> {
		state = {
			schedules: [],
			currentProgram: undefined,
			noScheduledItem: false
		};
		private timeout: number;

		componentWillMount() {
			this.refreshSchedules(this.props.schedules);
		}

		componentWillReceiveProps(nextProps: OwnProps & ChannelScheduleEntityProps) {
			if (this.props.schedules.length !== nextProps.schedules.length) {
				this.refreshSchedules(nextProps.schedules);
			}
		}

		componentWillUnmount() {
			this.clear();
		}

		private setRefreshTimer = () => {
			this.clear();
			const { currentProgram } = this.state;

			if (currentProgram) {
				const nextRefresh = currentProgram.endDate.getTime() - Date.now();

				if (nextRefresh > 0) this.timeout = window.setTimeout(this.refreshSchedules, nextRefresh);
			}
		};

		private refreshSchedules = (nextSchedules?: api.ItemSchedule[]) => {
			const schedules = nextSchedules || this.state.schedules;
			const outstandingSchedules = getOutstandingSchedules(schedules);

			const nextState = {
				schedules: outstandingSchedules,
				currentProgram: getCurrentProgram(outstandingSchedules),
				noScheduledItem: isNoScheduledItem(outstandingSchedules)
			};

			this.setState(nextState, this.setRefreshTimer);
		};

		private clear() {
			if (this.timeout) window.clearTimeout(this.timeout);
		}

		render() {
			return <Component {...this.props} {...this.state} />;
		}
	};
}

export default function(assetLimit: number, timeLimit: number) {
	return compose(
		withChannelSchedule(assetLimit, timeLimit),
		withOutstandingSchedule
	);
}
