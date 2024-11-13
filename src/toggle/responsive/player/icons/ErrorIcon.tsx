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
			width={width || 24}
			height={height || 24}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M13.2 15.6H10.8V18H13.2V15.6ZM13.2 6H10.8V13.2H13.2V6ZM12.006 0C18.636 0 24 5.37 24 12C24 18.63 18.636 24 12.006 24C5.376 24 -9.53674e-07 18.63 -9.53674e-07 12C-9.53674e-07 5.37 5.376 0 12.006 0ZM12 21.6C17.304 21.6 21.6 17.304 21.6 12C21.6 6.696 17.304 2.4 12 2.4C6.696 2.4 2.4 6.696 2.4 12C2.4 17.304 6.696 21.6 12 21.6Z"
				fill="currentColor"
			/>
		</svg>
	);
};
