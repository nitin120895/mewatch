import * as React from 'react';
import AccountEntryWrapper from '../common/AccountEntryWrapper';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import DevicesList from './DeviceList';
import { getDevices as getDevicesAction } from 'shared/service/account';
import { AccountDevices as devicesPageKey } from 'shared/page/pageKey';

import './A3Devices.scss';

interface A3DevicesProps extends PageEntryPropsBase {
	account?: api.Account; // These are only defined here to allow mocked data via the component viewer page. // They are not expected to be passed through within the production app. Instead, they // are loaded on demand directly from the API.
	devices?: api.Device[];
	maxDevices?: number;
}

interface A3DevicesState {
	devices: api.Device[];
	maxDevices: number;
}

export default class A3Devices extends React.Component<A3DevicesProps, A3DevicesState> {
	constructor(props: A3DevicesProps) {
		super(props);
		const { account, devices, maxDevices } = props;
		this.state = { devices: devices || [], maxDevices: maxDevices || 1 };
		if (account) this.getDevices();
	}

	private getDevices() {
		// For now we're loading the devices on demand. A more efficient workflow can be built
		// in the future to replace this.
		getDevicesAction().then(result => {
			const d = result.data;
			this.setState({ devices: d.devices, maxDevices: d.maxRegistered });
		});
	}

	render() {
		if (!this.state.devices) return false;
		else {
			const { devices, maxDevices } = this.state;
			return (
				<div className="form-white">
					                    
					<AccountEntryWrapper buttonPath={`@${devicesPageKey}`} buttonDisabled={devices.length === 0} {...this.props}>
						                        
						<IntlFormatter
							elementType="p"
							className="a3-devices-title"
							values={{
								deviceCount: devices.length,
								maxDeviceCount: maxDevices
							}}
						>
							                            
							{`@{account_a3_device_count_label|deviceCount ${devices.length} maxDeviceCount ${maxDevices}}`}
							                        
						</IntlFormatter>
						                        
						<DevicesList devices={devices} />
						                    
					</AccountEntryWrapper>
					                
				</div>
			);
		}
	}
}
