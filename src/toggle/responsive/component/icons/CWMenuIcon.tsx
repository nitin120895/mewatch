import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="4"
			height="18"
			viewBox="0 0 4 18"
			fill="none"
			className={cx('svg-icon', className)}
		>
			<circle cx="2" cy="2" r="2" fill="white" />
			<circle cx="2" cy="8.66663" r="2" fill="white" />
			<circle cx="2" cy="15.3334" r="2" fill="white" />
		</svg>
	);
};
