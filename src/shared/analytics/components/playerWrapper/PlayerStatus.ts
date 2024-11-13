import { VideoPlayerActions, VideoPlayerStates } from 'shared/analytics/types/playerStatus';

const {
	DEFAULT,
	INITIAL,
	LOADING,
	PLAYING,
	BUFFERING,
	COMPLETED,
	ERROR,
	PAUSED,
	READY,
	REQUESTED_PLAY,
	SEEKING,
	RESUMING
} = VideoPlayerStates;
const {
	Initialise,
	RequestVideo,
	Play,
	Buffer,
	Seek,
	Error,
	Pause,
	Complete,
	Restart,
	ChainPlay,

	ActuatePlay,
	CanPlay,
	SetResumePoint,
	WaitForUser
} = VideoPlayerActions;

export const PlayerStateMachine = {
	[DEFAULT]: {
		[Initialise]: INITIAL,
		[Error]: ERROR
	},
	[INITIAL]: {
		[Error]: ERROR,
		[RequestVideo]: LOADING,
		[Buffer]: BUFFERING
	},
	[LOADING]: {
		[Error]: ERROR,
		[SetResumePoint]: RESUMING,
		[WaitForUser]: READY,
		[Play]: PLAYING
	},
	[RESUMING]: {
		[Seek]: SEEKING,
		[CanPlay]: READY
	},
	[READY]: {
		[Error]: ERROR,
		[Play]: PLAYING,
		[Pause]: PAUSED,
		[ActuatePlay]: REQUESTED_PLAY,
		[Seek]: SEEKING
	},
	[REQUESTED_PLAY]: {
		[Play]: PLAYING,
		[Buffer]: BUFFERING,
		[Error]: ERROR
	},
	[PLAYING]: {
		[Buffer]: BUFFERING,
		[Complete]: COMPLETED,
		[Error]: ERROR,
		[Initialise]: INITIAL,
		[Pause]: PAUSED,
		[Seek]: SEEKING
	},
	[SEEKING]: {
		[Error]: ERROR,
		[Initialise]: INITIAL,
		[Buffer]: BUFFERING,
		[CanPlay]: READY
	},
	[BUFFERING]: {
		[Error]: ERROR,
		[Initialise]: INITIAL,
		[CanPlay]: READY,
		[Seek]: SEEKING,
		[Play]: PLAYING
	},
	[COMPLETED]: {
		[Buffer]: LOADING,
		[Restart]: LOADING,
		[ChainPlay]: LOADING,
		[Initialise]: INITIAL
	},
	[ERROR]: {
		[Initialise]: INITIAL,
		[Play]: PLAYING
	},
	[PAUSED]: {
		[Complete]: COMPLETED,
		[Error]: ERROR,
		[Initialise]: INITIAL,
		[Play]: PLAYING,
		[Seek]: SEEKING
	}
};

export { VideoPlayerStates as States };
export { VideoPlayerActions as Actions };
export default PlayerStateMachine;
