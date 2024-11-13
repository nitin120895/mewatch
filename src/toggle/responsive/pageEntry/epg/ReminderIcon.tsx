import * as React from 'react';
import * as cx from 'classnames';

interface ReminderIconProps extends React.Props<any> {
	className?: string;
}

export default (props: ReminderIconProps) => {
	const { className } = props;
	return (
		<svg className={cx('svg-icon', className)} viewBox="0 0 20 20">
			<g fill="currentColor" fillRule="evenodd">
				<path d="M14.845 9.232l1.214 1.34c.261.287.403.668.403 1.06v1.74c0 .826-.625 1.536-1.458 1.536H2.07c-.833 0-1.458-.71-1.458-1.535v-1.741c0-.392.141-.773.402-1.06l1.214-1.34V7.816c0-3.452 1.767-5.95 4.78-6.74l.096-.019C7.738.956 8.22.905 8.588.905c.352 0 .806.052 1.434.162l.08.018c2.977.778 4.743 3.277 4.743 6.731v1.416zM8.398 18.05c1.18 0 2.145-.93 2.145-2.065H6.254c0 1.136.965 2.064 2.144 2.064z" />
			</g>
		</svg>
	);
};
