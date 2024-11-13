import * as React from 'react';
import FullScreenIcon from './icons/FullScreenIcon';
import CloseFullScreenIcon from './icons/CloseFullScreenIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

interface ControlsFullScreenProps extends React.Props<any> {
	className?: string;
	onClick: () => void;
	isFullscreen: boolean;
}

export default (props: ControlsFullScreenProps) => {
	const { className, onClick, isFullscreen } = props;

	return (
		<IntlFormatter
			elementType="button"
			className={className}
			onClick={onClick}
			formattedProps={{ 'aria-label': '@{player_full_screen|Full screen}' }}
		>
			{isFullscreen ? <CloseFullScreenIcon /> : <FullScreenIcon />}
		</IntlFormatter>
	);
};
