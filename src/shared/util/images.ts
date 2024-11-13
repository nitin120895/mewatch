import * as urls from './urls';
import warning from './warning';
import { isBookmarksList } from 'shared/list/listUtil';
import { resolveChannelLogo } from 'toggle/responsive/util/epg';
/**
 * Transparent image (1 x 1 px = 68 bytes) for use as a fallback/placeholder when you're unable to resolve or load a proper image.
 */
export const transparentImage = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

/**
 * Fallback URI that prevents a 404 error when loaded within an img src.
 */
export const fallbackURI = transparentImage;

/**
 * Default Device Pixel Ratios targetted when resolving an image from Rocket.
 */
export const defaultPixelRatios = [1, 2];

/**
 * Default image quality associated with each device pixel ratio when
 * resolving an image from Rocket.
 *
 *  -	At 1X the quality needs to stay high since no scaling occurs
 *		when presenting the image to the user.
 *  -	For DPR above 1X the quality can be safely reduced to save bandwidth.
 * 		Visual fidelity is retained despite the reduced quality since the
 * 		image gets downscaled when presented to the user.
 *
 * This map is used if there isn't a `quality` setting specified within
 * the `image.Options` object which is used within `resolveImage(s)`.
 *
 * If a quality setting is provided then the value will be divided by
 * the current pixel ratio e.g. 0.75 / 1, 0.75 / 2, 0.75 / 3, etc.
 *
 * It is therefore preferable to set reasonable quality levels here
 * and to simply not specify the quality setting manually when
 * requesting images at multiple densities.
 */
export const imageQuality = new Map<number, number>();
imageQuality.set(1, 0.85);
imageQuality.set(1.5, 0.6);
imageQuality.set(2, 0.45);
imageQuality.set(3, 0.3);

/**
 * Convert an array of image sources into a single `srcset` value.
 *
 * Do not mix width and pixel density variants.
 */
export function flattenSrcSet(srcSet: image.SrcSet[]): string {
	return srcSet
		.map(image => {
			if (image.pixelRatio) return `${image.url} ${image.pixelRatio}x`;
			else return `${image.url} ${image.width}w`;
		})
		.join(', ');
}

/**
 * Convert an array of image sizes (media condition and/or length) to a single `sizes` value.
 */
export function flattenSrcSetSizes(
	srcSet: image.SrcSet[],
	sizes?: image.SrcSetSize[],
	width?: number | string
): string {
	if (!sizes && width) sizes = [{ length: width + 'px' }];
	if (!sizes) return undefined;
	if (srcSet && srcSet.find(image => image.pixelRatio > 0)) {
		// The sizes attribute is only applicable when using width based image sources.
		return undefined;
	}
	return sizes.map(rule => `${rule.mediaCondition ? rule.mediaCondition + ' ' : ''}${rule.length}`).join(', ');
}

/**
 * Converts a `image.Resource` into a `image.SrcSet`.
 *
 * @param image The resource to convert
 * @param useDPR If true the device pixel ratio will be used, if false a width value.
 */
export function convertResourceToSrcSet(image: image.Resource, useDPR = true): image.SrcSet {
	const srcSet: image.SrcSet = { url: image.src };
	if (useDPR) srcSet.pixelRatio = image.pixelRatio;
	else srcSet.width = image.width;
	return srcSet;
}

// Ensure at least a width or height has been provided
function hasInvalidDimensions(options: image.Options): boolean {
	if ((!options.width || options.width < 0) && (!options.height || options.height < 0)) {
		if (_DEV_) warning('resolveImage must receive a positive width and/or height value');
		return true;
	}
	return false;
}

// Return this when there isn't a matching image url.
function getFallbackResource(
	imageType: image.Type | image.Type[],
	options: image.Options,
	skipCalculations = false
): image.Resource {
	const type = resolveFirstImageType(imageType);
	const aspectRatio = getAspectRatio(type as any);
	const { width, height } = skipCalculations
		? options
		: calculateDimensions(1.0, options.width, options.height, aspectRatio, undefined, undefined, type);
	return { src: options.fallbackURI || fallbackURI, width, height, pixelRatio: 1.0, type, resolved: false };
}

/**
 * Resolve an item image for a given Image Type (aspect ratio) at multiple pixel densities.
 *
 * @param images The image urls available
 * @param imageType the type (or types as fallback) of the image you're requesting from the images object.
 * @param options The configuration options consisting of at least a width or height.
 * @param pixelRatios An array of device pixel ratios. e.g. 2.0 for HDPI sceens.
 */
export function resolveImages(
	images: { [key: string]: string },
	imageType: image.Type | image.Type[],
	options: image.Options,
	pixelRatios: number[] = defaultPixelRatios
): image.Resource[] {
	if (hasInvalidDimensions(options)) {
		// Prevent further calculations
		return [getFallbackResource(imageType, { width: 0, height: 0 }, true)];
	}
	const type = getFirstMatch(images, imageType);
	const match = type ? images[type] : undefined;
	if (!match) {
		// When there's no match there's no point doing multiple pixel ratios
		return [getFallbackResource(imageType, options)];
	}
	const resolved: image.Resource[] = [];
	const queryParams = urls.getQueryParams(match, [urls.convertNumericValues, urls.convertQuotedValues]);

	if (_DEV_) {
		if (!queryParams) {
			// This utility was designed to handle image urls returned from Rocket which contain query parameters.
			warning(`resolveImage(s) is designed for Rocket image urls: '${match}'`);
		}
	}
	if (_DEV_ || _QA_) {
		// We may want to use non-rocket urls within the component browser so we return them as-is.
		if (!queryParams) return [{ src: match, width: 0, height: 0, pixelRatio: 1.0, type, resolved: true }];
	}

	// Determine maximum dimensions to prevent upscaling.
	options = getMaxWidthAndHeight(queryParams, getAspectRatio(type), options);

	// Prevent duplicates and ensure they're sorted lowest to highest
	if (!pixelRatios.length) pixelRatios = defaultPixelRatios;
	else
		pixelRatios = pixelRatios
			.slice()
			.filter((ratio, i, ratios) => ratios.indexOf(ratio) === i)
			.sort((a, b) => a - b);
	for (let ratio of pixelRatios) {
		// Determine appropriate quality setting to use for this pixel ratio. See `imageQuality` for more info
		let quality = options.quality ? options.quality / ratio : imageQuality.get(ratio);
		// Clone the options as we'll be manipulating its values directly within `resolveImageUrl`
		let imgOptions = Object.assign({}, options, { quality });
		// Resolve the image url
		const { image: result, cappedDimensions: upscaling, maxWidth, maxHeight } = resolveImageUrl(
			match,
			queryParams,
			type,
			imgOptions,
			ratio
		);
		if (pixelRatios.length === 1 && ratio > 1) {
			// If there's only a single HiDPI result we inject the @1x display size so the img element can use the correct dimensions
			result.displayWidth = Math.round(result.width / ratio);
			result.displayHeight = Math.round(result.height / ratio);
		}

		// MEDTOG-8429 - On large displays packshots can be displayed which are
		// significantly larger than the image which is retrieved from the
		// server.
		//
		// To remedy this issue we increase the size of the image which will be
		// retrieved.
		//
		// With HiDPI displays this issue was not as noticable so to prevent
		// these devices from having to download larger images we only apply the
		// increase in image size to the original images

		const imageSizeMultiplier = parseFloat(process.env.CLIENT_IMAGE_SIZE_MULTIPLIER) || 1;
		if (ratio === 1 && imageSizeMultiplier > 1) {
			const newWidth = Math.round(result.width * imageSizeMultiplier);
			const newHeight = Math.round(result.height * imageSizeMultiplier);

			result.src = result.src
				.replace(`Width=${result.width}`, `Width=${newWidth}`)
				.replace(`Height=${result.height}`, `Height=${newHeight}`);

			result.width = newWidth;
			result.height = newHeight;

			result.displayWidth = newWidth;
			result.displayHeight = newHeight;
		}

		result.type = type;
		result.resolved = true;
		resolved.push(result);
		if (upscaling || (result.width === maxWidth && result.height === maxHeight)) {
			// Prevent adding multiple sources at the same capped dimensions
			break;
		}
	}
	return resolved;
}

/**
 * Resolve an image for a given Image Type (aspect ratio) at the provided dimensions at scale mode.
 *
 * @param images The image urls available
 * @param imageType the type (or types as fallback) of the image you're requesting from the images object.
 * @param options The configuration options consisting of at least a width or height.
 * @param pixelRatio The device pixel ratio (based to the screen's density). e.g. 2.0 for HDPI sceens.
 */
export function resolveImage(
	images: { [key: string]: string },
	imageType: image.Type | image.Type[],
	options: image.Options,
	pixelRatio = 1.0
): image.Resource {
	return resolveImages(images, imageType, options, [pixelRatio])[0];
}

interface ResolvedImageUrl {
	image: image.Resource;
	cappedDimensions: boolean;
	maxWidth: number;
	maxHeight: number;
}

function resolveImageUrl(
	url: string,
	queryParams: any,
	type: image.Type,
	options: image.Options,
	pixelRatio: number
): ResolvedImageUrl {
	let aspectRatio = getAspectRatio(type);
	if (aspectRatio === 1 && queryParams.Width > 0 && queryParams.Height > 0) {
		// Since we use a 1:1 aspect ratio for image types which accept any dimensions we can
		// instead attempt to get the real aspect ratio from the source dimensions within the url.
		aspectRatio = Number((queryParams.Width / queryParams.Height).toFixed(2));
	}

	// Aspect ratio is maintained based on source dimensions
	const { width, height, cappedDimensions, singleDimension } = calculateDimensions(
		pixelRatio,
		options.width,
		options.height,
		aspectRatio,
		options.maxWidth,
		options.maxHeight
	);

	if (singleDimension) {
		// Destructively add the missing dimension to ensure it's included within our sanitized parameters.
		// Also prevents unnecessary recalculations when resolving multiple pixel ratios.
		options.width = width;
		options.height = height;
	}

	if (!~url.indexOf('ResizeAction=')) {
		// Centre crop the image to prevent the ResizeImage endpoint from adding black bars (JPG) or transparent bars
		// (PNG) when the resized image's aspect ratio differs from the original one (sometimes getting an extra pixel
		// along one edge)
		queryParams.ResizeAction = 'fill';
		queryParams.HorizontalAlignment = 'center';
		queryParams.VerticalAlignment = 'top';
	}

	// Rocket urls are supposed to have the source dimensions as attributes but in case they don't we apply the
	// requested dimensions to prevent the source dimensions from being returned (e.g. possibly higher resolution).
	if (!queryParams.Width) queryParams.Width = options.width;
	if (!queryParams.Height) queryParams.Height = options.height;

	// Update values
	let option, i, value, v;
	const keys = Object.keys(queryParams);
	const values = keys.map(key => queryParams[key]);
	for (let key of Object.keys(options)) {
		option = propLookup[key];
		i = keys.indexOf(option);
		value = options[key];
		if (key === 'quality') {
			// The ResizeImage endpoint only supports whole numbers between 1-100.
			if (value < 0) value = 1;
			else if (value > 1) value = 100;
			else value = Math.ceil(value * 100);
		} else if (key === 'width') {
			value = width;
		} else if (key === 'height') {
			value = height;
		}
		values[i] = value;
	}
	// Reconstruct string in their original order to ensure CDN caching isn't invalidated
	const endpoint = url.substr(0, url.indexOf('?'));
	url = endpoint + '?';
	for (i = 0; i < keys.length; i++) {
		v = values[i];
		if (typeof v === 'string') v = `'${v}'`;
		url += `${keys[i]}=${v}${i < keys.length - 1 ? '&' : ''}`;
	}
	// Return matching resource
	return {
		image: { src: url, width, height, pixelRatio, resolved: true },
		cappedDimensions,
		maxWidth: options.maxWidth,
		maxHeight: options.maxHeight
	};
}

/**
 * Find the first matching image type.
 */
export function getFirstMatch(images: { [key: string]: string }, imageType: image.Type | image.Type[]): image.Type {
	if (!images) return undefined;

	if (Array.isArray(imageType)) {
		for (let t of imageType) {
			if (images.hasOwnProperty(t)) return t;
		}
		return undefined;
	} else {
		return images.hasOwnProperty(imageType) ? imageType : undefined;
	}
}

/**
 * Calculate the max image dimensions.
 *
 * Takes the smaller of either the specified max dimensions options or the source dimensions, while preserving aspect ratio.
 */
export function getMaxWidthAndHeight(queryParams: any, aspectRatio: number, options: image.Options): image.Options {
	// Set maxWidth and maxHeight constraints to either the specified options or the source dimensions, whichever is smaller.
	let maxWidth = Math.min(options.maxWidth || queryParams.Width, queryParams.Width);
	let maxHeight = Math.min(options.maxHeight || queryParams.Height, queryParams.Height);
	// Preserve aspect ratio for maxWidth and maxHeight, using the smaller of the two dimensions.
	if (options.maxWidth && !options.maxHeight) maxHeight = Math.round(maxWidth / aspectRatio);
	else if (options.maxHeight && !options.maxWidth) maxWidth = Math.round(maxHeight * aspectRatio);
	else if (options.maxWidth && options.maxHeight) {
		maxWidth = Math.min(maxWidth, Math.round(maxHeight * aspectRatio));
		maxHeight = Math.round(maxWidth / aspectRatio);
	}
	return Object.assign({}, options, { maxWidth, maxHeight });
}

interface DimensionsCalculation {
	width: number;
	height: number;
	cappedDimensions: boolean;
	singleDimension: boolean;
}

/**
 * Calculate image dimensions.
 *
 * Supports maintaining aspect ratio given a single dimension, scaling based on device pixel ratio, and prevents upscaling.
 */
function calculateDimensions(
	pixelRatio: number,
	width: number,
	height: number,
	aspectRatio: number,
	maxWidth?: number,
	maxHeight?: number,
	imageType?: image.Type
): DimensionsCalculation {
	let cappedDimensions = false,
		singleDimension = false;
	// Enforce proportional scaling when a single dimension has been provided
	if (width > 0 && (!height || height < 0)) {
		height = Math.round(width / aspectRatio);
		singleDimension = true;
	}
	if (height > 0 && (!width || width < 0)) {
		width = Math.round(height * aspectRatio);
		singleDimension = true;
	}
	// Scale based on device pixel ratio
	width = Math.round(width * pixelRatio);
	height = Math.round(height * pixelRatio);
	// Prevent upscaling by capping the dimensions
	const shouldCapWidth = !isNaN(maxWidth) && width > maxWidth;
	const shouldCapHeight = !isNaN(maxHeight) && height > maxHeight;
	cappedDimensions = shouldCapWidth || shouldCapHeight;
	if (cappedDimensions) {
		if (shouldCapWidth && shouldCapHeight) {
			width = maxWidth;
			height = maxHeight;
		} else if (shouldCapWidth) {
			const ap = height / width;
			width = maxWidth;
			height = Math.round(maxWidth * ap);
		} else if (shouldCapHeight) {
			const ap = width / height;
			height = maxHeight;
			width = Math.round(maxHeight * ap);
		}
	}
	// Scale based on desired device pixel ratio
	return { width, height, cappedDimensions, singleDimension };
}

/**
 * Property lookup converting `image.Options` property names with their ISL `ResizeImage` counterpart.
 */
const propLookup = {
	width: 'Width',
	height: 'Height',
	alignX: 'HorizontalAlignment',
	alignY: 'VerticalAlignment',
	scaleMode: 'ResizeAction',
	format: 'Format',
	quality: 'Quality'
};

type ItemType =
	| 'movie'
	| 'show'
	| 'season'
	| 'episode'
	| 'program'
	| 'link'
	| 'trailer'
	| 'channel'
	| 'customAsset'
	| 'event'
	| 'competition'
	| 'confederation'
	| 'stage'
	| 'persona'
	| 'team'
	| 'credit';

type ItemImageTypes = { [P in ItemType]: image.Type };

/**
 * Get the default Image type associated with an Item type.
 */
function getImageTypeForItemType(itemType: ItemType): image.Type {
	// As a safety net at runtime, we declare this redundant fallback in case
	// the backend adds a new item type before the front end supports it.
	return DEFAULT_ITEM_IMAGE_TYPES[itemType] || 'poster';
}

const DEFAULT_ITEM_IMAGE_TYPES: ItemImageTypes = {
	movie: 'poster',
	trailer: 'poster',
	season: 'poster',
	show: 'tile',
	episode: 'tile',
	program: 'tile',
	link: 'tile',
	channel: 'block',
	customAsset: 'poster',
	event: 'tile',
	competition: 'tile',
	confederation: 'tile',
	stage: 'tile',
	persona: 'square',
	team: 'square',
	credit: 'tile'
};

/**
 * Override the default Image type associated with an Item.
 */
export function setDefaultImageTypesForItemTypes(types: { [key: string]: string }) {
	for (let itemType in types) {
		if (DEFAULT_ITEM_IMAGE_TYPES[itemType]) {
			// if we get itemImageType names values ex. movie="Poster" in capital from CMS then covert it to lowercase
			DEFAULT_ITEM_IMAGE_TYPES[itemType] = types[itemType].toLowerCase();
		}
	}
}

/**
 * Get the default Image type associated with an Item.
 */
export function getImageTypeForItem(item: api.ItemSummary): image.Type {
	return getImageTypeForItemType(item.type);
}

/**
 * Get the default Image type associated with the first Item within a List.
 */
export function getImageTypeForItemList(list: api.ItemList): image.Type {
	let itemType = 'movie' as ItemType;

	if (!list) return getImageTypeForItemType(itemType);

	if (isBookmarksList(list)) return 'tile';

	const { itemTypes, items } = list;

	if (itemTypes && itemTypes.length) {
		itemType = itemTypes[0];
	} else if (items && items.length) {
		itemType = items[0].type;
	}

	return getImageTypeForItemType(itemType);
}

/**
 * Returns the aspect ratio of each image type.
 */
export function getAspectRatio(type: image.Type, srcDimensions?: { height: number; width: number }): number {
	let ratio;
	switch (type) {
		case 'poster':
			ratio = 2 / 3;
			break;
		case 'tile':
		case 'wallpaper':
			ratio = 16 / 9;
			break;
		case 'block':
		case 'hero4x3':
			ratio = 4 / 3;
			break;
		case 'hero3x1':
			ratio = 3 / 1;
			break;
		case 'hero7x1':
			ratio = 7 / 1;
			break;
		case 'tall':
			ratio = 1 / 2;
			break;
		case 'custom':
			if (srcDimensions) {
				ratio = srcDimensions.width / srcDimensions.height;
			} else {
				ratio = 1;
			}
			break;
		default:
			ratio = 1;
	}
	return ratio;
}

export function resolveFirstImageType(imageType: image.Type | image.Type[]): image.Type {
	if (typeof imageType === 'string') return imageType;
	return imageType && imageType.length ? imageType[0] : undefined;
}

export function resolvePartnerLogo(images: { [key: string]: string }, width: number): string {
	return resolveImages(images, 'logo', { width, format: 'png' })[0].src;
}

export function getChannelLogoForThumbnailOverlay(channel: api.ItemSummary | api.ScheduleItemSummary) {
	let channelLogo = resolveChannelLogo(channel, 'logodark');
	if (!imageExists(channelLogo)) {
		channelLogo = resolveChannelLogo(channel, 'logo');
	}
	return channelLogo;
}

export function imageExists(imageUrl: string) {
	return imageUrl !== fallbackURI;
}
