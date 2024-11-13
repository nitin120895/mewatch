import * as React from 'react';
import DeviceIcon from './DeviceIcon';
import { Breakpoints, BreakpointMap } from '../ref/breakpoints';
import { Bem } from 'shared/util/styles';

interface BreakpointSelectorProps extends React.Props<any> {
	activeBreakpoint: viewport.DeviceType;
	onClick(breakpoint: viewport.DeviceType, minWidth: number | string): void;
}

const deviceBem = new Bem('device');

export default class BreakpointSelector extends React.Component<BreakpointSelectorProps, any> {
	constructor(props) {
		super(props);
	}
	render() {
		const { activeBreakpoint, onClick } = this.props;
		return (
			<div className="breakpoints">
				{Breakpoints.map((device: viewport.DeviceType) => {
					const dims = BreakpointMap.get(device);
					const active = activeBreakpoint === device;
					const classes = deviceBem.b(device, { active });
					return (
						<div key={device} className={classes} onClick={e => onClick(device, dims.min)}>
							<DeviceIcon type={dims.icon} width={dims.iconSize} height={dims.iconSize} />
						</div>
					);
				})}
			</div>
		);
	}
}
