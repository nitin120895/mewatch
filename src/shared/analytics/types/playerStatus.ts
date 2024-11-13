import { StartoverInfo } from 'shared/analytics/api/video';
import { VideoEntryPoint } from 'shared/analytics/types/types';
import { VideoError } from 'shared/util/VideoError';

export enum VideoPlayerStates {
	DEFAULT = 'DEFAULT',
	INITIAL = 'INITIAL',
	LOADING = 'LOADING',
	PLAYING = 'PLAYING',
	BUFFERING = 'BUFFERING',
	SEEKING = 'SEEKING',
	COMPLETED = 'COMPLETED',
	ERROR = 'ERROR',
	PAUSED = 'PAUSED',
	READY = 'READY',
	REQUESTED_PLAY = 'REQUESTED_PLAY',
	RESUMING = 'RESUMING'
}

export enum VideoPlayerActions {
	RequestVideo = 'RequestVideo',
	Play = 'Play',
	Buffer = 'Buffer',
	Seek = 'Seek',
	SeekEnd = 'SeekEnd',
	Error = 'Error',
	Pause = 'Pause',
	ChainPlay = 'ChainPlay',
	Restart = 'Restart',
	Complete = 'Complete',
	Initialise = 'Initialise',
	Progress = 'Progress',
	ToggleFullScreen = 'ToggleFullScreen',
	SetVolume = 'SetVolume',
	ActuatePlay = 'ActuatePlay',
	ActuatePause = 'ActuatePause',
	CanPlay = 'CanPlay',
	FirstPlaying = 'FirstPlaying',
	SetResumePoint = 'SetResumePoint',
	WaitForUser = 'WaitForUser',
	AdLoaded = 'AdLoaded',
	AdStarted = 'AdStarted',
	AdPaused = 'AdPaused',
	AdProgress = 'AdProgress',
	AdQuartile = 'AdQuartile',
	AdCompleted = 'AdCompleted',
	AdSkipped = 'AdSkipped',
	AdVolumeChanged = 'AdVolumeChanged',
	SelectAudio = 'SelectAudio',
	SelectQuality = 'SelectQuality',
	SelectSubtitle = 'SelectSubtitle',
	ToggleStartOver = 'ToggleStartOver',
	WatchCompleted = 'WatchCompleted',
	Dispose = 'Dispose'
}

export interface IPlayerStateData {
	index?: number;
	item?: any;
	listSize?: number;
	selectedItem?: api.ItemDetail;

	path?: string;
	entryPoint?: VideoEntryPoint;
	error?: VideoError;
	nextItem?: api.ItemDetail;
	countdown?: number;
	isUserEnacted?: boolean;
	isAdPlaying?: boolean;
	audioLanguages?: string[];
	volume?: number;
	muted?: boolean;
	seekEnd?: number;
	seekStart?: number;
	startoverInfo?: StartoverInfo;
}
