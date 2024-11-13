import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<svg className={cx('svg-icon', className)} width="18" height="18" viewBox="0 0 18 18">
			<line
				x1="5.47085"
				y1="5.45818"
				x2="12.5293"
				y2="12.5418"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<line
				x1="5.45809"
				y1="12.5292"
				x2="12.5417"
				y2="5.47078"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
};
