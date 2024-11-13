/**
 * Determines whether a given a hexadecimal colour value is "light"
 *
 * @param color a string representing the hexadecimal colour value (e.g. "#45dc91")
 */
export function isLight(color: string): boolean {
	if (!color) return false;
	color = color.replace('#', '');
	const r = parseInt(color.substring(0, 2), 16);
	const g = parseInt(color.substring(2, 4), 16);
	const b = parseInt(color.substring(4, 6), 16);
	const hsp = Math.sqrt(
		// HSP equation from http://alienryderflex.com/hsp.html
		// https://www.w3.org/TR/AERT/#color-contrast
		0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b)
	);

	return hsp > 150;
}

/**
 * Modifies the brightness of the given colour and returns the hexadecimal value as a string.
 *
 * @param color a string representing the hexadecimal colour value (e.g. "#45dc91")
 * @param percent a numeric value between -100 and 100
 */
export function modifyBrightness(color: string, percent: number): string {
	if (!color) return;
	const f = parseInt(color.slice(1), 16);
	const t = percent < 0 ? 0 : 255;
	const ratio = percent < 0 ? percent / -100 : percent / 100;
	const red = f >> 16;
	const green = (f >> 8) & 0x00ff;
	const blue = f & 0x0000ff;
	const R = (Math.round((t - red) * ratio) + red) * 0x10000;
	const G = (Math.round((t - green) * ratio) + green) * 0x100;
	const B = Math.round((t - blue) * ratio) + blue;

	return '#' + (0x1000000 + R + G + B).toString(16).slice(1);
}
