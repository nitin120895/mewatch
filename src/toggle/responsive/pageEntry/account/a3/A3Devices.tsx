import * as React from 'react';
import AccountEntryWrapper from 'ref/responsive/pageEntry/account/common/AccountEntryWrapper';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import DevicesList from './DeviceList';
import { AccountDeviceAuthorization } from 'shared/page/pageKey';
import { getScrollYPosition, removeScrollYPosition, saveScrollYPosition } from 'shared/page/pageUtil';
import { connect } from 'react-redux';
import { getAllDevices } from 'shared/account/accountWorkflow';
import { A3Devices as template } from 'shared/page/pageEntryTemplate';
import { Bem } from 'shared/util/styles';
import Spinner from 'ref/responsive/component/Spinner';

import './A3Devices.scss';

const bem = new Bem('a3-devices-title');

const PAGE_LOAD_DELAY = 300;

interface DispatchProps extends PageEntryPropsBase {
	getAllDevices: () => Promise<any>;
}

interface StateProps {
	devices: api.Device[];
	isLoaded: boolean;
}

type Props = DispatchProps & StateProps;

class A3Devices extends React.PureComponent<Props> {
	private pageLoadTimeout: number;

	componentWillMount() {
		this.props.getAllDevices();
	}

	componentDidUpdate(prevProps: Props) {
		if (prevProps.isLoaded !== this.props.isLoaded && this.props.isLoaded === true) {
			this.pageLoadTimeout = window.setTimeout(() => {
				this.scrollToSavedPosition();
			}, PAGE_LOAD_DELAY);
		}
	}

	componentWillUnmount() {
		window.clearTimeout(this.pageLoadTimeout);
	}

	scrollToSavedPosition = () => {
		const savedYPos = getScrollYPosition();

		if (savedYPos && savedYPos > 0) {
			window.scrollTo(0, savedYPos);
		}

		removeScrollYPosition();
	};

	onAddDeviceClick = () => {
		saveScrollYPosition(window.scrollY);
	};

	render() {
		const { devices, isLoaded } = this.props;
		if (!isLoaded) {
			return <Spinner className={bem.e('spinner')} />;
		}
		return (
			<div className="form-white">
				             {' '}
				<AccountEntryWrapper
					buttonPath={`@${AccountDeviceAuthorization}`}
					buttonLabel={`@{account_a3_device_add_device_label|Add Device}`}
					buttonDisabled={!devices.length}
					onClick={this.onAddDeviceClick}
					{...this.props}
				>
					                {' '}
					<IntlFormatter
						elementType="p"
						className={bem.b()}
						values={{
							deviceCount: devices.length
						}}
					>
						                            
						{'@{account_a3_device_count_label|You have {deviceCount} device(s) registered.}'}
						                        
					</IntlFormatter>
					                        
					<DevicesList devices={devices} />
					                    
				</AccountEntryWrapper>
				                
			</div>
		);
	}
}

function mapStateToProps(state: state.Root): StateProps {
	const { account } = state;
	return {
		devices: account.deviceInfo.devices,
		isLoaded: account.deviceInfo.isLoaded
	};
}

const mapDispatchToProps = { getAllDevices };

const Component: any = connect<StateProps, DispatchProps, {}>(
	mapStateToProps,
	mapDispatchToProps
)(A3Devices);

Component.template = template;

export default Component;
