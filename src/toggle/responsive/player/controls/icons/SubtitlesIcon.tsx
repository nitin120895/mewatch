import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<svg className={cx('svg-icon', className)} viewBox="0 0 42 36">
			<g fill="none" fillRule="evenodd">
				<path stroke="currentColor" d="M7 8h28v20H7z" />
				<path
					fill="currentColor"
					strokeWidth="4"
					d="M32.219 28.639a3.59 3.59 0 0 0 3.58-3.58V3.579A3.59 3.59 0 0 0 32.219 0H3.579A3.59 3.59 0 0 0 0 3.58v21.479a3.59 3.59 0 0 0 3.58 3.58h18.796L25.939 34l3.594-5.361h2.686zm-28.64-14.32h7.16v3.58H3.58v-3.58zm17.9 10.74H3.58v-3.58h17.9v3.58zm10.74 0h-7.16v-3.58h7.16v3.58zm0-7.16h-17.9v-3.58h17.9v3.58z"
				/>
			</g>
		</svg>
	);
};
