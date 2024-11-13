import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<svg className={cx('svg-icon', className)} width="12" height="2" viewBox="0 0 12 2">
			<line x1="1" y1="1" x2="11" y2="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
};
