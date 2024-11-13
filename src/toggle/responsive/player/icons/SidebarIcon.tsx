import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
	width?: string;
	height?: string;
}

export default (props: IconProps) => {
	const { className, width, height } = props;
	return (
		<svg
			className={cx('svg-icon', className)}
			width={width || 20}
			height={height || 14}
			viewBox="0 0 20 14"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M5.65295 12.8727C5.43919 13.0598 5.11428 13.0381 4.92725 12.8244L0.127246 7.33866C-0.0424151 7.14476 -0.0424151 6.85524 0.127246 6.66134L4.92725 1.17563C5.11428 0.961877 5.43919 0.940217 5.65295 1.12725C5.8667 1.31429 5.88836 1.63919 5.70133 1.85295L1.64765 6.48571L10.4857 6.48571C10.7697 6.48571 11 6.71597 11 7C11 7.28403 10.7697 7.51429 10.4857 7.51429L1.64765 7.51428L5.70133 12.147C5.88836 12.3608 5.8667 12.6857 5.65295 12.8727Z"
				fill="#CCCCCC"
			/>
			<rect x="16" y="14" width="2" height="14" rx="1" transform="rotate(-180 16 14)" fill="#525252" />
			<rect x="20" y="14" width="2" height="14" rx="1" transform="rotate(-180 20 14)" fill="#525252" />
		</svg>
	);
};
