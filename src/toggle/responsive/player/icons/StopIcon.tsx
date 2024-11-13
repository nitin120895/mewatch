import * as React from 'react';
import * as cx from 'classnames';

interface CloseIconProps extends React.Props<any> {
	className?: string;
	width?: string;
	height?: string;
}

export default (props: CloseIconProps) => {
	const { className, width, height } = props;
	return (
		<svg className={cx('svg-icon', className)} width={width || 32} height={height || 32} viewBox="0 0 32 32">
			<g fill="currentColor" fillRule="evenodd">
				<rect width="32" height="32" x=".971" y=".971" rx="1" />
			</g>
		</svg>
	);
};
