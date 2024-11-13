import * as React from 'react';

export default function CreditCardIcon(props: React.HTMLAttributes<SVGElement>) {
	const { width, height } = props;
	return (
		<svg {...props} width={width || '100%'} height={height || '100%'} viewBox="0 0 22 22">
			<g fill="none" fillRule="evenodd">
				<path d="M0 0h22v22H0z" />
				<rect width="21" height="16.111" x=".5" y="2.944" stroke="currentColor" rx="2" />
				<path fill="currentColor" d="M0 7.282h22V11H0z" />
			</g>
		</svg>
	);
}
