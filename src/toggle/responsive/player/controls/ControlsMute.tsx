import * as React from 'react';
import VolumeMutedIcon from './icons/VolumeMutedIcon';
import VolumeMaxIcon from './icons/VolumeMaxIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

interface ControlsMuteProps extends React.Props<any> {
	className?: string;
	onClick: () => void;
	isMuted?: boolean;
}

export default (props: ControlsMuteProps) => {
	const { className, onClick, isMuted } = props;

	return (
		<IntlFormatter
			elementType="button"
			className={className}
			onClick={onClick}
			formattedProps={{ 'aria-label': 'Mute' }}
		>
			{isMuted ? <VolumeMutedIcon /> : <VolumeMaxIcon />}
		</IntlFormatter>
	);
};
