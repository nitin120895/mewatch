import * as React from 'react';

interface DeleteIconProps extends React.SVGProps<any> {
	width?: string | number;
	height?: string | number;
	fillColor?: string;
}

/**
 * Delete Icon
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
export default class DeleteIcon extends React.Component<DeleteIconProps, any> {
	static defaultProps = {
		id: 'deleteSVG',
		role: 'img',
		width: '100%',
		height: '100%',
		fillColor: 'currentColor'
	};

	render() {
		const { width, height, fillColor } = this.props;
		return (
			<svg width={width} height={height} viewBox="0 0 18 18">
				<title>Delete Profile</title>
				<g fill="none">
					<circle cx="9" cy="9" r="9" fill={fillColor} className="circle" />
					<g className="cross-icon-inner">
						<path d="M5 5l4 4-4 4M13 5L9 9l4 4" />
					</g>
				</g>
			</svg>
		);
	}
}
