import { getItem, setItem } from 'shared/util/localStorage';
import { getCastPlayer } from './getCastPlayer';
import { PlayerState } from '../Player';
import CastPlayer from './CastPlayer';
import ControlsCast from '../controls/ControlsCast';
import WithCastPlayer from 'ref/responsive/player/cast/WithCastPlayer';

export enum CastState {
	IDLE = 'IDLE',
	LOADING = 'LOADING',
	LOADED = 'LOADED',
	PLAYING = 'PLAYING',
	PAUSED = 'PAUSED',
	STOPPED = 'STOPPED',
	ERROR = 'ERROR',
	BUFFERING = 'BUFFERING'
}

export enum RemotePlayerEvents {
	IS_CONNECTED = 'isConnected',
	CURRENT_TIME = 'currentTime',
	VOLUME_LEVEL = 'volumeLevel',
	IS_MUTED = 'isMuted',
	SAVED_PLAYER_STATE = 'savedPlayerState',
	MEDIA_INFO = 'mediaInfo',
	PLAYER_STATE = 'playerState',
	DURATION = 'duration'
}

export const CAST_INTRO = 'cast.intro';

export function changeCastIntroStatus(status: boolean) {
	setItem(CAST_INTRO, status.toString());
}

export function showCastIntro() {
	const value = getItem(CAST_INTRO);

	return (!value || value === 'false') && isCastAvailable();
}

export function isCastAvailable() {
	const player = getCastPlayer();
	return player && player.getLastState() !== PlayerState.NO_DEVICES_AVAILABLE;
}

// components
export { CastPlayer, ControlsCast, WithCastPlayer };
