import * as React from 'react';
import * as cx from 'classnames';

interface CastIconProps extends React.Props<any> {
	className?: string;
	width?: string;
	height?: string;
}

export default (props: CastIconProps) => {
	const { className, width, height } = props;
	return (
		<svg
			className={cx('svg-icon', className)}
			id="svg"
			x="0"
			y="0"
			width={width || 24}
			height={height || 24}
			viewBox="0 0 24 24"
		>
			<g>
				<path id="arch0" className="arch-1" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z" />
				<path id="arch1" className="arch-2" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z" />
				<path
					id="arch2"
					className="arch-3"
					d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"
				/>
				<path
					id="box"
					d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"
				/>
				<path id="boxfill" d="M5,7 L5,8.63 C8,8.6 13.37,14 13.37,17 L19,17 L19,7 Z" />
			</g>
		</svg>
	);
};
