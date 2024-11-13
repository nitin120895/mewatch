import * as React from 'react';

export type SVGViewBox = {
	minX?: string | number;
	minY?: string | number;
	width: string | number;
	height: string | number;
};

interface SVGPathIconProps extends React.Props<any> {
	className?: string;
	data: string;
	viewBox?: SVGViewBox;
	fill?: string; // Fill colour
	stroke?: string; // Stroke colour
	width?: string | number;
	height?: string | number;
	size?: string | number;
}

/**
 * SVG Icon containing a single path element.
 *
 * These can be styled externally via CSS: http://tympanus.net/codrops/2015/07/16/styling-svg-use-content-css/
 *
 * > 	If the `fill` prop is set to 'currentColor' then it will inherit whichever CSS `color` value
 * 		is set on its ancestor.
 * > 	If the `stroke` prop is set to 'currentStroke' then it will inherit whichever CSS `stroke` value
 * 		is set on its ancestor. You can control the stroke width via the CSS `stroke-width` value.
 *
 *	```
 *	.icon {
 * 		color: #ccc;
 * 		stroke: #000;
 * 		stroke-width: 3px;
 * 	}
 *	```
 *
 * > 	If the `fill` prop isn't specified then you can provide a colour via the CSS `fill` value which
 * 		acts like the CSS `color` value but is specific to SVG elements. For this to work you need to
 * 		set a CSS rule such as `svg path { fill: inherit; }`.
 *
 *	```
 *	.icon {
 *		path {
 * 			fill: inherit;
 *		}
 * 		fill: currentColor;
 * 		color: #ccc;
 * 	}
 *	```
 *
 * > 	If the `fill` prop is set to an explicit color value (e.g. '#F00' or 'red') then it will use the
 * 		inline value. No CSS color is required, however if one is provided it can override it.
 */
export default class SVGPathIcon extends React.Component<SVGPathIconProps, any> {
	static defaultProps = {
		fill: 'currentColor',
		stroke: 'currentStroke',
		width: '100%',
		height: '100%'
	};
	constructor(props) {
		super(props);
	}
	render() {
		const { data, className, fill, stroke, size, viewBox } = this.props;
		let { width, height } = this.props;
		if (size) width = height = size;
		const vb = viewBox ? `${viewBox.minX || '0'} ${viewBox.minY || '0'} ${viewBox.width} ${viewBox.height}` : undefined;
		return (
			<svg className={className} width={width} height={height} viewBox={vb}>
				<path fill={fill} stroke={stroke} d={data} />
			</svg>
		);
	}
}

/**
 * SVG Symbol Declaration
 *
 * Although these are added to the DOM they are invisible and are used purely for reusability of the child graphic.
 * By providing a Symbol you're allowing the contents to be instantiated or cloned multiple times within the Shadow DOM.
 * To spawn an instance you reference the ID via an SVG `use` element.
 *
 * ```
 * <svg viewBox="0 0 50 50">
			<use xlinkHref="#symbolId" x="0" y="0" />
		</svg>
 * ```
 */
export class SVGSymbol extends React.Component<any, any> {
	render() {
		const { id, viewBox, children } = this.props;
		const vb = viewBox ? `${viewBox.minX || '0'} ${viewBox.minY || '0'} ${viewBox.width} ${viewBox.height}` : undefined;
		return (
			<svg className="hidden">
				<symbol id={id} viewBox={vb}>
					{children}
				</symbol>
			</svg>
		);
	}
}
