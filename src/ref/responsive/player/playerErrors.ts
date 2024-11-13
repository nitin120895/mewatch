import {
	SERVER_5000_ERROR_RANGE_START,
	SERVER_5000_ERROR_RANGE_END,
	PLAYBACK_UNSUPPORTED_DEVICE,
	PLAYBACK_FILES_NOT_AVAILABLE,
	PLAYBACK_AUTH_NO_ENTITLEMENT,
	PLAYBACK_NO_ENTITLEMENT,
	PLAYBACK_INVALID_ENTITLEMENT,
	PLAYBACK_LOCATION_RESTRICTION,
	PLAYBACK_STREAM_COULD_EXCEEEDED
} from 'shared/util/errorCodes';

export const Errors = {
	unsupportedDevice: {
		title: '@{error_dialog_server_unsupported_device}',
		description: '@{error_dialog_server_unsupported_device_description}'
	},
	serviceUnavailable: {
		title: '@{error_dialog_server_service_unavailable}',
		description: '@{error_dialog_server_service_unavailable_description}'
	},
	filesUnavailable: {
		title: '@{error_dialog_server_files_not_available}',
		description: '@{error_dialog_server_files_not_available_description}'
	},
	noEntitlement: {
		title: '@{error_dialog_server_no_entitlement}',
		description: '@{error_dialog_server_no_entitlement_description}'
	},
	offline: {
		title: '@{error_dialog_no_internet_connection}',
		description: '@{error_dialog_no_internet_connection_description}'
	},
	player: {
		title: '@{error_dialog_video_player_response}',
		description: '@{error_dialog_video_player_response_description}'
	},
	geoblocking: {
		title: '@{error_dialog_server_geoblocking}',
		description: '@{error_dialog_server_geoblocking_description}'
	},
	concurrency: {
		title: '@{error_dialog_server_concurrency}',
		description: '@{error_dialog_server_concurrency_description}'
	},
	generic: {
		title: '@{error_dialog_server_generic}',
		description: '@{error_dialog_server_generic_description}'
	},
	browser: { title: '@{error_dialog_browser_not_supported}' }
};

export function getPlayerErrorByServiceError(serviceError: { code: number }) {
	// default service error
	let error = Errors.generic;

	if (!serviceError) return error;

	// let's check error code if exists
	const { code } = serviceError;
	if (code) {
		// for all 500* error codes use service unavailable error message
		if (code >= SERVER_5000_ERROR_RANGE_START && code <= SERVER_5000_ERROR_RANGE_END) {
			error = Errors.serviceUnavailable;
		} else {
			// check code for specifying some errors
			switch (code) {
				case PLAYBACK_UNSUPPORTED_DEVICE:
					error = Errors.unsupportedDevice;
					break;
				case PLAYBACK_FILES_NOT_AVAILABLE:
					error = Errors.filesUnavailable;
					break;
				case PLAYBACK_AUTH_NO_ENTITLEMENT:
				case PLAYBACK_NO_ENTITLEMENT:
				case PLAYBACK_INVALID_ENTITLEMENT:
					error = Errors.noEntitlement;
					break;
				case PLAYBACK_LOCATION_RESTRICTION:
					error = Errors.geoblocking;
					break;
				case PLAYBACK_STREAM_COULD_EXCEEEDED:
					error = Errors.concurrency;
					break;
			}
		}
	}

	return error;
}
