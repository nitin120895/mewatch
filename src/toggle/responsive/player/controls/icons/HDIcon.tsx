import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<svg className={cx('svg-icon', className)} viewBox="0 0 24 16">
			<g fill="currentColor" fillRule="evenodd">
				<rect width="24" height="16" fill="#A5238C" fillRule="nonzero" rx="2" />
				<path
					fill="#FFF"
					d="M4.5 12V4.3h1.694v3.047h3.124V4.3h1.694V12H9.318V8.909H6.194V12H4.5zm8.36 0V4.3h3.003c2.42 0 4.092 1.661 4.092 3.828v.022c0 2.167-1.672 3.85-4.092 3.85H12.86zm1.694-1.529h1.309c1.386 0 2.321-.935 2.321-2.299V8.15c0-1.364-.935-2.321-2.321-2.321h-1.309v4.642z"
				/>
			</g>
		</svg>
	);
};
