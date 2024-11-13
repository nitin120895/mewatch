import * as React from 'react';

interface BearIconProps {
	width?: string | number;
	height?: string | number;
	className?: string;
	title?: string;
}

export default class BearIcon extends React.Component<BearIconProps, any> {
	static defaultProps = {
		width: '100%',
		height: '100%',
		title: 'Kids'
	};

	render() {
		const { width, height, className, title } = this.props;
		return (
			<svg className={className} width={width} height={height} viewBox="0 0 40 40">
				<title>{title}</title>
				<circle cx="9" cy="7" r="7" fill="currentColor" />
				<circle cx="31" cy="7" r="7" fill="currentColor" />
				<path
					stroke="currentColor"
					strokeWidth={2}
					fill="currentColor"
					d="M20 39c9.389 0 17-7.611 17-17S29.389 5 20 5 3 12.611 3 22s7.611 17 17 17zm0-6a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm-6-8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm12.444 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
				/>
			</svg>
		);
	}
}
