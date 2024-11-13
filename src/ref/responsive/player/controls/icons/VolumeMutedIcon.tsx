import * as React from 'react';
import * as cx from 'classnames';

interface VolumeMutedIconProps extends React.Props<any> {
	className?: string;
	height?: string | number;
	width?: string | number;
}

export default class VolumeMutedIcon extends React.Component<VolumeMutedIconProps, any> {
	static defaultProps = {
		width: '43px',
		height: '36px'
	};

	render() {
		const { className, width, height } = this.props;
		return (
			<svg className={cx('svg-icon', className)} width={width} height={height} viewBox="0 0 43 36">
				<g fill="currentColor" fillRule="evenodd">
					<path
						fillRule="nonzero"
						d="M33.5 16.312l-4.86-4.86a1.547 1.547 0 1 0-2.187 2.19l4.86 4.858-4.86 4.86a1.547 1.547 0 0 0 2.188 2.187l4.86-4.86 4.86 4.86a1.547 1.547 0 0 0 2.187-2.188l-4.86-4.86 4.86-4.86a1.547 1.547 0 0 0-2.188-2.187l-4.86 4.86z"
					/>
					<path d="M1 6h4a1 1 0 0 1 1 1v21a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm9.59-.59L20.53.12A1 1 0 0 1 22 1v34a1 1 0 0 1-1.526.85l-10.052-6.22A3 3 0 0 1 9 27.078V8.058a3 3 0 0 1 1.59-2.647z" />
				</g>
			</svg>
		);
	}
}
