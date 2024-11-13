import { resolveImages, fallbackURI } from '../util/images';
import { validateURL, validateURLPart } from '../util/urls';

export function createOpenGraphMetadata(pageProps: PageProps) {
	const { title, strings, location, entries, list } = pageProps;
	const meta = [];

	let pageTitle = strings.app_title;
	if (title) pageTitle = `${title} - ${pageTitle}`;

	const item = pageProps.item ? pageProps.item : entries && entries.length && entries[0].item;

	meta.push({ property: 'og:title', content: pageTitle });
	meta.push({ property: 'og:type', content: getOgType(item) });
	meta.push({ property: 'og:url', content: createCanonicalUrl(location) });

	if (item) {
		const imageUrl = getItemImageUrl(item);
		if (imageUrl && imageUrl !== fallbackURI) {
			meta.push({ property: 'og:image', content: validateURL(imageUrl) });
		}
	} else if (list) {
		const imageUrl = getListImageUrl(list);
		if (imageUrl && imageUrl !== fallbackURI) {
			meta.push({ property: 'og:image', content: validateURL(imageUrl) });
		}
	}

	// we avoid adding 'og:description' as this can be inferred from
	// the 'description' meta tag which we've already added

	if (process.env.CLIENT_FACEBOOK_APP_ID) {
		meta.push({ property: 'fb:app_id', content: process.env.CLIENT_FACEBOOK_APP_ID });
	}

	return meta;
}

export function createCanonicalUrl(location: HistoryLocation) {
	const { basename, pathname } = location;
	let domain = '';
	if (typeof window !== 'undefined') {
		domain = window.location.origin;
	} else if (process.env.WEBSITE_URL) {
		domain = process.env.WEBSITE_URL;
	}
	return `${domain}${basename || ''}${validateURLPart(pathname)}`;
}

function getOgType(item) {
	const type = item ? item.type : 'other';
	switch (type) {
		case 'movie':
			return 'video.movie';
		case 'show':
		case 'season':
			return 'video.tv_show';
		case 'episode':
			return 'video.episode';
		default:
			return 'website';
	}
}

function getItemImageUrl(item: api.ItemDetail): string {
	const poster = item.type === 'movie' || item.type === 'show';
	const imageType: image.Type = poster ? 'poster' : 'tile';
	const width = poster ? 300 : 480;
	return resolveImages(item.images, imageType, { width })[0].src;
}

function getListImageUrl(list: api.ItemList): string {
	return resolveImages(list.images, 'wallpaper', { width: 480 })[0].src;
}
