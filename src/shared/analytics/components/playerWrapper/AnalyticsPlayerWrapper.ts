import { BasePlayerWrapper } from 'ref/responsive/player/BasePlayerWrapper';
import { PlayerEventType, PlayerState } from 'ref/responsive/player/Player';
import { PlayerAction } from 'toggle/responsive/player/Player';
import { IPlayerStateData } from 'shared/analytics/types/playerStatus';
import { IVideoProgress } from 'shared/analytics/types/v3/event/videoEvents';
import { secondsToMinutes } from 'shared/util/time';
import { AnalyticsContext } from '../../types/types';
import { Actions, PlayerStateMachine, States } from './PlayerStatus';
import { StartoverInfo } from 'shared/analytics/api/video';

const {
	Initialise,
	RequestVideo,
	Play,
	Buffer,
	Seek,
	SeekEnd,
	Pause,
	Complete,
	Restart,
	ChainPlay,
	Progress,
	Error,
	ToggleFullScreen,
	SetVolume,
	ActuatePlay,
	ActuatePause,
	CanPlay,
	SetResumePoint,
	WaitForUser,
	AdLoaded,
	AdStarted,
	AdProgress,
	AdQuartile,
	AdPaused,
	AdCompleted,
	AdSkipped,
	AdVolumeChanged,
	Dispose,
	FirstPlaying,
	SelectAudio,
	SelectQuality,
	SelectSubtitle,
	ToggleStartOver,
	WatchCompleted
} = Actions;

// Because the player doesn't strictly track it's own state, it doesn't emit "true" states, just relevant
// descriptions of approximate state. So we map to our own actions/state
const emitEventToAction: { [key: string]: Actions } = {
	[PlayerState.LOADING]: RequestVideo,
	[PlayerState.BUFFERING]: Buffer,
	[PlayerState.SEEKING]: Seek,
	[PlayerState.PAUSED]: Pause,
	[PlayerState.PLAYING]: Play,
	[PlayerState.ENDED]: Complete,
	[PlayerState.AVAILABLE]: Initialise,
	[PlayerState.READY]: WaitForUser,
	[PlayerAction.Restart]: Restart,
	[PlayerAction.PlayNext]: ChainPlay,
	[PlayerAction.Squeezeback]: Complete,
	[PlayerAction.Fullscreen]: ToggleFullScreen,
	[PlayerAction.SetVolume]: SetVolume,
	[PlayerAction.ActuatePause]: ActuatePause,
	[PlayerAction.ActuatePlay]: ActuatePlay,
	[PlayerAction.ActuateSeek]: Seek,
	[PlayerAction.ActuateSeekEnd]: SeekEnd,
	[PlayerAction.CanPlay]: CanPlay,
	[PlayerAction.FirstPlaying]: FirstPlaying,
	[PlayerAction.AdLoaded]: AdLoaded,
	[PlayerAction.AdStarted]: AdStarted,
	[PlayerAction.AdProgress]: AdProgress,
	[PlayerAction.AdQuartile]: AdQuartile,
	[PlayerAction.AdPaused]: AdPaused,
	[PlayerAction.AdCompleted]: AdCompleted,
	[PlayerAction.AdSkipped]: AdSkipped,
	[PlayerAction.AdVolumeChanged]: AdVolumeChanged,
	[PlayerAction.Dispose]: Dispose,
	[PlayerAction.SetResumePoint]: SetResumePoint,
	[PlayerAction.SelectAudio]: SelectAudio,
	[PlayerAction.SelectQuality]: SelectQuality,
	[PlayerAction.SelectSubtitle]: SelectSubtitle,
	[PlayerAction.ToggleStartOver]: ToggleStartOver,
	[PlayerAction.WatchCompleted]: WatchCompleted
};

const getProgressFromPropertiesEvent = ({ currentTime: seconds, duration, streamBandwidth }): IVideoProgress => ({
	seconds,
	duration,
	bitRate: streamBandwidth,
	minutes: secondsToMinutes(seconds),
	percent: Math.floor((seconds / duration) * 100)
});

class AnalyticsPlayerWrapper<P extends BasePlayerWrapper> {
	private state: States = States.DEFAULT;
	private data: IPlayerStateData = {
		isUserEnacted: false
	};

	private path: string;
	private item: api.ItemDetail;
	private startoverInfo: StartoverInfo;

	constructor(
		player: P,
		item,
		private emitVideoEvent: AnalyticsContext['emitVideoEvent'],
		startoverInfo: StartoverInfo
	) {
		this.item = item;
		this.startoverInfo = startoverInfo;
		this.wrapPlayer(player);
	}

	private wrapPlayer(player: P) {
		const { emit, selectMedia, initPlayback } = player;
		player.emit = (type: PlayerEventType, data: any) => {
			this.mapPlayerEmittedEvent(type, data);
			return emit.apply(player, [type, data]);
		};
		player.selectMedia = (media: api.MediaFile[]): api.MediaFile => {
			const mediaFile = selectMedia.apply(player, [media]);
			this.path = mediaFile && mediaFile.url;
			return mediaFile;
		};
		player.initPlayback = (...args) => {
			this.transition(Initialise, { item: this.item, startoverInfo: this.startoverInfo });
			return initPlayback.apply(player, args);
		};
	}

	private mapPlayerEmittedEvent(type: PlayerEventType, data: any): void {
		switch (type) {
			case 'state':
				return this.transition(emitEventToAction[data], {});
			case 'action':
				if (data.name === PlayerAction.PlayNext) {
					let { countdown, item: nextItem } = data.payload;
					return this.transition(emitEventToAction[data.name], { countdown, nextItem });
				} else {
					return this.transition(emitEventToAction[data.name], data);
				}
			case 'properties':
				return this.transition(Progress, getProgressFromPropertiesEvent(data));
			case 'error':
				return this.transition(Error, { error: data });
		}
	}

	private transition(action: Actions, { isUserEnacted = false, ...data }) {
		const state = PlayerStateMachine[this.state][action] || this.state;
		const path = this.path ? { path: this.path } : {};
		this.emitVideoEvent({ type: 'action', action, data });
		if (state !== this.state) {
			this.state = state;
			this.data = { ...this.data, ...data, ...path, isUserEnacted };
			this.emitVideoEvent({ type: 'state', state, data: this.data });
		}
	}
}

/*
 * We wrap the player to tap into methods/calls and update our own state transition table (PlayerStatus.ts)
 * We can't rely on the player methods or events themselves as the player does mapping from various
 * different video states. We also need to handle user input and keep some local state.
 *
 * For example when a BUFFER event is emitted, it might be buffering/loading/seeking so we need to make sure our
 * transition is legal and valid for our use case.
 * */
export function wrapPlayer<P extends BasePlayerWrapper>(
	item: api.ItemDetail,
	player: P,
	emitVideoEvent: AnalyticsContext['emitVideoEvent'] | undefined,
	startoverInfo?: StartoverInfo
): P {
	if (!emitVideoEvent) {
		return player;
	}
	new AnalyticsPlayerWrapper(player, item, emitVideoEvent, startoverInfo);
	return player;
}
