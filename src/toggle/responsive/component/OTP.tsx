import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import { Bem } from 'shared/util/styles';
import { noop } from 'shared/util/function';
import * as support from 'shared/service/support';
import * as authorization from 'shared/service/authorization';
import { requestOTPToken } from 'shared/account/sessionWorkflow';
import { requestOneTimePassword } from 'shared/service/action/support';
import { getOTPErrorByCode } from 'shared/util/errorMessages';
import { MIN_SECURE_STRING_LENGTH } from 'toggle/responsive/pageEntry/account/accountUtils';
import PinCodeInput from 'toggle/responsive/page/account/registration/PinCodeInput';
import { formDisplayState } from '../pageEntry/account/ssoValidationUtil';

import './OTP.scss';

interface OwnProps {
	onSuccess?: (response: any) => any;
	onFailure?: (e: { isCancelled: boolean }) => any;
	onClose?: () => any;
	onConfirmBtnLabel?: string;
	onRequestOneTimePassword?: () => void;
	fromResetPin?: boolean;
	fromAccountOTP?: boolean;
	fromResetPinBtnDisabled?: boolean;
}

interface StateProps {
	email: string;
	otpExpirationTimeInMinutes: number;
}

interface DispatchProps {
	requestOTP: (options?: support.RequestOneTimePasswordOptions, info?: any) => any;
	createToken: (
		body: api.SettingsTokenRequest,
		options?: authorization.CreateSettingsTokenOptions,
		info?: any
	) => Promise<any>;
}

interface State {
	oneTimePassword: string;
	loading?: boolean;
	error?: string;
	isSuccessfulOTP: boolean;
}

const bem = new Bem('otp');
const INPUT_NAME = 'OTP';

class OTPModal extends React.Component<StateProps & OwnProps & DispatchProps, State> {
	state: State = {
		oneTimePassword: '',
		error: '',
		isSuccessfulOTP: false
	};

	static defaultProps = {
		onSuccess: noop,
		onFailure: noop,
		onClose: noop,
		onRequestOneTimePassword: noop
	};

	componentWillMount() {
		this.props.requestOTP();
	}

	private onCancel = () => {
		const { onFailure, onClose } = this.props;
		onClose();
		onFailure({ isCancelled: true });
	};

	private onChange = e => {
		this.setState({ oneTimePassword: e.target.value });
	};

	private onError = payload => {
		this.setState({ error: getOTPErrorByCode(payload.code, true), loading: false });
	};

	private onSuccess = payload => {
		this.setState({ loading: false, isSuccessfulOTP: true });
		this.props.onSuccess(payload);
	};

	private onSubmit = e => {
		e.preventDefault();
		const { oneTimePassword } = this.state;

		this.setState({ loading: true }, () => {
			this.props.createToken({ oneTimePassword }).then(
				response => {
					const { error, payload } = response;
					error ? this.onError(payload) : this.onSuccess(payload);
				},
				error => {
					this.setState({ loading: false, error });
				}
			);
		});
	};

	private requestOneTimePassword = () => {
		const { onRequestOneTimePassword, requestOTP } = this.props;
		requestOTP();
		onRequestOneTimePassword();
	};

	private renderButtons() {
		const { oneTimePassword, loading, error } = this.state;
		const { onConfirmBtnLabel, fromResetPinBtnDisabled } = this.props;

		const disabled = fromResetPinBtnDisabled || oneTimePassword.length !== MIN_SECURE_STRING_LENGTH || error;
		return (
			<div className={bem.e('buttons')}>
				<IntlFormatter
					elementType={AccountButton}
					componentProps={{
						type: 'submit',
						ordinal: 'primary',
						disabled,
						loading
					}}
				>
					{onConfirmBtnLabel ? onConfirmBtnLabel : '@{app.confirm|Confirm}'}
				</IntlFormatter>
				<IntlFormatter
					elementType={CtaButton}
					onClick={this.onCancel}
					className="otp-cancel"
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

	private getDisplayState(): formDisplayState {
		const { error, isSuccessfulOTP } = this.state;
		if (error) {
			return formDisplayState.ERROR;
		} else if (isSuccessfulOTP) {
			return formDisplayState.SUCCESS;
		}

		return formDisplayState.DEFAULT;
	}

	private onFocus = () => {
		this.setState({ error: '' });
	};

	render() {
		const { error, loading, isSuccessfulOTP } = this.state;
		const { email, fromResetPin, fromAccountOTP, otpExpirationTimeInMinutes } = this.props;
		const displayState = this.getDisplayState();

		return (
			<div className={bem.b()}>
				{!fromAccountOTP && (
					<IntlFormatter className={bem.e('title')} elementType="div">
						{fromResetPin && '@{pin_reset_step1}'}
						{'@{one-time-password_title|Verification Required}'}
					</IntlFormatter>
				)}
				<IntlFormatter className={bem.e('description')} elementType="div">
					<IntlFormatter values={{ email }}>{'@{one-time-password_description1}'}</IntlFormatter>
					{!fromAccountOTP && (
						<IntlFormatter
							values={{ minutes: otpExpirationTimeInMinutes }}
							className={cx({ bold: fromResetPin })}
							elementType={fromResetPin ? 'div' : undefined}
						>
							{'@{one-time-password_description2}'}
						</IntlFormatter>
					)}
				</IntlFormatter>
				{fromAccountOTP && (
					<IntlFormatter
						values={{ minutes: otpExpirationTimeInMinutes }}
						className={bem.e('expiry-description')}
						elementType="div"
					>
						{'@{one-time-password_description2}'}
					</IntlFormatter>
				)}
				<form className={cx('form-white', bem.e('content'))} onSubmit={this.onSubmit}>
					<div className={bem.e('input-group')}>
						<PinCodeInput
							className={bem.e('otp-code', { inactive: fromResetPin && isSuccessfulOTP })}
							name={INPUT_NAME}
							onChange={this.onChange}
							disabled={loading}
							required={true}
							displayState={displayState}
							message={error}
							fromOTP={true}
							onFocus={this.onFocus}
							label={'@{one-time-password_label|Enter your 6-digit OTP}'}
						/>
						{this.renderButtons()}
					</div>

					<IntlFormatter
						elementType={CtaButton}
						onClick={this.requestOneTimePassword}
						disabled={fromResetPin && isSuccessfulOTP}
						className={bem.e('resend')}
						componentProps={{
							ordinal: 'naked',
							theme: 'light'
						}}
					>
						{`@{one-time-password_resend}`}
					</IntlFormatter>
				</form>
			</div>
		);
	}
}

const mapStateToProps = ({ account, app }: state.Root): StateProps => ({
	email: account.info && account.info.email,
	otpExpirationTimeInMinutes: app.config.general.otpExpirationTimeInMinutes
});

const mapDispatchToProps = (dispatch): DispatchProps => ({
	requestOTP: (options?: support.RequestOneTimePasswordOptions, info?: any) =>
		dispatch(requestOneTimePassword(options, info)),
	createToken: (body: api.SettingsTokenRequest, options?: authorization.CreateSettingsTokenOptions, info?: any) =>
		dispatch(requestOTPToken(body, options, info))
});

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(OTPModal);
