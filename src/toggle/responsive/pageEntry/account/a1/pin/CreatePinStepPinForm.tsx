import * as React from 'react';
import { connect } from 'react-redux';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Spinner from 'ref/responsive/component/Spinner';
import CtaButton from 'ref/responsive/component/CtaButton';
import { changePin } from 'shared/service/action/account';
import { bem, CreatePinSteps } from './CreatePinOverlay';
import { MIN_SECURE_STRING_LENGTH } from 'toggle/responsive/pageEntry/account/accountUtils';
import PinCodeInput from 'toggle/responsive/page/account/registration/PinCodeInput';
import { errorMap } from 'toggle/responsive/util/profileUtil';
import { disableProfilePlaybackGuard } from 'shared/service/action/account';
import { DisableProfilePlaybackGuardOptions } from 'shared/service/account';
import { formDisplayState } from '../../ssoValidationUtil';

interface OwnProps {
	step: CreatePinSteps;
	account: api.Account;
	lockEnabled?: boolean;
	continueToNextStep: (pin?: string) => void;
	close?: () => void;
	proceedBtnLabel?: string;
	changeExisting?: boolean;
	profile?: api.ProfileDetail;
}

interface DispatchProps {
	changePin: (body: api.ChangePinRequest) => Promise<any>;
	disableProfilePlaybackGuard: (
		id: string,
		body: api.ProfileDisableProfilePlaybackGuardRequest,
		options?: DisableProfilePlaybackGuardOptions,
		info?: any
	) => Promise<any>;
}
type Props = OwnProps & DispatchProps;

interface State {
	pin: string;
	pinConfirm: string;
	displayStatePinConfirm: formDisplayState;
	displayStatePin: formDisplayState;
	messagePinConfirm: string;
	messagePin: string;
	loading: boolean;
}

class CreatePinStepPinForm extends React.Component<Props, State> {
	state = {
		pin: '',
		pinConfirm: '',
		displayStatePinConfirm: formDisplayState.DEFAULT,
		displayStatePin: formDisplayState.DEFAULT,
		messagePinConfirm: '',
		messagePin: '',
		loading: false
	};

	private onPinChange = e => {
		this.setState({
			pin: e.target.value,
			displayStatePin: formDisplayState.DEFAULT
		});
	};

	private onPinConfirmChange = e => {
		const pinConfirm = e.target.value;
		const isValid = this.state.pin === pinConfirm;

		this.setState({
			pinConfirm,
			displayStatePinConfirm: isValid ? formDisplayState.DEFAULT : formDisplayState.ERROR,
			messagePinConfirm: isValid ? '' : '@{create_pin_overlay_pin_mismatch|PINs should match}'
		});
	};

	private onSubmitClick = e => {
		const { pin, pinConfirm } = this.state;
		const { changePin, continueToNextStep, account, changeExisting, profile, disableProfilePlaybackGuard } = this.props;

		let action;
		if (account.pinEnabled && !changeExisting && pin.length === MIN_SECURE_STRING_LENGTH) {
			action = disableProfilePlaybackGuard(profile.id, { pin }, {}, { profile });
		} else if (
			pin.length === MIN_SECURE_STRING_LENGTH &&
			pinConfirm.length === MIN_SECURE_STRING_LENGTH &&
			pin === pinConfirm
		) {
			action = changePin({ pin });
		}

		if (!pin.length && !pinConfirm.length) {
			this.setState({
				displayStatePin: formDisplayState.ERROR,
				messagePin: '@{create_pin_overlay_password_password_required|This is a required field}'
			});
		}

		if (pin.length && pin !== pinConfirm) {
			this.setState({ displayStatePinConfirm: formDisplayState.ERROR });
		}

		if (action) {
			this.setState({ loading: true });

			action.then(({ error, payload }) => {
				if (error) {
					this.setState({
						loading: false,
						displayStatePin: formDisplayState.ERROR,
						messagePin: errorMap[payload.body.code]
					});
					return;
				}

				return continueToNextStep(pin);
			});
		}
	};

	render() {
		const { step, account, changeExisting } = this.props;
		const { displayStatePinConfirm, loading, displayStatePin, messagePin } = this.state;

		if (step !== CreatePinSteps.Pin) return false;
		if (loading) return <Spinner className={bem.e('spinner')} />;

		return (
			<div className={bem.e('step')}>
				<IntlFormatter className={bem.e('title')} elementType="div">
					{account.pinEnabled
						? '@{create_pin_overlay_enter_pin|Please enter your Control PIN}'
						: '@{create_pin_overlay_pin_title|Set your 6-Digit Control PIN}'}
				</IntlFormatter>

				<IntlFormatter className={bem.e('description')} elementType="div">
					{
						'@{create_pin_overlay_verification_description|This PIN is for verification purposes. This includes restricting access to rated content (NC16, M18) and unlocking R21 content.}'
					}
				</IntlFormatter>

				<div className={bem.e('fields')}>
					<PinCodeInput
						className={bem.e('pin-code')}
						name="pin"
						onChange={this.onPinChange}
						required={true}
						displayState={displayStatePin as form.DisplayState}
						message={messagePin}
						label={'@{form_register_enter_pin|Enter PIN (6-Digit)}'}
					/>
					{(!account.pinEnabled || (account.pinEnabled && changeExisting)) && (
						<PinCodeInput
							className={bem.e('pin-code')}
							name="pinConfirm"
							onChange={this.onPinConfirmChange}
							displayState={displayStatePinConfirm as form.DisplayState}
							message={'@{create_pin_overlay_pin_mismatch|PINs do not match}'}
							required={true}
							label={'@{form_register_re-enter_pin|Re-enter PIN}'}
						/>
					)}
				</div>

				{this.renderFooter()}
			</div>
		);
	}

	renderFooter() {
		const { close, proceedBtnLabel } = this.props;

		return (
			<div className={bem.e('buttons')}>
				<CtaButton className={bem.e('button')} ordinal="primary" onClick={this.onSubmitClick}>
					<IntlFormatter elementType="span">
						{proceedBtnLabel ? proceedBtnLabel : '@{create_pin_overlay_submit|Submit}'}
					</IntlFormatter>
				</CtaButton>

				<CtaButton className={bem.e('button')} ordinal="secondary" onClick={close}>
					<IntlFormatter elementType="span">{'@{create_pin_overlay_cancel|Cancel}'}</IntlFormatter>
				</CtaButton>
			</div>
		);
	}
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		changePin: (body: api.ChangePinRequest): Promise<any> => dispatch(changePin(body)),
		disableProfilePlaybackGuard: (
			id: string,
			body: api.ProfileDisableProfilePlaybackGuardRequest,
			options?: DisableProfilePlaybackGuardOptions,
			info?: any
		): Promise<any> => dispatch(disableProfilePlaybackGuard(id, body, options, info))
	};
}

export default connect<any, DispatchProps, OwnProps>(
	undefined,
	mapDispatchToProps
)(CreatePinStepPinForm);
