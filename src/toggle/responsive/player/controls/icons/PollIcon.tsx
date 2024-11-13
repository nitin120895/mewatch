import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
	width?: string;
	height?: string;
}

export default (props: IconProps) => {
	const { className, width, height } = props;
	return (
		<svg
			className={cx('svg-icon', className)}
			width={width || 15}
			height={height || 18}
			viewBox="0 0 15 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M8.62 1.31V17.93H6V1.31C6 0.59 6.59 0 7.31 0C8.03 0 8.62 0.59 8.62 1.31Z" fill="currentColor" />
			<path
				d="M14.62 4.65009V17.9301H12V4.65009C12 3.93009 12.59 3.34009 13.31 3.34009C14.03 3.34009 14.62 3.93009 14.62 4.65009Z"
				fill="currentColor"
			/>
			<path d="M2.62 8.31V17.69H0V8.31C0 7.59 0.59 7 1.31 7C2.03 7 2.62 7.59 2.62 8.31Z" fill="currentColor" />
		</svg>
	);
};
