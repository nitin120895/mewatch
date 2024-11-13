import * as React from 'react';
import { getFormattedPlayerTime } from 'shared/util/dates';

interface ControlsTimeLabelProps extends React.Props<any> {
	className?: string;
	time: number;
}

export default (props: ControlsTimeLabelProps) => {
	const { className, time } = props;

	return <div className={className}>{getFormattedPlayerTime(time)}</div>;
};
