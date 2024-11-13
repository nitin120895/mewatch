import * as React from 'react';
import { getFormattedPlayerTime } from 'shared/util/dates';

interface ControlsTimeProps extends React.Props<any> {
	className?: string;
	durationTime: number;
	currentTime: number;
}

export default (props: ControlsTimeProps) => {
	const { className, durationTime, currentTime } = props;

	return <div className={className}>{getFormattedPlayerTime(durationTime - currentTime)}</div>;
};
