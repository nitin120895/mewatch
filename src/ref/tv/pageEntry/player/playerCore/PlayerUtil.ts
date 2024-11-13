import { VideoErrorCode } from 'shared/util/VideoError';
import * as errorCodes from 'shared/util/errorCodes';

export function mapServiceErrorCodeToVideoErrorCode(serviceErrorCode: number, statusCode: number): VideoErrorCode {
	if (
		serviceErrorCode === errorCodes.PLAYBACK_AUTH_LOCATION_RESTRICTION ||
		serviceErrorCode === errorCodes.PLAYBACK_LOCATION_RESTRICTION
	) {
		return VideoErrorCode.GeoBlockedError;
	} else if (serviceErrorCode === errorCodes.PLAYBACK_FILES_NOT_AVAILABLE || (statusCode >= 400 && statusCode < 500)) {
		return VideoErrorCode.MediaUnavailable;
	} else if (statusCode >= 500 && statusCode < 600) {
		return VideoErrorCode.ServerError;
	} else {
		return VideoErrorCode.PlayerError;
	}
}
