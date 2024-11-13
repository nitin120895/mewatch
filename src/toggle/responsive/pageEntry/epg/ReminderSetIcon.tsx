import * as React from 'react';
import * as cx from 'classnames';

interface ReminderSetIconProps extends React.Props<any> {
	className?: string;
}

export default (props: ReminderSetIconProps) => {
	const { className } = props;
	return (
		<svg className={cx('svg-icon', className)} viewBox="0 0 20 20">
			<g fill="currentColor" fillRule="evenodd">
				<path d="M10.846.495a3.727 3.727 0 0 0-.727 2.21c0 2.133 1.812 3.863 4.048 3.863.186 0 .369-.012.548-.035.003.1.005.2.005.302v1.4l1.237 1.324c.266.285.41.661.41 1.05v1.72c0 .817-.637 1.519-1.485 1.519H1.702c-.849 0-1.486-.702-1.486-1.518v-1.722c0-.388.144-.764.41-1.049l1.237-1.324v-1.4C1.863 3.42 3.663.95 6.734.17L6.831.15C7.477.051 7.97 0 8.344 0c.358 0 .821.052 1.46.16l.083.019c.335.085.655.19.959.316z" />
				<ellipse cx="14.167" cy="2.705" stroke="#FFF" strokeWidth="4" rx="1" ry="1" />
				<path d="M8.15 16.955c1.202 0 2.185-.919 2.185-2.041h-4.37c0 1.122.984 2.04 2.185 2.04z" />
			</g>
		</svg>
	);
};
