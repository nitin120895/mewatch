import * as React from 'react';
import * as cx from 'classnames';
import SVGPathIcon from 'shared/component/SVGPathIcon';

interface IconProps extends React.Props<any> {
	className?: string;
	width?: number;
	height?: number;
}

const PATH_DATA =
	'M9.99999 18.8333C14.5588 18.8333 18.3333 15.0506 18.3333 10.5C18.3333 5.94114 14.5506 2.16663 9.99182 2.16663C5.44117 2.16663 1.66666 5.94114 1.66666 10.5C1.66666 15.0506 5.44934 18.8333 9.99999 18.8333ZM9.99999 17.4444C6.14378 17.4444 3.06372 14.3562 3.06372 10.5C3.06372 6.64375 6.13561 3.55551 9.99182 3.55551C13.848 3.55551 16.9444 6.64375 16.9444 10.5C16.9444 14.3562 13.8562 17.4444 9.99999 17.4444ZM9.92646 7.67316C10.5229 7.67316 10.9886 7.19931 10.9886 6.6029C10.9886 6.0065 10.5229 5.53264 9.92646 5.53264C9.33823 5.53264 8.86437 6.0065 8.86437 6.6029C8.86437 7.19931 9.33823 7.67316 9.92646 7.67316ZM8.57025 15.0751H11.8954C12.2304 15.0751 12.4918 14.83 12.4918 14.4951C12.4918 14.1764 12.2304 13.9232 11.8954 13.9232H10.8823V9.76467C10.8823 9.32349 10.6618 9.02937 10.2451 9.02937H8.70914C8.37417 9.02937 8.11274 9.28264 8.11274 9.60127C8.11274 9.93623 8.37417 10.1813 8.70914 10.1813H9.58332V13.9232H8.57025C8.23528 13.9232 7.97385 14.1764 7.97385 14.4951C7.97385 14.83 8.23528 15.0751 8.57025 15.0751Z';

export default (props: IconProps) => {
	const { className, width, height } = props;
	return (
		<SVGPathIcon
			className={cx('svg-icon', className)}
			fill="currentColor"
			data={PATH_DATA}
			width={width ? width : 20}
			height={height ? height : 21}
			viewBox={{ width: width, height: height }}
		/>
	);
};