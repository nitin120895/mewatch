import * as React from 'react';
import * as cx from 'classnames';
import SVGPathIcon from 'shared/component/SVGPathIcon';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<SVGPathIcon
			className={cx('svg-icon', className)}
			data={'M3 3 L15 14 L27 3'}
			viewBox={{ width: 27, height: 18 }}
			fill="transparent"
			stroke="white"
		/>
	);
};
