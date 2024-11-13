import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import CloseIcon from '../../../../component/modal/CloseIcon';
import CreatePinParentalControl from './CreatePinParentalControl';
import CreatePinStepPinForm from './CreatePinStepPinForm';
import { ShowPassiveNotification, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import { ModalManagerDispatchProps } from 'ref/responsive/app/modal/ModalManager';
import { connect } from 'react-redux';
import CreatePinStepRestrictedModal from './CreatePinStepRestrictedModal';
import OTP from '../../../../component/OTP';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { AgeGroup } from 'toggle/responsive/pageEntry/account/a1/pin/AccountManagePinComponent';
import { validateAgeGroup } from 'toggle/responsive/util/dateOfBirth';

import './CreatePinOverlay.scss';

export const bem = new Bem('create-pin-overlay');

export enum CreatePinSteps {
	ParentalControl = 1,
	Password = 2,
	PreOTP = 6,
	OTP = 2,
	Pin = 4,
	RestrictedAge = 5
}

export interface CreatePinOverlayOwnProps {
	account: api.Account;
	fromParentalControl?: boolean;
	lockEnabled?: boolean;
	onSuccess?: (pin?: string) => void;
	onError?: () => void;
	id?: string;
	changePin?: boolean;
	restricted?: boolean;
	profile?: api.ProfileDetail;
	onClose?: () => void;
	fromR21?: boolean;
	age?: number;
}

interface DispatchProps {
	showPassiveNotification: (config: PassiveNotificationConfig) => Promise<any>;
}

interface StateProps {
	config: state.Config;
}

type Props = CreatePinOverlayOwnProps & ModalManagerDispatchProps & DispatchProps & StateProps;

interface State {
	step: CreatePinSteps;
}

class CreatePinOverlay extends React.Component<Props, State> {
	private wrapperRef: HTMLElement;

	state = {
		step: CreatePinSteps.Pin
	};

	componentDidMount() {
		const { account, fromParentalControl, restricted, changePin, age } = this.props;
		const { pinEnabled, ageGroup } = account;
		const shouldCreatePin = changePin === false;

		let step = CreatePinSteps.Pin;
		if (fromParentalControl || restricted) {
			if (pinEnabled && ageGroup !== AgeGroup.E) {
				step = CreatePinSteps.Pin;
			} else if (ageGroup !== AgeGroup.E && !validateAgeGroup(ageGroup)) {
				step = CreatePinSteps.RestrictedAge;
			} else {
				step = CreatePinSteps.ParentalControl;
			}
		} else {
			if (shouldCreatePin && validateAgeGroup(ageGroup)) {
				step = CreatePinSteps.OTP;
			} else if (age && ageGroup === AgeGroup.E && !pinEnabled) {
				step = CreatePinSteps.ParentalControl;
			} else if (ageGroup && !validateAgeGroup(ageGroup, age)) {
				step = CreatePinSteps.RestrictedAge;
			} else {
				step = CreatePinSteps.Pin;
			}
		}

		this.setState({
			step
		});
	}

	private completePassword = () => {
		const { account, fromParentalControl, restricted, changePin, onSuccess, closeModal, id } = this.props;

		if (changePin && onSuccess) {
			onSuccess();
			closeModal(id);
		} else if ((fromParentalControl || restricted) && account.pinEnabled && account.ageGroup !== AgeGroup.E) {
			this.completePin();
		} else if (!account.pinEnabled && account.ageGroup !== AgeGroup.E && validateAgeGroup(account.ageGroup)) {
			this.setState({ step: CreatePinSteps.Pin });
		} else if (account.ageGroup !== AgeGroup.E && !validateAgeGroup(account.ageGroup)) {
			this.setState({ step: CreatePinSteps.RestrictedAge });
		}
	};

	private showOtpPassiveNotification = () => {
		const { showPassiveNotification } = this.props;
		showPassiveNotification({
			content: <IntlFormatter className={bem.e('toast')}>{'@{pin_reset_resend_otp}'}</IntlFormatter>
		});
	};

	private showPinSuccessPassiveNotification() {
		const { showPassiveNotification, account } = this.props;
		showPassiveNotification({
			content: (
				<IntlFormatter className={bem.e('toast')}>
					{!account.pinEnabled
						? '@{pin_set_success_toast_label|Pin is set successfully}'
						: '@{pin_rated_content_disabled_toast_label|Rated content control is now disabled.}'}
				</IntlFormatter>
			)
		});
	}

	private completePin = (pin?: string) => {
		const { onSuccess, id, closeModal } = this.props;
		if (onSuccess) {
			this.showPinSuccessPassiveNotification();
			onSuccess(pin);
		}

		closeModal(id);
	};

	setWrapperRef = node => {
		this.wrapperRef = node;
	};

	onClicked = e => {
		if (this.wrapperRef && this.wrapperRef === e.target) {
			this.props.onClose();
		}
	};

	onClose = id => {
		const { closeModal, onClose, fromR21 } = this.props;
		closeModal(id);
		if (fromR21 && onClose) onClose();
	};

	render() {
		const { account, lockEnabled, id, fromParentalControl, profile, onClose, age, config } = this.props;
		const { step } = this.state;

		return (
			<div className={bem.b()} ref={this.setWrapperRef} onClick={this.onClicked}>
				<div className={cx(bem.e('modal'), 'form-white')}>
					<div className={bem.e('close')} onClick={onClose}>
						<CloseIcon />
					</div>
					<CreatePinParentalControl
						step={step}
						account={account}
						close={() => this.onClose(id)}
						age={age}
						config={config}
					/>
					{step === CreatePinSteps.OTP && (
						<OTP
							onSuccess={this.completePassword}
							onClose={onClose}
							onRequestOneTimePassword={this.showOtpPassiveNotification}
						/>
					)}{' '}
					<CreatePinStepPinForm
						step={step}
						account={account}
						lockEnabled={lockEnabled}
						continueToNextStep={this.completePin}
						profile={profile}
						close={() => this.onClose(id)}
					/>
					<CreatePinStepRestrictedModal
						fromParentalControl={fromParentalControl}
						close={() => this.onClose(id)}
						step={step}
					/>
				</div>
			</div>
		);
	}
}

function mapStateToProps({ app }: state.Root): StateProps {
	return {
		config: app.config
	};
}

function mapDispatchToProps(dispatch) {
	return {
		closeModal: (id: string) => dispatch(CloseModal(id)),
		showPassiveNotification: (config: PassiveNotificationConfig): Promise<any> =>
			dispatch(ShowPassiveNotification(config))
	};
}

export default connect<{}, ModalManagerDispatchProps & DispatchProps, CreatePinOverlayOwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(CreatePinOverlay);
