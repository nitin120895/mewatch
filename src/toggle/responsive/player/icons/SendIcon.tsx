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
			height={height || 18}
			viewBox="0 0 20 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M19.8994 9.00055C19.8994 8.76613 19.7596 8.55425 19.5443 8.46199L0.90548 0.473829C0.692216 0.382431 0.445143 0.425492 0.2753 0.583624C0.105512 0.741756 0.0450487 0.985183 0.121063 1.20439L2.82483 9.00047L0.121089 16.7966C0.0473404 17.0092 0.102003 17.2446 0.260245 17.4028C0.265162 17.4077 0.27019 17.4126 0.275327 17.4173C0.445087 17.5755 0.692214 17.6186 0.905451 17.5271L19.5443 9.53911C19.7597 9.44675 19.8994 9.23495 19.8994 9.00055ZM1.6628 2.07338L16.4588 8.4146L3.86198 8.41454L1.6628 2.07338ZM1.6628 15.9276L3.86201 9.58638L16.4589 9.58646L1.6628 15.9276Z"
				fill="currentColor"
			/>
		</svg>
	);
};
