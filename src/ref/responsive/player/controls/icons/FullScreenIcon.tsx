import * as React from 'react';
import * as cx from 'classnames';

interface FullScreenIconProps extends React.Props<any> {
	className?: string;
	width?: string;
	height?: string;
}

export default (props: FullScreenIconProps) => {
	const { className, width, height } = props;
	return (
		<svg className={cx('svg-icon', className)} width={width || 42} height={height || 36} viewBox="0 0 42 36">
			<g fill="none" fillRule="evenodd">
				<path fill="currentColor" d="M7 8h28v20H7z" />
				<path
					stroke="currentColor"
					strokeWidth="4"
					d="M0 8V3a3 3 0 0 1 3-3h7M0 28v5a3 3 0 0 0 3 3h7M42 8V3a3 3 0 0 0-3-3h-7M42 28v5a3 3 0 0 1-3 3h-7"
				/>
			</g>
		</svg>
	);
};
