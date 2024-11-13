import * as React from 'react';
import { connect } from 'react-redux';
import CtaButton from 'ref/responsive/component/CtaButton';
import PasswordInput from 'ref/responsive/component/input/PasswordInput';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import { browserHistory } from 'shared/util/browserHistory';
import Link from 'shared/component/Link';
import { getSignInPath } from 'shared/page/sitemapLookup';
import { resetPassword, ssoFormMounted } from 'shared/account/accountWorkflow';
import { SignIn } from 'shared/page/pageKey';
import { CloseModal, OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { PASSWORD_RESET_MODAL, passwordResetModal } from 'toggle/responsive/util/resetPasswordUtil';
import {
	isValidPassword,
	formDisplayState,
	validateConfirmPassword,
	validatePassword
} from '../../../pageEntry/account/ssoValidationUtil';

import '../ResetPasswordModals.scss';

const bem = new Bem('reset-password-forms');

interface State {
	password: string;
	confirmPassword: string;
	error: string;
	touched: any;
	isMounted: boolean;
}

interface NewPasswordFormStateProps {
	signInPath: string;
}

interface NewPasswordFormOwnProps {
	token: string;
}

interface NewPasswordFormDispatchProps {
	resetPassword: (email: string, password: string, token: string) => Promise<any>;
	closeModal: (id: string) => void;
	showModal: (modal: ModalConfig) => void;
	formMounted: (isMounted: boolean) => void;
}

type Props = NewPasswordFormOwnProps & NewPasswordFormDispatchProps & NewPasswordFormStateProps;

class NewPasswordForm extends React.Component<Props, State> {
	state: State = {
		password: '',
		confirmPassword: '',
		error: undefined,
		isMounted: false,
		touched: {
			password: false,
			confirmPassword: false
		}
	};

	private onChange = e => {
		const { name, value } = e.target;
		const newState = {};
		newState[name] = value;
		this.setState(newState);
	};

	private onModalClose = () => {
		const { closeModal, signInPath } = this.props;

		closeModal(PASSWORD_RESET_MODAL);
		browserHistory.push(`/${signInPath}`);
	};

	private onBlur = e => {
		const touched = this.state.touched;
		touched[e.target.name] = true;
		this.setState({ touched });
	};

	private renderPasswordResetModal = () => {
		const props = passwordResetModal(this.onModalClose);

		this.props.showModal({
			id: PASSWORD_RESET_MODAL,
			type: ModalTypes.MEPASS_DIALOG,
			componentProps: props,
			disableAutoClose: true
		});
	};

	private onResponse = (response: api.Response<any>) => {
		if (response.error) {
			this.setState({
				error: 'form_newPassword_error',
				touched: {
					password: false,
					confirmPassword: false
				}
			});
		} else {
			this.setState(
				{
					error: undefined
				},
				() => {
					this.renderPasswordResetModal();
				}
			);
		}
	};

	private onSubmit = e => {
		const { token, resetPassword } = this.props;
		const { password, confirmPassword } = this.state;
		const emailEmptyMock = '';

		e.preventDefault();

		this.setState({
			touched: {
				password: true,
				confirmPassword: true
			}
		});

		const isValid = isValidPassword(password) && isValidPassword(confirmPassword) && confirmPassword === password;

		if (isValid) {
			resetPassword(emailEmptyMock, password, token).then(this.onResponse);
		}
	};

	componentDidMount() {
		this.setState({ isMounted: true }, () => this.props.formMounted(true));
	}

	componentWillUnmount() {
		this.setState({ isMounted: false }, () => this.props.formMounted(false));
	}

	render() {
		const { error, password, confirmPassword, isMounted, touched } = this.state;

		const validatePasswordEntry = validatePassword(password, touched.password);
		const validateConfirmPasswordEntry = validateConfirmPassword(password, confirmPassword, touched.confirmPassword);
		const disabled =
			validatePasswordEntry.displayState === formDisplayState.ERROR ||
			validateConfirmPasswordEntry.displayState === formDisplayState.ERROR ||
			(!touched.confirmPassword && !touched.password);

		if (!isMounted) {
			// tslint:disable-next-line: no-null-keyword
			return null;
		}
		return (
			<div className={bem.b()}>
				<form onSubmit={this.onSubmit}>
					<div className={bem.e('top-link')}>
						<Link to={`@${SignIn}`} className={'link'}>
							<IntlFormatter>{'@{form_sendEmail_step1_back|Back to Sign In?}'}</IntlFormatter>
						</Link>
					</div>
					<IntlFormatter elementType="h2" className={bem.e('title')}>
						{'@{form_newPassword_step1_title|Reset Your Password}'}
					</IntlFormatter>
					<PasswordInput
						label={'@{form_newPassword_step1_password_label|New Password}'}
						id="password"
						name="password"
						displayState={validatePasswordEntry.displayState}
						onChange={this.onChange}
						className={bem.e('input')}
						message={validatePasswordEntry.message}
						mePass
						required={true}
						onBlur={this.onBlur}
						hint={{
							enable: !isValidPassword(password),
							enableIcon: isValidPassword(password),
							message: '@{form_register_first_step_password_short}'
						}}
						advisoryText={true}
					/>
					<PasswordInput
						label={'@{form_newPassword_confirmPassword|Confirm Password}'}
						id="confirmPassword"
						name="confirmPassword"
						displayState={validateConfirmPasswordEntry.displayState}
						onChange={this.onChange}
						className={bem.e('input')}
						message={validateConfirmPasswordEntry.message}
						mePass
						required={true}
						onBlur={this.onBlur}
					/>
					{this.renderError(error)}
					<CtaButton ordinal="primary" disabled={disabled} type="submit" className={bem.e('submit')} large mePass>
						<IntlFormatter>{'@{form_newPassword_step1_saveButton_label|Submit}'}</IntlFormatter>
					</CtaButton>
				</form>
			</div>
		);
	}

	private renderError(errorMsg) {
		const { error } = this.state;
		return (
			error && (
				<IntlFormatter tagName="p" className={bem.e('error')}>
					{`@{${errorMsg}|Password reset error}`}
				</IntlFormatter>
			)
		);
	}
}

function mapStateToProps({ app }: state.Root) {
	return { signInPath: getSignInPath(app.config) };
}

function mapDispatchToProps(dispatch) {
	return {
		resetPassword: (email: string, password: string, token: string) => dispatch(resetPassword(email, password, token)),
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		formMounted: isMounted => dispatch(ssoFormMounted(isMounted))
	};
}

export default connect<NewPasswordFormStateProps, NewPasswordFormDispatchProps, NewPasswordFormOwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(NewPasswordForm);
