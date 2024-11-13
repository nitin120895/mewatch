import { hexToRgba } from 'shared/util/styles';
import { Image } from 'shared/analytics/types/v3/context/entry';
import { getImageIdFromUrL } from 'shared/analytics/getContext';
import { isArray } from 'shared/util/objects';
import * as cx from 'classnames';
import sass from 'ref/tv/util/sass';

/**
 * Custom utilities for working with customFields and customProperties.
 */

/**
 * Normalizes the alignment property from ISL into a CSS friendly value.
 *
 * e.g. `customFields.alignment.value` or `customFields.imageAlignment`
 *
 * @param alignment The alignment value from ISL.
 */
export function resolveAlignment(alignment: string): position.AlignX {
	if (!alignment) alignment = 'Default';
	return alignment === 'Default' ? 'left' : (alignment.toLowerCase() as position.AlignX);
}

/**
 * Converts the Color into a CSS friendly value.
 *
 * If an opacity exists it will return an `rgba(0,0,0,1)` value, otherwise a hexadecimal value `#000`.
 *
 * @param color A color value from ISL.
 */
export function resolveColor(color: customFields.Color, fallback = '#000'): string {
	if (!color) return undefined;
	if (fallback.charAt(0) !== '#') fallback = `#${fallback}`;
	if (color.opacity === 100) return color.color || fallback;
	return hexToRgba(color.color || fallback, color.opacity / 100 || 1);
}

export const fullScreenWidth = sass.viewportWidth;

export function resolveCustomFields(customFields: any): Object {
	let tColor;
	let tHorAlignment;
	let tVerAlignment;

	if (customFields) {
		if (customFields.textColor) {
			tColor = resolveColor(customFields.textColor, '#fff');
		}

		if (customFields.textHorizontalAlignment) {
			tHorAlignment = customFields.textHorizontalAlignment.toLowerCase();
		}

		if (customFields.textVerticalAlignment) {
			tVerAlignment = customFields.textVerticalAlignment.toLowerCase();
		}
	}

	if (!tVerAlignment) {
		tVerAlignment = 'bottom';
	}

	let cusStyle = {
		color: tColor ? tColor : 'white'
	};

	// top, middle, bottom || left, center, right
	let classNames = cx(tHorAlignment, tVerAlignment);

	return { classNames, cusStyle };
}

export function addWatchPosition(profile: state.Profile, items: api.ItemSummary[]) {
	const watched = profile.info && profile.info.watched;
	if (watched) {
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			const watch = watched[item.id];
			if (watch) {
				if (watch.isFullyWatched) {
					item.customFields = { position: item.duration };
					continue;
				}

				if (item.customFields) item.customFields.position = watch.position;
				else item.customFields = { position: watch.position };
			}
		}
	}
}

export function getRowTypeByImageType(imageType: string): string {
	let rowType;
	switch (imageType) {
		case 'poster':
			rowType = 'p1';
			break;
		case 'tile':
		case 'wallpaper':
			rowType = 't1';
			break;
		case 'block':
			rowType = 'b1';
			break;
		case 'square':
		case 'logo':
			rowType = 's1';
			break;
		case 'brand':
			rowType = 't1';
			break;
		default:
			break;
	}

	return rowType;
}

export function getRowDefinitionByItemImageType(imageType: string) {
	const rowType = getRowTypeByImageType(imageType);
	let row;
	switch (rowType) {
		case 'p1':
			row = require('ref/tv/pageEntry/poster/P1Standard').default;
			break;
		case 't1':
			row = require('ref/tv/pageEntry/tile/T1Standard').default;
			break;
		case 's1':
			row = require('ref/tv/pageEntry/square/S1Standard').default;
			break;
		default:
			row = require('ref/tv/pageEntry/poster/P1Standard').default;
			break;
	}

	return row;
}

export function getDefaultImageWidthByImageType(imageType: string): number {
	let width;
	switch (imageType) {
		case 'poster':
		case 'tall':
			width = sass.posterImageWidth;
			break;
		case 'tile':
		case 'wallpaper':
			width = sass.tileImageWidth;
			break;
		case 'block':
			width = sass.blockImageWidth;
			break;
		case 'square':
		case 'logo':
			width = sass.squareImageWidth;
			break;
		case 'brand':
			width = sass.tileImageWidth;
			break;
		default:
			break;
	}

	return width;
}

export function getImageData(
	images: { [key: string]: string } | undefined,
	imageType: string | string[]
): Image | undefined {
	if (!images) return undefined;
	if (isArray(imageType)) imageType = imageType.find(type => !!(images && images[type]));
	const url = images[imageType];
	return url && { url, type: imageType, id: getImageIdFromUrL(url) };
}

export function waitUntil(func: () => boolean, callback: () => void, timeout = 30 * 1000) {
	return wait(func, callback, () => {}, timeout);
}

export function wait(func: () => boolean, callback: () => void, timeoutCallback: () => void, timeout = 30 * 1000) {
	let handler = setInterval(
		function() {
			this.timeout -= 200;
			if (this.timeout < 0) {
				console.warn('waitUntil timeout');
				clearInterval(handler);
				this.timeoutCallback();
			}

			if (func()) {
				clearInterval(handler);
				this.callback();
			}
		}.bind({ timeout: timeout, callback, timeoutCallback }),
		200
	);

	return handler;
}
