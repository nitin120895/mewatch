import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<svg className={cx('svg-icon', className)} viewBox="0 0 25 20">
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M16.071 18.235V20H7.738v-1.765h8.333zM19.643 0C22.602 0 25 2.37 25 5.294c0 1.26-.446 2.418-1.19 3.327l-.001 8.438H0V1.176h16.252c-.59.478-1.075 1.079-1.416 1.765H1.786v12.354h20.237l.001-5.257c-.717.352-1.526.55-2.381.55-2.959 0-5.357-2.37-5.357-5.294C14.286 2.37 16.684 0 19.643 0zm0 1.47c-2.137 0-3.87 1.712-3.87 3.824s1.733 3.824 3.87 3.824 3.869-1.712 3.869-3.824-1.732-3.823-3.87-3.823zm-.306 1.471c.16 0 .29.13.29.29v2.15l1.609.933c.138.08.183.256.104.394-.08.139-.255.184-.394.104l-1.754-1.014c-.086-.05-.144-.142-.144-.249V3.231c0-.16.13-.29.289-.29z"
			/>
		</svg>
	);
};
