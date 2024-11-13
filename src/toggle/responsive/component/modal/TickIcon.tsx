import * as React from 'react';
import * as cx from 'classnames';
import SVGPathIcon from 'shared/component/SVGPathIcon';

interface IconProps extends React.Props<any> {
	className?: string;
	width?: number;
	height?: number;
}

export default (props: IconProps) => {
	const { className, width, height } = props;
	return (
		<SVGPathIcon
			className={cx('svg-icon', className)}
			fill="none"
			data={'M1 11.589l5.997 6.036L21.28 4'}
			viewBox={{ width: width || 30, height: height || 30 }}
		/>
	);
};
