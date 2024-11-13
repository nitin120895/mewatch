import warning from 'shared/util/warning';
import { toMedian } from 'shared/util/math';

// Ensure this matches the value of `$grid-columns` within `shared/style/modules/_grid.scss`
export const NUM_COLUMNS = 24;

// Ensure these matches the values inside `$mq-breakpoints` within `shared/style/modules/_grid.scss`
const BREAKPOINTS: grid.Breakpoint = {
	phone: 320,
	phablet: 480,
	tablet: 720,
	laptop: 960,
	desktop: 1200,
	desktopWide: 1440,
	uhd: 1921
};

// A map of each breakpoint's min and max pixel width
// Useful for defining media queries for use wkth picture elements.
export const BREAKPOINT_RANGES = (function(): {
	[key: string]: grid.BreakpointWidthRange;
} {
	const keys = Object.keys(BREAKPOINTS);
	const ranges = keys.map((key, index) => {
		const bp = BREAKPOINTS[key];
		const max = index < keys.length - 1 ? BREAKPOINTS[keys[index + 1]] - 1 : undefined;
		return { [key]: { min: bp, max } };
	});
	return Object.assign({}, ...ranges);
})();

export function isMobileSize() {
	return window.innerWidth < BREAKPOINTS.tablet;
}

/**
 * Returns an array of grid column className values for the provided breakpoints
 *
 * @param columns an array of columns per breakpoint
 * @param offsetColumns When greater than zero allows specifying a constant offset ahead of all breakpoints
 * @param center When true takes precedence over offsetColumns. Centres via a variable offset ahead of all breakpoints.
 */
export function getColumnClasses(columns: grid.BreakpointColumn[], offsetColumns = 0, center = false): string[] {
	let classes: string[];
	if (columns && columns.length) {
		classes = ['col'].concat(
			columns.map((col: grid.BreakpointColumn, index: number) => {
				const name = Object.keys(col)[0];
				if (center) {
					const cols = col[name];
					const offset = Math.floor((NUM_COLUMNS - col[name]) / 2);
					return `col-${name}-${cols}${offset > 0 ? ` col-${name}-offset-${offset}` : ''}`;
				} else if (offsetColumns > 0) {
					return `col-${name}-${col[name]} col-${name}-offset-${offsetColumns}`;
				}
				return `col-${name}-${col[name]}`;
			})
		);
	}
	return classes;
}

/**
 * Returns an array of grid column offset className values for the provided breakpoints
 *
 * @param columns an array of columns per breakpoint
 */
export function getColumnOffsetClasses(columns: grid.BreakpointColumn[]): string[] {
	let classes: string[];
	if (columns && columns.length) {
		classes = columns.map((col: grid.BreakpointColumn, index: number) => {
			const name = Object.keys(col)[0];

			return `col-${name}-offset-${col[name]}`;
		});
	}
	return classes;
}

// Returns the most appropriate width for an image for a breakpoint range
function calculateBreakpointImageWidth(breakpoint: grid.BreakpointColumn): number {
	const name = Object.keys(breakpoint)[0];
	const range = BREAKPOINT_RANGES[name];
	if (_DEV_ && !range)
		warning(`calcilateBreakpointImageWidth: Unable to find a matching breakpoint for '${breakpoint}'`);

	const { min, max } = range;
	const cols = NUM_COLUMNS / breakpoint[name];

	let width: number;
	if (min && max) {
		width = min + Math.round((max - min) / 2);
	} else if (min) {
		width = min;
	} else if (max) {
		width = max;
	}
	return Math.round(width / cols);
}

// Returns the median width from all the provided breakpoints
export function calculateMedianWidth(columns: grid.BreakpointColumn[]): number {
	if (!columns || !columns.length) return 0;
	const widths = columns.map(breakpoint => calculateBreakpointImageWidth(breakpoint));
	return Math.round(toMedian(widths));
}
