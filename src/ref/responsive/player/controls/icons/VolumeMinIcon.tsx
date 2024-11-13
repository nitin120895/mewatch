import * as React from 'react';
import * as cx from 'classnames';

interface VolumeMinIconProps extends React.Props<any> {
	className?: string;
	height?: string | number;
	width?: string | number;
}

export default class VolumeMinIcon extends React.Component<VolumeMinIconProps, any> {
	static defaultProps = {
		width: '43px',
		height: '36px'
	};

	render() {
		const { className, width, height } = this.props;
		return (
			<svg className={cx('svg-icon', className)} width={width} height={height} viewBox="0 0 43 36">
				<g fill="currentColor" fillRule="evenodd">
					<rect width="6" height="23" y="6" rx="1" />
					<path d="M10.59 5.41L20.53.12A1 1 0 0 1 22 1v34a1 1 0 0 1-1.526.85l-10.052-6.22A3 3 0 0 1 9 27.078V8.058a3 3 0 0 1 1.59-2.647z" />
					<rect width="4" height="14" x="25" y="11" rx="2" />
				</g>
			</svg>
		);
	}
}
