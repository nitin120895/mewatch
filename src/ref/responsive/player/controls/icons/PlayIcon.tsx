import * as React from 'react';
import * as cx from 'classnames';
import SVGPathIcon from 'shared/component/SVGPathIcon';

interface PlayIconProps extends React.Props<any> {
	className?: string;
	width?: string;
	height?: string;
}

export default (props: PlayIconProps) => {
	const { className, width, height } = props;
	const viewBox = { width: 26, height: 34 };
	const icon =
		'M24.575 16.013L1.883.303A1.2 1.2 0 0 0 0 1.29v31.42a1.2 1.2 0 0 0 1.883.986l22.692-15.71a1.2 1.2 0 0 0 0-1.973z';

	return (
		<SVGPathIcon
			className={cx('svg-icon', className)}
			data={icon}
			width={width || 26}
			height={height || 34}
			viewBox={viewBox}
		/>
	);
};
