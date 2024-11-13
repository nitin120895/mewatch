import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
	width?: number;
	height?: number;
}

export default (props: IconProps) => {
	const { className, width, height } = props;
	return (
		<svg
			className={cx('svg-icon', className)}
			width={width}
			height={height}
			viewBox="0 0 23 23"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g clipPath="url(#clip0_172_3160)">
				<path
					d="M11.4862 0C5.142 0 0 5.14817 0 11.5C0 17.8518 5.142 23 11.4862 23C17.8305 23 22.9725 17.8518 22.9725 11.5C22.9725 5.14817 17.8305 0 11.4862 0ZM13.6533 7.27567L15.4988 10.6682H11.8347L13.6533 7.27567ZM4.87016 7.3025L6.7003 10.6682H3.04768L4.87016 7.3025ZM4.76679 14.6548H0.88827L2.83327 11.0592H6.91089L4.76296 14.6548H4.76679ZM5.0884 6.89233L5.09989 6.86933H9.16985L11.2067 10.6682H7.14061L5.0884 6.89233ZM11.5169 14.6548H9.43786L7.38565 11.1205L7.35119 11.0592H11.4135L11.513 11.247V11.2393L13.393 14.651H11.513L11.5169 14.6548ZM13.7222 14.4363L11.8653 11.0592H15.6825L13.7222 14.4363ZM13.8715 6.86933H17.9338L19.9899 10.6682H15.9352L13.8715 6.86933ZM18.2708 14.651L16.433 11.5728L16.1535 11.0553H20.2081L22.1531 14.651H18.2746H18.2708Z"
					fill="#00BA00"
				/>
			</g>
			<defs>
				<clipPath id="clip0_172_3160">
					<rect width="23" height="23" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
};
