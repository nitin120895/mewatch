import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<svg
			className={cx('svg-icon', className)}
			xmlns="http://www.w3.org/2000/svg"
			width="80"
			height="80"
			viewBox="0 0 80 80"
		>
			<g fill="none" fillRule="evenodd">
				<circle cx="40" cy="40" r="40" fill="#000" fillOpacity=".5" />
				<g stroke="#FFF" strokeLinecap="round" strokeWidth="4">
					<path d="M28 28l12 11.866L52 28M52 51.866L40 40 28 51.866" />
				</g>
			</g>
		</svg>
	);
};
