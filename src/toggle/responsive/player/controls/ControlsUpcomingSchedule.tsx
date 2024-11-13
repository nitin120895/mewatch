import * as React from 'react';
import UpcomingSchedule from './icons/UpcomingScheduleIcon';

interface OwnProps {
	className?: string;
	toggleOverlay: () => void;
}

export default class ControlsUpcomingSchedule extends React.PureComponent<OwnProps> {
	render() {
		const { className, toggleOverlay } = this.props;
		return (
			<div className={className} onClick={toggleOverlay}>
				<UpcomingSchedule />
			</div>
		);
	}
}
