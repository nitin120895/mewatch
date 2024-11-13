import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import OTP from 'toggle/responsive/component/OTP';
import PinCodeInput from 'toggle/responsive/page/account/registration/PinCodeInput';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import { ShowPassiveNotification, OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import { connect } from 'react-redux';
import { MIN_SECURE_STRING_LENGTH } from '../../accountUtils';
import { changePin } from 'shared/service/action/account';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { noop } from 'shared/util/function';
import { formDisplayState } from '../../ssoValidationUtil';
import { getResetPINError } from 'shared/util/errorMessages';

import './ResetPin.scss';

const bem = new Bem('reset-pin');
const CANCEL_RESET_PIN_ID = 'cancel-reset-pin';
const ERROR_RESET_PIN_ID = 'error-reset-pin';

interface OwnProps {
	closePinResetForm: () => void;
	showToastOnSuccess?: boolean;
}

interface State {
	pin: string;
	pinConfirm: string;
	loading: boolean;
	isValidOTP: boolean;
	pinFocused: boolean;
	pinConfirmFocused: boolean;
}

interface DispatchProps {
	showPassiveNotification: (config: PassiveNotificationConfig) => Promise<any>;
	showModal: (modalConfig: ModalConfig) => void;
	resetPin: (body: api.ChangePinRequest) => Promise<any>;
}

type Props = OwnProps & DispatchProps;

class ResetPin extends React.Component<Props, State> {
	state: State = {
		pin: '',
		pinConfirm: '',
		loading: false,
		isValidOTP: false,
		pinFocused: false,
		pinConfirmFocused: false
	};

	render() {
		return (
			<div className={cx(bem.b())}>
				{this.renderOTP()}
				{this.renderPinForm()}
				{this.renderButtons()}
			</div>
		);
	}

	private isBtnDisabled(): boolean {
		const { pin, pinConfirm } = this.state;

		return (
			pinConfirm.length !== MIN_SECURE_STRING_LENGTH ||
			pin.length !== MIN_SECURE_STRING_LENGTH ||
			this.validatePins().displayState === formDisplayState.ERROR
		);
	}

	private onPinChange = e => {
		const newState = {};
		newState[e.target.name] = e.target.value;
		this.setState(newState);
	};

	private onSubmit = () => {
		const { pin } = this.state;
		const { resetPin, closePinResetForm, showToastOnSuccess } = this.props;
		resetPin({ pin }).then(res => {
			if (res.error) {
				return this.onError(res.payload);
			}

			closePinResetForm();
			if (showToastOnSuccess) {
				this.showToastMessage('@{pin_reset_toast_label}');
			}
		});
	};

	private onCancel = () => {
		const { showModal, closePinResetForm } = this.props;

		const props = {
			id: CANCEL_RESET_PIN_ID,
			type: ModalTypes.CONFIRMATION_DIALOG,
			componentProps: {
				title: '@{pin_reset_cancel_title}',
				children: <IntlFormatter elementType="div">{'@{pin_reset_cancel_description}'}</IntlFormatter>,
				confirmLabel: '@{create_pin_overlay_proceed}',
				onConfirm: closePinResetForm,
				cancelLabel: '@{button_label_back}',
				className: CANCEL_RESET_PIN_ID,
				closeOnConfirm: true,
				onCancel: noop
			}
		};

		showModal(props);
	};

	private onError = payload => {
		const errorMsg = getResetPINError(payload);
		if (errorMsg) {
			const { showModal, closePinResetForm } = this.props;
			const props = {
				id: ERROR_RESET_PIN_ID,
				type: ModalTypes.MEPASS_DIALOG,
				componentProps: {
					title: '@{account_common_error}',
					children: <IntlFormatter elementType="div">{errorMsg}</IntlFormatter>,
					confirmLabel: '@{create_pin_overlay_ok}',
					onConfirm: closePinResetForm,
					closeOnConfirm: true
				}
			};
			showModal(props);
		}
	};

	private renderButtons() {
		return (
			<div className={bem.e('buttons')}>
				<IntlFormatter
					elementType={AccountButton}
					onClick={this.onSubmit}
					componentProps={{
						ordinal: 'primary',
						disabled: this.isBtnDisabled()
					}}
				>
					{'@{app.confirm|Confirm}'}
				</IntlFormatter>
				<IntlFormatter
					className={bem.e('cancel-btn')}
					elementType={CtaButton}
					onClick={this.onCancel}
					componentProps={{
						ordinal: 'secondary',
						theme: 'dark'
					}}
				>
					{'@{app.cancel|Cancel}'}
				</IntlFormatter>
			</div>
		);
	}

	private onRequestOneTimePassword = () => {
		this.showToastMessage('@{pin_reset_resend_otp}');
	};

	private showToastMessage(message: string) {
		this.props.showPassiveNotification({
			content: <IntlFormatter className={bem.e('toast')}>{message}</IntlFormatter>
		});
	}

	private onSuccessOTP = () => {
		this.setState({ isValidOTP: true });
	};

	private renderOTP() {
		return (
			<div className={bem.e('otp-container')}>
				<OTP
					fromResetPin={true}
					onSuccess={this.onSuccessOTP}
					onConfirmBtnLabel={'@{pin_reset_verify_label}'}
					onRequestOneTimePassword={this.onRequestOneTimePassword}
					fromResetPinBtnDisabled={this.state.isValidOTP}
				/>
			</div>
		);
	}

	private validatePins(): { displayState: formDisplayState; message?: string } {
		const { pinConfirm, pinConfirmFocused } = this.state;
		if (!pinConfirmFocused && pinConfirm.length < MIN_SECURE_STRING_LENGTH)
			return { displayState: formDisplayState.DEFAULT };

		if (pinConfirm !== '' && !this.isValidPin())
			return { displayState: formDisplayState.ERROR, message: '@{form_register_pins_do_not_match_error_message}' };
		else if (pinConfirmFocused && pinConfirm === '')
			return { displayState: formDisplayState.ERROR, message: '@{form_register_required_pin_error_message}' };
		else return { displayState: formDisplayState.DEFAULT };
	}

	isValidPin() {
		const { pin, pinConfirm } = this.state;
		return pin === pinConfirm;
	}

	private renderPinForm() {
		const { pinFocused, pin, isValidOTP } = this.state;

		const confirmPinState = this.validatePins();
		const displayStatePin = pinFocused && pin === '' ? formDisplayState.ERROR : formDisplayState.DEFAULT;

		return (
			<div className={bem.e('form')}>
				<IntlFormatter elementType="div" className={bem.e('pin-title', { disabled: !isValidOTP })}>
					{'@{pin_reset_step2}'}
				</IntlFormatter>
				<PinCodeInput
					name="pin"
					onChange={this.onPinChange}
					displayState={displayStatePin}
					required={true}
					message={'@{form_register_blank_pin_error_message}'}
					disabled={!isValidOTP}
					label={'@{pin_reset_pin-label|New PIN}'}
					showTogglePin={true}
				/>
				<PinCodeInput
					name="pinConfirm"
					required={true}
					onChange={this.onPinChange}
					displayState={confirmPinState.displayState}
					message={confirmPinState.message}
					disabled={!isValidOTP}
					label={'@{form_register_re-enter_pin|Re-enter PIN}'}
					showTogglePin={true}
				/>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch): DispatchProps => ({
	showPassiveNotification: (config: PassiveNotificationConfig): Promise<any> =>
		dispatch(ShowPassiveNotification(config)),

	showModal: (modalConfig: ModalConfig) => dispatch(OpenModal(modalConfig)),
	resetPin: (body: api.ChangePinRequest): Promise<any> => dispatch(changePin(body))
});

export default connect<{}, DispatchProps, OwnProps>(
	undefined,
	mapDispatchToProps
)(ResetPin);
