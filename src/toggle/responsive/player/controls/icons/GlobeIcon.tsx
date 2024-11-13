import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<svg className={cx('svg-icon', className)} viewBox="0 0 36 36">
			<g fill="none" fillRule="evenodd" opacity=".9" transform="translate(1)">
				<circle cx="17" cy="17" r="15.95" stroke="currentColor" strokeWidth="2.1" />
				<path fill="currentColor" d="M2.125 10.625h29.75v2.125H2.125zM2.125 21.25h29.75v2.125H2.125z" />
				<path
					fill="currentColor"
					d="M14.93 2.125s-4.265 2.894-4.265 14.922c0 12.029 4.264 14.923 4.264 14.923h2.155s-4.317-2.612-4.317-14.923c0-12.31 4.176-14.922 4.176-14.922H14.93z"
				/>
				<path
					fill="currentColor"
					d="M19.155 2.125s4.204 2.894 4.204 14.922c0 12.029-4.204 14.923-4.204 14.923H17s4.256-2.612 4.256-14.923c0-12.31-4.115-14.922-4.115-14.922h2.014z"
				/>
			</g>
		</svg>
	);
};
