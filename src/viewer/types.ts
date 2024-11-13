declare namespace viewport {
	// These should match your declared media query breakpoints
	type DeviceType = 'phone' | 'phablet' | 'tablet' | 'laptop' | 'desktop' | 'desktopWide' | 'uhd' | 'unconstrained';
	interface Dimensions {
		width: number | string;
		height: number | string;
	}
	interface Breakpoint {
		icon?: DeviceType;
		iconSize?: number | string;
		min: number | string;
		max: number | string;
	}
}
