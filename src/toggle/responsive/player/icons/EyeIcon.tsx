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
			height={height || 20}
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12.6346 10.0442C12.6346 11.4992 11.4546 12.6784 9.99958 12.6784C8.54458 12.6784 7.36542 11.4992 7.36542 10.0442C7.36542 8.58841 8.54458 7.40924 9.99958 7.40924C11.4546 7.40924 12.6346 8.58841 12.6346 10.0442Z"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M9.99834 16.1291C13.1717 16.1291 16.0742 13.8474 17.7083 10.0441C16.0742 6.24074 13.1717 3.95908 9.99834 3.95908H10.0017C6.82834 3.95908 3.92584 6.24074 2.29167 10.0441C3.92584 13.8474 6.82834 16.1291 10.0017 16.1291H9.99834Z"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};
