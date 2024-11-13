import * as React from 'react';
import * as cx from 'classnames';

interface OpenBrowserIconProps {
	className?: string;
}

export default ({ className }: OpenBrowserIconProps) => (
	<svg
		className={cx(className)}
		width="10"
		height="11"
		viewBox="0 0 10 11"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M1.5 1.5C1.22386 1.5 1 1.72386 1 2V9C1 9.27614 1.22386 9.5 1.5 9.5H8.5C8.77614 9.5 9 9.27614 9 9V6.5C9 6.22386 9.22386 6 9.5 6C9.77614 6 10 6.22386 10 6.5V9C10 9.82843 9.32843 10.5 8.5 10.5H1.5C0.671573 10.5 0 9.82843 0 9V2C0 1.17157 0.671573 0.5 1.5 0.5H4C4.27614 0.5 4.5 0.723858 4.5 1C4.5 1.27614 4.27614 1.5 4 1.5H1.5ZM6 1C6 0.723858 6.22386 0.5 6.5 0.5H9.5C9.77614 0.5 10 0.723858 10 1V4C10 4.27614 9.77614 4.5 9.5 4.5C9.22386 4.5 9 4.27614 9 4V2.20711L6.10355 5.10355C5.90829 5.29882 5.59171 5.29882 5.39645 5.10355C5.20118 4.90829 5.20118 4.59171 5.39645 4.39645L8.29289 1.5H6.5C6.22386 1.5 6 1.27614 6 1Z"
			fill="currentColor"
		/>
	</svg>
);
