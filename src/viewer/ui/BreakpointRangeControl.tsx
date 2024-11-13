import * as React from 'react';
import { BreakpointMap } from '../ref/breakpoints';

interface BreakpointRangeControlProps extends React.Props<any> {
	breakpoint: viewport.DeviceType;
	viewportWidth: number | string;
	onChange(newWidth: number | string): void;
}

export default class BreakpointRangeControl extends React.Component<BreakpointRangeControlProps, any> {
	private slider;
	componentDidUpdate(prevProps: BreakpointRangeControlProps, prevState: any) {
		if (this.slider && Number(this.slider.value) !== Number(this.props.viewportWidth)) {
			// When changing breakpoints we update the sliders `min`, `max`, and `value` simulteaneously
			// on the next render cycle. Unfortunately there is an issue which affects all modern browsers
			// where although it correctly updates the DOM element's attribute values the computed `value`
			// remains unchanged. This affects switching from a larger breakpoint to smaller one as the
			// slider position snaps to 100% instead of 0%.
			// To solve this we update it's value after post rendering to ensure the position is consistent
			// with the provided value.
			this.slider.value = this.props.viewportWidth;
		}
	}

	onReference = input => (this.slider = input);
	onSlide = e => this.props.onChange(Number(this.slider.value));

	render() {
		const { breakpoint, viewportWidth } = this.props;

		const disabled = breakpoint === 'unconstrained';
		const title = disabled ? 'Responsive' : 'Breakpoint Width Range';
		const range = BreakpointMap.get(breakpoint);
		// Ensure it's always a managed component, even when it's disabled
		const min: number = Number(range.min) || 0,
			max: number = Number(range.max) || 0;
		const value: number = Number(viewportWidth) || 0;

		return (
			<div className="bp-slider">
				<div className="bp-slider__title">{title}</div>
				<div className="bp-slider__control" style={disabled ? { display: 'none' } : undefined}>
					<span>{range.min}</span>
					<input
						ref={this.onReference}
						id="bp-range-input"
						type="range"
						step="1"
						value={`${value}`}
						min={min}
						max={max}
						onChange={this.onSlide}
					/>
					<span>{range.max}</span>
				</div>
			</div>
		);
	}
}
