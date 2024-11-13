import * as React from 'react';
import * as cx from 'classnames';

interface BackIconProps extends React.Props<any> {
	className?: string;
	width?: string;
	height?: string;
}

export default (props: BackIconProps) => {
	const { className, width, height } = props;
	return (
		<svg className={cx('svg-icon', className)} width={width || 29} height={height || 45} viewBox="0 0 29 45">
			<g fill="none" fillRule="evenodd">
				<path d="M-23 0h87.722v87.75H-23z" opacity=".5" />
				<path fill="currentColor" fillRule="nonzero" d="M29 40L11 22 29 5l-5-5L1 22l23 23z" />
			</g>
		</svg>
	);
};
