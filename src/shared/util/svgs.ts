/**
 * Generates the svg path for a rectangle.
 *
 * Will draw a rectangle with the top left corner at the give x and y coordinate.
 * After this operation the marker will be positioned at the top left corner of the rectangle.
 *
 * @param x left x position of the rectangle
 * @param y top y position of the rectangle
 * @param w Width of the rectangle
 * @param h Height of the rectangle
 * @return The svg path string
 */
export function drawRect(x: number, y: number, w: number, h: number): string {
	return `m${x},${y}v${h}h${w}v-${h}z`;
}

/**
 * Generates the svg path for a circle.
 *
 * A complete circle cannot be drawn with a single arc as the starting and end point
 * will be the same and therefore nothing will be drawn. Instead we perform two arc
 * operations creating two semicircles to make up a complete circle. After these
 * operations the line marker will be positioned at the centre left edge of the circle
 *
 * @param cx Center x location of the circle
 * @param cy Center y location of the circle
 * @param r Radius of the circle
 * @return The svg path string
 */
export function drawCircle(cx: number, cy: number, r: number): string {
	return `m${cx},${cy}m-${r},0a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 -${r * 2},0z`;
}

/**
 * Generates the svg path for any arbitrary polygon with n points.
 *
 * Use a matching outer and inner radius to draw any regular n sided polygon
 * e.g. triangle, diamond, pentagon, hexagon etc
 *
 * Use an inner radius less than outer radius to draw a star.
 *
 * After this operation the marker will be positioned at the top middle of the polygon (unless rotated)
 *
 * @param cx center x position of the polygon
 * @param cy center y position of the polygon
 * @param n number of points on the polygon
 * @param oRad outer radius of the polygon
 * @param iRad inner radius of the polygon
 * @param rot rotation (in degrees) of the polygon
 * @return The svg path string
 */
export function drawPoly(cx: number, cy: number, n: number, oRad: number, iRad: number, rot = 0) {
	let path = '';
	const star = iRad !== undefined && iRad !== oRad;
	const piDiv180 = Math.PI / 180;
	const piDiv2 = Math.PI / 2;
	const piMul2 = Math.PI * 2;
	const offsetRad = rot * piDiv180 - piDiv2;
	const pts = n * (star ? 2 : 1);
	let prevDy, prevDx;
	for (let i = 0; i < pts; i++) {
		const dist = i % 2 === 1 && star ? iRad : oRad;
		const rad = (piMul2 * i) / pts + offsetRad;
		const dx = dist * Math.cos(rad);
		const dy = dist * Math.sin(rad);
		if (i === 0) {
			path += `m${twoDp(cx + dx)},${twoDp(cy + dy)}`;
		} else {
			path += `l${twoDp(dx - prevDx)},${twoDp(dy - prevDy)}`;
		}
		prevDx = dx;
		prevDy = dy;
	}
	return path + 'z';
}

// Utility used by draw poly to round number value to two decimal places
function twoDp(value: number): number {
	return Math.round(value * 100) / 100;
}
