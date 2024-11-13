import { PlayerInterface } from '../Player';
import { CastWrapper } from './CastWrapper';
import { injectScriptOnce } from 'shared/util/scripts';
import { isCastSupported } from './CastLoader';

let castWrapper: PlayerInterface = undefined;

const CAST_SENDER_URL = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';

export function getCastPlayer() {
	if (!castWrapper) {
		castWrapper = new CastWrapper(initPlayer());
	}
	return castWrapper;
}

let initPromise;

function initPlayer(): Promise<boolean> {
	if (!initPromise) {
		let load;
		// When custom receiver ready, put its id here
		// const receiverApplicationId = 'CustomID';

		if (!isCastSupported()) {
			load = Promise.resolve({ isAvailable: false, message: 'Browser not supported' });
		} else {
			/*else if (!receiverApplicationId) {
			// uncomment when custom receiver will be ready to use
			load = Promise.resolve({ isAvailable: false, message: 'Missing receiverApplicationId' });
		} */ injectScriptOnce(
				CAST_SENDER_URL
			);

			load = new Promise(function(resolve) {
				window['__onGCastApiAvailable'] = (isAvailable, message) => resolve({ isAvailable, message });
			});
		}

		initPromise = load.then(result => {
			if (!result.isAvailable) {
				return result;
			}

			// Prepare chromecast options with receiver id and auto join policy
			const castOptions = {
				receiverApplicationId: `${process.env.CLIENT_RECEIVER_ID}` || chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
				autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
			};

			// Set chromecast options
			cast.framework.CastContext.getInstance().setOptions(castOptions);
		});
	}

	return initPromise;
}
