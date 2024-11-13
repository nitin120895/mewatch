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
					d="M12.5 5.333h-.75V3.81C11.75 1.707 10.07 0 8 0 5.93 0 4.25 1.707 4.25 3.81v1.523H3.5c-.825 0-1.5.686-1.5 1.524v7.62C2 15.313 2.675 16 3.5 16h9c.825 0 1.5-.686 1.5-1.524V6.857c0-.838-.675-1.524-1.5-1.524zM8 12.19c-.825 0-1.5-.685-1.5-1.523 0-.838.675-1.524 1.5-1.524s1.5.686 1.5 1.524S8.825 12.19 8 12.19zM5.75 3.81v1.523h4.5V3.81c0-1.265-1.005-2.286-2.25-2.286S5.75 2.544 5.75 3.81z"
				/>
			</g>
		</svg>
	);
};
