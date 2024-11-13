import * as React from 'react';
import * as cx from 'classnames';
import './LiveIcon.scss';

interface IconProps extends React.Props<any> {
	className?: string;
	width?: number;
}

export default (props: IconProps) => {
	const { className, width } = props;

	return <div className={cx('live-icon', className)} style={{ width: width, height: width }} />;
};
