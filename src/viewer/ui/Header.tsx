import * as React from 'react';
import MenuButton from './MenuButton';
import BreakpointSelector from './BreakpointSelector';
import BreakpointRangeControl from './BreakpointRangeControl';

interface HeaderProps extends React.HTMLProps<any> {
	onOpenMenu(): void;
	breakpoint: viewport.DeviceType;
	onSliderChange(newWidth: number | string): void;
	onSelectBreakpoint(breakpoint: viewport.DeviceType, minWidth: number | string): void;
	viewportWidth: number | string;
}

export default class Header extends React.PureComponent<HeaderProps, any> {
	constructor(props) {
		super(props);
	}
	render() {
		const { onOpenMenu, breakpoint, viewportWidth, onSelectBreakpoint, onSliderChange } = this.props;
		return (
			<header className="header">
				<MenuButton className="menu-button" width="20" height="20" openMenu={onOpenMenu} />
				<div className="controls">
					<BreakpointRangeControl breakpoint={breakpoint} viewportWidth={viewportWidth} onChange={onSliderChange} />
				</div>
				<BreakpointSelector activeBreakpoint={breakpoint} onClick={onSelectBreakpoint} />
			</header>
		);
	}
}
