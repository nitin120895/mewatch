import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
	width?: string;
	height?: string;
	fill?: string;
}

export default (props: IconProps) => {
	const { className, width, height, fill } = props;
	return (
		<svg
			className={cx('svg-icon', className)}
			width={width || '100%'}
			height={height || '100%'}
			viewBox="0 0 22 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M1.87209 9.59826C0.799094 6.24826 2.00046 1.99985 5.57009 1.28626C7.5 1 9.46209 2.04126 11.0001 3.19826C12.4551 2.07326 14.5 0.999841 16.4201 1.28626C20.0002 1.99985 21.1991 6.24826 20.1271 9.59826C18.4571 14.9083 11.0001 18.9983 11.0001 18.9983C11.0001 18.9983 3.59809 14.9703 1.87209 9.59826Z"
				stroke={fill ? fill : 'currentColor'}
				fill={fill ? fill : 'transparent'}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};
