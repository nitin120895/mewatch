export enum VideoErrorCode {
	GeoBlockedError = 1, // 'Geo blocked',
	MediaUnavailable, // 'Media unavailable (e.g. 400+)',
	ServerError, // 'Server unavailable (e.g. 500+)',
	BadVideoDataError, // 'Invalid video (e.g. incorrect manifest content)',
	ConcurrencyError, // 'Concurrency playback limit reached',
	DeviceLimitError, // 'Device registration limit reached',
	DrmError, // 'Invalid DRM license',
	TimeoutError, // 'Timeout',
	PlayerError // 'Player Error',
}

export class VideoError extends Error {
	code: VideoErrorCode;
	constructor(message: string, code: VideoErrorCode = VideoErrorCode.PlayerError) {
		super(message);
		this.code = code;
		Object.setPrototypeOf(this, VideoError.prototype);
	}
}
