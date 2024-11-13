import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className={cx('svg-icon', className)}
			width="13"
			height="13"
			viewBox="0 0 13 13"
		>
			<g fill="none" fillRule="nonzero" stroke="#FFF">
				<path
					strokeWidth=".5"
					d="M12.75 6.5a6.23 6.23 0 0 1-1.831 4.419A6.23 6.23 0 0 1 6.5 12.75a6.23 6.23 0 0 1-4.419-1.831A6.23 6.23 0 0 1 .25 6.5c0-1.725.7-3.287 1.831-4.419A6.23 6.23 0 0 1 6.5.25c1.725 0 3.287.7 4.419 1.831A6.23 6.23 0 0 1 12.75 6.5z"
				/>
				<path
					fill="#FFF"
					strokeWidth=".2"
					d="M7.054 4.45a.815.815 0 0 0 .572-.213.672.672 0 0 0 .224-.538.659.659 0 0 0-.235-.506A.839.839 0 0 0 7.05 3a.813.813 0 0 0-.57.215.67.67 0 0 0-.226.536c.006.211.086.38.24.508a.85.85 0 0 0 .56.191zm-.504 5.805L7.476 5.5h-1.45L5.1 10.255h1.45z"
				/>
			</g>
		</svg>
	);
};
