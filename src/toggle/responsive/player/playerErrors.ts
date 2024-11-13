import {
	SERVER_5000_ERROR_RANGE_START,
	SERVER_5000_ERROR_RANGE_END,
	PLAYBACK_UNSUPPORTED_DEVICE,
	PLAYBACK_FILES_NOT_AVAILABLE,
	PLAYBACK_AUTH_NO_ENTITLEMENT,
	PLAYBACK_NO_ENTITLEMENT,
	PLAYBACK_INVALID_ENTITLEMENT,
	PLAYBACK_LOCATION_RESTRICTION,
	PLAYBACK_STREAM_COULD_EXCEEEDED,
	PLAYBACK_DEVICE_LIMIT_REACHED_ERROR
} from 'shared/util/errorCodes';

import { ErrorCta } from './Player';

export const Errors = {
	unsupportedDevice: {
		title: '@{error_dialog_server_unsupported_device}',
		description: '@{error_dialog_server_unsupported_device_description}',
		additionalDescription: '@{error_dialog_server_unsupported_device_description_additional}',
		cta: ErrorCta.OK
	},
	unsupportedContent: {
		title: '@{error_dialog_content_unsupported_by_browser}',
		description: '@{error_dialog_content_unsupported_by_browser_description}',
		cta: ErrorCta.OK
	},
	serviceUnavailable: {
		title: '@{error_dialog_server_service_unavailable}',
		description: '@{error_dialog_server_service_unavailable_description}',
		cta: ErrorCta.TRY_AGAIN
	},
	filesUnavailable: {
		title: '@{error_dialog_server_files_not_available}',
		description: '@{error_dialog_server_files_not_available_description}',
		cta: ErrorCta.DISMISS
	},
	noEntitlement: {
		title: '@{error_dialog_server_no_entitlement}',
		description: '@{error_dialog_server_no_entitlement_description}',
		cta: ErrorCta.DISMISS
	},
	offline: {
		title: '@{error_dialog_no_internet_connection}',
		description: '@{error_dialog_no_internet_connection_description}',
		cta: ErrorCta.OK
	},
	player: {
		title: '@{error_dialog_video_player_response}',
		description: '@{error_dialog_video_player_response_description}',
		cta: ErrorCta.TRY_AGAIN
	},
	geoblocking: {
		title: '@{error_dialog_server_geoblocking}',
		description: '@{error_dialog_server_geoblocking_description}',
		cta: ErrorCta.DISMISS
	},
	generic: {
		title: '@{error_dialog_server_generic}',
		description: '@{error_dialog_server_generic_description}',
		cta: ErrorCta.TRY_AGAIN
	},
	browser: {
		title: '@{error_dialog_browser_not_supported}',
		cta: ErrorCta.DISMISS
	},
	concurrency: {
		title: '@{error_dialog_concurrency_limitation}',
		description: '@{error_dialog_concurrency_limitation_description}',
		additionalDescription: '@{error_dialog_concurrency_additional_description}',
		cta: ErrorCta.OK
	},
	embeddingUnavailable: {
		title: '@{error_dialog_embedding_not_available_description}',
		cta: ErrorCta.OK
	},
	hdcp: {
		title: '@{error_dialog_hdcp_limitation}',
		description: '@{error_dialog_hdcp_limitation_description}',
		additionalDescription: '@{error_dialog_hdcp_limitation_additional_description}'
	},
	deviceLimitReached: {
		title: '@{error_dialog_device_limitation_title}',
		description: '@{error_dialog_device_limitation_description}',
		cta: ErrorCta.OK
	}
};

export function getPlayerErrorByServiceError(serviceError: any) {
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
			switch (parseInt(code)) {
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
				case PLAYBACK_DEVICE_LIMIT_REACHED_ERROR:
					error = Errors.deviceLimitReached;
					break;
			}
		}
	}

	return error;
}
