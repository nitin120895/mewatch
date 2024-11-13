import * as React from 'react';
import { Breakpoints, BreakpointMap } from '../ref/breakpoints';

interface ViewportMetadataProps extends React.HTMLProps<any> {
	dimensions: viewport.Dimensions;
	activeBreakpoint: viewport.DeviceType;
	width?: number | string;
}

// All the breakpoints except for unconstrained.
const breakpoints = Breakpoints.slice(1);

export default class ViewportMetadata extends React.PureComponent<ViewportMetadataProps, any> {
	getViewportDimensions = dimensions => {
		return dimensions && dimensions.width ? `${dimensions.width} x ${dimensions.height} px` : 'Unknown';
	};
	getCurrentBreakpoint = (breakpoint, viewportWidth: number): string => {
		if (breakpoint === 'unconstrained') {
			if (isNaN(viewportWidth)) return 'Calculating...';
			return breakpoints.filter((key, index, arr) => {
				const range = BreakpointMap.get(key);
				const min: number = Number(range.min),
					max: number = Number(range.max);
				return viewportWidth >= min && viewportWidth <= max;
			})[0];
		}
		return breakpoint;
	};
	render() {
		const { width, activeBreakpoint, dimensions, className } = this.props;
		const breakpointLabel = this.getCurrentBreakpoint(
			activeBreakpoint,
			dimensions ? Number(dimensions.width) : undefined
		);
		const viewportLabel = this.getViewportDimensions(dimensions);
		return (
			<div className={className} style={{ width }}>
				<div className="meta">
					<span className="meta__label">Breakpoint: </span>
					<span className="meta__value meta--capitalize">{breakpointLabel}</span>
				</div>
				<div className="meta">
					<span className="meta__label">Viewport: </span>
					<span className="meta__value">{viewportLabel}</span>
				</div>
			</div>
		);
	}
}
