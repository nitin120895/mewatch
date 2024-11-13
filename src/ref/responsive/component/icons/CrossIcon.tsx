import * as React from 'react';

export default (props: React.HTMLAttributes<any>) => {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
			<g fill="none" stroke="currentColor" strokeWidth="2">
				<path d="M0 0l6 5.933L12 0M12 11.933L6 6l-6 5.933" />
			</g>
		</svg>
	);
};
