import { PlayerProps } from 'toggle/responsive/player/Player';
import { injectScriptOnce } from 'shared/util/scripts';

export default async function getPlayer(options: PlayerProps) {
	await injectScriptOnce(`${process.env.CLIENT_KALTURA_PLAYER_CDN_URL}`);
	const KalturaPlayerWrapper = (await import(/* webpackChunkName: "player" */ 'toggle/responsive/player/KalturaPlayerWrapper'))
		.KalturaPlayerWrapper;
	return new KalturaPlayerWrapper(options);
}
