import * as React from 'react';
import * as cx from 'classnames';

interface FullScreenIconProps extends React.Props<any> {
	className?: string;
	width?: string;
	height?: string;
}

export default (props: FullScreenIconProps) => {
	const { className, width, height } = props;
	return (
		<svg width={width || '100%'} height={height || '100%'} className={cx('svg-icon', className)} viewBox="0 0 24 20">
			<g fill="currentColor" fillRule="evenodd">
				<rect width="15.429" height="10.588" x="4.571" y="4.706" rx="1" />
				<path d="M2.057 5.242H0V2.647C0 1.185 1.151 0 2.571 0H6.2v2.118H2.57a.522.522 0 0 0-.514.53v2.594zM2.057 14.706H0V17.3c0 1.462 1.151 2.647 2.571 2.647H6.2V17.83H2.57a.522.522 0 0 1-.514-.53v-2.594zM21.856 5.242h2.057V2.647C23.913 1.185 22.762 0 21.34 0h-3.627v2.118h3.627c.285 0 .515.237.515.53v2.594zM21.856 14.706h2.057V17.3c0 1.462-1.151 2.647-2.572 2.647h-3.627V17.83h3.627a.522.522 0 0 0 .515-.53v-2.594z" />
			</g>
		</svg>
	);
};
