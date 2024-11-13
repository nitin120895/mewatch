import * as React from 'react';

interface LockIconProps extends React.SVGProps<any> {
	width?: string | number;
	height?: string | number;
	className?: string;
	title?: string;
}

/**
 * Lock Icon
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
export default class LockIcon extends React.Component<LockIconProps, any> {
	static defaultProps = {
		width: '100%',
		height: '100%',
		title: 'Profile parental lock'
	};

	render() {
		const { width, height, className, title } = this.props;
		return (
			<svg width={width} height={height} viewBox="0 0 16 19" className={className}>
				<title>{title}</title>
				<path
					fill={'currentColor'}
					d="M9 12.732a2 2 0 1 0-2 0V14a1 1 0 0 0 2 0v-1.268zM2 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
				/>
				<g fill="none" fillRule="evenodd">
					<path
						d="M3 12V4a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v8"
						stroke={'currentColor'}
						strokeWidth={2}
						className="lock-icon-inner"
					/>
					<path d="M5 9h7v8H5z" strokeWidth={0} className="lock-keyhole" fill="none" />
					<path
						strokeWidth={0}
						fill={'currentColor'}
						d="M9 12.7a2 2 0 1 0-2 0V14a1 1 0 0 0 2 0v-1.3zM2 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
					/>
					<path
						className="lock-icon-inner bottom"
						d="M10 13.236V14a2 2 0 1 1-4 0v-0.764a3 3 0 1 1 4 0zM2 7a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H2z"
					/>
				</g>
			</svg>
		);
	}
}
