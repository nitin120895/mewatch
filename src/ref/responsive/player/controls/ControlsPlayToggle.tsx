import * as React from 'react';
import { PlayerState } from '../Player';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import Spinner from '../../component/Spinner';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

interface ControlsPlayToggleProps extends React.Props<any> {
	className?: string;
	onClick: () => void;
	playbackStatus: PlayerState;
	showBuffering?: boolean;
}

export default (props: ControlsPlayToggleProps) => {
	const { className, playbackStatus, showBuffering } = props;
	const showSpinner = showBuffering && playbackStatus === PlayerState.BUFFERING;
	const buttonTitle = playbackStatus !== PlayerState.PLAYING ? `@{player_play|Play}` : `@{player_pause|Pause}`;

	return (
		<IntlFormatter
			elementType="button"
			className={className}
			onClick={props.onClick}
			tabIndex={showSpinner ? -1 : 3}
			formattedProps={{ 'aria-label': buttonTitle }}
		>
			{showSpinner ? <Spinner /> : playbackStatus !== PlayerState.PLAYING ? <PlayIcon /> : <PauseIcon />}
		</IntlFormatter>
	);
};
