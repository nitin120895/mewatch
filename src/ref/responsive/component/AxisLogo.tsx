import * as React from 'react';
import * as cx from 'classnames';

interface AxisLogoProps extends React.SVGProps<any> {
	width?: string | number;
	height?: string | number;
	fillColor?: string;
	gradientColor?: string;
	gradientOpacity?: number;
	svgIndex?: string;
}

/**
 * Axis Logo
 *
 * An SVG vector logo constructed in a way to allow resuse by altering the colour and size at runtime.
 *
 * You can spawn multiple instanced of this class without requiring additional network requests.
 *
 * Colours can be manipulated via CSS when using `currentColor` but you can provide an explicit Hex
 * value (e.g. '#FFFFFF') if you prefer.
 *
 * Dimensions can be manipulated via CSS when using `100%` (fill the container) but you can provide
 * explicit pixel values (e.g. '200' or 200) if you prefer.
 *
 * Note: this is an optimised version of the source artwork to ensure it has the smallest filesize.
 * If you need to replace the artwork optimise it first.
 *
 * See: http://petercollingridge.appspot.com/svg-optimiser
 */
export default class AxisLogo extends React.Component<AxisLogoProps, any> {
	static defaultProps = {
		id: 'logo',
		role: 'img',
		width: '100%',
		height: '100%',
		fillColor: 'currentColor',
		gradientColor: 'currentColor',
		gradientOpacity: 0.65,
		svgIndex: ''
	};

	constructor(props) {
		super(props);
	}

	render() {
		const { width, height, fillColor, gradientColor, gradientOpacity, className, id, role, svgIndex } = this.props;
		const aId = id + '__a' + svgIndex;
		const xlId = id + '__xl' + svgIndex;
		const xrId = id + '__xr' + svgIndex;
		return (
			<svg
				width={width}
				height={height}
				viewBox="0 0 220.1 65.1"
				role={role}
				className={cx('axis-logo', className)}
				aria-label="Axis Logo"
			>
				<title>Axis Logo</title>
				{/* Letter "A" */}
				<linearGradient
					id={aId}
					gradientUnits="userSpaceOnUse"
					x1="41.4"
					y1="25.1"
					x2="26.2"
					y2="25.1"
					gradientTransform="matrix(1 0 0 -1 0 66)"
				>
					<stop offset="0" stopColor={gradientColor} stopOpacity={gradientOpacity} />
					<stop offset="1" stopColor={fillColor} />
				</linearGradient>
				<polygon fill={`url(#${aId})`} points="25.9 33.8 21.4 48 40.7 48 36.2 33.8 " />
				<path
					fill={fillColor}
					d="M40.7 48l1.5 4.7L46 63.9h16.9L39.7 1.8H23.2L0 63.9h16.6l3.9-11.1L22 48l4.5-14.1L31.3 19h0.2l4.7 14.9L40.7 48z"
				/>
				{/* Letter "X" */}
				<linearGradient
					id={xlId}
					gradientUnits="userSpaceOnUse"
					x1="183.2"
					y1="52.4"
					x2="205.2"
					y2="73.6"
					gradientTransform="matrix(-1 0 0 -1 275.7814 79.5457)"
				>
					<stop offset="0" stopColor={gradientColor} stopOpacity={gradientOpacity} />
					<stop offset="0.25" stopColor={fillColor} />
				</linearGradient>
				<path fill={`url(#${xlId})`} d="M97.8 21.8L86.3 32.9 65.4 11.3 76.9 0.2 97.8 21.8z" />
				<linearGradient id={xrId} gradientUnits="userSpaceOnUse" x1="101.9" y1="38.2" x2="123.9" y2="59.4">
					<stop offset="0" stopColor={gradientColor} stopOpacity={gradientOpacity} />
					<stop offset="0.25" stopColor={fillColor} />
				</linearGradient>
				<path fill={`url(#${xrId})`} d="M96.7 43.5l11.5-11.1L129.1 54l-11.5 11.1L96.7 43.5z" />
				<path fill={fillColor} d="M117.5 0.2l11.5 11.1L77 65 65.5 54 117.5 0.2z" />
				{/* Letter "I" */}
				<path fill={fillColor} d="M139 1.8h16.2v62.1H139V1.8z" />
				{/* Letter "S" */}
				<path
					fill={fillColor}
					d="M182.3 42.8c0.4 7.3 4.9 9.6 11.7 9.6 4.9 0 9.9-1.7 9.9-6.4 0-5.5-8.9-6.5-17.8-9s-18.2-6.5-18.2-17.9c0-13.6 13.6-18.9 25.3-18.9 12.4 0 24.8 6 24.9 20h-16.2c0.3-5.6-5-7.5-10-7.5 -3.5 0-7.8 1.2-7.8 5.3 0 4.8 9 5.6 18 8.2 9 2.5 18 6.7 18 17.9 0 15.7-13.4 20.8-27 20.8 -14.3 0-26.9-6.3-27-22.2L182.3 42.8z"
				/>
			</svg>
		);
	}
}
