import * as React from 'react';
import * as cx from 'classnames';

interface PauseIconProps extends React.Props<any> {
	className?: string;
	width?: string;
	height?: string;
}

export default (props: PauseIconProps) => {
	const { className, width, height } = props;
	return (
		<svg className={cx('svg-icon', className)} width={width || 26} height={height || 36} viewBox="0 0 26 36">
			<g fill="currentColor" fillRule="evenodd">
				<rect width="7.73" height="36" rx=".75" />
				<rect x="18.27" width="7.73" height="36" rx=".75" />
			</g>
		</svg>
	);
};
