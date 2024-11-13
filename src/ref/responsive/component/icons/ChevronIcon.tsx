import * as React from 'react';

export default function ChevronIcon(props) {
	return (
		<svg {...props} width={props.width || 13} height={props.height || 8} viewBox="0 0 13 8">
			<path fill="none" fillRule="evenodd" stroke="currentColor" strokeWidth="2" d="M1 1.22l5.371 5.37L11.962 1" />
		</svg>
	);
}
