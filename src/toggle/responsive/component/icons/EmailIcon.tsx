import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<svg className={cx('svg-icon', className)} width="16" height="16" viewBox="0 0 16 16">
			<g fill="none" fillRule="evenodd">
				<path
					fill="#DADADA"
					d="M12 4c0 2.21-1.79 4-4 4S4 6.21 4 4s1.79-4 4-4 4 1.79 4 4zM0 14c0-2.66 5.33-4 8-4s8 1.34 8 4v1c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1v-1z"
				/>
			</g>
		</svg>
	);
};
