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
		<svg className={cx('svg-icon', className)} width={width || 26} height={height || 26} viewBox="0 0 22 22">
			<g strokeWidth="2" fill="none">
				<path d="M11 16V2M16.1 7.3L11 2 5.8 7.3" />
				<path d="M1 14v7h20v-7" />
			</g>
		</svg>
	);
};
