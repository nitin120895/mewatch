import * as React from 'react';
import SVGPathIcon from './SVGPathIcon';

interface MenuButtonProps extends React.HTMLProps<any> {
	openMenu(): void;
	width?: number | string;
	height?: number | string;
}

export default class MenuButton extends React.Component<MenuButtonProps, any> {
	static defaultProps = {
		width: '100%',
		height: '100%'
	};
	constructor(props) {
		super(props);
	}
	render() {
		const { className, width, height, openMenu } = this.props;
		const viewBox = { width: 16, height: 16 };
		const data = 'M1,2.5h14v3H1V2.5z M1,6.5h14v3H1V6.5z M1,10.5h14v3H1V10.5z';
		return (
			<div className="menu" onClick={e => openMenu()}>
				<div className={className}>
					<SVGPathIcon data={data} viewBox={viewBox} width={width} height={height} />
				</div>
			</div>
		);
	}
}
