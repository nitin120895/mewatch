import * as React from 'react';
import Device from './Device';
import { Bem } from 'shared/util/styles';

import './DeviceList.scss';

interface DeviceListProps {
	devices: api.Device[];
}

const bem = new Bem('device-list');

export default function DeviceList({ devices }: DeviceListProps) {
	return (
		<div className={bem.b()}>
			{devices.map((device, index) => (
				<Device device={device} key={device.id} />
			))}
		</div>
	);
}
