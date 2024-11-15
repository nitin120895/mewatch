import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<svg className={cx('svg-icon', className)} width="72" height="46" viewBox="0 0 72 46">
			<g transform="matrix(0.99173562,0,0,1.0043668,-71.206618,-85.471615)">
				<path
					fill="#1A1F71"
					d="m 144.4,128.2 c 0,1.5 -1.2,2.7 -2.7,2.7 H 74.5 c -1.5,0 -2.7,-1.2 -2.7,-2.7 V 87.8 c 0,-1.5 1.2,-2.7 2.7,-2.7 h 67.2 c 1.5,0 2.7,1.2 2.7,2.7 z"
					id="path77"
				/>
				<path
					fill="#FFFFFF"
					d="m 99.4,98.4 -8.1,19.3 H 86 L 82,102.3 C 81.8,101.4 81.5,101 80.8,100.6 79.6,100 77.6,99.3 75.9,99 L 76,98.4 h 8.5 c 1.1,0 2.1,0.7 2.3,2 l 2.1,11.2 5.2,-13.1 h 5.3 z m 20.7,13 c 0,-5.1 -7,-5.4 -7,-7.6 0,-0.7 0.7,-1.4 2.1,-1.6 0.7,-0.1 2.7,-0.2 4.9,0.9 L 121,99 c -1.2,-0.4 -2.7,-0.9 -4.7,-0.9 -4.9,0 -8.4,2.6 -8.4,6.4 0,2.8 2.5,4.3 4.4,5.2 1.9,0.9 2.6,1.5 2.6,2.4 0,1.3 -1.5,1.9 -3,1.9 -2.5,0 -4,-0.7 -5.1,-1.2 l -0.9,4.2 c 1.2,0.5 3.3,1 5.5,1 5.2,0 8.6,-2.6 8.7,-6.6 m 13,6.3 h 4.6 l -4,-19.3 h -4.3 c -1,0 -1.8,0.6 -2.1,1.4 l -7.5,17.9 h 5.2 l 1,-2.9 h 6.4 z m -5.6,-6.8 2.6,-7.2 1.5,7.2 z m -21,-12.5 -4.1,19.3 h -5 l 4.1,-19.3 z"
					id="path79"
				/>
			</g>
		</svg>
	);
};
