import * as React from 'react';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<svg className={className} width="20" height="20" viewBox="0 0 20 20">
			<g fill="none" fillRule="evenodd">
				<circle cx="10" cy="10" r="10" fill="#F0008C" />
				<path stroke="#FFF" strokeWidth="1" d="M5.625 10.633l2.588 2.492L14.375 7.5" />
			</g>
		</svg>
	);
};
