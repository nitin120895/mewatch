import * as React from 'react';
import * as cx from 'classnames';
import SVGPathIcon from 'shared/component/SVGPathIcon';

interface IconProps extends React.Props<any> {
	className?: string;
	stroke?: string;
}

export default (props: IconProps) => {
	const { className, stroke } = props;
	return (
		<SVGPathIcon
			fill="none"
			stroke={stroke || 'currentColor'}
			className={cx('svg-icon', className)}
			data={'M1 1l6 5.933L13 1M13 12.933L7 7l-6 5.933'}
			viewBox={{ width: 16, height: 16 }}
		/>
	);
};
