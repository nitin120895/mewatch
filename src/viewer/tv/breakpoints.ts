/**
 * The breakpoints you wish to allow within the Component Viewer.
 */
export const Breakpoints: viewport.DeviceType[] = [
	'unconstrained',
	'phone',
	'phablet',
	'tablet',
	'laptop',
	'desktop',
	'uhd'
];

/**
 * Ensure this map matches the minimum & maximum widths defined for each of your CSS media queries.
 */
export const BreakpointMap = new Map<viewport.DeviceType, viewport.Breakpoint>();
BreakpointMap.set('unconstrained', { icon: 'unconstrained', iconSize: 24, min: '∞', max: '∞' });
BreakpointMap.set('tablet', { icon: 'tablet', iconSize: 28, min: 720, max: 959 });
BreakpointMap.set('desktop', { icon: 'desktop', iconSize: 36, min: 1200, max: 1920 });
BreakpointMap.set('uhd', { icon: 'uhd', iconSize: 36, min: 1921, max: 3840 });
