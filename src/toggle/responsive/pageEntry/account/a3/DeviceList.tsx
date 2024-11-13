import * as React from 'react';
import Device from './Device';
import { removeDevice, getAllDevices } from 'shared/account/accountWorkflow';
import { OpenModal, ShowPassiveNotification } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import { connect } from 'react-redux';

import './DeviceList.scss';

interface OwnProps {
	devices: api.Device[];
}

const bem = new Bem('device-list');

interface DispatchProps {
	removeDevice: (id: string) => Promise<any>;
	getAllDevices: () => Promise<any>;
	showModal: (modal: ModalConfig) => void;
	showPassiveNotification: (config: PassiveNotificationConfig) => Promise<any>;
}

type Props = DispatchProps & OwnProps;

class DeviceList extends React.PureComponent<Props> {
	render() {
		const { devices } = this.props;
		return (
			<div className={bem.b()}>
				{devices.map((device, index) => (
					<Device device={device} key={device.id} index={index} onSelect={this.onSelect} />
				))}
			</div>
		);
	}

	onSelect = (device: api.Device) => {
		this.props.showModal({
			id: 'device-delete',
			type: ModalTypes.CONFIRMATION_DIALOG,
			componentProps: {
				title: '@{account_device_delete_modal_message|Are you sure you want to remove this device?}',
				confirmLabel: '@{app.remove|Remove}',
				onConfirm: () => {
					this.deleteDevice(device);
				}
			}
		});
	};

	deleteDevice = (device: api.Device) => {
		const { removeDevice, getAllDevices } = this.props;
		removeDevice(device.id).then(data => {
			if (data.error) {
				this.showPassiveNotification('@{account_device_delete_error}', device.name);
			} else {
				this.showPassiveNotification('@{account_device_delete_successful}', device.name);
			}
			getAllDevices();
		});
	};

	showPassiveNotification(message: string, deviceName) {
		this.props.showPassiveNotification({
			content: <IntlFormatter values={{ device: deviceName }}>{message}</IntlFormatter>
		});
	}
}

function mapDispatchToProps(dispatch) {
	return {
		removeDevice: id => dispatch(removeDevice(id)),
		getAllDevices: () => dispatch(getAllDevices()),
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		showPassiveNotification: (config: PassiveNotificationConfig): Promise<any> =>
			dispatch(ShowPassiveNotification(config))
	};
}

const Component: any = connect<{}, {}, OwnProps>(
	undefined,
	mapDispatchToProps
)(DeviceList);

export default Component;
