import { BasePlayerWrapper } from 'ref/responsive/player/BasePlayerWrapper';

export default async function getPlayer(): Promise<BasePlayerWrapper> {
	const shakaWrapper = await import('./shaka/ShakaPlayerWrapper');
	return new shakaWrapper.ShakaPlayerWrapper();
}
