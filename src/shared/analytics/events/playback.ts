import { merge, Observable, zip } from 'rxjs';
import {
	audit,
	bufferCount,
	distinctUntilKeyChanged,
	filter,
	map,
	share,
	startWith,
	withLatestFrom,
	take
} from 'rxjs/operators';
import { getCurrentProgram, isChannel } from 'ref/responsive/pageEntry/linear/common/utils';
import { PlayerAction } from 'ref/responsive/player/Player';
import { ANALYTICS_EVENT } from 'shared/analytics/analyticsWorkflow';
import { Actions, States } from 'shared/analytics/components/playerWrapper/PlayerStatus';
import { toEvent, withItemContext } from 'shared/analytics/events/toEvent';
import { getItemData } from 'shared/analytics/getContext';
import { MixpanelEntryPoint } from 'shared/analytics/mixpanel/util';
import { IPlayerStateData, VideoPlayerActions, VideoPlayerStates } from 'shared/analytics/types/playerStatus';
import { StreamHandler } from 'shared/analytics/types/stream';

import {
	DomEventSourceType,
	DomTriggerPoints,
	EventName,
	IVideoAction,
	IVideoState,
	PlayerType,
	VideoEvent
} from 'shared/analytics/types/types';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { AnalyticsEventMap } from 'shared/analytics/types/v3/event/analyticsEventMap';
import { IVideoErrorTrackingEventDetail, IVideoProgress } from 'shared/analytics/types/v3/event/videoEvents';
import { isActionOfType, isEventOfSource, isEventOfType } from 'shared/analytics/util/stream';
import { isEmptyObject, isObject } from 'shared/util/objects';
import { PlayerTrackInformation } from 'toggle/responsive/player/Player';

// We pass events around like this
type StreamData = {
	data: IPlayerStateData;
	detail: IVideoProgress;
	entryPoint?: string;
	state: States;
	playedAudioLang?: PlayerTrackInformation;
	playedSubtitleLang?: PlayerTrackInformation;
	player?: any;
	trigger?: string;
	videoQuality?: string;
	startTime?: Date;
};

type StreamActionData = StreamData & {
	data: {
		name: PlayerAction;
		payload: any;
	};
};

const {
	VIDEO_RESUMED,
	VIDEO_SEEKED,
	VIDEO_ACTUATE_PAUSE,
	VIDEO_PAUSED,
	VIDEO_COMPLETED,
	VIDEO_PLAYING,
	VIDEO_AD_LOADED,
	VIDEO_AD_STARTED,
	VIDEO_AD_PAUSED,
	VIDEO_AD_PROGRESS,
	VIDEO_AD_QUARTILE,
	VIDEO_AD_COMPLETED,
	VIDEO_AD_SKIPPED,
	VIDEO_AD_VOLUMECHANGED,
	VIDEO_FIRST_PLAYING,
	VIDEO_ACTUATE_PLAY,
	VIDEO_ITEM_CLICKED,
	VIDEO_LINEAR_PROGRAM_UPDATED,
	VIDEO_SELECT_AUDIO,
	VIDEO_SELECT_QUALITY,
	VIDEO_SELECT_SUBTITLE,
	VIDEO_WATCH_COMPLETED
} = AnalyticsEventType;
const { VIDEO_ERROR, VIDEO_PROGRESSED, VIDEO_RESTARTED, VIDEO_CHAINPLAYED, VIDEO_REQUESTED } = AnalyticsEventType;
const {
	VIDEO_INITIALIZED,
	VIDEO_BUFFERING,
	VIDEO_ACTIONED,
	VIDEO_CAN_PLAY,
	VIDEO_EXIT,
	VIDEO_START_OVER_CLICKED
} = AnalyticsEventType;

const { INITIAL, LOADING, PLAYING, BUFFERING, COMPLETED, ERROR, PAUSED, SEEKING } = States;
const {
	SeekEnd,
	Restart,
	ChainPlay,
	Progress,
	ToggleFullScreen,
	Error,
	AdLoaded,
	AdStarted,
	AdProgress,
	AdQuartile,
	AdPaused,
	AdCompleted,
	AdSkipped,
	AdVolumeChanged,
	ActuatePause,
	CanPlay,
	Dispose,
	FirstPlaying,
	ActuatePlay,
	SelectAudio,
	SelectQuality,
	SelectSubtitle,
	ToggleStartOver,
	WatchCompleted
} = Actions;

const mapStateToStreamData = ({ data: { path, ...data }, state }: IVideoState, waitTime?: number): StreamData => ({
	data,
	detail: { path, ...(waitTime ? { waitTime } : {}) },
	state
});

const addProgressToStreamData = ({ data, detail, state }: StreamData, progress: IVideoProgress): StreamData => {
	return {
		data,
		detail: { ...detail, ...progress },
		state
	};
};

const addDomTriggerToStreamData = ({ data, detail, state }: StreamData, progress, trigger: string): StreamData => {
	return {
		...addProgressToStreamData({ data, detail, state }, progress),
		trigger
	};
};

const getDetailFromStreamData = (streamData: StreamData) => {
	const {
		detail: video,
		data: { startoverInfo, seekEnd },
		entryPoint,
		player,
		playedAudioLang,
		playedSubtitleLang,
		trigger,
		videoQuality,
		startTime
	} = streamData;

	const playerType = PlayerType.Kaltura;

	const { data: streamInfo } = player;

	let subtitleLanguages;
	if (Array.isArray(streamInfo) && streamInfo.length > 0) {
		const { subtitlesCollection } = streamInfo[0];

		if (Array.isArray(subtitlesCollection)) {
			subtitleLanguages = subtitlesCollection.map(subtitle => subtitle.language.toLowerCase());
		}
	}

	return {
		currentTime: video.seconds,
		entryPoint,
		playedAudioLang,
		playedSubtitleLang,
		playerType,
		seekEnd,
		seekStart: video.seconds,
		startTime,
		startoverInfo,
		subtitleLanguages,
		trigger,
		video,
		videoQuality
	};
};

const getContextFromStreamData = ({ data: { item } }: StreamData, ctx) => ({ ...ctx, item });
const getRestartDetails = () => ({
	entryPoint: MixpanelEntryPoint.Replay
});
const noWaitTime = ({ detail: { path, bitRate, duration, minutes, percent, seconds } }: StreamData) => ({
	video: { path, bitRate, duration, minutes, percent, seconds }
});

const getChainplayDetail = ({ data: { countdown, nextItem } }: StreamData) => ({
	countDown: countdown,
	nextItem: getItemData(nextItem)
});

const getCanPlayDetail = ({ data: { audioLanguages, isAdPlaying } }: StreamData) => ({
	audioLanguages,
	isAdPlaying
});

const getVideoErrorDetail = ({ data: { error }, detail }: StreamData): IVideoErrorTrackingEventDetail => ({
	video: detail,
	error: {
		type: 'video',
		status: '0',
		message: error.message,
		path: detail.path,
		data: error.message,
		isFatal: (<any>error).isFatal || false,
		code: error.code
	}
});

const getVideoActionDetail = (streamData: StreamActionData) => {
	const {
		data: { name: action, payload }
	} = streamData;

	return {
		...getDetailFromStreamData(streamData),
		action,
		value: payload
	};
};

const getVideoItemDetail = (streamData: StreamActionData) => {
	const {
		data: { entryPoint, index, listSize, selectedItem }
	} = streamData;

	return {
		...getDetailFromStreamData(streamData),
		cardTotal: listSize,
		entryPoint,
		position: index,
		selectedItem
	};
};

const getAdDetail = ({ data: { name: action, payload } }: StreamActionData) => ({
	action,
	payload
});

const getInitialDetail = ({ data: { item, startoverInfo } }: StreamData) => ({
	item,
	startoverInfo
});

const getItemPath = ({ data: { item } }: StreamData) => item.path;

export const playbackStreamHandler: StreamHandler = function playbackStreamHandler({
	VIDEO,
	CONTEXT,
	DOM_EVENT,
	STATE,
	ACTION
}) {
	const videoData$ = STATE.pipe(
		map(state => state && state.player),
		filter(player => isObject(player) && player.entryId && !isEmptyObject(player.players)),
		map(player => {
			const { players, entryId, entryPoint, playedAudioLang, playedSubtitleLang, videoQuality, startTime } = player;
			return {
				entryPoint,
				playedAudioLang,
				playedSubtitleLang,
				player: players[entryId],
				videoQuality,
				startTime
			};
		})
	);

	const schedule$ = STATE.pipe(
		map(state => state && state.schedule),
		filter(schedule => isObject(schedule))
	);

	const state$ = VIDEO.pipe(
		filter((event: VideoEvent): event is IVideoState => event.type === 'state'),
		distinctUntilKeyChanged('state')
	);

	const seekTrigger$ = DOM_EVENT.pipe(
		isEventOfType(EventName.MOUSEDOWN, EventName.TOUCHEND),
		isEventOfSource(DomEventSourceType.Trigger),
		map(({ data: { trigger } }) => trigger),
		startWith(DomTriggerPoints.Scrubber)
	);

	const action$ = filter((event: VideoEvent): event is IVideoAction => event.type === 'action')(VIDEO);

	const progressData$ = action$.pipe(
		filter(({ action }: IVideoAction) => action === Progress),
		startWith({ data: { seconds: undefined } }),
		map(({ data }) => data),
		distinctUntilKeyChanged('seconds')
	);

	const onStatusSequence = (...targetStates: VideoPlayerStates[]) =>
		state$.pipe(
			map(value => ({ timestamp: Date.now(), value })),
			bufferCount(targetStates.length, 1),
			filter(matchStates => matchStates.every(({ value: { state } }, i) => targetStates[i] === state)),
			map(([{ timestamp: start }, ...rest]) => {
				const { timestamp: end, value } = rest.pop();
				return mapStateToStreamData(value, end - start);
			}),
			share()
		);

	const onState = (matchState: VideoPlayerStates) =>
		state$.pipe(
			filter(({ state }) => state === matchState),
			map(state => mapStateToStreamData(state))
		);

	const onAction = (matchAction: VideoPlayerActions) =>
		action$.pipe(
			filter(({ action }: IVideoAction) => action === matchAction),
			withLatestFrom(
				state$,
				({ data: actionData }, { type, data, state }): IVideoState => ({
					type,
					state,
					data: { ...data, ...actionData }
				})
			),
			map(state => mapStateToStreamData(state))
		);

	type Mapper<T extends keyof AnalyticsEventMap> = (streamData: StreamData) => AnalyticsEventMap[T]['detail'];

	const videoEvent = <T extends keyof AnalyticsEventMap>(
		trigger$: Observable<StreamData>,
		type: T,
		getDetail: Mapper<T> = getDetailFromStreamData
	) =>
		trigger$.pipe(
			withLatestFrom(videoData$, schedule$, (streamData, videoData, scheduleData) => {
				const { item } = streamData.data;
				let result = {
					...streamData,
					...videoData
				};

				// If scheduleItem is not ready at the time of event, then populate it from the store
				if (isChannel(item) && !item.scheduleItem) {
					const scheduleItem = getCurrentProgram(scheduleData[item.id].list);
					const itemWithSchedule = {
						...item,
						scheduleItem
					};

					const newStreamData = {
						...streamData,
						data: {
							...streamData.data,
							item: itemWithSchedule
						}
					};

					result = { ...result, ...newStreamData };
				}

				return result;
			}),
			toEvent(type, getDetail),
			withItemContext(CONTEXT, getContextFromStreamData)
		);

	const videoProgressEvent = <T extends keyof AnalyticsEventMap>(
		trigger$: Observable<any>,
		type: T,
		getDetail: Mapper<T> = getDetailFromStreamData
	) => {
		return videoEvent(trigger$.pipe(withLatestFrom(progressData$, addProgressToStreamData)), type, getDetail);
	};

	const videoSeekEvent = <T extends keyof AnalyticsEventMap>(
		trigger$: Observable<StreamData>,
		type: T,
		getDetail: Mapper<T> = getDetailFromStreamData
	) => {
		return videoEvent(
			trigger$.pipe(withLatestFrom(progressData$, seekTrigger$, addDomTriggerToStreamData)),
			type,
			getDetail
		);
	};

	const progressEvent$ = progressData$.pipe(
		withLatestFrom(state$, (progress, state) => ({ progress, state })),
		filter(({ state }) => [PLAYING, COMPLETED].includes(state.state)),
		map(({ state, progress }) => addProgressToStreamData(mapStateToStreamData(state), progress))
	);

	const LoadEvent$ = onState(LOADING).pipe(map(() => Date.now()));
	const BufferOrSeek$ = merge(onState(BUFFERING), onState(SEEKING)).pipe(map(() => Date.now()));

	const waitTime$ = merge(LoadEvent$, BufferOrSeek$).pipe(
		audit(() => onState(PLAYING).pipe(take(1))),
		map(initWait => Date.now() - initWait)
	);

	const playingEvent$ = zip(onState(PLAYING), waitTime$).pipe(
		map(([{ detail, ...streamData }, waitTime]) => ({ detail: { ...detail, waitTime }, ...streamData }))
	);

	// Video Item refers to items that part of the video player
	// e.g. Episode selector items, EOP recommendations
	const videoItemClicked = () =>
		DOM_EVENT.pipe(
			isEventOfType(EventName.CLICK),
			isEventOfSource(DomEventSourceType.VideoItem)
		);

	const currentProgramUpdated = () =>
		ACTION.pipe(
			isActionOfType(ANALYTICS_EVENT),
			map(({ payload }) => payload),
			filter(({ event }) => event === AnalyticsEventType.VIDEO_LINEAR_PROGRAM_UPDATED),
			map(({ data }) => {
				return {
					data: data.payload
				};
			})
		);

	const errorResource$ = action$.pipe(
		filter(({ action }: IVideoAction) => action === Error),
		toEvent(VIDEO_ERROR, ({ data }) =>
			getVideoErrorDetail({ data, detail: { path: '' }, state: VideoPlayerStates.ERROR })
		),
		withItemContext(CONTEXT, ({ data: { item } }, ctx) => ({ ...ctx, item: getItemData(item) }))
	);

	const error$ = onState(ERROR).pipe(
		withLatestFrom(progressData$, addProgressToStreamData),
		toEvent(VIDEO_ERROR, getVideoErrorDetail),
		withItemContext(CONTEXT, getContextFromStreamData)
	);

	const completedItem$ = onState(COMPLETED).pipe(
		map(getItemPath),
		startWith('')
	);

	// We need to filter out dispose events for completed items
	const disposeEvent$ = onAction(Dispose).pipe(
		withLatestFrom(completedItem$),
		filter(([disposeEvent, completedItem]) => getItemPath(disposeEvent) !== completedItem),
		map(([disposeEvent]) => disposeEvent)
	);

	const events = [
		videoEvent(onState(INITIAL), VIDEO_INITIALIZED, getInitialDetail),
		videoProgressEvent(onState(BUFFERING), VIDEO_BUFFERING),
		videoProgressEvent(onState(COMPLETED), VIDEO_COMPLETED),
		videoProgressEvent(onAction(FirstPlaying), VIDEO_FIRST_PLAYING),
		videoProgressEvent(disposeEvent$, VIDEO_COMPLETED),
		videoProgressEvent(onAction(CanPlay), VIDEO_CAN_PLAY, getCanPlayDetail),
		videoProgressEvent(onAction(ActuatePause), VIDEO_ACTUATE_PAUSE),
		videoProgressEvent(onState(PAUSED), VIDEO_PAUSED),
		videoProgressEvent(onAction(ActuatePlay), VIDEO_ACTUATE_PLAY),
		videoProgressEvent(onStatusSequence(PAUSED, PLAYING), VIDEO_RESUMED, noWaitTime),
		videoEvent(onAction(AdLoaded), VIDEO_AD_LOADED, getAdDetail),
		videoEvent(onAction(AdStarted), VIDEO_AD_STARTED, getAdDetail),
		videoEvent(onAction(AdPaused), VIDEO_AD_PAUSED, getAdDetail),
		videoProgressEvent(onAction(AdProgress), VIDEO_AD_PROGRESS, getAdDetail),
		videoProgressEvent(onAction(AdQuartile), VIDEO_AD_QUARTILE, getAdDetail),
		videoEvent(onAction(AdCompleted), VIDEO_AD_COMPLETED, getAdDetail),
		videoEvent(onAction(AdSkipped), VIDEO_AD_SKIPPED, getAdDetail),
		videoProgressEvent(onAction(AdVolumeChanged), VIDEO_AD_VOLUMECHANGED, getAdDetail),
		videoSeekEvent(onAction(SeekEnd), VIDEO_SEEKED),
		videoProgressEvent(progressEvent$, VIDEO_PROGRESSED),
		videoProgressEvent(onAction(Restart), VIDEO_RESTARTED, getRestartDetails),
		videoEvent(onAction(ChainPlay), VIDEO_CHAINPLAYED, getChainplayDetail),
		videoProgressEvent(currentProgramUpdated(), VIDEO_LINEAR_PROGRAM_UPDATED),
		videoProgressEvent(onAction(SelectAudio), VIDEO_SELECT_AUDIO, getVideoActionDetail),
		videoProgressEvent(onAction(SelectQuality), VIDEO_SELECT_QUALITY, getVideoActionDetail),
		videoProgressEvent(onAction(SelectSubtitle), VIDEO_SELECT_SUBTITLE, getVideoActionDetail),
		videoProgressEvent(onAction(ToggleFullScreen), VIDEO_ACTIONED, getVideoActionDetail),
		videoProgressEvent(videoItemClicked(), VIDEO_ITEM_CLICKED, getVideoItemDetail),
		videoProgressEvent(onAction(ToggleStartOver), VIDEO_START_OVER_CLICKED, getVideoActionDetail),
		videoProgressEvent(onAction(WatchCompleted), VIDEO_WATCH_COMPLETED),
		videoProgressEvent(onAction(Dispose), VIDEO_EXIT),

		error$,
		errorResource$,

		// Timed Events
		videoEvent(onStatusSequence(INITIAL, LOADING), VIDEO_REQUESTED),

		videoProgressEvent(playingEvent$, VIDEO_PLAYING)
	];

	return {
		EVENT: merge(...events)
	};
};
