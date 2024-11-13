import * as React from 'react';
import * as cx from 'classnames';

interface SelectorIconProps extends React.Props<any> {
	className?: string;
	width?: string;
	height?: string;
}

export default (props: SelectorIconProps) => {
	const { className, width, height } = props;
	return (
		<svg className={cx('svg-icon', className)} width={width || 28} height={height || 21} viewBox="0 0 28 21">
			<g fill="none" fillRule="evenodd" transform="translate(0 2)">
				<rect width="18" height="11" y="7" fill="currentColor" rx=".794" />
				<path
					stroke="currentColor"
					strokeWidth="2.118"
					d="M3 5.444v-.65C3 4.356 3.356 4 3.794 4h16.412c.438 0 .794.356.794.794v11.412a.794.794 0 0 1-.794.794h-.893"
				/>
				<path
					stroke="currentColor"
					strokeWidth="2.118"
					d="M7 1.444v-.65C7 .356 7.356 0 7.794 0h17.412c.438 0 .794.356.794.794v11.412a.794.794 0 0 1-.794.794h-.987"
				/>
			</g>
		</svg>
	);
};
