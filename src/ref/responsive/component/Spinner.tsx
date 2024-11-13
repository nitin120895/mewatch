import * as React from 'react';
import * as cx from 'classnames';

import './Spinner.scss';

interface SpinnerProps extends React.HTMLProps<SVGElement> {
	delayVisibility?: boolean;
}

export default function Spinner(props: SpinnerProps) {
	const { className, delayVisibility } = props;
	// The SVG linear gradients require an ID instead of a className.
	const id = (className || 'id').replace(/\W/g, '');

	return (
		<div className={cx('spinner', { 'spinner--delay': delayVisibility }, className)}>
			<svg className="spinner__circle svg-icon" viewBox="0 0 32 32">
				<defs>
					<linearGradient id={`spinner-${id}-g1`} gradientUnits="objectBoundingBox" x1="1" y1="0" x2="0" y2="0">
						<stop offset="0%" stopColor="currentColor" stopOpacity="0" />
						<stop offset="100%" stopColor="currentColor" stopOpacity="0.5" />
					</linearGradient>
					<linearGradient id={`spinner-${id}-g2`} gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
						<stop offset="100%" stopColor="currentColor" stopOpacity="1" />
					</linearGradient>
				</defs>
				<g fill="none" strokeWidth="3">
					<path d="m16,16m-14,0a14,14 0 1,0 28,0" stroke={`url(#spinner-${id}-g1)`} />
					<path d="m30,16a14,14 0 1,0 -28,0" stroke={`url(#spinner-${id}-g2)`} />
				</g>
			</svg>
		</div>
	);
}
