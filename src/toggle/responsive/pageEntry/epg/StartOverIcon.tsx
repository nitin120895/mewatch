import * as React from 'react';
import * as cx from 'classnames';

interface IconProps {
	className?: string;
}

export default ({ className }: IconProps) => {
	return (
		<svg
			className={cx(className, 'svg-icon')}
			width="20"
			height="20"
			viewBox="0 0 26 26"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12.0002 16.8906C12.0001 16.8847 12 16.8786 12 16.8724L12 9.13102C12 9.1248 12 9.11872 12.0001 9.11278L16.9758 12.8887C17.0081 12.9539 17.0081 13.0495 16.9758 13.1148L12.0002 16.8906Z"
				fill="currentColor"
				stroke="currentColor"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12.6153 25C19.4443 25 25 19.6167 25 13C25 6.38327 19.4443 1 12.6153 1C8.35299 1 4.37174 3.15065 2.11696 6.64198V2.75592C2.11696 2.45547 1.87294 2.21115 1.57322 2.21115C1.27313 2.21115 1.02947 2.45547 1.02947 2.75592V7.85595C1.02947 8.40824 1.47718 8.85595 2.02947 8.85595L7.11851 8.85595C7.41859 8.85595 7.66261 8.61163 7.66261 8.31118C7.66261 8.01038 7.41859 7.76606 7.11851 7.76606L2.78613 7.76606C4.76814 4.30171 8.51399 2.15862 12.6153 2.15862C18.8082 2.15862 23.8471 7.02195 23.8471 13C23.8471 18.9784 18.8082 23.8417 12.6153 23.8417C8.24733 23.8417 3.92682 20.8725 2.10906 16.6212C2.08169 16.5573 2.0076 16.5278 1.94375 16.5553L1.11528 16.9129C1.05153 16.9405 1.02201 17.0143 1.04923 17.0782C3.04381 21.7425 7.80026 25 12.6153 25Z"
				fill="currentColor"
				stroke="currentColor"
				strokeWidth="0.5"
			/>
		</svg>
	);
};