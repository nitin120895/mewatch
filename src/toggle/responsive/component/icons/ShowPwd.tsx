import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<svg className={cx('svg-icon', className)} width="20" height="20" viewBox="0 0 20 20">
			<g fill="none" fillRule="evenodd">
				<path
					fill="#A6A6A6"
					fillRule="nonzero"
					d="M10 3.125c-4.545 0-8.427 2.85-10 6.875 1.573 4.024 5.455 6.875 10 6.875s8.427-2.85 10-6.875c-1.573-4.024-5.455-6.875-10-6.875zm0 11.458c-2.51 0-4.545-2.053-4.545-4.583 0-2.53 2.036-4.583 4.545-4.583 2.51 0 4.545 2.053 4.545 4.583 0 2.53-2.036 4.583-4.545 4.583zm0-7.333A2.735 2.735 0 0 0 7.273 10 2.735 2.735 0 0 0 10 12.75 2.735 2.735 0 0 0 12.727 10 2.735 2.735 0 0 0 10 7.25z"
				/>
			</g>
		</svg>
	);
};
