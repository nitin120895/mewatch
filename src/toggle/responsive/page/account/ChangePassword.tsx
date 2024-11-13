import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import { mcSSOSignIn } from 'shared/mcSSOService/action/mcSSOAuthorization';
import { changePassword } from 'shared/service/action/account';
import { singleSignOn } from 'shared/service/action/authorization';
import { ShowPassiveNotification } from 'shared/uiLayer/uiLayerWorkflow';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import PasswordInput from 'toggle/responsive/component/input/PasswordInput';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import { getDeviceId } from 'shared/util/deviceUtil';
import { formDisplayState, validateConfirmPassword, validatePassword } from '../../pageEntry/account/ssoValidationUtil';

const bem = new Bem('change-password-forms');

interface StateProps {
	email: string;
}

interface OwnProps {
	token: string;
	onCancel: () => void;
	onSuccess: () => void;
}

interface State {
	submitted: boolean;
	newPassword: string;
	currentPassword: string;
	confirmPassword: string;
	loading: boolean;
	error: string;
	touched: { [key: string]: boolean };
}
interface DispatchProps {
	mcSSOSignIn: (username: string, password: string) => Promise<any>;
	changePassword: (body: api.ChangePasswordRequest) => Promise<any>;
	singleSignOn: (options: api.SingleSignOnRequest) => Promise<any>;
	showPassiveNotification: (config: PassiveNotificationConfig) => void;
}

type Props = DispatchProps & StateProps & OwnProps;

const errorCodeMap = {
	400: 'form_changePassword_error',
	401: 'create_pin_overlay_password_password_incorrect'
};

class ChangePassword extends React.Component<Props, State> {
	state: State = {
		submitted: false,
		newPassword: '',
		currentPassword: '',
		confirmPassword: '',
		loading: false,
		error: undefined,
		touched: {
			currentPassword: false,
			newPassword: false,
			confirmPassword: false
		}
	};

	setError(error) {
		this.setState({
			error: error,
			loading: false
		});
	}

	onSignInSuccess = data => {
		const { singleSignOn } = this.props;
		singleSignOn({
			provider: 'Mediacorp',
			token: data.token,
			linkAccounts: true,
			scopes: ['Settings'],
			deviceId: getDeviceId()
		})
			.then(() => {
				this.proceedToChangePassword();
			})
			.catch(e => {
				this.setError(errorCodeMap[e.code]);
			});
	};

	proceedToChangePassword = () => {
		const { changePassword, showPassiveNotification, onSuccess } = this.props;
		const { currentPassword, newPassword } = this.state;
		changePassword({ currentPassword, newPassword }).then(response => {
			if (response.error) {
				this.setError(errorCodeMap[response.error]);
			} else {
				this.setState({
					loading: false
				});
				showPassiveNotification({
					content: <IntlFormatter>{'@{form_newPassword_step2_info|Your password has been updated.}'}</IntlFormatter>
				});
				onSuccess();
			}
		});
	};

	onChange = e => {
		const newState: any = {};
		if (this.state.submitted) {
			newState.submitted = false;
			newState.error = undefined;
		}
		newState[e.target.id] = e.target.value;
		this.setState(newState);
	};

	onBlurPassword = e => {
		const touched: any = this.state.touched;
		touched[e.target.name] = true;
		this.setState({ touched });
	};

	onSubmit = e => {
		const { email, mcSSOSignIn } = this.props;
		const { currentPassword } = this.state;

		e.preventDefault();
		this.setState({ loading: true, submitted: true });

		mcSSOSignIn(email, currentPassword).then(response => {
			const { error } = response;
			if (error) {
				this.setError(errorCodeMap[error]);
			} else {
				this.onSignInSuccess(response.payload);
			}
		});
	};

	getError() {
		const { error, submitted, loading } = this.state;
		return error && submitted && !loading ? `@{${error}}` : undefined;
	}

	render() {
		const { loading, newPassword, confirmPassword, currentPassword, touched, error } = this.state;

		let displayStateOldPassword: form.DisplayState, messageOldPassword: string;

		const { displayState: displayStateNewPassword, message: messageNewPassword } = validatePassword(
			newPassword,
			touched.newPassword
		);
		const { displayState: displayStateConfirmPassword, message: messageConfirmPassword } = validateConfirmPassword(
			newPassword,
			confirmPassword,
			touched.confirmPassword
		);

		if (error === errorCodeMap['401']) {
			displayStateOldPassword = formDisplayState.ERROR;
			messageOldPassword = this.getError();
		}

		const isButtonDisabled =
			!newPassword.length ||
			!currentPassword.length ||
			!confirmPassword.length ||
			displayStateOldPassword === formDisplayState.ERROR ||
			displayStateNewPassword === formDisplayState.ERROR ||
			displayStateConfirmPassword === formDisplayState.ERROR;

		return (
			<div className={bem.b()}>
				<form onSubmit={this.onSubmit}>
					<PasswordInput
						label="@{form_changePassword_currentPassword|Password}"
						id="currentPassword"
						name="currentPassword"
						displayState={displayStateOldPassword}
						onChange={this.onChange}
						message={messageOldPassword}
						className={bem.e('input')}
						onBlur={this.onBlurPassword}
					/>
					<PasswordInput
						label="@{form_newPassword_step1_password_label|Password}"
						id="newPassword"
						name="newPassword"
						displayState={displayStateNewPassword}
						onChange={this.onChange}
						message={messageNewPassword}
						className={bem.e('input')}
						onBlur={this.onBlurPassword}
					/>
					<PasswordInput
						label="@{form_newPassword_re-enter|Password}"
						id="confirmPassword"
						name="confirmPassword"
						displayState={displayStateConfirmPassword}
						onChange={this.onChange}
						message={messageConfirmPassword}
						className={bem.e('input')}
						onBlur={this.onBlurPassword}
					/>
					<div className={bem.e('password-length-text')}>
						<IntlFormatter>{'@{form_register_first_step_password_short}'}</IntlFormatter>
					</div>
					<div className={bem.e('buttons')}>
						<AccountButton
							disabled={isButtonDisabled}
							type="submit"
							theme="blue"
							className={cx(bem.e('submit'), { disabled: isButtonDisabled })}
							loading={loading}
						>
							<IntlFormatter>{'@{account_profile_edit_button_submit|Save Changes}'}</IntlFormatter>
						</AccountButton>
						<CtaButton onClick={this.props.onCancel} ordinal="naked" theme="light">
							<IntlFormatter>{'@{account_common_cancel_button_label|Cancel}'}</IntlFormatter>
						</CtaButton>
					</div>
				</form>
			</div>
		);
	}
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		mcSSOSignIn: (email, password) => dispatch(mcSSOSignIn(email, password)),
		changePassword: (body: api.ChangePasswordRequest) => dispatch(changePassword(body)),
		singleSignOn: (options: api.SingleSignOnRequest) => dispatch(singleSignOn(options)),
		showPassiveNotification: (config: PassiveNotificationConfig): Promise<any> =>
			dispatch(ShowPassiveNotification(config))
	};
}

function mapStateToProps({ account }: state.Root): StateProps {
	return {
		email: get(account, 'info.email')
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(ChangePassword);
