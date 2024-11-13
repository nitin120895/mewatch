import * as React from 'react';

export default function BinIcon(props: React.SVGAttributes<any>) {
	return (
		<svg {...props} height={props.height || 22} width={props.width || 22} viewBox="0 0 22 22">
			<g fill="currentColor" fillRule="evenodd">
				<path d="M11 12.586L7.707 9.293a1 1 0 1 0-1.414 1.414l3.253 3.253-3.253 3.252a1 1 0 1 0 1.414 1.415L11 15.334l3.293 3.293a1 1 0 0 0 1.414-1.415l-3.253-3.252 3.253-3.253a1 1 0 1 0-1.414-1.414L11 12.586zM5 6h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
				<rect width="16" height="2" x="3" y="2" rx="1" />
				<rect width="4" height="4" x="9" rx="1" />
			</g>
		</svg>
	);
}
