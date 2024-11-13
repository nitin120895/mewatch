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
				'M38.182 0H3.818C1.718 0 0 1.7 0 3.778v5.666h3.818V3.778h34.364v26.444H24.818V34h13.364c2.1 0 3.818-1.7 3.818-3.778V3.778C42 1.7 40.282 0 38.182 0zM0 28.333V34h5.727c0-3.136-2.558-5.667-5.727-5.667zm0-7.555v3.778c5.27 0 9.545 4.23 9.545 9.444h3.819c0-7.31-5.976-13.222-13.364-13.222zm0-7.556V17c9.488 0 17.182 7.612 17.182 17H21c0-11.484-9.412-20.778-21-20.778z'
			}
			viewBox={{ width: 42, height: 34 }}
		/>
	);
};
