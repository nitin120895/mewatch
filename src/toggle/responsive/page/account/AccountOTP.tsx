import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import OTP from 'toggle/responsive/component/OTP';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { ShowPassiveNotification, OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import { connect } from 'react-redux';
import { changePin } from 'shared/service/action/account';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import * as support from 'shared/service/support';
import { requestOneTimePassword } from 'shared/service/action/support';
import { CreatePinSteps } from 'toggle/responsive/pageEntry/account/a1/pin/CreatePinOverlay';

import './AccountOTP.scss';

const bem = new Bem('account-otp');

interface OwnProps {
	onSuccessOTP: () => void;
}

interface State {
	pin: string;
	pinConfirm: string;
	loading: boolean;
	isValidOTP: boolean;
	pinFocused: boolean;
	pinConfirmFocused: boolean;
	step: CreatePinSteps;
}

interface DispatchProps {
	showPassiveNotification: (config: PassiveNotificationConfig) => Promise<any>;
	showModal: (modalConfig: ModalConfig) => void;
	resetPin: (body: api.ChangePinRequest) => Promise<any>;
	requestOTP: (options?: support.RequestOneTimePasswordOptions, info?: any) => any;
}

type Props = OwnProps & DispatchProps;

class AccountOTP extends React.Component<Props, State> {
	state: State = {
		pin: '',
		pinConfirm: '',
		loading: false,
		isValidOTP: false,
		pinFocused: false,
		pinConfirmFocused: false,
		step: CreatePinSteps.PreOTP
	};

	render() {
		return <div className={cx(bem.b())}>{this.renderOTP()}</div>;
	}

	private onRequestOneTimePassword = () => {
		this.showToastMessage('@{pin_reset_resend_otp}');
	};

	private showToastMessage(message: string) {
		this.props.showPassiveNotification({
			content: <IntlFormatter className={bem.e('toast')}>{message}</IntlFormatter>,
			position: 'bottom'
		});
	}

	private onSuccessOTP = () => {
		this.setState({ isValidOTP: true });
		this.props.onSuccessOTP();
	};

	private renderOTP() {
		const { step } = this.state;

		return (
			<div className={bem.e('otp-container')}>
				<IntlFormatter className={bem.e('title')} elementType="div">
					{'@{one-time-password_request_title|Access your account settings}'}
				</IntlFormatter>
				<IntlFormatter className={bem.e('description1')} elementType="div">
					{'@{one-time-password_request_description1}'}
				</IntlFormatter>
				<IntlFormatter className={bem.e('description2')} elementType="div">
					{'@{one-time-password_request_description2}'}
				</IntlFormatter>
				{step === CreatePinSteps.PreOTP ? (
					<div className={bem.e('buttons')}>
						<IntlFormatter
							elementType={AccountButton}
							onClick={this.goToOTPStep}
							componentProps={{
								ordinal: 'primary'
							}}
						>
							{'@{one-time-password_request_button|Request OTP}'}
						</IntlFormatter>
					</div>
				) : (
					<OTP
						fromAccountOTP={true}
						onSuccess={this.onSuccessOTP}
						onConfirmBtnLabel={'@{pin_reset_verify_label}'}
						onRequestOneTimePassword={this.onRequestOneTimePassword}
					/>
				)}
			</div>
		);
	}

	private goToOTPStep = () => {
		this.setState({ step: CreatePinSteps.OTP });
	};

	isValidPin() {
		const { pin, pinConfirm } = this.state;
		return pin === pinConfirm;
	}
}

const mapDispatchToProps = (dispatch): DispatchProps => ({
	showPassiveNotification: (config: PassiveNotificationConfig): Promise<any> =>
		dispatch(ShowPassiveNotification(config)),
	showModal: (modalConfig: ModalConfig) => dispatch(OpenModal(modalConfig)),
	resetPin: (body: api.ChangePinRequest): Promise<any> => dispatch(changePin(body)),
	requestOTP: (options?: support.RequestOneTimePasswordOptions, info?: any) =>
		dispatch(requestOneTimePassword(options, info))
});

export default connect<{}, DispatchProps, OwnProps>(
	undefined,
	mapDispatchToProps
)(AccountOTP);
