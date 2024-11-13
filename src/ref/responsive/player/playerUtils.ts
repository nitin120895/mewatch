import { isFree } from '../pageEntry/util/offer';
import { getPublicItemMediaFiles } from 'shared/service/action/content';
import { getItemMediaFiles } from 'shared/service/account';
import { PlayerAction, PlayerState, PlayerInterface } from './Player';

export function getItemMedias(
	item: api.ItemDetail,
	subscriptionCode: string,
	active: boolean
): Promise<state.MediaResponse> {
	return new Promise(function(resolve, reject) {
		if (isFree(item) && !active) {
			return getPublicItemMediaFiles(item.id, ['stream', 'progressive'], 'HD-1080', 'web_browser', undefined)
				.then(response => {
					if (response.error) {
						return resolve({ error: 'Error during get public item media files' });
					} else {
						return resolve({ media: response.data });
					}
				})
				.catch(err => {
					return resolve({ error: 'Error during get public item media files' });
				});
		}

		if (!active) return Promise.resolve({ error: 'User is not signed in' });

		return getItemMediaFiles(item.id, ['stream'], 'HD-1080', 'web_browser', { sub: subscriptionCode })
			.then(response => {
				const payload = response.data as any;
				if (payload && payload.status === 403 && payload.code === 8012) {
					/* return getItemMediaFilesGuarded(item.id, ['stream'], 'HD-1080', 'web_browser', { sub: subscriptionCode })
						.then(response => {
							if (response.error) {
								return resolve({ error: 'Error during load guarded video' });
							} else {
								return resolve({ media: response.data });
							}
						})
						.catch(err => {
							return resolve({ error: 'Error during load guarded video' });
						});
					*/
					return reject({ error: 'Error during get item media files' });
				} else {
					return resolve({ media: response.data });
				}
			})
			.catch(err => {
				return reject({ error: 'Error during get item media files' });
			});
	});
}

export function isFullScreen() {
	if (document['fullscreenElement'] || document['webkitFullscreenElement']) return true;
	return false;
}

export function togglePlayback(player: PlayerInterface, playerState: PlayerState) {
	if (playerState === 'PLAYING') {
		player.emit('action', { name: PlayerAction.ActuatePause });
		player.pause();
	} else {
		player.emit('action', { name: PlayerAction.ActuatePlay });
		player.play();
	}
}

export function toggleFullScreen(player: PlayerInterface, playerContainer: HTMLElement) {
	if (isFullScreen()) {
		player.emit('action', { name: PlayerAction.Fullscreen, payload: false });
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document['webkitExitFullscreen']) {
			document['webkitExitFullscreen']();
		}
	} else {
		// Not this represents an attempt, we do not check if it is successful
		player.emit('action', { name: PlayerAction.Fullscreen, payload: true });
		if (playerContainer.requestFullscreen) {
			playerContainer.requestFullscreen();
		} else if (playerContainer['webkitRequestFullscreen']) {
			playerContainer['webkitRequestFullscreen']();
		}
	}
}
