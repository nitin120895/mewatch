import { hexToRgba } from 'shared/util/styles';

/**
 * Custom utilities for working with customFields and customProperties.
 */

/**
 * Normalises the alignment property from ISL into a CSS friendly value.
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
export function resolveColor(color: customFields.Color, fallback = '#000', ignoreOpacity = false): string {
	/* tslint:disable:no-null-keyword */
	if (!color || (!color.color && !fallback)) return null;
	if (fallback && fallback.charAt(0) !== '#') fallback = `#${fallback}`;
	if (ignoreOpacity || color.opacity === 100) return color.color || fallback;
	else if (color.opacity === 0) return null;
	return hexToRgba(color.color || fallback, color.opacity / 100 || 1);
	/* tslint:enable */
}

/**
 * Converts the `customFields.ImageVerticalSpacing` property values into corresponding CSS classnames.
 *
 * @param spacing The image vertical spacing value from ISL.
 */
export function resolveVerticalSpacingClassNames(spacing: customFields.ImageVerticalSpacing): string[] {
	switch (spacing) {
		case 'ignoreBottom':
			return ['flush-bottom'];
		case 'ignoreTop':
			return ['flush-top'];
		case 'ignoreBoth':
			return ['flush-top', 'flush-bottom'];
		default:
			return [];
	}
}

/**
 * Retrieves a given colour from a provided item list.
 *
 * Note: the api response also contains a value for `opacity` but our current implementation doesn't require it.
 *
 * @param type A string representing the theme name (e.g. "Background")
 * @param name A string representing the colour level (e.g. "Primary")
 * @param list An item list
 * @return string The hexadecimal colour value
 */
export function getListThemeColor(type: string, name: string, list: api.ItemList): string {
	const themes = list.themes && list.themes.filter(color => color.type === type);
	const color = themes && themes.length && themes[0].colors && themes[0].colors.find(color => color.name === name);

	return color ? color.value : '';
}
