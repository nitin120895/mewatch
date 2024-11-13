import * as React from 'react';
import SVGPathIcon from 'shared/component/SVGPathIcon';

interface SmileyIconProps {
	className?: string;
	width?: number;
	height?: number;
}

const VIEW_BOX = { width: 41, height: 41 };

const SVG_DATA =
	'M20.715 40.049c-11.045 0-20-8.955-20-20 0-11.046 8.955-20 20-20 11.046 0 20 8.954 20 20 0 11.045-8.954 20-20 20zm-10-16c0 4.418 4.477 8 10 8s10-3.582 10-8h-20zm17.5-7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-15 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z';

export default class SmileyIcon extends React.Component<SmileyIconProps, any> {
	static defaultProps = {
		width: '100%',
		height: '100%'
	};

	render() {
		const { className, width, height } = this.props;
		return <SVGPathIcon className={className} data={SVG_DATA} width={width} height={height} viewBox={VIEW_BOX} />;
	}
}
