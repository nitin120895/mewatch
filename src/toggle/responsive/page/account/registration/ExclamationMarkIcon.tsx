import * as React from 'react';
import SVGPathIcon from 'shared/component/SVGPathIcon';
import * as cx from 'classnames';

interface CastIconProps extends React.Props<any> {
	className?: string;
}

export default (props: CastIconProps) => {
	const { className } = props;
	return (
		<SVGPathIcon
			className={cx('svg-icon', className)}
			data={
				'M50,5C25.1,5,5,25.1,5,50c0,24.9,20.1,45,45,45c24.9,0,45-20.1,45-45C95,25.1,74.9,5,50,5L50,5z M55.6,77  c0,3.2-2.5,5.6-5.6,5.6c-3.1,0-5.5-2.5-5.5-5.6v-1.1c0-3.1,2.5-5.6,5.5-5.6c3.1,0,5.6,2.5,5.6,5.6V77z M58.3,26.3l-2.8,34.2  c-0.3,3.2-3,5.4-6.1,5.2c-2.8-0.2-4.9-2.5-5.1-5.2l-2.8-34.2c-0.5-4.5,3.7-8.9,8.2-8.9C54.7,17.4,58.7,21.8,58.3,26.3z'
			}
			viewBox={{ width: 100, height: 100 }}
		/>
	);
};
