import * as React from 'react';
import SVGPathIcon from 'shared/component/SVGPathIcon';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';

import './Device.scss';

const phoneIconPath =
	'M0 5A5 5 0 0 1 5 0h26A5 5 0 0 1 36 5v54A5 5 0 0 1 31 64H5A5 5 0 0 1 0 59V5zm3 2V53h30V7A4 4 0 0 0 29 3H7a4 4 0 0 0-4 4zM17.5 60a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z';
const tabletIconPath =
	'M0 5A5 5 0 0 1 5 0h45A5 5 0 0 1 55 5v54A5 5 0 0 1 50 64H5A5 5 0 0 1 0 59V5zm3 2V53h49V7A4 4 0 0 0 48 3H7A4 4 0 0 0 3 7zM27.5 60a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z';
const laptopIconPath =
	'M0 62.5c0-.828.662-1.5 1.495-1.5h71.01c.826 0 1.495.666 1.495 1.5 0 .828-.662 1.5-1.495 1.5H1.495A1.494 1.494 0 0 1 0 62.5zM3 5.005A5.005 5.005 0 0 1 8 0h58c2.76 0 5 2.24 5 5.005V59H3V5.005zm3 0V50h62V5.004A2 2 0 0 0 66.002 3H7.998A2 2 0 0 0 6 5.004z';
const tvIconPath =
	'M25 57h25v4H25v-4zM3.42 64C2.082 64 1 63.328 1 62.5S2.083 61 3.42 61h66.22c1.337 0 2.42.672 2.42 1.5S70.977 64 69.64 64H3.42zM0 3.004A3.003 3.003 0 0 1 2.993 0h68.014A3.003 3.003 0 0 1 74 3.004v50.992A3.003 3.003 0 0 1 71.007 57H2.993A3.003 3.003 0 0 1 0 53.996V3.004zm3 2.998v38.175a3.007 3.007 0 0 0 3.01 3.002h61.98A3.003 3.003 0 0 0 71 44.175V6.002A3.007 3.007 0 0 0 67.99 3H6.01A3.003 3.003 0 0 0 3 6.002z';

const bem = new Bem('a3-device');

interface DeviceProps extends React.Props<any> {
	device: api.Device;
}

export default function Device({ device }: DeviceProps) {
	return (
		<div className={bem.b()}>
			<AccountDeviceIcon type={device.brandId} className={bem.e('icon')} />
			<p className={cx([bem.e('label'), 'truncate'])}>{device.name}</p>
		</div>
	);
}

function AccountDeviceIcon(props) {
	let data,
		width = 74;
	switch (props.type) {
		case 'phone':
		case 'phablet':
			data = phoneIconPath;
			width = 36;
			break;
		case 'tablet':
			data = tabletIconPath;
			width = 55;
			break;
		case 'laptop':
		case 'desktop':
			data = laptopIconPath;
			break;
		case 'tv':
		case 'uhd':
			data = tvIconPath;
			break;
	}

	const viewBox = { minX: 0, mixY: 0, width: width, height: 64 };
	return <SVGPathIcon {...props} data={data} width={width} height="64" viewBox={viewBox} />;
}
