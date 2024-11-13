import { VideoError, VideoErrorCode } from 'shared/util/VideoError';

// https://shaka-player-demo.appspot.com/docs/api/shaka.util.Error.html

enum ShakaErrorCategory {
	NETWORK = 1,
	TEXT,
	MEDIA,
	MANIFEST,
	STREAMING,
	DRM,
	PLAYER,
	CAST,
	STORAGE
}

interface IShakaError<D = any[]> {
	category: number;
	code: number;
	data: D;
}

function getVideoErrorForHttpStatusCode(statusCode: number): VideoErrorCode {
	if (statusCode >= 500 && statusCode < 600) {
		return VideoErrorCode.ServerError;
	} else if (statusCode >= 400 && statusCode < 500) {
		return VideoErrorCode.MediaUnavailable;
	} else {
		return VideoErrorCode.PlayerError;
	}
}

// https://shaka-player-demo.appspot.com/docs/api/shaka.util.Error.html
type HttpError = [
	string, // URI
	number // Status
];

function mapShakaErrorCategoryToVideoErrorCode(shakaError: IShakaError): VideoErrorCode {
	const { category } = shakaError;
	switch (category) {
		case ShakaErrorCategory.NETWORK:
			const statusCode = (<IShakaError<HttpError>>shakaError).data[1];
			return getVideoErrorForHttpStatusCode(statusCode);
		case ShakaErrorCategory.DRM:
			return VideoErrorCode.DrmError;
		case ShakaErrorCategory.MANIFEST:
			return VideoErrorCode.BadVideoDataError;
		default:
			return VideoErrorCode.PlayerError;
	}
}

export function getVideoErrorForShakaError(shakaError: IShakaError) {
	const { category } = shakaError;
	let categoryName = ShakaErrorCategory[category] || 'UNKNOWN';

	return new VideoError(`Shaka ${categoryName} error`, mapShakaErrorCategoryToVideoErrorCode(shakaError));
}
