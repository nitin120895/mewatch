import * as React from 'react';
import * as cx from 'classnames';
import SVGPathIcon from 'shared/component/SVGPathIcon';

interface CloseFullScreenIconProps extends React.Props<any> {
	className?: string;
	width?: string;
	height?: string;
}

export default (props: CloseFullScreenIconProps) => {
	const { className, width, height } = props;
	const viewBox = { width: 42, height: 36 };
	const icon =
		'M4 0h34a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4zm4.6 12.91V8.5a.9.9 0 0 1 .9-.9h6.348V4H9.5A4.5 4.5 0 0 0 5 8.5v4.41h3.6zm0 9.09H5v4.41a4.5 4.5 0 0 0 4.5 4.5h6.348v-3.6H9.5a.9.9 0 0 1-.9-.9V22zm24.648-9.09h3.6V8.5a4.5 4.5 0 0 0-4.5-4.5H26v3.6h6.348a.9.9 0 0 1 .9.9v4.41zm0 9.09v4.41a.9.9 0 0 1-.9.9H26v3.6h6.348a4.5 4.5 0 0 0 4.5-4.5V22h-3.6z';

	return (
		<SVGPathIcon
			className={cx('svg-icon', className)}
			width={width || 42}
			height={height || 36}
			data={icon}
			viewBox={viewBox}
		/>
	);
};
