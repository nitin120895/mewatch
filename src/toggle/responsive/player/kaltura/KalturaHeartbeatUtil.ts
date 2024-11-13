import { get } from 'shared/util/objects';

export enum HeartbeatActions {
	HIT = 'HIT',
	FIRST_PLAY = 'FIRST_PLAY',
	PLAY = 'PLAY',
	STOP = 'STOP',
	LOAD = 'LOAD'
}

export enum KalturaHeartbeatActionTypes {
	sendPlaybackHeartbeat = 'heartbeat/SEND_HEARTBEAT'
}

export interface HeartbeatSaveResumePositionAction {
	type: KalturaHeartbeatActionTypes.sendPlaybackHeartbeat;
	payload: {
		result: boolean;
		executionTime: number;
	};
}

interface HeartbeatRequest {
	headers: {};
	method: string;
	body: string;
}

interface HeartbeatBookmark {
	objectType: string;
	id: string;
	type: string;
	position: number;
	playerData: {
		objectType: string;
		action: HeartbeatActions;
		averageBitrate: number;
		totalBitrate: number;
		currentBitrate: number;
		fileId: string;
	};
	programId: string;
	isReportingMode: boolean;
}

interface HeartbeatRequestBody {
	partnerId: string;
	apiVersion: string;
	ks: string;
	bookmark: HeartbeatBookmark;
}

export interface ChromecastHeartbeatRequest {
	partnerId: string;
	session: string;
	customId: string;
	mediaId: string;
}

interface HeartbeatInputArgs {
	item: api.ItemSummary;
	position: number;
	kalturaSession: string;
	playbackConfig: api.AppConfigPlayback;
	action?: HeartbeatActions;
}

export const getKalturaHeartbeatUrl = (): string => process.env.CLIENT_KALTURA_HEARTBEAT_URL;

const createHeartbeatRequest = (params: HeartbeatInputArgs): HeartbeatRequest => ({
	headers: { 'Content-Type': 'application/json' },
	method: 'POST',
	body: JSON.stringify(createHeartbeatRequestBody(params))
});

const createHeartbeatRequestBody = ({
	item,
	position,
	kalturaSession,
	playbackConfig,
	action
}: HeartbeatInputArgs): HeartbeatRequestBody => ({
	partnerId: playbackConfig.kalturaPartnerId,
	apiVersion: '5.0',
	ks: kalturaSession,
	bookmark: <HeartbeatBookmark>{
		objectType: 'KalturaBookmark',
		id: item.customId,
		type: 'media',
		position,
		playerData: {
			objectType: 'KalturaBookmarkPlayerData',
			action,
			averageBitrate: 1,
			totalBitrate: 1,
			currentBitrate: 1,
			fileId: get(item, 'customFields.MediaFileId')
		},
		programId: item.customId,
		isReportingMode: false
	}
});

export const createCastHeartbeatRequest = (
	item: api.ItemDetail,
	session: string,
	partnerId: string,
	media: api.MediaFile
): ChromecastHeartbeatRequest => ({
	partnerId,
	session,
	customId: item.customId,
	mediaId: get(media, 'id')
});

export const sendPlaybackHeartbeat = (params: HeartbeatInputArgs): Promise<Response> => {
	return fetch(getKalturaHeartbeatUrl(), createHeartbeatRequest(params));
};
